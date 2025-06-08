import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { NotificationService } from '@/server/services/notificationService';
import { TRPCError } from '@trpc/server';
import { NotificationType } from '@prisma/client';
import { observable } from '@trpc/server/observable';
import { notificationEventEmitter, type NotificationReadStatusEvent } from '@/server/services/eventEmitter';
import { NotificationCache } from '@/lib/redis';
import { MetricsCollector } from '@/lib/metrics';

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
  cursor: z.string().optional(), // Cursor-based pagination
  type: z.nativeEnum(NotificationType).optional(),
  unreadOnly: z.boolean().optional().default(false)
});

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1, 'At least one notification ID is required')
});

const markSingleAsReadSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID format')
});

export const notificationRouter = createTRPCRouter({
  /**
   * Get unread notifications for the current user
   */
  getUnread: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const notifications = await ctx.db.notification.findMany({
          where: {
            userId: ctx.session.user.id,
            isRead: false
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
                image: true,
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

        return notifications;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch unread notifications',
          cause: error
        });
      }
    }),

  /**
   * Get unread notification count for the current user with caching
   */
  getCount: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Try to get from cache first
        const cachedCount = await MetricsCollector.trackCacheOperation('get', () =>
          NotificationCache.getCachedNotificationCount(ctx.session.user.id, 'unread')
        );

        return await MetricsCollector.trackQuery('getCount', async () => {
          if (cachedCount !== null) {
            // Track cache hit
            MetricsCollector.updateActiveNotifications(cachedCount);
            return { count: cachedCount };
          }

          // Not in cache, query database
          const count = await ctx.db.notification.count({
            where: {
              userId: ctx.session.user.id,
              isRead: false
            }
          });

          // Cache the result
          await MetricsCollector.trackCacheOperation('set', () =>
            NotificationCache.cacheNotificationCount(ctx.session.user.id, count, 'unread')
          );

          // Update metrics
          MetricsCollector.updateActiveNotifications(count);

          return { count };
        }, cachedCount !== null);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notification count',
          cause: error
        });
      }
    }),

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
   * Get notifications for the current user with cursor-based pagination
   */
  getUserNotifications: protectedProcedure
    .input(getUserNotificationsSchema)
    .query(async ({ ctx, input }) => {
      try {
        // Build where clause
        const whereClause = {
          userId: ctx.session.user.id,
          ...(input.type && { type: input.type }),
          ...(input.unreadOnly && { isRead: false }),
          // Cursor-based pagination: get notifications older than cursor
          ...(input.cursor && {
            createdAt: {
              lt: new Date(input.cursor)
            }
          })
        };

        const notifications = await ctx.db.notification.findMany({
          where: whereClause,
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
                image: true,
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
          take: input.limit + 1 // Get one extra to check if there are more
        });

        // Check if there are more notifications
        const hasMore = notifications.length > input.limit;
        if (hasMore) {
          notifications.pop(); // Remove the extra notification
        }

        // Get next cursor from the last notification
        const nextCursor = notifications.length > 0 
          ? notifications[notifications.length - 1]?.createdAt.toISOString()
          : null;

        // Get total counts (cached for performance)
        const filterHash = input.type ? `type:${input.type}` : '';
        const unreadFilterHash = input.unreadOnly ? 'unread' : '';
        
        // Try to get cached counts first
        const [cachedTotalCount, cachedUnreadCount] = await Promise.all([
          NotificationCache.getCachedNotificationCount(
            ctx.session.user.id, 
            'total', 
            `${filterHash}${unreadFilterHash}`
          ),
          NotificationCache.getCachedNotificationCount(
            ctx.session.user.id, 
            'unread'
          )
        ]);

        let totalCount = cachedTotalCount;
        let unreadCount = cachedUnreadCount;

        // Query database for missing counts
        const queries = [];
        if (totalCount === null) {
          queries.push(
            ctx.db.notification.count({
              where: {
                userId: ctx.session.user.id,
                ...(input.type && { type: input.type }),
                ...(input.unreadOnly && { isRead: false })
              }
            }).then(count => {
              totalCount = count;
              // Cache the result
              NotificationCache.cacheNotificationCount(
                ctx.session.user.id, 
                count, 
                'total', 
                `${filterHash}${unreadFilterHash}`
              );
            })
          );
        }

        if (unreadCount === null) {
          queries.push(
            ctx.db.notification.count({
              where: {
                userId: ctx.session.user.id,
                isRead: false
              }
            }).then(count => {
              unreadCount = count;
              // Cache the result
              NotificationCache.cacheNotificationCount(
                ctx.session.user.id, 
                count, 
                'unread'
              );
            })
          );
        }

        // Wait for any missing counts to be fetched
        if (queries.length > 0) {
          await Promise.all(queries);
        }

        return {
          notifications,
          totalCount: totalCount ?? 0,
          unreadCount: unreadCount ?? 0,
          hasMore,
          nextCursor,
          // Legacy support for offset-based pagination
          hasMoreLegacy: input.offset + input.limit < (totalCount ?? 0)
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
   * Mark a single notification as read (alias for compatibility)
   */
  markAsRead: protectedProcedure
    .input(z.union([markAsReadSchema, markSingleAsReadSchema]))
    .mutation(async ({ ctx, input }) => {
      try {
        // Handle both single notification ID and array of IDs
        const notificationIds = 'notificationId' in input 
          ? [input.notificationId] 
          : input.notificationIds;

        const result = await ctx.db.notification.updateMany({
          where: {
            id: {
              in: notificationIds
            },
            userId: ctx.session.user.id, // Security: only update user's own notifications
            isRead: false // Only update unread notifications
          },
          data: {
            isRead: true
          }
        });

        // Get updated unread count for real-time sync
        const unreadCount = await ctx.db.notification.count({
          where: {
            userId: ctx.session.user.id,
            isRead: false
          }
        });

        // Invalidate user's notification cache since counts have changed
        if (result.count > 0) {
          await MetricsCollector.trackCacheOperation('invalidate', () =>
            NotificationCache.invalidateUserCache(ctx.session.user.id)
          );
          
          // Track notification read metrics
          MetricsCollector.trackNotificationRead('mixed', 'single');
          MetricsCollector.updateActiveNotifications(unreadCount);
          
          // Broadcast read status change to all user sessions for multi-device sync
          notificationEventEmitter.broadcastReadStatusChange({
            userId: ctx.session.user.id,
            notificationIds,
            isRead: true,
            unreadCount,
            timestamp: new Date()
          });
        }

        return {
          success: true,
          updatedCount: result.count,
          unreadCount,
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
   * Mark multiple notifications as read (explicit array endpoint)
   */
  markMultipleAsRead: protectedProcedure
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
        // Get all unread notification IDs before marking them as read
        const unreadNotifications = await ctx.db.notification.findMany({
          where: {
            userId: ctx.session.user.id,
            isRead: false
          },
          select: {
            id: true
          }
        });

        const notificationIds = unreadNotifications.map(n => n.id);

        const result = await ctx.db.notification.updateMany({
          where: {
            userId: ctx.session.user.id,
            isRead: false
          },
          data: {
            isRead: true
          }
        });

        // Invalidate user's notification cache since counts have changed
        if (result.count > 0) {
          await MetricsCollector.trackCacheOperation('invalidate', () =>
            NotificationCache.invalidateUserCache(ctx.session.user.id)
          );
          
          // Track notification read metrics
          MetricsCollector.trackNotificationRead('mixed', 'bulk');
          MetricsCollector.updateActiveNotifications(0);
          
          // Broadcast bulk read status change to all user sessions for multi-device sync
          notificationEventEmitter.broadcastBulkReadStatusChange({
            userId: ctx.session.user.id,
            notificationIds,
            isRead: true,
            unreadCount: 0, // All notifications are now read
            timestamp: new Date()
          });
        }

        return {
          success: true,
          updatedCount: result.count,
          unreadCount: 0,
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
    }),

  /**
   * Real-time notification read status subscription
   * 
   * Subscribes to read status changes for the current user across all devices.
   * Emits events when notifications are marked as read on any device.
   */
  subscribeToReadStatus: protectedProcedure
    .subscription(({ ctx }) => {
      return observable<NotificationReadStatusEvent>((emit) => {
        const userId = ctx.session.user.id;

        // Handler for individual read status changes
        const onReadStatusChange = (data: NotificationReadStatusEvent) => {
          // Only emit events for the current user
          if (data.userId === userId) {
            emit.next(data);
          }
        };

        // Handler for bulk read status changes (mark all as read)
        const onBulkReadStatusChange = (data: NotificationReadStatusEvent) => {
          // Only emit events for the current user
          if (data.userId === userId) {
            emit.next(data);
          }
        };

        // Subscribe to user-specific events
        notificationEventEmitter.subscribeToUserReadStatus(userId, onReadStatusChange);
        notificationEventEmitter.subscribeToUserBulkReadStatus(userId, onBulkReadStatusChange);

        // Cleanup function when subscription ends
        return () => {
          notificationEventEmitter.unsubscribeFromUser(userId, onReadStatusChange);
          notificationEventEmitter.unsubscribeFromUser(userId, onBulkReadStatusChange);
        };
      });
    }),

  /**
   * Legacy subscription endpoint (for backward compatibility)
   * 
   * @deprecated Use subscribeToReadStatus for real-time read status updates
   */
  subscribe: protectedProcedure
    .query(async ({ ctx }) => {
      // Legacy implementation for backward compatibility
      try {
        const notifications = await ctx.db.notification.findMany({
          where: {
            userId: ctx.session.user.id,
            isRead: false
          },
          select: {
            id: true,
            type: true,
            message: true,
            linkUrl: true,
            isRead: true,
            entityId: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Latest 10 unread notifications
        });

        return {
          type: 'initial_state',
          notifications,
          timestamp: new Date().toISOString(),
          note: 'This is a legacy endpoint. Use subscribeToReadStatus for real-time updates.'
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notification subscription data',
          cause: error
        });
      }
    })
}); 