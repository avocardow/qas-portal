import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { NotificationCache } from '@/lib/redis';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    redis: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    websocket: {
      status: 'up' | 'down';
      activeConnections?: number;
    };
  };
  uptime: number;
}

/**
 * GET /api/health
 * Comprehensive health check endpoint
 */
export async function GET() {
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'down' },
      redis: { status: 'down' },
      websocket: { status: 'up' }
    },
    uptime: process.uptime()
  };

  // Check database health
  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStart;
    
    healthStatus.services.database = {
      status: 'up',
      responseTime: dbResponseTime
    };
  } catch (error) {
    healthStatus.services.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
    healthStatus.status = 'degraded';
  }

  // Check Redis health
  try {
    const redisStart = Date.now();
    // Test Redis connection with a simple operation
    const testKey = 'health_check_test';
    const testValue = Date.now().toString();
    await NotificationCache.set(testKey, testValue, 60);
    const retrievedValue = await NotificationCache.get<string>(testKey);
    await NotificationCache.delete(testKey);
    
    const redisResponseTime = Date.now() - redisStart;
    const redisHealthy = retrievedValue === testValue;
    
    healthStatus.services.redis = {
      status: redisHealthy ? 'up' : 'down',
      responseTime: redisResponseTime
    };
    
    if (!redisHealthy) {
      healthStatus.status = 'degraded';
    }
  } catch (error) {
    healthStatus.services.redis = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown Redis error'
    };
    healthStatus.status = 'degraded';
  }

  // Check WebSocket health (basic check - server is running)
  try {
    // Import WebSocket stats if available
    const websocketModule = await import('@/server/websocket');
    
    // Check if getConnectionStats exists
    if ('getConnectionStats' in websocketModule && typeof websocketModule.getConnectionStats === 'function') {
      const stats = websocketModule.getConnectionStats();
      
      healthStatus.services.websocket = {
        status: 'up',
        activeConnections: stats.totalConnections
      };
    } else {
      // If function doesn't exist, just mark as up (basic health)
      healthStatus.services.websocket = {
        status: 'up',
        activeConnections: 0
      };
    }
  } catch {
    healthStatus.services.websocket = {
      status: 'down'
    };
  }

  // Determine overall status
  const downServices = Object.values(healthStatus.services).filter(
    service => service.status === 'down'
  ).length;

  if (downServices >= 2) {
    healthStatus.status = 'unhealthy';
  } else if (downServices === 1) {
    healthStatus.status = 'degraded';
  }

  // Return appropriate HTTP status code
  const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                    healthStatus.status === 'degraded' ? 200 : 503;

  return NextResponse.json(healthStatus, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

/**
 * HEAD /api/health
 * Lightweight health check (just returns status code)
 */
export async function HEAD() {
  try {
    // Quick database check
    await db.$queryRaw`SELECT 1`;
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

// Disable caching for health endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0; 