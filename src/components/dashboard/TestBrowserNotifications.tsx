'use client';

import { useState } from 'react';
import { useBrowserNotificationPermission } from '@/components/providers/BrowserNotificationProvider';
import { createAndSendBrowserNotification } from '@/lib/notificationIntegration';
import type { NotificationType } from '@prisma/client';

export default function TestBrowserNotifications() {
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    canRequest, 
    isRequestingPermission 
  } = useBrowserNotificationPermission();
  
  const [isTesting, setIsTesting] = useState(false);

  const handleRequestPermission = async () => {
    if (requestPermission) {
      try {
        const result = await requestPermission({
          notificationType: 'test',
          triggerAction: 'manual_test',
          userMessage: 'Testing browser notifications for QAS Portal'
        });
        console.log('Permission request result:', result);
      } catch (error) {
        console.error('Failed to request permission:', error);
      }
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      // Test with integration function
      const integrationResult = await createAndSendBrowserNotification(
        'test-integration-456',
        'client_assignment' as NotificationType,
        {
          title: 'Test QAS Portal Notification',
          body: 'This is a test browser notification!',
          linkUrl: '/dashboard'
        }
      );
      console.log('Test notification result:', integrationResult);
      
    } catch (error) {
      console.error('Failed to create test notification:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const isReady = isSupported && permission === 'granted';

  return (
    <div className="space-y-3">
      {/* Status */}
      <div className="text-sm">
        <div className="mb-2">
          <strong>Status:</strong> 
          <span className={
            permission === 'granted' ? 'text-green-600 ml-1' : 
            permission === 'denied' ? 'text-red-600 ml-1' : 
            'text-yellow-600 ml-1'
          }>
            {permission === 'granted' ? '✅ Ready' : 
             permission === 'denied' ? '❌ Blocked' : 
             '⏳ Pending'}
          </span>
        </div>
        
        {!isSupported && (
          <p className="text-red-600 text-xs">Browser notifications not supported</p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {canRequest && (
          <button
            onClick={handleRequestPermission}
            disabled={isRequestingPermission}
            className="w-full rounded bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isRequestingPermission ? 'Requesting...' : 'Request Permission'}
          </button>
        )}
        
        <button
          onClick={handleTestNotification}
          disabled={!isReady || isTesting}
          className="w-full rounded bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Send Test Notification'}
        </button>
      </div>

      {/* Help */}
      <p className="text-xs text-gray-600">
        {permission === 'default' && 'Click "Request Permission" first.'}
        {permission === 'denied' && 'Enable in browser settings.'}
        {permission === 'granted' && 'Ready to test notifications!'}
      </p>
    </div>
  );
} 