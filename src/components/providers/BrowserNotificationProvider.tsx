/**
 * Browser Notification Provider
 * 
 * Provides browser notification functionality across the application.
 * Sets up global event handlers, navigation, and read status marking.
 */

'use client';

import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/utils/api';
import { getBrowserNotificationService } from '@/lib/browserNotificationService';
import type {
  BrowserNotificationData,
  BrowserNotificationEventHandlers,
  IBrowserNotificationService
} from '@/types/browserNotification';
// Simple client-side logger
const logger = {
  info: (message: string, meta?: unknown) => console.info(`[BrowserNotification] ${message}`, meta),
  error: (message: string, error?: unknown) => console.error(`[BrowserNotification] ${message}`, error),
  debug: (message: string, meta?: unknown) => console.debug(`[BrowserNotification] ${message}`, meta)
};

interface BrowserNotificationContextType {
  service: IBrowserNotificationService | null;
  isSupported: boolean;
}

const BrowserNotificationContext = createContext<BrowserNotificationContextType>({
  service: null,
  isSupported: false
});

interface BrowserNotificationProviderProps {
  children: React.ReactNode;
}

export function BrowserNotificationProvider({ children }: BrowserNotificationProviderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const serviceRef = useRef<IBrowserNotificationService | null>(null);
  const markAsReadMutation = api.notification.markAsRead.useMutation();

  /**
   * Handle notification click events
   */
  const handleNotificationClick = useCallback(async (
    notification: Notification,
    data: BrowserNotificationData
  ) => {
    try {
      logger.info('Browser notification clicked', { data });

      // Mark notification as read if user is authenticated
      if (session?.user?.id && data.notificationId) {
        try {
          await markAsReadMutation.mutateAsync({
            notificationIds: [data.notificationId]
          });
          logger.info('Notification marked as read', { notificationId: data.notificationId });
        } catch (error) {
          logger.error('Failed to mark notification as read:', error);
        }
      }

      // Navigate to the linked page
      if (data.linkUrl) {
        router.push(data.linkUrl);
        logger.info('Navigated to notification link', { linkUrl: data.linkUrl });
      }

      // Focus the window
      if (window) {
        window.focus();
      }

    } catch (error) {
      logger.error('Error handling notification click:', error);
    }
  }, [session?.user?.id, markAsReadMutation, router]);

  /**
   * Handle notification close events
   */
  const handleNotificationClose = useCallback((
    notification: Notification,
    data: BrowserNotificationData
  ) => {
    logger.debug('Browser notification closed', { data });
  }, []);

  /**
   * Handle notification error events
   */
  const handleNotificationError = useCallback((
    error: Event,
    data: BrowserNotificationData
  ) => {
    logger.error('Browser notification error:', { error, data });
  }, []);

  /**
   * Handle notification show events
   */
  const handleNotificationShow = useCallback((
    notification: Notification,
    data: BrowserNotificationData
  ) => {
    logger.debug('Browser notification shown', { data });
  }, []);

  useEffect(() => {
    // Initialize browser notification service only on client side
    if (typeof window === 'undefined') return;

    try {
      const service = getBrowserNotificationService({
        enabled: true,
        requestPermissionOnFirstNotification: true,
        fallbackToInApp: true,
        defaultIcon: '/images/logo/logo-icon.png',
        defaultBadge: '/images/logo/logo-badge.png',
        autoCloseDelay: 8000, // 8 seconds
        maxNotificationsShown: 3,
        vibrationPattern: [200, 100, 200]
      });

      serviceRef.current = service;

      // Set up event handlers
      const eventHandlers: BrowserNotificationEventHandlers = {
        onClick: handleNotificationClick,
        onClose: handleNotificationClose,
        onError: handleNotificationError,
        onShow: handleNotificationShow
      };

      service.setEventHandlers(eventHandlers);

      logger.info('Browser notification service initialized', {
        isSupported: service.isSupported(),
        permission: service.checkPermission()
      });

    } catch (error) {
      logger.error('Failed to initialize browser notification service:', error);
    }
  }, [handleNotificationClick, handleNotificationClose, handleNotificationError, handleNotificationShow]);

  const contextValue: BrowserNotificationContextType = {
    service: serviceRef.current,
    isSupported: serviceRef.current?.isSupported() ?? false
  };

  return (
    <BrowserNotificationContext.Provider value={contextValue}>
      {children}
    </BrowserNotificationContext.Provider>
  );
}

/**
 * Hook to access browser notification service
 */
export function useBrowserNotification() {
  const context = useContext(BrowserNotificationContext);
  
  if (!context) {
    throw new Error('useBrowserNotification must be used within a BrowserNotificationProvider');
  }

  return context;
}

/**
 * Hook to get browser notification permission status
 */
export function useBrowserNotificationPermission() {
  const { service } = useBrowserNotification();
  
  return {
    isSupported: service?.isSupported() ?? false,
    permission: service?.checkPermission() ?? 'denied',
    requestPermission: service?.requestPermission.bind(service),
    canRequest: (service?.checkPermission() ?? 'denied') === 'default'
  };
}

/**
 * Hook to create browser notifications
 */
export function useCreateBrowserNotification() {
  const { service } = useBrowserNotification();
  
  return {
    createNotification: service?.createNotification.bind(service),
    isReady: Boolean(service && service.isSupported()),
    clearAll: service?.clearAllNotifications.bind(service),
    getCount: service?.getNotificationCount.bind(service)
  };
} 