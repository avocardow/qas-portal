import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import type WebSocket from 'ws';
import { appRouter } from './api/root';
import { createTRPCContext } from './api/trpc';
import { notificationEventEmitter } from './services/eventEmitter';

let wss: WebSocketServer | null = null;
let wssHandler: ReturnType<typeof applyWSSHandler> | null = null;

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

    // Connection event logging
    wss.on('connection', (ws: WebSocket, request: { socket?: { remoteAddress?: string } }) => {
      const clientIP = request?.socket?.remoteAddress || 'unknown';
      console.log(`➕ WebSocket connection established from ${clientIP} (${wss!.clients.size} total)`);

      // Log connection close
      ws.once('close', (code: number, reason: Buffer) => {
        console.log(`➖ WebSocket connection closed: ${code} ${reason?.toString()} (${wss!.clients.size} remaining)`);
      });

      // Log connection errors
      ws.on('error', (error: Error) => {
        console.error('WebSocket client error:', error);
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
 * Get WebSocket server statistics
 */
export function getWebSocketStats() {
  if (!wss) {
    return { connected: false, clients: 0, listeners: {} };
  }

  return {
    connected: true,
    clients: wss.clients.size,
    listeners: notificationEventEmitter.getListenerCount(),
  };
} 