import {
    Controller,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Task } from '../tasks/entities/task.entity';
import { TeamMember } from '../teams/entities/team-member.entity';
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
    constructor(
        private readonly activityService: ActivityService,
        @InjectRepository(TeamMember)
        private readonly teamMemberRepository: Repository<TeamMember>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) { }

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
        const userId = req.user.id;
        const isAdmin = req.user.role === UserRole.ADMIN;

        if (!isAdmin) {
            if (entityType === EntityType.USER) {
                if (entityId !== userId) {
                    throw new ForbiddenException(
                        'You do not have permission to view these activities',
                    );
                }
            } else {
                const teamId = await this.resolveTeamIdForEntity(entityType, entityId);
                await this.assertTeamMembership(teamId, userId);
            }
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
        const userId = req.user.id;
        const isAdmin = req.user.role === UserRole.ADMIN;

        if (!isAdmin) {
            await this.assertTeamMembership(teamId, userId);
        }

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

    private async assertTeamMembership(
        teamId: string,
        userId: string,
    ): Promise<void> {
        const membership = await this.teamMemberRepository.findOne({
            where: { teamId, userId },
        });

        if (!membership) {
            throw new ForbiddenException(
                'You do not have permission to view these activities',
            );
        }
    }

    private async resolveTeamIdForEntity(
        entityType: EntityType,
        entityId: string,
    ): Promise<string> {
        if (entityType === EntityType.TEAM) {
            return entityId;
        }

        if (entityType === EntityType.TASK) {
            const task = await this.taskRepository.findOne({
                where: { id: entityId },
                select: ['id', 'teamId'],
            });

            if (!task) {
                throw new NotFoundException('Task not found');
            }

            return task.teamId;
        }

        if (entityType === EntityType.TEAM_MEMBER) {
            const teamMember = await this.teamMemberRepository.findOne({
                where: { id: entityId },
                select: ['id', 'teamId'],
            });

            if (!teamMember) {
                throw new NotFoundException('Team member not found');
            }

            return teamMember.teamId;
        }

        throw new ForbiddenException(
            'You do not have permission to view these activities',
        );
    }
}
