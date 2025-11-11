import { IsEnum, IsOptional, IsUUID, IsString, IsObject } from 'class-validator';
import { ActivityAction } from '../enums/activity-action.enum';
import { EntityType } from '../enums/entity-type.enum';

export class CreateActivityLogDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsEnum(ActivityAction)
  action: ActivityAction;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}