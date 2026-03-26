// src/app/api/admin/health/services/route.ts
import { NextResponse } from 'next/server'
import { runHealthChecks } from '@/lib/health/health-checker'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const healthData = await runHealthChecks()
    
    // Update service_health table
    const supabase = await createSupabaseClient()
    
    for (const [serviceName, service] of Object.entries(healthData.services)) {
      await supabase
        .from('service_health')
        .upsert({
          service: serviceName,
          health_status: service.status,
          avg_response_time: service.latency,
          last_check: new Date().toISOString(),
        }, {
          onConflict: 'service',
        })
    }
    
    return NextResponse.json({
      services: healthData.services,
      timestamp: healthData.checkedAt,
    })
  } catch (error) {
    console.error('Service health API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service health' },
      { status: 500 }
    )
  }
}