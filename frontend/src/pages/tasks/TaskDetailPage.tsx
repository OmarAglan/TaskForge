import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import {
  TaskDialog,
  TaskStatusChip,
  TaskPriorityChip,
  TaskAssigneeAvatar,
  TaskDueDateBadge,
  TaskStatusSelect,
} from '../../components/tasks';
import { ConfirmDialog, EmptyState } from '../../components/shared';
import { useTasks } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { Task, TaskStatus, TaskPriority, UpdateTaskDto, getStatusLabel, getPriorityLabel } from '../../types/task.types';
import { TeamMember } from '../../types/team.types';
import { getFullName } from '../../types/user.types';
import { toast } from '../../utils/toast';
import * as teamsApi from '../../api/teams.api';

/**
 * Individual task detail page
 */
export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentTask,
    isLoading,
    loadTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    clearCurrentTask,
  } = useTasks();

  const { teams, loadTeams } = useTeams();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load task on mount
  useEffect(() => {
    if (id) {
      loadTask(id);
      loadTeams();
    }
    return () => {
      clearCurrentTask();
    };
  }, [id, loadTask, loadTeams, clearCurrentTask]);

  const handleBack = () => {
    navigate('/tasks');
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    if (id) loadTask(id);
    toast.success('Task updated successfully');
  };

  const handleEditSubmit = async (data: UpdateTaskDto): Promise<Task> => {
    if (!currentTask) throw new Error('No task to update');
    return await updateTask(currentTask.id, data);
  };

  const handleLoadTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    return await teamsApi.getTeamMembers(teamId);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      if (id) loadTask(id);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentTask) return;

    setIsDeleting(true);
    try {
      await deleteTask(currentTask.id);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentTask) {
    return (
      <EmptyState
        title="Task not found"
        description="The task you're looking for doesn't exist or you don't have access to it."
        actionLabel="Back to Tasks"
        onAction={handleBack}
      />
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/tasks" underline="hover" color="inherit">
          Tasks
        </Link>
        <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>
          {currentTask.title}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mt: 0.5 }}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h4" fontWeight="bold">
              {currentTask.title}
            </Typography>
            <TaskPriorityChip priority={currentTask.priority} />
            <TaskStatusChip status={currentTask.status} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color={currentTask.description ? 'text.primary' : 'text.secondary'}>
              {currentTask.description || 'No description provided'}
            </Typography>
          </Paper>

          {/* Activity/Comments Placeholder */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Activity log and comments will be available in a future update.
            </Typography>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>

            {/* Status */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <TaskStatusSelect
                taskId={currentTask.id}
                currentStatus={currentTask.status}
                onChange={handleStatusChange}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Priority */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Priority
              </Typography>
              <TaskPriorityChip priority={currentTask.priority} />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Assignee */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Assigned To
              </Typography>
              {currentTask.assignee ? (
                <TaskAssigneeAvatar user={currentTask.assignee} showName size="medium" />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Unassigned
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Team */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Team
              </Typography>
              <Typography variant="body1">
                {currentTask.team?.name || 'Unknown team'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Due Date */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Due Date
              </Typography>
              {currentTask.dueDate ? (
                <TaskDueDateBadge dueDate={currentTask.dueDate} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No due date
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Created By */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Created By
              </Typography>
              {currentTask.createdBy ? (
                <Typography variant="body1">
                  {getFullName(currentTask.createdBy)}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Unknown
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Timestamps */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Created
              </Typography>
              <Typography variant="body2">
                {format(new Date(currentTask.createdAt), 'MMM d, yyyy h:mm a')}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Updated
              </Typography>
              <Typography variant="body2">
                {format(new Date(currentTask.updatedAt), 'MMM d, yyyy h:mm a')}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <TaskDialog
        open={editDialogOpen}
        task={currentTask}
        teams={teams}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
        onSubmit={handleEditSubmit}
        onLoadTeamMembers={handleLoadTeamMembers}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Task"
        message={
          <>
            Are you sure you want to delete <strong>{currentTask.title}</strong>?
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        isLoading={isDeleting}
        showWarningIcon
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
};

export default TaskDetailPage;