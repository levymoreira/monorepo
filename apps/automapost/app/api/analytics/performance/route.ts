import { NextRequest, NextResponse } from 'next/server';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  deviceInfo?: {
    isMobile: boolean;
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
}

interface PerformanceReport {
  sessionId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: PerformanceMetric[];
  errors?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const data: PerformanceReport = await request.json();
    
    // Validate the data
    if (!data.sessionId || !data.metrics || !Array.isArray(data.metrics)) {
      return NextResponse.json({ error: 'Invalid performance data' }, { status: 400 });
    }

    // In a real application, you would:
    // 1. Store metrics in a database (e.g., ClickHouse, BigQuery, or PostgreSQL)
    // 2. Send to analytics platforms (Google Analytics, DataDog, New Relic)
    // 3. Trigger alerts for poor performance
    // 4. Update performance dashboards

    // Example: Store in database (pseudo-code)
    // await db.performanceMetrics.createMany({
    //   data: data.metrics.map(metric => ({
    //     sessionId: data.sessionId,
    //     timestamp: new Date(data.timestamp),
    //     url: data.url,
    //     userAgent: data.userAgent,
    //     metricName: metric.name,
    //     value: metric.value,
    //     rating: metric.rating,
    //     isMobile: metric.deviceInfo?.isMobile || false,
    //     connectionType: metric.connection?.effectiveType || null,
    //   }))
    // });

    // Example: Send alerts for poor performance
    const poorMetrics = data.metrics.filter(m => m.rating === 'poor');
    if (poorMetrics.length > 0) {
      // In production, you might:
      // - Send to Slack/Discord webhook
      // - Create GitHub issue
      // - Send email notification
      // - Update monitoring dashboard
    }

    // Example: Track specific thresholds
    const lcp = data.metrics.find(m => m.name === 'LCP');
    const inp = data.metrics.find(m => m.name === 'INP');
    
    // Track specific threshold violations
    // if (lcp && lcp.value > 2500) {
    //   Send alert for slow LCP
    // }
    // if (inp && inp.value > 200) {
    //   Send alert for slow INP
    // }

    return NextResponse.json({ 
      success: true, 
      message: 'Performance metrics received',
      processed: data.metrics.length
    });

  } catch (error) {
    console.error('Error processing performance metrics:', error);
    return NextResponse.json({ 
      error: 'Failed to process performance metrics' 
    }, { status: 500 });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}