import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Notification } from '../types/notification.types';
import type { NotificationPayload } from '../types/websocket.types';
import { WebSocketEvents } from '../types/websocket.types';
import { websocketService } from '../services/websocket/websocket.service';
import * as notificationsApi from '../api/notifications.api';
import { toast } from '../utils/toast';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const [items, unread] = await Promise.all([
        notificationsApi.getNotifications(),
        notificationsApi.getUnreadCount(),
      ]);

      setNotifications(items);
      setUnreadCount(unread.unreadCount);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewNotification = useCallback((payload: NotificationPayload) => {
    // Backend payload shape is a subset (no `read/readAt`), normalize for UI.
    const normalized: Notification = {
      id: payload.id,
      userId: payload.userId,
      type: payload.type as any,
      title: payload.title,
      message: payload.message,
      data: payload.data ?? null,
      read: false,
      createdAt: payload.createdAt,
      readAt: null,
    };

    setNotifications((prev) => [normalized, ...prev]);
    setUnreadCount((prev) => prev + 1);

    toast.info(payload.message);
  }, []);

  useEffect(() => {
    fetchNotifications().catch(() => {
      // Silent on boot (don't spam)
    });

    websocketService.on(WebSocketEvents.NOTIFICATION_NEW, handleNewNotification);

    return () => {
      websocketService.off(WebSocketEvents.NOTIFICATION_NEW, handleNewNotification);
    };
  }, [fetchNotifications, handleNewNotification]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const updated = await notificationsApi.markAsRead(notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)),
    );

    // decrement unread count if it was unread locally
    setUnreadCount((prev) => Math.max(0, prev - 1));

    return updated;
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationsApi.markAllAsRead();

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
    );

    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    const target = notifications.find((n) => n.id === notificationId);

    await notificationsApi.deleteNotification(notificationId);

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    if (target && !target.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, [notifications]);

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    ],
  );
}