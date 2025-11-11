import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { TaskStatus } from './entities/task.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogActivity } from '../../common/decorators/log-activity.decorator';
import { ActivityAction } from '../activity/enums/activity-action.enum';
import { EntityType } from '../activity/enums/entity-type.enum';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * POST /tasks
   * Create a new task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @LogActivity(ActivityAction.TASK_CREATE, EntityType.TASK)
  async create(
    @CurrentUser('id') userId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(userId, createTaskDto);
    return {
      success: true,
      data: task,
      message: 'Task created successfully',
    };
  }

  /**
   * GET /tasks
   * Get all tasks with filters and pagination
   */
  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() filterDto: FilterTasksDto,
  ) {
    const result = await this.tasksService.findAll(userId, filterDto);
    return {
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * GET /tasks/me
   * Get tasks assigned to the current user
   */
  @Get('me')
  async getMyTasks(
    @CurrentUser('id') userId: string,
    @Query() filterDto: FilterTasksDto,
  ) {
    const result = await this.tasksService.getMyTasks(userId, filterDto);
    return {
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * GET /tasks/:id
   * Get a single task by ID
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const task = await this.tasksService.findOne(id, userId);
    return {
      success: true,
      data: task,
    };
  }

  /**
   * PATCH /tasks/:id
   * Update a task
   */
  @Patch(':id')
  @LogActivity(ActivityAction.TASK_UPDATE, EntityType.TASK)
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.tasksService.update(id, userId, updateTaskDto);
    return {
      success: true,
      data: task,
      message: 'Task updated successfully',
    };
  }

  /**
   * DELETE /tasks/:id
   * Delete a task
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @LogActivity(ActivityAction.TASK_DELETE, EntityType.TASK)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.tasksService.remove(id, userId);
    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }

  /**
   * PATCH /tasks/:id/assign
   * Assign a task to a user
   */
  @Patch(':id/assign')
  @LogActivity(ActivityAction.TASK_ASSIGN, EntityType.TASK)
  async assignTask(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('assignedToId') assignedToId: string,
  ) {
    const task = await this.tasksService.assignTask(id, userId, assignedToId);
    return {
      success: true,
      data: task,
      message: 'Task assigned successfully',
    };
  }

  /**
   * PATCH /tasks/:id/status
   * Update task status
   */
  @Patch(':id/status')
  @LogActivity(ActivityAction.TASK_STATUS_CHANGE, EntityType.TASK)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('status') status: TaskStatus,
  ) {
    const task = await this.tasksService.updateStatus(id, userId, status);
    return {
      success: true,
      data: task,
      message: 'Task status updated successfully',
    };
  }
}

/**
 * Team-specific task endpoints
 */
@Controller('teams/:teamId/tasks')
@UseGuards(JwtAuthGuard)
export class TeamTasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * GET /teams/:teamId/tasks
   * Get all tasks for a specific team
   */
  @Get()
  async getTeamTasks(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
    @Query() filterDto: FilterTasksDto,
  ) {
    const result = await this.tasksService.getTasksByTeam(
      teamId,
      userId,
      filterDto,
    );
    return {
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * GET /teams/:teamId/tasks/stats
   * Get task statistics for a team
   */
  @Get('stats')
  async getTeamTaskStats(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
  ) {
    const stats = await this.tasksService.getTaskStats(teamId, userId);
    return {
      success: true,
      data: stats,
    };
  }
}