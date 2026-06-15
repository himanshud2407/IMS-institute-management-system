import { api } from './api';
import { Notification, NotificationRecipient } from '@/types';

const unwrap = <T>(payload: unknown): T => {
  const responsePayload = payload as { data?: unknown };
  const data = responsePayload.data ?? payload;
  const paginated = data as { results?: unknown };
  return (paginated.results ?? data) as T;
};

export const notificationService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await api.get(`/notifications/${query}`);
    return unwrap<Notification[]>(response.data);
  },

  create: async (data: Partial<Notification>) => {
    const response = await api.post('/notifications/', data);
    return unwrap<Notification>(response.data);
  },

  update: async (id: string, data: Partial<Notification>) => {
    const response = await api.patch(`/notifications/${id}/`, data);
    return unwrap<Notification>(response.data);
  },

  delete: async (id: string) => {
    await api.delete(`/notifications/${id}/`);
  },

  markRead: async (id: string) => {
    const response = await api.post(`/notifications/${id}/mark-read/`);
    return unwrap<Notification>(response.data);
  },

  markAllRead: async () => {
    const response = await api.post('/notifications/mark-all-read/');
    return unwrap<{ marked_read: number }>(response.data);
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count/');
    return unwrap<{ unread_count: number }>(response.data);
  },

  getRecipients: async () => {
    const response = await api.get('/notifications/recipients/');
    return unwrap<NotificationRecipient[]>(response.data);
  },
};
