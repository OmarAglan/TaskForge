import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  IconButton,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ChatBubbleOutline as CommentIcon,
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
import * as activityApi from '../../api/activity.api';
import { useTasks } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { Task, TaskStatus, UpdateTaskDto } from '../../types/task.types';
import { ActivityLog, getActionLabel } from '../../types/activity.types';
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
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Load task on mount
  useEffect(() => {
    if (id) {
      loadTask(id);
      loadTeams();
      loadTaskActivities(id);
    }
    return () => {
      clearCurrentTask();
    };
  }, [id, loadTask, loadTeams, clearCurrentTask]);

  const loadTaskActivities = async (taskId: string) => {
    setIsActivitiesLoading(true);
    try {
      const response = await activityApi.getEntityActivities('task', taskId, {
        page: 1,
        limit: 50,
      });
      setActivities(response.data);
    } catch {
      toast.error('Failed to load task activity');
    } finally {
      setIsActivitiesLoading(false);
    }
  };

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
    if (id) {
      loadTask(id);
      loadTaskActivities(id);
    }
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
      if (id) {
        loadTask(id);
        loadTaskActivities(id);
      }
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleAddComment = async () => {
    if (!currentTask) {
      return;
    }

    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      return;
    }

    setIsPostingComment(true);
    try {
      await activityApi.addTaskComment(currentTask.id, trimmedComment);
      setCommentText('');
      await loadTaskActivities(currentTask.id);
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const comments = activities.filter((activity) => {
    return typeof activity.metadata?.comment === 'string';
  });

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

          {/* Activity Feed */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity
            </Typography>
            {isActivitiesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : activities.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No activity yet.
              </Typography>
            ) : (
              <List disablePadding>
                {activities.map((activity, index) => {
                  const comment =
                    typeof activity.metadata?.comment === 'string'
                      ? activity.metadata.comment
                      : undefined;
                  const actorName = activity.user
                    ? getFullName(activity.user)
                    : 'System';

                  return (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start" disablePadding sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: comment ? 'secondary.main' : 'primary.main' }}>
                            {comment ? <CommentIcon fontSize="small" /> : actorName.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              <strong>{actorName}</strong> {getActionLabel(activity.action)}
                            </Typography>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              {comment && (
                                <Typography variant="body2" color="text.primary">
                                  {comment}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                      {index < activities.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Paper>

          {/* Comments */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>

            <Stack spacing={2}>
              <TextField
                multiline
                minRows={3}
                maxRows={6}
                placeholder="Add a comment..."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                fullWidth
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || isPostingComment}
                  startIcon={isPostingComment ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  Add Comment
                </Button>
              </Box>
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Recent comments
              </Typography>
              {comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No comments yet.
                </Typography>
              ) : (
                <List disablePadding>
                  {comments.map((commentActivity, index) => {
                    const commentAuthor = commentActivity.user
                      ? getFullName(commentActivity.user)
                      : 'User';
                    const commentBody =
                      typeof commentActivity.metadata?.comment === 'string'
                        ? commentActivity.metadata.comment
                        : '';

                    return (
                      <React.Fragment key={`${commentActivity.id}-comment`}>
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="medium">
                                {commentAuthor}
                              </Typography>
                            }
                            secondary={
                              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.primary">
                                  {commentBody}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(commentActivity.createdAt), 'MMM d, yyyy h:mm a')}
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItem>
                        {index < comments.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Box>
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
