// src/types/monitoring.ts
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number // percentage
  lastIncident: string | null
  
  services: {
    api: ServiceStatus
    database: ServiceStatus
    auth: ServiceStatus
    stripe: ServiceStatus
    openai: ServiceStatus
    pdfGeneration: ServiceStatus
    email: ServiceStatus
  }
  
  performance: {
    responseTime: number // average ms
    reportGenerationTime: number // average minutes
    concurrentUsers: number
    errorRate: number // percentage
  }
  
  resources: {
    cpu: number // percentage
    memory: number // percentage
    storage: number // percentage
    bandwidth: number // mbps
  }
  
  alerts: Alert[]
}

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down'
  latency: number // ms
  lastChecked: string
  errorRate: number
}

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  service: string
  message: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
  assignedTo?: string
}