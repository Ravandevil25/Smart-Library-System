import React from 'react';
import type { Book } from '../types';

interface Props {
  book: Book;
  onClick?: (b: Book) => void;
}

const placeholder = 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=600&q=60';

const getStoredRating = (id: string) => {
  try {
    const raw = localStorage.getItem('bookRatings');
    if (!raw) return 0;
    const map = JSON.parse(raw) as Record<string, number>;
    return map[id] || 0;
  } catch {
    return 0;
  }
};

const Star: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.538 1.118L10 13.348l-3.385 2.624c-.783.57-1.838-.197-1.538-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.615 9.401c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.974z" />
  </svg>
);

const BookCard: React.FC<Props> = ({ book, onClick }) => {
  const id = book._id || book.barcode || book.title;
  const [rating, setRating] = React.useState(() => getStoredRating(id));
  const [wishlisted, setWishlisted] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('bookWishlist');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return arr.includes(id);
    } catch { return false; }
  });
  const [reserved, setReserved] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('bookReserves');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return arr.includes(id);
    } catch { return false; }
  });

  React.useEffect(() => {
    const onChange = () => {
      setRating(getStoredRating(id));
      try {
        const raw = localStorage.getItem('bookWishlist');
        const arr = raw ? (JSON.parse(raw) as string[]) : [];
        setWishlisted(arr.includes(id));
      } catch { setWishlisted(false); }
      try {
        const raw = localStorage.getItem('bookReserves');
        const arr = raw ? (JSON.parse(raw) as string[]) : [];
        setReserved(arr.includes(id));
      } catch { setReserved(false); }
    };
    window.addEventListener('booklists:changed', onChange);
    return () => window.removeEventListener('booklists:changed', onChange);
  }, [id]);

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-soft border border-gray-100 cursor-pointer hover:shadow-md transition-shadow relative"
      onClick={() => onClick?.(book)}
    >
      <div className="h-44 bg-gray-100 w-full">
        <img
          src={(book as any).coverUrl || placeholder}
          alt={book.title}
          className="object-cover w-full h-full"
          onError={(e) => {
            if ((e.target as HTMLImageElement).src !== placeholder) {
              (e.target as HTMLImageElement).src = placeholder;
            }
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold leading-snug text-gray-800">{book.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{(book.authors && book.authors[0]) || 'Unknown author'}</p>
        {book.description && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{book.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} filled={i < Math.round(rating)} />
            ))}
            <span className="text-xs text-gray-500 ml-2">{rating ? `${rating}/5` : '—'}</span>
          </div>

          <div className="text-xs text-gray-500">{(book.copiesAvailable ?? 0)}/{book.copiesTotal ?? '—'}</div>
        </div>
      </div>

      {/* badges */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {wishlisted && (
          <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded">Wishlist</span>
        )}
        {reserved && (
          <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">Reserved</span>
        )}
      </div>
    </div>
  );
};

export default BookCard;
