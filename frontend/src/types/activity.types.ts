import { UserSummary } from './user.types';

/**
 * Backend activity action values
 */
export type ActivityAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'password_change'
  | 'team_create'
  | 'team_update'
  | 'team_delete'
  | 'team_member_add'
  | 'team_member_remove'
  | 'team_member_role_update'
  | 'task_create'
  | 'task_update'
  | 'task_delete'
  | 'task_assign'
  | 'task_status_change'
  | 'task_priority_change'
  | 'user_update'
  | 'user_delete';

export type EntityType = 'user' | 'team' | 'task' | 'team_member';

/**
 * Activity log entity interface
 */
export interface ActivityLog {
  id: string;
  action: ActivityAction | string;
  entityType: EntityType | string | null;
  entityId: string | null;
  userId: string | null;
  user?: UserSummary | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
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
 * Activity statistics (backend shape)
 */
export interface ActivityStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByEntityType: Record<string, number>;
  recentActivity: ActivityLog[];
  mostActiveUsers: Array<{ userId: string; actionCount: number }>;
}

export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    login: 'Logged In',
    logout: 'Logged Out',
    register: 'Registered',
    password_change: 'Changed Password',
    team_create: 'Created Team',
    team_update: 'Updated Team',
    team_delete: 'Deleted Team',
    team_member_add: 'Added Team Member',
    team_member_remove: 'Removed Team Member',
    team_member_role_update: 'Updated Member Role',
    task_create: 'Created Task',
    task_update: 'Updated Task',
    task_delete: 'Deleted Task',
    task_assign: 'Assigned Task',
    task_status_change: 'Changed Task Status',
    task_priority_change: 'Changed Task Priority',
    user_update: 'Updated Profile',
    user_delete: 'Deleted User',
  };

  return labels[action] ?? action.replace(/_/g, ' ');
}

export function getEntityTypeLabel(entityType: string): string {
  const labels: Record<string, string> = {
    user: 'User',
    team: 'Team',
    task: 'Task',
    team_member: 'Team Member',
  };

  return labels[entityType] ?? entityType;
}
