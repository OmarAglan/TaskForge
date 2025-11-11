import { ActivityLog } from '../entities/activity-log.entity';
import { ActivityAction } from '../enums/activity-action.enum';
import { EntityType } from '../enums/entity-type.enum';

/**
 * Get count of actions grouped by action type
 */
export function getActionCounts(
  logs: ActivityLog[],
): Record<string, number> {
  const counts: Record<string, number> = {};

  logs.forEach((log) => {
    const action = log.action;
    counts[action] = (counts[action] || 0) + 1;
  });

  return counts;
}

/**
 * Group activity logs by user
 */
export function getUserActivity(
  logs: ActivityLog[],
): Record<string, ActivityLog[]> {
  const userActivity: Record<string, ActivityLog[]> = {};

  logs.forEach((log) => {
    if (log.userId) {
      if (!userActivity[log.userId]) {
        userActivity[log.userId] = [];
      }
      userActivity[log.userId].push(log);
    }
  });

  return userActivity;
}

/**
 * Group activity logs by entity
 */
export function getEntityActivity(
  logs: ActivityLog[],
): Record<string, ActivityLog[]> {
  const entityActivity: Record<string, ActivityLog[]> = {};

  logs.forEach((log) => {
    if (log.entityId && log.entityType) {
      const key = `${log.entityType}:${log.entityId}`;
      if (!entityActivity[key]) {
        entityActivity[key] = [];
      }
      entityActivity[key].push(log);
    }
  });

  return entityActivity;
}

/**
 * Format activity logs for timeline/chart display
 */
export function getTimelineData(
  logs: ActivityLog[],
  groupBy: 'day' | 'week' | 'month' = 'day',
): Array<{ date: string; count: number; actions: Record<string, number> }> {
  const timeline = new Map<
    string,
    { count: number; actions: Record<string, number> }
  >();

  logs.forEach((log) => {
    const dateKey = formatDateForGrouping(log.createdAt, groupBy);

    if (!timeline.has(dateKey)) {
      timeline.set(dateKey, { count: 0, actions: {} });
    }

    const entry = timeline.get(dateKey)!;
    entry.count++;
    entry.actions[log.action] = (entry.actions[log.action] || 0) + 1;
  });

  // Convert to array and sort by date
  return Array.from(timeline.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Detect unusual activity patterns (simple anomaly detection)
 */
export function detectAnomalies(
  logs: ActivityLog[],
): Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }> {
  const anomalies: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }> = [];

  // Group logs by user
  const userActivity = getUserActivity(logs);

  // Calculate average actions per user
  const userCounts = Object.values(userActivity).map((logs) => logs.length);
  const avgActions =
    userCounts.reduce((sum, count) => sum + count, 0) / userCounts.length || 0;
  const stdDev = calculateStdDev(userCounts, avgActions);

  // Detect users with unusually high activity
  Object.entries(userActivity).forEach(([userId, userLogs]) => {
    const actionCount = userLogs.length;

    // Flag if more than 2 standard deviations above average
    if (actionCount > avgActions + 2 * stdDev && stdDev > 0) {
      anomalies.push({
        type: 'high_activity',
        message: `User ${userId} has unusually high activity: ${actionCount} actions (avg: ${avgActions.toFixed(1)})`,
        severity: 'medium',
      });
    }

    // Detect rapid succession of failed actions
    const recentLogs = userLogs.slice(-10); // Last 10 actions
    const failedLoginAttempts = recentLogs.filter(
      (log) => log.action === ActivityAction.LOGIN,
    ).length;

    if (failedLoginAttempts > 5) {
      anomalies.push({
        type: 'multiple_login_attempts',
        message: `User ${userId} has ${failedLoginAttempts} login attempts in recent activity`,
        severity: 'high',
      });
    }
  });

  // Detect unusual time patterns (e.g., activity during unusual hours)
  const hourCounts = new Array(24).fill(0);
  logs.forEach((log) => {
    const hour = new Date(log.createdAt).getHours();
    hourCounts[hour]++;
  });

  // Flag hours with unusually high activity (e.g., late night hours)
  const nightHours = [0, 1, 2, 3, 4, 5]; // Midnight to 5 AM
  const nightActivity = nightHours.reduce(
    (sum, hour) => sum + hourCounts[hour],
    0,
  );
  const totalActivity = logs.length;

  if (nightActivity / totalActivity > 0.3 && totalActivity > 10) {
    anomalies.push({
      type: 'unusual_time_pattern',
      message: `${((nightActivity / totalActivity) * 100).toFixed(1)}% of activity occurred during night hours (midnight - 5 AM)`,
      severity: 'low',
    });
  }

  return anomalies;
}

/**
 * Get activity summary statistics
 */
export function getActivitySummary(logs: ActivityLog[]): {
  totalActions: number;
  uniqueUsers: number;
  uniqueEntities: number;
  actionBreakdown: Record<string, number>;
  entityTypeBreakdown: Record<string, number>;
  topUsers: Array<{ userId: string; actionCount: number }>;
  recentActions: ActivityLog[];
} {
  const uniqueUsers = new Set(
    logs.filter((log) => log.userId).map((log) => log.userId),
  ).size;

  const uniqueEntities = new Set(
    logs.filter((log) => log.entityId).map((log) => `${log.entityType}:${log.entityId}`),
  ).size;

  const actionBreakdown = getActionCounts(logs);

  const entityTypeBreakdown: Record<string, number> = {};
  logs.forEach((log) => {
    if (log.entityType) {
      entityTypeBreakdown[log.entityType] =
        (entityTypeBreakdown[log.entityType] || 0) + 1;
    }
  });

  const userActivity = getUserActivity(logs);
  const topUsers = Object.entries(userActivity)
    .map(([userId, userLogs]) => ({
      userId,
      actionCount: userLogs.length,
    }))
    .sort((a, b) => b.actionCount - a.actionCount)
    .slice(0, 10);

  const recentActions = logs
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return {
    totalActions: logs.length,
    uniqueUsers,
    uniqueEntities,
    actionBreakdown,
    entityTypeBreakdown,
    topUsers,
    recentActions,
  };
}

/**
 * Get activity heatmap data (hour x day of week)
 */
export function getActivityHeatmap(logs: ActivityLog[]): number[][] {
  // 7 days x 24 hours
  const heatmap: number[][] = Array.from({ length: 7 }, () =>
    Array(24).fill(0),
  );

  logs.forEach((log) => {
    const date = new Date(log.createdAt);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = date.getHours();
    heatmap[dayOfWeek][hour]++;
  });

  return heatmap;
}

/**
 * Calculate activity trends (increase/decrease over time)
 */
export function getActivityTrends(
  logs: ActivityLog[],
  periodDays: number = 30,
): {
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  currentPeriodCount: number;
  previousPeriodCount: number;
} {
  const now = new Date();
  const periodMs = periodDays * 24 * 60 * 60 * 1000;

  const currentPeriodStart = new Date(now.getTime() - periodMs);
  const previousPeriodStart = new Date(now.getTime() - 2 * periodMs);

  const currentPeriodLogs = logs.filter(
    (log) =>
      log.createdAt >= currentPeriodStart && log.createdAt <= now,
  );

  const previousPeriodLogs = logs.filter(
    (log) =>
      log.createdAt >= previousPeriodStart &&
      log.createdAt < currentPeriodStart,
  );

  const currentPeriodCount = currentPeriodLogs.length;
  const previousPeriodCount = previousPeriodLogs.length;

  let percentageChange = 0;
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

  if (previousPeriodCount > 0) {
    percentageChange =
      ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;

    if (percentageChange > 10) {
      trend = 'increasing';
    } else if (percentageChange < -10) {
      trend = 'decreasing';
    }
  } else if (currentPeriodCount > 0) {
    trend = 'increasing';
    percentageChange = 100;
  }

  return {
    trend,
    percentageChange,
    currentPeriodCount,
    previousPeriodCount,
  };
}

// Helper functions

function formatDateForGrouping(
  date: Date,
  groupBy: 'day' | 'week' | 'month',
): string {
  const d = new Date(date);

  switch (groupBy) {
    case 'day':
      return d.toISOString().split('T')[0]; // YYYY-MM-DD

    case 'week': {
      // Get week start (Monday)
      const weekStart = new Date(d);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      return weekStart.toISOString().split('T')[0];
    }

    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    default:
      return d.toISOString().split('T')[0];
  }
}

function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;

  const squareDiffs = values.map((value) => {
    const diff = value - mean;
    return diff * diff;
  });

  const avgSquareDiff =
    squareDiffs.reduce((sum, sq) => sum + sq, 0) / squareDiffs.length;

  return Math.sqrt(avgSquareDiff);
}