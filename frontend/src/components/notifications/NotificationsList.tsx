import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { NotificationItem } from './NotificationItem';
import { EmptyState } from '../shared/EmptyState';
import type { Notification } from '../../types/notification.types';

interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
  onNotificationClick?: (notification: Notification) => void;
}

/**
 * NotificationsList component - full page list of all notifications
 */
export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  isLoading,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const handleMarkAllAsRead = async () => {
    await onMarkAllAsRead();
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Notifications
        </Typography>
        {unreadCount > 0 && (
          <Button variant="outlined" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>

      {/* Filter Tabs */}
      <Tabs
        value={filter}
        onChange={(_, newValue) => setFilter(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label={`All (${notifications.length})`} value="all" />
        <Tab label={`Unread (${unreadCount})`} value="unread" />
      </Tabs>

      <Divider />

      {/* Notifications List */}
      {isLoading ? (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          description={
            filter === 'unread'
              ? "You're all caught up!"
              : 'Notifications about your tasks and teams will appear here'
          }
        />
      ) : (
        <List sx={{ p: 0 }}>
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
              onDelete={onDelete}
            />
          ))}
        </List>
      )}
    </Box>
  );
};

export default NotificationsList;
