/**
 * Browser Notification Types and Interfaces
 * 
 * Defines types for browser push notifications using the Web Notification API.
 * Supports structured notifications with actions, permission management, and
 * integration with the existing QAS Portal notification system.
 */

/**
 * Browser notification permission states
 */
export type BrowserNotificationPermission = 'default' | 'granted' | 'denied';

/**
 * Browser notification action button
 */
export interface BrowserNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Data payload for browser notifications
 */
export interface BrowserNotificationData {
  notificationId: string;
  linkUrl: string;
  type: string;
  entityId?: string;
  entityType?: 'client' | 'audit' | 'task' | 'contact';
}

/**
 * Browser notification configuration matching PRD specification
 */
export interface BrowserNotification {
  title: string;
  body: string;
  icon: string;
  tag: string;
  data: BrowserNotificationData;
  actions?: BrowserNotificationAction[];
  badge?: string;
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number[];
}

/**
 * Browser notification service configuration
 */
export interface BrowserNotificationConfig {
  enabled: boolean;
  requestPermissionOnFirstNotification: boolean;
  fallbackToInApp: boolean;
  defaultIcon: string;
  defaultBadge?: string;
  autoCloseDelay?: number;
  maxNotificationsShown: number;
  vibrationPattern?: number[];
}

/**
 * Permission request result
 */
export interface PermissionRequestResult {
  permission: BrowserNotificationPermission;
  wasRequested: boolean;
  error?: string;
}

/**
 * Browser notification creation result
 */
export interface BrowserNotificationResult {
  success: boolean;
  notification?: Notification;
  fallbackToInApp?: boolean;
  error?: string;
  reason?: 'permission_denied' | 'not_supported' | 'invalid_data' | 'creation_failed';
}

/**
 * Browser notification service state
 */
export interface BrowserNotificationState {
  permission: BrowserNotificationPermission;
  isSupported: boolean;
  hasRequestedPermission: boolean;
  notificationQueue: BrowserNotification[];
  config: BrowserNotificationConfig;
}

/**
 * Context for permission requests
 */
export interface PermissionRequestContext {
  notificationType: string;
  triggerAction: string;
  userMessage?: string;
}

/**
 * Browser notification event handlers
 */
export interface BrowserNotificationEventHandlers {
  onClick?: (notification: Notification, data: BrowserNotificationData) => void;
  onClose?: (notification: Notification, data: BrowserNotificationData) => void;
  onError?: (error: Event, data: BrowserNotificationData) => void;
  onShow?: (notification: Notification, data: BrowserNotificationData) => void;
}

/**
 * Default configuration values
 */
export const DEFAULT_BROWSER_NOTIFICATION_CONFIG: BrowserNotificationConfig = {
  enabled: true,
  requestPermissionOnFirstNotification: false,
  fallbackToInApp: true,
  defaultIcon: '/images/logo/logo-icon.png',
  defaultBadge: '/images/logo/logo-badge.png',
  autoCloseDelay: 5000,
  maxNotificationsShown: 3,
  vibrationPattern: [200, 100, 200]
};

/**
 * Browser notification service interface
 */
export interface IBrowserNotificationService {
  // Permission management
  checkPermission(): BrowserNotificationPermission;
  requestPermission(context?: PermissionRequestContext): Promise<PermissionRequestResult>;
  
  // Notification creation
  createNotification(notification: BrowserNotification): Promise<BrowserNotificationResult>;
  
  // State management
  isSupported(): boolean;
  getState(): BrowserNotificationState;
  updateConfig(config: Partial<BrowserNotificationConfig>): void;
  
  // Event handling
  setEventHandlers(handlers: Partial<BrowserNotificationEventHandlers>): void;
  
  // Utility methods
  clearAllNotifications(): void;
  getNotificationCount(): number;
} 