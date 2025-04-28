import { describe, expect, test } from 'vitest';
import {
  hasPermission,
  canAccessPermission,
  listPermissions,
} from '@/utils/permissionUtils';
import {
  AUDIT_PERMISSIONS,
  TASK_PERMISSIONS,
  DOCUMENT_PERMISSIONS,
  PHONE_PERMISSIONS,
} from '@/constants/permissions';

describe('permissionUtils', () => {
  describe('hasPermission', () => {
    test('returns false when role is null', () => {
      expect(hasPermission(null, TASK_PERMISSIONS.GET_ALL)).toBe(false);
    });

    test('Developer bypasses all checks', () => {
      expect(hasPermission('Developer', 'any.permission')).toBe(true);
    });

    test('Admin has specific permission', () => {
      expect(hasPermission('Admin', AUDIT_PERMISSIONS.CREATE)).toBe(true);
    });

    test('Client does not have task:create', () => {
      expect(hasPermission('Client', TASK_PERMISSIONS.CREATE)).toBe(false);
    });
  });

  describe('canAccessPermission', () => {
    test('Admin can access document.getByClientId', () => {
      expect(canAccessPermission('Admin', DOCUMENT_PERMISSIONS.GET_BY_CLIENT_ID)).toBe(true);
    });

    test('Staff cannot access document.getByClientId', () => {
      expect(canAccessPermission('Staff', DOCUMENT_PERMISSIONS.GET_BY_CLIENT_ID)).toBe(false);
    });
  });

  describe('listPermissions', () => {
    test('returns empty array for null role', () => {
      expect(listPermissions(null)).toEqual([]);
    });

    test('Developer returns all permissions', () => {
      const perms = listPermissions('Developer');
      const expected = [
        ...Object.values(AUDIT_PERMISSIONS),
        ...Object.values(TASK_PERMISSIONS),
        ...Object.values(DOCUMENT_PERMISSIONS),
        ...Object.values(PHONE_PERMISSIONS),
      ];
      expect(perms).toEqual(expect.arrayContaining(expected));
      expect(perms).toHaveLength(expected.length);
    });
  });
}); 