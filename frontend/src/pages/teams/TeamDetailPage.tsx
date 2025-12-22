import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TeamDialog,
  TeamStats,
  TeamMembersList,
  AddMemberDialog,
} from '../../components/teams';
import { EmptyState, ConfirmDialog } from '../../components/shared';
import { useTeams } from '../../hooks/useTeams';
import { useAuthStore } from '../../store/authStore';
import { Team, TeamRole, TeamMember, CreateTeamDto, UpdateTeamDto, AddMemberDto } from '../../types/team.types';
import { UserSummary } from '../../types/user.types';
import { toast } from '../../utils/toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Individual team detail page
 */
export const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentTeam,
    members,
    isLoading,
    loadTeam,
    updateTeam,
    addMember,
    removeMember,
    updateMemberRole,
    clearCurrentTeam,
  } = useTeams();

  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserSummary[]>([]);

  // Load team on mount
  useEffect(() => {
    if (id) {
      loadTeam(id);
    }
    return () => {
      clearCurrentTeam();
    };
  }, [id, loadTeam, clearCurrentTeam]);

  // Get current user's role in the team
  const getCurrentUserRole = (): TeamRole => {
    if (currentTeam?.ownerId === user?.id) return TeamRole.OWNER;
    const memberRecord = members.find((m) => m.userId === user?.id);
    return memberRecord?.role || TeamRole.MEMBER;
  };

  const currentUserRole = getCurrentUserRole();

  // Calculate team stats
  const teamStats = {
    totalTasks: 0, // Would be fetched from API
    completedTasks: 0,
    inProgressTasks: 0,
    memberCount: members.length || currentTeam?.memberCount || 0,
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/teams');
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    toast.success('Team updated successfully');
  };

  const handleEditSubmit = async (data: CreateTeamDto | UpdateTeamDto): Promise<Team> => {
    if (!currentTeam) throw new Error('No team to update');
    return await updateTeam(currentTeam.id, data as UpdateTeamDto);
  };

  const handleAddMemberClick = () => {
    setAddMemberDialogOpen(true);
  };

  const handleAddMemberClose = () => {
    setAddMemberDialogOpen(false);
  };

  const handleAddMember = async (data: AddMemberDto) => {
    if (!currentTeam) return;
    await addMember(currentTeam.id, data);
    toast.success('Member added successfully');
    handleAddMemberClose();
  };

  const handleRemoveMember = (member: TeamMember) => {
    setMemberToRemove(member);
    setRemoveConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!currentTeam || !memberToRemove) return;

    setIsRemoving(true);
    try {
      await removeMember(currentTeam.id, memberToRemove.id);
      toast.success('Member removed successfully');
      setRemoveConfirmOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      toast.error('Failed to remove member');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCancelRemove = () => {
    setRemoveConfirmOpen(false);
    setMemberToRemove(null);
  };

  const handleChangeRole = async (member: TeamMember, newRole: TeamRole) => {
    if (!currentTeam) return;
    try {
      await updateMemberRole(currentTeam.id, member.id, newRole);
      toast.success('Member role updated');
    } catch (error) {
      toast.error('Failed to update member role');
    }
  };

  const handleSearchUsers = useCallback((query: string) => {
    // Would fetch users from API based on query
    // For now, just set empty array
    setAvailableUsers([]);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentTeam) {
    return (
      <EmptyState
        title="Team not found"
        description="The team you're looking for doesn't exist or you don't have access to it."
        actionLabel="Back to Teams"
        onAction={handleBack}
      />
    );
  }

  const canEdit = currentUserRole === TeamRole.OWNER || currentUserRole === TeamRole.ADMIN;

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/teams" underline="hover" color="inherit">
          Teams
        </Link>
        <Typography color="text.primary">{currentTeam.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mt: 0.5 }}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            {currentTeam.name}
          </Typography>
          {currentTeam.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {currentTeam.description}
            </Typography>
          )}
        </Box>
        {canEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
          >
            Edit Team
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Box sx={{ mb: 3 }}>
        <TeamStats stats={teamStats} isLoading={isLoading} />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="team tabs">
          <Tab label="Overview" id="team-tab-0" aria-controls="team-tabpanel-0" />
          <Tab label="Members" id="team-tab-1" aria-controls="team-tabpanel-1" />
          <Tab label="Tasks" id="team-tab-2" aria-controls="team-tabpanel-2" />
          <Tab label="Activity" id="team-tab-3" aria-controls="team-tabpanel-3" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <EmptyState
          title="No recent activity"
          description="Team activity will appear here once members start working on tasks."
          size="small"
        />
      </TabPanel>

      {/* Members Tab */}
      <TabPanel value={tabValue} index={1}>
        <TeamMembersList
          members={members}
          currentUserId={user?.id || ''}
          currentUserRole={currentUserRole}
          isLoading={isLoading}
          onAddMember={handleAddMemberClick}
          onRemoveMember={handleRemoveMember}
          onChangeRole={handleChangeRole}
        />
      </TabPanel>

      {/* Tasks Tab */}
      <TabPanel value={tabValue} index={2}>
        <EmptyState
          title="No tasks yet"
          description="Create tasks for this team to start tracking work."
          actionLabel="Create Task"
          onAction={() => navigate(`/tasks/new?teamId=${currentTeam.id}`)}
        />
      </TabPanel>

      {/* Activity Tab */}
      <TabPanel value={tabValue} index={3}>
        <EmptyState
          title="Activity log"
          description="Detailed activity history will be shown here."
          size="small"
        />
      </TabPanel>

      {/* Edit Dialog */}
      <TeamDialog
        open={editDialogOpen}
        team={currentTeam}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
        onSubmit={handleEditSubmit}
      />

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addMemberDialogOpen}
        teamId={currentTeam.id}
        availableUsers={availableUsers}
        onClose={handleAddMemberClose}
        onAdd={handleAddMember}
        onSearchUsers={handleSearchUsers}
      />

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        open={removeConfirmOpen}
        title="Remove Member"
        message={
          <>
            Are you sure you want to remove{' '}
            <strong>
              {memberToRemove?.user
                ? `${memberToRemove.user.firstName} ${memberToRemove.user.lastName}`
                : 'this member'}
            </strong>{' '}
            from the team?
          </>
        }
        confirmText="Remove"
        cancelText="Cancel"
        confirmColor="error"
        isLoading={isRemoving}
        showWarningIcon
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </Box>
  );
};

export default TeamDetailPage;