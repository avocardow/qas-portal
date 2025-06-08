# Browser Notification System Documentation

## Overview

The QAS Portal browser notification system provides real-time push notifications to users when they're not actively viewing the application. This system enhances user engagement by ensuring important updates are delivered even when the browser tab is in the background or minimized.

## Architecture

### Core Components

1. **BrowserNotificationService** (`src/lib/browserNotificationService.ts`)
   - Singleton service managing Web Notification API
   - Handles permission requests and state management
   - Provides notification creation and management methods

2. **NotificationIntegration** (`src/lib/notificationIntegration.ts`)
   - Bridges existing notification system with browser notifications
   - Type-specific notification builders for different content types
   - Automatic fallback to in-app notifications

3. **BrowserNotificationProvider** (`src/components/providers/BrowserNotificationProvider.tsx`)
   - React context provider for browser notification functionality
   - Global click handlers and navigation management
   - Integration with tRPC for read status updates

4. **Performance Monitoring** (`src/lib/metrics.ts`)
   - Prometheus metrics for notification system performance
   - Health checks and monitoring endpoints
   - Real-time performance tracking

### Integration Points

- **Existing Notification System**: Enhances rather than replaces the current notification infrastructure
- **tRPC API**: Uses existing notification routers for data management
- **WebSocket**: Leverages real-time updates for notification delivery
- **Redis Cache**: Utilizes existing caching for performance optimization

## Features

### Permission Management
- **App startup requests**: Requests permissions when the user opens the app and is authenticated
- **One-time request**: Only requests permissions once per browser session
- **Persistent state**: Stores permission status in localStorage
- **Graceful degradation**: Falls back to in-app notifications when permissions denied
- **Non-blocking flow**: App continues to function normally regardless of permission status

### Notification Types
- **Client notifications**: New client registrations, updates, and activities
- **Audit notifications**: Audit status changes, deadlines, and completions
- **Task notifications**: Task assignments, updates, and completions
- **System notifications**: General system updates and announcements

### User Experience
- **Click-to-navigate**: Clicking notifications navigates to relevant pages
- **Auto-read marking**: Notifications automatically marked as read when clicked
- **Visual consistency**: Notifications use QAS Portal branding and icons
- **Action buttons**: Support for notification actions (Mark as Read, View Details)

## API Reference

### BrowserNotificationService

```typescript
class BrowserNotificationService {
  // Get singleton instance
  static getInstance(): BrowserNotificationService

  // Check if browser supports notifications
  isSupported(): boolean

  // Get current permission status
  getPermissionStatus(): NotificationPermission

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission>

  // Show a notification
  async showNotification(options: BrowserNotificationOptions): Promise<void>

  // Check if notifications are enabled
  isEnabled(): boolean

  // Close all notifications
  closeAllNotifications(): void
}
```

### BrowserNotificationOptions

```typescript
interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: NotificationData;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}
```

### React Hooks

```typescript
// Access browser notification service
const { service, isSupported, permission } = useBrowserNotifications();

// Request permission with UI feedback
const { requestPermission, isRequesting } = useNotificationPermission();
```

## Configuration

### Environment Variables

```bash
# Enable/disable browser notifications (default: true)
NEXT_PUBLIC_ENABLE_BROWSER_NOTIFICATIONS=true

# Notification icon URL (default: /images/logo/logo-icon.png)
NEXT_PUBLIC_NOTIFICATION_ICON=/images/logo/logo-icon.png

# Notification badge URL (default: /images/logo/badge.png)
NEXT_PUBLIC_NOTIFICATION_BADGE=/images/logo/badge.png

# Auto-close timeout in milliseconds (default: 5000)
NEXT_PUBLIC_NOTIFICATION_AUTO_CLOSE=5000
```

### Feature Flags

Browser notifications can be controlled via feature flags in the application:

```typescript
// Check if browser notifications are enabled
const isBrowserNotificationsEnabled = process.env.NEXT_PUBLIC_ENABLE_BROWSER_NOTIFICATIONS !== 'false';
```

## Usage Examples

### Basic Notification

```typescript
import { BrowserNotificationService } from '@/lib/browserNotificationService';

const service = BrowserNotificationService.getInstance();

await service.showNotification({
  title: 'New Client Registration',
  body: 'ABC Corp has registered as a new client',
  icon: '/images/logo/logo-icon.png',
  tag: 'client-new',
  data: {
    type: 'client',
    id: 'client-123',
    action: 'view'
  }
});
```

### Using React Provider

```typescript
import { useBrowserNotifications } from '@/components/providers/BrowserNotificationProvider';

function MyComponent() {
  const { service, isSupported, permission } = useBrowserNotifications();

  const handleNotify = async () => {
    if (permission === 'granted') {
      await service.showNotification({
        title: 'Task Completed',
        body: 'Your audit task has been completed',
        data: { type: 'task', id: 'task-456' }
      });
    }
  };

  return (
    <button onClick={handleNotify} disabled={!isSupported}>
      Send Notification
    </button>
  );
}
```

### Integration with Existing Notifications

```typescript
import { createBrowserNotification } from '@/lib/notificationIntegration';

// Automatically creates browser notification from existing notification data
await createBrowserNotification({
  id: 'notif-123',
  type: 'client',
  title: 'New Client',
  message: 'ABC Corp registered',
  data: { clientId: 'client-123' },
  userId: 'user-456',
  isRead: false,
  createdAt: new Date()
});
```

## Performance Monitoring

### Metrics Endpoints

- **`/api/metrics`**: Prometheus metrics for monitoring
- **`/api/health`**: Health check endpoint for system status

### Key Metrics

- `notifications_created_total`: Total notifications created by type
- `notifications_read_total`: Total notifications marked as read
- `notification_queries_total`: Database query performance
- `websocket_connections_active`: Active WebSocket connections
- `cache_hit_rate_percent`: Redis cache performance

### Monitoring Dashboard

Access real-time metrics via:
```bash
curl http://localhost:3000/api/metrics
curl http://localhost:3000/api/health
```

## Testing

### Unit Tests

```bash
# Run notification service tests
pnpm test src/__tests__/browserNotificationService.test.ts

# Run integration tests
pnpm test src/__tests__/notificationIntegration.test.ts
```

### Manual Testing

1. **Permission Flow**:
   - Open application in new browser/incognito
   - Trigger notification (create client, task, etc.)
   - Verify permission request appears
   - Test both grant and deny scenarios

2. **Notification Display**:
   - Grant permissions
   - Create test notifications
   - Verify notifications appear with correct content
   - Test click-to-navigate functionality

3. **Fallback Behavior**:
   - Deny permissions
   - Verify in-app notifications still work
   - Test graceful degradation

### Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 50+ | ✅ Full |
| Firefox | 44+ | ✅ Full |
| Safari | 16+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| Mobile Safari | 16.4+ | ✅ Full |
| Chrome Mobile | 50+ | ✅ Full |

## Security Considerations

### Permission Model
- Notifications require explicit user consent
- Permissions are origin-specific and persistent
- Users can revoke permissions at any time via browser settings

### Data Privacy
- Notification content is minimized to essential information
- Sensitive data is not included in notification body
- Click actions navigate to authenticated pages only

### Content Security Policy
```http
Content-Security-Policy: default-src 'self'; 
  img-src 'self' data: https:; 
  connect-src 'self' wss: https:;
```

## Troubleshooting

### Common Issues

1. **Notifications not appearing**:
   - Check browser permissions in settings
   - Verify `isSupported()` returns true
   - Check browser console for errors
   - Ensure HTTPS connection (required for notifications)

2. **Permission request not showing**:
   - Clear browser data and try again
   - Check if permissions were previously denied
   - Verify notification is triggered by user interaction

3. **Click navigation not working**:
   - Check browser console for navigation errors
   - Verify tRPC endpoints are accessible
   - Test authentication status

### Debug Mode

Enable debug logging:
```typescript
localStorage.setItem('debug-notifications', 'true');
```

### Browser Developer Tools

Monitor notification events:
```javascript
// Listen for notification events
navigator.serviceWorker.addEventListener('message', (event) => {
  console.log('Notification event:', event.data);
});
```

## Migration Guide

### From In-App Only to Browser Notifications

1. **Existing Code**: No changes required to existing notification creation
2. **Enhanced Features**: Browser notifications automatically created alongside in-app notifications
3. **User Experience**: Users will see permission request on first notification
4. **Fallback**: In-app notifications continue to work if browser notifications are denied

### Configuration Updates

Update your environment variables:
```bash
# Add to .env.local
NEXT_PUBLIC_ENABLE_BROWSER_NOTIFICATIONS=true
NEXT_PUBLIC_NOTIFICATION_ICON=/images/logo/logo-icon.png
```

## Future Enhancements

### Planned Features
- **Service Worker**: Background notification handling
- **Push API**: Server-initiated notifications
- **Notification Scheduling**: Delayed and recurring notifications
- **Rich Media**: Image and video support in notifications
- **Notification Groups**: Bundled notifications for related events

### API Extensions
- **Batch Operations**: Send multiple notifications efficiently
- **Template System**: Predefined notification templates
- **A/B Testing**: Notification content optimization
- **Analytics**: Detailed notification engagement metrics

## Support

For technical support or questions:
- **Documentation**: This file and inline code comments
- **Issues**: GitHub repository issues
- **Testing**: Comprehensive test suite in `src/__tests__/`
- **Monitoring**: Real-time metrics at `/api/metrics` and `/api/health` 