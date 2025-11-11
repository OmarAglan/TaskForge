export enum ActivityAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',

  // Team actions
  TEAM_CREATE = 'team_create',
  TEAM_UPDATE = 'team_update',
  TEAM_DELETE = 'team_delete',
  TEAM_MEMBER_ADD = 'team_member_add',
  TEAM_MEMBER_REMOVE = 'team_member_remove',
  TEAM_MEMBER_ROLE_UPDATE = 'team_member_role_update',

  // Task actions
  TASK_CREATE = 'task_create',
  TASK_UPDATE = 'task_update',
  TASK_DELETE = 'task_delete',
  TASK_ASSIGN = 'task_assign',
  TASK_STATUS_CHANGE = 'task_status_change',
  TASK_PRIORITY_CHANGE = 'task_priority_change',

  // User actions
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
}