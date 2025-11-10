import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  rollNo: string;
  email: string;
  role: 'student' | 'librarian' | 'guard' | 'admin';
  password: string;
  totalHours: number;
  activeSessionId?: string;
  borrowedCount: number;
  createdAt: Date;
  // Streak fields
  currentStreak?: number;
  longestStreak?: number;
  lastVisitDate?: string | null;
  streakHours?: number;
  // wishlist/reserves store book barcodes
  wishlist?: string[];
  reserves?: string[];
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['student', 'librarian', 'guard', 'admin'],
    default: 'student'
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  totalHours: {
    type: Number,
    default: 0
  },
  // Streak tracking: consecutive days visiting the library
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  // YYYY-MM-DD string of last visit date (based on entry/exit)
  lastVisitDate: {
    type: String,
    default: null
  },
  // Accumulated hours for the current streak (in hours)
  streakHours: {
    type: Number,
    default: 0
  },
  activeSessionId: {
    type: String,
    default: null
  },
  borrowedCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  ,
  // User wishlist: array of book barcodes
  wishlist: {
    type: [String],
    default: []
  },
  // User reservations: array of book barcodes
  reserves: {
    type: [String],
    default: []
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);
