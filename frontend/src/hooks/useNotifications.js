import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useNotifications(options = {}) {
  const { pollInterval = 30000 } = options; // 30 seconds default
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = unreadOnly ? { unread: 'true' } : {};
      const { data } = await axios.get('/api/notifications', {
        headers: getAuthHeaders(),
        params,
      });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/notifications/unread-count', {
        headers: getAuthHeaders(),
      });
      setUnreadCount(data?.count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`, {}, {
        headers: getAuthHeaders(),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.post('/api/notifications/read-all', {}, {
        headers: getAuthHeaders(),
      });
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
    const interval = setInterval(fetchUnreadCount, pollInterval);
    return () => clearInterval(interval);
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
