"use client";
// import Link from "next/link"; // Removed - View All Notifications button hidden per user request
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAbility } from "@/hooks/useAbility";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { api } from "@/utils/api";
import type { RouterOutput } from "@/utils/api";
import Image from "next/image";

import { createAndSendBrowserNotification } from '@/lib/notificationIntegration';

// Connection status types
type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

// Notification type from tRPC router output
type NotificationItem = RouterOutput['notification']['getUserNotifications']['notifications'][0];

// Extended notification type for Developer mode
type ExtendedNotificationItem = NotificationItem & {
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    role: {
      name: string;
    } | null;
  };
};

export default function NotificationDropdown() {
  const router = useRouter();
  const { can } = useAbility();
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>([]);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastNotificationCountRef = useRef(0);
  
  // Developer debugging features
  const [viewAllNotifications, setViewAllNotifications] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string>('');
  const canViewAllNotifications = can('notification.viewAll');
  
  // Accessibility: Screen reader announcement for new notifications
  const [announceMessage, setAnnounceMessage] = useState<string>('');
  const announceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to get friendly notification type display text
  const getFriendlyNotificationType = useCallback((type: string): string => {
    switch (type) {
      case 'client_assignment':
        return 'Client Assigned';
      case 'audit_assignment':
        return 'Audit Assigned';
      case 'audit_stage_update':
        return 'Stage Updated';
      case 'audit_status_update':
        return 'Status Updated';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }, []);

  // Helper function to get client ID from notification
  const getClientIdFromNotification = useCallback((notification: NotificationItem): string => {
    // All notifications now store clientId in entityId field
    return notification.entityId || '';
  }, []);

  // Screen reader announcement function
  const announceToScreenReader = useCallback((message: string) => {
    setAnnounceMessage(message);
    
    // Clear previous timeout
    if (announceTimeoutRef.current) {
      clearTimeout(announceTimeoutRef.current);
    }
    
    // Clear announcement after 1 second
    announceTimeoutRef.current = setTimeout(() => {
      setAnnounceMessage('');
    }, 1000);
  }, []);

  // tRPC queries and mutations
  const { 
    data: allNotificationsData, 
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
    error: notificationsError
  } = api.notification.getUserNotifications.useQuery({
    limit: 20,
    offset: 0,
    unreadOnly: false, // Get all notifications, not just unread
    // Developer debugging parameters
    ...(canViewAllNotifications && {
      allUsers: viewAllNotifications,
      targetUserId: targetUserId || undefined
    })
  }, {
    refetchOnWindowFocus: false,
    staleTime: 30000 // 30 seconds
  });

  // Extract notifications data from the response with memoization to prevent unnecessary re-renders
  const notifications = useMemo(() => allNotificationsData?.notifications || [], [allNotificationsData?.notifications]);
  const serverUnreadCount = allNotificationsData?.unreadCount || 0;

  const markAsReadMutation = api.notification.markAsRead.useMutation();
  const markAllAsReadMutation = api.notification.markAllAsRead.useMutation();

  // Handle reconnection with exponential backoff
  const handleReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const maxAttempts = 5;
    const baseDelay = 1000; // 1 second
    
    if (reconnectAttemptsRef.current < maxAttempts) {
      setConnectionStatus('reconnecting');
      const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        console.log(`Reconnection attempt ${reconnectAttemptsRef.current}/${maxAttempts}`);
        
        // Trigger refetch to test connection
        refetchNotifications()
          .then(() => {
            setConnectionStatus('connected');
            reconnectAttemptsRef.current = 0;
          })
          .catch(() => {
            if (reconnectAttemptsRef.current < maxAttempts) {
              handleReconnection();
            } else {
              setConnectionStatus('error');
            }
          });
      }, delay);
    } else {
      setConnectionStatus('error');
    }
  }, [refetchNotifications]);

  // Real-time subscription for read status changes across devices
  const { 
    error: subscriptionError 
  } = api.notification.subscribeToReadStatus.useSubscription(undefined, {
    onData: (data) => {
      console.log('Received read status update:', data);
      
      // Update local state optimistically
      setLocalNotifications(prev => 
        prev.map(notification => 
          data.notificationIds.includes(notification.id)
            ? { ...notification, isRead: data.isRead }
            : notification
        )
      );
      
      // Update unread count from server
      setLocalUnreadCount(data.unreadCount);
      
      // Refetch to ensure consistency
      refetchNotifications();
    },
    onError: (error) => {
      console.error('Read status subscription error:', error);
      setConnectionStatus('error');
      handleReconnection();
    },
  });

  // Connection status updates are now handled in subscription callbacks

  // Handle subscription errors
  useEffect(() => {
    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
      setConnectionStatus('error');
      handleReconnection();
    }
  }, [subscriptionError, handleReconnection]);

  // Update local state when data changes
  useEffect(() => {
    if (notifications) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  useEffect(() => {
    if (serverUnreadCount !== undefined) {
      setLocalUnreadCount(serverUnreadCount);
    }
  }, [serverUnreadCount]);

  // Detect new notifications and trigger browser notifications + screen reader announcements
  useEffect(() => {
    if (serverUnreadCount !== undefined) {
      const currentCount = serverUnreadCount;
      const hasNewNotifications = currentCount > lastNotificationCountRef.current && lastNotificationCountRef.current > 0;
      
      if (hasNewNotifications && notifications) {
        // Find the newest unread notifications (those that weren't in the previous state)
        const newNotificationCount = currentCount - lastNotificationCountRef.current;
        const unreadNotifications = notifications.filter(n => !n.isRead);
        const newestNotifications = unreadNotifications.slice(0, newNotificationCount);
        
        // Announce new notifications to screen readers
        const notificationText = newNotificationCount === 1 
          ? `New notification: ${newestNotifications[0]?.message || 'You have a new notification'}`
          : `${newNotificationCount} new notifications received`;
        announceToScreenReader(notificationText);
        
        // Send browser notifications for new notifications
        newestNotifications.forEach(async (notification) => {
          try {
            await createAndSendBrowserNotification(
              notification.id,
              notification.type,
              {
                title: `New ${notification.type.replace('_', ' ')} notification`,
                body: notification.message,
                linkUrl: notification.linkUrl || '/notifications',
                entityId: notification.entityId || undefined,
                entityType: getEntityTypeFromNotificationType(notification.type)
              }
            );
          } catch (error) {
            console.warn('Failed to send browser notification:', error);
          }
        });
      }
      
      lastNotificationCountRef.current = currentCount;
    }
  }, [serverUnreadCount, notifications, announceToScreenReader]);

  // Helper function to get entity type from notification type
  const getEntityTypeFromNotificationType = (type: string): 'client' | 'audit' | 'task' | 'contact' | undefined => {
    switch (type) {
      case 'client_assignment':
        return 'client';
      case 'audit_assignment':
      case 'audit_stage_update':
      case 'audit_status_update':
        return 'audit';
      default:
        return undefined;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (announceTimeoutRef.current) {
        clearTimeout(announceTimeoutRef.current);
      }
    };
  }, []);

  // Optimistic update for marking notifications as read
  const optimisticMarkAsRead = useCallback(async (notificationIds: string[]) => {
    // Update local state immediately (optimistic update)
    setLocalNotifications(prev => 
      prev.map(notification => 
        notificationIds.includes(notification.id) 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    
    // Update local count
    setLocalUnreadCount(prev => Math.max(0, prev - notificationIds.length));

    try {
      // Trigger server mutation
      await markAsReadMutation.mutateAsync({
        notificationIds
      });
      
      // Refresh data to ensure consistency
      await refetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      
      // Rollback optimistic update on error
      setLocalNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id) 
            ? { ...notification, isRead: false }
            : notification
        )
      );
      setLocalUnreadCount(prev => prev + notificationIds.length);
    }
  }, [markAsReadMutation, refetchNotifications]);

  // Handle notification click with navigation and read marking
  const handleNotificationClick = useCallback(async (notification: NotificationItem) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await optimisticMarkAsRead([notification.id]);
    }

    // All notifications should redirect to the client page for now
    const clientId = getClientIdFromNotification(notification);
    const targetUrl = clientId ? `/clients/${clientId}` : '/dashboard';

    // Close dropdown and navigate
    setIsOpen(false);
    router.push(targetUrl);
  }, [optimisticMarkAsRead, router, getClientIdFromNotification]);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    const unreadIds = localNotifications
      .filter(n => !n.isRead)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      await optimisticMarkAsRead(unreadIds);
    }
  }, [localNotifications, optimisticMarkAsRead]);

  // Helper function to render notification message with formatting
  const renderMessage = useCallback((message: string) => {
    // Split on bracket markers [text] and wrap in React components
    const parts = message.split(/(\[[^\]]*\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        // Bold text (content within brackets)
        const boldText = part.slice(1, -1);
        return (
          <span key={index} className="font-semibold text-gray-800 dark:text-white">
            {boldText}
          </span>
        );
      } else {
        // Regular text
        return <span key={index}>{part}</span>;
      }
    });
  }, []);

  // Connection status indicator
  const getConnectionStatusIcon = useCallback(() => {
    switch (connectionStatus) {
      case 'connected':
        return <span className="size-2 rounded-full bg-green-500" title="Connected" />;
      case 'connecting':
      case 'reconnecting':
        return <span className="size-2 rounded-full bg-yellow-500 animate-pulse" title="Connecting..." />;
      case 'disconnected':
        return <span className="size-2 rounded-full bg-gray-400" title="Disconnected" />;
      case 'error':
        return <span className="size-2 rounded-full bg-red-500" title="Connection Error" />;
      default:
        return null;
    }
  }, [connectionStatus]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  // Keyboard navigation support
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown();
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeDropdown();
    }
  }, [isOpen, toggleDropdown]);

  const showBadge = localUnreadCount > 0;

  return (
    <div className="relative">
      {/* Screen reader announcement area */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announceMessage}
      </div>
      
      <button
        className="dropdown-toggle relative flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isLoadingNotifications}
        aria-label={`Notifications${showBadge ? ` (${localUnreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-describedby={connectionStatus !== 'connected' ? 'notification-status' : undefined}
        type="button"
      >
        {/* Unread count badge */}
        {showBadge && (
          <span 
            className="absolute right-0 top-0.5 z-10 flex size-5 items-center justify-center rounded-full bg-orange-400 text-xs font-medium text-white"
            aria-hidden="true"
          >
            {localUnreadCount > 99 ? '99+' : localUnreadCount}
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
          </span>
        )}
        
        {/* Notification bell icon */}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="shadow-theme-lg dark:bg-gray-dark absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 sm:w-[361px] lg:right-0 dark:border-gray-800"
        role="menu"
        aria-label="Notifications menu"
      >
        {/* Header with connection status */}
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h5>
            {getConnectionStatusIcon()}
            {/* Connection status for screen readers */}
            {connectionStatus !== 'connected' && (
              <span id="notification-status" className="sr-only">
                Connection status: {connectionStatus}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {localUnreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded px-2 py-1"
                disabled={markAllAsReadMutation.isPending}
                aria-label={`Mark all ${localUnreadCount} notifications as read`}
                type="button"
              >
                {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all read'}
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="dropdown-toggle text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Developer debugging controls */}
        {canViewAllNotifications && (
          <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
            <div className="mb-2 flex items-center gap-2">
              <svg className="size-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-orange-800 dark:text-orange-200">
                Developer Mode
              </span>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={viewAllNotifications}
                  onChange={(e) => setViewAllNotifications(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  View all notifications (system-wide)
                </span>
              </label>
              
              {viewAllNotifications && (
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Filter by User ID (optional):
                  </label>
                  <input
                    type="text"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="Enter user ID..."
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}
              
              {allNotificationsData?.debugInfo && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div>Viewing: {allNotificationsData.debugInfo.queriedAllUsers ? 'All Users' : 'Current User'}</div>
                  {allNotificationsData.debugInfo.targetUserId && (
                    <div>User: {allNotificationsData.debugInfo.targetUserId}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications list */}
        <ul 
          className="custom-scrollbar flex h-auto flex-col overflow-y-auto"
          role="menu"
          aria-label={`${localNotifications.length} notifications`}
        >
          {isLoadingNotifications ? (
            <li className="flex items-center justify-center p-8" role="status" aria-label="Loading notifications">
              <div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              <span className="sr-only">Loading notifications...</span>
            </li>
          ) : notificationsError ? (
            <li className="flex items-center justify-center p-8 text-red-600" role="alert">
              <span>Failed to load notifications</span>
            </li>
          ) : localNotifications.length === 0 ? (
            <li className="flex items-center justify-center p-8 text-gray-500" role="status">
              <span>No notifications</span>
            </li>
          ) : (
            localNotifications.map((notification) => (
              <li key={notification.id} role="none">
                <DropdownItem
                  onItemClick={() => handleNotificationClick(notification)}
                  className={`px-4.5 flex gap-3 rounded-lg border-b border-gray-100 p-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  role="menuitem"
                  tabIndex={0}
                  aria-label={`${notification.isRead ? 'Read' : 'Unread'} notification: ${notification.message}. Created ${new Date(notification.createdAt).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}. Press Enter to view.`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  <span className="z-1 relative block h-10 w-full max-w-10 rounded-full">
                    {notification.createdByUser?.image ? (
                      <Image
                        src={notification.createdByUser.image}
                        alt={notification.createdByUser.name || 'User'}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                        <svg
                          className="size-5 text-gray-600 dark:text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    {!notification.isRead && (
                      <span 
                        className="bg-blue-500 absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white dark:border-gray-900"
                        aria-hidden="true"
                      ></span>
                    )}
                  </span>

                  <span className="block flex-1">
                    <span className="text-theme-sm mb-1.5 block text-gray-600 dark:text-gray-400">
                      {renderMessage(notification.message)}
                    </span>

                    {/* Developer mode: Show recipient info when viewing all notifications */}
                    {canViewAllNotifications && viewAllNotifications && (notification as ExtendedNotificationItem).user && (
                      <span className="text-theme-xs mb-1 block text-blue-600 dark:text-blue-400">
                        → {(notification as ExtendedNotificationItem).user!.name || (notification as ExtendedNotificationItem).user!.email} ({(notification as ExtendedNotificationItem).user!.role?.name})
                      </span>
                    )}

                    <span className="text-theme-xs flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <span>{getFriendlyNotificationType(notification.type)}</span>
                      <span className="size-1 rounded-full bg-gray-400"></span>
                      <span>
                        {new Date(notification.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {/* Developer mode: Show notification ID */}
                      {canViewAllNotifications && (
                        <>
                          <span className="size-1 rounded-full bg-gray-400"></span>
                          <span className="text-xs text-gray-400">ID: {notification.id.slice(0, 8)}</span>
                        </>
                      )}
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>

        {/* Footer - View All Notifications button hidden per user request */}
      </Dropdown>
    </div>
  );
}
