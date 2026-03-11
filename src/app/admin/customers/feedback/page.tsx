// src/app/admin/customers/feedback/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Download,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react'
import FeedbackFilters from './components/FeedbackFilters'
import FeedbackCard from './components/FeedbackCard'

interface Feedback {
  id: string
  user_id: string
  feedback_type: string
  rating: number | null
  comment: string | null
  source: string
  status: string
  priority: string
  category: string | null
  tags: string[] | null
  created_at: string
  users: {
    email: string
    company_name: string | null
    full_name: string | null
  }
}

interface Metrics {
  total: number
  averageRating: number
  nps: number
  promoters: number
  detractors: number
  newCount: number
  criticalCount: number
  byType: {
    nps: number
    csat: number
    feature_request: number
    bug_report: number
    support: number
    general: number
  }
  byStatus: {
    new: number
    reviewed: number
    in_progress: number
    actioned: number
    archived: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [priority, setPriority] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const fetchFeedback = async () => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams({
        status,
        type,
        priority,
        search,
        page: page.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/admin/customers/feedback?${params}`)
      const data = await response.json()

      setFeedback(data.feedback || [])
      setMetrics(data.metrics)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [status, type, priority, search, page])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/customers/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchFeedback() // Refresh the list
    } catch (error) {
      console.error('Failed to update feedback status:', error)
    }
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-gold-600" />
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Customer Feedback</h1>
              <p className="text-navy-600 mt-1">Review, analyze, and act on customer feedback</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeedback}
            disabled={refreshing}
            className="p-2 text-navy-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-navy-600">Total</span>
              <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-navy-600" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-navy-900">{metrics.total}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-navy-600">Avg Rating</span>
              <Star className="w-4 h-4 lg:w-5 lg:h-5 text-amber-500" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-navy-900">{metrics.averageRating}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-navy-600">NPS</span>
              <BarChart3 className={`w-4 h-4 lg:w-5 lg:h-5 ${metrics.nps >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className={`text-xl lg:text-2xl font-bold ${metrics.nps >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.nps}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-navy-600">New</span>
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-navy-900">{metrics.newCount}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-navy-600">Critical</span>
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-navy-900">{metrics.criticalCount}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-navy-600">Promoters</span>
              <ThumbsUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-navy-900">{metrics.promoters}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-navy-600">Detractors</span>
              <ThumbsDown className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-navy-900">{metrics.detractors}</div>
          </div>
        </div>
      )}

      {/* Type Distribution - Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.entries(metrics.byType).map(([key, count]) => (
            <div key={key} className="bg-white rounded-lg border border-slate-200 p-3 text-center">
              <div className="text-xs text-navy-500 mb-1 capitalize">{key.replace('_', ' ')}</div>
              <div className="text-lg font-semibold text-navy-900">{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <FeedbackFilters
        status={status}
        onStatusChange={setStatus}
        type={type}
        onTypeChange={setType}
        priority={priority}
        onPriorityChange={setPriority}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
          </div>
        </div>
      )}

      {/* Feedback List */}
      {!loading && feedback.length > 0 && (
        <div className="space-y-4">
          {feedback.map((item) => (
            <FeedbackCard
              key={item.id}
              feedback={item}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && feedback.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No feedback found</h3>
          <p className="text-navy-600">
            {search ? 'Try adjusting your search or filters' : 'No customer feedback matches the selected criteria'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-sm text-navy-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-slate-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-navy-900 text-white rounded-lg text-sm">
              {page}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1 rounded-lg border border-slate-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}