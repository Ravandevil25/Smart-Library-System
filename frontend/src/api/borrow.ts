import apiClient from './client';
import type { Receipt, ReturnedBook, VerifiedReceipt } from '../types';

export const borrowApi = {
  borrow: async (bookBarcodes: string[]): Promise<{ message: string; receipt: Receipt }> => {
    const response = await apiClient.post('/borrow', { bookBarcodes });
    return response.data;
  },

  return: async (borrowRecordIds: string[]): Promise<{ message: string; returnedBooks: ReturnedBook[] }> => {
    const response = await apiClient.post('/borrow/return', { borrowRecordIds });
    return response.data;
  },

  verify: async (receiptId: string, token: string): Promise<{ message: string; receipt: VerifiedReceipt }> => {
    const response = await apiClient.get('/borrow/verify', { params: { receiptId, token } });
    return response.data;
  },
};

