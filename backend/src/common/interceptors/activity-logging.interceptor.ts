import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ActivityService } from '../../modules/activity/activity.service';
import {
  ACTIVITY_LOG_KEY,
  ActivityLogMetadata,
} from '../decorators/log-activity.decorator';

@Injectable()
export class ActivityLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly activityService: ActivityService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get activity log metadata from decorator
    const activityMetadata = this.reflector.get<ActivityLogMetadata>(
      ACTIVITY_LOG_KEY,
      context.getHandler(),
    );

    // If no activity log decorator, just continue
    if (!activityMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { action, entityType } = activityMetadata;

    return next.handle().pipe(
      tap(async (data) => {
        try {
          // Extract user information
          const user = request.user;
          const userId = user?.id || null;

          // Extract IP and User-Agent
          const ipAddress = this.activityService.extractIpAddress(request);
          const userAgent = this.activityService.extractUserAgent(request);

          // Build metadata from request and response
          const metadata = this.buildMetadata(request, data);

          // Extract entity ID from response or request
          const entityId = this.extractEntityId(data, request);

          // Log the activity (convert null to undefined for DTO)
          await this.activityService.log({
            userId,
            action,
            entityType,
            entityId: entityId || undefined,
            metadata,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
          });
        } catch (error) {
          // Log error but don't throw - logging failures shouldn't break the request
          console.error('Activity logging failed:', error);
        }
      }),
      catchError((error) => {
        // Even on error, we might want to log the failed attempt
        // For now, we'll just rethrow the error
        throw error;
      }),
    );
  }

  /**
   * Build metadata from request and response
   */
  private buildMetadata(request: any, response: any): Record<string, any> {
    const metadata: Record<string, any> = {};

    // Add method and path
    metadata.method = request.method;
    metadata.path = request.path || request.url;

    // Add request body (sanitized)
    if (request.body && Object.keys(request.body).length > 0) {
      metadata.requestBody = this.sanitizeData(request.body);
    }

    // Add query parameters
    if (request.query && Object.keys(request.query).length > 0) {
      metadata.queryParams = request.query;
    }

    // Add params
    if (request.params && Object.keys(request.params).length > 0) {
      metadata.params = request.params;
    }

    // Add response data (limited to avoid huge logs)
    if (response) {
      // For objects, include basic info
      if (typeof response === 'object' && response !== null) {
        // Include id if present
        if (response.id) {
          metadata.entityId = response.id;
        }
        
        // Include name/title if present
        if (response.name) {
          metadata.entityName = response.name;
        } else if (response.title) {
          metadata.entityTitle = response.title;
        }

        // Include email if present (for user operations)
        if (response.email) {
          metadata.entityEmail = response.email;
        }

        // Include status changes
        if (response.status) {
          metadata.newStatus = response.status;
        }

        // Include priority changes
        if (response.priority) {
          metadata.newPriority = response.priority;
        }

        // Include role changes
        if (response.role) {
          metadata.newRole = response.role;
        }
      }
    }

    return metadata;
  }

  /**
   * Extract entity ID from response or request
   */
  private extractEntityId(response: any, request: any): string | null {
    // Try to get from response
    if (response?.id) {
      return response.id;
    }

    // Try to get from response data
    if (response?.data?.id) {
      return response.data.id;
    }

    // Try to get from request params
    if (request.params?.id) {
      return request.params.id;
    }

    if (request.params?.teamId) {
      return request.params.teamId;
    }

    if (request.params?.taskId) {
      return request.params.taskId;
    }

    if (request.params?.userId) {
      return request.params.userId;
    }

    return null;
  }

  /**
   * Sanitize data to remove sensitive information
   */
  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    const sanitized: any = {};
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
    ];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveFields.some((field) =>
        lowerKey.includes(field.toLowerCase()),
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}