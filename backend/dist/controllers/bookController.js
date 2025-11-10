"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBook = exports.uploadEbook = exports.removeFromReserve = exports.addToReserve = exports.removeFromWishlist = exports.addToWishlist = exports.getBookByBarcode = exports.getAllBooks = exports.addBook = void 0;
const models_1 = require("../models");
const addBook = async (req, res) => {
    try {
        const { barcode, title, authors, copiesTotal, description, coverUrl, ebookUrl, sampleUrl } = req.body;
        // Check if book already exists
        const existingBook = await models_1.Book.findOne({ barcode });
        if (existingBook) {
            return res.status(400).json({
                message: 'Book with this barcode already exists'
            });
        }
        const book = new models_1.Book({
            barcode,
            title,
            authors: Array.isArray(authors) ? authors : [authors],
            copiesTotal,
            copiesAvailable: copiesTotal,
            description: description || '',
            coverUrl: coverUrl || '',
            ebookUrl: ebookUrl || '',
            sampleUrl: sampleUrl || ''
        });
        await book.save();
        res.status(201).json({
            message: 'Book added successfully',
            book
        });
    }
    catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ message: 'Server error while adding book' });
    }
};
exports.addBook = addBook;
const getAllBooks = async (req, res) => {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        let filter = {};
        if (q) {
            // search title or authors (authors is an array)
            const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter = { $or: [{ title: { $regex: re } }, { authors: { $elemMatch: { $regex: re } } }] };
        }
        const books = await models_1.Book.find(filter).sort({ title: 1 });
        res.json({ books });
    }
    catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ message: 'Server error while fetching books' });
    }
};
exports.getAllBooks = getAllBooks;
const getBookByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;
        const book = await models_1.Book.findOne({ barcode });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ book });
    }
    catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ message: 'Server error while fetching book' });
    }
};
exports.getBookByBarcode = getBookByBarcode;
const addToWishlist = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Not authenticated' });
        const { barcode } = req.params;
        const user = req.user;
        if (!barcode)
            return res.status(400).json({ message: 'Barcode required' });
        const u = user;
        u.wishlist = u.wishlist || [];
        if (!u.wishlist.includes(barcode)) {
            u.wishlist.push(barcode);
            await u.save();
        }
        return res.json({ message: 'Added to wishlist', wishlist: u.wishlist });
    }
    catch (err) {
        console.error('Add to wishlist error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addToWishlist = addToWishlist;
const removeFromWishlist = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Not authenticated' });
        const { barcode } = req.params;
        const user = req.user;
        if (!barcode)
            return res.status(400).json({ message: 'Barcode required' });
        const u2 = user;
        u2.wishlist = (u2.wishlist || []).filter((b) => b !== barcode);
        await u2.save();
        return res.json({ message: 'Removed from wishlist', wishlist: u2.wishlist });
    }
    catch (err) {
        console.error('Remove from wishlist error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.removeFromWishlist = removeFromWishlist;
const addToReserve = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Not authenticated' });
        const { barcode } = req.params;
        const user = req.user;
        if (!barcode)
            return res.status(400).json({ message: 'Barcode required' });
        // If copies are available, we don't allow a reservation — user should borrow instead
        const book = await models_1.Book.findOne({ barcode });
        if (book && book.copiesAvailable > 0) {
            return res.status(400).json({ message: 'Book is currently available; cannot reserve' });
        }
        const u3 = user;
        u3.reserves = u3.reserves || [];
        if (!u3.reserves.includes(barcode)) {
            u3.reserves.push(barcode);
            await u3.save();
        }
        return res.json({ message: 'Book reserved', reserves: u3.reserves });
    }
    catch (err) {
        console.error('Add to reserve error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addToReserve = addToReserve;
const removeFromReserve = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Not authenticated' });
        const { barcode } = req.params;
        const user = req.user;
        if (!barcode)
            return res.status(400).json({ message: 'Barcode required' });
        const u4 = user;
        u4.reserves = (u4.reserves || []).filter((b) => b !== barcode);
        await u4.save();
        return res.json({ message: 'Reservation removed', reserves: u4.reserves });
    }
    catch (err) {
        console.error('Remove from reserve error', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.removeFromReserve = removeFromReserve;
const uploadEbook = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Not authenticated' });
        const { barcode } = req.params;
        if (!barcode)
            return res.status(400).json({ message: 'Barcode required' });
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: 'No file uploaded' });
        // Ensure book exists
        const book = await models_1.Book.findOne({ barcode });
        if (!book)
            return res.status(404).json({ message: 'Book not found' });
        // Save file URL — files are served from /api/ebooks/<filename>
        const url = `/api/ebooks/${file.filename}`;
        book.ebookUrl = url;
        await book.save();
        return res.json({ message: 'E-book uploaded', ebookUrl: url });
    }
    catch (err) {
        console.error('Upload ebook error', err);
        return res.status(500).json({ message: 'Server error while uploading ebook' });
    }
};
exports.uploadEbook = uploadEbook;
const updateBook = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Not authenticated' });
        const { barcode } = req.params;
        if (!barcode)
            return res.status(400).json({ message: 'Barcode required' });
        const updates = {};
        const { title, authors, copiesTotal, description, coverUrl, ebookUrl, sampleUrl } = req.body;
        if (title !== undefined)
            updates.title = title;
        if (authors !== undefined)
            updates.authors = Array.isArray(authors) ? authors : [authors];
        if (copiesTotal !== undefined)
            updates.copiesTotal = copiesTotal;
        if (description !== undefined)
            updates.description = description;
        if (coverUrl !== undefined)
            updates.coverUrl = coverUrl;
        if (ebookUrl !== undefined)
            updates.ebookUrl = ebookUrl;
        if (sampleUrl !== undefined)
            updates.sampleUrl = sampleUrl;
        const book = await models_1.Book.findOneAndUpdate({ barcode }, { $set: updates }, { new: true });
        if (!book)
            return res.status(404).json({ message: 'Book not found' });
        return res.json({ message: 'Book updated', book });
    }
    catch (err) {
        console.error('Update book error', err);
        return res.status(500).json({ message: 'Server error while updating book' });
    }
};
exports.updateBook = updateBook;
//# sourceMappingURL=bookController.js.map