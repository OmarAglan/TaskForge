import { useCallback, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import type { CreateTaskDto, UpdateTaskDto, FilterTasksDto, TaskStatus } from '../types/task.types';
import { toast } from '../utils/toast';

/**
 * Hook for managing tasks
 */
export function useTasks() {
  const {
    tasks,
    currentTask,
    filters,
    pagination,
    isLoading,
    error,
    fetchTasks,
    fetchTask,
    fetchMyTasks,
    fetchTeamTasks,
    createTask: storeCreateTask,
    updateTask: storeUpdateTask,
    deleteTask: storeDeleteTask,
    assignTask: storeAssignTask,
    unassignTask: storeUnassignTask,
    updateTaskStatus: storeUpdateTaskStatus,
    setFilters,
    clearFilters,
    clearCurrentTask,
    clearError,
  } = useTaskStore();

  // Load tasks with filters
  const loadTasks = useCallback(
    async (filterOptions?: FilterTasksDto) => {
      try {
        await fetchTasks(filterOptions);
      } catch (err) {
        toast.error('Failed to load tasks');
      }
    },
    [fetchTasks]
  );

  // Load specific task
  const loadTask = useCallback(
    async (id: string) => {
      try {
        await fetchTask(id);
      } catch (err) {
        toast.error('Failed to load task details');
      }
    },
    [fetchTask]
  );

  // Load my tasks
  const loadMyTasks = useCallback(
    async (filterOptions?: Omit<FilterTasksDto, 'assigneeId'>) => {
      try {
        await fetchMyTasks(filterOptions);
      } catch (err) {
        toast.error('Failed to load your tasks');
      }
    },
    [fetchMyTasks]
  );

  // Load team tasks
  const loadTeamTasks = useCallback(
    async (teamId: string, filterOptions?: Omit<FilterTasksDto, 'teamId'>) => {
      try {
        await fetchTeamTasks(teamId, filterOptions);
      } catch (err) {
        toast.error('Failed to load team tasks');
      }
    },
    [fetchTeamTasks]
  );

  // Create task with toast feedback
  const createTask = useCallback(
    async (data: CreateTaskDto) => {
      try {
        const task = await storeCreateTask(data);
        toast.success('Task created successfully');
        return task;
      } catch (err) {
        toast.error('Failed to create task');
        throw err;
      }
    },
    [storeCreateTask]
  );

  // Update task with toast feedback
  const updateTask = useCallback(
    async (id: string, data: UpdateTaskDto) => {
      try {
        const task = await storeUpdateTask(id, data);
        toast.success('Task updated successfully');
        return task;
      } catch (err) {
        toast.error('Failed to update task');
        throw err;
      }
    },
    [storeUpdateTask]
  );

  // Delete task with toast feedback
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await storeDeleteTask(id);
        toast.success('Task deleted successfully');
      } catch (err) {
        toast.error('Failed to delete task');
        throw err;
      }
    },
    [storeDeleteTask]
  );

  // Assign task with toast feedback
  const assignTask = useCallback(
    async (id: string, assigneeId: string) => {
      try {
        const task = await storeAssignTask(id, assigneeId);
        toast.success('Task assigned successfully');
        return task;
      } catch (err) {
        toast.error('Failed to assign task');
        throw err;
      }
    },
    [storeAssignTask]
  );

  // Unassign task with toast feedback
  const unassignTask = useCallback(
    async (id: string) => {
      try {
        const task = await storeUnassignTask(id);
        toast.success('Task unassigned successfully');
        return task;
      } catch (err) {
        toast.error('Failed to unassign task');
        throw err;
      }
    },
    [storeUnassignTask]
  );

  // Update task status with toast feedback
  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      try {
        const task = await storeUpdateTaskStatus(id, status);
        toast.success('Task status updated');
        return task;
      } catch (err) {
        toast.error('Failed to update task status');
        throw err;
      }
    },
    [storeUpdateTaskStatus]
  );

  // Apply filters
  const applyFilters = useCallback(
    (newFilters: FilterTasksDto) => {
      setFilters(newFilters);
      loadTasks(newFilters);
    },
    [setFilters, loadTasks]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    clearFilters();
    loadTasks();
  }, [clearFilters, loadTasks]);

  return {
    // State
    tasks,
    currentTask,
    filters,
    pagination,
    isLoading,
    error,

    // Actions
    loadTasks,
    loadTask,
    loadMyTasks,
    loadTeamTasks,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    unassignTask,
    updateTaskStatus,
    applyFilters,
    resetFilters,
    setFilters,
    clearFilters,
    clearCurrentTask,
    clearError,
  };
}

/**
 * Hook to load tasks on component mount
 */
export function useTasksLoader(filters?: FilterTasksDto) {
  const { loadTasks, tasks, isLoading, error, pagination } = useTasks();

  useEffect(() => {
    loadTasks(filters);
  }, [loadTasks, JSON.stringify(filters)]);

  return { tasks, isLoading, error, pagination };
}

/**
 * Hook to load my tasks on component mount
 */
export function useMyTasksLoader(filters?: Omit<FilterTasksDto, 'assigneeId'>) {
  const { loadMyTasks, tasks, isLoading, error, pagination } = useTasks();

  useEffect(() => {
    loadMyTasks(filters);
  }, [loadMyTasks, JSON.stringify(filters)]);

  return { tasks, isLoading, error, pagination };
}

export default useTasks;