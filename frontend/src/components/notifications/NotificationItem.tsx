import React from 'react';
import { Box, Typography, IconButton, ListItem, ListItemIcon, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { Delete as DeleteIcon, TaskAlt as TaskIcon, GroupAdd as TeamIcon, Info as InfoIcon } from '@mui/icons-material';
import { NotificationType } from '../../types/notification.types';
import { formatRelativeTime } from '../../utils/helpers';

/**
 * NotificationItem component - single notification display
 */
interface NotificationItemProps {
  notification: {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    data?: Record<string, any> | null;
  };
  onClick?: (notification: any) => void;
  onDelete?: (notificationId: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onDelete,
}) => {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
      case NotificationType.TASK_MENTIONED:
        return <TaskIcon color="primary" />;
      case NotificationType.TEAM_INVITE:
      case NotificationType.TEAM_MEMBER_ADDED:
      case NotificationType.TEAM_MEMBER_REMOVED:
        return <TeamIcon color="secondary" />;
      default:
        return <InfoIcon />;
    }
  };

  const getIconBgColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
      case NotificationType.TASK_MENTIONED:
        return 'primary.light';
      case NotificationType.TEAM_INVITE:
      case NotificationType.TEAM_MEMBER_ADDED:
      case NotificationType.TEAM_MEMBER_REMOVED:
        return 'secondary.light';
      default:
        return 'grey.200';
    }
  };

  return (
    <ListItem
      onClick={() => onClick?.(notification)}
      sx={{
        cursor: 'pointer',
        backgroundColor: notification.read ? 'transparent' : 'action.hover',
        borderLeft: notification.read ? 'none' : '3px solid',
        borderLeftColor: 'primary.main',
        '&:hover': {
          backgroundColor: 'action.selected',
        },
        transition: 'background-color 0.2s',
      }}
      secondaryAction={
        onDelete ? (
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ) : undefined
      }
    >
      <ListItemIcon sx={{ minWidth: 48 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getIconBgColor(notification.type),
          }}
        >
          {getNotificationIcon(notification.type)}
        </Box>
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="body2"
            fontWeight={notification.read ? 'normal' : 'medium'}
            noWrap
          >
            {notification.title}
          </Typography>
        }
        secondary={
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.disabled" component="div" sx={{ mt: 0.5 }}>
              {formatRelativeTime(notification.createdAt)}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

export default NotificationItem;
