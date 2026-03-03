import type { BackendPaginatedResponse, PaginatedResponse } from '../types/api.types';
import type {
  CreateTaskDto,
  FilterTasksDto,
  Task,
  TaskStatus,
  UpdateTaskDto,
} from '../types/task.types';
import { del, get, patch, post } from './client';

export interface BackendTask {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Task['priority'];
  dueDate?: string | null;
  teamId: string;
  team?: Task['team'];
  assignedToId?: string | null;
  assignedTo?: Task['assignee'];
  createdById: string;
  createdBy?: Task['createdBy'];
  createdAt: string;
  updatedAt: string;
}

export function normalizeTask(task: BackendTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ?? undefined,
    teamId: task.teamId,
    team: task.team,
    assigneeId: task.assignedToId ?? undefined,
    assignee: task.assignedTo,
    createdById: task.createdById,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function normalizePaginated(response: BackendPaginatedResponse<BackendTask>): PaginatedResponse<Task> {
  return {
    data: (response.items ?? []).map(normalizeTask),
    meta: {
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
      hasNextPage: response.page < response.totalPages,
      hasPreviousPage: response.page > 1,
    },
  };
}

function mapTaskFilters(filters?: FilterTasksDto): Record<string, unknown> | undefined {
  if (!filters) {
    return undefined;
  }

  const mappedFilters: Record<string, unknown> = {
    teamId: filters.teamId,
    status: filters.status,
    priority: filters.priority,
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  if (filters.assigneeId !== undefined) {
    mappedFilters.assignedToId = filters.assigneeId || null;
  }

  return mappedFilters;
}

function mapCreateTaskPayload(data: CreateTaskDto): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
    teamId: data.teamId,
  };

  if (data.assigneeId !== undefined) {
    payload.assignedToId = data.assigneeId || null;
  }

  return payload;
}

function mapUpdateTaskPayload(data: UpdateTaskDto): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
  };

  if (data.assigneeId !== undefined) {
    payload.assignedToId = data.assigneeId || null;
  }

  return payload;
}

/**
 * Get all tasks with optional filters
 */
export async function getTasks(filters?: FilterTasksDto): Promise<PaginatedResponse<Task>> {
  const response = await get<BackendPaginatedResponse<BackendTask>>('/tasks', mapTaskFilters(filters));
  return normalizePaginated(response);
}

/**
 * Get task by ID
 */
export async function getTask(id: string): Promise<Task> {
  const task = await get<BackendTask>(`/tasks/${id}`);
  return normalizeTask(task);
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskDto): Promise<Task> {
  const task = await post<BackendTask>('/tasks', mapCreateTaskPayload(data));
  return normalizeTask(task);
}

/**
 * Update task
 */
export async function updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
  const task = await patch<BackendTask>(`/tasks/${id}`, mapUpdateTaskPayload(data));
  return normalizeTask(task);
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
  const task = await patch<BackendTask>(`/tasks/${id}/assign`, { assignedToId: assigneeId });
  return normalizeTask(task);
}

/**
 * Unassign task
 */
export async function unassignTask(id: string): Promise<Task> {
  const task = await patch<BackendTask>(`/tasks/${id}/unassign`);
  return normalizeTask(task);
}

/**
 * Update task status
 */
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const task = await patch<BackendTask>(`/tasks/${id}/status`, { status });
  return normalizeTask(task);
}

/**
 * Get my tasks (assigned to current user)
 */
export async function getMyTasks(filters?: Omit<FilterTasksDto, 'assigneeId'>): Promise<PaginatedResponse<Task>> {
  const response = await get<BackendPaginatedResponse<BackendTask>>(
    '/tasks/me',
    mapTaskFilters(filters as FilterTasksDto),
  );
  return normalizePaginated(response);
}

/**
 * Get team tasks
 */
export async function getTeamTasks(
  teamId: string,
  filters?: Omit<FilterTasksDto, 'teamId'>,
): Promise<PaginatedResponse<Task>> {
  const response = await get<BackendPaginatedResponse<BackendTask>>(
    `/teams/${teamId}/tasks`,
    mapTaskFilters(filters as FilterTasksDto),
  );
  return normalizePaginated(response);
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(): Promise<Task[]> {
  const tasks = await get<BackendTask[]>('/tasks/overdue');
  return tasks.map(normalizeTask);
}

/**
 * Get tasks due today
 */
export async function getTasksDueToday(): Promise<Task[]> {
  const tasks = await get<BackendTask[]>('/tasks/due-today');
  return tasks.map(normalizeTask);
}

/**
 * Get tasks due this week
 */
export async function getTasksDueThisWeek(): Promise<Task[]> {
  const tasks = await get<BackendTask[]>('/tasks/due-this-week');
  return tasks.map(normalizeTask);
}
