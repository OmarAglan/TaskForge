import { Task } from '../../tasks/entities/task.entity';
import { Team } from '../../teams/entities/team.entity';

export class TaskEventDto {
  taskId: string;
  task: Task;
  teamId: string;
  userId: string;
  action: string;
  changes?: Record<string, any>;
  oldStatus?: string;
  newStatus?: string;
  assigneeId?: string;
}

export class TeamEventDto {
  teamId: string;
  team: Team;
  userId: string;
  action: string;
  memberId?: string;
  memberRole?: string;
}

export class NotificationEventDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  createdAt: string;
}