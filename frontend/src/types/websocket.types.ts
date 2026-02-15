import type { Task } from './task.types';
import type { Team } from './team.types';

export enum WebSocketEvents {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'authenticate',

  // Rooms
  JOIN_TEAM = 'join:team',
  LEAVE_TEAM = 'leave:team',

  // Tasks
  TASK_CREATED = 'task:created',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  TASK_ASSIGNED = 'task:assigned',
  TASK_STATUS_CHANGED = 'task:status_changed',
  TASK_COMMENT_ADDED = 'task:comment_added',

  // Teams
  TEAM_CREATED = 'team:created',
  TEAM_UPDATED = 'team:updated',
  TEAM_DELETED = 'team:deleted',
  TEAM_MEMBER_ADDED = 'team:member_added',
  TEAM_MEMBER_REMOVED = 'team:member_removed',
  TEAM_MEMBER_ROLE_CHANGED = 'team:member_role_changed',

  // Notifications
  NOTIFICATION_NEW = 'notification:new',
  NOTIFICATION_READ = 'notification:read',

  // Presence
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  USER_TYPING = 'user:typing',

  // Activity
  ACTIVITY_NEW = 'activity:new',

  // Errors
  ERROR = 'error',
}

export interface TaskEventPayload {
  taskId: string;
  task: Task;
  teamId: string;
  userId: string;
  action: string;
  changes?: Record<string, any>;
  oldStatus?: string;
  newStatus?: string;
  assigneeId?: string;
}

export interface TeamEventPayload {
  teamId: string;
  team: Team;
  userId: string;
  action: string;
  memberId?: string;
  memberRole?: string;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_MENTIONED'
  | 'TEAM_INVITE'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED';

export interface NotificationPayload {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  createdAt: string;
}

export interface PresencePayload {
  userId: string;
  at: string;
}

export interface ActivityPayload {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}