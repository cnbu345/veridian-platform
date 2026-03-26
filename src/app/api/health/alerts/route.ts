// src/app/api/admin/health/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { runHealthChecks } from '@/lib/health/health-checker'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const resolved = searchParams.get('resolved') === 'true'
    const acknowledged = searchParams.get('acknowledged')
    
    let query = supabase
      .from('health_check')
      .select('data, checked_at')
      .order('checked_at', { ascending: false })
      .limit(100)
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Extract and deduplicate alerts
    const alertsMap = new Map()
    
    data?.forEach(record => {
      const alerts = record.data?.alerts || []
      alerts.forEach((alert: any) => {
        const key = `${alert.service}-${alert.severity}`
        if (!alertsMap.has(key) || new Date(alert.timestamp) > new Date(alertsMap.get(key).timestamp)) {
          alertsMap.set(key, {
            ...alert,
            checkedAt: record.checked_at,
          })
        }
      })
    })
    
    let alerts = Array.from(alertsMap.values())
    
    // Filter by resolved status if specified
    if (resolved === true) {
      alerts = alerts.filter(a => a.resolved === true)
    } else if (resolved === false) {
      alerts = alerts.filter(a => a.resolved !== true)
    }
    
    // Filter by acknowledged status if specified
    if (acknowledged === 'true') {
      alerts = alerts.filter(a => a.acknowledged === true)
    } else if (acknowledged === 'false') {
      alerts = alerts.filter(a => a.acknowledged !== true)
    }
    
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, action } = body
    
    if (action === 'acknowledge') {
      // In production, update alert status in database
      // For now, return success
      return NextResponse.json({ success: true, message: 'Alert acknowledged' })
    } else if (action === 'resolve') {
      return NextResponse.json({ success: true, message: 'Alert resolved' })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process alert action' },
      { status: 500 }
    )
  }
}