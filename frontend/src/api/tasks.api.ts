import { get, post, put, patch, del } from './client';
import type { Task, CreateTaskDto, UpdateTaskDto, FilterTasksDto, TaskStatus } from '../types/task.types';
import type { PaginatedResponse } from '../types/api.types';

/**
 * Get all tasks with optional filters
 */
export async function getTasks(filters?: FilterTasksDto): Promise<PaginatedResponse<Task>> {
  return get<PaginatedResponse<Task>>('/tasks', filters as Record<string, unknown>);
}

/**
 * Get task by ID
 */
export async function getTask(id: string): Promise<Task> {
  return get<Task>(`/tasks/${id}`);
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskDto): Promise<Task> {
  return post<Task>('/tasks', data);
}

/**
 * Update task
 */
export async function updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
  return put<Task>(`/tasks/${id}`, data);
}

/**
 * Delete task
 */
export async function deleteTask(id: string): Promise<void> {
  return del<void>(`/tasks/${id}`);
}

/**
 * Assign task to a user
 */
export async function assignTask(id: string, assigneeId: string): Promise<Task> {
  return patch<Task>(`/tasks/${id}/assign`, { assigneeId });
}

/**
 * Unassign task
 */
export async function unassignTask(id: string): Promise<Task> {
  return patch<Task>(`/tasks/${id}/unassign`);
}

/**
 * Update task status
 */
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return patch<Task>(`/tasks/${id}/status`, { status });
}

/**
 * Get my tasks (assigned to current user)
 */
export async function getMyTasks(filters?: Omit<FilterTasksDto, 'assigneeId'>): Promise<PaginatedResponse<Task>> {
  return get<PaginatedResponse<Task>>('/tasks/me', filters as Record<string, unknown>);
}

/**
 * Get team tasks
 */
export async function getTeamTasks(
  teamId: string,
  filters?: Omit<FilterTasksDto, 'teamId'>
): Promise<PaginatedResponse<Task>> {
  return get<PaginatedResponse<Task>>(`/teams/${teamId}/tasks`, filters as Record<string, unknown>);
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(): Promise<Task[]> {
  return get<Task[]>('/tasks/overdue');
}

/**
 * Get tasks due today
 */
export async function getTasksDueToday(): Promise<Task[]> {
  return get<Task[]>('/tasks/due-today');
}

/**
 * Get tasks due this week
 */
export async function getTasksDueThisWeek(): Promise<Task[]> {
  return get<Task[]>('/tasks/due-this-week');
}