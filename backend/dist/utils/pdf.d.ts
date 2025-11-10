import { IUser, IBook, IBorrowRecord } from '../models';
export declare const generateReceiptPDF: (receiptId: string, user: IUser, books: IBook[], borrowRecords: IBorrowRecord[]) => Promise<string>;
export declare const generateReceiptId: () => string;
export declare const generateTokenHash: (receiptId: string) => string;
//# sourceMappingURL=pdf.d.ts.map