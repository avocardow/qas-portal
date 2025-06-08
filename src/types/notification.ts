import { ReactNode } from 'react';
import { NotificationType } from '@prisma/client';

/**
 * Priority levels for notifications
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Status of notification processing
 */
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

/**
 * Notification recipient information
 */
export interface NotificationRecipient {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

/**
 * Notification sender information
 */
export interface NotificationSender {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

/**
 * Metadata for notifications
 */
export interface NotificationMetadata {
  createdAt: Date;
  priority: NotificationPriority;
  status: NotificationStatus;
  attempts: number;
  lastAttemptAt?: Date;
  entityType?: 'client' | 'audit' | 'task' | 'contact';
  entityId?: string;
  entityName?: string;
}

/**
 * Type-specific data for client assignment notifications
 */
export interface ClientAssignmentData {
  clientId: string;
  clientName: string;
  managerName: string;
  assignmentDate: Date;
}

/**
 * Type-specific data for audit assignment notifications
 */
export interface AuditAssignmentData {
  auditId: string;
  clientName: string;
  auditYear: number;
  auditorName: string;
  assignmentDate: Date;
  periodEndDate?: Date;
}

/**
 * Type-specific data for audit update notifications
 */
export interface AuditUpdateData {
  auditId: string;
  clientName: string;
  auditYear: number;
  changeType: 'stage' | 'status';
  previousValue: string;
  newValue: string;
  updatedBy: string;
}

/**
 * Union type for type-specific notification data
 */
export type NotificationTypeData = 
  | ClientAssignmentData
  | AuditAssignmentData
  | AuditUpdateData;

/**
 * Template component for React-compatible notification content
 */
export interface NotificationTemplate {
  subject: string;
  content: ReactNode;
  plainTextContent: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Main notification message structure
 */
export interface NotificationMessage {
  type: NotificationType;
  recipient: NotificationRecipient;
  sender: NotificationSender;
  metadata: NotificationMetadata;
  template: NotificationTemplate;
  typeSpecificData: NotificationTypeData;
}

/**
 * Configuration for notification creation
 */
export interface NotificationConfig {
  enableSelfNotificationPrevention: boolean;
  enableDeduplication: boolean;
  deduplicationWindowMinutes: number;
  enableRateLimiting: boolean;
  rateLimitConfig: {
    [key in NotificationType]: {
      maxPerHour: number;
      maxPerDay: number;
      priorityExceptions: NotificationPriority[];
    };
  };
}

/**
 * Result of notification creation attempt
 */
export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  message: string;
  reason?: 'self_notification' | 'duplicate' | 'rate_limited' | 'invalid_entity' | 'system_error';
  retryAfter?: Date;
}

/**
 * Parameters for creating client assignment notifications
 */
export interface CreateClientAssignmentParams {
  clientId: string;
  managerId: string;
  createdByUserId: string;
  priority?: NotificationPriority;
}

/**
 * Parameters for creating audit assignment notifications
 */
export interface CreateAuditAssignmentParams {
  auditId: string;
  auditorId: string;
  createdByUserId: string;
  priority?: NotificationPriority;
}

/**
 * Parameters for creating audit update notifications
 */
export interface CreateAuditUpdateParams {
  auditId: string;
  changeType: 'stage' | 'status';
  newValue: string;
  previousValue: string;
  createdByUserId: string;
  recipientIds?: string[]; // Optional: specific recipients, otherwise all assigned users
  priority?: NotificationPriority;
}

/**
 * Client entity for validation
 */
export interface ValidatedClient {
  id: string;
  clientName: string;
  assignedUser: {
    id: string;
    name: string | null;
    email: string | null;
    role: {
      name: string;
    };
  } | null;
}

/**
 * Audit entity for validation
 */
export interface ValidatedAudit {
  id: string;
  auditYear: number;
  client: {
    id: string;
    clientName: string;
    auditPeriodEndDate: Date | null;
  };
  assignments: {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: {
        name: string;
      };
    };
  }[];
}

/**
 * Entity validation result
 */
export interface EntityValidationResult<T = unknown> {
  isValid: boolean;
  entity?: T;
  error?: string;
}

/**
 * Rate limiting check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  reason?: string;
} 