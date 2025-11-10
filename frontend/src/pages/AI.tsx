import React, { useState } from 'react';
import axios from 'axios';

const AI: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/query', { query: userMsg });
      const { answer, books } = res.data;
      let assistantText = answer || 'Sorry, I could not answer that.';
      if (books && books.length) {
        const list = books.map((b: any) => `• ${b.title} — ${b.authors.join(', ')} (${b.copiesAvailable} available)`).join('\n');
        assistantText += `\n\nBooks I found:\n${list}`;
      }
      setMessages((m) => [...m, { role: 'assistant', text: assistantText }]);
    } catch (err: any) {
      console.error(err);
      setMessages((m) => [...m, { role: 'assistant', text: 'There was an error contacting the AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Library AI Assistant</h1>

      <div className="border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 bg-white shadow-sm" style={{ minHeight: '250px', maxHeight: '60vh', overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <div className="text-gray-500 text-sm sm:text-base">Ask me about books, topics, or library info — I'll search the catalog and answer.</div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block p-2 sm:p-3 rounded max-w-[85%] sm:max-w-[75%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <pre className="whitespace-pre-wrap text-xs sm:text-sm break-words">{m.text}</pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' ? send() : undefined)}
          className="flex-1 rounded-full border px-3 sm:px-4 py-2 focus:outline-none text-sm sm:text-base"
          placeholder="Ask about a topic or book..."
        />
        <button onClick={send} disabled={loading} className="px-3 sm:px-4 py-2 rounded-full bg-blue-600 text-white font-semibold text-sm sm:text-base whitespace-nowrap">
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default AI;
