import { UserSummary } from './user.types';

/**
 * Team role enumeration
 */
export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

/**
 * Team entity interface
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner?: UserSummary;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Team member entity interface
 */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  user?: UserSummary;
  joinedAt: string;
}

/**
 * Create team request DTO
 */
export interface CreateTeamDto {
  name: string;
  description?: string;
}

/**
 * Update team request DTO
 */
export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

/**
 * Add team member request DTO
 */
export interface AddMemberDto {
  userId: string;
  role?: TeamRole;
}

/**
 * Update member role request DTO
 */
export interface UpdateMemberRoleDto {
  role: TeamRole;
}

/**
 * Team with members
 */
export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

/**
 * Team summary for display in lists
 */
export interface TeamSummary {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
}