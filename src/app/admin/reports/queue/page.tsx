// src/app/admin/reports/queue/page.tsx
// Report Queue Monitor
'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  BarChart3,
  Loader2,
  Play,
  Pause,
  SkipForward
} from 'lucide-react'

interface QueueItem {
  id: string
  report_id: string
  user_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  priority: number
  attempts: number
  max_attempts: number
  error?: string
  params: any
  created_at: string
  started_at?: string
  completed_at?: string
  updated_at?: string
  reports?: {
    company_name: string
    industry: string
    city: string
    state: string
  }
}

interface QueueStats {
  queued: number
  processing: number
  completed: number
  failed: number
  activeJobs: number
  maxConcurrent: number
  avgGenerationTime: number
  successRate: number
}

interface QueueResponse {
  items: QueueItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ReportQueueMonitor() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null)

  useEffect(() => {
    fetchQueueData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchQueueData, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, filter])

  const fetchQueueData = async () => {
    try {
      setRefreshing(true)
      setError(null)
      
      const [queueRes, statsRes] = await Promise.all([
        fetch(`/api/admin/reports/queue?status=${filter}`),
        fetch('/api/admin/reports/queue/stats')
      ])
      
      if (!queueRes.ok) {
        throw new Error(`Queue API error: ${queueRes.status}`)
      }
      if (!statsRes.ok) {
        throw new Error(`Stats API error: ${statsRes.status}`)
      }
      
      const queueData: QueueResponse = await queueRes.json()
      const statsData = await statsRes.json()
      
      const queueItems = queueData.items || []
      
      if (Array.isArray(queueItems)) {
        // Check for newly updated jobs
        if (queue.length > 0) {
          const updatedJobs = queueItems.filter(newJob => {
            const oldJob = queue.find(old => old.id === newJob.id)
            return oldJob && oldJob.updated_at !== newJob.updated_at
          })
          
          // Highlight the most recently updated job
          if (updatedJobs.length > 0) {
            const mostRecent = updatedJobs.reduce((latest, job) => {
              const latestDate = latest.updated_at ? new Date(latest.updated_at).getTime() : 0
              const jobDate = job.updated_at ? new Date(job.updated_at).getTime() : 0
              return jobDate > latestDate ? job : latest
            }, updatedJobs[0])
            
            setHighlightedJobId(mostRecent.id)
            
            // Clear highlight after 3 seconds
            setTimeout(() => setHighlightedJobId(null), 3000)
          }
        }
        
        setQueue(queueItems)
      } else {
        console.error('Queue items is not an array:', queueItems)
        setQueue([])
      }
      
      if (statsData && typeof statsData === 'object' && !statsData.error) {
        setStats(statsData)
      } else {
        setStats({
          queued: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          activeJobs: 0,
          maxConcurrent: 5,
          avgGenerationTime: 0,
          successRate: 100
        })
      }
    } catch (error) {
      console.error('Failed to fetch queue data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch queue data')
      setQueue([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRetry = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/queue/${jobId}/retry`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to retry job')
      fetchQueueData()
    } catch (error) {
      console.error('Failed to retry job:', error)
      setError('Failed to retry job')
    }
  }

  const handleCancel = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/queue/${jobId}/cancel`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to cancel job')
      fetchQueueData()
    } catch (error) {
      console.error('Failed to cancel job:', error)
      setError('Failed to cancel job')
    }
  }

  const handleClearFailed = async () => {
    try {
      const response = await fetch('/api/admin/reports/queue/clear-failed', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to clear failed jobs')
      fetchQueueData()
    } catch (error) {
      console.error('Failed to clear failed jobs:', error)
      setError('Failed to clear failed jobs')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="w-5 h-5 text-amber-600" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-amber-100 text-amber-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getTimeSince = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  const getUpdateIndicator = (updatedAt?: string) => {
    if (!updatedAt) return null
    
    const date = new Date(updatedAt)
    const now = new Date()
    const diffMins = (now.getTime() - date.getTime()) / 60000
    
    if (diffMins < 1) {
      return <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">New</span>
    }
    if (diffMins < 5) {
      return <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Recent</span>
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy-200 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading queue data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>Error: {error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Report Generation Queue</h1>
          <p className="text-navy-600">Monitor and manage AI report generation</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-navy-600">Auto-refresh (10s)</span>
          </label>
          <button
            onClick={fetchQueueData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-navy-500 mb-1">Queued</div>
            <div className="text-2xl font-bold text-amber-600">{stats.queued}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-navy-500 mb-1">Processing</div>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-navy-500 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-navy-500 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-navy-500 mb-1">Avg Time</div>
            <div className="text-2xl font-bold text-navy-900">{stats.avgGenerationTime}s</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-navy-500 mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-navy-900">{stats.successRate}%</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-navy-700">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === 'all' 
                ? 'bg-navy-900 text-white' 
                : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('queued')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === 'queued' 
                ? 'bg-amber-600 text-white' 
                : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
            }`}
          >
            Queued
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === 'processing' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === 'failed' 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
            }`}
          >
            Failed
          </button>
          
          {filter === 'failed' && (
            <button
              onClick={handleClearFailed}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear Failed
            </button>
          )}
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Report ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Attempts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {queue.map((item) => (
                <tr 
                  key={item.id} 
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    highlightedJobId === item.id && "bg-green-50 animate-pulse"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      {item.report_id.slice(0, 8)}...
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{item.params?.companyName || item.reports?.company_name || 'N/A'}</div>
                    <div className="text-xs text-navy-500">{item.params?.state || item.reports?.state || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority > 0 ? 'bg-gold-100 text-gold-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {item.priority > 0 ? 'High' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {item.attempts}/{item.max_attempts}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm" title={formatDate(item.created_at)}>
                      {getTimeSince(item.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm" title={formatDate(item.updated_at)}>
                        {getTimeSince(item.updated_at)}
                      </div>
                      {getUpdateIndicator(item.updated_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(item.id)}
                          className="p-1 hover:bg-slate-200 rounded"
                          title="Retry"
                        >
                          <Play className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      {item.status === 'queued' && (
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="p-1 hover:bg-slate-200 rounded"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                      {item.status === 'completed' && (
                        <a
                          href={`/report/${item.report_id}`}
                          target="_blank"
                          className="p-1 hover:bg-slate-200 rounded"
                          title="View Report"
                        >
                          <Eye className="w-4 h-4 text-navy-600" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {queue.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-navy-600">No jobs in queue</p>
            <p className="text-sm text-navy-400">All reports have been processed</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Add this helper function at the bottom if cn isn't imported
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}