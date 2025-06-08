import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import type { Mock } from 'vitest';

// Mock environment variables first
vi.mock('@/env.mjs', () => ({
  env: {
    AZURE_AD_CLIENT_ID: 'test-client-id',
    AZURE_AD_CLIENT_SECRET: 'test-client-secret', 
    AZURE_AD_TENANT_ID: 'test-tenant-id',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
    DATABASE_URL: 'postgresql://test',
    NODE_ENV: 'test'
  }
}));

// Mock the auth module to prevent NextAuth initialization
vi.mock('@/server/auth', () => ({
  getServerAuthSession: vi.fn(() => Promise.resolve(null)),
  authOptions: {}
}));

// Mock the Prisma client before importing anything else
vi.mock('@/server/db', () => ({
  db: {
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

// Mock the notification service to prevent initialization issues
vi.mock('@/server/services/notificationService', () => ({
  NotificationService: vi.fn().mockImplementation(() => ({
    createClientAssignmentNotification: vi.fn(),
    createAuditAssignmentNotification: vi.fn(),
    createAuditUpdateNotification: vi.fn(),
  })),
}));

// Mock RBAC utilities
vi.mock('@/server/api/utils/rbac', () => ({
  throwForbiddenError: vi.fn(),
  logAccessDecision: vi.fn(),
}));

// Mock permissions
vi.mock('@/policies/permissions', () => ({
  roleHasPermission: vi.fn(() => true),
}));

// Mock logger
vi.mock('@/server/api/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { notificationRouter } from '../notification';

// Create properly typed mock DB functions
const mockFindMany = vi.fn() as Mock;
const mockCount = vi.fn() as Mock;
const mockUpdateMany = vi.fn() as Mock;
const mockDeleteMany = vi.fn() as Mock;
const mockGroupBy = vi.fn() as Mock;

// Mock database with proper typing
const mockDb = {
  notification: {
    findMany: mockFindMany,
    count: mockCount,
    updateMany: mockUpdateMany,
    deleteMany: mockDeleteMany,
    groupBy: mockGroupBy,
  },
} as {
  notification: {
    findMany: Mock;
    count: Mock;
    updateMany: Mock;
    deleteMany: Mock;
    groupBy: Mock;
  };
};

// Mock context with proper types including expires
const mockContext = {
  headers: new Headers(),
  db: mockDb as typeof mockDb, // Use proper type instead of any
  session: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin' // Should be string, not object
    },
    expires: '2024-12-31T23:59:59.999Z'
  }
};

// Create caller for testing
const caller = notificationRouter.createCaller(mockContext);

describe('Notification Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUnread', () => {
    it('should fetch unread notifications for current user', async () => {
      const mockNotifications = [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          type: 'client_assignment',
          message: 'Test notification',
          linkUrl: '/clients/123',
          isRead: false,
          entityId: 'client-123',
          createdAt: new Date(),
          createdByUser: {
            id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
            name: 'Creator',
            email: 'creator@example.com',
            role: { name: 'Manager' }
          }
        }
      ];

      mockFindMany.mockResolvedValue(mockNotifications);

      const result = await caller.getUnread({ limit: 20, offset: 0 });

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'test-user-id',
          isRead: false
        },
        select: expect.objectContaining({
          id: true,
          type: true,
          message: true,
          linkUrl: true,
          isRead: true,
          entityId: true,
          createdAt: true,
          createdByUser: expect.any(Object)
        }),
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0
      });

      expect(result).toEqual(mockNotifications);
    }, 5000); // 5 second timeout

    it('should handle database errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Database error'));

      await expect(caller.getUnread({})).rejects.toThrow(TRPCError);
    }, 5000);
  });

  describe('getCount', () => {
    it('should return unread notification count', async () => {
      mockCount.mockResolvedValue(5);

      const result = await caller.getCount();

      expect(mockCount).toHaveBeenCalledWith({
        where: {
          userId: 'test-user-id',
          isRead: false
        }
      });

      expect(result).toEqual({ count: 5 });
    }, 5000);

    it('should handle database errors', async () => {
      mockCount.mockRejectedValue(new Error('Database error'));

      await expect(caller.getCount()).rejects.toThrow(TRPCError);
    }, 5000);
  });

  describe('markAsRead', () => {
    it('should mark single notification as read', async () => {
      mockUpdateMany.mockResolvedValue({ count: 1 });

      const result = await caller.markAsRead({ notificationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' });

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'] },
          userId: 'test-user-id',
          isRead: false
        },
        data: { isRead: true }
      });

      expect(result).toEqual({
        success: true,
        updatedCount: 1,
        message: 'Marked 1 notification(s) as read'
      });
    }, 5000);

    it('should mark multiple notifications as read', async () => {
      mockUpdateMany.mockResolvedValue({ count: 2 });

      const result = await caller.markAsRead({ 
        notificationIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f23456789012'] 
      });

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f23456789012'] },
          userId: 'test-user-id',
          isRead: false
        },
        data: { isRead: true }
      });

      expect(result).toEqual({
        success: true,
        updatedCount: 2,
        message: 'Marked 2 notification(s) as read'
      });
    }, 5000);

    it('should handle database errors', async () => {
      mockUpdateMany.mockRejectedValue(new Error('Database error'));

      await expect(caller.markAsRead({ notificationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })).rejects.toThrow(TRPCError);
    }, 5000);
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockUpdateMany.mockResolvedValue({ count: 3 });

      const result = await caller.markAllAsRead();

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          userId: 'test-user-id',
          isRead: false
        },
        data: { isRead: true }
      });

      expect(result).toEqual({
        success: true,
        updatedCount: 3,
        message: 'Marked 3 notification(s) as read'
      });
    }, 5000);

    it('should handle database errors', async () => {
      mockUpdateMany.mockRejectedValue(new Error('Database error'));

      await expect(caller.markAllAsRead()).rejects.toThrow(TRPCError);
    }, 5000);
  });

  describe('subscribe', () => {
    it('should return placeholder subscription data', async () => {
      const mockNotifications = [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          type: 'client_assignment',
          message: 'Test notification',
          linkUrl: '/clients/123',
          isRead: false,
          entityId: 'client-123',
          createdAt: new Date()
        }
      ];

      mockFindMany.mockResolvedValue(mockNotifications);

      const result = await caller.subscribe();

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          userId: 'test-user-id',
          isRead: false
        },
        select: expect.objectContaining({
          id: true,
          type: true,
          message: true,
          linkUrl: true,
          isRead: true,
          entityId: true,
          createdAt: true
        }),
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      expect(result).toEqual({
        type: 'initial_state',
        notifications: mockNotifications,
        timestamp: expect.any(String),
        note: 'This is a placeholder. Full real-time subscriptions require WebSocket infrastructure setup.'
      });
    }, 5000);

    it('should handle database errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Database error'));

      await expect(caller.subscribe()).rejects.toThrow(TRPCError);
    }, 5000);
  });
}); 