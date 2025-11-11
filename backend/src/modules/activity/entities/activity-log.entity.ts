import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ActivityAction {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',

  // Team actions
  TEAM_CREATE = 'team_create',
  TEAM_UPDATE = 'team_update',
  TEAM_DELETE = 'team_delete',
  TEAM_MEMBER_ADD = 'team_member_add',
  TEAM_MEMBER_REMOVE = 'team_member_remove',
  TEAM_MEMBER_ROLE_UPDATE = 'team_member_role_update',

  // Task actions
  TASK_CREATE = 'task_create',
  TASK_UPDATE = 'task_update',
  TASK_DELETE = 'task_delete',
  TASK_ASSIGN = 'task_assign',
  TASK_STATUS_CHANGE = 'task_status_change',
  TASK_PRIORITY_CHANGE = 'task_priority_change',

  // User actions
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
}

export enum EntityType {
  USER = 'user',
  TEAM = 'team',
  TASK = 'task',
  TEAM_MEMBER = 'team_member',
}

@Entity('activity_logs')
@Index(['userId'])
@Index(['action'])
@Index(['entityType'])
@Index(['entityId'])
@Index(['createdAt'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string | null;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({
    type: 'enum',
    enum: EntityType,
    nullable: true,
    name: 'entity_type',
  })
  entityType: EntityType | null;

  @Column({ type: 'uuid', name: 'entity_id', nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'user_agent' })
  userAgent: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}