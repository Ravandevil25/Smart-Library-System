import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { addBook, getAllBooks, getBookByBarcode, addToWishlist, removeFromWishlist, addToReserve, removeFromReserve, uploadEbook, updateBook } from '../controllers/bookController';
import { authenticate, authorize } from '../utils/auth';

const router = Router();

// configure multer to store uploaded ebooks under src/ebooks
const storageDir = path.join(__dirname, 'ebooks');
const upload = multer({ dest: storageDir });

router.post('/add', authenticate, authorize('librarian', 'admin'), addBook);
router.get('/', getAllBooks);
router.get('/:barcode', getBookByBarcode);

// Wishlist / Reserve endpoints (authenticated users)
router.post('/:barcode/wishlist', authenticate, addToWishlist);
router.delete('/:barcode/wishlist', authenticate, removeFromWishlist);

router.post('/:barcode/reserve', authenticate, addToReserve);
router.delete('/:barcode/reserve', authenticate, removeFromReserve);

// Admin endpoint to upload e-book file (multipart/form-data with field 'ebook')
router.post('/:barcode/ebook', authenticate, authorize('librarian', 'admin'), upload.single('ebook'), uploadEbook);
router.patch('/:barcode', authenticate, authorize('librarian', 'admin'), updateBook);

export default router;
