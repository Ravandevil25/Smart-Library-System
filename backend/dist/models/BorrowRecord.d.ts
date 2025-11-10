import mongoose, { Document, Types } from 'mongoose';
export interface IBorrowRecord extends Document {
    userId: Types.ObjectId;
    bookId: Types.ObjectId;
    borrowedAt: Date;
    dueAt?: Date;
    returnedAt?: Date;
    active: boolean;
    receiptId?: string;
}
export declare const BorrowRecord: mongoose.Model<IBorrowRecord, {}, {}, {}, mongoose.Document<unknown, {}, IBorrowRecord, {}, {}> & IBorrowRecord & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=BorrowRecord.d.ts.map