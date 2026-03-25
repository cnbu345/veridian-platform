// src/app/admin/reports/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Trash2,
  FileDown,
  Archive,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/utils'
import BatchDownloadModal from './components/BatchDownloadModal'
import { ForceCompleteModal } from './components/ForceCompleteModal'

interface Report {
  id: string
  user_id: string
  company_name: string
  industry: string
  city: string
  state: string
  location_tier: string
  status: 'pending' | 'generating' | 'ready' | 'failed'
  created_at: string
  pdf_url: string | null
  users?: {
    email: string
    full_name: string
    company_name: string
  }
}

interface ReportsResponse {
  reports: Report[]
  statistics: {
    total: number
    pending: number
    generating: number
    ready: number
    failed: number
    pages: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<ReportsResponse['statistics'] | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)
  const [showBatchDownload, setShowBatchDownload] = useState(false)
  
  // Force complete states
  const [forceCompleting, setForceCompleting] = useState<string | null>(null)
  const [showForceModal, setShowForceModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch reports when filters change
  useEffect(() => {
    fetchReports()
  }, [pagination.page, statusFilter, debouncedSearch, dateRange.start, dateRange.end])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      })

      const response = await fetch(`/api/admin/reports?${params}`)
      const data: ReportsResponse = await response.json()
      
      setReports(data.reports)
      setStats(data.statistics)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  // Force complete click handler - opens modal
  const handleForceCompleteClick = (report: Report) => {
    setSelectedReport(report)
    setShowForceModal(true)
  }

  // Force complete confirmation handler - calls API
  const handleForceCompleteConfirm = async () => {
    if (!selectedReport) return
    
    console.log('🔍 Force completing report:', selectedReport.id, selectedReport.company_name)

    setForceCompleting(selectedReport.id)
    setShowForceModal(false)
    
    try {
      const response = await fetch(`/api/admin/reports/${selectedReport.id}/refresh-pdf-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'force-complete',
          reason: 'Manual admin override from reports dashboard'
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        let message = `✅ Success! "${selectedReport.company_name}" has been force completed.\n\n`
        message += `Status: Ready\n`
        if (data.content_generated) {
          message += `📝 AI content was generated for this report.\n`
        }
        if (data.pdf_generated) {
          message += `📄 PDF has been generated.\n`
        }
        alert(message)
        await fetchReports()
      } else {
        throw new Error(data.error || data.message || 'Failed to force complete')
      }
    } catch (error) {
      console.error('Failed to force complete:', error)
      alert(`❌ Failed to force complete "${selectedReport.company_name}".\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check the server logs for details.`)
    } finally {
      setForceCompleting(null)
      setSelectedReport(null)
    }
  }

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReports(reports.filter(r => r.id !== reportId))
        setSelectedReports(selectedReports.filter(id => id !== reportId))
        fetchReports()
        alert('✅ Report deleted successfully')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete report:', error)
      alert('❌ Failed to delete report')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedReports.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedReports.length} reports? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/reports/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportIds: selectedReports })
      })

      if (response.ok) {
        setReports(reports.filter(r => !selectedReports.includes(r.id)))
        setSelectedReports([])
        fetchReports()
        alert(`✅ ${selectedReports.length} reports deleted successfully`)
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete reports:', error)
      alert('❌ Failed to delete reports')
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(true)
      const response = await fetch(`/api/admin/reports/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportIds: selectedReports.length > 0 ? selectedReports : undefined,
          filters: {
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: debouncedSearch || undefined,
            startDate: dateRange.start || undefined,
            endDate: dateRange.end || undefined
          }
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reports-export-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      alert(`✅ Export completed successfully`)
    } catch (error) {
      console.error('Export failed:', error)
      alert('❌ Export failed')
    } finally {
      setExporting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'generating':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileText className="w-4 h-4 text-slate-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      ready: 'bg-green-100 text-green-800 border-green-200',
      generating: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${classes[status as keyof typeof classes] || 'bg-slate-100 text-slate-800'}`}>
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">All Reports</h1>
            <p className="text-navy-600 mt-1">View and manage all generated reports</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedReports.length > 0 && (
              <div className="relative flex items-center gap-3">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  <FileDown className="w-4 h-4" />
                  Export ({selectedReports.length})
                </button>
                
                <button
                  onClick={() => setShowBatchDownload(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700"
                >
                  <Archive className="w-4 h-4" />
                  Download PDFs
                </button>
                
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
            <button
              onClick={fetchReports}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-navy-500 mb-1">Total</div>
              <div className="text-xl sm:text-2xl font-bold text-navy-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-navy-500 mb-1">Pending</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-navy-500 mb-1">Generating</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.generating}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-navy-500 mb-1">Ready</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.ready}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-navy-500 mb-1">Failed</div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.failed}</div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search by company, email, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors",
                  showFilters 
                    ? "bg-gold-50 border-gold-200 text-gold-700" 
                    : "bg-white border-slate-200 text-navy-600 hover:bg-slate-50"
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="generating">Generating</option>
                <option value="ready">Ready</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setDateRange({ start: '', end: '' })
                      setStatusFilter('all')
                      setSearch('')
                      setDebouncedSearch('')
                    }}
                    className="px-4 py-2 text-sm text-navy-600 hover:text-navy-900"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => {
                      setShowFilters(false)
                      fetchReports()
                    }}
                    className="px-4 py-2 bg-navy-900 text-white rounded-lg text-sm hover:bg-navy-800"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReports.length === reports.length && reports.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReports(reports.map(r => r.id))
                        } else {
                          setSelectedReports([])
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports([...selectedReports, report.id])
                          } else {
                            setSelectedReports(selectedReports.filter(id => id !== report.id))
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-navy-900">{report.company_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-navy-600">{report.users?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-navy-600">{report.city}, {report.state}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-navy-600">{formatDate(report.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {report.status === 'ready' && (
                          <>
                            <Link
                              href={`/report/${report.id}`}
                              target="_blank"
                              className="p-1 hover:bg-slate-200 rounded transition-colors"
                              title="View Report"
                            >
                              <Eye className="w-4 h-4 text-navy-600" />
                            </Link>
                            <a
                              href={report.pdf_url || '#'}
                              download
                              className="p-1 hover:bg-slate-200 rounded transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4 text-navy-600" />
                            </a>
                          </>
                        )}
                        
                        {/* Force Complete Button - Only for pending/generating reports */}
                        {(report.status === 'pending' || report.status === 'generating') && (
                          <button
                            onClick={() => handleForceCompleteClick(report)}
                            disabled={forceCompleting === report.id}
                            className="p-1 hover:bg-amber-50 rounded transition-colors group"
                            title="Force Complete - Mark as Ready and Generate PDF"
                          >
                            {forceCompleting === report.id ? (
                              <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                            ) : (
                              <Zap className="w-4 h-4 text-amber-600 group-hover:text-amber-700" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {reports.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-navy-600">No reports found</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-gold-600 animate-spin mx-auto" />
              <p className="text-navy-600 mt-2">Loading reports...</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && reports.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-navy-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} reports
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm">Page {pagination.page} of {pagination.pages}</span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Force Complete Modal */}
      <ForceCompleteModal
        isOpen={showForceModal}
        onClose={() => {
          setShowForceModal(false)
          setSelectedReport(null)
        }}
        onConfirm={handleForceCompleteConfirm}
        companyName={selectedReport?.company_name || ''}
        isLoading={forceCompleting !== null}
      />

      {/* Batch Download Modal */}
      {showBatchDownload && (
        <BatchDownloadModal
          reports={reports.filter(r => selectedReports.includes(r.id))}
          onClose={() => setShowBatchDownload(false)}
        />
      )}
    </>
  )
}