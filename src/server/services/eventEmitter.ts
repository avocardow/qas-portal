import { EventEmitter } from 'events';

/**
 * Notification Read Status Update Event Data
 */
export interface NotificationReadStatusEvent {
  userId: string;
  notificationIds: string[];
  isRead: boolean;
  unreadCount: number;
  timestamp: Date;
}

/**
 * New Notification Event Data
 */
export interface NewNotificationEvent {
  userId: string;
  notificationId: string;
  type: string;
  message: string;
  linkUrl?: string;
  entityId?: string;
  createdAt: Date;
  unreadCount: number;
  timestamp: Date;
}

/**
 * Notification Event Types
 */
export type NotificationEventType = 
  | 'notification:read:status'  // Read status changed for specific notifications
  | 'notification:read:all'     // All notifications marked as read
  | 'notification:new';         // New notification created

/**
 * Global Event Emitter for real-time notification synchronization
 * 
 * This singleton EventEmitter handles broadcasting notification events
 * to all connected WebSocket clients for the same user across multiple devices.
 */
class NotificationEventEmitter extends EventEmitter {
  private static instance: NotificationEventEmitter;

  private constructor() {
    super();
    
    // Set max listeners to handle multiple concurrent WebSocket connections
    this.setMaxListeners(100);
    
    // Add error handling for uncaught event errors
    this.on('error', (error) => {
      console.error('NotificationEventEmitter error:', error);
    });
  }

  /**
   * Get the singleton instance of the event emitter
   */
  public static getInstance(): NotificationEventEmitter {
    if (!NotificationEventEmitter.instance) {
      NotificationEventEmitter.instance = new NotificationEventEmitter();
    }
    return NotificationEventEmitter.instance;
  }

  /**
   * Broadcast notification read status change to all user sessions
   */
  public broadcastReadStatusChange(data: NotificationReadStatusEvent): void {
    const eventKey = `notification:read:status:${data.userId}`;
    this.emit(eventKey, data);
    
    // Also emit to general read status channel for debugging
    this.emit('notification:read:status', data);
  }

  /**
   * Broadcast bulk read operation (mark all as read)
   */
  public broadcastBulkReadStatusChange(data: NotificationReadStatusEvent): void {
    const eventKey = `notification:read:all:${data.userId}`;
    this.emit(eventKey, data);
    
    // Also emit to general bulk read channel
    this.emit('notification:read:all', data);
  }

  /**
   * Broadcast new notification to user sessions
   */
  public broadcastNewNotification(data: NewNotificationEvent): void {
    const eventKey = `notification:new:${data.userId}`;
    this.emit(eventKey, data);
    
    // Also emit to general new notification channel for debugging
    this.emit('notification:new', data);
  }

  /**
   * Subscribe to read status changes for a specific user
   */
  public subscribeToUserReadStatus(userId: string, callback: (data: NotificationReadStatusEvent) => void): void {
    const eventKey = `notification:read:status:${userId}`;
    this.on(eventKey, callback);
  }

  /**
   * Subscribe to bulk read status changes for a specific user
   */
  public subscribeToUserBulkReadStatus(userId: string, callback: (data: NotificationReadStatusEvent) => void): void {
    const eventKey = `notification:read:all:${userId}`;
    this.on(eventKey, callback);
  }

  /**
   * Subscribe to new notifications for a specific user
   */
  public subscribeToUserNewNotifications(userId: string, callback: (data: NewNotificationEvent) => void): void {
    const eventKey = `notification:new:${userId}`;
    this.on(eventKey, callback);
  }

  /**
   * Unsubscribe from user events (cleanup on disconnect)
   */
  public unsubscribeFromUser(userId: string, callback: (data: NotificationReadStatusEvent) => void): void {
    const readStatusKey = `notification:read:status:${userId}`;
    const bulkReadKey = `notification:read:all:${userId}`;
    
    this.off(readStatusKey, callback);
    this.off(bulkReadKey, callback);
  }

  /**
   * Unsubscribe from new notification events
   */
  public unsubscribeFromUserNewNotifications(userId: string, callback: (data: NewNotificationEvent) => void): void {
    const newNotificationKey = `notification:new:${userId}`;
    this.off(newNotificationKey, callback);
  }

  /**
   * Get current listener count for debugging
   */
  public getListenerCount(): Record<string, number> {
    const eventNames = this.eventNames();
    const counts: Record<string, number> = {};
    
    for (const eventName of eventNames) {
      counts[eventName.toString()] = this.listenerCount(eventName);
    }
    
    return counts;
  }

  /**
   * Clean up stale listeners (called periodically for maintenance)
   */
  public cleanup(): void {
    const eventNames = this.eventNames();
    
    for (const eventName of eventNames) {
      const listenerCount = this.listenerCount(eventName);
      
      // Log listener counts for monitoring
      if (listenerCount > 10) {
        console.warn(`High listener count for ${eventName.toString()}: ${listenerCount}`);
      }
    }
  }
}

// Export singleton instance
export const notificationEventEmitter = NotificationEventEmitter.getInstance(); 