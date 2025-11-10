import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  entryAt: Date;
  exitAt?: Date;
  durationMinutes?: number;
}

const SessionSchema = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entryAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  exitAt: {
    type: Date,
    default: null
  },
  durationMinutes: {
    type: Number,
    default: null
  }
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);
