"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokenHash = exports.generateReceiptId = exports.generateReceiptPDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const generateReceiptPDF = async (receiptId, user, books, borrowRecords) => {
    // Ensure receipts directory exists
    const receiptsDir = path_1.default.join(__dirname, '../pdf/receipts');
    if (!fs_1.default.existsSync(receiptsDir)) {
        fs_1.default.mkdirSync(receiptsDir, { recursive: true });
    }
    const doc = new pdfkit_1.default();
    const filePath = path_1.default.join(receiptsDir, `${receiptId}.pdf`);
    // Create a writable stream and pipe the PDF into it
    const stream = fs_1.default.createWriteStream(filePath);
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
    doc.end();
    return await new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filePath));
        stream.on('error', (err) => reject(err));
    });
};
exports.generateReceiptPDF = generateReceiptPDF;
const generateReceiptId = () => {
    return 'RCPT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};
exports.generateReceiptId = generateReceiptId;
const generateTokenHash = (receiptId) => {
    return crypto_1.default.createHash('sha256').update(receiptId).digest('hex');
};
exports.generateTokenHash = generateTokenHash;
//# sourceMappingURL=pdf.js.map