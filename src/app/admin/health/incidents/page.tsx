// src/app/admin/health/incidents/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  FileText,
  AlertTriangle,
  Info,
  Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Incident {
  id: string
  event_type: 'incident' | 'maintenance' | 'degraded' | 'outage'
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  service: string
  started_at: string
  resolved_at: string | null
  status: 'active' | 'resolved' | 'investigating'
  created_by: string | null
  created_at: string
  updated_at: string
}

const SERVICE_LABELS: Record<string, string> = {
  api: 'API Gateway',
  database: 'Database',
  auth: 'Authentication',
  stripe: 'Payment Processing',
  openai: 'AI Service',
  pdfGeneration: 'PDF Generation',
  email: 'Email Service',
  supabase: 'Supabase',
  vercel: 'Vercel'
}

const SEVERITY_CONFIG = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Critical' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertTriangle, label: 'Warning' },
  info: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Info, label: 'Info' }
}

const STATUS_CONFIG = {
  active: { bg: 'bg-red-100', text: 'text-red-800', label: 'Active' },
  investigating: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Investigating' },
  resolved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' }
}

export default function IncidentHistoryPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const supabase = createClient()

  const fetchIncidents = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('health_events')
        .select('*')
        .order('started_at', { ascending: false })

      if (fetchError) {
        // If table doesn't exist, use mock data
        if (fetchError.code === 'PGRST205') {
          setIncidents(getMockIncidents())
          setLastUpdated(new Date())
          setLoading(false)
          setRefreshing(false)
          return
        }
        throw fetchError
      }
      
      setIncidents(data || [])
      setLastUpdated(new Date())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load incidents'
      setError(message)
      console.error('Fetch error:', err)
      // Use mock data on error
      setIncidents(getMockIncidents())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  const getSeverityConfig = (severity: string) => {
    return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info
  }

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active
  }

  const formatDuration = (start: string, end?: string | null) => {
    const startTime = new Date(start)
    const endTime = end ? new Date(end) : new Date()
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins} minutes`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    if (hours < 24) return `${hours}h ${mins}m`
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }

  const filteredIncidents = incidents.filter(incident => {
    if (filter !== 'all' && incident.status !== filter) return false
    if (severityFilter !== 'all' && incident.severity !== severityFilter) return false
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return incident.title.toLowerCase().includes(searchLower) ||
        incident.description?.toLowerCase().includes(searchLower) ||
        SERVICE_LABELS[incident.service]?.toLowerCase().includes(searchLower)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading incident history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Incident History</h1>
          <p className="text-navy-600">
            Track and review past system incidents and resolution times
            {lastUpdated && (
              <span className="ml-2 text-sm text-navy-400">
                Updated {formatTimeAgo(lastUpdated)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => fetchIncidents(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Incidents"
          value={incidents.length}
          icon={AlertCircle}
          color="text-navy-600"
        />
        <StatCard
          title="Active"
          value={incidents.filter(i => i.status === 'active').length}
          icon={AlertTriangle}
          color="text-red-600"
        />
        <StatCard
          title="Resolved"
          value={incidents.filter(i => i.status === 'resolved').length}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard
          title="Avg Resolution"
          value={calculateAvgResolutionTime(incidents)}
          icon={Clock}
          color="text-gold-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.map((incident) => {
          const SeverityIcon = getSeverityConfig(incident.severity).icon
          const statusConfig = getStatusConfig(incident.status)
          
          return (
            <div
              key={incident.id}
              onClick={() => setSelectedIncident(selectedIncident?.id === incident.id ? null : incident)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedIncident?.id === incident.id
                  ? 'border-gold-500 bg-gold-50/30 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <SeverityIcon className={`w-5 h-5 ${getSeverityConfig(incident.severity).text} mt-0.5`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-medium text-navy-900">{incident.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityConfig(incident.severity).bg} ${getSeverityConfig(incident.severity).text}`}>
                        {getSeverityConfig(incident.severity).label}
                      </span>
                    </div>
                    <p className="text-sm text-navy-600 line-clamp-2">{incident.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-navy-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(incident.started_at).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Duration: {formatDuration(incident.started_at, incident.resolved_at)}
                      </span>
                      <span>{SERVICE_LABELS[incident.service] || incident.service}</span>
                    </div>
                  </div>
                </div>
                <ChevronIcon expanded={selectedIncident?.id === incident.id} />
              </div>
              
              {/* Expanded Details */}
              {selectedIncident?.id === incident.id && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-navy-900 mb-2">Timeline</h4>
                  <div className="space-y-3">
                    <TimelineEvent
                      icon={<Bell className="w-4 h-4 text-blue-600" />}
                      title="Incident Created"
                      time={incident.started_at}
                      description={incident.title}
                    />
                    {incident.status === 'investigating' && (
                      <TimelineEvent
                        icon={<AlertCircle className="w-4 h-4 text-amber-600" />}
                        title="Investigating"
                        time={new Date(new Date(incident.started_at).getTime() + 5 * 60000).toISOString()}
                        description="Engineering team is investigating the issue"
                      />
                    )}
                    {incident.resolved_at && (
                      <TimelineEvent
                        icon={<CheckCircle className="w-4 h-4 text-green-600" />}
                        title="Incident Resolved"
                        time={incident.resolved_at}
                        description="The issue has been resolved and all systems are operational"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        {filteredIncidents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-navy-600 font-medium">No incidents found</p>
            <p className="text-sm text-navy-400 mt-1">All systems are healthy</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Sub-components
function StatCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-navy-500">{title}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function TimelineEvent({ icon, title, time, description }: { icon: React.ReactNode; title: string; time: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-navy-900">{title}</div>
        <div className="text-xs text-navy-500">{new Date(time).toLocaleString()}</div>
        <div className="text-sm text-navy-600 mt-1">{description}</div>
      </div>
    </div>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <div className="flex-shrink-0">
      {expanded ? (
        <ChevronUp className="w-5 h-5 text-navy-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-navy-400" />
      )}
    </div>
  )
}

// Need to import ChevronUp/ChevronDown
import { ChevronDown, ChevronUp } from 'lucide-react'

function calculateAvgResolutionTime(incidents: Incident[]): string {
  const resolvedIncidents = incidents.filter(i => i.resolved_at && i.status === 'resolved')
  if (resolvedIncidents.length === 0) return 'N/A'
  
  const totalMinutes = resolvedIncidents.reduce((sum, incident) => {
    const start = new Date(incident.started_at)
    const end = new Date(incident.resolved_at!)
    const minutes = (end.getTime() - start.getTime()) / 60000
    return sum + minutes
  }, 0)
  
  const avgMinutes = Math.round(totalMinutes / resolvedIncidents.length)
  
  if (avgMinutes < 60) return `${avgMinutes} min`
  const hours = Math.floor(avgMinutes / 60)
  const mins = avgMinutes % 60
  return `${hours}h ${mins}m`
}

function getMockIncidents(): Incident[] {
  return [
    {
      id: '1',
      event_type: 'incident',
      title: 'API Response Time Degradation',
      description: 'API response times exceeded 1000ms for 5 minutes due to increased traffic',
      severity: 'warning',
      service: 'api',
      status: 'resolved',
      started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
      created_by: null,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      event_type: 'outage',
      title: 'Database Connection Issues',
      description: 'Database connection pool exhausted due to connection leak',
      severity: 'critical',
      service: 'database',
      status: 'resolved',
      started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      created_by: null,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      event_type: 'degraded',
      title: 'AI Service Slow Response',
      description: 'OpenAI API latency increased to 3000ms due to upstream issues',
      severity: 'warning',
      service: 'openai',
      status: 'resolved',
      started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
      created_by: null,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      event_type: 'incident',
      title: 'Payment Processing Error',
      description: 'Stripe webhook failures detected - 5% of payments affected',
      severity: 'critical',
      service: 'stripe',
      status: 'active',
      started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      resolved_at: null,
      created_by: null,
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    }
  ]
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds} seconds ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  return `${hours} hour${hours > 1 ? 's' : ''} ago`
}