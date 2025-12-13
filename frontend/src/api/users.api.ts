import { get } from './client';
import type { User } from '../types/user.types';

/**
 * Get all users (admin only)
 */
export async function getUsers(): Promise<User[]> {
  return get<User[]>('/users');
}

/**
 * Get user by ID
 */
export async function getUser(id: string): Promise<User> {
  return get<User>(`/users/${id}`);
}

/**
 * Search users by email or name
 */
export async function searchUsers(query: string): Promise<User[]> {
  return get<User[]>('/users/search', { query });
}