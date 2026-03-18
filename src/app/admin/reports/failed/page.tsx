// src/app/admin/reports/failed/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Trash2,
  Play,
  Clock,
  User,
  Building2,
  MapPin,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  BarChart3,
  Bug,
  Code,
  Mail,
  MessageSquare,
  Download,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/utils'

interface FailedReport {
  id: string
  report_id: string
  user_id: string
  status: 'failed'
  priority: number
  attempts: number
  max_attempts: number
  error: string
  params: {
    companyName: string
    state: string
    city: string
    industry: string
  }
  created_at: string
  started_at?: string
  completed_at?: string
  reports?: {
    company_name: string
    industry: string
    city: string
    state: string
  }
}

interface ErrorAnalytics {
  total_failed: number
  by_error_type: Record<string, number>
  by_state: Record<string, number>
  avg_attempts: number
  success_rate: number
  top_errors: Array<{ error: string; count: number }>
}

export default function FailedReportsPage() {
  const [failedReports, setFailedReports] = useState<FailedReport[]>([])
  const [analytics, setAnalytics] = useState<ErrorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState<FailedReport | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch failed reports
  useEffect(() => {
    fetchFailedReports()
    fetchErrorAnalytics()
  }, [pagination.page, debouncedSearch])

  const fetchFailedReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch })
      })

      const response = await fetch(`/api/admin/reports/queue?status=failed&${params}`)
      const data = await response.json()
      
      setFailedReports(data)
      setPagination(prev => ({ ...prev, total: data.total || 0 }))
    } catch (error) {
      console.error('Failed to fetch failed reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchErrorAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/reports/queue/analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch error analytics:', error)
    }
  }

  const handleRetry = async (jobId: string) => {
    try {
      setProcessing(jobId)
      const response = await fetch(`/api/admin/reports/queue/${jobId}/retry`, {
        method: 'POST'
      })

      if (response.ok) {
        // Remove from list after successful retry
        setFailedReports(failedReports.filter(r => r.id !== jobId))
        // Refresh analytics
        fetchErrorAnalytics()
      }
    } catch (error) {
      console.error('Failed to retry job:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleRetryAll = async () => {
    if (!confirm(`Are you sure you want to retry all ${failedReports.length} failed reports?`)) {
      return
    }

    try {
      setProcessing('all')
      const response = await fetch('/api/admin/reports/queue/retry-all', {
        method: 'POST'
      })

      if (response.ok) {
        // Refresh the list
        fetchFailedReports()
        fetchErrorAnalytics()
      }
    } catch (error) {
      console.error('Failed to retry all:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleClearFailed = async () => {
    if (!confirm('Are you sure you want to clear all failed reports? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/reports/queue/clear-failed', {
        method: 'POST'
      })

      if (response.ok) {
        setFailedReports([])
        fetchErrorAnalytics()
      }
    } catch (error) {
      console.error('Failed to clear failed reports:', error)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Delete this failed report from the queue?')) return

    try {
      const response = await fetch(`/api/admin/reports/queue/${jobId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFailedReports(failedReports.filter(r => r.id !== jobId))
        fetchErrorAnalytics()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const getErrorType = (error: string): string => {
    if (error.includes('timeout') || error.includes('timed out')) return 'Timeout'
    if (error.includes('API key') || error.includes('authentication')) return 'Authentication'
    if (error.includes('rate limit')) return 'Rate Limit'
    if (error.includes('validation')) return 'Validation'
    if (error.includes('database')) return 'Database'
    if (error.includes('network')) return 'Network'
    return 'Unknown'
  }

  const getErrorColor = (errorType: string) => {
    const colors: Record<string, string> = {
      'Timeout': 'bg-orange-100 text-orange-800',
      'Authentication': 'bg-red-100 text-red-800',
      'Rate Limit': 'bg-yellow-100 text-yellow-800',
      'Validation': 'bg-purple-100 text-purple-800',
      'Database': 'bg-blue-100 text-blue-800',
      'Network': 'bg-slate-100 text-slate-800',
      'Unknown': 'bg-gray-100 text-gray-800'
    }
    return colors[errorType] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Failed Reports</h1>
          <p className="text-navy-600 mt-1">Investigate and retry failed report generations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRetryAll}
            disabled={processing === 'all' || failedReports.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50"
          >
            {processing === 'all' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Retry All
          </button>
          <button
            onClick={handleClearFailed}
            disabled={failedReports.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
          <button
            onClick={() => {
              fetchFailedReports()
              fetchErrorAnalytics()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-navy-500">Total Failed</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-navy-900">{analytics.total_failed}</div>
            <div className="text-xs text-navy-400 mt-1">Last 30 days</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-navy-500">Avg Attempts</span>
              <RefreshCw className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-navy-900">{analytics.avg_attempts.toFixed(1)}</div>
            <div className="text-xs text-navy-400 mt-1">Before failure</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-navy-500">Success Rate</span>
              <BarChart3 className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-navy-900">{analytics.success_rate}%</div>
            <div className="text-xs text-navy-400 mt-1">Overall</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-navy-500">Top Error</span>
              <Bug className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-lg font-bold text-navy-900 truncate">
              {analytics.top_errors[0]?.error || 'N/A'}
            </div>
            <div className="text-xs text-navy-400 mt-1">
              {analytics.top_errors[0]?.count || 0} occurrences
            </div>
          </div>
        </div>
      )}

      {/* Error Type Breakdown */}
      {analytics && Object.keys(analytics.by_error_type).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-medium text-navy-900 mb-3">Error Breakdown by Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(analytics.by_error_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-navy-600">{type}</span>
                <span className="text-sm font-medium text-navy-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search by company, location, or error message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
            />
          </div>
        </div>
      </div>

      {/* Failed Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-gold-600 animate-spin mx-auto mb-4" />
            <p className="text-navy-600">Loading failed reports...</p>
          </div>
        ) : failedReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-navy-600">No failed reports</p>
            <p className="text-sm text-navy-400 mt-1">All report generations are running smoothly</p>
          </div>
        ) : (
          failedReports.map((report) => {
            const errorType = getErrorType(report.error)
            
            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Main Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left Side - Company Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-navy-900">
                            {report.params?.companyName || report.reports?.company_name || 'Unknown Company'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-sm text-navy-500">
                              <Building2 className="w-4 h-4" />
                              {report.params?.industry || report.reports?.industry || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-navy-500">
                              <MapPin className="w-4 h-4" />
                              {report.params?.city || report.reports?.city || 'Unknown'}, {report.params?.state || report.reports?.state || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-navy-500">
                              <Clock className="w-4 h-4" />
                              {formatDate(report.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Error Type & Actions */}
                    <div className="flex flex-col sm:items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getErrorColor(errorType)}`}>
                        {errorType}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-navy-400">
                          Attempts: {report.attempts}/{report.max_attempts}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-800 font-mono break-all">
                        {report.error}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleRetry(report.id)}
                      disabled={processing === report.id}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50"
                    >
                      {processing === report.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Retry
                    </button>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                    >
                      <Code className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Error Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy-900">Error Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-navy-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Report Info */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-navy-700 mb-3">Report Information</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-navy-500">Report ID</dt>
                      <dd className="text-sm font-mono">{selectedReport.report_id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-navy-500">Job ID</dt>
                      <dd className="text-sm font-mono">{selectedReport.id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-navy-500">User ID</dt>
                      <dd className="text-sm font-mono">{selectedReport.user_id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-navy-500">Priority</dt>
                      <dd className="text-sm">{selectedReport.priority > 0 ? 'High' : 'Normal'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-navy-500">Created</dt>
                      <dd className="text-sm">{formatDate(selectedReport.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-navy-500">Started</dt>
                      <dd className="text-sm">{formatDate(selectedReport.started_at)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Full Error */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Error Message</h3>
                  <pre className="text-xs text-red-700 bg-red-100 p-3 rounded overflow-x-auto">
                    {selectedReport.error}
                  </pre>
                </div>

                {/* Parameters */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-navy-700 mb-3">Generation Parameters</h3>
                  <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-x-auto">
                    {JSON.stringify(selectedReport.params, null, 2)}
                  </pre>
                </div>

                {/* Stack Trace (if available) */}
                {selectedReport.error.includes('at ') && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-navy-700 mb-3">Stack Trace</h3>
                    <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-x-auto font-mono">
                      {selectedReport.error.split('\n').map((line, i) => (
                        <div key={i} className={line.includes('at ') ? 'text-purple-600' : ''}>
                          {line}
                        </div>
                      ))}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleRetry(selectedReport.id)
                    setSelectedReport(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
                >
                  <Play className="w-4 h-4" />
                  Retry Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && failedReports.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-sm text-navy-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm">Page {pagination.page}</span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}