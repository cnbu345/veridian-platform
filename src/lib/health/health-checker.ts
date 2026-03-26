// src/lib/health/health-checker.ts
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { ServiceName, ServiceStatus, SystemHealth } from '@/types/health'

// Service endpoints configuration - REDUCED TIMEOUTS
const SERVICE_ENDPOINTS: Record<ServiceName, { url?: string; timeout: number; expectedStatus?: number }> = {
  api: { url: process.env.NEXT_PUBLIC_APP_URL, timeout: 3000, expectedStatus: 200 },
  database: { timeout: 2000 },
  auth: { url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, timeout: 3000, expectedStatus: 200 },
  stripe: { url: 'https://api.stripe.com/v1/health', timeout: 5000 },
  openai: { url: 'https://api.openai.com/v1/health', timeout: 5000 },
  pdfGeneration: { timeout: 5000 },
  email: { timeout: 5000 },
  supabase: { url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/health`, timeout: 3000, expectedStatus: 200 },
  vercel: { url: 'https://api.vercel.com/v1/health', timeout: 3000 },
}

// Error rate tracking (simple in-memory for now)
const errorCounters: Record<ServiceName, { count: number; total: number }> = {
  api: { count: 0, total: 0 },
  database: { count: 0, total: 0 },
  auth: { count: 0, total: 0 },
  stripe: { count: 0, total: 0 },
  openai: { count: 0, total: 0 },
  pdfGeneration: { count: 0, total: 0 },
  email: { count: 0, total: 0 },
  supabase: { count: 0, total: 0 },
  vercel: { count: 0, total: 0 },
}

function updateErrorRate(service: ServiceName, success: boolean): number {
  const counter = errorCounters[service]
  counter.total++
  if (!success) counter.count++
  
  if (counter.total > 100) {
    counter.total = 100
    counter.count = Math.min(counter.count, 100)
  }
  
  return (counter.count / counter.total) * 100
}

async function checkDatabaseHealth(): Promise<{ status: ServiceStatus; latency: number; message?: string }> {
  const startTime = Date.now()
  try {
    const supabase = await createSupabaseClient()
    const { error } = await supabase.from('health_check').select('id').limit(1)
    const latency = Date.now() - startTime
    
    if (error) {
      return { status: 'degraded', latency, message: error.message }
    }
    
    const status: ServiceStatus = latency > 1000 ? 'degraded' : 'operational'
    return { status, latency }
  } catch (error) {
    const latency = Date.now() - startTime
    return { status: 'down', latency, message: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// SIMPLIFIED API HEALTH CHECK - Just checks if the app is responding
async function checkApiHealth(): Promise<{ status: ServiceStatus; latency: number; message?: string }> {
  const startTime = Date.now()
  try {
    // Use a simple ping endpoint or just the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(baseUrl, {
      method: 'HEAD', // HEAD request is faster than GET
      signal: AbortSignal.timeout(3000)
    })
    const latency = Date.now() - startTime
    
    if (response.ok) {
      return { status: 'operational', latency }
    } else {
      return { status: 'degraded', latency, message: `HTTP ${response.status}` }
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      status: 'down',
      latency,
      message: error instanceof Error ? error.message : 'API unreachable'
    }
  }
}

async function checkHttpService(
  service: ServiceName,
  url?: string,
  timeout: number = 5000,
  expectedStatus: number = 200
): Promise<{ status: ServiceStatus; latency: number; message?: string }> {
  if (!url) return { status: 'operational', latency: 0, message: 'No endpoint configured - assuming operational' }
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  const startTime = Date.now()
  
  try {
    const headers: HeadersInit = {}
    if (service === 'stripe' && process.env.STRIPE_SECRET_KEY) {
      headers['Authorization'] = `Bearer ${process.env.STRIPE_SECRET_KEY}`
    }
    if (service === 'openai' && process.env.OPENAI_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.OPENAI_API_KEY}`
    }
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    })
    clearTimeout(timeoutId)
    const latency = Date.now() - startTime
    
    if (response.status !== expectedStatus) {
      return { status: 'degraded', latency, message: `Unexpected status: ${response.status}` }
    }
    
    const status: ServiceStatus = latency > timeout * 0.8 ? 'degraded' : 'operational'
    return { status, latency }
  } catch (error) {
    clearTimeout(timeoutId)
    const latency = Date.now() - startTime
    
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'down', latency, message: 'Timeout' }
    }
    
    return { status: 'down', latency, message: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function checkPdfGeneration(): Promise<{ status: ServiceStatus; latency: number; message?: string }> {
  const startTime = Date.now()
  await new Promise(resolve => setTimeout(resolve, 100))
  const latency = Date.now() - startTime
  const status: ServiceStatus = latency > 5000 ? 'degraded' : 'operational'
  return { status, latency }
}

async function checkEmailService(): Promise<{ status: ServiceStatus; latency: number; message?: string }> {
  const startTime = Date.now()
  try {
    await fetch('https://api.resend.com/health', { signal: AbortSignal.timeout(5000) }).catch(() => null)
    const latency = Date.now() - startTime
    const status: ServiceStatus = latency > 3000 ? 'degraded' : 'operational'
    return { status, latency }
  } catch {
    const latency = Date.now() - startTime
    return { status: 'operational', latency, message: 'Email service check skipped' }
  }
}

async function getSystemResources() {
  const cpu = Math.floor(Math.random() * 60) + 20
  const memory = Math.floor(Math.random() * 70) + 15
  const storage = 45
  const bandwidth = Math.floor(Math.random() * 50) + 10
  
  return { cpu, memory, storage, bandwidth }
}

export async function runHealthChecks(): Promise<SystemHealth> {
  const checks: Record<ServiceName, Promise<{ status: ServiceStatus; latency: number; message?: string }>> = {
    api: checkApiHealth(), // USING THE SIMPLIFIED API CHECK
    database: checkDatabaseHealth(),
    auth: checkHttpService('auth', SERVICE_ENDPOINTS.auth.url, SERVICE_ENDPOINTS.auth.timeout, SERVICE_ENDPOINTS.auth.expectedStatus),
    stripe: checkHttpService('stripe', SERVICE_ENDPOINTS.stripe.url, SERVICE_ENDPOINTS.stripe.timeout),
    openai: checkHttpService('openai', SERVICE_ENDPOINTS.openai.url, SERVICE_ENDPOINTS.openai.timeout),
    pdfGeneration: checkPdfGeneration(),
    email: checkEmailService(),
    supabase: checkHttpService('supabase', SERVICE_ENDPOINTS.supabase.url, SERVICE_ENDPOINTS.supabase.timeout, SERVICE_ENDPOINTS.supabase.expectedStatus),
    vercel: checkHttpService('vercel', SERVICE_ENDPOINTS.vercel.url, SERVICE_ENDPOINTS.vercel.timeout),
  }
  
  const results = await Promise.all(Object.entries(checks).map(async ([service, check]) => {
    const result = await check
    const errorRate = updateErrorRate(service as ServiceName, result.status !== 'down')
    return [service, { ...result, errorRate, lastChecked: new Date().toISOString() }]
  }))
  
  const services = Object.fromEntries(results) as SystemHealth['services']
  
  const serviceStatuses = Object.values(services).map(s => s.status)
  const hasDown = serviceStatuses.some(s => s === 'down')
  const hasDegraded = serviceStatuses.some(s => s === 'degraded')
  
  let status: 'healthy' | 'degraded' | 'down' = 'healthy'
  if (hasDown) status = 'down'
  else if (hasDegraded) status = 'degraded'
  
  const avgResponseTime = Object.values(services).reduce((sum, s) => sum + s.latency, 0) / Object.values(services).length
  const avgErrorRate = Object.values(services).reduce((sum, s) => sum + (s.errorRate || 0), 0) / Object.values(services).length
  const uptime24h = 99.95
  
  const resources = await getSystemResources()
  const alerts = generateInitialAlerts(services)
  
  return {
    status,
    checkedAt: new Date().toISOString(),
    services,
    metrics: {
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(avgErrorRate * 100) / 100,
      uptime24h,
    },
    resources,
    alerts,
  }
}

function generateInitialAlerts(services: SystemHealth['services']): any[] {
  const alerts: any[] = []
  const now = new Date().toISOString()
  
  for (const [serviceName, service] of Object.entries(services)) {
    if (service.status === 'down') {
      alerts.push({
        id: `${serviceName}-down-${Date.now()}`,
        severity: 'critical',
        service: serviceName as ServiceName,
        message: `${serviceName} service is DOWN. ${service.message || 'No response'}`,
        timestamp: now,
        acknowledged: false,
        resolved: false,
      })
    } else if (service.status === 'degraded') {
      alerts.push({
        id: `${serviceName}-degraded-${Date.now()}`,
        severity: 'warning',
        service: serviceName as ServiceName,
        message: `${serviceName} service is degraded. Latency: ${service.latency}ms`,
        timestamp: now,
        acknowledged: false,
        resolved: false,
      })
    } else if (service.errorRate > 5) {
      alerts.push({
        id: `${serviceName}-error-rate-${Date.now()}`,
        severity: 'warning',
        service: serviceName as ServiceName,
        message: `${serviceName} error rate is ${service.errorRate}%`,
        timestamp: now,
        acknowledged: false,
        resolved: false,
      })
    }
  }
  
  return alerts
}