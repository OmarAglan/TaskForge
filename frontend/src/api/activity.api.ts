import type { PaginatedResponse } from '../types/api.types';
import type {
  ActivityLog,
  ActivityStats,
  EntityType,
  FilterActivityLogsDto,
} from '../types/activity.types';
import { get, post } from './client';

interface BackendActivityLog extends Omit<ActivityLog, 'createdAt'> {
  createdAt: string;
}

interface BackendActivityPaginatedResponse {
  data: BackendActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

function normalizeActivityLog(log: BackendActivityLog): ActivityLog {
  return {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    userId: log.userId,
    user: log.user ?? undefined,
    metadata: log.metadata ?? undefined,
    ipAddress: log.ipAddress ?? undefined,
    userAgent: log.userAgent ?? undefined,
    createdAt: log.createdAt,
  };
}

function normalizePaginatedActivities(
  response: BackendActivityPaginatedResponse,
): PaginatedResponse<ActivityLog> {
  return {
    data: (response.data ?? []).map(normalizeActivityLog),
    meta: {
      page: response.pagination.page,
      limit: response.pagination.limit,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages,
      hasNextPage: response.pagination.hasNext,
      hasPreviousPage: response.pagination.hasPrev,
    },
  };
}

/**
 * Get activity logs with optional filters (admin)
 */
export async function getActivityLogs(
  filters?: FilterActivityLogsDto,
): Promise<PaginatedResponse<ActivityLog>> {
  const response = await get<BackendActivityPaginatedResponse>(
    '/activity',
    filters as Record<string, unknown>,
  );
  return normalizePaginatedActivities(response);
}

/**
 * Get current user's activity logs
 */
export async function getMyActivities(
  filters?: Omit<FilterActivityLogsDto, 'userId'>,
): Promise<PaginatedResponse<ActivityLog>> {
  const response = await get<BackendActivityPaginatedResponse>(
    '/activity/me',
    filters as Record<string, unknown>,
  );
  return normalizePaginatedActivities(response);
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit: number = 10): Promise<ActivityLog[]> {
  const response = await get<BackendActivityLog[]>('/activity/recent', { limit });
  return response.map(normalizeActivityLog);
}

/**
 * Get activity statistics
 */
export async function getActivityStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ActivityStats> {
  return get<ActivityStats>('/activity/stats', params as Record<string, unknown>);
}

/**
 * Get entity activity logs
 */
export async function getEntityActivities(
  entityType: EntityType,
  entityId: string,
  filters?: Omit<FilterActivityLogsDto, 'entityType' | 'entityId'>,
): Promise<PaginatedResponse<ActivityLog>> {
  const response = await get<BackendActivityPaginatedResponse>(
    `/activity/entity/${entityType}/${entityId}`,
    filters as Record<string, unknown>,
  );
  return normalizePaginatedActivities(response);
}

/**
 * Get team activity logs
 */
export async function getTeamActivities(
  teamId: string,
  filters?: Omit<FilterActivityLogsDto, 'entityId'>,
): Promise<PaginatedResponse<ActivityLog>> {
  const response = await get<BackendActivityPaginatedResponse>(
    `/activity/team/${teamId}`,
    filters as Record<string, unknown>,
  );
  return normalizePaginatedActivities(response);
}

/**
 * Add comment to task activity feed
 */
export async function addTaskComment(taskId: string, comment: string): Promise<ActivityLog> {
  const response = await post<BackendActivityLog>(`/tasks/${taskId}/comments`, { comment });
  return normalizeActivityLog(response);
}
