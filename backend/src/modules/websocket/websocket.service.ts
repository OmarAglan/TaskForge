import { Injectable, Logger } from '@nestjs/common';
import { Task } from '../tasks/entities/task.entity';
import { Team } from '../teams/entities/team.entity';
import { TeamMember } from '../teams/entities/team-member.entity';
import { WebSocketEvents } from './events/websocket-events.enum';
import { EventsGateway } from './events.gateway';
import { NotificationEventDto, TaskEventDto, TeamEventDto } from './dto/websocket-event.dto';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);

  constructor(private readonly eventsGateway: EventsGateway) {}

  // -----------------------------
  // Tasks
  // -----------------------------

  emitTaskCreated(task: Task, userId: string) {
    const payload: TaskEventDto = {
      taskId: task.id,
      task,
      teamId: task.teamId,
      userId,
      action: 'created',
    };

    this.eventsGateway.emitToTeam(task.teamId, WebSocketEvents.TASK_CREATED, payload);
  }

  emitTaskUpdated(task: Task, userId: string, changes?: Record<string, any>) {
    const payload: TaskEventDto = {
      taskId: task.id,
      task,
      teamId: task.teamId,
      userId,
      action: 'updated',
      changes,
    };

    this.eventsGateway.emitToTeam(task.teamId, WebSocketEvents.TASK_UPDATED, payload);
  }

  emitTaskDeleted(taskId: string, teamId: string, userId: string) {
    this.eventsGateway.emitToTeam(teamId, WebSocketEvents.TASK_DELETED, {
      taskId,
      teamId,
      userId,
      action: 'deleted',
    } satisfies Partial<TaskEventDto> & { taskId: string; teamId: string; userId: string; action: string });
  }

  emitTaskAssigned(task: Task, assigneeId: string, userId: string) {
    const payload: TaskEventDto = {
      taskId: task.id,
      task,
      teamId: task.teamId,
      userId,
      action: 'assigned',
      assigneeId,
    };

    // Team room (board/list updates)
    this.eventsGateway.emitToTeam(task.teamId, WebSocketEvents.TASK_ASSIGNED, payload);

    // Direct user ping (notifications / "my tasks" refresh)
    if (assigneeId) {
      this.eventsGateway.emitToUser(assigneeId, WebSocketEvents.TASK_ASSIGNED, payload);
    }
  }

  emitTaskStatusChanged(
    task: Task,
    oldStatus: string,
    newStatus: string,
    userId: string,
  ) {
    const payload: TaskEventDto = {
      taskId: task.id,
      task,
      teamId: task.teamId,
      userId,
      action: 'status_changed',
      oldStatus,
      newStatus,
    };

    this.eventsGateway.emitToTeam(task.teamId, WebSocketEvents.TASK_STATUS_CHANGED, payload);
  }

  // -----------------------------
  // Teams
  // -----------------------------

  emitTeamCreated(team: Team, userId: string) {
    const payload: TeamEventDto = {
      teamId: team.id,
      team,
      userId,
      action: 'created',
    };

    this.eventsGateway.emitToUser(userId, WebSocketEvents.TEAM_CREATED, payload);
  }

  emitTeamUpdated(team: Team, userId: string) {
    const payload: TeamEventDto = {
      teamId: team.id,
      team,
      userId,
      action: 'updated',
    };

    this.eventsGateway.emitToTeam(team.id, WebSocketEvents.TEAM_UPDATED, payload);
  }

  emitTeamDeleted(teamId: string, userId: string) {
    // Emit to the team room (connected members) rather than globally
    this.eventsGateway.emitToTeam(teamId, WebSocketEvents.TEAM_DELETED, {
      teamId,
      userId,
      action: 'deleted',
    });
  }

  emitTeamMemberAdded(team: Team, member: TeamMember, userId: string) {
    const payload: TeamEventDto = {
      teamId: team.id,
      team,
      userId,
      action: 'member_added',
      memberId: member.userId,
      memberRole: member.role,
    };

    this.eventsGateway.emitToTeam(team.id, WebSocketEvents.TEAM_MEMBER_ADDED, payload);
  }

  emitTeamMemberRemoved(team: Team, memberId: string, userId: string) {
    const payload: TeamEventDto = {
      teamId: team.id,
      team,
      userId,
      action: 'member_removed',
      memberId,
    };

    this.eventsGateway.emitToTeam(team.id, WebSocketEvents.TEAM_MEMBER_REMOVED, payload);
  }

  emitTeamMemberRoleChanged(team: Team, member: TeamMember, userId: string) {
    const payload: TeamEventDto = {
      teamId: team.id,
      team,
      userId,
      action: 'member_role_changed',
      memberId: member.userId,
      memberRole: member.role,
    };

    this.eventsGateway.emitToTeam(team.id, WebSocketEvents.TEAM_MEMBER_ROLE_CHANGED, payload);
  }

  // -----------------------------
  // Server-driven room updates
  // -----------------------------

  addUserToTeamRoom(userId: string, teamId: string) {
    this.eventsGateway.joinTeamRoom(userId, teamId);
  }

  removeUserFromTeamRoom(userId: string, teamId: string) {
    this.eventsGateway.leaveTeamRoom(userId, teamId);
  }

  // -----------------------------
  // Notifications
  // -----------------------------

  emitNotification(userId: string, notification: NotificationEventDto) {
    this.eventsGateway.emitToUser(userId, WebSocketEvents.NOTIFICATION_NEW, notification);
  }

  // -----------------------------
  // Presence (optional server-driven)
  // -----------------------------

  emitUserPresence(userId: string, status: 'online' | 'offline') {
    const event =
      status === 'online' ? WebSocketEvents.USER_ONLINE : WebSocketEvents.USER_OFFLINE;

    this.eventsGateway.emitToAll(event, { userId, at: new Date().toISOString() });
  }

  // -----------------------------
  // Activity
  // -----------------------------

  emitActivity(teamId: string, activity: any) {
    try {
      this.eventsGateway.emitToTeam(teamId, WebSocketEvents.ACTIVITY_NEW, activity);
    } catch (err) {
      this.logger.error('Failed to emit activity event', err as any);
    }
  }
}