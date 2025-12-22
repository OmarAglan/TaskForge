import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { TaskStatus, getStatusLabel } from '../../types/task.types';

export interface TaskStatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  status: TaskStatus;
}

/**
 * Get status chip styles based on status
 */
const getStatusStyles = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return {
        backgroundColor: '#e0e0e0',
        color: '#616161',
      };
    case TaskStatus.IN_PROGRESS:
      return {
        backgroundColor: '#1976d2',
        color: '#ffffff',
      };
    case TaskStatus.IN_REVIEW:
      return {
        backgroundColor: '#9c27b0',
        color: '#ffffff',
      };
    case TaskStatus.COMPLETED:
      return {
        backgroundColor: '#2e7d32',
        color: '#ffffff',
      };
    case TaskStatus.CANCELLED:
      return {
        backgroundColor: '#424242',
        color: '#ffffff',
      };
    default:
      return {
        backgroundColor: '#e0e0e0',
        color: '#616161',
      };
  }
};

/**
 * Chip component for displaying task status
 */
export const TaskStatusChip: React.FC<TaskStatusChipProps> = ({
  status,
  size = 'small',
  variant = 'filled',
  ...props
}) => {
  return (
    <Chip
      label={getStatusLabel(status)}
      size={size}
      variant={variant}
      sx={{
        ...getStatusStyles(status),
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default TaskStatusChip;