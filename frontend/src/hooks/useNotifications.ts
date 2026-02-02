import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationItem } from '../types/notifications';
import { getNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead } from '../api/notifications';

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

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const { pollInterval = 30000 } = options;
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
    refetchInterval: pollInterval,
  });

  const unreadCountQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: pollInterval,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (prev = []) =>
        prev.map((item) => (item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item))
      );
      queryClient.setQueryData<number>(['notifications', 'unread-count'], (count = 0) => Math.max(0, count - 1));
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (prev = []) =>
        prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))
      );
      queryClient.setQueryData<number>(['notifications', 'unread-count'], 0);
    },
  });

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (unreadOnly) {
      const data = await getNotifications({ unread: true });
      queryClient.setQueryData(['notifications'], data);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  const fetchUnreadCount = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }, [queryClient]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }, [queryClient]);

  return {
    notifications: notificationsQuery.data || [],
    unreadCount: unreadCountQuery.data || 0,
    loading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    error: (notificationsQuery.error as Error | undefined)?.message || null,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead: (notificationId: string) => markAsReadMutation.mutateAsync(notificationId),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
    refresh,
  };
}
