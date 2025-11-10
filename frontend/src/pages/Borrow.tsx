import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import BarcodeScanner from '../components/BarcodeScanner';
import { bookApi } from '../api/books';
import { borrowApi } from '../api/borrow';
import type { AxiosError } from 'axios';

interface SelectedBook {
  barcode: string;
  title: string;
  author?: string;
}

const Borrow: React.FC = () => {
  useAuth(); // Authentication required for this page
  const [showScanner, setShowScanner] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<SelectedBook[]>([]);
  const [message, setMessage] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');

  const handleScan = async (barcode: string) => {
    try {
      const book = await bookApi.getByBarcode(barcode);
      
      // Check if book is already in the list
      if (selectedBooks.some(b => b.barcode === barcode)) {
        setMessage('Book already added to list');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      if (book.copiesAvailable > 0) {
        setSelectedBooks([...selectedBooks, {
          barcode: book.barcode,
          title: book.title,
          author: book.authors?.[0] || undefined // Get first author if available
        }]);
        setMessage(`✓ Added: ${book.title}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Book is not available (no copies left)');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as AxiosError<{ message: string }>).response?.data?.message || 'Book not found'
        : 'Book not found';
      setMessage(`Error: ${errorMessage}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeBook = (barcode: string) => {
    setSelectedBooks(selectedBooks.filter(b => b.barcode !== barcode));
  };

  const handleManualEntry = async () => {
    if (!manualBarcode.trim()) {
      setMessage('Please enter a barcode');
      return;
    }

    await handleScan(manualBarcode.trim());
    setManualBarcode(''); // Clear input after scanning
  };

  const handleBorrow = async () => {
    if (selectedBooks.length === 0) {
      setMessage('Please scan at least one book');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const barcodes = selectedBooks.map(b => b.barcode);
      const response = await borrowApi.borrow(barcodes);
      setMessage('✓ Books borrowed successfully!');
      setSelectedBooks([]);
      
      // Download receipt PDF only if pdfPath is available
      if (response.receipt.pdfPath) {
        const receiptId = response.receipt.id;
        // Extract base URL (remove /api if present)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.replace('/api', '');
        const pdfUrl = `${baseUrl}${response.receipt.pdfPath}.pdf`;
        
        // Use fetch to download the PDF as blob for better cross-browser support
        try {
          const pdfResponse = await fetch(pdfUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (!pdfResponse.ok) {
            throw new Error('Failed to download receipt');
          }

          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Library_Receipt_${receiptId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setMessage('✓ Books borrowed successfully! Receipt downloaded.');
        } catch (downloadError) {
          console.error('Download error:', downloadError);
          // Fallback to opening in new tab if download fails
          window.open(pdfUrl, '_blank');
          setMessage('✓ Books borrowed successfully! Receipt opened in new tab.');
        }
      } else {
        setMessage('✓ Books borrowed successfully! (Receipt PDF could not be generated)');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as AxiosError<{ message: string }>).response?.data?.message || 'Failed to borrow books'
        : 'Failed to borrow books';
      setMessage(`Error: ${errorMessage}`);
    }
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 text-gray-900">
      {message && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white text-black p-3 sm:p-4 border border-gray-200 z-50 rounded-lg shadow-lg max-w-[90vw] text-sm sm:text-base"
        >
          {message}
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 p-4 sm:p-6 bg-white rounded-xl shadow-soft"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Borrow Books</h1>
          
          <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScanner(true)}
              className="w-full px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              Scan Book Barcode
            </motion.button>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Or enter barcode manually"
                className="flex-1 px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary text-sm sm:text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualEntry();
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleManualEntry}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-white text-black font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Add
              </motion.button>
            </div>
          </div>

          {selectedBooks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">Selected Books</h2>
              <div className="space-y-2">
                {selectedBooks.map((book) => (
                  <motion.div
                    key={book.barcode}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 bg-white rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base sm:text-lg break-words">{book.title}</p>
                      {book.author && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">by {book.author}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2 font-mono break-all">Barcode: {book.barcode}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeBook(book.barcode)}
                      className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors whitespace-nowrap text-sm sm:text-base"
                    >
                      Remove
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBorrow}
                className="w-full py-3 bg-primary-500 text-white font-bold hover:bg-primary-600 transition-colors text-sm sm:text-base"
              >
                Borrow {selectedBooks.length} Book{selectedBooks.length > 1 ? 's' : ''}
              </motion.button>
            </div>
          )}

          {selectedBooks.length === 0 && (
            <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
              Scan book barcodes to add them to your borrow list
            </p>
          )}
        </motion.div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default Borrow;

