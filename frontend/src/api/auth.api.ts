import { get, patch, post, setTokens, clearTokens } from './client';
import type { User, UpdateUserDto, ChangePasswordDto } from '../types/user.types';
import type { LoginDto, RegisterDto, AuthResponse } from '../types/auth.types';

/**
 * Login user with email and password
 */
export async function login(data: LoginDto): Promise<AuthResponse> {
  const response = await post<AuthResponse>('/auth/login', data);
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

/**
 * Register a new user
 */
export async function register(data: RegisterDto): Promise<AuthResponse> {
  const response = await post<AuthResponse>('/auth/register', data);
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await post<void>('/auth/logout');
  } finally {
    clearTokens();
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await post<AuthResponse>('/auth/refresh', { refreshToken });
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User> {
  return get<User>('/users/me');
}

/**
 * Update current user profile
 */
export async function updateProfile(data: UpdateUserDto): Promise<User> {
  return patch<User>('/users/me', data);
}

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordDto): Promise<void> {
  await patch<void>('/users/me/password', data);
}
