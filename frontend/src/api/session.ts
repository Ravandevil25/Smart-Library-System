import apiClient from './client';
import type { Session } from '../types';

export const sessionApi = {
  entry: async (): Promise<{ message: string; session: Session }> => {
    const response = await apiClient.post('/session/entry');
    return response.data;
  },

  exit: async (): Promise<{ message: string; session: Session }> => {
    const response = await apiClient.post('/session/exit');
    return response.data;
  },
};

