/**
 * Application constants
 */

// Environment variables
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'TaskForge';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'taskforge_access_token',
  REFRESH_TOKEN: 'taskforge_refresh_token',
  USER: 'taskforge_user',
  THEME: 'taskforge_theme',
  SIDEBAR_COLLAPSED: 'taskforge_sidebar_collapsed',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/',
  TEAMS: '/teams',
  TEAM_DETAILS: '/teams/:id',
  TEAM_NEW: '/teams/new',
  TASKS: '/tasks',
  TASK_DETAILS: '/tasks/:id',
  TASK_NEW: '/tasks/new',
  ANALYTICS: '/analytics',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_PROFILE: '/auth/profile',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USERS_SEARCH: '/users/search',

  // Teams
  TEAMS: '/teams',
  TEAM_BY_ID: (id: string) => `/teams/${id}`,
  TEAM_MEMBERS: (teamId: string) => `/teams/${teamId}/members`,
  TEAM_MEMBER: (teamId: string, memberId: string) => `/teams/${teamId}/members/${memberId}`,

  // Tasks
  TASKS: '/tasks',
  TASK_BY_ID: (id: string) => `/tasks/${id}`,
  MY_TASKS: '/tasks/my',
  TEAM_TASKS: (teamId: string) => `/teams/${teamId}/tasks`,

  // Activity
  ACTIVITY: '/activity',
  MY_ACTIVITY: '/activity/my',
  ACTIVITY_RECENT: '/activity/recent',
  ACTIVITY_STATS: '/activity/stats',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
} as const;

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  TIME_ONLY: 'h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  INPUT: 'yyyy-MM-dd',
} as const;

// Status colors mapping
export const STATUS_COLORS = {
  todo: 'default',
  in_progress: 'primary',
  in_review: 'info',
  completed: 'success',
  cancelled: 'error',
} as const;

// Priority colors mapping
export const PRIORITY_COLORS = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
} as const;

// Drawer width
export const DRAWER_WIDTH = 260;

// Snackbar duration
export const SNACKBAR_DURATION = 3000;