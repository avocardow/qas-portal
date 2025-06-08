import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import type WebSocket from 'ws';
import { appRouter } from './api/root';
import { createTRPCContext } from './api/trpc';
import { notificationEventEmitter } from './services/eventEmitter';
import { MetricsCollector } from '@/lib/metrics';

// Configuration constants
const MAX_CONNECTIONS = parseInt(process.env.WS_MAX_CONNECTIONS || '1000');
const HEARTBEAT_INTERVAL = parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000');
// const CONNECTION_TIMEOUT = parseInt(process.env.WS_CONNECTION_TIMEOUT || '5000'); // Reserved for future use

// Server instances
let wss: WebSocketServer | null = null;
let wssHandler: ReturnType<typeof applyWSSHandler> | null = null;

// Enhanced connection tracking
interface ConnectionInfo {
  id: string;
  userId?: string;
  connectedAt: Date;
  lastActivity: Date;
  messageCount: number;
  ip: string;
}

const connections = new Map<WebSocket, ConnectionInfo>();
const userConnections = new Map<string, Set<WebSocket>>();

// Performance statistics
let totalConnectionsServed = 0;
let peakConnections = 0;
let rejectedConnections = 0;

// Helper functions
const generateConnectionId = (): string => {
  return `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const cleanupConnection = (ws: WebSocket) => {
  const connInfo = connections.get(ws);
  if (connInfo) {
    // Remove from user connections tracking
    if (connInfo.userId) {
      const userConns = userConnections.get(connInfo.userId);
      if (userConns) {
        userConns.delete(ws);
        if (userConns.size === 0) {
          userConnections.delete(connInfo.userId);
        }
      }
    }
    
    connections.delete(ws);
    
    // Update metrics
    MetricsCollector.updateWebSocketConnections(connections.size);
  }
};

/**
 * Track user-specific connections for multi-device support
 */
export const trackUserConnection = (ws: WebSocket, userId: string) => {
  const connInfo = connections.get(ws);
  if (connInfo) {
    connInfo.userId = userId;
    
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId)!.add(ws);
  }
};

/**
 * Get all WebSocket connections for a specific user
 */
export const getUserConnections = (userId: string): WebSocket[] => {
  const userConns = userConnections.get(userId);
  return userConns ? Array.from(userConns) : [];
};

/**
 * Initialize WebSocket Server for tRPC real-time subscriptions
 */
export function initializeWebSocketServer(port: number = 3001) {
  if (wss) {
    console.log('WebSocket server already initialized');
    return { wss, handler: wssHandler };
  }

  try {
    // Create WebSocket server
    wss = new WebSocketServer({
      port,
      clientTracking: true,
    });

    // Apply tRPC WebSocket handler
    wssHandler = applyWSSHandler({
      wss,
      router: appRouter,
      createContext: () => createTRPCContext({ headers: new Headers() }),
      // Enable heartbeat to keep connections alive
      keepAlive: {
        enabled: true,
        // Send ping every 30 seconds
        pingMs: 30000,
        // Close connection if no pong received within 5 seconds
        pongWaitMs: 5000,
      },
    });

    // Enhanced connection event handling with pooling
    wss.on('connection', (ws: WebSocket, request: { socket?: { remoteAddress?: string } }) => {
      const clientIP = request?.socket?.remoteAddress || 'unknown';
      
      // Connection pooling: reject if at max capacity
      if (connections.size >= MAX_CONNECTIONS) {
        console.warn(`⚠️ Max connections reached (${MAX_CONNECTIONS}), rejecting connection from ${clientIP}`);
        rejectedConnections++;
        ws.close(1013, 'Server overloaded');
        return;
      }

      // Create connection info
      const connectionId = generateConnectionId();
      const now = new Date();
      const connectionInfo: ConnectionInfo = {
        id: connectionId,
        connectedAt: now,
        lastActivity: now,
        messageCount: 0,
        ip: clientIP
      };

      connections.set(ws, connectionInfo);
      totalConnectionsServed++;

      // Track peak connections
      if (connections.size > peakConnections) {
        peakConnections = connections.size;
      }

      // Update metrics
      MetricsCollector.updateWebSocketConnections(connections.size);

      console.log(`➕ WebSocket connected [${connectionId}] from ${clientIP} (${connections.size}/${MAX_CONNECTIONS})`);

      // Track message activity
      ws.on('message', () => {
        const connInfo = connections.get(ws);
        if (connInfo) {
          connInfo.messageCount++;
          connInfo.lastActivity = new Date();
          MetricsCollector.trackWebSocketMessage('inbound', 'subscription');
        }
      });

      // Enhanced connection close logging
      ws.once('close', (code: number, reason: Buffer) => {
        console.log(`➖ WebSocket closed [${connectionId}]: ${code} ${reason?.toString()} (${connections.size - 1} remaining)`);
        cleanupConnection(ws);
      });

      // Enhanced error handling
      ws.on('error', (error: Error) => {
        console.error(`❌ WebSocket error [${connectionId}]:`, error);
        cleanupConnection(ws);
      });
    });

    // Server-level error handling
    wss.on('error', (error: Error) => {
      console.error('WebSocket server error:', error);
    });

    // Periodic cleanup of stale event listeners
    setInterval(() => {
      notificationEventEmitter.cleanup();
    }, 300000); // Every 5 minutes

    console.log(`✅ WebSocket Server listening on ws://localhost:${port}`);

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('Shutting down WebSocket server...');
      
      if (wssHandler) {
        // Notify clients to reconnect (for planned restarts)
        wssHandler.broadcastReconnectNotification();
      }
      
      if (wss) {
        wss.close(() => {
          console.log('WebSocket server closed');
        });
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return { wss, handler: wssHandler };
  } catch (error) {
    console.error('Failed to initialize WebSocket server:', error);
    throw error;
  }
}

/**
 * Get current WebSocket server instance
 */
export function getWebSocketServer() {
  return { wss, handler: wssHandler };
}

/**
 * Close WebSocket server (for testing or manual shutdown)
 */
export function closeWebSocketServer() {
  if (wssHandler) {
    wssHandler.broadcastReconnectNotification();
  }
  
  if (wss) {
    wss.close();
    wss = null;
    wssHandler = null;
    console.log('WebSocket server closed manually');
  }
}

/**
 * Get comprehensive WebSocket server statistics
 */
export function getWebSocketStats() {
  if (!wss) {
    return { 
      connected: false, 
      clients: 0, 
      listeners: {},
      performance: {
        totalConnectionsServed: 0,
        peakConnections: 0,
        rejectedConnections: 0,
        utilizationPercentage: 0
      }
    };
  }

  const activeConnections = connections.size;
  const uniqueUsers = userConnections.size;
  const now = Date.now();
  
  // Calculate connection health
  const healthyConnections = Array.from(connections.values()).filter(conn => {
    const timeSinceActivity = now - conn.lastActivity.getTime();
    return timeSinceActivity < HEARTBEAT_INTERVAL * 2; // Within 2 heartbeat intervals
  }).length;

  // Get connection age distribution
  const connectionAges = Array.from(connections.values()).map(conn => 
    Math.floor((now - conn.connectedAt.getTime()) / 1000)
  );
  
  const avgConnectionAge = connectionAges.length > 0 
    ? Math.floor(connectionAges.reduce((a, b) => a + b, 0) / connectionAges.length)
    : 0;

  return {
    connected: true,
    clients: activeConnections,
    healthyConnections,
    unhealthyConnections: activeConnections - healthyConnections,
    uniqueUsers,
    averageConnectionAge: avgConnectionAge,
    listeners: notificationEventEmitter.getListenerCount(),
    performance: {
      totalConnectionsServed,
      peakConnections,
      rejectedConnections,
      maxConnections: MAX_CONNECTIONS,
      utilizationPercentage: Math.round((activeConnections / MAX_CONNECTIONS) * 100),
      connectionSuccessRate: totalConnectionsServed > 0 
        ? Math.round(((totalConnectionsServed - rejectedConnections) / totalConnectionsServed) * 100)
        : 100
    }
  };
} 