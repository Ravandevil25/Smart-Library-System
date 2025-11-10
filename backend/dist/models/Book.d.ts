import mongoose, { Document } from 'mongoose';
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
export declare const Book: mongoose.Model<IBook, {}, {}, {}, mongoose.Document<unknown, {}, IBook, {}, {}> & IBook & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Book.d.ts.map