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
  Calendar,
  Building2,
  User,
  Mail,
  ChevronRight,
  Filter,
  X
} from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils/utils'

interface Feedback {
  id: string
  feedback_type: {
    id: string
    name: string
    category: string
  }
  status: string
  priority: string
  nps_score: number | null
  csat_score: number | null
  comments: string | null
  email_subject: string | null
  email_content: string | null
  feature_category: string | null
  admin_response: string | null
  responded_at: string | null
  created_at: string
  company_name: string | null
  client_name: string | null
  users: {
    id: string
    email: string
    full_name: string | null
    company_name: string | null
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
  byType: Record<string, number>
  byStatus: Record<string, number>
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AdminFeedbackPage() {
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

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      nps: 'NPS',
      csat: 'CSAT',
      feature_request: 'Feature Request',
      support: 'Support',
      general: 'General',
      account_review: 'Account Review'
    }
    return types[type] || type
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_review: 'bg-amber-100 text-amber-800 border-amber-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      action_planned: 'bg-purple-100 text-purple-800 border-purple-200',
      implemented: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-slate-100 text-slate-800 border-slate-200'
    }
    return styles[status] || 'bg-slate-100 text-slate-800'
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return styles[priority] || 'bg-slate-100 text-slate-800'
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending_review: 'Pending Review',
      reviewed: 'Reviewed',
      action_planned: 'Action Planned',
      implemented: 'Implemented',
      closed: 'Closed'
    }
    return labels[status] || status.replace('_', ' ')
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-gold-600" />
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Client Feedback</h1>
              <p className="text-navy-600 mt-1">Review and manage client feedback</p>
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
              <ThumbsUp className={`w-4 h-4 lg:w-5 lg:h-5 ${metrics.nps >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className={`text-xl lg:text-2xl font-bold ${metrics.nps >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.nps}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-navy-600">New</span>
              <span className="w-4 h-4 lg:w-5 lg:h-5 bg-amber-500 rounded-full"></span>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-navy-900">{metrics.newCount}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs lg:text-sm text-navy-600">Critical</span>
              <span className="w-4 h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full"></span>
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

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search feedback, companies, or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-navy-500">Status:</span>
            {['all', 'pending', 'reviewed', 'actioned', 'archived'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  status === s
                    ? s === 'pending_review' ? 'bg-amber-600 text-white'
                      : s === 'reviewed' ? 'bg-blue-600 text-white'
                      : s === 'action_planned' ? 'bg-purple-600 text-white'
                      : s === 'implemented' ? 'bg-green-600 text-white'
                      : s === 'closed' ? 'bg-slate-600 text-white'
                      : 'bg-navy-900 text-white'
                    : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                {s === 'all' ? 'All' : 
                  s === 'pending_review' ? 'Pending' :
                  s === 'action_planned' ? 'Action Planned' :
                  s === 'implemented' ? 'Implemented' :
                  s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-navy-500">Type:</span>
            {['all', 'nps', 'csat', 'feature_request', 'support', 'general'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  type === t
                    ? 'bg-navy-900 text-white'
                    : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                {t === 'all' ? 'All' : getTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-navy-500">Priority:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  priority === p
                    ? p === 'critical' ? 'bg-red-600 text-white'
                      : p === 'high' ? 'bg-orange-600 text-white'
                      : p === 'medium' ? 'bg-amber-600 text-white'
                      : p === 'low' ? 'bg-green-600 text-white'
                      : 'bg-navy-900 text-white'
                    : 'bg-white text-navy-600 border border-slate-200 hover:bg-slate-50'
                )}
              >
                {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

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
            <Link
              key={item.id}
              href={`/admin/customers/feedback/${item.id}`}
              className="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-navy-600 rounded-full text-xs font-medium border border-slate-200">
                      {getTypeLabel(item.feedback_type?.category || 'general')}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-navy-900 mb-2">
                    {item.email_subject || getTypeLabel(item.feedback_type?.category || 'general')}
                  </h3>
                  
                  <p className="text-navy-600 text-sm line-clamp-2 mb-4">
                    {item.comments || item.email_content || 'No details provided'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-navy-400">
                      <Building2 className="w-4 h-4" />
                      {item.users?.company_name || item.company_name || 'Unknown Company'}
                    </span>
                    <span className="flex items-center gap-1 text-navy-400">
                      <Mail className="w-4 h-4" />
                      {item.users?.email}
                    </span>
                    <span className="flex items-center gap-1 text-navy-400">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(item.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {item.nps_score && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-navy-500">NPS:</span>
                      <span className={`text-lg font-bold ${
                        item.nps_score >= 9 ? 'text-green-600' :
                        item.nps_score >= 7 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {item.nps_score}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-navy-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && feedback.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No feedback found</h3>
          <p className="text-navy-600">
            {search ? 'Try adjusting your search or filters' : 'No client feedback has been submitted yet'}
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