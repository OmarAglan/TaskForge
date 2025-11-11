import { SetMetadata } from '@nestjs/common';
import { ActivityAction } from '../../modules/activity/enums/activity-action.enum';
import { EntityType } from '../../modules/activity/enums/entity-type.enum';

export const ACTIVITY_LOG_KEY = 'activity_log';

export interface ActivityLogMetadata {
  action: ActivityAction;
  entityType?: EntityType;
}

/**
 * Decorator to mark methods for automatic activity logging
 * @param action - The activity action to log
 * @param entityType - Optional entity type involved in the action
 */
export const LogActivity = (
  action: ActivityAction,
  entityType?: EntityType,
) => SetMetadata(ACTIVITY_LOG_KEY, { action, entityType });