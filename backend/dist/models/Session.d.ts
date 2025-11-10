import mongoose, { Document, Types } from 'mongoose';
export interface ISession extends Document {
    userId: Types.ObjectId;
    entryAt: Date;
    exitAt?: Date;
    durationMinutes?: number;
}
export declare const Session: mongoose.Model<ISession, {}, {}, {}, mongoose.Document<unknown, {}, ISession, {}, {}> & ISession & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Session.d.ts.map