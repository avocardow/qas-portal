import Redis from 'ioredis';

// Redis client singleton
let redis: Redis | null = null;

const getRedisClient = (): Redis | null => {
  // Skip Redis in test environment
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  if (!redis) {
    try {
      const redisUrl = process.env.REDIS_URL;
      
      if (!redisUrl) {
        console.warn('REDIS_URL not configured, caching disabled');
        return null;
      }

      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        // Connection pooling
        family: 4,
        keepAlive: 30000,
        // Graceful error handling
        reconnectOnError: (err) => {
          const targetErrors = ['READONLY', 'ECONNRESET', 'ENOTFOUND'];
          return targetErrors.some(targetError => err.message.includes(targetError));
        }
      });

      // Handle connection events
      redis.on('connect', () => {
        console.log('Redis connected successfully');
      });

      redis.on('error', (err) => {
        console.warn('Redis connection error:', err.message);
      });

      redis.on('close', () => {
        console.log('Redis connection closed');
      });

    } catch (error) {
      console.warn('Failed to initialize Redis client:', error);
      return null;
    }
  }

  return redis;
};

// Cache key generators
export const getCacheKey = {
  userNotifications: (userId: string, filters?: string) => 
    `notifications:user:${userId}${filters ? `:${filters}` : ''}`,
  userUnreadCount: (userId: string) => 
    `notifications:unread:${userId}`,
  userTotalCount: (userId: string, filters?: string) => 
    `notifications:total:${userId}${filters ? `:${filters}` : ''}`
};

// Cache utility functions
export class NotificationCache {
  private static redis = getRedisClient();
  private static readonly TTL = 300; // 5 minutes cache TTL

  static async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Redis get error:', error);
      return null;
    }
  }

  static async set(key: string, value: unknown, ttl: number = this.TTL): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.warn('Redis set error:', error);
    }
  }

  static async delete(key: string): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      console.warn('Redis delete error:', error);
    }
  }

  static async deletePattern(pattern: string): Promise<void> {
    if (!this.redis) return;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.warn('Redis delete pattern error:', error);
    }
  }

  // Notification-specific cache methods
  static async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `notifications:user:${userId}*`,
      `notifications:unread:${userId}`,
      `notifications:total:${userId}*`
    ];

    await Promise.all(patterns.map(pattern => this.deletePattern(pattern)));
  }

  static async cacheNotificationCount(userId: string, count: number, type: 'unread' | 'total', filters?: string): Promise<void> {
    const key = type === 'unread' 
      ? getCacheKey.userUnreadCount(userId)
      : getCacheKey.userTotalCount(userId, filters);
    
    await this.set(key, count, this.TTL);
  }

  static async getCachedNotificationCount(userId: string, type: 'unread' | 'total', filters?: string): Promise<number | null> {
    const key = type === 'unread' 
      ? getCacheKey.userUnreadCount(userId)
      : getCacheKey.userTotalCount(userId, filters);
    
    return await this.get<number>(key);
  }
}

export default getRedisClient; 