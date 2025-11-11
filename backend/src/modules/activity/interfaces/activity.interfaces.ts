import { ActivityLog } from '../entities/activity-log.entity';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ActivityStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByEntityType: Record<string, number>;
  recentActivity: ActivityLog[];
  mostActiveUsers: { userId: string; actionCount: number }[];
}