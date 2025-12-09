import { get } from './client';
import type { ActivityLog, FilterActivityLogsDto, ActivityStats } from '../types/activity.types';
import type { PaginatedResponse } from '../types/api.types';

/**
 * Get activity logs with optional filters
 */
export async function getActivityLogs(
  filters?: FilterActivityLogsDto
): Promise<PaginatedResponse<ActivityLog>> {
  return get<PaginatedResponse<ActivityLog>>('/activity', filters as Record<string, unknown>);
}

/**
 * Get my activity logs
 */
export async function getMyActivities(
  filters?: Omit<FilterActivityLogsDto, 'userId'>
): Promise<PaginatedResponse<ActivityLog>> {
  return get<PaginatedResponse<ActivityLog>>('/activity/my', filters as Record<string, unknown>);
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limit: number = 10): Promise<ActivityLog[]> {
  return get<ActivityLog[]>('/activity/recent', { limit });
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
  entityType: string,
  entityId: string,
  filters?: Omit<FilterActivityLogsDto, 'entityType' | 'entityId'>
): Promise<PaginatedResponse<ActivityLog>> {
  return get<PaginatedResponse<ActivityLog>>(
    `/activity/entity/${entityType}/${entityId}`,
    filters as Record<string, unknown>
  );
}

/**
 * Get team activity logs
 */
export async function getTeamActivities(
  teamId: string,
  filters?: Omit<FilterActivityLogsDto, 'entityId'>
): Promise<PaginatedResponse<ActivityLog>> {
  return get<PaginatedResponse<ActivityLog>>(
    `/teams/${teamId}/activities`,
    filters as Record<string, unknown>
  );
}