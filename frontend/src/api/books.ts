import apiClient from './client';
import type { Book } from '../types';

export const bookApi = {
  getAll: async (q?: string): Promise<Book[]> => {
    const response = await apiClient.get('/books', { params: q ? { q } : {} });
    return response.data.books || response.data;
  },

  getByBarcode: async (barcode: string): Promise<Book> => {
    const response = await apiClient.get(`/books/${barcode}`);
    return response.data.book;
  },

  add: async (book: { barcode: string; title: string; authors: string[]; copiesTotal: number; description?: string; coverUrl?: string; ebookUrl?: string }): Promise<Book> => {
    const response = await apiClient.post('/books/add', book);
    return response.data;
  },
  addToWishlist: async (barcode: string) => {
    const response = await apiClient.post(`/books/${encodeURIComponent(barcode)}/wishlist`);
    return response.data;
  },
  removeFromWishlist: async (barcode: string) => {
    const response = await apiClient.delete(`/books/${encodeURIComponent(barcode)}/wishlist`);
    return response.data;
  },
  addToReserve: async (barcode: string) => {
    const response = await apiClient.post(`/books/${encodeURIComponent(barcode)}/reserve`);
    return response.data;
  },
  removeFromReserve: async (barcode: string) => {
    const response = await apiClient.delete(`/books/${encodeURIComponent(barcode)}/reserve`);
    return response.data;
  }
  ,
  uploadEbook: async (barcode: string, file: File) => {
    const form = new FormData();
    form.append('ebook', file);
    const response = await apiClient.post(`/books/${encodeURIComponent(barcode)}/ebook`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
  ,
  update: async (barcode: string, patch: Partial<{ title: string; authors: string[]; copiesTotal: number; description?: string; coverUrl?: string; ebookUrl?: string; sampleUrl?: string }>) => {
    const response = await apiClient.patch(`/books/${encodeURIComponent(barcode)}`, patch);
    return response.data;
  }
};

