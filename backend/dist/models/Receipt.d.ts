import mongoose, { Document, Types } from 'mongoose';
export interface IReceipt extends Document {
    receiptId: string;
    userId: Types.ObjectId;
    borrowIds: Types.ObjectId[];
    issuedAt: Date;
    tokenHash: string;
    valid: boolean;
}
export declare const Receipt: mongoose.Model<IReceipt, {}, {}, {}, mongoose.Document<unknown, {}, IReceipt, {}, {}> & IReceipt & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Receipt.d.ts.map