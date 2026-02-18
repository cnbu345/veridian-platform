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

export default function ReportQueueMonitor() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filter, setFilter] = useState<string>('all')

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
      const [queueRes, statsRes] = await Promise.all([
        fetch(`/api/admin/reports/queue?status=${filter}`),
        fetch('/api/admin/reports/queue/stats')
      ])
      
      const queueData = await queueRes.json()
      const statsData = await statsRes.json()
      
      setQueue(queueData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch queue data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRetry = async (jobId: string) => {
    try {
      await fetch(`/api/admin/reports/queue/${jobId}/retry`, { method: 'POST' })
      fetchQueueData()
    } catch (error) {
      console.error('Failed to retry job:', error)
    }
  }

  const handleCancel = async (jobId: string) => {
    try {
      await fetch(`/api/admin/reports/queue/${jobId}/cancel`, { method: 'POST' })
      fetchQueueData()
    } catch (error) {
      console.error('Failed to cancel job:', error)
    }
  }

  const handleClearFailed = async () => {
    try {
      await fetch('/api/admin/reports/queue/clear-failed', { method: 'POST' })
      fetchQueueData()
    } catch (error) {
      console.error('Failed to clear failed jobs:', error)
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
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Report ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Attempts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {queue.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
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
                  <div className="text-sm font-medium">{item.params?.companyName}</div>
                  <div className="text-xs text-navy-500">{item.params?.state}</div>
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
                  <div className="text-sm">{new Date(item.created_at).toLocaleString()}</div>
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