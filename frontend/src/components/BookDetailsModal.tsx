import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Book } from '../types';
import { borrowApi } from '../api/borrow';
import { bookApi } from '../api/books';
import { authApi } from '../api/auth';

interface Props {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onRate?: (id: string, rating: number) => void;
}

const placeholder = 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=60';

const BookDetailsModal: React.FC<Props> = ({ book, open, onClose, onRate }) => {
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [reserved, setReserved] = useState(false);
  const { user, updateUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!book) return;
    try {
      const raw = localStorage.getItem('bookRatings');
      const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      setRating(map[book._id] || map[book.barcode] || 0);
    } catch {
      setRating(0);
    }
    // initialize local wishlist/reserve state - check barcode first, then ID
    try {
  const wlRaw = localStorage.getItem('bookWishlist');
  const wl = wlRaw ? (JSON.parse(wlRaw) as string[]) : [];
  setWishlisted(wl.includes(book.barcode) || wl.includes(book._id) || wl.includes(book.title));
    } catch {
      setWishlisted(false);
    }
    try {
      const rRaw = localStorage.getItem('bookReserves');
      const rr = rRaw ? (JSON.parse(rRaw) as string[]) : [];
      setReserved(rr.includes(book.barcode) || rr.includes(book._id) || rr.includes(book.title));
    } catch {
      setReserved(false);
    }
  }, [book]);

  if (!open || !book) return null;

  const setStoredRating = (id: string, value: number) => {
    try {
      const raw = localStorage.getItem('bookRatings');
      const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      map[id] = value;
      localStorage.setItem('bookRatings', JSON.stringify(map));
    } catch {}
  };

  const setStoredReview = (id: string, payload: { rating: number; review: string; at: string }) => {
    try {
      const raw = localStorage.getItem('bookReviews');
      const map = raw ? (JSON.parse(raw) as Record<string, any>) : {};
      map[id] = payload;
      localStorage.setItem('bookReviews', JSON.stringify(map));
    } catch {}
  };

  const toggleWishlist = async (identifier: string) => {
    // Always use barcode if available, fallback to identifier
    const barcode = book?.barcode || identifier;
    
    // Try server-side first; if fails (unauthenticated), fallback to localStorage
    try {
      // check if already in local storage wishlist for quick toggle state
      const raw = localStorage.getItem('bookWishlist');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      const isPresent = arr.includes(barcode) || arr.includes(identifier);

      if (!isPresent) {
        await bookApi.addToWishlist(barcode);
        setMessage('Added to wishlist');
        setWishlisted(true);
      } else {
        await bookApi.removeFromWishlist(barcode);
        setMessage('Removed from wishlist');
        setWishlisted(false);
      }

      // Update user context with fresh data from server
      try {
        const me = await authApi.getMe();
        updateUser(me);
      } catch (updateErr) {
        console.warn('Failed to update user after wishlist change', updateErr);
      }

      // sync local copy - use barcode (as backup)
      const newArr = isPresent 
        ? arr.filter(a => a !== barcode && a !== identifier) 
        : [...arr.filter(a => a !== barcode && a !== identifier), barcode];
      localStorage.setItem('bookWishlist', JSON.stringify(newArr));
      
      // Notify other components
      window.dispatchEvent(new CustomEvent('booklists:changed', { detail: { type: 'wishlist', barcode } }));
    } catch (err: any) {
      // fallback to local only
      try {
        const raw = localStorage.getItem('bookWishlist');
        const arr = raw ? (JSON.parse(raw) as string[]) : [];
        const idx = arr.findIndex(a => a === barcode || a === identifier);
        if (idx === -1) arr.push(barcode); else arr.splice(idx, 1);
        localStorage.setItem('bookWishlist', JSON.stringify(arr));
        setMessage(idx === -1 ? 'Added to wishlist' : 'Removed from wishlist');
        // notify other components
        window.dispatchEvent(new CustomEvent('booklists:changed', { detail: { type: 'wishlist', barcode } }));
      } catch {}
    } finally {
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const toggleReserve = async (identifier: string) => {
    // Always use barcode if available, fallback to identifier
    const barcode = book?.barcode || identifier;
    
    try {
      const raw = localStorage.getItem('bookReserves');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      const isPresent = arr.includes(barcode) || arr.includes(identifier);

      if (!isPresent) {
        await bookApi.addToReserve(barcode);
        setMessage('Book reserved');
      } else {
        await bookApi.removeFromReserve(barcode);
        setMessage('Reservation removed');
      }

      const newArr = isPresent 
        ? arr.filter(a => a !== barcode && a !== identifier) 
        : [...arr.filter(a => a !== barcode && a !== identifier), barcode];
      localStorage.setItem('bookReserves', JSON.stringify(newArr));
      setReserved(!isPresent);
      
      // Update user context with fresh data from server
      try {
        const me = await authApi.getMe();
        updateUser(me);
      } catch (updateErr) {
        console.warn('Failed to update user after reserve change', updateErr);
      }
    } catch (err) {
      // fallback local
      try {
        const raw = localStorage.getItem('bookReserves');
        const arr = raw ? (JSON.parse(raw) as string[]) : [];
        const idx = arr.findIndex(a => a === barcode || a === identifier);
        if (idx === -1) arr.push(barcode); else arr.splice(idx, 1);
        localStorage.setItem('bookReserves', JSON.stringify(arr));
        setMessage(idx === -1 ? 'Book reserved' : 'Reservation removed');
        window.dispatchEvent(new CustomEvent('booklists:changed', { detail: { type: 'reserve', barcode } }));
      } catch {}
    } finally {
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: book.title,
      text: `${book.title} by ${(book.authors && book.authors.join(', ')) || ''}`,
      url: window.location.href
    };
    try {
      if (navigator.share) {
        // @ts-ignore
        await navigator.share(shareData);
        setMessage('Shared');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.text} \n${shareData.url}`);
        setMessage('Book link copied to clipboard');
      } else {
        setMessage('Share not supported');
      }
    } catch (err) {
      setMessage('Failed to share');
    } finally {
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const handleEbookOpen = () => {
    const raw = (book as any).ebookUrl || (book as any).sampleUrl;
    if (raw) {
      // Handle both external URLs (http/https) and relative paths
      let url: string;
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        // External URL - use as is
        url = raw;
      } else if (raw.startsWith('/')) {
        // Relative path - prepend origin
        url = `${window.location.origin}${raw}`;
      } else {
        // Assume it's a relative path without leading slash
        url = `${window.location.origin}/${raw}`;
      }
      // Open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setMessage('No e-book or sample available');
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !book) return;
    setUploading(true);
    try {
      const res = await bookApi.uploadEbook(book.barcode, selectedFile);
      // update local book object so UI reflects new ebook
      (book as any).ebookUrl = res.ebookUrl || res.ebookUrl;
      setMessage('E-book uploaded');
      // notify other components if needed
      window.dispatchEvent(new CustomEvent('book:ebook-updated', { detail: { barcode: book.barcode } }));
    } catch (err: any) {
      console.error('upload failed', err);
      setMessage(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleBorrow = async () => {
    if (!book) return;
    try {
      const res = await borrowApi.borrow([book.barcode]);
      setMessage('✓ Books borrowed successfully!');
      
      // Download receipt PDF only if pdfPath is available
      if (res.receipt.pdfPath) {
        const receiptId = res.receipt.id;
        // Extract base URL (remove /api if present)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace('/api', '');
        const pdfUrl = `${baseUrl}${res.receipt.pdfPath}.pdf`;
        
        // Use fetch to download the PDF as blob for better cross-browser support
        try {
          const pdfResponse = await fetch(pdfUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (!pdfResponse.ok) {
            throw new Error('Failed to download receipt');
          }

          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Library_Receipt_${receiptId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setMessage('✓ Books borrowed successfully! Receipt downloaded.');
        } catch (downloadError) {
          console.error('Download error:', downloadError);
          // Fallback to opening in new tab if download fails
          window.open(pdfUrl, '_blank');
          setMessage('✓ Books borrowed successfully! Receipt opened in new tab.');
        }
      } else {
        setMessage('✓ Books borrowed successfully! (Receipt PDF could not be generated)');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to borrow';
      setMessage(msg);
    } finally {
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const submitReview = () => {
    if (!book) return;
    setSubmittingReview(true);
    try {
      const id = book._id || book.barcode || book.title;
      const payload = { rating, review: reviewText.trim(), at: new Date().toISOString() };
      setStoredReview(id, payload);
      setStoredRating(id, rating);
      setMessage('Review saved');
      setReviewText('');
    } catch (err) {
      setMessage('Failed to save review');
    } finally {
      setSubmittingReview(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleRate = (value: number) => {
    const id = book._id || book.barcode || book.title;
    setRating(value);
    setStoredRating(id, value);
    onRate?.(id, value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-t-lg md:rounded-lg w-full md:w-3/5 max-h-[90vh] md:max-h-[85vh] overflow-auto p-4 sm:p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3 flex justify-center md:block">
            <img
              src={(book as any).coverUrl || placeholder}
              className="w-32 h-48 md:w-full md:h-48 object-cover rounded mx-auto md:mx-0"
              alt={book.title}
              onError={(e) => {
                if ((e.target as HTMLImageElement).src !== placeholder) {
                  (e.target as HTMLImageElement).src = placeholder;
                }
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold">{book.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{(book.authors && book.authors.join(', ')) || 'Unknown author'}</p>
            {message && (
              <div className="mt-3 text-sm text-white bg-black bg-opacity-70 inline-block px-3 py-1 rounded">{message}</div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleRate(i + 1)}
                    aria-label={`Rate ${i + 1} stars`}
                    className={`w-6 h-6 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    title={`${i + 1} stars`}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.538 1.118L10 13.348l-3.385 2.624c-.783.57-1.838-.197-1.538-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.615 9.401c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="text-sm text-gray-500">{rating ? `${rating}/5` : 'Not rated'}</div>
            </div>

            <div className="mt-4 text-sm text-gray-700">
              <p><strong>Copies:</strong> {(book.copiesAvailable ?? 0)}/{book.copiesTotal ?? '—'}</p>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-gray-600">{book.description || 'No description available for this book.'}</p>
            </div>

              <div className="mt-6 flex gap-3 items-center">
              <button
                onClick={handleBorrow}
                className="px-4 py-2 bg-primary text-black rounded flex-1"
              >
                <span className="mr-2">📚 Borrow Book</span> 
              </button>

              <button
                onClick={() => toggleReserve(book.barcode || book._id || book.title)}
                className={`px-4 py-2 border rounded flex-1 text-sm sm:text-base ${reserved ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'text-gray-700 bg-white'}`}
              >
                {reserved ? '⏳ Reserved' : '⏱️ Reserve'}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => toggleWishlist(book.barcode || book._id || book.title)}
                className={
                  `px-3 sm:px-4 py-2 border rounded flex items-center justify-center gap-2 text-sm sm:text-base ${wishlisted ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700'}`
                }
              >
                {wishlisted ? '❤️ In Wishlist' : '♡ Add to Wishlist'}
              </button>

              {(book as any).ebookUrl && (
                <button
                  onClick={handleEbookOpen}
                  className="px-4 py-2 border rounded bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                  title="Read the e-book online"
                >
                  📖 Read E-book
                </button>
              )}
            </div>

            <div className="mt-4">
              <button onClick={handleShare} className="w-full px-4 py-2 border rounded bg-gray-100 text-gray-700">🔗 Share Book</button>
            </div>

            {/* Admin: upload e-book */}
            {user && (user.role === 'admin' || user.role === 'librarian') && (
              <div className="mt-4 sm:mt-6 border p-3 sm:p-4 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">E-book (Admin)</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Upload a PDF e-book for students to read online.</p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  className="w-full text-xs sm:text-sm"
                />
                <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button onClick={handleUpload} disabled={!selectedFile || uploading} className="px-3 py-2 bg-primary text-white rounded text-sm sm:text-base disabled:opacity-50">
                    {uploading ? 'Uploading...' : 'Upload E-book'}
                  </button>
                  <button onClick={() => setSelectedFile(null)} className="px-3 py-2 border rounded text-sm sm:text-base">Clear</button>
                </div>
                { (book as any).ebookUrl && (
                  <div className="mt-3 text-xs sm:text-sm space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <label className="font-medium">E-book URL</label>
                      <span className="text-xs text-gray-500">(click Open or Copy)</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                      {/* Editable for admin: allow paste and save */}
                      <input
                        value={(() => {
                          const u = (book as any).ebookUrl || '';
                          // show full origin-qualified URL in the input so admin can edit entire URL
                          return u.startsWith('http') ? u : (u ? `${window.location.origin}${u}` : '');
                        })()}
                        onChange={(e) => {
                          // write back to book object (local only) so Save can persist trimmed path or full url
                          const val = e.target.value.trim();
                          // if admin pastes origin-prefixed URL, convert to relative path when saving? keep as-is for now
                          (book as any).ebookUrl = val;
                        }}
                        className="flex-1 border px-2 py-1 rounded text-xs sm:text-sm min-w-0"
                      />
                      <div className="flex gap-2">
                        <a href={(() => {
                          const u = (book as any).ebookUrl || '';
                          if (!u) return '#';
                          return u.startsWith('http') ? u : `${window.location.origin}${u}`;
                        })()} target="_blank" rel="noreferrer" className="px-2 sm:px-3 py-1 bg-white border rounded text-xs sm:text-sm text-blue-600 whitespace-nowrap">Open</a>
                        <button
                          onClick={async () => {
                            try {
                              const u = (book as any).ebookUrl || '';
                              const full = u.startsWith('http') ? u : `${window.location.origin}${u}`;
                              await navigator.clipboard.writeText(full);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            } catch (err) {
                              console.warn('copy failed', err);
                            }
                          }}
                          className="px-2 sm:px-3 py-1 bg-gray-100 border rounded text-xs sm:text-sm whitespace-nowrap"
                        >
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={async () => {
                            if (!book) return;
                            try {
                              const u = (book as any).ebookUrl || '';
                              // send relative path if origin matches
                              const payload: any = {};
                              if (u.startsWith(window.location.origin)) {
                                payload.ebookUrl = u.replace(window.location.origin, '') || u;
                              } else {
                                payload.ebookUrl = u;
                              }
                              setUploading(true);
                              const res = await (bookApi as any).update(book.barcode, payload);
                              // update local book with canonical value returned by server
                              if (res && res.book) {
                                (book as any).ebookUrl = res.book.ebookUrl;
                              }
                              setMessage('E-book URL saved');
                            } catch (err: any) {
                              console.error('save failed', err);
                              setMessage(err?.response?.data?.message || 'Save failed');
                            } finally {
                              setUploading(false);
                              setTimeout(() => setMessage(null), 2000);
                            }
                          }}
                          disabled={uploading}
                          className="px-2 sm:px-3 py-1 bg-primary text-white rounded text-xs sm:text-sm whitespace-nowrap disabled:opacity-50"
                        >
                          {uploading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <hr className="my-4 sm:my-6" />

            <div>
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Rate & Review</h4>
              <div className="text-xs sm:text-sm text-gray-600 mb-2">Your Rating:</div>
              <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={`r-${i}`}
                    onClick={() => handleRate(i + 1)}
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    aria-label={`Rate ${i + 1} stars`}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.538 1.118L10 13.348l-3.385 2.624c-.783.57-1.838-.197-1.538-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.615 9.401c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
                    </svg>
                  </button>
                ))}
                <div className="text-xs sm:text-sm text-gray-500 ml-2">{rating ? `${rating}/5` : 'Not rated'}</div>
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
                className="w-full mt-3 p-3 border rounded text-xs sm:text-sm min-h-[100px]"
              />

              <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button onClick={submitReview} disabled={submittingReview} className="px-4 py-2 bg-primary text-white rounded text-sm sm:text-base disabled:opacity-50">Submit</button>
                <button onClick={() => { setReviewText(''); }} className="px-4 py-2 border rounded text-sm sm:text-base">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
