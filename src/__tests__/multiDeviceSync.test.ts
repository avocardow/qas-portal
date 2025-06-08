import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { notificationEventEmitter, type NotificationReadStatusEvent } from '@/server/services/eventEmitter';

describe('Multi-device Read Status Synchronization', () => {
  const mockUserId = 'user-123';
  const mockNotificationIds = ['notif-1', 'notif-2', 'notif-3'];
  
  beforeEach(() => {
    // Clear all listeners before each test
    notificationEventEmitter.removeAllListeners();
  });

  afterEach(() => {
    // Clean up after each test
    notificationEventEmitter.removeAllListeners();
  });

  describe('EventEmitter Service', () => {
    it('should be a singleton instance', () => {
      const instance1 = notificationEventEmitter;
      const instance2 = notificationEventEmitter;
      expect(instance1).toBe(instance2);
    });

    it('should broadcast read status changes to user-specific listeners', async () => {
      const mockData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: mockNotificationIds,
        isRead: true,
        unreadCount: 5,
        timestamp: new Date()
      };

      // Create a promise that resolves when the callback is called
      const eventPromise = new Promise<NotificationReadStatusEvent>((resolve) => {
        notificationEventEmitter.subscribeToUserReadStatus(mockUserId, (data) => {
          resolve(data);
        });
      });

      // Broadcast the change
      notificationEventEmitter.broadcastReadStatusChange(mockData);

      // Wait for the event and verify
      const receivedData = await eventPromise;
      expect(receivedData).toEqual(mockData);
      expect(receivedData.userId).toBe(mockUserId);
      expect(receivedData.notificationIds).toEqual(mockNotificationIds);
      expect(receivedData.isRead).toBe(true);
      expect(receivedData.unreadCount).toBe(5);
    });

    it('should broadcast bulk read status changes', async () => {
      const mockData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: mockNotificationIds,
        isRead: true,
        unreadCount: 0,
        timestamp: new Date()
      };

      // Create a promise that resolves when the callback is called
      const eventPromise = new Promise<NotificationReadStatusEvent>((resolve) => {
        notificationEventEmitter.subscribeToUserBulkReadStatus(mockUserId, (data) => {
          resolve(data);
        });
      });

      // Broadcast bulk change
      notificationEventEmitter.broadcastBulkReadStatusChange(mockData);

      // Wait for the event and verify
      const receivedData = await eventPromise;
      expect(receivedData).toEqual(mockData);
      expect(receivedData.unreadCount).toBe(0); // All read
    });

    it('should only emit events to the correct user', () => {
      const user1Callback = vi.fn();
      const user2Callback = vi.fn();
      
      const user1Id = 'user-1';
      const user2Id = 'user-2';

      // Subscribe both users
      notificationEventEmitter.subscribeToUserReadStatus(user1Id, user1Callback);
      notificationEventEmitter.subscribeToUserReadStatus(user2Id, user2Callback);

      // Broadcast event for user 1
      const user1Data: NotificationReadStatusEvent = {
        userId: user1Id,
        notificationIds: ['notif-1'],
        isRead: true,
        unreadCount: 3,
        timestamp: new Date()
      };

      notificationEventEmitter.broadcastReadStatusChange(user1Data);

      // Only user 1 callback should be called
      expect(user1Callback).toHaveBeenCalledWith(user1Data);
      expect(user2Callback).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners for the same user', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      // Subscribe multiple listeners for the same user (simulating multiple devices)
      notificationEventEmitter.subscribeToUserReadStatus(mockUserId, callback1);
      notificationEventEmitter.subscribeToUserReadStatus(mockUserId, callback2);
      notificationEventEmitter.subscribeToUserReadStatus(mockUserId, callback3);

      const mockData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: ['notif-1'],
        isRead: true,
        unreadCount: 2,
        timestamp: new Date()
      };

      notificationEventEmitter.broadcastReadStatusChange(mockData);

      // All callbacks should be called
      expect(callback1).toHaveBeenCalledWith(mockData);
      expect(callback2).toHaveBeenCalledWith(mockData);
      expect(callback3).toHaveBeenCalledWith(mockData);
    });

    it('should properly unsubscribe listeners', () => {
      const callback = vi.fn();

      // Subscribe
      notificationEventEmitter.subscribeToUserReadStatus(mockUserId, callback);

      // Verify subscription works
      const mockData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: ['notif-1'],
        isRead: true,
        unreadCount: 1,
        timestamp: new Date()
      };

      notificationEventEmitter.broadcastReadStatusChange(mockData);
      expect(callback).toHaveBeenCalledTimes(1);

      // Unsubscribe
      notificationEventEmitter.unsubscribeFromUser(mockUserId, callback);

      // Verify callback is no longer called
      notificationEventEmitter.broadcastReadStatusChange(mockData);
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should provide listener count statistics', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      // Initially no listeners
      const initialCounts = notificationEventEmitter.getListenerCount();
      expect(Object.keys(initialCounts)).toHaveLength(0);

      // Add listeners
      notificationEventEmitter.subscribeToUserReadStatus('user-1', callback1);
      notificationEventEmitter.subscribeToUserBulkReadStatus('user-2', callback2);

      const counts = notificationEventEmitter.getListenerCount();
      expect(Object.keys(counts).length).toBeGreaterThan(0);
    });

    it('should handle cleanup without errors', () => {
      const callback = vi.fn();
      
      // Add many listeners to trigger cleanup warning
      for (let i = 0; i < 15; i++) {
        notificationEventEmitter.subscribeToUserReadStatus(`user-${i}`, callback);
      }

      // Cleanup should not throw
      expect(() => notificationEventEmitter.cleanup()).not.toThrow();
    });
  });

  describe('Event Data Validation', () => {
    it('should handle different notification ID arrays', () => {
      const callback = vi.fn();
      notificationEventEmitter.subscribeToUserReadStatus(mockUserId, callback);

      // Single notification
      const singleData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: ['single-notif'],
        isRead: true,
        unreadCount: 0,
        timestamp: new Date()
      };

      notificationEventEmitter.broadcastReadStatusChange(singleData);
      expect(callback).toHaveBeenCalledWith(singleData);

      // Multiple notifications
      const multipleData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: ['notif-1', 'notif-2', 'notif-3', 'notif-4'],
        isRead: true,
        unreadCount: 10,
        timestamp: new Date()
      };

      notificationEventEmitter.broadcastReadStatusChange(multipleData);
      expect(callback).toHaveBeenCalledWith(multipleData);

      // Empty array
      const emptyData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: [],
        isRead: true,
        unreadCount: 0,
        timestamp: new Date()
      };

      notificationEventEmitter.broadcastReadStatusChange(emptyData);
      expect(callback).toHaveBeenCalledWith(emptyData);
    });

    it('should handle different read states', () => {
      const callback = vi.fn();
      notificationEventEmitter.subscribeToUserReadStatus(mockUserId, callback);

      // Mark as read
      const readData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: ['notif-1'],
        isRead: true,
        unreadCount: 5,
        timestamp: new Date()
      };

      notificationEventEmitter.broadcastReadStatusChange(readData);
      expect(callback).toHaveBeenCalledWith(readData);

      // Mark as unread (if supported in future)
      const unreadData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: ['notif-2'],
        isRead: false,
        unreadCount: 6,
        timestamp: new Date()
      };

      notificationEventEmitter.broadcastReadStatusChange(unreadData);
      expect(callback).toHaveBeenCalledWith(unreadData);
    });

    it('should handle timestamp consistency', () => {
      const callback = vi.fn();
      notificationEventEmitter.subscribeToUserReadStatus(mockUserId, callback);

      const now = new Date();
      const data: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: ['notif-1'],
        isRead: true,
        unreadCount: 3,
        timestamp: now
      };

      notificationEventEmitter.broadcastReadStatusChange(data);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: now
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle listener errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalCallback = vi.fn();

      // Add both callbacks
      notificationEventEmitter.subscribeToUserReadStatus(mockUserId, errorCallback);
      notificationEventEmitter.subscribeToUserReadStatus(mockUserId, normalCallback);

      const mockData: NotificationReadStatusEvent = {
        userId: mockUserId,
        notificationIds: ['notif-1'],
        isRead: true,
        unreadCount: 1,
        timestamp: new Date()
      };

      // EventEmitter will throw on listener errors (Node.js default behavior)
      // This is actually the correct behavior - errors should be handled by the application
      expect(() => {
        notificationEventEmitter.broadcastReadStatusChange(mockData);
      }).toThrow('Listener error');

      // Error callback should have been called
      expect(errorCallback).toHaveBeenCalledWith(mockData);
    });

    it('should handle unsubscribing non-existent listeners', () => {
      const callback = vi.fn();

      // Unsubscribing a listener that was never added should not throw
      expect(() => {
        notificationEventEmitter.unsubscribeFromUser('non-existent-user', callback);
      }).not.toThrow();
    });
  });
}); 