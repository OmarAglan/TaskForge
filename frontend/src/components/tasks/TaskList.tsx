import React from 'react';
import { Box, Grid, List, ListItem, Typography } from '@mui/material';
import { Task } from '../../types/task.types';
import { TaskCard } from './TaskCard';
import { TaskCardSkeleton } from '../skeletons/TaskCardSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { Assignment as TaskIcon } from '@mui/icons-material';

export interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  view?: 'grid' | 'list';
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onTaskClick?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  onStatusChange?: (task: Task) => void;
  showTeam?: boolean;
}

/**
 * List component for displaying tasks in grid or list view
 */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading = false,
  view = 'grid',
  emptyTitle = 'No tasks found',
  emptyDescription = 'Create a new task to get started',
  emptyActionLabel,
  onEmptyAction,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onStatusChange,
  showTeam = false,
}) => {
  // Loading state
  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <TaskCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<TaskIcon />}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  // Grid view
  if (view === 'grid') {
    return (
      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <TaskCard
              task={task}
              onClick={onTaskClick}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              onStatusChange={onStatusChange}
              showTeam={showTeam}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  // List view
  return (
    <List disablePadding>
      {tasks.map((task, index) => (
        <ListItem
          key={task.id}
          disablePadding
          sx={{
            borderBottom: index < tasks.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ width: '100%', py: 1 }}>
            <TaskCard
              task={task}
              onClick={onTaskClick}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              onStatusChange={onStatusChange}
              showTeam={showTeam}
            />
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default TaskList;