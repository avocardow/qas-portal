/**
 * Browser Notification Service
 * 
 * Provides browser push notification functionality using the Web Notification API.
 * Implements context-aware permission requests, graceful fallback to in-app notifications,
 * and integration with the existing QAS Portal notification system.
 */

import type {
  BrowserNotification,
  BrowserNotificationConfig,
  BrowserNotificationData,
  BrowserNotificationEventHandlers,
  BrowserNotificationPermission,
  BrowserNotificationResult,
  BrowserNotificationState,
  IBrowserNotificationService,
  PermissionRequestResult
} from '@/types/browserNotification';
import { DEFAULT_BROWSER_NOTIFICATION_CONFIG } from '@/types/browserNotification';

class BrowserNotificationService implements IBrowserNotificationService {
  private static instance: BrowserNotificationService | null = null;
  private state: BrowserNotificationState;
  private eventHandlers: BrowserNotificationEventHandlers = {};
  private activeNotifications: Map<string, Notification> = new Map();

  private constructor(config?: Partial<BrowserNotificationConfig>) {
    this.state = {
      permission: this.checkPermission(),
      isSupported: this.isSupported(),
      hasRequestedPermission: this.getStoredPermissionRequestState(),
      notificationQueue: [],
      config: { ...DEFAULT_BROWSER_NOTIFICATION_CONFIG, ...config }
    };

    // Set up permission change listener
    if (this.state.isSupported) {
      this.setupPermissionChangeListener();
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<BrowserNotificationConfig>): BrowserNotificationService {
    if (!BrowserNotificationService.instance) {
      BrowserNotificationService.instance = new BrowserNotificationService(config);
    }
    return BrowserNotificationService.instance;
  }

  /**
   * Check if browser notifications are supported
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && typeof Notification !== 'undefined';
  }

  /**
   * Get current permission state
   */
  public checkPermission(): BrowserNotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission as BrowserNotificationPermission;
  }

  /**
   * Request notification permission with context
   */
  public async requestPermission(): Promise<PermissionRequestResult> {
    if (!this.isSupported()) {
      return {
        permission: 'denied',
        wasRequested: false,
        error: 'Browser notifications not supported'
      };
    }

    const currentPermission = this.checkPermission();
    
    // If permission already granted or denied, don't request again
    if (currentPermission !== 'default') {
      return {
        permission: currentPermission,
        wasRequested: false
      };
    }

    try {
      // Store that we've requested permission
      this.setStoredPermissionRequestState(true);
      
      const permission = await Notification.requestPermission() as BrowserNotificationPermission;
      
      // Update state
      this.state.permission = permission;
      this.state.hasRequestedPermission = true;

      return {
        permission,
        wasRequested: true
      };
    } catch (error) {
      return {
        permission: 'denied',
        wasRequested: true,
        error: error instanceof Error ? error.message : 'Permission request failed'
      };
    }
  }

  /**
   * Create and display a browser notification
   */
  public async createNotification(notification: BrowserNotification): Promise<BrowserNotificationResult> {
    if (!this.state.config.enabled) {
      return {
        success: false,
        fallbackToInApp: true,
        reason: 'not_supported',
        error: 'Browser notifications disabled in config'
      };
    }

    if (!this.isSupported()) {
      return {
        success: false,
        fallbackToInApp: true,
        reason: 'not_supported',
        error: 'Browser notifications not supported'
      };
    }

    // Check permission and request if needed (context-aware)
    const currentPermission = this.checkPermission();
    
    if (currentPermission === 'default' && 
        this.state.config.requestPermissionOnFirstNotification && 
        !this.state.hasRequestedPermission) {
      
      const permissionResult = await this.requestPermission();

      if (permissionResult.permission !== 'granted') {
        return {
          success: false,
          fallbackToInApp: true,
          reason: 'permission_denied',
          error: 'Notification permission denied'
        };
      }
    } else if (currentPermission !== 'granted') {
      return {
        success: false,
        fallbackToInApp: true,
        reason: 'permission_denied',
        error: 'Notification permission not granted'
      };
    }

    // Validate notification data
    if (!this.validateNotificationData(notification)) {
      return {
        success: false,
        fallbackToInApp: true,
        reason: 'invalid_data',
        error: 'Invalid notification data'
      };
    }

    try {
      // Limit active notifications
      this.limitActiveNotifications();

      // Create notification options
      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge || this.state.config.defaultBadge,
        tag: notification.tag,
        data: notification.data,
        requireInteraction: notification.requireInteraction,
        silent: notification.silent
      };

      // Create the notification
      const browserNotification = new Notification(notification.title, options);

      // Store reference
      this.activeNotifications.set(notification.tag, browserNotification);

      // Set up event handlers
      this.setupNotificationEventHandlers(browserNotification, notification.data);

      // Auto-close after delay if configured
      if (this.state.config.autoCloseDelay && this.state.config.autoCloseDelay > 0) {
        setTimeout(() => {
          browserNotification.close();
        }, this.state.config.autoCloseDelay);
      }

      return {
        success: true,
        notification: browserNotification
      };

    } catch (error) {
      return {
        success: false,
        fallbackToInApp: true,
        reason: 'creation_failed',
        error: error instanceof Error ? error.message : 'Failed to create notification'
      };
    }
  }

  /**
   * Get current service state
   */
  public getState(): BrowserNotificationState {
    return { ...this.state };
  }

  /**
   * Update service configuration
   */
  public updateConfig(config: Partial<BrowserNotificationConfig>): void {
    this.state.config = { ...this.state.config, ...config };
  }

  /**
   * Set event handlers for notifications
   */
  public setEventHandlers(handlers: Partial<BrowserNotificationEventHandlers>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Clear all active notifications
   */
  public clearAllNotifications(): void {
    this.activeNotifications.forEach(notification => {
      notification.close();
    });
    this.activeNotifications.clear();
  }

  /**
   * Get count of active notifications
   */
  public getNotificationCount(): number {
    return this.activeNotifications.size;
  }

  // Private helper methods

  private validateNotificationData(notification: BrowserNotification): boolean {
    return Boolean(
      notification.title &&
      notification.body &&
      notification.icon &&
      notification.tag &&
      notification.data &&
      notification.data.notificationId &&
      notification.data.type
    );
  }

  private setupNotificationEventHandlers(notification: Notification, data: BrowserNotificationData): void {
    notification.onclick = (event) => {
      event.preventDefault();
      
      // Focus window
      if (typeof window !== 'undefined') {
        window.focus();
      }

      // Remove from active notifications
      this.activeNotifications.delete(data.notificationId);

      // Call custom handler
      if (this.eventHandlers.onClick) {
        this.eventHandlers.onClick(notification, data);
      }

      // Close notification
      notification.close();
    };

    notification.onclose = () => {
      // Remove from active notifications
      this.activeNotifications.delete(data.notificationId);

      // Call custom handler
      if (this.eventHandlers.onClose) {
        this.eventHandlers.onClose(notification, data);
      }
    };

    notification.onerror = (error) => {
      // Remove from active notifications
      this.activeNotifications.delete(data.notificationId);

      // Call custom handler
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(error, data);
      }
    };

    notification.onshow = () => {
      // Call custom handler
      if (this.eventHandlers.onShow) {
        this.eventHandlers.onShow(notification, data);
      }
    };
  }

  private limitActiveNotifications(): void {
    const maxNotifications = this.state.config.maxNotificationsShown;
    if (this.activeNotifications.size >= maxNotifications) {
      // Close oldest notifications
      const notifications = Array.from(this.activeNotifications.values());
      const toClose = notifications.slice(0, notifications.length - maxNotifications + 1);
      toClose.forEach(notification => {
        notification.close();
      });
    }
  }

  private setupPermissionChangeListener(): void {
    // Note: Permission change events are not well supported in all browsers
    // We'll update permission state when methods are called
    if (typeof window !== 'undefined' && 'navigator' in window && 'permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName })
        .then(permissionStatus => {
          permissionStatus.onchange = () => {
            this.state.permission = this.checkPermission();
          };
        })
        .catch(() => {
          // Permissions API not supported, fallback to manual checking
        });
    }
  }

  private getStoredPermissionRequestState(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('qas-browser-notifications-requested') === 'true';
    } catch {
      return false;
    }
  }

  private setStoredPermissionRequestState(requested: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('qas-browser-notifications-requested', requested.toString());
    } catch {
      // Ignore localStorage errors
    }
  }
}

// Export singleton instance getter
export const getBrowserNotificationService = (config?: Partial<BrowserNotificationConfig>) => 
  BrowserNotificationService.getInstance(config);

export default BrowserNotificationService; 