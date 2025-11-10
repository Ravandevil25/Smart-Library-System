import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth';
import { bookApi } from '../api/books';
import type { Book } from '../types';
import BookCard from '../components/BookCard';

const WishlistPage: React.FC = () => {
  const { updateUser } = useAuth();
  const [wishlist, setWishlist] = useState<Book[]>([]);
  const [reserves, setReserves] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get wishlist and reserves from server first, fallback to localStorage
        let wl: string[] = [];
        let rs: string[] = [];
        
        try {
          const me = await authApi.getMe();
          wl = me.wishlist || [];
          rs = me.reserves || [];
          updateUser(me);
        } catch (err) {
          console.warn('Failed to fetch user data from server, trying localStorage', err);
          // Fallback to localStorage if server fails
          try {
            const wlRaw = localStorage.getItem('bookWishlist');
            const rsRaw = localStorage.getItem('bookReserves');
            wl = wlRaw ? (JSON.parse(wlRaw) as string[]) : [];
            rs = rsRaw ? (JSON.parse(rsRaw) as string[]) : [];
          } catch (localErr) {
            console.error('Failed to parse localStorage', localErr);
          }
        }

        // Also check localStorage and merge (in case there are items not yet synced)
        try {
          const wlRaw = localStorage.getItem('bookWishlist');
          const rsRaw = localStorage.getItem('bookReserves');
          const localWl = wlRaw ? (JSON.parse(wlRaw) as string[]) : [];
          const localRs = rsRaw ? (JSON.parse(rsRaw) as string[]) : [];
          
          // Merge server and local data (avoid duplicates)
          wl = Array.from(new Set([...wl, ...localWl]));
          rs = Array.from(new Set([...rs, ...localRs]));
        } catch (localErr) {
          console.warn('Failed to merge localStorage data', localErr);
        }

        const fetchBooks = async (arr: string[]) => {
          const results: Book[] = [];
          const errors: string[] = [];
          
          for (const identifier of arr) {
            try {
              // Try to fetch by barcode/ID (backend now handles both)
              const b = await bookApi.getByBarcode(identifier);
              results.push(b);
            } catch (err) {
              console.warn('Failed to fetch book', identifier, err);
              errors.push(identifier);
              // If it's an ID that failed, it might be an invalid reference
              // We'll just skip it and continue
            }
          }
          
          if (errors.length > 0 && mounted) {
            console.warn('Some books could not be fetched (they may have been removed):', errors);
          }
          
          return results;
        };

        const [wlBooks, rBooks] = await Promise.all([fetchBooks(wl), fetchBooks(rs)]);
        if (!mounted) return;
        setWishlist(wlBooks);
        setReserves(rBooks);
        
        if (wlBooks.length === 0 && wl.length > 0) {
          setError('Some wishlist items could not be loaded. The books may have been removed.');
        }
        if (rBooks.length === 0 && rs.length > 0) {
          setError('Some reservation items could not be loaded. The books may have been removed.');
        }
      } catch (err) {
        console.error('Failed to load wishlist/reserves', err);
        setError('Failed to load wishlist and reservations. Please try refreshing the page.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [updateUser]);

  const removeWishlist = async (barcode: string) => {
    try {
      await bookApi.removeFromWishlist(barcode);
      setWishlist((s) => s.filter(b => b.barcode !== barcode));
      // Also update localStorage
      const raw = localStorage.getItem('bookWishlist');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      localStorage.setItem('bookWishlist', JSON.stringify(arr.filter(a => a !== barcode)));
      // Notify other components
      window.dispatchEvent(new CustomEvent('booklists:changed', { detail: { type: 'wishlist', barcode } }));
    } catch (err) {
      console.warn('Failed to remove from server wishlist, using local only', err);
      // fallback local
      const raw = localStorage.getItem('bookWishlist');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      localStorage.setItem('bookWishlist', JSON.stringify(arr.filter(a => a !== barcode)));
      setWishlist((s) => s.filter(b => b.barcode !== barcode));
      window.dispatchEvent(new CustomEvent('booklists:changed', { detail: { type: 'wishlist', barcode } }));
    }
  };

  const removeReserve = async (barcode: string) => {
    try {
      await bookApi.removeFromReserve(barcode);
      setReserves((s) => s.filter(b => b.barcode !== barcode));
      // Also update localStorage
      const raw = localStorage.getItem('bookReserves');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      localStorage.setItem('bookReserves', JSON.stringify(arr.filter(a => a !== barcode)));
      // Notify other components
      window.dispatchEvent(new CustomEvent('booklists:changed', { detail: { type: 'reserve', barcode } }));
    } catch (err) {
      console.warn('Failed to remove from server reserves, using local only', err);
      const raw = localStorage.getItem('bookReserves');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      localStorage.setItem('bookReserves', JSON.stringify(arr.filter(a => a !== barcode)));
      setReserves((s) => s.filter(b => b.barcode !== barcode));
      window.dispatchEvent(new CustomEvent('booklists:changed', { detail: { type: 'reserve', barcode } }));
    }
  };

  const refreshData = () => {
    setLoading(true);
    setError(null);
    // Trigger reload by updating dependency
    const load = async () => {
      try {
        const me = await authApi.getMe();
        updateUser(me);
        
        const wl = me.wishlist || [];
        const rs = me.reserves || [];
        
        // Also check localStorage
        try {
          const wlRaw = localStorage.getItem('bookWishlist');
          const rsRaw = localStorage.getItem('bookReserves');
          const localWl = wlRaw ? (JSON.parse(wlRaw) as string[]) : [];
          const localRs = rsRaw ? (JSON.parse(rsRaw) as string[]) : [];
          const allWl = Array.from(new Set([...wl, ...localWl]));
          const allRs = Array.from(new Set([...rs, ...localRs]));
          
          const fetchBooks = async (arr: string[]) => {
            const results: Book[] = [];
            for (const identifier of arr) {
              try {
                // Try to fetch by barcode/ID (backend now handles both)
                const b = await bookApi.getByBarcode(identifier);
                results.push(b);
              } catch (err) {
                console.warn('Failed to fetch book', identifier, err);
                // Skip invalid references
              }
            }
            return results;
          };
          
          const [wlBooks, rBooks] = await Promise.all([fetchBooks(allWl), fetchBooks(allRs)]);
          setWishlist(wlBooks);
          setReserves(rBooks);
        } catch (err) {
          console.error('Failed to refresh', err);
          setError('Failed to refresh data. Please try again.');
        }
      } catch (err) {
        console.error('Failed to refresh user data', err);
        setError('Failed to refresh data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  };

  if (loading) return <div className="p-8 text-center text-sm sm:text-base">Loading your lists...</div>;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">My Wishlist</h2>
          <button
            onClick={refreshData}
            className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
            title="Refresh wishlist and reservations"
          >
            🔄 Refresh
          </button>
        </div>
        {wishlist.length === 0 ? (
          <div className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">No items in wishlist.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {wishlist.map(b => (
              <div key={b.barcode}>
                <BookCard book={b} />
                <div className="mt-2 flex gap-2">
                  <button onClick={() => removeWishlist(b.barcode)} className="w-full px-3 py-1 border rounded text-xs sm:text-sm hover:bg-gray-50 transition-colors">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">My Reservations</h2>
        {reserves.length === 0 ? (
          <div className="text-gray-600 text-sm sm:text-base">No reservations.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {reserves.map(b => (
              <div key={b.barcode}>
                <BookCard book={b} />
                <div className="mt-2 flex gap-2">
                  <button onClick={() => removeReserve(b.barcode)} className="w-full px-3 py-1 border rounded text-xs sm:text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

