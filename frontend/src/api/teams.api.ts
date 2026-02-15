import type {
  AddMemberDto,
  CreateTeamDto,
  Team,
  TeamMember,
  TeamWithMembers,
  UpdateMemberRoleDto,
  UpdateTeamDto,
} from '../types/team.types';
import { del, get, patch, post } from './client';

/**
 * Get all teams for the current user
 */
export async function getTeams(): Promise<Team[]> {
  return get<Team[]>('/teams');
}

/**
 * Get team by ID
 */
export async function getTeam(id: string): Promise<TeamWithMembers> {
  return get<TeamWithMembers>(`/teams/${id}`);
}

/**
 * Create a new team
 */
export async function createTeam(data: CreateTeamDto): Promise<Team> {
  return post<Team>('/teams', data);
}

/**
 * Update team
 */
export async function updateTeam(id: string, data: UpdateTeamDto): Promise<Team> {
  return patch<Team>(`/teams/${id}`, data);
}

/**
 * Delete team
 */
export async function deleteTeam(id: string): Promise<void> {
  return del<void>(`/teams/${id}`);
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return get<TeamMember[]>(`/teams/${teamId}/members`);
}

/**
 * Add member to team
 */
export async function addTeamMember(teamId: string, data: AddMemberDto): Promise<TeamMember> {
  return post<TeamMember>(`/teams/${teamId}/members`, data);
}

/**
 * Remove member from team
 */
export async function removeTeamMember(teamId: string, memberId: string): Promise<void> {
  return del<void>(`/teams/${teamId}/members/${memberId}`);
}

/**
 * Update team member role
 */
export async function updateMemberRole(
  teamId: string,
  memberId: string,
  data: UpdateMemberRoleDto
): Promise<TeamMember> {
  return patch<TeamMember>(`/teams/${teamId}/members/${memberId}`, data);
}

/**
 * Leave team
 */
export async function leaveTeam(teamId: string): Promise<void> {
  return post<void>(`/teams/${teamId}/leave`);
}

/**
 * Get my teams (teams user is a member of)
 */
export async function getMyTeams(): Promise<Team[]> {
  return get<Team[]>('/teams/my');
}