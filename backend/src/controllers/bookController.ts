import { Request, Response } from 'express';
import { Book, User } from '../models';
import { AuthRequest } from '../utils/auth';

export const addBook = async (req: AuthRequest, res: Response) => {
  try {
    const { barcode, title, authors, copiesTotal, description, coverUrl, ebookUrl, sampleUrl } = req.body;

    // Check if book already exists
    const existingBook = await Book.findOne({ barcode });
    if (existingBook) {
      return res.status(400).json({ 
        message: 'Book with this barcode already exists' 
      });
    }

    const bookData: any = {
      barcode,
      title,
      authors: Array.isArray(authors) ? authors : [authors],
      copiesTotal,
      copiesAvailable: copiesTotal,
      description: description || '',
      coverUrl: coverUrl || '',
    };

    // Only include ebookUrl if it's provided and not empty
    if (ebookUrl && ebookUrl.trim()) {
      bookData.ebookUrl = ebookUrl.trim();
    }

    // Only include sampleUrl if it's provided and not empty
    if (sampleUrl && sampleUrl.trim()) {
      bookData.sampleUrl = sampleUrl.trim();
    }

    const book = new Book(bookData);

    await book.save();

    res.status(201).json({
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Server error while adding book' });
  }
};

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    let filter: any = {};
    if (q) {
      // search title or authors (authors is an array)
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter = { $or: [ { title: { $regex: re } }, { authors: { $elemMatch: { $regex: re } } } ] };
    }

    const books = await Book.find(filter).sort({ title: 1 });
    res.json({ books });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error while fetching books' });
  }
};

export const getBookByBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.params;
    
    // Check if it looks like a MongoDB ObjectId (24 hex characters)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(barcode);
    
    let book;
    if (isObjectId) {
      // Try to find by ID first
      book = await Book.findById(barcode);
      // If not found by ID, try barcode
      if (!book) {
        book = await Book.findOne({ barcode });
      }
    } else {
      // Try barcode first
      book = await Book.findOne({ barcode });
    }
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ book });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Server error while fetching book' });
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { barcode } = req.params;
    const userId = req.user.id;
    if (!barcode) return res.status(400).json({ message: 'Barcode required' });

    // Use findByIdAndUpdate with $addToSet to ensure the barcode is added only if not already present
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: barcode } },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'Added to wishlist', wishlist: user.wishlist || [] });
  } catch (err) {
    console.error('Add to wishlist error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { barcode } = req.params;
    const userId = req.user.id;
    if (!barcode) return res.status(400).json({ message: 'Barcode required' });

    // Use findByIdAndUpdate with $pull to remove the barcode from the wishlist array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: barcode } },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'Removed from wishlist', wishlist: user.wishlist || [] });
  } catch (err) {
    console.error('Remove from wishlist error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addToReserve = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { barcode } = req.params;
    const userId = req.user.id;
    if (!barcode) return res.status(400).json({ message: 'Barcode required' });

    // If copies are available, we don't allow a reservation — user should borrow instead
    const book = await Book.findOne({ barcode });
    if (book && book.copiesAvailable > 0) {
      return res.status(400).json({ message: 'Book is currently available; cannot reserve' });
    }

    // Use findByIdAndUpdate with $addToSet to ensure the barcode is added only if not already present
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { reserves: barcode } },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'Book reserved', reserves: user.reserves || [] });
  } catch (err) {
    console.error('Add to reserve error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeFromReserve = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { barcode } = req.params;
    const userId = req.user.id;
    if (!barcode) return res.status(400).json({ message: 'Barcode required' });

    // Use findByIdAndUpdate with $pull to remove the barcode from the reserves array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { reserves: barcode } },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'Reservation removed', reserves: user.reserves || [] });
  } catch (err) {
    console.error('Remove from reserve error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadEbook = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { barcode } = req.params;
    if (!barcode) return res.status(400).json({ message: 'Barcode required' });

    const file = (req as any).file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    // Ensure book exists
    const book = await Book.findOne({ barcode });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Save file URL — files are served from /api/ebooks/<filename>
    const url = `/api/ebooks/${file.filename}`;
    (book as any).ebookUrl = url;
    await book.save();

    return res.json({ message: 'E-book uploaded', ebookUrl: url });
  } catch (err) {
    console.error('Upload ebook error', err);
    return res.status(500).json({ message: 'Server error while uploading ebook' });
  }
};

export const updateBook = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { barcode } = req.params;
    if (!barcode) return res.status(400).json({ message: 'Barcode required' });

    const updates: any = {};
    const { title, authors, copiesTotal, description, coverUrl, ebookUrl, sampleUrl } = req.body;
    if (title !== undefined) updates.title = title;
    if (authors !== undefined) updates.authors = Array.isArray(authors) ? authors : [authors];
    if (copiesTotal !== undefined) updates.copiesTotal = copiesTotal;
    if (description !== undefined) updates.description = description;
    if (coverUrl !== undefined) updates.coverUrl = coverUrl;
    // Only update ebookUrl if it's provided (trim whitespace)
    if (ebookUrl !== undefined) {
      updates.ebookUrl = ebookUrl.trim() || '';
    }
    // Only update sampleUrl if it's provided (trim whitespace)
    if (sampleUrl !== undefined) {
      updates.sampleUrl = sampleUrl.trim() || '';
    }

    const book = await Book.findOneAndUpdate({ barcode }, { $set: updates }, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    return res.json({ message: 'Book updated', book });
  } catch (err) {
    console.error('Update book error', err);
    return res.status(500).json({ message: 'Server error while updating book' });
  }
};
