// src/app/api/cron/health-check/route.ts
import { NextResponse } from 'next/server'
import { runHealthChecks } from '@/lib/health/health-checker'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // Optional: Add secret verification for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    console.log('🔄 Running scheduled health checks...')
    const startTime = Date.now()
    
    const healthData = await runHealthChecks()
    const adminClient = await createAdminClient()
    
    // Store health check (use admin client)
    await adminClient.from('health_check').insert({
      checked_at: healthData.checkedAt,
    })
    
    // Store metrics
    for (const [serviceName, service] of Object.entries(healthData.services)) {
      await adminClient.from('health_metrics').insert({
        service: serviceName,
        metric_name: 'latency',
        metric_value: (service as any).latency,
        recorded_at: healthData.checkedAt,
        metadata: { 
          status: (service as any).status, 
          errorRate: (service as any).errorRate 
        }
      })
    }
    
    // Store overall metrics
    await adminClient.from('health_metrics').insert({
      service: 'system',
      metric_name: 'overall_status',
      metric_value: healthData.status === 'healthy' ? 1 : healthData.status === 'degraded' ? 0.5 : 0,
      recorded_at: healthData.checkedAt,
      metadata: { 
        status: healthData.status,
        avgResponseTime: healthData.metrics.avgResponseTime,
        errorRate: healthData.metrics.errorRate,
        uptime24h: healthData.metrics.uptime24h
      }
    })
    
    // Update service_health_data
    for (const [serviceName, service] of Object.entries(healthData.services)) {
      await adminClient.from('service_health_data').upsert({
        service: serviceName,
        health_status: (service as any).status,
        avg_response_time: (service as any).latency,
        last_check: healthData.checkedAt,
      }, { onConflict: 'service' })
    }
    
    const duration = Date.now() - startTime
    console.log(`✅ Health checks completed in ${duration}ms`)
    
    return NextResponse.json({ 
      success: true, 
      duration: `${duration}ms`,
      status: healthData.status,
      timestamp: healthData.checkedAt 
    })
  } catch (error) {
    console.error('❌ Cron health check error:', error)
    return NextResponse.json(
      { error: 'Health check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}