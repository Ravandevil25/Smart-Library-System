import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dashboardApi } from '../api/dashboard';
import type { UserHistory } from '../types';

const History: React.FC = () => {
  const [history, setHistory] = useState<UserHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setError(null);
      const data = await dashboardApi.getUserHistory();
      setHistory(data);
    } catch (error: any) {
      console.error('Failed to load history:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to load history. Please try again.';
      setError(errorMessage);
      // Initialize with empty arrays if API fails to prevent rendering issues
      setHistory({ sessions: [], borrowHistory: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-700 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
        >
          My History
        </motion.h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            <p className="text-sm sm:text-base">{error}</p>
          </motion.div>
        )}

        {/* Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Library Sessions</h2>
          {!history || !history.sessions || history.sessions.length === 0 ? (
            <p className="text-gray-400 text-sm sm:text-base">No sessions yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {history.sessions.map((session) => (
                <div key={session.id} className="border border-gray-200 p-3 sm:p-4 bg-white rounded text-sm sm:text-base">
                  <p className="font-bold break-words">
                    {new Date(session.entryAt).toLocaleString()}
                  </p>
                  {session.exitAt && (
                    <>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Exit: {new Date(session.exitAt).toLocaleString()}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Duration: {session.durationMinutes || 0} minutes
                      </p>
                    </>
                  )}
                  {!session.exitAt && (
                    <p className="text-xs sm:text-sm text-green-500 mt-1">Currently Active</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Borrow History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Borrow History</h2>
          {!history || !history.borrowHistory || history.borrowHistory.length === 0 ? (
            <p className="text-gray-400 text-sm sm:text-base">No borrows yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {history.borrowHistory.map((record) => (
                <div key={record.id} className="border border-gray-200 p-3 sm:p-4 bg-white rounded">
                  <p className="font-bold text-sm sm:text-base break-words">{record.book.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                    {record.book.authors?.join(', ') || 'Unknown authors'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-all">
                    Barcode: {record.book.barcode}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Borrowed: {new Date(record.borrowedAt).toLocaleString()}
                  </p>
                  {record.returnedAt && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Returned: {new Date(record.returnedAt).toLocaleDateString()}
                    </p>
                  )}
                  {record.active && (
                    <p className="text-xs sm:text-sm text-green-500 mt-1">Currently Borrowed</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default History;

