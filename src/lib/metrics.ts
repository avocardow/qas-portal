/* eslint-disable @typescript-eslint/no-explicit-any */
// Conditional imports for server-side only
let promClient: typeof import('prom-client') | null = null;

// Initialize Prometheus client only on server side
const initializePrometheusClient = async () => {
  if (typeof window === 'undefined' && !promClient) {
    promClient = await import('prom-client');
    
    // Configure default metrics collection
    promClient.register.setDefaultLabels({
      app: 'qas-portal',
      service: 'notifications'
    });
  }
  return promClient;
};

// Type definitions for metrics
interface NotificationMetrics {
  notificationsCreated?: unknown;
  notificationsRead?: unknown;
  notificationsSent?: unknown;
  notificationQueries?: unknown;
  notificationQueryDuration?: unknown;
  notificationProcessingDuration?: unknown;
  activeWebSocketConnections?: unknown;
  unreadNotificationsCount?: unknown;
  redisConnectionsActive?: unknown;
  cacheSize?: unknown;
  connectionsTotal?: unknown;
  messagesTotal?: unknown;
  connectionDuration?: unknown;
  reconnectionAttempts?: unknown;
  cacheHits?: unknown;
  cacheMisses?: unknown;
}

interface DatabaseMetrics {
  queryCount?: unknown;
  queryDuration?: unknown;
  connectionPool?: unknown;
}

interface CacheMetrics {
  operations?: unknown;
  hitRate?: unknown;
  memoryUsage?: unknown;
}

interface HealthMetrics {
  servicesUp?: unknown;
  lastHealthCheck?: unknown;
}

interface SystemMetrics {
  memoryUsage?: unknown;
  eventLoopLag?: unknown;
}

// Lazy initialization of metrics
let metricsInitialized = false;
let notificationMetrics: NotificationMetrics = {};

const initializeNotificationMetrics = async () => {
  if (metricsInitialized || typeof window !== 'undefined') return;
  
  const client = await initializePrometheusClient();
  if (!client) return;

  const { Counter, Histogram, Gauge } = client;

  // Notification-specific metrics
  notificationMetrics = {
    // Counters for event tracking
    notificationsCreated: new Counter({
      name: 'qas_notifications_created_total',
      help: 'Total number of notifications created',
      labelNames: ['type', 'priority', 'userId'],
    }),

    notificationsRead: new Counter({
      name: 'qas_notifications_read_total',
      help: 'Total number of notifications marked as read',
      labelNames: ['type', 'userId'],
    }),

    notificationsSent: new Counter({
      name: 'qas_notifications_sent_total',
      help: 'Total number of notifications sent via different channels',
      labelNames: ['channel', 'success'],
    }),

    notificationQueries: new Counter({
      name: 'notification_queries_total',
      help: 'Total number of notification queries',
      labelNames: ['endpoint', 'cache_hit'] as const
    }),

    // Histograms for performance measurement
    notificationQueryDuration: new Histogram({
      name: 'qas_notification_query_duration_seconds',
      help: 'Duration of notification database queries',
      labelNames: ['operation', 'status'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    }),

    notificationProcessingDuration: new Histogram({
      name: 'qas_notification_processing_duration_seconds',
      help: 'Duration of notification processing operations',
      labelNames: ['operation'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    }),

    // Gauges for current state
    activeWebSocketConnections: new Gauge({
      name: 'qas_websocket_connections_active',
      help: 'Number of active WebSocket connections',
    }),

    unreadNotificationsCount: new Gauge({
      name: 'qas_notifications_unread_count',
      help: 'Current number of unread notifications per user',
      labelNames: ['userId'],
    }),

    redisConnectionsActive: new Gauge({
      name: 'qas_redis_connections_active',
      help: 'Number of active Redis connections',
    }),

    cacheSize: new Gauge({
      name: 'notification_cache_size_bytes',
      help: 'Current size of notification cache in bytes'
    }),

    // WebSocket metrics
    connectionsTotal: new Counter({
      name: 'qas_websocket_connections_total',
      help: 'Total number of WebSocket connection attempts',
      labelNames: ['status'],
    }),

    messagesTotal: new Counter({
      name: 'qas_websocket_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['direction', 'type'],
    }),

    connectionDuration: new Histogram({
      name: 'qas_websocket_connection_duration_seconds',
      help: 'Duration of WebSocket connections',
      buckets: [1, 5, 10, 30, 60, 300, 600, 1800, 3600],
    }),

    reconnectionAttempts: new Counter({
      name: 'qas_websocket_reconnection_attempts_total',
      help: 'Total number of WebSocket reconnection attempts',
      labelNames: ['reason'],
    }),
  };

  metricsInitialized = true;
};

export { notificationMetrics };

// Initialize other metrics
let databaseMetrics: DatabaseMetrics = {};
let cacheMetrics: CacheMetrics = {};

const initializeOtherMetrics = async () => {
  if (typeof window !== 'undefined') return;
  
  const client = await initializePrometheusClient();
  if (!client) return;

  const { Counter, Histogram, Gauge } = client;

  // Database performance metrics
  databaseMetrics = {
    queryCount: new Counter({
      name: 'database_queries_total',
      help: 'Total database queries executed',
      labelNames: ['table', 'operation'] as const
    }),

    queryDuration: new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Database query execution time',
      labelNames: ['table', 'operation'] as const,
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]
    }),

    connectionPool: new Gauge({
      name: 'database_connection_pool_active',
      help: 'Active database connections in pool'
    })
  };

  // Redis cache metrics
  cacheMetrics = {
    operations: new Counter({
      name: 'cache_operations_total',
      help: 'Total cache operations',
      labelNames: ['operation', 'result'] as const // get/set/delete, hit/miss/error
    }),

    hitRate: new Gauge({
      name: 'cache_hit_rate_percent',
      help: 'Cache hit rate percentage'
    }),

    memoryUsage: new Gauge({
      name: 'cache_memory_usage_bytes',
      help: 'Redis memory usage in bytes'
    })
  };
};

export { databaseMetrics, cacheMetrics };

// Performance tracking utilities
export class MetricsCollector {
  // Ensure metrics are initialized before use
  private static async ensureInitialized() {
    await initializeNotificationMetrics();
    await initializeOtherMetrics();
  }

  // Track notification creation
  static async trackNotificationCreated(type: string, priority: string = 'medium', userId: string = 'unknown') {
    if (typeof window !== 'undefined') return;
    await this.ensureInitialized();
    (notificationMetrics.notificationsCreated as any)?.inc({ type, priority, userId });
  }

  // Track notification read operations
  static async trackNotificationRead(type: string, userId: string = 'unknown') {
    if (typeof window !== 'undefined') return;
    await this.ensureInitialized();
    (notificationMetrics.notificationsRead as any)?.inc({ type, userId });
  }

  // Track notification sent
  static async trackNotificationSent(channel: string, success: boolean) {
    if (typeof window !== 'undefined') return;
    await this.ensureInitialized();
    (notificationMetrics.notificationsSent as any)?.inc({ channel, success: success.toString() });
  }

  // Track query performance with caching
  static async trackQuery<T>(
    endpoint: string,
    operation: () => Promise<T>,
    cacheHit: boolean = false
  ): Promise<T> {
    if (typeof window !== 'undefined') {
      return await operation();
    }
    
    await this.ensureInitialized();
    const timer = (notificationMetrics.notificationQueryDuration as any)?.startTimer({ operation: 'query', status: cacheHit ? 'hit' : 'miss' }) || (() => {});
    
    try {
      (notificationMetrics.notificationQueries as any)?.inc({ endpoint, cache_hit: cacheHit.toString() });
      const result = await operation();
      return result;
    } finally {
      timer();
    }
  }

  // Track cache operations
  static async trackCacheOperation<T>(
    operation: string,
    cacheOperation: () => Promise<T>
  ): Promise<T> {
    if (typeof window !== 'undefined') {
      return await cacheOperation();
    }
    
    await this.ensureInitialized();
    const timer = (notificationMetrics.notificationProcessingDuration as any)?.startTimer({ operation }) || (() => {});
    
    try {
      const result = await cacheOperation();
      (cacheMetrics.operations as any)?.inc({ operation, result: 'success' });
      return result;
    } catch (error) {
      (cacheMetrics.operations as any)?.inc({ operation, result: 'error' });
      throw error;
    } finally {
      timer();
    }
  }

  // Update WebSocket connection count
  static async updateWebSocketConnections(count: number) {
    if (typeof window !== 'undefined') return;
    await this.ensureInitialized();
    (notificationMetrics.connectionsTotal as any)?.inc({ status: 'success' });
    (notificationMetrics.activeWebSocketConnections as any)?.set(count);
  }

  // Track WebSocket message
  static async trackWebSocketMessage(direction: 'inbound' | 'outbound', type: string) {
    if (typeof window !== 'undefined') return;
    await this.ensureInitialized();
    (notificationMetrics.messagesTotal as any)?.inc({ direction, type });
  }

  // Update cache statistics
  static async updateCacheStats(hitRate: number, memoryUsage: number, size: number) {
    if (typeof window !== 'undefined') return;
    await this.ensureInitialized();
    (cacheMetrics.hitRate as any)?.set(hitRate);
    (cacheMetrics.memoryUsage as any)?.set(memoryUsage);
    (notificationMetrics.cacheSize as any)?.set(size);
  }

  // Update active notifications count
  static async updateActiveNotifications(count: number) {
    if (typeof window !== 'undefined') return;
    await this.ensureInitialized();
    (notificationMetrics.unreadNotificationsCount as any)?.set({ userId: 'unknown' }, count);
  }
}

// Initialize health and system metrics
let healthMetrics: HealthMetrics = {};
let systemMetrics: SystemMetrics = {};

const initializeHealthMetrics = async () => {
  if (typeof window !== 'undefined') return;
  
  const client = await initializePrometheusClient();
  if (!client) return;

  const { Gauge, Histogram } = client;

  // Health check metrics
  healthMetrics = {
    servicesUp: new Gauge({
      name: 'services_up',
      help: 'Service health status (1 = up, 0 = down)',
      labelNames: ['service'] as const
    }),

    lastHealthCheck: new Gauge({
      name: 'last_health_check_timestamp',
      help: 'Timestamp of last successful health check',
      labelNames: ['service'] as const
    })
  };

  // System performance metrics
  systemMetrics = {
    memoryUsage: new Gauge({
      name: 'nodejs_memory_usage_bytes',
      help: 'Node.js memory usage by type',
      labelNames: ['type'] as const // rss, heapUsed, heapTotal, external
    }),

    eventLoopLag: new Histogram({
      name: 'nodejs_eventloop_lag_seconds',
      help: 'Event loop lag in seconds',
      buckets: [0.001, 0.01, 0.1, 1.0]
    })
  };
};

export { healthMetrics, systemMetrics };

// Periodic metrics collection
export const startMetricsCollection = async () => {
  if (typeof window !== 'undefined') {
    console.log('📊 Metrics collection skipped on client side');
    return;
  }
  
  await initializeHealthMetrics();
  
  // Collect system metrics every 30 seconds
  setInterval(() => {
    if (systemMetrics.memoryUsage) {
      const memUsage = process.memoryUsage();
      (systemMetrics.memoryUsage as any).set({ type: 'rss' }, memUsage.rss);
      (systemMetrics.memoryUsage as any).set({ type: 'heapUsed' }, memUsage.heapUsed);
      (systemMetrics.memoryUsage as any).set({ type: 'heapTotal' }, memUsage.heapTotal);
      (systemMetrics.memoryUsage as any).set({ type: 'external' }, memUsage.external);
    }
  }, 30000);

  console.log('📊 Metrics collection started');
};

// Export Prometheus register for /metrics endpoint
export const getPrometheusRegister = async () => {
  const client = await initializePrometheusClient();
  return client?.register || null;
};

// Initialize metrics when module is loaded (server-side only)
if (typeof window === 'undefined') {
  initializeMetrics();
}

// Initialize metrics (server-side only)
export function initializeMetrics() {
  if (typeof window !== 'undefined' || metricsInitialized) {
    return; // Skip on client side or if already initialized
  }

  try {
    // Collect default metrics (CPU, memory, etc.)
    promClient?.collectDefaultMetrics({
      register: promClient?.register,
      prefix: 'qas_',
    });

    metricsInitialized = true;
    console.log('Metrics initialized successfully');
  } catch (error) {
    console.error('Failed to initialize metrics:', error);
  }
}

// Helper functions for common metric operations
export const metricsHelpers = {
  // Notification metrics helpers
  recordNotificationCreated: (type: string, priority: string, userId: string) => {
    if (typeof window === 'undefined') {
      (notificationMetrics.notificationsCreated as any)?.inc({ type, priority, userId });
    }
  },

  recordNotificationRead: (type: string, userId: string) => {
    if (typeof window === 'undefined') {
      (notificationMetrics.notificationsRead as any)?.inc({ type, userId });
    }
  },

  recordNotificationSent: (channel: string, success: boolean) => {
    if (typeof window === 'undefined') {
      (notificationMetrics.notificationsSent as any)?.inc({ 
        channel, 
        success: success.toString() 
      });
    }
  },

  // Timing helpers
  startTimer: (metric: any) => {
    if (typeof window === 'undefined') {
      return metric?.startTimer?.() || (() => {});
    }
    return () => {}; // No-op on client side
  },

  recordQueryDuration: (operation: string, status: string, duration: number) => {
    if (typeof window === 'undefined') {
      (notificationMetrics.notificationQueryDuration as any)
        ?.labels?.(operation, status)
        ?.observe?.(duration);
    }
  },

  // Cache metrics helpers
  recordCacheHit: (cacheType: string, operation: string) => {
    if (typeof window === 'undefined') {
      (notificationMetrics.cacheHits as any)?.inc?.({ cache_type: cacheType, operation });
    }
  },

  recordCacheMiss: (cacheType: string, operation: string) => {
    if (typeof window === 'undefined') {
      (notificationMetrics.cacheMisses as any)?.inc?.({ cache_type: cacheType, operation });
    }
  },

  // WebSocket metrics helpers
  recordWebSocketConnection: (status: 'success' | 'failed') => {
    if (typeof window === 'undefined') {
      (notificationMetrics.connectionsTotal as any)?.inc?.({ status });
    }
  },

  recordWebSocketMessage: (direction: 'inbound' | 'outbound', type: string) => {
    if (typeof window === 'undefined') {
      (notificationMetrics.messagesTotal as any)?.inc?.({ direction, type });
    }
  },

  updateActiveConnections: (count: number) => {
    if (typeof window === 'undefined') {
      (notificationMetrics.activeWebSocketConnections as any)?.set?.(count);
    }
  },

  updateUnreadCount: (userId: string, count: number) => {
    if (typeof window === 'undefined') {
      (notificationMetrics.unreadNotificationsCount as any)?.set?.({ userId }, count);
    }
  },
}; 