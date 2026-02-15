import {
    Info as InfoIcon,
    Notifications as NotificationsIcon,
    TaskAlt as TaskIcon,
    GroupAdd as TeamIcon,
} from '@mui/icons-material';
import {
    Badge,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Popover,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationType } from '../../types/notification.types';
import { formatRelativeTime } from '../../utils/helpers';

/**
 * NotificationBell component - displays a bell icon with unread count
 * and a dropdown with recent notifications
 */
export const NotificationBell: React.FC = () => {
    const navigate = useNavigate();
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification: any) => {
        // Mark as read
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        // Navigate based on notification type
        handleClose();
        if (notification.data?.taskId) {
            navigate(`/tasks/${notification.data.taskId}`);
        } else if (notification.data?.teamId) {
            navigate(`/teams/${notification.data.teamId}`);
        }
    };

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

    const isOpen = Boolean(anchorEl);

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleOpen}
                sx={{ mr: 1 }}
                aria-label={`${unreadCount} unread notifications`}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Popover
                open={isOpen}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 480,
                    },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography variant="h6">Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={markAllAsRead}>
                            Mark all read
                        </Button>
                    )}
                </Box>

                <Divider />

                {/* Notifications List */}
                {isLoading ? (
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No notifications yet</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {notifications.slice(0, 10).map((notification) => (
                            <ListItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    cursor: 'pointer',
                                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                                    '&:hover': {
                                        backgroundColor: 'action.selected',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    {getNotificationIcon(notification.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            fontWeight={notification.read ? 'normal' : 'medium'}
                                        >
                                            {notification.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="caption" color="text.secondary" component="span">
                                                {notification.message}
                                            </Typography>
                                            <br />
                                            <Typography variant="caption" color="text.disabled" component="span">
                                                {formatRelativeTime(notification.createdAt)}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                {notifications.length > 10 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                            <Button
                                size="small"
                                onClick={() => {
                                    handleClose();
                                    navigate('/notifications');
                                }}
                            >
                                View all notifications
                            </Button>
                        </Box>
                    </>
                )}
            </Popover>
        </>
    );
};

export default NotificationBell;
