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
  User,
  Building2,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  MoreVertical,
  Trash2,
  Mail,
  FileDown,
  BarChart3,
  Archive  // ← Add this import
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/utils'
import BatchDownloadModal from './components/BatchDownloadModal' // ← Add this import

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

      // Handle file download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reports-export-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
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
        // Refresh stats
        fetchReports()
      }
    } catch (error) {
      console.error('Failed to delete report:', error)
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
      }
    } catch (error) {
      console.error('Failed to delete reports:', error)
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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">All Reports</h1>
          <p className="text-navy-600 mt-1">View and manage all generated reports</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedReports.length > 0 && (
            <>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                Export Selected ({selectedReports.length})
              </button>
              <button
                onClick={() => setShowBatchDownload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700"
              >
                <Archive className="w-4 h-4" />
                Download PDFs ({selectedReports.length})
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </>
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

      {/* Stats Cards - Mobile Responsive Grid */}
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
              {(statusFilter !== 'all' || dateRange.start || dateRange.end) && (
                <span className="w-2 h-2 rounded-full bg-gold-500" />
              )}
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

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    End Date
                  </label>
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

      {/* Reports Table - Responsive Card Layout on Mobile */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden lg:block overflow-x-auto">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">Industry</th>
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
                  <td className="px-6 py-4">
                    {getStatusBadge(report.status)}
                  </td>
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
                    <div className="text-sm text-navy-600">{report.industry}</div>
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
                          {report.status === 'ready' && (
                            <button
                                onClick={async (e) => {
                                e.preventDefault()
                                try {
                                    const { PDFDownloader } = await import('@/lib/pdf/download')
                                    const fileName = PDFDownloader.generateFileName(
                                    report.company_name, 
                                    new Date(report.created_at).toISOString().split('T')[0]
                                    )
                                    
                                    if (report.pdf_url) {
                                    await PDFDownloader.downloadFromUrl(report.pdf_url, fileName)
                                    } else {
                                    // Try to refresh the URL
                                    const freshUrl = await PDFDownloader.refreshPDFUrl(report.id)
                                    if (freshUrl) {
                                        await PDFDownloader.downloadFromUrl(freshUrl, fileName)
                                    } else {
                                        alert('PDF not available for download')
                                    }
                                    }
                                } catch (error) {
                                    console.error('Download failed:', error)
                                    alert('Failed to download PDF. Please try again.')
                                }
                                }}
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                                title="Download PDF"
                            >
                                <Download className="w-4 h-4 text-navy-600" />
                            </button>
                            )}
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
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

        {/* Mobile Card Layout */}
        <div className="lg:hidden divide-y divide-slate-200">
          {reports.map((report) => (
            <div key={report.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
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
                    className="mt-1 rounded border-slate-300"
                  />
                  <div>
                    <div className="font-medium text-navy-900">{report.company_name}</div>
                    <div className="text-sm text-navy-500 mt-1">{report.users?.email || 'N/A'}</div>
                  </div>
                </div>
                {getStatusBadge(report.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="flex items-center gap-1 text-navy-500">
                  <MapPin className="w-4 h-4" />
                  <span>{report.city}, {report.state}</span>
                </div>
                <div className="flex items-center gap-1 text-navy-500">
                  <Building2 className="w-4 h-4" />
                  <span>{report.industry}</span>
                </div>
                <div className="flex items-center gap-1 text-navy-500 col-span-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(report.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {report.status === 'ready' && (
                  <>
                    <Link
                      href={`/report/${report.id}`}
                      target="_blank"
                      className="flex items-center gap-1 px-3 py-1.5 bg-navy-50 text-navy-700 rounded-lg text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    {report.pdf_url && (
                      <a
                        href={report.pdf_url}
                        download
                        className="flex items-center gap-1 px-3 py-1.5 bg-navy-50 text-navy-700 rounded-lg text-sm"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </a>
                    )}
                  </>
                )}
                <button
                  onClick={() => handleDelete(report.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {reports.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-navy-600">No reports found</p>
            <p className="text-sm text-navy-400 mt-1">Try adjusting your filters or search terms</p>
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
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Download Modal */}
      {showBatchDownload && (
        <BatchDownloadModal
          reports={reports.filter(r => selectedReports.includes(r.id))}
          onClose={() => setShowBatchDownload(false)}
        />
      )}
    </div>
  )
}