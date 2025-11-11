import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { FilterActivityLogsDto } from './dto/filter-activity-logs.dto';
import { ActivityAction } from './enums/activity-action.enum';
import { EntityType } from './enums/entity-type.enum';

interface PaginatedResult<T> {
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

interface ActivityStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByEntityType: Record<string, number>;
  recentActivity: ActivityLog[];
  mostActiveUsers: { userId: string; actionCount: number }[];
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  /**
   * Create an activity log entry
   */
  async log(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog> {
    try {
      // Sanitize metadata to remove sensitive information
      const sanitizedMetadata = this.sanitizeMetadata(
        createActivityLogDto.metadata,
      );

      const activityLog = this.activityLogRepository.create({
        ...createActivityLogDto,
        metadata: sanitizedMetadata,
      });

      return await this.activityLogRepository.save(activityLog);
    } catch (error) {
      // Log error but don't throw - logging should not break application flow
      console.error('Failed to log activity:', error);
      throw error;
    }
  }

  /**
   * Get all activity logs with filters and pagination
   */
  async findAll(
    filterDto: FilterActivityLogsDto,
  ): Promise<PaginatedResult<ActivityLog>> {
    const {
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filterDto;

    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user');

    // Apply filters
    if (userId) {
      queryBuilder.andWhere('activity.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('activity.action = :action', { action });
    }

    if (entityType) {
      queryBuilder.andWhere('activity.entityType = :entityType', {
        entityType,
      });
    }

    if (entityId) {
      queryBuilder.andWhere('activity.entityId = :entityId', { entityId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('activity.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere('activity.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('activity.createdAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder
      .orderBy('activity.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get activity logs for a specific user
   */
  async findByUser(
    userId: string,
    filterDto: FilterActivityLogsDto,
  ): Promise<PaginatedResult<ActivityLog>> {
    return this.findAll({ ...filterDto, userId });
  }

  /**
   * Get activity logs for a specific entity
   */
  async findByEntity(
    entityType: EntityType,
    entityId: string,
    filterDto: FilterActivityLogsDto,
  ): Promise<PaginatedResult<ActivityLog>> {
    return this.findAll({ ...filterDto, entityType, entityId });
  }

  /**
   * Get team-related activities
   */
  async findByTeam(
    teamId: string,
    filterDto: FilterActivityLogsDto,
  ): Promise<PaginatedResult<ActivityLog>> {
    const { page = 1, limit = 20 } = filterDto;

    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .where('activity.entityType = :entityType', { entityType: EntityType.TEAM })
      .andWhere('activity.entityId = :teamId', { teamId })
      .orWhere(
        '(activity.entityType = :taskType AND activity.metadata @> :teamMetadata)',
        {
          taskType: EntityType.TASK,
          teamMetadata: JSON.stringify({ teamId }),
        },
      );

    // Apply additional filters
    if (filterDto.action) {
      queryBuilder.andWhere('activity.action = :action', {
        action: filterDto.action,
      });
    }

    if (filterDto.startDate && filterDto.endDate) {
      queryBuilder.andWhere('activity.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(filterDto.startDate),
        endDate: new Date(filterDto.endDate),
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder
      .orderBy('activity.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get recent activities
   */
  async findRecent(limit: number = 10): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(
    userId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ActivityStats> {
    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user');

    // Apply filters
    if (userId) {
      queryBuilder.where('activity.userId = :userId', { userId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('activity.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const activities = await queryBuilder.getMany();

    // Calculate statistics
    const totalActions = activities.length;

    // Count by action type
    const actionsByType: Record<string, number> = {};
    activities.forEach((activity) => {
      actionsByType[activity.action] = (actionsByType[activity.action] || 0) + 1;
    });

    // Count by entity type
    const actionsByEntityType: Record<string, number> = {};
    activities.forEach((activity) => {
      if (activity.entityType) {
        actionsByEntityType[activity.entityType] =
          (actionsByEntityType[activity.entityType] || 0) + 1;
      }
    });

    // Get recent activity
    const recentActivity = activities.slice(0, 10);

    // Get most active users
    const userActivityCount: Record<string, number> = {};
    activities.forEach((activity) => {
      if (activity.userId) {
        userActivityCount[activity.userId] =
          (userActivityCount[activity.userId] || 0) + 1;
      }
    });

    const mostActiveUsers = Object.entries(userActivityCount)
      .map(([userId, actionCount]) => ({ userId, actionCount }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);

    return {
      totalActions,
      actionsByType,
      actionsByEntityType,
      recentActivity,
      mostActiveUsers,
    };
  }

  /**
   * Clean old activity logs (admin only)
   */
  async cleanOldLogs(retentionDays: number): Promise<{ deleted: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.activityLogRepository.delete({
      createdAt: LessThan(cutoffDate),
    });

    return { deleted: result.affected || 0 };
  }

  /**
   * Extract IP address from request
   */
  extractIpAddress(request: any): string | null {
    // Check for proxy headers first
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      // x-forwarded-for may contain multiple IPs, get the first one
      return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return realIp;
    }

    // Fallback to connection remote address
    return request.connection?.remoteAddress || 
           request.socket?.remoteAddress || 
           request.ip || 
           null;
  }

  /**
   * Extract User-Agent from request
   */
  extractUserAgent(request: any): string | null {
    return request.headers['user-agent'] || null;
  }

  /**
   * Sanitize metadata to remove sensitive information
   */
  sanitizeMetadata(
    metadata?: Record<string, any>,
  ): Record<string, any> | null {
    if (!metadata) {
      return null;
    }

    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'creditCard',
      'ssn',
      'passwordHash',
    ];

    const sanitized = { ...metadata };

    // Recursively remove sensitive fields
    const removeSensitiveFields = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(removeSensitiveFields);
      }

      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some((field) =>
          lowerKey.includes(field.toLowerCase()),
        );

        if (isSensitive) {
          cleaned[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          cleaned[key] = removeSensitiveFields(value);
        } else {
          cleaned[key] = value;
        }
      }

      return cleaned;
    };

    return removeSensitiveFields(sanitized);
  }
}