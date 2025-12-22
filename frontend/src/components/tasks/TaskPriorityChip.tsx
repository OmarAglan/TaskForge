import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { TaskPriority, getPriorityLabel } from '../../types/task.types';

export interface TaskPriorityChipProps extends Omit<ChipProps, 'label' | 'color'> {
  priority: TaskPriority;
}

/**
 * Get priority chip styles based on priority level
 */
const getPriorityStyles = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.URGENT:
      return {
        backgroundColor: '#d32f2f',
        color: '#ffffff',
        fontWeight: 600,
      };
    case TaskPriority.HIGH:
      return {
        backgroundColor: '#ed6c02',
        color: '#ffffff',
        fontWeight: 500,
      };
    case TaskPriority.MEDIUM:
      return {
        backgroundColor: '#ffc107',
        color: '#000000',
      };
    case TaskPriority.LOW:
    default:
      return {
        backgroundColor: '#e0e0e0',
        color: '#616161',
      };
  }
};

/**
 * Chip component for displaying task priority
 */
export const TaskPriorityChip: React.FC<TaskPriorityChipProps> = ({
  priority,
  size = 'small',
  variant = 'filled',
  ...props
}) => {
  return (
    <Chip
      label={getPriorityLabel(priority)}
      size={size}
      variant={variant}
      sx={{
        ...getPriorityStyles(priority),
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default TaskPriorityChip;