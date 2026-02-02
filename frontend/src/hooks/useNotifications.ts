import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { NotificationItem } from '../types/notifications';

type UseNotificationsOptions = {
  pollInterval?: number;
};

type UseNotificationsResult = {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => void;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const { pollInterval = 30000 } = options;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = unreadOnly ? { unread: 'true' } : {};
      const { data } = await axios.get<NotificationItem[]>('/api/notifications', {
        headers: getAuthHeaders(),
        params,
      });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error ||
        (err as Error).message ||
        'Failed to load notifications';
      setError(message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await axios.get<{ count?: number }>('/api/notifications/unread-count', {
        headers: getAuthHeaders(),
      });
      setUnreadCount(data?.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`, {}, { headers: getAuthHeaders() });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.post('/api/notifications/read-all', {}, { headers: getAuthHeaders() });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const interval = window.setInterval(fetchUnreadCount, pollInterval);
    return () => window.clearInterval(interval);
  }, [fetchUnreadCount, pollInterval]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
