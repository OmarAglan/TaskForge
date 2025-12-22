import React from 'react';
import { Chip, ChipProps, Tooltip } from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow, addDays, isBefore } from 'date-fns';

export interface TaskDueDateBadgeProps extends Omit<ChipProps, 'label' | 'color'> {
  dueDate: string | null;
  showIcon?: boolean;
}

/**
 * Get due date status and styling
 */
const getDueDateInfo = (dueDate: string) => {
  const date = new Date(dueDate);
  const now = new Date();

  if (isPast(date) && !isToday(date)) {
    return {
      status: 'overdue',
      label: `Overdue by ${formatDistanceToNow(date)}`,
      relativeLabel: formatDistanceToNow(date, { addSuffix: true }),
      color: '#d32f2f',
      bgColor: '#ffebee',
    };
  }

  if (isToday(date)) {
    return {
      status: 'today',
      label: 'Due today',
      relativeLabel: 'Today',
      color: '#ed6c02',
      bgColor: '#fff3e0',
    };
  }

  if (isTomorrow(date)) {
    return {
      status: 'tomorrow',
      label: 'Due tomorrow',
      relativeLabel: 'Tomorrow',
      color: '#ed6c02',
      bgColor: '#fff3e0',
    };
  }

  // Due within 7 days
  const weekFromNow = addDays(now, 7);
  if (isBefore(date, weekFromNow)) {
    return {
      status: 'soon',
      label: `Due ${format(date, 'EEEE')}`,
      relativeLabel: formatDistanceToNow(date, { addSuffix: true }),
      color: '#0288d1',
      bgColor: '#e1f5fe',
    };
  }

  // Future date
  return {
    status: 'future',
    label: `Due ${format(date, 'MMM d, yyyy')}`,
    relativeLabel: formatDistanceToNow(date, { addSuffix: true }),
    color: '#616161',
    bgColor: '#f5f5f5',
  };
};

/**
 * Badge component for displaying task due date
 */
export const TaskDueDateBadge: React.FC<TaskDueDateBadgeProps> = ({
  dueDate,
  showIcon = true,
  size = 'small',
  ...props
}) => {
  if (!dueDate) {
    return null;
  }

  const { label, relativeLabel, color, bgColor } = getDueDateInfo(dueDate);
  const formattedDate = format(new Date(dueDate), 'MMM d, yyyy h:mm a');

  return (
    <Tooltip title={`${label} - ${formattedDate}`}>
      <Chip
        icon={showIcon ? <ScheduleIcon sx={{ fontSize: 14, color: `${color} !important` }} /> : undefined}
        label={relativeLabel}
        size={size}
        sx={{
          backgroundColor: bgColor,
          color: color,
          fontWeight: 500,
          '& .MuiChip-icon': {
            marginLeft: '4px',
          },
          ...props.sx,
        }}
        {...props}
      />
    </Tooltip>
  );
};

export default TaskDueDateBadge;