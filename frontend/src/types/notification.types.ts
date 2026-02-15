export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_MENTIONED = 'TASK_MENTIONED',
  TEAM_INVITE = 'TEAM_INVITE',
  TEAM_MEMBER_ADDED = 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED = 'TEAM_MEMBER_REMOVED',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any> | null;
  read: boolean;
  createdAt: string; // ISO string (serialized Date from backend)
  readAt: string | null; // ISO string
}