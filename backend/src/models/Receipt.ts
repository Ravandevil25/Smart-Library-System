import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReceipt extends Document {
  receiptId: string;
  userId: Types.ObjectId;
  borrowIds: Types.ObjectId[];
  issuedAt: Date;
  tokenHash: string;
  valid: boolean;
}

const ReceiptSchema = new Schema<IReceipt>({
  receiptId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  borrowIds: [{
    type: Schema.Types.ObjectId,
    ref: 'BorrowRecord',
    required: true
  }],
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  tokenHash: {
    type: String,
    required: true
  },
  valid: {
    type: Boolean,
    default: true
  }
});

export const Receipt = mongoose.model<IReceipt>('Receipt', ReceiptSchema);
