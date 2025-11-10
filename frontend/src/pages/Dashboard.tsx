import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import QRScanner from '../components/QRScanner';
import Catalog from '../components/Catalog';
import { sessionApi } from '../api/session';
import { dashboardApi } from '../api/dashboard';
import { authApi } from '../api/auth';
import type { Occupancy, UserSummary } from '../types';
import type { AxiosError } from 'axios';

const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [occupancy, setOccupancy] = useState<Occupancy | null>(null);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [occupancyData, summaryData] = await Promise.all([
        dashboardApi.getOccupancy(),
        user?.role === 'student' ? dashboardApi.getUserSummary() : null,
      ]);

      if (occupancyData) setOccupancy(occupancyData);
      if (summaryData) setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadData();
    
    if (socket) {
      socket.on('occupancyUpdate', (data: Occupancy) => {
        setOccupancy(data);
      });
    }

    return () => {
      if (socket) {
        socket.off('occupancyUpdate');
      }
    };
  }, [socket, loadData]);

  const handleQRScan = async (qrCodeText: string) => {
    console.log('handleQRScan called with:', qrCodeText);
    try {
      // Validate QR code
      const normalizedQR = qrCodeText.trim().toUpperCase();
      console.log('Normalized QR code:', normalizedQR);
      
      if (normalizedQR !== 'ENTRY_QR_CODE' && normalizedQR !== 'EXIT_QR_CODE') {
        console.log('Invalid QR code detected:', normalizedQR);
        setMessage(`Invalid QR code: "${normalizedQR}". Please scan a valid entry or exit QR code.`);
        setTimeout(() => setMessage(''), 5000);
        return;
      }

      // Determine action based on QR code and current state
      const before = await authApi.getMe();
      
      // If scanning ENTRY QR code
      if (normalizedQR === 'ENTRY_QR_CODE') {
        if (before.activeSessionId) {
          setMessage('You are already in the library. Please scan the exit QR code to leave.');
          setTimeout(() => setMessage(''), 3000);
          return;
        }
        await sessionApi.entry();
        setMessage('Entry recorded successfully');
      } 
      // If scanning EXIT QR code
      else if (normalizedQR === 'EXIT_QR_CODE') {
        if (!before.activeSessionId) {
          setMessage('You are not currently in the library. Please scan the entry QR code first.');
          setTimeout(() => setMessage(''), 3000);
          return;
        }
        await sessionApi.exit();
        setMessage('Exit recorded successfully');
      }

      // Refresh user from server to get updated activeSessionId
      const freshUser = await authApi.getMe();
      if (user) updateUser(freshUser);
      setTimeout(() => setMessage(''), 3000);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error 
        ? (error as AxiosError<{ message: string }>).response?.data?.message || 'Failed to record entry/exit'
        : 'Failed to record entry/exit';
      setMessage(message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleManualEntry = async () => {
    try {
      // fetch authoritative user state first to avoid client/server mismatch
      const before = await authApi.getMe();
      if (before.activeSessionId) {
        await sessionApi.exit();
        setMessage('Exit recorded successfully');
      } else {
        await sessionApi.entry();
        setMessage('Entry recorded successfully');
      }
      // refresh user from server to get updated activeSessionId
      const freshUser = await authApi.getMe();
      if (user) updateUser(freshUser);
      setTimeout(() => setMessage(''), 3000);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error 
        ? (error as AxiosError<{ message: string }>).response?.data?.message || 'Failed to record entry/exit'
        : 'Failed to record entry/exit';
      setMessage(message);
      setTimeout(() => setMessage(''), 3000);
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
      {message && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white text-black p-3 sm:p-4 border border-gray-200 z-50 rounded-lg shadow-lg max-w-[90vw] text-sm sm:text-base"
        >
          {message}
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Occupancy Card */}
        {user?.role !== 'student' && occupancy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Current Occupancy</h2>
            <div className="text-4xl sm:text-6xl font-bold mb-3 sm:mb-4">{occupancy.count}</div>
            <p className="text-base sm:text-lg">People in library</p>
          </motion.div>
        )}

        {/* Entry/Exit Controls for Students */}
        {user?.role === 'student' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Library Entry/Exit</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQRScanner(true)}
                className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Scan QR Code
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleManualEntry}
                className="w-full sm:w-auto px-6 py-3 border border-primary text-primary-700 hover:bg-primary-50 transition-colors text-sm sm:text-base"
              >
                Manual Entry/Exit
              </motion.button>
            </div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Status: {user?.activeSessionId ? 'In Library' : 'Not in Library'}
            </p>
          </motion.div>
        )}

        {/* User Summary for Students */}
        {user?.role === 'student' && summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
            >
              <h3 className="text-lg sm:text-xl font-bold mb-2">Total Hours</h3>
              <div className="text-3xl sm:text-4xl font-bold">
                {Math.floor(summary.user.totalHours)}h {Math.round((summary.user.totalHours % 1) * 60)}m
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
            >
              <h3 className="text-lg sm:text-xl font-bold mb-2">Books Borrowed</h3>
              <div className="text-3xl sm:text-4xl font-bold">{summary.totalBorrows}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
            >
              <h3 className="text-lg sm:text-xl font-bold mb-2">Active Borrows</h3>
              <div className="text-3xl sm:text-4xl font-bold">{summary.activeBorrows.length}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
            >
              <h3 className="text-lg sm:text-xl font-bold mb-2">Streak</h3>
              <div className="text-2xl sm:text-3xl font-bold">{summary.user.currentStreak || 0} days</div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">Streak hours: {Math.round((summary.user.streakHours || 0) * 60) / 60} hrs</p>
              <p className="text-xs text-gray-500 mt-1">Longest: {summary.user.longestStreak || 0} days</p>
            </motion.div>
          </div>
        )}

        {/* Active Sessions for Admins */}
        {user?.role === 'admin' && occupancy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Active Sessions</h2>
            <div className="space-y-2">
              {occupancy.activeSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 p-3 bg-white rounded text-sm sm:text-base">
                  <p className="font-bold">{session.user.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{session.user.rollNo}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Entry: {new Date(session.entryAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

  {/* Catalog of books shown below dashboard cards */}
  <Catalog />

      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

