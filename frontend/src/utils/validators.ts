import { z } from 'zod';

/**
 * Common validation patterns
 */
export const patterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
  phone: /^\+?[1-9]\d{1,14}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]|[^a-zA-Z0-9]/, 'Password must contain at least one number or special character'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Profile update form validation schema
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  avatarUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Change password form validation schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]|[^a-zA-Z0-9]/, 'Password must contain at least one number or special character'),
  confirmNewPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Team creation/update form validation schema
 */
export const teamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export type TeamFormData = z.infer<typeof teamSchema>;

/**
 * Task creation/update form validation schema
 */
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .min(3, 'Task title must be at least 3 characters')
    .max(200, 'Task title must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  status: z
    .enum(['todo', 'in_progress', 'in_review', 'completed', 'cancelled'])
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .optional(),
  dueDate: z
    .string()
    .optional(),
  teamId: z
    .string()
    .min(1, 'Team is required'),
  assigneeId: z
    .string()
    .optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

/**
 * Add team member form validation schema
 */
export const addMemberSchema = z.object({
  userId: z
    .string()
    .min(1, 'User is required'),
  role: z
    .enum(['owner', 'admin', 'member'])
    .optional()
    .default('member'),
});

export type AddMemberFormData = z.infer<typeof addMemberSchema>;

/**
 * Email validation helper
 */
export function isValidEmail(email: string): boolean {
  return patterns.email.test(email);
}

/**
 * Password strength validation helper
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]|[^a-zA-Z0-9]/.test(password)
  );
}

/**
 * Calculate password strength (0-100)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password)) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]|[^a-zA-Z0-9]/.test(password)) strength += 25;
  return strength;
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  if (strength <= 25) return 'Weak';
  if (strength <= 50) return 'Fair';
  if (strength <= 75) return 'Good';
  return 'Strong';
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(strength: number): 'error' | 'warning' | 'info' | 'success' {
  if (strength <= 25) return 'error';
  if (strength <= 50) return 'warning';
  if (strength <= 75) return 'info';
  return 'success';
}