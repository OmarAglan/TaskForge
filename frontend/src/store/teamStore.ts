import { create } from 'zustand';
import type { Team, TeamMember, CreateTeamDto, UpdateTeamDto, AddMemberDto, TeamRole } from '../types/team.types';
import * as teamsApi from '../api/teams.api';

interface TeamState {
  // State
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTeams: () => Promise<void>;
  fetchTeam: (id: string) => Promise<void>;
  selectTeam: (teamId: string) => Promise<void>;
  createTeam: (data: CreateTeamDto) => Promise<Team>;
  updateTeam: (id: string, data: UpdateTeamDto) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  fetchMembers: (teamId: string) => Promise<void>;
  addMember: (teamId: string, data: AddMemberDto) => Promise<TeamMember>;
  removeMember: (teamId: string, memberId: string) => Promise<void>;
  updateMemberRole: (teamId: string, memberId: string, role: TeamRole) => Promise<TeamMember>;
  clearCurrentTeam: () => void;
  clearError: () => void;
}

export const useTeamStore = create<TeamState>()((set, get) => ({
  // Initial state
  teams: [],
  currentTeam: null,
  members: [],
  isLoading: false,
  error: null,

  // Fetch all teams
  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const teams = await teamsApi.getTeams();
      set({ teams, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch teams';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Fetch single team
  fetchTeam: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const team = await teamsApi.getTeam(id);
      set({
        currentTeam: team,
        members: team.members || [],
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch team';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Select and load team
  selectTeam: async (teamId: string) => {
    const { teams } = get();
    const team = teams.find((t) => t.id === teamId);

    if (team) {
      set({ currentTeam: team });
    }

    // Fetch full team details including members
    await get().fetchTeam(teamId);
  },

  // Create team
  createTeam: async (data: CreateTeamDto) => {
    set({ isLoading: true, error: null });
    try {
      const team = await teamsApi.createTeam(data);
      set((state) => ({
        teams: [...state.teams, team],
        isLoading: false,
      }));
      return team;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create team';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Update team
  updateTeam: async (id: string, data: UpdateTeamDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTeam = await teamsApi.updateTeam(id, data);
      set((state) => ({
        teams: state.teams.map((t) => (t.id === id ? updatedTeam : t)),
        currentTeam: state.currentTeam?.id === id ? updatedTeam : state.currentTeam,
        isLoading: false,
      }));
      return updatedTeam;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update team';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Delete team
  deleteTeam: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await teamsApi.deleteTeam(id);
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== id),
        currentTeam: state.currentTeam?.id === id ? null : state.currentTeam,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete team';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Fetch team members
  fetchMembers: async (teamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const members = await teamsApi.getTeamMembers(teamId);
      set({ members, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch members';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Add member to team
  addMember: async (teamId: string, data: AddMemberDto) => {
    set({ isLoading: true, error: null });
    try {
      const member = await teamsApi.addTeamMember(teamId, data);
      set((state) => ({
        members: [...state.members, member],
        isLoading: false,
      }));
      return member;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add member';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Remove member from team
  removeMember: async (teamId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      await teamsApi.removeTeamMember(teamId, memberId);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove member';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (teamId: string, memberId: string, role: TeamRole) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMember = await teamsApi.updateMemberRole(teamId, memberId, { role });
      set((state) => ({
        members: state.members.map((m) => (m.id === memberId ? updatedMember : m)),
        isLoading: false,
      }));
      return updatedMember;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update member role';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Clear current team
  clearCurrentTeam: () => {
    set({ currentTeam: null, members: [] });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// Selectors
export const selectTeams = (state: TeamState) => state.teams;
export const selectCurrentTeam = (state: TeamState) => state.currentTeam;
export const selectMembers = (state: TeamState) => state.members;
export const selectIsLoading = (state: TeamState) => state.isLoading;
export const selectError = (state: TeamState) => state.error;