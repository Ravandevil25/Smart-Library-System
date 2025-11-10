"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyReceipt = exports.returnBooks = exports.borrow = void 0;
const models_1 = require("../models");
const pdf_1 = require("../utils/pdf");
const borrow = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { bookBarcodes } = req.body; // Array of book barcodes
        const userId = req.user.id;
        // Debug: log incoming request to help track down 500s during development
        console.debug('Borrow request received', { userId, bookBarcodes });
        if (!Array.isArray(bookBarcodes) || bookBarcodes.length === 0) {
            return res.status(400).json({
                message: 'Please provide at least one book barcode'
            });
        }
        // Find all books by barcodes
        const books = await models_1.Book.find({ barcode: { $in: bookBarcodes } });
        console.debug('Books found for borrow request', { requested: bookBarcodes.length, found: books.length });
        if (books.length !== bookBarcodes.length) {
            return res.status(400).json({
                message: 'One or more books not found'
            });
        }
        // Check availability
        const unavailableBooks = books.filter(book => book.copiesAvailable <= 0);
        if (unavailableBooks.length > 0) {
            return res.status(400).json({
                message: 'Some books are not available',
                unavailableBooks: unavailableBooks.map(b => b.title)
            });
        }
        // Create borrow records
        const borrowRecords = [];
        for (const book of books) {
            const borrowRecord = new models_1.BorrowRecord({
                userId,
                bookId: book.id,
                borrowedAt: new Date()
            });
            await borrowRecord.save();
            borrowRecords.push(borrowRecord);
            // Decrement available copies
            await models_1.Book.findByIdAndUpdate(book.id, {
                $inc: { copiesAvailable: -1 }
            });
        }
        console.debug('Borrow records created', { count: borrowRecords.length, borrowIds: borrowRecords.map(b => b.id) });
        // Generate receipt
        const receiptId = (0, pdf_1.generateReceiptId)();
        const tokenHash = (0, pdf_1.generateTokenHash)(receiptId);
        const receipt = new models_1.Receipt({
            receiptId,
            userId,
            borrowIds: borrowRecords.map(br => br.id),
            issuedAt: new Date(),
            tokenHash
        });
        await receipt.save();
        console.debug('Receipt created', { receiptId, dbId: receipt._id });
        // Update borrow records with receipt ID
        await models_1.BorrowRecord.updateMany({ _id: { $in: borrowRecords.map(br => br.id) } }, { receiptId });
        // Update user's borrowed count
        await models_1.User.findByIdAndUpdate(userId, {
            $inc: { borrowedCount: borrowRecords.length }
        });
        console.debug('User borrowedCount updated', { userId, increment: borrowRecords.length });
        // Generate PDF — if PDF generation fails we should NOT roll back the borrow
        // because the database updates have already been applied. Log the error
        // and return success without pdfPath so the client doesn't receive a 500.
        let pdfPath = null;
        try {
            pdfPath = await (0, pdf_1.generateReceiptPDF)(receiptId, req.user, books, borrowRecords);
        }
        catch (pdfErr) {
            // Log full stack to help debugging in dev; keep behavior non-fatal
            console.error('Receipt PDF generation failed:', (pdfErr?.stack || pdfErr));
            pdfPath = null;
        }
        const receiptPayload = {
            id: receiptId,
            books: books.map(book => ({
                title: book.title,
                authors: book.authors,
                barcode: book.barcode
            })),
            borrowedAt: new Date()
        };
        if (pdfPath) {
            receiptPayload.pdfPath = `/api/receipt/download/${receiptId}`;
        }
        res.json({
            message: 'Books borrowed successfully',
            receipt: receiptPayload
        });
    }
    catch (error) {
        // Log full error stack for easier debugging
        console.error('Borrow error:', (error?.stack || error));
        res.status(500).json({ message: 'Server error during borrowing' });
    }
};
exports.borrow = borrow;
const returnBooks = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { borrowRecordIds } = req.body; // Array of borrow record IDs
        const userId = req.user.id;
        if (!Array.isArray(borrowRecordIds) || borrowRecordIds.length === 0) {
            return res.status(400).json({
                message: 'Please provide at least one borrow record ID'
            });
        }
        // Find borrow records
        const borrowRecords = await models_1.BorrowRecord.find({
            _id: { $in: borrowRecordIds },
            userId,
            active: true
        }).populate('bookId');
        if (borrowRecords.length !== borrowRecordIds.length) {
            return res.status(400).json({
                message: 'One or more borrow records not found or already returned'
            });
        }
        // Update borrow records
        const returnedAt = new Date();
        await models_1.BorrowRecord.updateMany({ _id: { $in: borrowRecordIds } }, {
            returnedAt,
            active: false
        });
        // Increment available copies for each book and update user's borrowed count.
        // Perform these in a best-effort manner — log any errors but don't fail the whole
        // response if an individual increment fails (borrow records have already been marked returned).
        try {
            for (const record of borrowRecords) {
                const bookId = typeof record.bookId === 'object' ? record.bookId._id : record.bookId;
                await models_1.Book.findByIdAndUpdate(bookId, {
                    $inc: { copiesAvailable: 1 }
                });
            }
            await models_1.User.findByIdAndUpdate(userId, {
                $inc: { borrowedCount: -borrowRecords.length }
            });
        }
        catch (postErr) {
            console.error('Post-return update error (copies/user count):', postErr);
            // continue — don't throw, the borrow records were already updated
        }
        res.json({
            message: 'Books returned successfully',
            returnedBooks: borrowRecords.map(record => ({
                title: record.bookId.title,
                authors: record.bookId.authors,
                borrowedAt: record.borrowedAt,
                returnedAt
            }))
        });
    }
    catch (error) {
        console.error('Return error:', error);
        res.status(500).json({ message: 'Server error during return' });
    }
};
exports.returnBooks = returnBooks;
const verifyReceipt = async (req, res) => {
    try {
        const { receiptId, token } = req.query;
        if (!receiptId || !token) {
            return res.status(400).json({
                message: 'Receipt ID and token are required'
            });
        }
        // Find receipt
        const receipt = await models_1.Receipt.findOne({ receiptId });
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        // Verify token hash
        const expectedTokenHash = (0, pdf_1.generateTokenHash)(receiptId);
        if (receipt.tokenHash !== expectedTokenHash) {
            return res.status(400).json({ message: 'Invalid token' });
        }
        if (!receipt.valid) {
            return res.status(400).json({ message: 'Receipt has been used or invalidated' });
        }
        // Mark receipt as used
        receipt.valid = false;
        await receipt.save();
        res.json({
            message: 'Receipt verified successfully',
            receipt: {
                id: receipt.receiptId,
                userId: receipt.userId,
                issuedAt: receipt.issuedAt
            }
        });
    }
    catch (error) {
        console.error('Verify receipt error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};
exports.verifyReceipt = verifyReceipt;
//# sourceMappingURL=borrowController.js.map