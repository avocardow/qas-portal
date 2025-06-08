import { NextResponse } from 'next/server';
import { getPrometheusRegister } from '@/lib/metrics';

/**
 * GET /api/metrics
 * Prometheus metrics endpoint for monitoring
 */
export async function GET() {
  try {
    // Get the Prometheus register
    const register = await getPrometheusRegister();
    
    if (!register) {
      return NextResponse.json(
        { error: 'Metrics not available' },
        { status: 503 }
      );
    }

    // Get metrics in Prometheus format
    const metrics = await register.metrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}

/**
 * HEAD /api/metrics
 * Health check for metrics endpoint
 */
export async function HEAD() {
  const register = await getPrometheusRegister();
  return new NextResponse(null, {
    status: register ? 200 : 503,
    headers: {
      'Content-Type': register?.contentType || 'text/plain'
    }
  });
}

// Disable caching for metrics endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0; 