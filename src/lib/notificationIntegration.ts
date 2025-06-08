/**
 * Notification Integration Utility
 * 
 * Handles integration between server-side notifications and browser notifications.
 * Provides message formatting and browser notification creation for all notification types.
 */

import type { NotificationType } from '@prisma/client';
import type {
  BrowserNotification,
  BrowserNotificationData,
  BrowserNotificationResult
} from '@/types/browserNotification';
import { getBrowserNotificationService } from '@/lib/browserNotificationService';

/**
 * Browser notification message data
 */
interface NotificationMessageData {
  title: string;
  body: string;
  linkUrl: string;
  entityId?: string;
  entityType?: 'client' | 'audit' | 'task' | 'contact';
}

/**
 * Create a browser notification for client assignment
 */
export function createClientAssignmentBrowserNotification(
  notificationId: string,
  clientName: string,
  managerName: string,
  clientId: string
): BrowserNotification {
  const data: BrowserNotificationData = {
    notificationId,
    linkUrl: `/clients/${clientId}`,
    type: 'client_assignment',
    entityId: clientId,
    entityType: 'client'
  };

  return {
    title: 'New Client Assignment',
    body: `You have been assigned to manage ${clientName}`,
    icon: '/images/logo/logo-icon.png',
    tag: `client-assignment-${notificationId}`,
    data,
    actions: [{
      action: 'view',
      title: 'View Client'
    }],
    requireInteraction: false,
    timestamp: Date.now()
  };
}

/**
 * Create a browser notification for audit assignment
 */
export function createAuditAssignmentBrowserNotification(
  notificationId: string,
  clientName: string,
  auditYear: number,
  auditorName: string,
  auditId: string
): BrowserNotification {
  const data: BrowserNotificationData = {
    notificationId,
    linkUrl: `/audits/${auditId}`,
    type: 'audit_assignment',
    entityId: auditId,
    entityType: 'audit'
  };

  return {
    title: 'New Audit Assignment',
    body: `You have been assigned to ${clientName} - ${auditYear} Audit`,
    icon: '/images/logo/logo-icon.png',
    tag: `audit-assignment-${notificationId}`,
    data,
    actions: [{
      action: 'view',
      title: 'View Audit'
    }],
    requireInteraction: false,
    timestamp: Date.now()
  };
}

/**
 * Create a browser notification for audit update
 */
export function createAuditUpdateBrowserNotification(
  notificationId: string,
  clientName: string,
  auditYear: number,
  changeType: 'stage' | 'status',
  newValue: string,
  updatedByName: string,
  auditId: string
): BrowserNotification {
  const changeTypeLabel = changeType === 'stage' ? 'stage' : 'status';
  
  const data: BrowserNotificationData = {
    notificationId,
    linkUrl: `/audits/${auditId}`,
    type: `audit_${changeType}_update`,
    entityId: auditId,
    entityType: 'audit'
  };

  return {
    title: 'Audit Progress Update',
    body: `${updatedByName} has updated ${clientName} - ${auditYear} Audit ${changeTypeLabel} to ${newValue}`,
    icon: '/images/logo/logo-icon.png',
    tag: `audit-update-${notificationId}`,
    data,
    actions: [{
      action: 'view',
      title: 'View Audit'
    }],
    requireInteraction: false,
    timestamp: Date.now()
  };
}

/**
 * Send browser notification with fallback handling
 */
export async function sendBrowserNotification(
  notification: BrowserNotification
): Promise<BrowserNotificationResult> {
  try {
    const browserNotificationService = getBrowserNotificationService();
    return await browserNotificationService.createNotification(notification);
  } catch (error) {
    return {
      success: false,
      fallbackToInApp: true,
      reason: 'creation_failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generic browser notification creator
 */
export function createGenericBrowserNotification(
  notificationId: string,
  type: NotificationType,
  messageData: NotificationMessageData
): BrowserNotification {
  const data: BrowserNotificationData = {
    notificationId,
    linkUrl: messageData.linkUrl,
    type,
    entityId: messageData.entityId,
    entityType: messageData.entityType
  };

  return {
    title: messageData.title,
    body: messageData.body,
    icon: '/images/logo/logo-icon.png',
    tag: `notification-${notificationId}`,
    data,
    actions: [{
      action: 'view',
      title: 'View'
    }],
    requireInteraction: false,
    timestamp: Date.now()
  };
}

/**
 * Create and send browser notification for notification result
 * This is a utility function that can be called from the server-side notification service
 */
export async function createAndSendBrowserNotification(
  notificationId: string,
  type: NotificationType,
  messageData: NotificationMessageData
): Promise<BrowserNotificationResult> {
  let browserNotification: BrowserNotification;

  // Create type-specific browser notification
  switch (type) {
    case 'client_assignment':
      // For client assignment, we'll need to extract client name from messageData.body
      const clientMatch = messageData.body.match(/manage (.+)$/);
      const clientName = clientMatch ? clientMatch[1] : 'Client';
      browserNotification = createClientAssignmentBrowserNotification(
        notificationId,
        clientName,
        'Manager', // We don't have manager name in this context
        messageData.entityId || ''
      );
      break;

    case 'audit_assignment':
      // For audit assignment, extract client and year from body
      const auditMatch = messageData.body.match(/assigned to (.+) - (\d+) Audit/);
      const auditClientName = auditMatch ? auditMatch[1] : 'Client';
      const auditYear = auditMatch ? parseInt(auditMatch[2]) : new Date().getFullYear();
      browserNotification = createAuditAssignmentBrowserNotification(
        notificationId,
        auditClientName,
        auditYear,
        'Auditor', // We don't have auditor name in this context
        messageData.entityId || ''
      );
      break;

    case 'audit_stage_update':
    case 'audit_status_update':
      // For audit updates, extract details from body
      const updateMatch = messageData.body.match(/updated (.+) - (\d+) Audit (stage|status) to (.+)$/);
      const updateClientName = updateMatch ? updateMatch[1] : 'Client';
      const updateYear = updateMatch ? parseInt(updateMatch[2]) : new Date().getFullYear();
      const updateType = updateMatch ? updateMatch[3] as 'stage' | 'status' : 'stage';
      const newValue = updateMatch ? updateMatch[4] : 'Unknown';
      const updatedByMatch = messageData.body.match(/^(.+) has updated/);
      const updatedByName = updatedByMatch ? updatedByMatch[1] : 'Someone';
      
      browserNotification = createAuditUpdateBrowserNotification(
        notificationId,
        updateClientName,
        updateYear,
        updateType,
        newValue,
        updatedByName,
        messageData.entityId || ''
      );
      break;

    default:
      // Generic notification for other types
      browserNotification = createGenericBrowserNotification(
        notificationId,
        type,
        messageData
      );
  }

  return await sendBrowserNotification(browserNotification);
} 