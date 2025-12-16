import { useCallback, useEffect } from 'react';
import { useTeamStore } from '../store/teamStore';
import type { CreateTeamDto, UpdateTeamDto, AddMemberDto, TeamRole } from '../types/team.types';
import { toast } from '../utils/toast';

/**
 * Hook for managing teams
 */
export function useTeams() {
  const {
    teams,
    currentTeam,
    members,
    isLoading,
    error,
    fetchTeams,
    fetchTeam,
    selectTeam,
    createTeam: storeCreateTeam,
    updateTeam: storeUpdateTeam,
    deleteTeam: storeDeleteTeam,
    fetchMembers,
    addMember: storeAddMember,
    removeMember: storeRemoveMember,
    updateMemberRole: storeUpdateMemberRole,
    clearCurrentTeam,
    clearError,
  } = useTeamStore();

  // Fetch teams on mount
  const loadTeams = useCallback(async () => {
    try {
      await fetchTeams();
    } catch (err) {
      toast.error('Failed to load teams');
    }
  }, [fetchTeams]);

  // Load specific team
  const loadTeam = useCallback(
    async (id: string) => {
      try {
        await fetchTeam(id);
      } catch (err) {
        toast.error('Failed to load team details');
      }
    },
    [fetchTeam]
  );

  // Create team with toast feedback
  const createTeam = useCallback(
    async (data: CreateTeamDto) => {
      try {
        const team = await storeCreateTeam(data);
        toast.success('Team created successfully');
        return team;
      } catch (err) {
        toast.error('Failed to create team');
        throw err;
      }
    },
    [storeCreateTeam]
  );

  // Update team with toast feedback
  const updateTeam = useCallback(
    async (id: string, data: UpdateTeamDto) => {
      try {
        const team = await storeUpdateTeam(id, data);
        toast.success('Team updated successfully');
        return team;
      } catch (err) {
        toast.error('Failed to update team');
        throw err;
      }
    },
    [storeUpdateTeam]
  );

  // Delete team with toast feedback
  const deleteTeam = useCallback(
    async (id: string) => {
      try {
        await storeDeleteTeam(id);
        toast.success('Team deleted successfully');
      } catch (err) {
        toast.error('Failed to delete team');
        throw err;
      }
    },
    [storeDeleteTeam]
  );

  // Load team members
  const loadMembers = useCallback(
    async (teamId: string) => {
      try {
        await fetchMembers(teamId);
      } catch (err) {
        toast.error('Failed to load team members');
      }
    },
    [fetchMembers]
  );

  // Add member with toast feedback
  const addMember = useCallback(
    async (teamId: string, data: AddMemberDto) => {
      try {
        const member = await storeAddMember(teamId, data);
        toast.success('Member added successfully');
        return member;
      } catch (err) {
        toast.error('Failed to add member');
        throw err;
      }
    },
    [storeAddMember]
  );

  // Remove member with toast feedback
  const removeMember = useCallback(
    async (teamId: string, memberId: string) => {
      try {
        await storeRemoveMember(teamId, memberId);
        toast.success('Member removed successfully');
      } catch (err) {
        toast.error('Failed to remove member');
        throw err;
      }
    },
    [storeRemoveMember]
  );

  // Update member role with toast feedback
  const updateMemberRole = useCallback(
    async (teamId: string, memberId: string, role: TeamRole) => {
      try {
        const member = await storeUpdateMemberRole(teamId, memberId, role);
        toast.success('Member role updated successfully');
        return member;
      } catch (err) {
        toast.error('Failed to update member role');
        throw err;
      }
    },
    [storeUpdateMemberRole]
  );

  return {
    // State
    teams,
    currentTeam,
    members,
    isLoading,
    error,

    // Actions
    loadTeams,
    loadTeam,
    selectTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    loadMembers,
    addMember,
    removeMember,
    updateMemberRole,
    clearCurrentTeam,
    clearError,
  };
}

/**
 * Hook to load teams on component mount
 */
export function useTeamsLoader() {
  const { loadTeams, teams, isLoading, error } = useTeams();

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return { teams, isLoading, error };
}

export default useTeams;