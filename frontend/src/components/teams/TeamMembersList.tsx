import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PersonRemove as RemoveIcon,
  AdminPanelSettings as AdminIcon,
  Person as MemberIcon,
  PersonAdd as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { TeamMember, TeamRole } from '../../types/team.types';
import { getFullName, getInitials } from '../../types/user.types';
import { MemberRoleChip } from './MemberRoleChip';
import { EmptyState } from '../shared/EmptyState';
import { TableSkeleton } from '../skeletons/TableSkeleton';

export interface TeamMembersListProps {
  members: TeamMember[];
  currentUserId: string;
  currentUserRole: TeamRole;
  isLoading?: boolean;
  onAddMember?: () => void;
  onRemoveMember?: (member: TeamMember) => void;
  onChangeRole?: (member: TeamMember, newRole: TeamRole) => void;
}

/**
 * List component for displaying and managing team members
 */
export const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  currentUserId,
  currentUserRole,
  isLoading = false,
  onAddMember,
  onRemoveMember,
  onChangeRole,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const canManageMembers = currentUserRole === TeamRole.OWNER || currentUserRole === TeamRole.ADMIN;
  const isOwner = currentUserRole === TeamRole.OWNER;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: TeamMember) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleRemove = () => {
    if (selectedMember && onRemoveMember) {
      onRemoveMember(selectedMember);
    }
    handleMenuClose();
  };

  const handleChangeRole = (newRole: TeamRole) => {
    if (selectedMember && onChangeRole) {
      onChangeRole(selectedMember, newRole);
    }
    handleMenuClose();
  };

  const canModifyMember = (member: TeamMember): boolean => {
    // Cannot modify owner
    if (member.role === TeamRole.OWNER) return false;
    // Only owner can modify admins
    if (member.role === TeamRole.ADMIN && !isOwner) return false;
    // Cannot modify self
    if (member.userId === currentUserId) return false;
    return canManageMembers;
  };

  if (isLoading) {
    return <TableSkeleton rows={5} columns={4} />;
  }

  if (members.length === 0) {
    return (
      <EmptyState
        title="No team members"
        description="This team doesn't have any members yet."
        actionLabel={canManageMembers ? 'Add Member' : undefined}
        onAction={canManageMembers ? onAddMember : undefined}
      />
    );
  }

  return (
    <Box>
      {canManageMembers && onAddMember && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddMember}
          >
            Add Member
          </Button>
        </Box>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
              {canManageMembers && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={member.user?.avatarUrl}
                      sx={{ width: 40, height: 40 }}
                    >
                      {member.user ? getInitials(member.user) : '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {member.user ? getFullName(member.user) : 'Unknown User'}
                        {member.userId === currentUserId && (
                          <Chip
                            label="You"
                            size="small"
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.user?.email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <MemberRoleChip role={member.role} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                  </Typography>
                </TableCell>
                {canManageMembers && (
                  <TableCell align="right">
                    {canModifyMember(member) && (
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, member)}
                          aria-label="member actions"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {selectedMember && selectedMember.role !== TeamRole.ADMIN && isOwner && (
          <MenuItem onClick={() => handleChangeRole(TeamRole.ADMIN)}>
            <ListItemIcon>
              <AdminIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Make Admin</ListItemText>
          </MenuItem>
        )}
        {selectedMember && selectedMember.role === TeamRole.ADMIN && isOwner && (
          <MenuItem onClick={() => handleChangeRole(TeamRole.MEMBER)}>
            <ListItemIcon>
              <MemberIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Remove Admin</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <RemoveIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Remove from Team</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TeamMembersList;