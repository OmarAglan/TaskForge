import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';

export interface TaskCardSkeletonProps {
  count?: number;
  variant?: 'list' | 'card';
}

/**
 * Skeleton loader for TaskCard component - card variant
 */
export const TaskCardSkeleton: React.FC<{ showActions?: boolean }> = ({ showActions = true }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header with priority and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Skeleton variant="rounded" width={60} height={22} />
          {showActions && <Skeleton variant="circular" width={28} height={28} />}
        </Box>

        {/* Title */}
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 0.5 }} />
        
        {/* Description */}
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="70%" sx={{ mb: 2 }} />

        {/* Footer with assignee, status, due date */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="text" width={60} />
          </Box>
          <Skeleton variant="rounded" width={80} height={22} />
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton loader for TaskCard component - list item variant
 */
export const TaskListItemSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Checkbox placeholder */}
      <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 0.5 }} />
      
      {/* Task info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton variant="text" width="60%" height={22} />
        <Skeleton variant="text" width="40%" height={18} />
      </Box>
      
      {/* Priority chip */}
      <Skeleton variant="rounded" width={60} height={22} />
      
      {/* Status chip */}
      <Skeleton variant="rounded" width={80} height={22} />
      
      {/* Assignee avatar */}
      <Skeleton variant="circular" width={32} height={32} />
      
      {/* Due date */}
      <Skeleton variant="text" width={80} />
      
      {/* Actions */}
      <Skeleton variant="circular" width={28} height={28} />
    </Box>
  );
};

/**
 * Multiple task card skeletons
 */
export const TaskCardSkeletonGrid: React.FC<TaskCardSkeletonProps> = ({ count = 6, variant = 'card' }) => {
  if (variant === 'list') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <TaskListItemSkeleton key={index} />
        ))}
      </Box>
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </>
  );
};

export default TaskCardSkeleton;