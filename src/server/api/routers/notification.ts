import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { NotificationService } from '@/server/services/notificationService';
import { TRPCError } from '@trpc/server';
import { NotificationType } from '@prisma/client';

// Zod schemas for input validation
const notificationPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

const createClientAssignmentSchema = z.object({
  clientId: z.string().uuid('Invalid client ID format'),
  managerId: z.string().uuid('Invalid manager ID format'),
  priority: notificationPrioritySchema.optional()
});

const createAuditAssignmentSchema = z.object({
  auditId: z.string().uuid('Invalid audit ID format'),
  auditorId: z.string().uuid('Invalid auditor ID format'),
  priority: notificationPrioritySchema.optional()
});

const createAuditUpdateSchema = z.object({
  auditId: z.string().uuid('Invalid audit ID format'),
  changeType: z.enum(['stage', 'status']),
  newValue: z.string().min(1, 'New value is required'),
  previousValue: z.string().min(1, 'Previous value is required'),
  recipientIds: z.array(z.string().uuid()).optional(),
  priority: notificationPrioritySchema.optional()
});

const getUserNotificationsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  type: z.nativeEnum(NotificationType).optional(),
  unreadOnly: z.boolean().optional().default(false)
});

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1, 'At least one notification ID is required')
});

export const notificationRouter = createTRPCRouter({
  /**
   * Create a client assignment notification
   */
  createClientAssignment: protectedProcedure
    .input(createClientAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const notificationService = new NotificationService(ctx.db);
        
        const result = await notificationService.createClientAssignmentNotification({
          clientId: input.clientId,
          managerId: input.managerId,
          createdByUserId: ctx.session.user.id,
          priority: input.priority
        });

        if (!result.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: result.message,
            cause: result.reason
          });
        }

        return {
          success: true,
          notificationId: result.notificationId,
          message: result.message
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create client assignment notification',
          cause: error
        });
      }
    }),

  /**
   * Create an audit assignment notification
   */
  createAuditAssignment: protectedProcedure
    .input(createAuditAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const notificationService = new NotificationService(ctx.db);
        
        const result = await notificationService.createAuditAssignmentNotification({
          auditId: input.auditId,
          auditorId: input.auditorId,
          createdByUserId: ctx.session.user.id,
          priority: input.priority
        });

        if (!result.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: result.message,
            cause: result.reason
          });
        }

        return {
          success: true,
          notificationId: result.notificationId,
          message: result.message
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create audit assignment notification',
          cause: error
        });
      }
    }),

  /**
   * Create audit update notifications (stage or status)
   */
  createAuditUpdate: protectedProcedure
    .input(createAuditUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const notificationService = new NotificationService(ctx.db);
        
        const results = await notificationService.createAuditUpdateNotification({
          auditId: input.auditId,
          changeType: input.changeType,
          newValue: input.newValue,
          previousValue: input.previousValue,
          createdByUserId: ctx.session.user.id,
          recipientIds: input.recipientIds,
          priority: input.priority
        });

        // Count successful and failed notifications
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        if (failed > 0 && successful === 0) {
          // All failed
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `All notifications failed. Reasons: ${results.map(r => r.message).join(', ')}`,
            cause: 'all_failed'
          });
        }

        return {
          success: true,
          successful,
          failed,
          details: results,
          message: `Created ${successful} notification(s)${failed > 0 ? `, ${failed} failed` : ''}`
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create audit update notifications',
          cause: error
        });
      }
    }),

  /**
   * Get notifications for the current user
   */
  getUserNotifications: protectedProcedure
    .input(getUserNotificationsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const notifications = await ctx.db.notification.findMany({
          where: {
            userId: ctx.session.user.id,
            ...(input.type && { type: input.type }),
            ...(input.unreadOnly && { isRead: false })
          },
          select: {
            id: true,
            type: true,
            message: true,
            linkUrl: true,
            isRead: true,
            entityId: true,
            createdAt: true,
            createdByUser: {
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
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: input.limit,
          skip: input.offset
        });

        const totalCount = await ctx.db.notification.count({
          where: {
            userId: ctx.session.user.id,
            ...(input.type && { type: input.type }),
            ...(input.unreadOnly && { isRead: false })
          }
        });

        const unreadCount = await ctx.db.notification.count({
          where: {
            userId: ctx.session.user.id,
            isRead: false
          }
        });

        return {
          notifications,
          totalCount,
          unreadCount,
          hasMore: input.offset + input.limit < totalCount
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
          cause: error
        });
      }
    }),

  /**
   * Mark notifications as read
   */
  markAsRead: protectedProcedure
    .input(markAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.notification.updateMany({
          where: {
            id: {
              in: input.notificationIds
            },
            userId: ctx.session.user.id, // Security: only update user's own notifications
            isRead: false // Only update unread notifications
          },
          data: {
            isRead: true
          }
        });

        return {
          success: true,
          updatedCount: result.count,
          message: `Marked ${result.count} notification(s) as read`
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notifications as read',
          cause: error
        });
      }
    }),

  /**
   * Mark all notifications as read for the current user
   */
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const result = await ctx.db.notification.updateMany({
          where: {
            userId: ctx.session.user.id,
            isRead: false
          },
          data: {
            isRead: true
          }
        });

        return {
          success: true,
          updatedCount: result.count,
          message: `Marked ${result.count} notification(s) as read`
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark all notifications as read',
          cause: error
        });
      }
    }),

  /**
   * Get notification statistics for the current user
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const [totalCount, unreadCount, typeBreakdown] = await Promise.all([
          ctx.db.notification.count({
            where: { userId: ctx.session.user.id }
          }),
          ctx.db.notification.count({
            where: { userId: ctx.session.user.id, isRead: false }
          }),
          ctx.db.notification.groupBy({
            by: ['type'],
            where: { userId: ctx.session.user.id },
            _count: {
              type: true
            }
          })
        ]);

        const typeStats = typeBreakdown.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<NotificationType, number>);

        return {
          totalCount,
          unreadCount,
          readCount: totalCount - unreadCount,
          typeStats
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notification statistics',
          cause: error
        });
      }
    }),

  /**
   * Delete old read notifications (cleanup endpoint)
   */
  cleanup: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const result = await ctx.db.notification.deleteMany({
          where: {
            userId: ctx.session.user.id,
            isRead: true,
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        });

        return {
          success: true,
          deletedCount: result.count,
          message: `Deleted ${result.count} old notification(s)`
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cleanup old notifications',
          cause: error
        });
      }
    })
}); 