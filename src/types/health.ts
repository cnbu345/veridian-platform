// src/types/health.ts
export type ServiceName = 
  | 'api'
  | 'database'
  | 'auth'
  | 'stripe'
  | 'openai'
  | 'pdfGeneration'
  | 'email'
  | 'supabase'
  | 'vercel'

export type ServiceStatus = 'operational' | 'degraded' | 'down'

export interface ServiceHealthCheck {
  service: ServiceName
  status: ServiceStatus
  latency: number
  errorRate: number
  lastChecked: string
  message?: string
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  checkedAt: string
  services: Record<ServiceName, {
    status: ServiceStatus
    latency: number
    errorRate: number
    lastChecked: string
    message?: string
  }>
  metrics: {
    avgResponseTime: number
    errorRate: number
    uptime24h: number
  }
  resources: {
    cpu: number
    memory: number
    storage: number
    bandwidth: number
  }
  alerts: HealthAlert[]
}

export interface HealthAlert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  service: ServiceName
  message: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
  resolvedAt?: string
  assignedTo?: string
  notification_channels?: string[]
  name?: string
  metric_value?: number
  threshold?: number
  operator?: string
}

export interface AlertRule {
  id: string
  name: string
  service: ServiceName
  metric: string
  threshold: number
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq'
  severity: 'critical' | 'warning' | 'info'
  cooldownMinutes: number
  enabled: boolean
  notification_channels: string[] | string
  created_at?: string
  updated_at?: string
}

export interface NotificationChannel {
  id: string
  type: 'email' | 'slack' | 'webhook' | 'sms'
  name: string
  config: Record<string, any>
  enabled: boolean
}

export interface HealthDashboardData {
  currentStatus: 'healthy' | 'degraded' | 'down'
  lastCheck: string
  activeAlerts: number
  criticalAlerts: number
  warningAlerts: number
  infoAlerts: number
  uptime24h: number
  avgResponseTimeMs: number
  activeIncidents: number
  incidents7d: number
}