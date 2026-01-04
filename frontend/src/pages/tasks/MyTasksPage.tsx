import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TaskList, TaskFilters, TaskDialog } from '../../components/tasks';
import { ConfirmDialog } from '../../components/shared';
import { useTasks } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { Task, FilterTasksDto, CreateTaskDto, UpdateTaskDto } from '../../types/task.types';
import { TeamMember } from '../../types/team.types';
import { toast } from '../../utils/toast';
import * as teamsApi from '../../api/teams.api';

/**
 * User's assigned tasks page
 */
export const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    tasks,
    pagination,
    isLoading,
    filters,
    loadMyTasks,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
  } = useTasks();

  const { teams, loadTeams } = useTeams();

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load my tasks and teams on mount
  useEffect(() => {
    loadTeams();
    loadMyTasks({ page: 1, limit: 12 });
  }, []);

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: 'grid' | 'list' | null) => {
    if (newView) setView(newView);
  };

  const handleFiltersChange = useCallback((newFilters: FilterTasksDto) => {
    setFilters({ ...newFilters, page: 1 });
    loadMyTasks({ ...newFilters, page: 1 });
  }, [setFilters, loadMyTasks]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters({ ...filters, page });
    loadMyTasks({ ...filters, page });
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy, page: 1 };
    setFilters(newFilters);
    loadMyTasks(newFilters);
  };

  const handleTaskClick = useCallback((task: Task) => {
    navigate(`/tasks/${task.id}`);
  }, [navigate]);

  const handleTaskEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  const handleTaskDelete = useCallback((task: Task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  }, []);

  const handleStatusChange = useCallback((task: Task) => {
    // Quick status change - navigate to task detail
    navigate(`/tasks/${task.id}`);
  }, [navigate]);

  const handleCreateClick = () => {
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTask(undefined);
  };

  const handleDialogSuccess = (task: Task) => {
    handleDialogClose();
    loadMyTasks(filters);
    toast.success(editingTask ? 'Task updated successfully' : 'Task created successfully');
  };

  const handleSubmit = async (data: CreateTaskDto | UpdateTaskDto): Promise<Task> => {
    if (editingTask) {
      return await updateTask(editingTask.id, data as UpdateTaskDto);
    } else {
      return await createTask(data as CreateTaskDto);
    }
  };

  const handleLoadTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    return await teamsApi.getTeamMembers(teamId);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      toast.success('Task deleted successfully');
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
      loadMyTasks(filters);
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            My Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tasks assigned to you
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Create Task
        </Button>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        {/* Filters */}
        <Box sx={{ flex: 1 }}>
          <TaskFilters
            filters={filters}
            onChange={handleFiltersChange}
            teams={teams}
            showTeamFilter
            showAssigneeFilter={false}
            compact
          />
        </Box>

        {/* View Toggle and Sort */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-select-label">Sort by</InputLabel>
            <Select
              labelId="sort-select-label"
              value={filters.sortBy || 'createdAt'}
              label="Sort by"
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="dueDate">Due Date</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Task List */}
      <TaskList
        tasks={tasks}
        loading={isLoading}
        view={view}
        emptyTitle="No tasks assigned to you"
        emptyDescription="You don't have any tasks assigned. Create a new task or ask your team to assign one to you."
        emptyActionLabel="Create Task"
        onEmptyAction={handleCreateClick}
        onTaskClick={handleTaskClick}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        onStatusChange={handleStatusChange}
        showTeam
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <TaskDialog
        open={dialogOpen}
        task={editingTask}
        teams={teams}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        onSubmit={handleSubmit}
        onLoadTeamMembers={handleLoadTeamMembers}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Task"
        message={
          <>
            Are you sure you want to delete <strong>{taskToDelete?.title}</strong>?
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        isLoading={isDeleting}
        showWarningIcon
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
};

export default MyTasksPage;