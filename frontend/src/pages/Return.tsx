import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { dashboardApi } from '../api/dashboard';
import { borrowApi } from '../api/borrow';
import type { AxiosError } from 'axios';

interface ActiveBorrow {
  id: string;
  book: {
    title: string;
    authors: string[];
    barcode: string;
  };
  borrowedAt: string;
  dueAt?: string;
}

const Return: React.FC = () => {
  useAuth(); // Authentication required for this page
  const [activeBorrows, setActiveBorrows] = useState<ActiveBorrow[]>([]);
  const [selectedBorrows, setSelectedBorrows] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  // scanning/upload features removed: no file input or QR scanner state

  useEffect(() => {
    loadActiveBorrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadActiveBorrows = async () => {
    try {
      const summary = await dashboardApi.getUserSummary();
      setActiveBorrows(summary.activeBorrows || []);
    } catch (error) {
      console.error('Failed to load active borrows:', error);
      setMessage('Failed to load your borrowed books');
    } finally {
      setLoading(false);
    }
  };

  // QR scanning/upload features removed — receipt verification via QR is not available on this page

  const toggleBorrowSelection = (borrowId: string) => {
    setSelectedBorrows(prev =>
      prev.includes(borrowId) ? prev.filter(id => id !== borrowId) : [...prev, borrowId]
    );
  };

  const handleReturn = async () => {
    if (selectedBorrows.length === 0) {
      setMessage('Please select at least one book to return');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await borrowApi.return(selectedBorrows);
      setMessage(`✓ Successfully returned ${selectedBorrows.length} book${selectedBorrows.length > 1 ? 's' : ''}!`);
      setSelectedBorrows([]);
      await loadActiveBorrows();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as AxiosError<{ message: string }>).response?.data?.message || 'Failed to return books'
        : 'Failed to return books';
      setMessage(`Error: ${errorMessage}`);
    }
    setTimeout(() => setMessage(''), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-700 text-xl">Loading your borrowed books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 text-gray-900">
      {message && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white text-black p-3 sm:p-4 border border-gray-200 z-50 rounded-lg shadow-lg max-w-[90vw] text-sm sm:text-base"
        >
          {message}
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Return Books</h1>

          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-400">Select books below to return.</p>
          </div>

          {activeBorrows.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">Your Borrowed Books</h2>
              <div className="space-y-2">
                {activeBorrows.map((borrow) => (
                  <motion.div
                    key={borrow.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`border p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 cursor-pointer transition-colors rounded ${
                      selectedBorrows.includes(borrow.id)
                        ? 'border-yellow-400 bg-yellow-400 bg-opacity-10'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => toggleBorrowSelection(borrow.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base sm:text-lg break-words">{borrow.book.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">by {borrow.book.authors.join(', ')}</p>
                      <p className="text-xs text-gray-600 mt-2 font-mono break-all">Barcode: {borrow.book.barcode}</p>
                      <p className="text-xs text-gray-600 mt-1">Borrowed: {new Date(borrow.borrowedAt).toLocaleDateString()}</p>
                      {borrow.dueAt && (
                        <p className={`text-xs mt-1 ${new Date(borrow.dueAt) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
                          Due: {new Date(borrow.dueAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
                      <input
                        type="checkbox"
                        checked={selectedBorrows.includes(borrow.id)}
                        onChange={() => toggleBorrowSelection(borrow.id)}
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm">{selectedBorrows.includes(borrow.id) ? 'Selected' : 'Select'}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {selectedBorrows.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReturn}
                  className="w-full py-3 bg-primary-500 text-white font-bold hover:bg-primary-600 transition-colors text-sm sm:text-base"
                >
                  Return {selectedBorrows.length} Book{selectedBorrows.length > 1 ? 's' : ''}
                </motion.button>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">You don't have any books currently borrowed</p>
          )}
        </motion.div>
      </div>

      {/* QR scanner and file upload features removed for return flow */}
    </div>
  );
};

export default Return;