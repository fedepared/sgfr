export const ROLES = {
  COORDINATOR: 'coordinador',
  DRIVER: 'chofer',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
