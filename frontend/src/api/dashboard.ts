import apiClient from './client';
import type { Occupancy, ActiveSession, UserHistory, UserSummary } from '../types';

export const dashboardApi = {
  getOccupancy: async (): Promise<Occupancy> => {
    const response = await apiClient.get('/dashboard/occupancy');
    return response.data;
  },

  getActiveSessions: async (): Promise<{ sessions: ActiveSession[] }> => {
    const response = await apiClient.get('/dashboard/active-sessions');
    return response.data;
  },

  getUserHistory: async (page?: number, limit?: number): Promise<UserHistory> => {
    const response = await apiClient.get('/dashboard/users/history', {
      params: { page, limit },
    });
    return response.data;
  },

  getUserSummary: async (): Promise<UserSummary> => {
    const response = await apiClient.get('/dashboard/users/summary');
    return response.data;
  },
};

