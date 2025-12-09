import { create } from 'zustand';
import type { Task, CreateTaskDto, UpdateTaskDto, FilterTasksDto, TaskStatus } from '../types/task.types';
import type { PaginationMeta } from '../types/api.types';
import * as tasksApi from '../api/tasks.api';

interface TaskState {
  // State
  tasks: Task[];
  currentTask: Task | null;
  filters: FilterTasksDto;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: (filters?: FilterTasksDto) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  fetchMyTasks: (filters?: Omit<FilterTasksDto, 'assigneeId'>) => Promise<void>;
  fetchTeamTasks: (teamId: string, filters?: Omit<FilterTasksDto, 'teamId'>) => Promise<void>;
  createTask: (data: CreateTaskDto) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskDto) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  assignTask: (id: string, assigneeId: string) => Promise<Task>;
  unassignTask: (id: string) => Promise<Task>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<Task>;
  setFilters: (filters: FilterTasksDto) => void;
  clearFilters: () => void;
  clearCurrentTask: () => void;
  clearError: () => void;
}

const defaultFilters: FilterTasksDto = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
};

export const useTaskStore = create<TaskState>()((set, get) => ({
  // Initial state
  tasks: [],
  currentTask: null,
  filters: defaultFilters,
  pagination: null,
  isLoading: false,
  error: null,

  // Fetch all tasks
  fetchTasks: async (filters?: FilterTasksDto) => {
    const mergedFilters = { ...get().filters, ...filters };
    set({ isLoading: true, error: null, filters: mergedFilters });
    try {
      const response = await tasksApi.getTasks(mergedFilters);
      set({
        tasks: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Fetch single task
  fetchTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const task = await tasksApi.getTask(id);
      set({ currentTask: task, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch task';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Fetch my tasks
  fetchMyTasks: async (filters?: Omit<FilterTasksDto, 'assigneeId'>) => {
    const mergedFilters = { ...get().filters, ...filters };
    set({ isLoading: true, error: null, filters: mergedFilters });
    try {
      const response = await tasksApi.getMyTasks(mergedFilters);
      set({
        tasks: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch my tasks';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Fetch team tasks
  fetchTeamTasks: async (teamId: string, filters?: Omit<FilterTasksDto, 'teamId'>) => {
    const mergedFilters = { ...get().filters, ...filters, teamId };
    set({ isLoading: true, error: null, filters: mergedFilters });
    try {
      const response = await tasksApi.getTeamTasks(teamId, filters);
      set({
        tasks: response.data,
        pagination: response.meta,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch team tasks';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Create task
  createTask: async (data: CreateTaskDto) => {
    set({ isLoading: true, error: null });
    try {
      const task = await tasksApi.createTask(data);
      set((state) => ({
        tasks: [task, ...state.tasks],
        isLoading: false,
      }));
      return task;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await tasksApi.updateTask(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false,
      }));
      return updatedTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await tasksApi.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Assign task
  assignTask: async (id: string, assigneeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await tasksApi.assignTask(id, assigneeId);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false,
      }));
      return updatedTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign task';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Unassign task
  unassignTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await tasksApi.unassignTask(id);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false,
      }));
      return updatedTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unassign task';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Update task status
  updateTaskStatus: async (id: string, status: TaskStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await tasksApi.updateTaskStatus(id, status);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        isLoading: false,
      }));
      return updatedTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task status';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // Set filters
  setFilters: (filters: FilterTasksDto) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: defaultFilters });
  },

  // Clear current task
  clearCurrentTask: () => {
    set({ currentTask: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// Selectors
export const selectTasks = (state: TaskState) => state.tasks;
export const selectCurrentTask = (state: TaskState) => state.currentTask;
export const selectFilters = (state: TaskState) => state.filters;
export const selectPagination = (state: TaskState) => state.pagination;
export const selectIsLoading = (state: TaskState) => state.isLoading;
export const selectError = (state: TaskState) => state.error;