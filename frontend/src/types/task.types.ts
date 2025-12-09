import { UserSummary } from './user.types';
import { TeamSummary } from './team.types';

/**
 * Task status enumeration
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Task priority enumeration
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Task entity interface
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  teamId: string;
  team?: TeamSummary;
  assigneeId?: string;
  assignee?: UserSummary;
  createdById: string;
  createdBy?: UserSummary;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create task request DTO
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  teamId: string;
  assigneeId?: string;
}

/**
 * Update task request DTO
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
}

/**
 * Filter tasks request DTO
 */
export interface FilterTasksDto {
  teamId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Task summary for display in lists
 */
export interface TaskSummary {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: UserSummary;
}

/**
 * Task statistics
 */
export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}

/**
 * Get status display label
 */
export function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.IN_REVIEW]: 'In Review',
    [TaskStatus.COMPLETED]: 'Completed',
    [TaskStatus.CANCELLED]: 'Cancelled',
  };
  return labels[status];
}

/**
 * Get priority display label
 */
export function getPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'Low',
    [TaskPriority.MEDIUM]: 'Medium',
    [TaskPriority.HIGH]: 'High',
    [TaskPriority.URGENT]: 'Urgent',
  };
  return labels[priority];
}

/**
 * Get status color for MUI
 */
export function getStatusColor(status: TaskStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  const colors: Record<TaskStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    [TaskStatus.TODO]: 'default',
    [TaskStatus.IN_PROGRESS]: 'primary',
    [TaskStatus.IN_REVIEW]: 'info',
    [TaskStatus.COMPLETED]: 'success',
    [TaskStatus.CANCELLED]: 'error',
  };
  return colors[status];
}

/**
 * Get priority color for MUI
 */
export function getPriorityColor(priority: TaskPriority): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  const colors: Record<TaskPriority, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    [TaskPriority.LOW]: 'default',
    [TaskPriority.MEDIUM]: 'info',
    [TaskPriority.HIGH]: 'warning',
    [TaskPriority.URGENT]: 'error',
  };
  return colors[priority];
}