import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError, ApiResponse } from '../types/api.types';

// Storage keys
const ACCESS_TOKEN_KEY = 'taskforge_access_token';
const REFRESH_TOKEN_KEY = 'taskforge_refresh_token';

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set tokens in storage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear tokens from storage
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if user is authenticated (has tokens)
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Process failed request queue after token refresh
 */
function processQueue(error: Error | null, token: string | null = null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

/**
 * Request interceptor - Add authorization header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle token refresh and errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token, logout user
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token
        const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        setTokens(newAccessToken, newRefreshToken);

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process queued requests
        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as Error, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Transform error to consistent format
    const apiError: ApiError = {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      error: error.response?.data?.error,
      path: error.config?.url,
    };

    return Promise.reject(apiError);
  }
);

/**
 * Generic GET request
 */
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params });
  return response.data.data;
}

/**
 * Generic POST request
 */
export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data);
  return response.data.data;
}

/**
 * Generic PUT request
 */
export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data);
  return response.data.data;
}

/**
 * Generic PATCH request
 */
export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(url, data);
  return response.data.data;
}

/**
 * Generic DELETE request
 */
export async function del<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url);
  return response.data.data;
}

export default apiClient;