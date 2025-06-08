import { PrismaClient } from '@prisma/client';
// Note: TRPCError is used in the tRPC router, not in this service
import type {
  NotificationResult,
  NotificationConfig,
  NotificationPriority,
  EntityValidationResult,
  ValidatedClient,
  ValidatedAudit,
  RateLimitResult,
  CreateClientAssignmentParams,
  CreateAuditAssignmentParams,
  CreateAuditUpdateParams,
  ClientAssignmentData,
  AuditAssignmentData,
  AuditUpdateData,
  NotificationRecipient,
  NotificationSender
} from '@/types/notification';
import { NotificationType } from '@prisma/client';
import { NotificationTemplateService } from './notificationTemplates';
import { logger } from '@/server/api/utils/logger';

/**
 * Notification Service - Handles creation, validation, and management of notifications
 */
export class NotificationService {
  private prisma: PrismaClient;
  private config: NotificationConfig;

  constructor(prisma: PrismaClient, config?: Partial<NotificationConfig>) {
    this.prisma = prisma;
    this.config = this.getDefaultConfig(config);
  }

  /**
   * Get default configuration with optional overrides
   */
  private getDefaultConfig(overrides?: Partial<NotificationConfig>): NotificationConfig {
    const defaultConfig: NotificationConfig = {
      enableSelfNotificationPrevention: true,
      enableDeduplication: true,
      deduplicationWindowMinutes: 30,
      enableRateLimiting: true,
      rateLimitConfig: {
        client_assignment: {
          maxPerHour: 50,
          maxPerDay: 200,
          priorityExceptions: ['critical']
        },
        audit_assignment: {
          maxPerHour: 30,
          maxPerDay: 150,
          priorityExceptions: ['critical']
        },
        audit_stage_update: {
          maxPerHour: 100,
          maxPerDay: 500,
          priorityExceptions: ['critical', 'high']
        },
        audit_status_update: {
          maxPerHour: 100,
          maxPerDay: 500,
          priorityExceptions: ['critical', 'high']
        }
      }
    };

    return { ...defaultConfig, ...overrides };
  }

  /**
   * Fetch user details for notification
   */
  private async fetchUser(userId: string): Promise<NotificationRecipient | NotificationSender | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: {
            select: {
              name: true
            }
          }
        }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name
      };
    } catch (error) {
      logger.error('Error fetching user for notification:', error);
      return null;
    }
  }

  /**
   * Validate client entity and fetch required data
   */
  private async validateClient(clientId: string): Promise<EntityValidationResult<ValidatedClient>> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          clientName: true,
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      if (!client) {
        return {
          isValid: false,
          error: `Client with ID ${clientId} not found`
        };
      }

      return {
        isValid: true,
        entity: client
      };
    } catch (error) {
      logger.error('Error validating client:', error);
      return {
        isValid: false,
        error: 'Database error while validating client'
      };
    }
  }

  /**
   * Validate audit entity and fetch required data
   */
  private async validateAudit(auditId: string): Promise<EntityValidationResult<ValidatedAudit>> {
    try {
      const audit = await this.prisma.audit.findUnique({
        where: { id: auditId },
        select: {
          id: true,
          auditYear: true,
          client: {
            select: {
              id: true,
              clientName: true,
              auditPeriodEndDate: true
            }
          },
          assignments: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!audit) {
        return {
          isValid: false,
          error: `Audit with ID ${auditId} not found`
        };
      }

      return {
        isValid: true,
        entity: audit
      };
    } catch (error) {
      logger.error('Error validating audit:', error);
      return {
        isValid: false,
        error: 'Database error while validating audit'
      };
    }
  }

  /**
   * Check for duplicate notifications
   */
  private async checkDuplicateNotification(
    userId: string,
    type: NotificationType,
    entityId?: string
  ): Promise<boolean> {
    if (!this.config.enableDeduplication) {
      return false;
    }

    try {
      const since = new Date(Date.now() - this.config.deduplicationWindowMinutes * 60 * 1000);
      
      const existingNotification = await this.prisma.notification.findFirst({
        where: {
          userId,
          type,
          ...(entityId && { entityId }),
          createdAt: {
            gte: since
          }
        }
      });

      return !!existingNotification;
    } catch (error) {
      logger.error('Error checking duplicate notification:', error);
      return false; // On error, allow the notification to proceed
    }
  }

  /**
   * Check rate limiting for user and notification type
   */
  private async checkRateLimit(
    userId: string,
    type: NotificationType,
    priority: NotificationPriority
  ): Promise<RateLimitResult> {
    if (!this.config.enableRateLimiting) {
      return {
        allowed: true,
        remaining: 999,
        resetTime: new Date(Date.now() + 3600000) // 1 hour from now
      };
    }

    const limits = this.config.rateLimitConfig[type];
    
    // Check if priority bypasses rate limits
    if (limits.priorityExceptions.includes(priority)) {
      return {
        allowed: true,
        remaining: 999,
        resetTime: new Date(Date.now() + 3600000)
      };
    }

    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const oneDayAgo = new Date(now.getTime() - 86400000);

      // Count notifications in the last hour and day
      const [hourlyCount, dailyCount] = await Promise.all([
        this.prisma.notification.count({
          where: {
            createdByUserId: userId,
            type,
            createdAt: {
              gte: oneHourAgo
            }
          }
        }),
        this.prisma.notification.count({
          where: {
            createdByUserId: userId,
            type,
            createdAt: {
              gte: oneDayAgo
            }
          }
        })
      ]);

      // Check hourly limit
      if (hourlyCount >= limits.maxPerHour) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(now.getTime() + 3600000),
          reason: `Hourly limit of ${limits.maxPerHour} notifications exceeded`
        };
      }

      // Check daily limit
      if (dailyCount >= limits.maxPerDay) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(now.getTime() + 86400000),
          reason: `Daily limit of ${limits.maxPerDay} notifications exceeded`
        };
      }

      return {
        allowed: true,
        remaining: Math.min(limits.maxPerHour - hourlyCount, limits.maxPerDay - dailyCount),
        resetTime: new Date(now.getTime() + 3600000)
      };
    } catch (error) {
      logger.error('Error checking rate limit:', error);
      return {
        allowed: true,
        remaining: 999,
        resetTime: new Date(Date.now() + 3600000)
      };
    }
  }

  /**
   * Prevent self-notifications
   */
  private preventSelfNotification(recipientId: string, createdByUserId: string): boolean {
    return this.config.enableSelfNotificationPrevention && recipientId === createdByUserId;
  }

  /**
   * Core notification creation function
   */
  private async createNotification(
    type: NotificationType,
    recipientId: string,
    createdByUserId: string,
    entityId: string | undefined,
    message: string,
    linkUrl?: string
  ): Promise<NotificationResult> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          type,
          userId: recipientId,
          createdByUserId,
          entityId,
          message,
          linkUrl,
          isRead: false
        }
      });

      logger.info(`Notification created successfully: ${notification.id}`, {
        type,
        recipientId,
        createdByUserId,
        entityId
      });

      return {
        success: true,
        notificationId: notification.id,
        message: 'Notification created successfully'
      };
    } catch (error) {
      logger.error('Error creating notification in database:', error);
      return {
        success: false,
        message: 'Failed to create notification in database',
        reason: 'system_error'
      };
    }
  }

  /**
   * Create client assignment notification
   */
  async createClientAssignmentNotification(
    params: CreateClientAssignmentParams
  ): Promise<NotificationResult> {
    const { clientId, managerId, createdByUserId, priority = 'medium' } = params;

    // Prevent self-notification
    if (this.preventSelfNotification(managerId, createdByUserId)) {
      return {
        success: false,
        message: 'Self-notification prevented',
        reason: 'self_notification'
      };
    }

    // Validate entities
    const clientValidation = await this.validateClient(clientId);
    if (!clientValidation.isValid) {
      return {
        success: false,
        message: clientValidation.error || 'Invalid client',
        reason: 'invalid_entity'
      };
    }

    const [recipient, sender] = await Promise.all([
      this.fetchUser(managerId),
      this.fetchUser(createdByUserId)
    ]);

    if (!recipient || !sender) {
      return {
        success: false,
        message: 'User not found',
        reason: 'invalid_entity'
      };
    }

    // Check for duplicates
    const isDuplicate = await this.checkDuplicateNotification(managerId, 'client_assignment', clientId);
    if (isDuplicate) {
      return {
        success: false,
        message: 'Duplicate notification prevented',
        reason: 'duplicate'
      };
    }

    // Check rate limits
    const rateLimitResult = await this.checkRateLimit(createdByUserId, 'client_assignment', priority);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        message: rateLimitResult.reason || 'Rate limit exceeded',
        reason: 'rate_limited',
        retryAfter: rateLimitResult.resetTime
      };
    }

    // Generate template
    const clientAssignmentData: ClientAssignmentData = {
      clientId,
      clientName: clientValidation.entity!.clientName,
      managerName: recipient.name || 'Unknown',
      assignmentDate: new Date()
    };

    const template = NotificationTemplateService.generateTemplate(
      'client_assignment',
      clientAssignmentData
    );

    // Create notification
    return this.createNotification(
      'client_assignment',
      managerId,
      createdByUserId,
      clientId,
      template.plainTextContent,
      template.actionUrl
    );
  }

  /**
   * Create audit assignment notification
   */
  async createAuditAssignmentNotification(
    params: CreateAuditAssignmentParams
  ): Promise<NotificationResult> {
    const { auditId, auditorId, createdByUserId, priority = 'medium' } = params;

    // Prevent self-notification
    if (this.preventSelfNotification(auditorId, createdByUserId)) {
      return {
        success: false,
        message: 'Self-notification prevented',
        reason: 'self_notification'
      };
    }

    // Validate entities
    const auditValidation = await this.validateAudit(auditId);
    if (!auditValidation.isValid) {
      return {
        success: false,
        message: auditValidation.error || 'Invalid audit',
        reason: 'invalid_entity'
      };
    }

    const [recipient, sender] = await Promise.all([
      this.fetchUser(auditorId),
      this.fetchUser(createdByUserId)
    ]);

    if (!recipient || !sender) {
      return {
        success: false,
        message: 'User not found',
        reason: 'invalid_entity'
      };
    }

    // Check for duplicates
    const isDuplicate = await this.checkDuplicateNotification(auditorId, 'audit_assignment', auditId);
    if (isDuplicate) {
      return {
        success: false,
        message: 'Duplicate notification prevented',
        reason: 'duplicate'
      };
    }

    // Check rate limits
    const rateLimitResult = await this.checkRateLimit(createdByUserId, 'audit_assignment', priority);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        message: rateLimitResult.reason || 'Rate limit exceeded',
        reason: 'rate_limited',
        retryAfter: rateLimitResult.resetTime
      };
    }

    // Generate template
    const auditAssignmentData: AuditAssignmentData = {
      auditId,
      clientName: auditValidation.entity!.client.clientName,
      auditYear: auditValidation.entity!.auditYear,
      auditorName: recipient.name || 'Unknown',
      assignmentDate: new Date(),
      periodEndDate: auditValidation.entity!.client.auditPeriodEndDate || undefined
    };

    const template = NotificationTemplateService.generateTemplate(
      'audit_assignment',
      auditAssignmentData
    );

    // Create notification
    return this.createNotification(
      'audit_assignment',
      auditorId,
      createdByUserId,
      auditId,
      template.plainTextContent,
      template.actionUrl
    );
  }

  /**
   * Create audit update notification (stage or status)
   */
  async createAuditUpdateNotification(
    params: CreateAuditUpdateParams
  ): Promise<NotificationResult[]> {
    const {
      auditId,
      changeType,
      newValue,
      previousValue,
      createdByUserId,
      recipientIds,
      priority = 'medium'
    } = params;

    // Validate audit
    const auditValidation = await this.validateAudit(auditId);
    if (!auditValidation.isValid) {
      return [{
        success: false,
        message: auditValidation.error || 'Invalid audit',
        reason: 'invalid_entity'
      }];
    }

    const sender = await this.fetchUser(createdByUserId);
    if (!sender) {
      return [{
        success: false,
        message: 'Sender user not found',
        reason: 'invalid_entity'
      }];
    }

    // Determine recipients - either specified or all assigned users
    const targetRecipientIds = recipientIds || auditValidation.entity!.assignments.map((a: { user: { id: string } }) => a.user.id);

    // Remove self-notifications
    const filteredRecipientIds = this.config.enableSelfNotificationPrevention
      ? targetRecipientIds.filter(id => id !== createdByUserId)
      : targetRecipientIds;

    const results: NotificationResult[] = [];

    // Generate template data
    const notificationType: NotificationType = changeType === 'stage' ? 'audit_stage_update' : 'audit_status_update';
    
    const auditUpdateData: AuditUpdateData = {
      auditId,
      clientName: auditValidation.entity!.client.clientName,
      auditYear: auditValidation.entity!.auditYear,
      changeType,
      previousValue,
      newValue,
      updatedBy: sender.name || 'Unknown'
    };

    const template = NotificationTemplateService.generateTemplate(notificationType, auditUpdateData);

    // Create notifications for each recipient
    for (const recipientId of filteredRecipientIds) {
      // Check for duplicates
      const isDuplicate = await this.checkDuplicateNotification(recipientId, notificationType, auditId);
      if (isDuplicate) {
        results.push({
          success: false,
          message: `Duplicate notification prevented for user ${recipientId}`,
          reason: 'duplicate'
        });
        continue;
      }

      // Check rate limits
      const rateLimitResult = await this.checkRateLimit(createdByUserId, notificationType, priority);
      if (!rateLimitResult.allowed) {
        results.push({
          success: false,
          message: rateLimitResult.reason || 'Rate limit exceeded',
          reason: 'rate_limited',
          retryAfter: rateLimitResult.resetTime
        });
        continue;
      }

      // Create notification
      const result = await this.createNotification(
        notificationType,
        recipientId,
        createdByUserId,
        auditId,
        template.plainTextContent,
        template.actionUrl
      );

      results.push(result);
    }

    return results;
  }
} 