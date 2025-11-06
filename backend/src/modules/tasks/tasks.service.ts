import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { TeamMember, TeamRole } from '../teams/entities/team-member.entity';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  doneTasks: number;
  archivedTasks: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
  ) {}

  /**
   * Create a new task (verify team membership)
   */
  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    // Verify user is a team member
    const membership = await this.teamMemberRepository.findOne({
      where: {
        teamId: createTaskDto.teamId,
        userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // If assignedToId is provided, verify they are a team member
    if (createTaskDto.assignedToId) {
      const assigneeMembership = await this.teamMemberRepository.findOne({
        where: {
          teamId: createTaskDto.teamId,
          userId: createTaskDto.assignedToId,
        },
      });

      if (!assigneeMembership) {
        throw new BadRequestException(
          'Assigned user is not a member of this team',
        );
      }
    }

    // Create task
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById: userId,
      status: createTaskDto.status || TaskStatus.TODO,
    });

    return this.taskRepository.save(task);
  }

  /**
   * Get all tasks with filtering, pagination, and search
   */
  async findAll(
    userId: string,
    filterDto: FilterTasksDto,
  ): Promise<PaginatedResult<Task>> {
    const {
      status,
      priority,
      assignedToId,
      teamId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    // If teamId is provided, verify user is a member
    if (teamId) {
      const isMember = await this.checkTeamMembership(teamId, userId);
      if (!isMember) {
        throw new ForbiddenException('You are not a member of this team');
      }
    }

    // Build query
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedUser')
      .leftJoinAndSelect('task.createdBy', 'createdUser')
      .leftJoinAndSelect('task.team', 'team');

    // Filter by teams where user is a member if no specific teamId
    if (!teamId) {
      const userTeams = await this.getUserTeamIds(userId);
      if (userTeams.length === 0) {
        return {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
      query.where('task.teamId IN (:...teamIds)', { teamIds: userTeams });
    } else {
      query.where('task.teamId = :teamId', { teamId });
    }

    // Apply filters
    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (priority) {
      query.andWhere('task.priority = :priority', { priority });
    }

    if (assignedToId) {
      query.andWhere('task.assignedToId = :assignedToId', { assignedToId });
    }

    if (search) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    const sortColumn = `task.${sortBy}`;
    query.orderBy(sortColumn, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Execute query
    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single task with permission check
   */
  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy', 'team'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Verify user is a team member
    const isMember = await this.checkTeamMembership(task.teamId, userId);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  /**
   * Update a task (creator, assignee, or team admin)
   */
  async update(
    id: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['team'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check permissions
    const canUpdate = await this.canModifyTask(task, userId);
    if (!canUpdate) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    // If updating assignedToId, verify they are a team member
    if (updateTaskDto.assignedToId !== undefined) {
      if (updateTaskDto.assignedToId) {
        const assigneeMembership = await this.teamMemberRepository.findOne({
          where: {
            teamId: task.teamId,
            userId: updateTaskDto.assignedToId,
          },
        });

        if (!assigneeMembership) {
          throw new BadRequestException(
            'Assigned user is not a member of this team',
          );
        }
      }
    }

    // Update task
    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  /**
   * Delete a task (creator or team admin)
   */
  async remove(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check permissions
    const canDelete = await this.canModifyTask(task, userId);
    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.taskRepository.remove(task);
  }

  /**
   * Assign or reassign a task (team admin or creator)
   */
  async assignTask(
    id: string,
    userId: string,
    assignedToId: string,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check permissions
    const userRole = await this.getUserRoleInTeam(task.teamId, userId);
    const isCreator = task.createdById === userId;
    const canAssign =
      userRole === TeamRole.OWNER ||
      userRole === TeamRole.ADMIN ||
      isCreator;

    if (!canAssign) {
      throw new ForbiddenException('You do not have permission to assign this task');
    }

    // Verify assignee is a team member
    const assigneeMembership = await this.teamMemberRepository.findOne({
      where: {
        teamId: task.teamId,
        userId: assignedToId,
      },
    });

    if (!assigneeMembership) {
      throw new BadRequestException(
        'Assigned user is not a member of this team',
      );
    }

    task.assignedToId = assignedToId;
    return this.taskRepository.save(task);
  }

  /**
   * Update task status (assignee, creator, or team admin)
   */
  async updateStatus(
    id: string,
    userId: string,
    status: TaskStatus,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check permissions (assignee, creator, or admin can update status)
    const userRole = await this.getUserRoleInTeam(task.teamId, userId);
    const isAssignee = task.assignedToId === userId;
    const isCreator = task.createdById === userId;
    const canUpdateStatus =
      userRole === TeamRole.OWNER ||
      userRole === TeamRole.ADMIN ||
      isAssignee ||
      isCreator;

    if (!canUpdateStatus) {
      throw new ForbiddenException(
        'You do not have permission to update this task status',
      );
    }

    task.status = status;
    return this.taskRepository.save(task);
  }

  /**
   * Get all tasks for a specific team
   */
  async getTasksByTeam(
    teamId: string,
    userId: string,
    filterDto: FilterTasksDto,
  ): Promise<PaginatedResult<Task>> {
    // Verify user is a team member
    const isMember = await this.checkTeamMembership(teamId, userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return this.findAll(userId, { ...filterDto, teamId });
  }

  /**
   * Get tasks assigned to the current user
   */
  async getMyTasks(
    userId: string,
    filterDto: FilterTasksDto,
  ): Promise<PaginatedResult<Task>> {
    return this.findAll(userId, { ...filterDto, assignedToId: userId });
  }

  /**
   * Get task statistics for a team
   */
  async getTaskStats(teamId: string, userId: string): Promise<TaskStats> {
    // Verify user is a team member
    const isMember = await this.checkTeamMembership(teamId, userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    const tasks = await this.taskRepository.find({
      where: { teamId },
    });

    const stats: TaskStats = {
      totalTasks: tasks.length,
      todoTasks: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgressTasks: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      inReviewTasks: tasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length,
      doneTasks: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      archivedTasks: tasks.filter((t) => t.status === TaskStatus.ARCHIVED).length,
      tasksByPriority: {
        low: tasks.filter((t) => t.priority === 'low').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        high: tasks.filter((t) => t.priority === 'high').length,
        urgent: tasks.filter((t) => t.priority === 'urgent').length,
      },
    };

    return stats;
  }

  /**
   * Helper: Check if user is a member of a team
   */
  private async checkTeamMembership(
    teamId: string,
    userId: string,
  ): Promise<boolean> {
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    return !!member;
  }

  /**
   * Helper: Get user's role in a team
   */
  private async getUserRoleInTeam(
    teamId: string,
    userId: string,
  ): Promise<TeamRole | null> {
    const member = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
    });

    return member ? member.role : null;
  }

  /**
   * Helper: Get all team IDs where user is a member
   */
  private async getUserTeamIds(userId: string): Promise<string[]> {
    const memberships = await this.teamMemberRepository.find({
      where: { userId },
    });

    return memberships.map((m) => m.teamId);
  }

  /**
   * Helper: Check if user can modify a task
   * Can modify if: creator, assignee, or team admin/owner
   */
  private async canModifyTask(task: Task, userId: string): Promise<boolean> {
    const userRole = await this.getUserRoleInTeam(task.teamId, userId);

    if (!userRole) {
      return false; // Not a team member
    }

    // Admins and owners can modify any task
    if (userRole === TeamRole.OWNER || userRole === TeamRole.ADMIN) {
      return true;
    }

    // Creators and assignees can modify their tasks
    return task.createdById === userId || task.assignedToId === userId;
  }
}