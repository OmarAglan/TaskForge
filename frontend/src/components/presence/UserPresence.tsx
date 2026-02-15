import { Avatar, Box } from '@mui/material';
import React from 'react';
import type { UserSummary } from '../../types/user.types';
import { getInitials } from '../../utils/helpers';
import { OnlineIndicator } from './OnlineIndicator';

/**
 * UserPresence component - displays user avatar with online indicator
 */
interface UserPresenceProps {
    user: UserSummary;
    isOnline?: boolean;
    showIndicator?: boolean;
    size?: 'small' | 'medium';
}

export const UserPresence: React.FC<UserPresenceProps> = ({
    user,
    isOnline = false,
    showIndicator = true,
    size = 'medium',
}) => {
    const avatarSize = size === 'small' ? 24 : 36;
    const initials = getInitials(user.firstName, user.lastName);

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <Avatar
                sx={{
                    width: avatarSize,
                    height: avatarSize,
                    fontSize: size === 'small' ? '0.75rem' : '0.875rem',
                    bgcolor: 'primary.main',
                }}
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
            >
                {initials}
            </Avatar>
            {showIndicator && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                    }}
                >
                    <OnlineIndicator isOnline={isOnline} size={size === 'small' ? 'small' : 'medium'} />
                </Box>
            )}
        </Box>
    );
};

export default UserPresence;
