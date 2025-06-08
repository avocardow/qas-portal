#!/usr/bin/env tsx

/**
 * WebSocket Server Startup Script
 * 
 * This script starts the tRPC WebSocket server for real-time subscriptions
 * during development. In production, this would be integrated into the
 * main application startup process.
 */

import { initializeWebSocketServer, getWebSocketStats } from '../src/server/websocket';

const DEFAULT_PORT = 3001;

async function startWebSocketServer() {
  try {
    const port = parseInt(process.env.WS_PORT || DEFAULT_PORT.toString(), 10);
    
    console.log('🚀 Starting tRPC WebSocket server...');
    console.log(`📍 Port: ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialize the WebSocket server
    const { wss, handler } = initializeWebSocketServer(port);
    
    if (!wss || !handler) {
      throw new Error('Failed to initialize WebSocket server');
    }
    
    // Log server statistics every 30 seconds
    const statsInterval = setInterval(() => {
      const stats = getWebSocketStats();
      console.log('📊 WebSocket Stats:', {
        clients: stats.clients,
        listeners: Object.keys(stats.listeners).length,
        timestamp: new Date().toISOString()
      });
    }, 30000);
    
    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🛑 Received shutdown signal, closing WebSocket server...');
      clearInterval(statsInterval);
      
      if (handler) {
        handler.broadcastReconnectNotification();
      }
      
      if (wss) {
        wss.close(() => {
          console.log('✅ WebSocket server closed gracefully');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };
    
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    
    console.log('✅ WebSocket server started successfully');
    console.log('💡 Press Ctrl+C to stop the server');
    
  } catch (error) {
    console.error('❌ Failed to start WebSocket server:', error);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  startWebSocketServer();
}

export { startWebSocketServer }; 