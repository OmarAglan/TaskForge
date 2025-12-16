import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  AvatarGroup,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExitToApp as LeaveIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { Team, TeamRole, TeamMember } from '../../types/team.types';
import { MemberRoleChip } from './MemberRoleChip';
import { getInitials } from '../../types/user.types';

export interface TeamCardProps {
  team: Team;
  userRole?: TeamRole;
  members?: TeamMember[];
  onView?: (team: Team) => void;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
  onLeave?: (team: Team) => void;
}

/**
 * Card component for displaying team information
 */
export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  userRole = TeamRole.MEMBER,
  members = [],
  onView,
  onEdit,
  onDelete,
  onLeave,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    handleMenuClose();
    action();
  };

  const canEdit = userRole === TeamRole.OWNER || userRole === TeamRole.ADMIN;
  const canDelete = userRole === TeamRole.OWNER;
  const canLeave = userRole !== TeamRole.OWNER;

  const displayMembers = members.slice(0, 5);
  const remainingMembers = (team.memberCount || members.length) - displayMembers.length;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea
        onClick={() => onView?.(team)}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header with title and menu */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h3"
                noWrap
                sx={{ fontWeight: 600 }}
              >
                {team.name}
              </Typography>
              <MemberRoleChip role={userRole} size="small" sx={{ mt: 0.5 }} />
            </Box>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              aria-label="team options"
              sx={{ ml: 1 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: 40,
            }}
          >
            {team.description || 'No description provided'}
          </Typography>

          {/* Footer with members and count */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
            {displayMembers.length > 0 ? (
              <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem' } }}>
                {displayMembers.map((member) => (
                  <Tooltip key={member.id} title={member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Team member'}>
                    <Avatar
                      src={member.user?.avatarUrl}
                      sx={{ bgcolor: 'primary.main' }}
                    >
                      {member.user ? getInitials(member.user) : '?'}
                    </Avatar>
                  </Tooltip>
                ))}
                {remainingMembers > 0 && (
                  <Avatar sx={{ bgcolor: 'grey.400' }}>
                    +{remainingMembers}
                  </Avatar>
                )}
              </AvatarGroup>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <GroupIcon fontSize="small" />
                <Typography variant="body2">
                  {team.memberCount || 0} members
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {onView && (
          <MenuItem onClick={() => handleAction(() => onView(team))}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Team</ListItemText>
          </MenuItem>
        )}
        {canEdit && onEdit && (
          <MenuItem onClick={() => handleAction(() => onEdit(team))}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Team</ListItemText>
          </MenuItem>
        )}
        {canLeave && onLeave && (
          <MenuItem onClick={() => handleAction(() => onLeave(team))}>
            <ListItemIcon>
              <LeaveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Leave Team</ListItemText>
          </MenuItem>
        )}
        {canDelete && onDelete && (
          <MenuItem onClick={() => handleAction(() => onDelete(team))} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Team</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default TeamCard;