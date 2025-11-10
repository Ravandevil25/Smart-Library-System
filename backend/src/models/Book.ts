import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  barcode: string;
  title: string;
  authors: string[];
  copiesTotal: number;
  copiesAvailable: number;
  description?: string;
  coverUrl?: string;
  ebookUrl?: string;
  sampleUrl?: string;
}

const BookSchema = new Schema<IBook>({
  barcode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  authors: [{
    type: String,
    required: true,
    trim: true
  }],
  copiesTotal: {
    type: Number,
    required: true,
    min: 1
  },
  copiesAvailable: {
    type: Number,
    required: true,
    min: 0
  }
  ,
  description: {
    type: String,
    default: ''
  },
  coverUrl: {
    type: String,
    default: ''
  }
  ,
  // optional ebook file URL served from /api/ebooks/<filename>
  ebookUrl: {
    type: String,
    default: ''
  },
  // optional sample/preview URL
  sampleUrl: {
    type: String,
    default: ''
  }
});

export const Book = mongoose.model<IBook>('Book', BookSchema);
