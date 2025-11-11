import {
    Controller,
    ForbiddenException,
    Get,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ActivityService } from './activity.service';
import { FilterActivityLogsDto } from './dto/filter-activity-logs.dto';
import { ActivityLog } from './entities/activity-log.entity';
import { EntityType } from './enums/entity-type.enum';
import {
    ActivityStats,
    PaginatedResult,
} from './interfaces/activity.interfaces';

@Controller('activity')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    /**
     * Get all activities (Admin only)
     * GET /activity
     */
    @Get()
    @Roles(UserRole.ADMIN)
    async findAll(
        @Query() filterDto: FilterActivityLogsDto,
    ): Promise<PaginatedResult<ActivityLog>> {
        return this.activityService.findAll(filterDto);
    }

    /**
     * Get current user's activities
     * GET /activity/me
     */
    @Get('me')
    async findMyActivities(
        @Req() req: any,
        @Query() filterDto: FilterActivityLogsDto,
    ): Promise<PaginatedResult<ActivityLog>> {
        const userId = req.user.id;
        return this.activityService.findByUser(userId, filterDto);
    }

    /**
     * Get entity activities
     * GET /activity/entity/:entityType/:entityId
     */
    @Get('entity/:entityType/:entityId')
    async findByEntity(
        @Param('entityType') entityType: EntityType,
        @Param('entityId', ParseUUIDPipe) entityId: string,
        @Query() filterDto: FilterActivityLogsDto,
        @Req() req: any,
    ): Promise<PaginatedResult<ActivityLog>> {
        // Users can only see activities for entities they have access to
        // This should be validated based on team membership, task ownership, etc.
        // For now, we'll allow access if user is admin or it's their own activity
        const userId = req.user.id;
        const isAdmin = req.user.role === UserRole.ADMIN;

        if (!isAdmin) {
            // Check if user has access to this entity
            // This would need to be implemented based on your business logic
            // For example, checking team membership for team-related activities
            // For now, we'll restrict to admins only for entity queries
            throw new ForbiddenException(
                'You do not have permission to view these activities',
            );
        }

        return this.activityService.findByEntity(entityType, entityId, filterDto);
    }

    /**
     * Get team activities
     * GET /activity/team/:teamId
     */
    @Get('team/:teamId')
    async findByTeam(
        @Param('teamId', ParseUUIDPipe) teamId: string,
        @Query() filterDto: FilterActivityLogsDto,
        @Req() req: any,
    ): Promise<PaginatedResult<ActivityLog>> {
        // In a real application, you would validate that the user is a member of the team
        // For now, we'll allow access for demonstration purposes
        // TODO: Add team membership validation
        return this.activityService.findByTeam(teamId, filterDto);
    }

    /**
     * Get recent activities
     * GET /activity/recent
     */
    @Get('recent')
    async findRecent(
        @Query('limit', ParseIntPipe) limit: number = 10,
    ): Promise<ActivityLog[]> {
        // Limit the maximum number of recent activities to prevent abuse
        const maxLimit = Math.min(limit, 50);
        return this.activityService.findRecent(maxLimit);
    }

    /**
     * Get activity statistics
     * GET /activity/stats
     */
    @Get('stats')
    async getStats(
        @Query('userId') userId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Req() req?: any,
    ): Promise<ActivityStats> {
        const isAdmin = req.user.role === UserRole.ADMIN;
        const currentUserId = req.user.id;

        // If userId is provided and different from current user, check admin permission
        if (userId && userId !== currentUserId && !isAdmin) {
            throw new ForbiddenException(
                'You do not have permission to view these statistics',
            );
        }

        // If no userId provided, use current user's ID for non-admins
        const targetUserId = isAdmin ? userId : currentUserId;

        return this.activityService.getActivityStats(
            targetUserId,
            startDate,
            endDate,
        );
    }
}