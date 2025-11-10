"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const bookController_1 = require("../controllers/bookController");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
// configure multer to store uploaded ebooks under src/ebooks
const storageDir = path_1.default.join(__dirname, 'ebooks');
const upload = (0, multer_1.default)({ dest: storageDir });
router.post('/add', auth_1.authenticate, (0, auth_1.authorize)('librarian', 'admin'), bookController_1.addBook);
router.get('/', bookController_1.getAllBooks);
router.get('/:barcode', bookController_1.getBookByBarcode);
// Wishlist / Reserve endpoints (authenticated users)
router.post('/:barcode/wishlist', auth_1.authenticate, bookController_1.addToWishlist);
router.delete('/:barcode/wishlist', auth_1.authenticate, bookController_1.removeFromWishlist);
router.post('/:barcode/reserve', auth_1.authenticate, bookController_1.addToReserve);
router.delete('/:barcode/reserve', auth_1.authenticate, bookController_1.removeFromReserve);
// Admin endpoint to upload e-book file (multipart/form-data with field 'ebook')
router.post('/:barcode/ebook', auth_1.authenticate, (0, auth_1.authorize)('librarian', 'admin'), upload.single('ebook'), bookController_1.uploadEbook);
router.patch('/:barcode', auth_1.authenticate, (0, auth_1.authorize)('librarian', 'admin'), bookController_1.updateBook);
exports.default = router;
//# sourceMappingURL=book.js.map