import apiClient from './client';
import type { NotificationItem } from '../types/notifications';

export const getNotifications = async (params?: { unread?: boolean }): Promise<NotificationItem[]> => {
  const queryParams = params?.unread ? { unread: 'true' } : {};
  const { data } = await apiClient.get<NotificationItem[]>('/api/notifications', { params: queryParams });
  return Array.isArray(data) ? data : [];
};

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await apiClient.get<{ count?: number }>('/api/notifications/unread-count');
  return data?.count ?? 0;
};

export const markNotificationRead = async (notificationId: string) => {
  const { data } = await apiClient.post(`/api/notifications/${notificationId}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await apiClient.post('/api/notifications/read-all');
  return data;
};
