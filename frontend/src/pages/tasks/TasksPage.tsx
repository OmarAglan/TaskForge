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
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TaskList, TaskFilters, TaskDialog } from '../../components/tasks';
import { ConfirmDialog } from '../../components/shared';
import { useTasks } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { useRealtimeTasks } from '../../hooks/useRealtimeTasks';
import { Task, FilterTasksDto, CreateTaskDto, UpdateTaskDto } from '../../types/task.types';
import { TeamMember } from '../../types/team.types';
import { toast } from '../../utils/toast';
import * as teamsApi from '../../api/teams.api';

/**
 * Main tasks list page
 */
export const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    tasks,
    pagination,
    isLoading,
    filters,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
  } = useTasks();

  const { teams, loadTeams } = useTeams();

  // Initialize real-time task updates
  useRealtimeTasks();

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Load tasks and teams on mount
  useEffect(() => {
    loadTeams();

    // Parse URL params for initial filters
    const urlFilters: FilterTasksDto = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      search: searchParams.get('search') || undefined,
      teamId: searchParams.get('teamId') || undefined,
    };
    loadTasks(urlFilters);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));
    if (filters.search) params.set('search', filters.search);
    if (filters.teamId) params.set('teamId', filters.teamId);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    setSearchParams(params, { replace: true });
  }, [filters]);

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: 'grid' | 'list' | null) => {
    if (newView) setView(newView);
  };

  const handleFiltersChange = useCallback((newFilters: FilterTasksDto) => {
    setFilters({ ...newFilters, page: 1 });
    loadTasks({ ...newFilters, page: 1 });
  }, [setFilters, loadTasks]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters({ ...filters, page });
    loadTasks({ ...filters, page });
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy, page: 1 };
    setFilters(newFilters);
    loadTasks(newFilters);
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

  const handleCreateClick = () => {
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTask(undefined);
  };

  const handleDialogSuccess = (_task: Task) => {
    handleDialogClose();
    loadTasks(filters);
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

  const filterContent = (
    <TaskFilters
      filters={filters}
      onChange={handleFiltersChange}
      teams={teams}
      showTeamFilter
      compact={!isMobile}
    />
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Tasks
        </Typography>
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
        {/* Filters - Desktop */}
        {!isMobile && <Box sx={{ flex: 1 }}>{filterContent}</Box>}

        {/* Filter Button - Mobile */}
        {isMobile && (
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFilterDrawerOpen(true)}
          >
            Filters
          </Button>
        )}

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
        emptyTitle="No tasks found"
        emptyDescription="Create your first task or adjust your filters"
        emptyActionLabel="Create Task"
        onEmptyAction={handleCreateClick}
        onTaskClick={handleTaskClick}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
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

      {/* Filter Drawer - Mobile */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <TaskFilters
            filters={filters}
            onChange={(newFilters) => {
              handleFiltersChange(newFilters);
              setFilterDrawerOpen(false);
            }}
            teams={teams}
            showTeamFilter
          />
        </Box>
      </Drawer>

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

export default TasksPage;