import { UserSummary } from './user.types';

/**
 * Activity action enumeration
 */
export enum ActivityAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  STATUS_CHANGE = 'status_change',
  COMMENT = 'comment',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

/**
 * Entity type enumeration
 */
export enum EntityType {
  USER = 'user',
  TEAM = 'team',
  TASK = 'task',
  TEAM_MEMBER = 'team_member',
}

/**
 * Activity log entity interface
 */
export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  userId: string;
  user?: UserSummary;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * Filter activity logs request DTO
 */
export interface FilterActivityLogsDto {
  action?: ActivityAction;
  entityType?: EntityType;
  entityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Activity statistics
 */
export interface ActivityStats {
  totalActivities: number;
  activitiesByAction: Record<ActivityAction, number>;
  activitiesByEntityType: Record<EntityType, number>;
  recentActivities: ActivityLog[];
  dailyActivityCount: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Get action display label
 */
export function getActionLabel(action: ActivityAction): string {
  const labels: Record<ActivityAction, string> = {
    [ActivityAction.CREATE]: 'Created',
    [ActivityAction.UPDATE]: 'Updated',
    [ActivityAction.DELETE]: 'Deleted',
    [ActivityAction.ASSIGN]: 'Assigned',
    [ActivityAction.UNASSIGN]: 'Unassigned',
    [ActivityAction.STATUS_CHANGE]: 'Status Changed',
    [ActivityAction.COMMENT]: 'Commented',
    [ActivityAction.LOGIN]: 'Logged In',
    [ActivityAction.LOGOUT]: 'Logged Out',
  };
  return labels[action];
}

/**
 * Get entity type display label
 */
export function getEntityTypeLabel(entityType: EntityType): string {
  const labels: Record<EntityType, string> = {
    [EntityType.USER]: 'User',
    [EntityType.TEAM]: 'Team',
    [EntityType.TASK]: 'Task',
    [EntityType.TEAM_MEMBER]: 'Team Member',
  };
  return labels[entityType];
}