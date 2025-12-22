import React from 'react';
import { Avatar, Tooltip, Box, Typography, IconButton } from '@mui/material';
import { PersonAdd as AssignIcon } from '@mui/icons-material';
import { UserSummary, getFullName, getInitials } from '../../types/user.types';

export interface TaskAssigneeAvatarProps {
  user?: UserSummary | null;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  onReassign?: () => void;
  canReassign?: boolean;
}

/**
 * Avatar component for displaying task assignee
 */
export const TaskAssigneeAvatar: React.FC<TaskAssigneeAvatarProps> = ({
  user,
  size = 'medium',
  showName = false,
  onReassign,
  canReassign = false,
}) => {
  const avatarSize = {
    small: 24,
    medium: 32,
    large: 40,
  }[size];

  const fontSize = {
    small: '0.65rem',
    medium: '0.75rem',
    large: '0.875rem',
  }[size];

  if (!user) {
    return (
      <Tooltip title={canReassign ? 'Assign user' : 'Unassigned'}>
        {canReassign && onReassign ? (
          <IconButton
            size="small"
            onClick={onReassign}
            sx={{
              width: avatarSize,
              height: avatarSize,
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <AssignIcon sx={{ fontSize: avatarSize * 0.6 }} color="action" />
          </IconButton>
        ) : (
          <Avatar
            sx={{
              width: avatarSize,
              height: avatarSize,
              fontSize,
              bgcolor: 'grey.300',
              color: 'grey.600',
            }}
          >
            ?
          </Avatar>
        )}
      </Tooltip>
    );
  }

  const fullName = getFullName(user);
  const initials = getInitials(user);

  const avatar = (
    <Tooltip title={fullName}>
      <Avatar
        src={user.avatarUrl}
        sx={{
          width: avatarSize,
          height: avatarSize,
          fontSize,
          cursor: canReassign && onReassign ? 'pointer' : 'default',
        }}
        onClick={canReassign && onReassign ? onReassign : undefined}
      >
        {initials}
      </Avatar>
    </Tooltip>
  );

  if (showName) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {avatar}
        <Typography variant="body2" noWrap>
          {fullName}
        </Typography>
      </Box>
    );
  }

  return avatar;
};

export default TaskAssigneeAvatar;