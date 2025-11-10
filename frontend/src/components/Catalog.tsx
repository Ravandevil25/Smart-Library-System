import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { bookApi } from '../api/books';
import type { Book } from '../types';
import BookCard from './BookCard';
import BookDetailsModal from './BookDetailsModal';

const Catalog: React.FC = () => {
  const location = useLocation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Book | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') || undefined;
        const data = await bookApi.getAll(q);
        if (mounted) setBooks(data || []);
      } catch (err) {
        console.error('Failed to load books', err);
        setError('Failed to load catalog');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [location.search]);

  const openDetails = (b: Book) => {
    setActive(b);
    setOpen(true);
  };

  if (loading) return <div className="text-center py-6">Loading catalog...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;

  return (
    <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Catalog</h2>
        {books.length === 0 ? (
          <div className="text-gray-600 text-sm sm:text-base">No books available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {books.map((b) => (
              <BookCard key={b._id || b.barcode || b.title} book={b} onClick={openDetails} />
            ))}
          </div>
        )}
      </div>

      <BookDetailsModal
        book={active}
        open={open}
        onClose={() => setOpen(false)}
        onRate={(id, r) => {
          // optimistic update: nothing else to do for now
          console.log('rated', id, r);
        }}
      />
    </section>
  );
};

export default Catalog;
