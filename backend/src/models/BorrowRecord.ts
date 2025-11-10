import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBorrowRecord extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  borrowedAt: Date;
  dueAt?: Date;
  returnedAt?: Date;
  active: boolean;
  receiptId?: string;
}

const BorrowRecordSchema = new Schema<IBorrowRecord>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  borrowedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueAt: {
    type: Date,
    default: function() {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days from now
      return dueDate;
    }
  },
  returnedAt: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  },
  receiptId: {
    type: String,
    default: null
  }
});

export const BorrowRecord = mongoose.model<IBorrowRecord>('BorrowRecord', BorrowRecordSchema);
