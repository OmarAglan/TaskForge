import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @MinLength(3, { message: 'Task title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Task title must not exceed 200 characters' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Invalid task priority' })
  priority?: TaskPriority;

  @IsUUID('4', { message: 'Team ID must be a valid UUID' })
  teamId: string;

  @IsOptional()
  @IsUUID('4', { message: 'Assigned user ID must be a valid UUID' })
  assignedToId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string' })
  dueDate?: string;
}