import mongoose, { Document } from 'mongoose';
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
    currentStreak?: number;
    longestStreak?: number;
    lastVisitDate?: string | null;
    streakHours?: number;
    wishlist?: string[];
    reserves?: string[];
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map