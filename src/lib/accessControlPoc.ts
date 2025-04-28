// Creating AccessControl proof-of-concept grant definitions
import AccessControl from 'accesscontrol';

export type Role = 'user' | 'admin';

export const grantsObject = {
  user: {
    Article: {
      'read:any': ['*'],
      'update:own': ['*'],
    },
  },
  admin: {
    Article: {
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
  },
};

const ac = new AccessControl(grantsObject);

/**
 * Check if a role can perform a given action on Article
 */
export function canReadAny(role: Role): boolean {
  return ac.can(role).readAny('Article').granted;
}

export function canUpdateOwn(role: Role): boolean {
  return ac.can(role).updateOwn('Article').granted;
}

export function canDeleteAny(role: Role): boolean {
  return ac.can(role).deleteAny('Article').granted;
} 