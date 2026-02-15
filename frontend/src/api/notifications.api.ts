import { del, get, patch } from './client';
import type { Notification } from '../types/notification.types';

export async function getNotifications(params?: {
  unreadOnly?: boolean;
}): Promise<Notification[]> {
  return get<Notification[]>('/notifications', params as Record<string, unknown>);
}

export async function getUnreadCount(): Promise<{ unreadCount: number }> {
  return get<{ unreadCount: number }>('/notifications/unread');
}

export async function markAsRead(id: string): Promise<Notification> {
  return patch<Notification>(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<{ updated: number }> {
  return patch<{ updated: number }>('/notifications/read-all');
}

export async function deleteNotification(id: string): Promise<void> {
  return del<void>(`/notifications/${id}`);
}