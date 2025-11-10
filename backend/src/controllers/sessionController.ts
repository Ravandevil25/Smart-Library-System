import { Response } from 'express';
import { Session, User, IUser } from '../models';
import { AuthRequest } from '../utils/auth';

export const entry = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;

    // Check if user already has an active session
    if (req.user.activeSessionId) {
      return res.status(400).json({ 
        message: 'User already has an active session' 
      });
    }

    // Create new session
    const session = new Session({
      userId,
      entryAt: new Date()
    });

    await session.save();

    // Update user's active session
    await User.findByIdAndUpdate(userId, {
      activeSessionId: session.id
    });

    res.json({
      message: 'Entry recorded successfully',
      session: {
        id: session.id,
        entryAt: session.entryAt
      }
    });
  } catch (error) {
    console.error('Entry error:', error);
    res.status(500).json({ message: 'Server error during entry' });
  }
};

export const exit = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;

    // Check if user has an active session
    if (!req.user.activeSessionId) {
      return res.status(400).json({ 
        message: 'No active session found' 
      });
    }

    // Find and update the session
    const session = await Session.findById(req.user.activeSessionId);
    if (!session) {
      return res.status(400).json({ 
        message: 'Session not found' 
      });
    }

    const exitAt = new Date();
    const durationMinutes = Math.floor((exitAt.getTime() - session.entryAt.getTime()) / (1000 * 60));

    session.exitAt = exitAt;
    session.durationMinutes = durationMinutes;
    await session.save();

    // Update user's total hours and clear active session
    // Also update streak info: compute visit date (YYYY-MM-DD) and update
    // currentStreak, longestStreak, lastVisitDate and streakHours accordingly
    const user = await User.findById(userId);
    const addedHours = durationMinutes / 60;

    const toDateStr = (d: Date) => {
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const visitDateStr = toDateStr(exitAt);

    let newCurrentStreak = 1;
    let newStreakHours = addedHours;
    let newLongest = user?.longestStreak || 0;

    if (user && user.lastVisitDate) {
      const last = user.lastVisitDate; // stored as YYYY-MM-DD
      // parse dates as UTC
      const lastDate = new Date(last + 'T00:00:00Z');
      const visitDate = new Date(visitDateStr + 'T00:00:00Z');
      const diffDays = Math.floor((visitDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // multiple sessions same day: keep currentStreak
        newCurrentStreak = user.currentStreak || 1;
        newStreakHours = (user.streakHours || 0) + addedHours;
        newLongest = Math.max(newLongest, newCurrentStreak);
      } else if (diffDays === 1) {
        // continued streak
        newCurrentStreak = (user.currentStreak || 0) + 1;
        newStreakHours = (user.streakHours || 0) + addedHours;
        newLongest = Math.max(newLongest, newCurrentStreak);
      } else {
        // broke streak
        newCurrentStreak = 1;
        newStreakHours = addedHours;
        newLongest = Math.max(newLongest, user.longestStreak || 0);
      }
    } else {
      // first visit recorded
      newCurrentStreak = 1;
      newStreakHours = addedHours;
      newLongest = Math.max(newLongest, 1);
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { totalHours: addedHours },
      activeSessionId: null,
      $set: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongest,
        lastVisitDate: visitDateStr,
        streakHours: newStreakHours
      }
    } as any);

    res.json({
      message: 'Exit recorded successfully',
      session: {
        id: session.id,
        entryAt: session.entryAt,
        exitAt: session.exitAt,
        durationMinutes
      }
    });
  } catch (error) {
    console.error('Exit error:', error);
    res.status(500).json({ message: 'Server error during exit' });
  }
};
