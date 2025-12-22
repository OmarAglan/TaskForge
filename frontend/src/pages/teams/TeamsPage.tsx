import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TeamCard, TeamDialog } from '../../components/teams';
import { TeamCardSkeleton } from '../../components/skeletons';
import { EmptyState } from '../../components/shared';
import { ConfirmDialog } from '../../components/shared';
import { useTeams } from '../../hooks/useTeams';
import { useAuthStore } from '../../store/authStore';
import { useDebounce } from '../../hooks/useDebounce';
import { Team, TeamRole, CreateTeamDto, UpdateTeamDto } from '../../types/team.types';
import { toast } from '../../utils/toast';

/**
 * Main teams list page
 */
export const TeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    teams,
    isLoading,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  } = useTeams();

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load teams on mount
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Filter teams based on search
  const filteredTeams = teams.filter((team) => {
    const query = debouncedSearch.toLowerCase();
    return (
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query)
    );
  });

  // Get user's role in team
  const getUserRole = (team: Team): TeamRole => {
    if (team.ownerId === user?.id) return TeamRole.OWNER;
    // For now, default to member if not owner
    // In a real app, this would come from team members data
    return TeamRole.MEMBER;
  };

  const handleView = useCallback((team: Team) => {
    navigate(`/teams/${team.id}`);
  }, [navigate]);

  const handleEdit = useCallback((team: Team) => {
    setEditingTeam(team);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((team: Team) => {
    setTeamToDelete(team);
    setDeleteConfirmOpen(true);
  }, []);

  const handleLeave = useCallback(async (team: Team) => {
    // Leave team functionality would be implemented here
    toast.info('Leave team functionality coming soon');
  }, []);

  const handleCreateClick = () => {
    setEditingTeam(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTeam(undefined);
  };

  const handleDialogSuccess = (team: Team) => {
    handleDialogClose();
    if (editingTeam) {
      toast.success('Team updated successfully');
    } else {
      toast.success('Team created successfully');
    }
  };

  const handleSubmit = async (data: CreateTeamDto | UpdateTeamDto): Promise<Team> => {
    if (editingTeam) {
      return await updateTeam(editingTeam.id, data as UpdateTeamDto);
    } else {
      return await createTeam(data as CreateTeamDto);
    }
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTeam(teamToDelete.id);
      toast.success('Team deleted successfully');
      setDeleteConfirmOpen(false);
      setTeamToDelete(null);
    } catch (error) {
      toast.error('Failed to delete team');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setTeamToDelete(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Teams
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Create Team
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Teams Grid */}
      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <TeamCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No teams found' : 'No teams yet'}
          description={
            searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first team to start collaborating with others'
          }
          actionLabel={searchQuery ? undefined : 'Create Team'}
          onAction={searchQuery ? undefined : handleCreateClick}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} key={team.id}>
              <TeamCard
                team={team}
                userRole={getUserRole(team)}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLeave={handleLeave}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <TeamDialog
        open={dialogOpen}
        team={editingTeam}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Team"
        message={
          <>
            Are you sure you want to delete <strong>{teamToDelete?.name}</strong>?
            This action cannot be undone. All tasks and members will be removed.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        isLoading={isDeleting}
        showWarningIcon
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
};

export default TeamsPage;