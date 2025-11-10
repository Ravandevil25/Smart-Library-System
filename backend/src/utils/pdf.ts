import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IUser, IBook, IBorrowRecord } from '../models';

export const generateReceiptPDF = async (
  receiptId: string,
  user: IUser,
  books: IBook[],
  borrowRecords: IBorrowRecord[]
): Promise<string> => {
  // Ensure receipts directory exists
  const receiptsDir = path.join(__dirname, '../pdf/receipts');
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const doc = new PDFDocument();
  const filePath = path.join(receiptsDir, `${receiptId}.pdf`);

  // Create a writable stream and pipe the PDF into it
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Add content to PDF
  doc.fontSize(20).text('Library Borrow Receipt', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(14).text(`Student: ${user.name}`, 50, 100);
  doc.text(`Roll Number: ${user.rollNo}`, 50, 120);
  doc.text(`Email: ${user.email}`, 50, 140);
  doc.text(`Date: ${new Date().toLocaleString()}`, 50, 160);
  
  doc.moveDown(2);
  doc.fontSize(16).text('Borrowed Books:', 50, 200);

  let yPosition = 230;
  books.forEach((book, index) => {
    doc.fontSize(12).text(`${index + 1}. ${book.title}`, 70, yPosition);
    doc.text(`   Authors: ${book.authors.join(', ')}`, 70, yPosition + 15);
    doc.text(`   Barcode: ${book.barcode}`, 70, yPosition + 30);
    yPosition += 50;
  });

  doc.moveDown(2);
  doc.fontSize(14).text(`Receipt ID: ${receiptId}`, 50, yPosition + 20);
  doc.text('Show this receipt to the guard for verification.', 50, yPosition + 40);
  
  // Add QR code placeholder (you can integrate a QR code library here)
  doc.text('QR Code for verification:', 50, yPosition + 60);

  // Finalize the PDF and return a promise that resolves when the file is written.
  // We need to wait for both the document to end and the stream to finish
  return await new Promise<string>((resolve, reject) => {
    let docEnded = false;
    let streamFinished = false;
    let resolved = false;
    
    // Add timeout to prevent hanging (30 seconds)
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('PDF generation timeout: operation took too long'));
      }
    }, 30000);
    
    const checkComplete = () => {
      if (docEnded && streamFinished && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(filePath);
      }
    };
    
    doc.on('end', () => {
      docEnded = true;
      checkComplete();
    });
    
    stream.on('finish', () => {
      streamFinished = true;
      checkComplete();
    });
    
    stream.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });
    
    doc.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });
    
    // Start the PDF generation
    doc.end();
  });
};

export const generateReceiptId = (): string => {
  return 'RCPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const generateTokenHash = (receiptId: string): string => {
  return crypto.createHash('sha256').update(receiptId).digest('hex');
};
