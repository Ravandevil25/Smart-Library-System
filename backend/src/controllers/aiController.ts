import { Request, Response } from 'express';
import { Book } from '../models/Book';

// AI controller: searches the book collection for related titles/authors
// and always returns a conversational assistant reply plus any matched books.
// If OPENAI_API_KEY is provided the controller will try to use OpenAI, but it
// will gracefully fall back to a local reply generator when the key is absent
// or the API call fails.
const escapeForRegex = (s: string) => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&');

const generateLocalReply = (q: string, found: any[]) => {
  const safeQ = q.trim();
  if (found.length) {
    const top = found.slice(0, 3).map((b: any, i: number) => `${i + 1}. ${b.title}${b.authors ? ` — ${Array.isArray(b.authors) ? b.authors.join(', ') : b.authors}` : ''}`).join('; ');
    return `I found ${found.length} book(s) related to "${safeQ}". The top matches: ${top}. If you want, I can give short summaries, check availability, or find similar titles.`;
  }

  // Short, friendly fallback that gives a concise definition/introduction.
  // IMPORTANT: do not mention the absence of catalog matches here — the
  // caller will only include `books` in the response when matches exist.
  return `Here's a short introduction to "${safeQ}":\n\n` +
    `> ${safeQ} typically refers to an area of study or topic. If you'd like, tell me how specific you want the results (intro, textbooks, or research), and I can suggest search keywords or try broader related topics.`;
};

export const queryAI = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ message: 'query is required' });
    }

    const q = query.trim();

    // Search title and authors for the query (case-insensitive)
    const regex = new RegExp(escapeForRegex(q), 'i');
    const books = await Book.find({
      $or: [
        { title: { $regex: regex } },
        { authors: { $elemMatch: { $regex: regex } } }
      ]
    }).limit(6).lean();

    // Prefer Gemini / Google Generative Language API if a key is configured.
    // Fall back to local reply if the call fails or key is not provided.
    const GEMINI_KEY = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
    if (GEMINI_KEY) {
      try {
        // Only include the catalog text if we have book matches. If there are
        // no matches, omit the catalog section so the model focuses on the
        // definitional reply and doesn't echo a "no matches" message.
        const booksText = books.length
          ? books.map((b: any, i: number) => `${i + 1}. ${b.title} — ${Array.isArray(b.authors) ? b.authors.join(', ') : b.authors}`).join('\n')
          : '';

        const systemMessage = `You are a helpful library assistant. Use the catalog below (if any) to recommend titles and to answer the user's question concisely.`;
        // Only include the "Catalog matches" section when we have text.
        const userMessage = booksText
          ? `User query: "${q}"\n\nCatalog matches:\n${booksText}\n\nRespond with a helpful, conversational answer. If there are catalog matches, mention them briefly and suggest the most relevant ones. Keep the answer concise and actionable.`
          : `User query: "${q}"\n\nRespond with a helpful, conversational answer focused on a concise definition/overview. Keep the answer concise and actionable.`;

        // Use Google Generative Language API (a.k.a. Gemini) via REST. We use the
        // chat-style `models/chat-bison-001:generate` endpoint if available. The
        // request shape is compatible with the Generative Language API v1beta2.
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generate?key=${encodeURIComponent(GEMINI_KEY)}`;

        const resp = await (globalThis as any).fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { author: 'system', content: { text: systemMessage } },
              { author: 'user', content: { text: userMessage } }
            ],
            temperature: 0.25,
            maxOutputTokens: 512
          })
        });

        if (resp.ok) {
          const data: any = await resp.json();
          // Gemeni/Generative Language API responses can vary. Commonly the text
          // appears under candidates[0].content[0].text or candidates[0].content
          // with a nested `text` field. Be defensive when extracting.
          let aiText: string | null = null;
          if (data?.candidates && Array.isArray(data.candidates) && data.candidates.length) {
            const first = data.candidates[0];
            // content can be an array with {type: 'output_text', text: '...'}
            if (first.content && Array.isArray(first.content)) {
              for (const c of first.content) {
                if (typeof c === 'string') {
                  aiText = (aiText ? aiText + '\n' : '') + c;
                } else if (c?.text) {
                  aiText = (aiText ? aiText + '\n' : '') + c.text;
                } else if (c?.type === 'output_text' && c?.text) {
                  aiText = (aiText ? aiText + '\n' : '') + c.text;
                }
              }
            } else if (typeof first.output === 'string') {
              aiText = first.output;
            }
          }

          // Some variants return `candidates[0].content[0].text` specifically
          if (!aiText && data?.candidates?.[0]?.content?.[0]?.text) {
            aiText = data.candidates[0].content[0].text;
          }

          if (aiText && typeof aiText === 'string' && aiText.trim().length) {
            // Only include the books array in the response when there are
            // actual matches. This keeps replies clean when no book exists.
            return res.json({ answer: aiText.trim(), ...(books.length ? { books } : {}) });
          }
        } else {
          const text = await resp.text().catch(() => 'no body');
          console.warn('Gemini API returned non-OK status', resp.status, text);
        }
      } catch (gemErr: any) {
        console.error('Gemini/Generative Language call failed, falling back to local reply', gemErr);
      }
    }

    // Always return a conversational local reply when OpenAI is not used or fails
  const answer = generateLocalReply(q, books);
  // Only include books when matches exist.
  return res.json({ answer, ...(books.length ? { books } : {}) });
  } catch (err: any) {
    console.error('AI query error', err);
    return res.status(500).json({ message: 'AI service error' });
  }
};
