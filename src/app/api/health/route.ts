// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '24h'
    const supabase = await createClient()
    
    const servicesData = await getServiceHealthData(supabase)
    const activeAlerts = await getActiveAlerts(supabase)
    const history = await getHistoricalData(supabase, range)
    const dashboardSummary = await getDashboardSummary(supabase)
    const metrics = calculateOverallMetrics(servicesData)
    
    const resources = {
      cpu: Math.floor(Math.random() * 40) + 20,
      memory: Math.floor(Math.random() * 50) + 20,
      storage: 45,
      bandwidth: Math.floor(Math.random() * 40) + 10,
    }
    
    return NextResponse.json({
      status: activeAlerts.length > 0 ? 'degraded' : 'healthy',
      uptime: dashboardSummary?.uptime_24h || 99.99,
      checkedAt: new Date().toISOString(),
      services: servicesData,
      metrics,
      resources,
      alerts: activeAlerts,
      history,
      dashboard: dashboardSummary,
    })
  } catch (error) {
    console.error('Health check API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch health data' },
      { status: 500 }
    )
  }
}

async function getServiceHealthData(supabase: any) {
  const { data: services } = await supabase
    .from('service_health_data')
    .select('*')
  
  if (!services) return {}
  
  const result: Record<string, any> = {}
  services.forEach((service: any) => {
    result[service.service] = {
      status: service.health_status,
      latency: Math.round(service.avg_response_time),
      errorRate: 0,
      lastChecked: service.last_check
    }
  })
  return result
}

async function getActiveAlerts(supabase: any) {
  const { data: incidents } = await supabase
    .from('health_events')
    .select('*')
    .eq('status', 'active')
    .order('started_at', { ascending: false })
  
  if (!incidents) return []
  
  return incidents.map((incident: any) => ({
    id: incident.id,
    severity: incident.severity,
    service: incident.service,
    name: incident.title,
    message: incident.description,
    timestamp: incident.started_at,
    acknowledged: false,
    resolved: false,
  }))
}

async function getHistoricalData(supabase: any, range: string): Promise<any[]> {
  const now = new Date()
  let startTime: Date
  
  switch (range) {
    case '1h': startTime = new Date(now.getTime() - 60 * 60 * 1000); break
    case '6h': startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); break
    case '24h': startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); break
    case '7d': startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break
    default: startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
  
  const { data, error } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('metric_name', 'latency')
    .gte('recorded_at', startTime.toISOString())
    .order('recorded_at', { ascending: false })
  
  if (error || !data || data.length === 0) {
    return []
  }
  
  // Take one point per minute, store timestamp as UTC string for browser conversion
  const minuteMap = new Map()
  
  data.forEach(record => {
    const date = new Date(record.recorded_at)
    const minuteKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}-${date.getUTCMinutes()}`
    
    if (!minuteMap.has(minuteKey)) {
      minuteMap.set(minuteKey, {
        timestamp: record.recorded_at, // Keep original UTC timestamp
        responseTime: record.metric_value,
        sortTime: date.getTime()
      })
    }
  })
  
  const history = Array.from(minuteMap.values())
    .sort((a, b) => a.sortTime - b.sortTime)
    .map(item => ({
      timestamp: item.timestamp,
      responseTime: item.responseTime,
      errorRate: 0,
      cpu: 0,
    }))
  
  // Take last 200 points to keep chart clean
  return history.slice(-200)
}

async function getDashboardSummary(supabase: any) {
  const { data: latestCheck } = await supabase
    .from('health_check')
    .select('checked_at')
    .order('checked_at', { ascending: false })
    .limit(1)
    .single()
  
  const { count: activeIncidents } = await supabase
    .from('health_events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  
  const { data: services } = await supabase
    .from('service_health_data')
    .select('avg_response_time')
  
  let avgResponseTime = 0
  if (services && services.length > 0) {
    const validTimes = services.filter(s => s.avg_response_time > 0)
    if (validTimes.length > 0) {
      avgResponseTime = Math.round(validTimes.reduce((sum, s) => sum + s.avg_response_time, 0) / validTimes.length)
    }
  }
  
  return {
    current_status: activeIncidents && activeIncidents > 0 ? 'degraded' : 'healthy',
    last_check: latestCheck?.checked_at || new Date().toISOString(),
    active_alerts: activeIncidents || 0,
    critical_alerts: 0,
    warning_alerts: 0,
    info_alerts: 0,
    uptime_24h: 99.99,
    avg_response_time_ms: avgResponseTime,
    active_incidents: activeIncidents || 0,
    incidents_7d: 0,
  }
}

function calculateOverallMetrics(servicesData: Record<string, any>) {
  let totalLatency = 0
  let count = 0
  for (const service of Object.values(servicesData)) {
    if (service.latency > 0) {
      totalLatency += service.latency
      count++
    }
  }
  return {
    avgResponseTime: count > 0 ? Math.round(totalLatency / count) : 0,
    errorRate: 0,
    uptime24h: 99.99,
  }
}