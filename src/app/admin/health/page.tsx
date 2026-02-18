// src/app/admin/health/page.tsx
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
  AlertCircle
} from 'lucide-react'

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  services: Record<string, { status: string; latency: number; errorRate: number }>
  performance: {
    responseTime: number
    reportGenerationTime: number
    concurrentUsers: number
    errorRate: number
  }
  resources: {
    cpu: number
    memory: number
    storage: number
  }
  alerts: any[]
}

export default function SystemHealthDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  useEffect(() => {
    fetchHealth()
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])
  
  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/admin/health')
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
          <p className="text-navy-600">Real-time monitoring and alerts</p>
        </div>
        <div className="flex items-center gap-3">
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
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-navy-500" />
            <span className="text-sm font-medium">Response Time</span>
          </div>
          <div className="text-2xl font-bold">{health?.performance.responseTime}ms</div>
          <div className="text-xs text-navy-500 mt-1">Average API response</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-navy-500" />
            <span className="text-sm font-medium">Report Generation</span>
          </div>
          <div className="text-2xl font-bold">{health?.performance.reportGenerationTime}m</div>
          <div className="text-xs text-navy-500 mt-1">Average completion time</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-navy-500" />
            <span className="text-sm font-medium">Concurrent Users</span>
          </div>
          <div className="text-2xl font-bold">{health?.performance.concurrentUsers}</div>
          <div className="text-xs text-navy-500 mt-1">Current active sessions</div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-navy-500" />
            <span className="text-sm font-medium">Error Rate</span>
          </div>
          <div className={`text-2xl font-bold ${
            (health?.performance.errorRate || 0) > 5 ? 'text-red-600' :
            (health?.performance.errorRate || 0) > 1 ? 'text-amber-600' :
            'text-green-600'
          }`}>
            {health?.performance.errorRate}%
          </div>
          <div className="text-xs text-navy-500 mt-1">Of all requests</div>
        </div>
      </div>
      
      {/* Resource Usage */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Resource Utilization</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy-600">CPU</span>
              <span className="font-medium">{health?.resources.cpu}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (health?.resources.cpu || 0) > 80 ? 'bg-red-500' :
                  (health?.resources.cpu || 0) > 60 ? 'bg-amber-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${health?.resources.cpu}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy-600">Memory</span>
              <span className="font-medium">{health?.resources.memory}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (health?.resources.memory || 0) > 80 ? 'bg-red-500' :
                  (health?.resources.memory || 0) > 60 ? 'bg-amber-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${health?.resources.memory}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy-600">Storage</span>
              <span className="font-medium">{health?.resources.storage}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (health?.resources.storage || 0) > 80 ? 'bg-red-500' :
                  (health?.resources.storage || 0) > 60 ? 'bg-amber-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${health?.resources.storage}%` }}
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
          {health?.alerts.filter(a => !a.resolved).map((alert) => (
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
          
          {health?.alerts.filter(a => !a.resolved).length === 0 && (
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