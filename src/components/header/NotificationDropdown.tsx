"use client";
import Link from "next/link";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { api } from "@/utils/api";
import type { RouterOutput } from "@/utils/api";

// Connection status types
type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

// Notification type from tRPC router output
type NotificationItem = RouterOutput['notification']['getUnread'][0];

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>([]);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // tRPC queries and mutations
  const { 
    data: unreadData, 
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
    error: unreadError
  } = api.notification.getUnread.useQuery({
    limit: 20,
    offset: 0
  }, {
    refetchOnWindowFocus: false,
    staleTime: 30000 // 30 seconds
  });

  const { 
    data: countData, 
    refetch: refetchCount 
  } = api.notification.getCount.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 10000 // 10 seconds
  });

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
        refetchUnread()
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
  }, [refetchUnread]);

  // Subscription placeholder - using regular query for now since subscribe is not a true subscription
  const { 
    data: subscriptionData,
    error: subscriptionError 
  } = api.notification.subscribe.useQuery(undefined, {
    enabled: true,
    refetchInterval: 30000, // Poll every 30 seconds for updates
    refetchOnWindowFocus: false
  });

  // Handle subscription data changes
  useEffect(() => {
    if (subscriptionData) {
      console.log('Received subscription data:', subscriptionData);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
    }
  }, [subscriptionData]);

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
    if (unreadData) {
      setLocalNotifications(unreadData);
    }
  }, [unreadData]);

  useEffect(() => {
    if (countData?.count !== undefined) {
      setLocalUnreadCount(countData.count);
    }
  }, [countData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
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
      await Promise.all([refetchUnread(), refetchCount()]);
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
  }, [markAsReadMutation, refetchUnread, refetchCount]);

  // Handle notification click with navigation and read marking
  const handleNotificationClick = useCallback(async (notification: NotificationItem) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await optimisticMarkAsRead([notification.id]);
    }

    // Determine navigation URL based on notification type and entity
    let targetUrl = '/dashboard';
    
    if (notification.entityId) {
      // Note: we'll need to determine the entity type based on notification type
      // This is a simplified mapping - in a real implementation, you might want
      // to include entityType in the notification data or determine it from type
      switch (notification.type) {
        case 'client_assignment':
          targetUrl = `/clients/${notification.entityId}`;
          break;
        case 'audit_assignment':
        case 'audit_stage_update':
        case 'audit_status_update':
          targetUrl = `/audits/${notification.entityId}`;
          break;
        default:
          targetUrl = notification.linkUrl || '/dashboard';
      }
    } else if (notification.linkUrl) {
      targetUrl = notification.linkUrl;
    }

    // Close dropdown and navigate
    setIsOpen(false);
    router.push(targetUrl);
  }, [optimisticMarkAsRead, router]);

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
    // Simple implementation - split on common bold markers and wrap in React components
    const parts = message.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        const boldText = part.slice(2, -2);
        return (
          <span key={index} className="font-medium text-gray-800 dark:text-white/90">
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

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  const showBadge = localUnreadCount > 0;

  return (
    <div className="relative">
      <button
        className="dropdown-toggle relative flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
        disabled={isLoadingUnread}
      >
        {/* Unread count badge */}
        {showBadge && (
          <span className="absolute right-0 top-0.5 z-10 flex size-5 items-center justify-center rounded-full bg-orange-400 text-xs font-medium text-white">
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
      >
        {/* Header with connection status */}
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h5>
            {getConnectionStatusIcon()}
          </div>
          <div className="flex items-center gap-2">
            {localUnreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all read
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

        {/* Notifications list */}
        <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
          {isLoadingUnread ? (
            <li className="flex items-center justify-center p-8">
              <div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            </li>
          ) : unreadError ? (
            <li className="flex items-center justify-center p-8 text-red-600">
              <span>Failed to load notifications</span>
            </li>
          ) : localNotifications.length === 0 ? (
            <li className="flex items-center justify-center p-8 text-gray-500">
              <span>No notifications</span>
            </li>
          ) : (
            localNotifications.map((notification) => (
              <li key={notification.id}>
                <DropdownItem
                  onItemClick={() => handleNotificationClick(notification)}
                  className={`px-4.5 flex gap-3 rounded-lg border-b border-gray-100 p-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className="z-1 relative block h-10 w-full max-w-10 rounded-full">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <svg
                        className="size-5 text-gray-600 dark:text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {!notification.isRead && (
                      <span className="bg-blue-500 absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white dark:border-gray-900"></span>
                    )}
                  </span>

                  <span className="block flex-1">
                    <span className="text-theme-sm mb-1.5 block text-gray-600 dark:text-gray-400">
                      {renderMessage(notification.message)}
                    </span>

                    <span className="text-theme-xs flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <span>{notification.type}</span>
                      <span className="size-1 rounded-full bg-gray-400"></span>
                      <span>
                        {new Date(notification.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>

        {/* Footer */}
        <Link
          href="/notifications"
          className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          onClick={closeDropdown}
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
