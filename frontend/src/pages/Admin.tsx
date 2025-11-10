import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { bookApi } from '../api/books';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [barcode, setBarcode] = useState('');
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [copies, setCopies] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [ebookUrl, setEbookUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [createdBookInfo, setCreatedBookInfo] = useState<any | null>(null);
  
  // Update book states
  const [updateBarcode, setUpdateBarcode] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateAuthors, setUpdateAuthors] = useState('');
  const [updateCopies, setUpdateCopies] = useState<number>(1);
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateCoverUrl, setUpdateCoverUrl] = useState('');
  const [updateEbookUrl, setUpdateEbookUrl] = useState('');
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateBookInfo, setUpdateBookInfo] = useState<any | null>(null);
  const [isLoadingBook, setIsLoadingBook] = useState(false);

  if (!user || (user.role !== 'admin' && user.role !== 'librarian')) {
    return <div className="p-6">You are not authorized to access the admin panel.</div>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatedBookInfo(null);
      const payload: any = {
        barcode: barcode.trim(),
        title: title.trim(),
        authors: authors.split(',').map(a => a.trim()).filter(Boolean),
        copiesTotal: Number(copies) || 1,
        description: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
      };
      
      // Only include ebookUrl if it's not empty
      if (ebookUrl.trim()) {
        payload.ebookUrl = ebookUrl.trim();
      }
  const res = await bookApi.add(payload);
  // backend returns { message, book }
  setMessage('Book added successfully');
  setCreatedBookInfo((res as any).book || res);
      setBarcode(''); setTitle(''); setAuthors(''); setCopies(1); setDescription(''); setCoverUrl('');
      setEbookUrl('');
    } catch (err: any) {
      console.error('Add book error', err);
      const msg = err?.response?.data?.message || 'Failed to add book';
      setMessage(msg);
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const loadBookForUpdate = async () => {
    if (!updateBarcode.trim()) {
      setUpdateMessage('Please enter a barcode');
      setTimeout(() => setUpdateMessage(null), 3000);
      return;
    }
    
    setIsLoadingBook(true);
    setUpdateMessage(null);
    try {
      const book = await bookApi.getByBarcode(updateBarcode.trim());
      setUpdateTitle(book.title || '');
      setUpdateAuthors(book.authors?.join(', ') || '');
      setUpdateCopies(book.copiesTotal || 1);
      setUpdateDescription(book.description || '');
      setUpdateCoverUrl((book as any).coverUrl || '');
      setUpdateEbookUrl((book as any).ebookUrl || '');
      setUpdateBookInfo(book);
      setUpdateMessage('Book loaded successfully');
    } catch (err: any) {
      console.error('Load book error', err);
      const msg = err?.response?.data?.message || 'Book not found';
      setUpdateMessage(msg);
      setUpdateBookInfo(null);
      // Clear form
      setUpdateTitle(''); setUpdateAuthors(''); setUpdateCopies(1);
      setUpdateDescription(''); setUpdateCoverUrl(''); setUpdateEbookUrl('');
    } finally {
      setIsLoadingBook(false);
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateBarcode.trim()) {
      setUpdateMessage('Barcode is required');
      setTimeout(() => setUpdateMessage(null), 3000);
      return;
    }
    
    try {
      setUpdateMessage(null);
      const payload: any = {};
      
      if (updateTitle.trim()) payload.title = updateTitle.trim();
      if (updateAuthors.trim()) {
        payload.authors = updateAuthors.split(',').map(a => a.trim()).filter(Boolean);
      }
      if (updateCopies) payload.copiesTotal = Number(updateCopies);
      if (updateDescription.trim()) payload.description = updateDescription.trim();
      if (updateCoverUrl.trim()) payload.coverUrl = updateCoverUrl.trim();
      
      // Always include ebookUrl (can be empty string to clear it)
      payload.ebookUrl = updateEbookUrl.trim() || '';
      
      const res = await bookApi.update(updateBarcode.trim(), payload);
      setUpdateMessage('Book updated successfully');
      setUpdateBookInfo((res as any).book || res);
    } catch (err: any) {
      console.error('Update book error', err);
      const msg = err?.response?.data?.message || 'Failed to update book';
      setUpdateMessage(msg);
    } finally {
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Admin — Add Book</h2>
      {message && <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-100 text-green-800 rounded text-sm sm:text-base">{message}</div>}
      <form onSubmit={submit} className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded shadow-sm">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Barcode / ISBN</label>
          <input value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full border px-3 py-2 rounded text-sm sm:text-base" />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded text-sm sm:text-base" />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Authors (comma-separated)</label>
          <input value={authors} onChange={e => setAuthors(e.target.value)} className="w-full border px-3 py-2 rounded text-sm sm:text-base" />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Copies</label>
          <input type="number" min={1} value={copies} onChange={e => setCopies(Number(e.target.value))} className="w-full sm:w-40 border px-3 py-2 rounded text-sm sm:text-base" />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Cover URL (optional)</label>
          <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className="w-full border px-3 py-2 rounded text-sm sm:text-base" />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">E-book URL (optional)</label>
          <input value={ebookUrl} onChange={e => setEbookUrl(e.target.value)} placeholder="/api/ebooks/filename.pdf or full URL" className="w-full border px-3 py-2 rounded text-sm sm:text-base" />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded text-sm sm:text-base min-h-[100px]" />
        </div>
        <div className="flex gap-2 pt-2">
          <button className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded text-sm sm:text-base hover:bg-blue-700 transition-colors">Add Book</button>
        </div>
      </form>
      {createdBookInfo && (
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded">
          <h3 className="font-semibold text-sm sm:text-base mb-2">Created Book</h3>
          <p className="text-xs sm:text-sm break-words">Barcode: {createdBookInfo.book?.barcode || createdBookInfo.barcode}</p>
          <p className="text-xs sm:text-sm break-words mt-1">Title: {createdBookInfo.book?.title || createdBookInfo.title}</p>
          { (createdBookInfo.book?.ebookUrl || createdBookInfo.ebookUrl) && (
            <p className="text-xs sm:text-sm mt-1 break-all">E-book URL: <a className="text-blue-600 underline" href={(createdBookInfo.book?.ebookUrl || createdBookInfo.ebookUrl).startsWith('http') ? (createdBookInfo.book?.ebookUrl || createdBookInfo.ebookUrl) : `${window.location.origin}${createdBookInfo.book?.ebookUrl || createdBookInfo.ebookUrl}`} target="_blank" rel="noreferrer">Open</a></p>
          )}
        </div>
      )}

      {/* Update Book Section */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Update Existing Book</h2>
        {updateMessage && (
          <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded text-sm sm:text-base ${
            updateMessage.includes('successfully') || updateMessage.includes('loaded')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {updateMessage}
          </div>
        )}
        
        <div className="bg-white p-4 sm:p-6 rounded shadow-sm mb-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={updateBarcode}
              onChange={e => setUpdateBarcode(e.target.value)}
              placeholder="Enter book barcode to update"
              className="flex-1 border px-3 py-2 rounded text-sm sm:text-base"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  loadBookForUpdate();
                }
              }}
            />
            <button
              type="button"
              onClick={loadBookForUpdate}
              disabled={isLoadingBook}
              className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded text-sm sm:text-base hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isLoadingBook ? 'Loading...' : 'Load Book'}
            </button>
          </div>
        </div>

        {updateBookInfo && (
          <form onSubmit={submitUpdate} className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded shadow-sm">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Barcode / ISBN (read-only)</label>
              <input value={updateBarcode} readOnly className="w-full border px-3 py-2 rounded text-sm sm:text-base bg-gray-100" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Title</label>
              <input value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} className="w-full border px-3 py-2 rounded text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Authors (comma-separated)</label>
              <input value={updateAuthors} onChange={e => setUpdateAuthors(e.target.value)} className="w-full border px-3 py-2 rounded text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Copies</label>
              <input type="number" min={1} value={updateCopies} onChange={e => setUpdateCopies(Number(e.target.value))} className="w-full sm:w-40 border px-3 py-2 rounded text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Cover URL (optional)</label>
              <input value={updateCoverUrl} onChange={e => setUpdateCoverUrl(e.target.value)} className="w-full border px-3 py-2 rounded text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">E-book URL (optional)</label>
              <input 
                value={updateEbookUrl} 
                onChange={e => setUpdateEbookUrl(e.target.value)} 
                placeholder="https://files.libcom.org/files/1984.pdf or /api/ebooks/filename.pdf" 
                className="w-full border px-3 py-2 rounded text-sm sm:text-base" 
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to remove the ebook URL</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Description</label>
              <textarea value={updateDescription} onChange={e => setUpdateDescription(e.target.value)} className="w-full border px-3 py-2 rounded text-sm sm:text-base min-h-[100px]" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded text-sm sm:text-base hover:bg-green-700 transition-colors">Update Book</button>
              <button 
                type="button"
                onClick={() => {
                  setUpdateBarcode('');
                  setUpdateTitle('');
                  setUpdateAuthors('');
                  setUpdateCopies(1);
                  setUpdateDescription('');
                  setUpdateCoverUrl('');
                  setUpdateEbookUrl('');
                  setUpdateBookInfo(null);
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-300 text-gray-700 rounded text-sm sm:text-base hover:bg-gray-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Admin;
