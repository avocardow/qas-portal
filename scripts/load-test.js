import http from 'k6/http';
import ws from 'k6/ws';
import { check, group, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics
const wsConnectionErrors = new Rate('ws_connection_errors');
const notificationResponseTime = new Trend('notification_response_time');
const wsMessagesSent = new Counter('ws_messages_sent');
const wsMessagesReceived = new Counter('ws_messages_received');

// Configuration options
export const options = {
  scenarios: {
    // Scenario 1: API Load Testing
    api_load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 10 },   // Ramp up to 10 users
        { duration: '1m', target: 50 },    // Ramp up to 50 users
        { duration: '2m', target: 100 },   // Ramp up to 100 users
        { duration: '1m', target: 100 },   // Stay at 100 users
        { duration: '30s', target: 0 },    // Ramp down
      ],
      gracefulRampDown: '10s',
    },
    
    // Scenario 2: WebSocket Connections
    websocket_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '3m',
      gracefulStop: '10s',
    },
    
    // Scenario 3: Spike Testing
    spike_test: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { duration: '1m', target: 10 },    // Normal load
        { duration: '10s', target: 100 },  // Spike!
        { duration: '1m', target: 10 },    // Back to normal
      ],
    },
  },
  
  thresholds: {
    // API thresholds
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
    
    // WebSocket thresholds
    ws_connection_errors: ['rate<0.05'], // WebSocket connection error rate below 5%
    
    // Custom thresholds
    notification_response_time: ['p(95)<100'], // Notification queries should be fast
    ws_messages_sent: ['count>100'],           // Should send at least 100 messages
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:3001'; // WebSocket server

// Test data
const testUsers = [
  { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Test User 1' },
  { id: '123e4567-e89b-12d3-a456-426614174001', name: 'Test User 2' },
  { id: '123e4567-e89b-12d3-a456-426614174002', name: 'Test User 3' },
];

// Setup function - runs once before all scenarios
export function setup() {
  console.log('Starting QAS Portal Notification System Load Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`WebSocket URL: ${WS_URL}`);
  
  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`);
  const healthOk = check(healthResponse, {
    'Health check passed': (r) => r.status === 200,
  });
  
  if (!healthOk) {
    console.error('Health check failed, aborting test');
    return null;
  }
  
  return { baseUrl: BASE_URL, wsUrl: WS_URL };
}

// Main test function for API load testing
export default function(data) {
  if (!data) {
    console.error('Setup failed, skipping test');
    return;
  }
  
  const { baseUrl } = data;
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  group('Notification API Tests', () => {
    // Test 1: Get notification count
    group('Get Notification Count', () => {
      const start = new Date();
      const response = http.get(`${baseUrl}/api/trpc/notification.getCount`);
      const duration = new Date() - start;
      
      notificationResponseTime.add(duration);
      
      check(response, {
        'Get count status is 200': (r) => r.status === 200,
        'Get count response time < 100ms': () => duration < 100,
      });
    });
    
    // Test 2: Get unread notifications
    group('Get Unread Notifications', () => {
      const response = http.get(`${baseUrl}/api/trpc/notification.getUnread?batch=1&input={"0":{"json":{"limit":20,"offset":0}}}`);
      
      check(response, {
        'Get unread status is 200': (r) => r.status === 200,
        'Get unread has data': (r) => {
          try {
            const body = JSON.parse(r.body);
            return Array.isArray(body[0]?.result?.data);
          } catch {
            return false;
          }
        },
      });
    });
    
    // Test 3: Health endpoint
    group('Health Check', () => {
      const response = http.get(`${baseUrl}/api/health`);
      
      check(response, {
        'Health status is 200': (r) => r.status === 200,
        'Health response has status': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.status !== undefined;
          } catch {
            return false;
          }
        },
      });
    });
    
    // Test 4: Metrics endpoint
    group('Metrics Endpoint', () => {
      const response = http.get(`${baseUrl}/api/metrics`);
      
      check(response, {
        'Metrics status is 200': (r) => r.status === 200,
        'Metrics content type is correct': (r) => 
          r.headers['Content-Type']?.includes('text/plain'),
      });
    });
  });
  
  sleep(1); // Wait 1 second between iterations
}

// WebSocket test function
export function websocket_load(data) {
  if (!data) {
    console.error('Setup failed, skipping WebSocket test');
    return;
  }
  
  const { wsUrl } = data;
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  group('WebSocket Connection Test', () => {
    const url = `${wsUrl}?userId=${user.id}`;
    
    const res = ws.connect(url, {}, function(socket) {
      socket.on('open', () => {
        console.log(`WebSocket connected for user ${user.name}`);
        
        // Subscribe to notifications
        const subscribeMessage = {
          type: 'subscribe',
          userId: user.id,
          channels: ['notifications', 'readStatus']
        };
        
        socket.send(JSON.stringify(subscribeMessage));
        wsMessagesSent.add(1);
      });
      
      socket.on('message', (data) => {
        wsMessagesReceived.add(1);
        
        try {
          const message = JSON.parse(data);
          check(message, {
            'WebSocket message has type': (msg) => msg.type !== undefined,
            'WebSocket message has data': (msg) => msg.data !== undefined,
          });
        } catch (e) {
          console.warn('Invalid JSON received from WebSocket:', data);
        }
      });
      
      socket.on('error', (e) => {
        console.error('WebSocket error:', e);
        wsConnectionErrors.add(1);
      });
      
      socket.on('close', () => {
        console.log('WebSocket connection closed');
      });
      
      // Send periodic heartbeat messages
      const heartbeatInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
          wsMessagesSent.add(1);
        }
      }, 10000); // Every 10 seconds
      
      // Keep connection alive for test duration
      sleep(30);
      
      clearInterval(heartbeatInterval);
      socket.close();
    });
    
    check(res, {
      'WebSocket connection successful': (r) => r && r.status === 101,
    });
  });
}

// Spike test function for sudden load increases
export function spike_test(data) {
  if (!data) {
    console.error('Setup failed, skipping spike test');
    return;
  }
  
  const { baseUrl } = data;
  
  group('Spike Test - Multiple Rapid Requests', () => {
    // Make multiple rapid requests to simulate spike
    const responses = http.batch([
      ['GET', `${baseUrl}/api/trpc/notification.getCount`],
      ['GET', `${baseUrl}/api/trpc/notification.getUnread?batch=1&input={"0":{"json":{"limit":10,"offset":0}}}`],
      ['GET', `${baseUrl}/api/health`],
      ['GET', `${baseUrl}/api/metrics`],
    ]);
    
    responses.forEach((response, index) => {
      check(response, {
        [`Spike request ${index + 1} successful`]: (r) => r.status < 400,
        [`Spike request ${index + 1} fast`]: (r) => r.timings.duration < 1000,
      });
    });
  });
}

// Teardown function - runs once after all scenarios
export function teardown(data) {
  console.log('Load test completed');
  console.log('Check the results for performance metrics and thresholds');
} 