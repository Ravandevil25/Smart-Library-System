"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSummary = exports.getUserHistory = exports.getActiveSessions = exports.getOccupancy = void 0;
const models_1 = require("../models");
const getOccupancy = async (req, res) => {
    try {
        // Get active sessions (users currently in library)
        const activeSessions = await models_1.Session.find({ exitAt: null })
            .populate('userId', 'name rollNo')
            .sort({ entryAt: -1 });
        const count = activeSessions.length;
        res.json({
            count,
            activeSessions: activeSessions.map(session => ({
                id: session.id,
                user: {
                    name: session.userId.name,
                    rollNo: session.userId.rollNo
                },
                entryAt: session.entryAt
            }))
        });
    }
    catch (error) {
        console.error('Get occupancy error:', error);
        res.status(500).json({ message: 'Server error while fetching occupancy' });
    }
};
exports.getOccupancy = getOccupancy;
const getActiveSessions = async (req, res) => {
    try {
        const activeSessions = await models_1.Session.find({ exitAt: null })
            .populate('userId', 'name rollNo email')
            .sort({ entryAt: -1 });
        res.json({
            sessions: activeSessions.map(session => ({
                id: session.id,
                user: {
                    name: session.userId.name,
                    rollNo: session.userId.rollNo,
                    email: session.userId.email
                },
                entryAt: session.entryAt,
                durationMinutes: Math.floor((new Date().getTime() - session.entryAt.getTime()) / (1000 * 60))
            }))
        });
    }
    catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({ message: 'Server error while fetching active sessions' });
    }
};
exports.getActiveSessions = getActiveSessions;
const getUserHistory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        // Get user's session history
        const sessions = await models_1.Session.find({ userId })
            .sort({ entryAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        // Get user's borrow history
        const borrowHistory = await models_1.BorrowRecord.find({ userId })
            .populate('bookId', 'title authors barcode')
            .sort({ borrowedAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        res.json({
            sessions: sessions.map(session => ({
                id: session.id,
                entryAt: session.entryAt,
                exitAt: session.exitAt,
                durationMinutes: session.durationMinutes
            })),
            borrowHistory: borrowHistory.map(record => ({
                id: record._id,
                book: {
                    title: record.bookId.title,
                    authors: record.bookId.authors,
                    barcode: record.bookId.barcode
                },
                borrowedAt: record.borrowedAt,
                dueAt: record.dueAt,
                returnedAt: record.returnedAt,
                active: record.active
            }))
        });
    }
    catch (error) {
        console.error('Get user history error:', error);
        res.status(500).json({ message: 'Server error while fetching user history' });
    }
};
exports.getUserHistory = getUserHistory;
const getUserSummary = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        // Get user's total sessions
        const totalSessions = await models_1.Session.countDocuments({ userId });
        // Get user's total borrows
        const totalBorrows = await models_1.BorrowRecord.countDocuments({ userId });
        // Get user's active borrows
        const activeBorrows = await models_1.BorrowRecord.find({ userId, active: true })
            .populate('bookId', 'title authors barcode')
            .sort({ borrowedAt: -1 });
        // Get overdue books
        const overdueBooks = await models_1.BorrowRecord.find({
            userId,
            active: true,
            dueAt: { $lt: new Date() }
        }).populate('bookId', 'title authors barcode');
        res.json({
            totalSessions,
            totalBorrows,
            activeBorrows: activeBorrows.map(record => ({
                id: record._id,
                book: {
                    title: record.bookId.title,
                    authors: record.bookId.authors,
                    barcode: record.bookId.barcode
                },
                borrowedAt: record.borrowedAt,
                dueAt: record.dueAt
            })),
            overdueBooks: overdueBooks.map(record => ({
                id: record._id,
                book: {
                    title: record.bookId.title,
                    authors: record.bookId.authors,
                    barcode: record.bookId.barcode
                },
                borrowedAt: record.borrowedAt,
                dueAt: record.dueAt
            })),
            user: {
                name: req.user.name,
                rollNo: req.user.rollNo,
                totalHours: req.user.totalHours,
                borrowedCount: req.user.borrowedCount
            },
            // Provide streak info for frontend
            streak: {
                currentStreak: req.user.currentStreak || 0,
                longestStreak: req.user.longestStreak || 0,
                streakHours: req.user.streakHours || 0
            }
        });
    }
    catch (error) {
        console.error('Get user summary error:', error);
        res.status(500).json({ message: 'Server error while fetching user summary' });
    }
};
exports.getUserSummary = getUserSummary;
//# sourceMappingURL=dashboardController.js.map