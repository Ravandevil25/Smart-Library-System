import { Response, Request } from 'express';
import { Session, BorrowRecord, User, IUser } from '../models';
import { AuthRequest } from '../utils/auth';

export const getOccupancy = async (req: Request, res: Response) => {
  try {
    // Get active sessions (users currently in library)
    const activeSessions = await Session.find({ exitAt: null })
      .populate('userId', 'name rollNo')
      .sort({ entryAt: -1 });

    const count = activeSessions.length;

    res.json({
      count,
      activeSessions: activeSessions.map(session => ({
        id: session.id,
        user: {
          name: (session.userId as any).name,
          rollNo: (session.userId as any).rollNo
        },
        entryAt: session.entryAt
      }))
    });
  } catch (error) {
    console.error('Get occupancy error:', error);
    res.status(500).json({ message: 'Server error while fetching occupancy' });
  }
};

export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const activeSessions = await Session.find({ exitAt: null })
      .populate('userId', 'name rollNo email')
      .sort({ entryAt: -1 });

    res.json({
      sessions: activeSessions.map(session => ({
        id: session.id,
        user: {
          name: (session.userId as any).name,
          rollNo: (session.userId as any).rollNo,
          email: (session.userId as any).email
        },
        entryAt: session.entryAt,
        durationMinutes: Math.floor((new Date().getTime() - session.entryAt.getTime()) / (1000 * 60))
      }))
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ message: 'Server error while fetching active sessions' });
  }
};

export const getUserHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get user's session history
    const sessions = await Session.find({ userId })
      .sort({ entryAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    // Get user's borrow history
    const borrowHistory = await BorrowRecord.find({ userId })
      .populate('bookId', 'title authors barcode')
      .sort({ borrowedAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      sessions: sessions.map(session => ({
        id: session.id,
        entryAt: session.entryAt,
        exitAt: session.exitAt || null,
        durationMinutes: session.durationMinutes || null
      })),
      borrowHistory: borrowHistory
        .filter(record => record.bookId != null) // Filter out records where book was deleted
        .map(record => {
          const book = record.bookId as any;
          return {
            id: record._id,
            book: {
              title: book?.title || 'Unknown Book',
              authors: book?.authors || ['Unknown Author'],
              barcode: book?.barcode || 'N/A'
            },
            borrowedAt: record.borrowedAt,
            dueAt: record.dueAt || null,
            returnedAt: record.returnedAt || null,
            active: record.active
          };
        })
    });
  } catch (error) {
    // Log full error details for debugging
    console.error('Get user history error:', error);
    console.error('Error stack:', (error as any)?.stack);
    console.error('User ID:', req.user?.id);
    res.status(500).json({ 
      message: 'Server error while fetching user history',
      error: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    });
  }
};

export const getUserSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;

    // Fetch fresh user data from database to get latest streak info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's total sessions
    const totalSessions = await Session.countDocuments({ userId });
    
    // Get user's total borrows
    const totalBorrows = await BorrowRecord.countDocuments({ userId });
    
    // Get user's active borrows
    const activeBorrows = await BorrowRecord.find({ userId, active: true })
      .populate('bookId', 'title authors barcode')
      .sort({ borrowedAt: -1 });

    // Get overdue books
    const overdueBooks = await BorrowRecord.find({
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
          title: (record.bookId as any).title,
          authors: (record.bookId as any).authors,
          barcode: (record.bookId as any).barcode
        },
        borrowedAt: record.borrowedAt,
        dueAt: record.dueAt
      })),
      overdueBooks: overdueBooks.map(record => ({
        id: record._id,
        book: {
          title: (record.bookId as any).title,
          authors: (record.bookId as any).authors,
          barcode: (record.bookId as any).barcode
        },
        borrowedAt: record.borrowedAt,
        dueAt: record.dueAt
      })),
      user: {
        name: user.name,
        rollNo: user.rollNo,
        totalHours: user.totalHours,
        borrowedCount: user.borrowedCount,
        // Include streak data directly in user object
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        streakHours: user.streakHours || 0
      }
    });
  } catch (error) {
    console.error('Get user summary error:', error);
    res.status(500).json({ message: 'Server error while fetching user summary' });
  }
};
