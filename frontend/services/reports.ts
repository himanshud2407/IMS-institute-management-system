import { api } from './api';
import { AdminReport, DashboardStats } from '@/types';

const unwrap = <T>(payload: unknown): T => {
  const responsePayload = payload as { data?: unknown };
  return (responsePayload.data ?? payload) as T;
};

export const reportService = {
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard/');
    return unwrap<DashboardStats>(response.data);
  },

  getAdminReport: async () => {
    const response = await api.get('/reports/admin/');
    return unwrap<AdminReport>(response.data);
  },
};
