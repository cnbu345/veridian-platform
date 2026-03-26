// src/app/admin/health/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Server,
  Shield,
  Zap,
  Mail,
  FileText,
  CreditCard,
  Brain,
  Users,
  Bell,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Wifi,
  HardDrive,
  Cpu,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, circle } from 'recharts'
import { createClient } from '@/lib/supabase/client'

// Types
type ServiceStatus = 'operational' | 'degraded' | 'down'
type SystemStatus = 'healthy' | 'degraded' | 'down'

interface ServiceHealth {
  status: ServiceStatus
  latency: number
  errorRate: number
  lastChecked: string
  message?: string
}

interface SystemHealthData {
  status: SystemStatus
  uptime: number
  checkedAt: string
  services: Record<string, ServiceHealth>
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
  alerts: Array<{
    id: string
    severity: 'critical' | 'warning' | 'info'
    service: string
    name: string
    message: string
    timestamp: string
    acknowledged: boolean
    resolved: boolean
    notification_channels?: string[]
  }>
  history: Array<{
    timestamp: string
    responseTime: number
    errorRate: number
    cpu: number
  }>
  dashboard: {
    current_status: string
    last_check: string
    active_alerts: number
    critical_alerts: number
    warning_alerts: number
    info_alerts: number
    uptime_24h: number
    avg_response_time_ms: number
    active_incidents: number
    incidents_7d: number
  }
}

// Constants
const SERVICE_ICONS: Record<string, any> = {
  api: Server,
  database: Database,
  auth: Shield,
  stripe: CreditCard,
  openai: Brain,
  pdfGeneration: FileText,
  email: Mail,
  supabase: Database,
  vercel: Zap
}

const SERVICE_LABELS: Record<string, string> = {
  api: 'API Gateway',
  database: 'Database',
  auth: 'Authentication',
  stripe: 'Payments',
  openai: 'AI Service',
  pdfGeneration: 'PDF Generation',
  email: 'Email Service',
  supabase: 'Supabase',
  vercel: 'Vercel Hosting'
}

export default function SystemHealthDashboard() {
  // State
  const [health, setHealth] = useState<SystemHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h')
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // Fetch health data
  const fetchHealth = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      setError(null)
      
      const response = await fetch(`/api/health?range=${timeRange}&refresh=${showRefreshing}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setHealth(data)
      setLastUpdated(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health data'
      setError(errorMessage)
      console.error('Health fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [timeRange])

  // After fetching data
  useEffect(() => {
    if (health?.history) {
      console.log('History data for chart:', health.history)
      console.log('History length:', health.history.length)
    }
  }, [health])

  // Set up auto-refresh
  useEffect(() => {
    fetchHealth()
    
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => fetchHealth(true), 30000)
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [fetchHealth, autoRefresh])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!health) return
    
    // Subscribe to alert rule changes
    const alertRulesSubscription = supabase
      .channel('alert_rules_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alert_rules' },
        () => {
          // Refresh when alert rules change
          fetchHealth(true)
        }
      )
      .subscribe()
    
    // Subscribe to health check updates
    const healthCheckSubscription = supabase
      .channel('health_check_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'health_check' },
        () => {
          fetchHealth(true)
        }
      )
      .subscribe()
    
    return () => {
      alertRulesSubscription.unsubscribe()
      healthCheckSubscription.unsubscribe()
    }
  }, [supabase, fetchHealth, health])

  // Handlers
  const toggleService = useCallback((serviceName: string) => {
    setExpandedServices(prev => {
      const next = new Set(prev)
      if (next.has(serviceName)) {
        next.delete(serviceName)
      } else {
        next.add(serviceName)
      }
      return next
    })
  }, [])

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch('/api/health/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'acknowledge' })
      })
      
      if (!response.ok) throw new Error('Failed to acknowledge alert')
      
      // Update local state
      setHealth(prev => {
        if (!prev) return prev
        return {
          ...prev,
          alerts: prev.alerts.map(alert =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          )
        }
      })
    } catch (err) {
      console.error('Failed to acknowledge alert:', err)
    }
  }, [])

  // Helper functions
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'degraded':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getStatusIcon = (status: string, size: number = 5) => {
    const iconClass = `w-${size} h-${size}`
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className={`${iconClass} text-green-600`} />
      case 'degraded':
        return <AlertTriangle className={`${iconClass} text-amber-600`} />
      case 'down':
        return <XCircle className={`${iconClass} text-red-600`} />
      default:
        return <Activity className={`${iconClass} text-slate-600`} />
    }
  }

  const getServiceIcon = (service: string) => {
    const Icon = SERVICE_ICONS[service] || Activity
    return <Icon className="w-5 h-5 text-navy-500" />
  }

  const getResourceBarColor = (value: number): string => {
    if (value > 80) return 'bg-red-500'
    if (value > 60) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never'
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy-200 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-600 font-medium">Loading system health...</p>
          <p className="text-sm text-navy-400 mt-1">Fetching latest metrics</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-navy-900 mb-2">Unable to Load Health Data</h2>
          <p className="text-navy-600 mb-4">{error}</p>
          <button
            onClick={() => fetchHealth(true)}
            className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const overallStatus = health?.status || 'healthy'
  const uptimeValue = health?.dashboard?.uptime_24h || health?.uptime || 99.99

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-navy-900">System Health</h1>
          <p className="text-xs text-navy-500">Last updated: {formatTimeAgo(lastUpdated)}</p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Filters */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] z-10 bg-white border-b border-slate-200 shadow-lg p-4 space-y-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-navy-600">Auto-refresh (30s)</span>
          </label>
          <button
            onClick={() => fetchHealth(true)}
            disabled={refreshing}
            className="w-full px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Now
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - Desktop */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 mb-1">System Health</h1>
            <p className="text-navy-600">
              Real-time monitoring and AI service metrics
              {lastUpdated && (
                <span className="ml-2 text-sm text-navy-400">
                  Updated {formatTimeAgo(lastUpdated)}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300 focus:ring-gold-500"
              />
              <span className="text-sm text-navy-600">Auto-refresh (30s)</span>
            </label>
            <button
              onClick={() => fetchHealth(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div className={`rounded-2xl border p-4 sm:p-6 mb-6 transition-colors ${
          overallStatus === 'healthy' ? 'bg-green-50 border-green-200' :
          overallStatus === 'degraded' ? 'bg-amber-50 border-amber-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {getStatusIcon(overallStatus, 6)}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold capitalize">
                  System Status: {overallStatus}
                </h2>
                <p className="text-sm text-slate-600">
                  {overallStatus === 'healthy' && 'All systems operational'}
                  {overallStatus === 'degraded' && 'Some services experiencing issues'}
                  {overallStatus === 'down' && 'Critical systems offline'}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-bold">{uptimeValue}%</div>
              <div className="text-xs sm:text-sm text-navy-600">Uptime (30 days)</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <MetricCard
            icon={<Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />}
            title="AI Latency"
            value={`${health?.metrics?.avgResponseTime || 0}ms`}
            status={health?.metrics?.avgResponseTime && health.metrics.avgResponseTime < 2000 ? 'normal' : 'slow'}
            statusText={health?.metrics?.avgResponseTime && health.metrics.avgResponseTime < 2000 ? 'Normal' : 'Slow'}
          />
          <MetricCard
            icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
            title="Success Rate"
            value={`${Math.max(0, 100 - (health?.metrics?.errorRate || 0))}%`}
            status={(health?.metrics?.errorRate || 0) < 5 ? 'normal' : 'warning'}
            statusText={`${health?.metrics?.errorRate || 0}% error rate`}
          />
          <MetricCard
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-navy-600" />}
            title="Active Alerts"
            value={String(health?.dashboard?.active_alerts || 0)}
            status={(health?.dashboard?.active_alerts || 0) > 0 ? 'warning' : 'normal'}
            statusText={`${health?.dashboard?.critical_alerts || 0} critical`}
          />
          <MetricCard
            icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5 text-navy-600" />}
            title="Response Time"
            value={`${health?.dashboard?.avg_response_time_ms || 0}ms`}
            status={(health?.dashboard?.avg_response_time_ms || 0) < 500 ? 'normal' : 'slow'}
            statusText="Average"
          />
        </div>

        {/* Performance History */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-navy-900 mb-4">
            Performance History
          </h3>
          
          {/* Debug info
          {health?.history && health.history.length > 0 && (
            <div className="text-xs text-navy-500 mb-3 bg-slate-50 p-2 rounded flex justify-between flex-wrap gap-2">
              <span>📊 {health.history.length} data points</span>
              <span>🕐 Latest: {new Date(health.history[health.history.length - 1]?.timestamp).toLocaleString()}</span>
              <span>⚡ Value: {health.history[health.history.length - 1]?.responseTime}ms</span>
            </div>
          )}
          */}

          {health?.history && health.history.length > 0 && (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[800px]">
                <svg width="100%" height="320" viewBox="0 0 1000 320" preserveAspectRatio="xMidYMid meet">
                  <g transform="translate(70, 20)">
                    {/* Grid lines */}
                    <line x1="0" y1="200" x2="860" y2="200" stroke="#E2E8F0" strokeWidth="1" />
                    <line x1="0" y1="150" x2="860" y2="150" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="0" y1="100" x2="860" y2="100" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="0" y1="50" x2="860" y2="50" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="0" y1="0" x2="860" y2="0" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="0" y1="0" x2="0" y2="200" stroke="#CBD5E1" strokeWidth="1" />
                    
                    {/* Y-axis labels */}
                    <text x="-8" y="200" fontSize="10" fill="#64748B" textAnchor="end">0ms</text>
                    <text x="-8" y="150" fontSize="10" fill="#64748B" textAnchor="end">75ms</text>
                    <text x="-8" y="100" fontSize="10" fill="#64748B" textAnchor="end">150ms</text>
                    <text x="-8" y="50" fontSize="10" fill="#64748B" textAnchor="end">225ms</text>
                    <text x="-8" y="0" fontSize="10" fill="#64748B" textAnchor="end">300ms</text>
                    
                    {/* Data line */}
                    <polyline
                      fill="none"
                      stroke="#C6A13B"
                      strokeWidth="2"
                      points={health.history.map((point, i) => {
                        const x = (i / (health.history.length - 1)) * 860
                        // Scale: 0-300ms maps to 200-0 pixels
                        const y = 200 - (Math.min(point.responseTime, 300) / 300) * 200
                        return `${x},${y}`
                      }).join(' ')}
                    />
                    
                    {/* Data points */}
                    {health.history.map((point, i) => {
                      const x = (i / (health.history.length - 1)) * 860
                      const y = 200 - (Math.min(point.responseTime, 300) / 300) * 200
                      return (
                        <circle key={i} cx={x} cy={y} r="2.5" fill="#C6A13B" stroke="white" strokeWidth="1.5">
                          <title>{`${new Date(point.timestamp).toLocaleString()}: ${point.responseTime}ms`}</title>
                        </circle>
                      )
                    })}
                    
                    {/* X-axis labels - format in browser */}
                    {health.history.map((point, i) => {
                      const step = Math.max(1, Math.floor(health.history.length / 8))
                      const isFirst = i === 0
                      const isLast = i === health.history.length - 1
                      
                      if (isFirst || isLast || i % step === 0) {
                        const x = (i / (health.history.length - 1)) * 860
                        const localDate = new Date(point.timestamp)
                        let hours = localDate.getHours()
                        const minutes = localDate.getMinutes().toString().padStart(2, '0')
                        const ampm = hours >= 12 ? 'PM' : 'AM'
                        hours = hours % 12
                        hours = hours ? hours : 12
                        const formatted = `${localDate.getMonth()+1}/${localDate.getDate()} ${hours}:${minutes} ${ampm}`
                        
                        return (
                          <text
                            key={`label-${i}`}
                            x={isLast ? x - 15 : x}
                            y="225"
                            fontSize="8"
                            fill="#64748B"
                            textAnchor={isLast ? "end" : "middle"}
                          >
                            {formatted}
                          </text>
                        )
                      }
                      return null
                    })}
                  </g>
                  
                  {/* Axis labels */}
                  <text x="520" y="295" fontSize="10" fill="#64748B" textAnchor="middle">Time →</text>
                  <text x="-10" y="75" fontSize="10" fill="#64748B" textAnchor="middle" transform="rotate(-90, 20, 85)">Response Time (ms) ↑</text>
                </svg>
              </div>
            </div>
          )}
          
          {(!health?.history || health.history.length === 0) && (
            <div className="text-center py-12 text-navy-400">No historical data available</div>
          )}
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6  text-xs text-navy-500 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-gold-500"></div>
              <span>Response Time Trend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
              <span>Data Points</span>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {health && Object.entries(health.services).map(([name, service]) => (
            <ServiceCard
              key={name}
              name={name}
              label={SERVICE_LABELS[name] || name}
              service={service}
              icon={getServiceIcon(name)}
              isExpanded={expandedServices.has(name)}
              onToggle={() => toggleService(name)}
            />
          ))}
        </div>

        {/* Resource Usage */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-navy-900 mb-4">
            Resource Utilization
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <ResourceBar
              icon={<Cpu className="w-4 h-4" />}
              label="CPU"
              value={health?.resources?.cpu || 0}
              unit="%"
              color={getResourceBarColor(health?.resources?.cpu || 0)}
            />
            <ResourceBar
              icon={<Database className="w-4 h-4" />}
              label="Memory"
              value={health?.resources?.memory || 0}
              unit="%"
              color={getResourceBarColor(health?.resources?.memory || 0)}
            />
            <ResourceBar
              icon={<HardDrive className="w-4 h-4" />}
              label="Storage"
              value={health?.resources?.storage || 0}
              unit="%"
              color={getResourceBarColor(health?.resources?.storage || 0)}
            />
            <ResourceBar
              icon={<Wifi className="w-4 h-4" />}
              label="Bandwidth"
              value={health?.resources?.bandwidth || 0}
              unit="Mbps"
              color="bg-blue-500"
            />
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-navy-900">
              Active Alerts
            </h3>
            <button 
              onClick={() => fetchHealth(true)}
              className="text-xs sm:text-sm text-gold-600 hover:text-gold-700"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-3">
            {health?.alerts?.filter(a => !a.resolved).slice(0, 5).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={() => acknowledgeAlert(alert.id)}
              />
            ))}
            
            {(!health?.alerts || health.alerts.filter(a => !a.resolved).length === 0) && (
              <div className="text-center py-6 sm:py-8">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-3" />
                <p className="text-navy-600 font-medium">No active alerts</p>
                <p className="text-xs sm:text-sm text-navy-400">All systems are operating normally</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-components
interface MetricCardProps {
  icon: React.ReactNode
  title: string
  value: string
  status: 'normal' | 'warning' | 'slow' | 'critical'
  statusText: string
}

function MetricCard({ icon, title, value, status, statusText }: MetricCardProps) {
  const statusColor = {
    normal: 'text-green-600',
    warning: 'text-amber-600',
    slow: 'text-amber-600',
    critical: 'text-red-600'
  }[status]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs sm:text-sm font-medium text-navy-600">{title}</span>
      </div>
      <div className="text-xl sm:text-3xl font-bold text-navy-900">{value}</div>
      <div className={`text-xs sm:text-sm mt-1 ${statusColor}`}>{statusText}</div>
    </div>
  )
}

interface ServiceCardProps {
  name: string
  label: string
  service: ServiceHealth
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
}

function ServiceCard({ name, label, service, icon, isExpanded, onToggle }: ServiceCardProps) {
  const getStatusBadge = (status: ServiceStatus) => {
    const colors = {
      operational: 'bg-green-100 text-green-800',
      degraded: 'bg-amber-100 text-amber-800',
      down: 'bg-red-100 text-red-800'
    }
    return colors[status]
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-navy-900">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(service.status)}`}>
            {service.status}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50">
          <div className="space-y-2 mt-3">
            <div className="flex justify-between text-xs">
              <span className="text-navy-500">Latency</span>
              <span className="font-mono font-medium">{service.latency}ms</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-navy-500">Error Rate</span>
              <span className={`font-mono font-medium ${
                service.errorRate > 5 ? 'text-red-600' :
                service.errorRate > 1 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {service.errorRate}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-navy-500">Last Checked</span>
              <span className="font-mono text-xs">
                {new Date(service.lastChecked).toLocaleTimeString()}
              </span>
            </div>
            {service.message && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg mt-2">
                {service.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface ResourceBarProps {
  icon: React.ReactNode
  label: string
  value: number
  unit: string
  color: string
}

function ResourceBar({ icon, label, value, unit, color }: ResourceBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <div className="flex items-center gap-1">
          {icon}
          <span className="text-navy-600">{label}</span>
        </div>
        <span className="font-medium text-navy-900">{value}{unit}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

interface AlertCardProps {
  alert: SystemHealthData['alerts'][0]
  onAcknowledge: () => void
}

function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const severityConfig = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, iconColor: 'text-red-600' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: AlertCircle, iconColor: 'text-blue-600' }
  }[alert.severity]

  const Icon = severityConfig.icon

  return (
    <div className={`p-3 sm:p-4 rounded-lg border ${severityConfig.bg} ${severityConfig.border}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${severityConfig.iconColor} shrink-0 mt-0.5`} />
          <div>
            <h4 className="font-medium text-sm sm:text-base capitalize">{alert.service}</h4>
            <p className="text-xs sm:text-sm text-slate-600">{alert.message}</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs">
              <span className="text-navy-500">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                alert.acknowledged ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {alert.acknowledged ? 'Acknowledged' : 'New'}
              </span>
            </div>
          </div>
        </div>
        {!alert.acknowledged && (
          <button
            onClick={onAcknowledge}
            className="p-1.5 hover:bg-white/50 rounded self-start transition-colors"
            aria-label="Acknowledge alert"
          >
            <CheckCheck className="w-4 h-4 text-navy-500" />
          </button>
        )}
      </div>
    </div>
  )
}