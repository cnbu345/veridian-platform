// src/app/admin/health/page.tsx
// System Health Monitoring
'use client'

import { useState, useEffect } from 'react'
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
  Download,
  Upload,
  Users,
  Cpu,
  HardDrive,
  Wifi,
  Bell,
  CheckCheck,
  AlertCircle,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  services: Record<string, {
    status: string
    latency: number
    lastChecked: string
    errorRate: number
  }>
  performance: {
    responseTime: number
    reportGenerationTime: number
    concurrentUsers: number
    errorRate: number
    aiLatency: number
    aiSuccessRate: number
  }
  resources: {
    cpu: number
    memory: number
    storage: number
    bandwidth: number
  }
  alerts: any[]
  history: {
    timestamp: string
    responseTime: number
    errorRate: number
    cpu: number
  }[]
}

export default function SystemHealthDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [timeRange, setTimeRange] = useState('1h')

  useEffect(() => {
    fetchHealth()
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, timeRange])

  const fetchHealth = async () => {
    try {
      const res = await fetch(`/api/admin/health?range=${timeRange}`)
      const data = await res.json()
      setHealth(data)
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />
      case 'down':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Activity className="w-5 h-5 text-slate-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy-200 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading system health...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">System Health</h1>
          <p className="text-navy-600">Real-time monitoring and AI service metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
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
            onClick={fetchHealth}
            className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-2xl border p-6 ${
        health?.status === 'healthy' ? 'bg-green-50 border-green-200' :
        health?.status === 'degraded' ? 'bg-amber-50 border-amber-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(health?.status || 'unknown')}
            <div>
              <h2 className="text-lg font-semibold capitalize">
                System Status: {health?.status}
              </h2>
              <p className="text-sm">
                {health?.status === 'healthy' && 'All systems operational'}
                {health?.status === 'degraded' && 'Some services experiencing issues'}
                {health?.status === 'down' && 'Critical systems offline'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{health?.uptime}%</div>
            <div className="text-sm text-navy-600">Uptime (30 days)</div>
          </div>
        </div>
      </div>

      {/* AI Service Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">AI Latency</span>
          </div>
          <div className="text-3xl font-bold">{health?.performance.aiLatency || 0}ms</div>
          <div className={`text-sm mt-1 flex items-center gap-1 ${
            (health?.performance.aiLatency || 0) < 2000 ? 'text-green-600' : 'text-amber-600'
          }`}>
            {(health?.performance.aiLatency || 0) < 2000 ? '✓ Normal' : '⚠ Slow'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">AI Success Rate</span>
          </div>
          <div className="text-3xl font-bold">{health?.performance.aiSuccessRate || 0}%</div>
          <div className={`text-sm mt-1 ${
            (health?.performance.aiSuccessRate || 0) > 95 ? 'text-green-600' : 'text-amber-600'
          }`}>
            {health?.performance.aiSuccessRate || 0}% successful
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-navy-600" />
            <span className="text-sm font-medium">Report Gen Time</span>
          </div>
          <div className="text-3xl font-bold">{health?.performance.reportGenerationTime || 0}s</div>
          <div className="text-sm text-navy-500 mt-1">Average</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-navy-600" />
            <span className="text-sm font-medium">Concurrent Users</span>
          </div>
          <div className="text-3xl font-bold">{health?.performance.concurrentUsers || 0}</div>
          <div className="text-sm text-navy-500 mt-1">Active sessions</div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Performance History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={health?.history || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#C6A13B" name="Response Time (ms)" />
              <Line yAxisId="right" type="monotone" dataKey="errorRate" stroke="#EF4444" name="Error Rate %" />
              <Line yAxisId="left" type="monotone" dataKey="cpu" stroke="#3B82F6" name="CPU %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-4 gap-4">
        {health && Object.entries(health.services).map(([name, service]) => (
          <div key={name} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-navy-700 capitalize">
                {name.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {getStatusIcon(service.status)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-navy-500">Latency</span>
                <span className="font-medium">{service.latency}ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-navy-500">Error Rate</span>
                <span className={`font-medium ${
                  service.errorRate > 5 ? 'text-red-600' :
                  service.errorRate > 1 ? 'text-amber-600' :
                  'text-green-600'
                }`}>
                  {service.errorRate}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Usage */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Resource Utilization</h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy-600">CPU</span>
              <span className="font-medium">{health?.resources.cpu || 0}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (health?.resources.cpu || 0) > 80 ? 'bg-red-500' :
                  (health?.resources.cpu || 0) > 60 ? 'bg-amber-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${health?.resources.cpu || 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy-600">Memory</span>
              <span className="font-medium">{health?.resources.memory || 0}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (health?.resources.memory || 0) > 80 ? 'bg-red-500' :
                  (health?.resources.memory || 0) > 60 ? 'bg-amber-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${health?.resources.memory || 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy-600">Storage</span>
              <span className="font-medium">{health?.resources.storage || 0}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (health?.resources.storage || 0) > 80 ? 'bg-red-500' :
                  (health?.resources.storage || 0) > 60 ? 'bg-amber-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${health?.resources.storage || 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy-600">Bandwidth</span>
              <span className="font-medium">{health?.resources.bandwidth || 0} Mbps</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min(((health?.resources.bandwidth || 0) / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy-900">Active Alerts</h3>
          <button className="text-sm text-gold-600 hover:text-gold-700">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {health?.alerts?.filter(a => !a.resolved).map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                alert.severity === 'warning' ? 'bg-amber-50 border-amber-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {alert.severity === 'critical' && <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                  {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                  {alert.severity === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="font-medium">{alert.service}</h4>
                    <p className="text-sm">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-navy-500">{new Date(alert.timestamp).toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        alert.acknowledged ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {alert.acknowledged ? 'Acknowledged' : 'New'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-1 hover:bg-white/50 rounded">
                  <CheckCheck className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {(!health?.alerts || health.alerts.filter(a => !a.resolved).length === 0) && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-navy-600">No active alerts</p>
              <p className="text-sm text-navy-400">All systems are operating normally</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}