/**
 * Application Constants
 * =====================
 * Shared constant variables for frontend configuration.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ims_access_token',
  REFRESH_TOKEN: 'ims_refresh_token',
  USER: 'ims_user',
};

export const ROLES = {
  ADMIN: 'ADMIN' as const,
  TEACHER: 'TEACHER' as const,
  STUDENT: 'STUDENT' as const,
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT]: 'Student',
};
