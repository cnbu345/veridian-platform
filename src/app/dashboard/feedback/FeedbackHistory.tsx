// src/app/dashboard/feedback/FeedbackHistory.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  Building2,
  User,
  FileText,
  Send,
  ExternalLink
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils/utils'

interface Feedback {
  id: string
  feedback_type: string
  feedback_status: string
  priority: string
  email_subject: string
  email_content: string
  nps_score?: number
  csat_score?: number
  feature_category?: string
  admin_response?: string
  responded_at?: string
  created_at: string
}

export default function FeedbackHistory() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/client/feedback')
      const data = await response.json()
      setFeedback(data.feedback || [])
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      nps_quarterly: 'Quarterly Strategic Review',
      csat_post_interaction: 'Service Feedback',
      feature_request: 'Feature Suggestion',
      support_feedback: 'Support Experience',
      general_feedback: 'General Feedback',
      account_review: 'Account Review'
    }
    return types[type] || type.replace('_', ' ')
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
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return styles[priority] || 'bg-slate-100 text-slate-800'
  }

  const filteredFeedback = feedback.filter(f => 
    filter === 'all' || f.feedback_type === filter
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Feedback History</h1>
          <p className="text-navy-600">Track your feedback and our responses</p>
        </div>
        <Link
          href="/dashboard/feedback/new"
          className="px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/25 flex items-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Provide Feedback
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
          >
            <option value="all">All Feedback</option>
            <option value="nps_quarterly">Quarterly Reviews</option>
            <option value="feature_request">Feature Requests</option>
            <option value="support_feedback">Support Feedback</option>
            <option value="account_review">Account Reviews</option>
          </select>
          
          <button className="px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No feedback found</h3>
          <p className="text-navy-600 mb-6">Share your thoughts to help us improve</p>
          <Link
            href="/dashboard/feedback/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700"
          >
            Provide Feedback
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedFeedback(item)
                setShowDetails(true)
              }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(item.feedback_status)}`}>
                      {item.feedback_status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-navy-600 rounded-full text-xs font-medium border border-slate-200">
                      {getTypeLabel(item.feedback_type)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-navy-900 mb-2">
                    {item.email_subject}
                  </h3>
                  
                  <p className="text-navy-600 text-sm line-clamp-2 mb-4">
                    {item.email_content}
                  </p>

                  {item.nps_score && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-navy-500">NPS Score:</span>
                      <span className={`text-lg font-bold ${
                        item.nps_score >= 9 ? 'text-green-600' :
                        item.nps_score >= 7 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {item.nps_score}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-navy-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(item.created_at), 'MMM d, yyyy')}
                    </span>
                    {item.responded_at && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Responded {format(parseISO(item.responded_at), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-navy-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Detail Modal */}
      {showDetails && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-navy-900">Feedback Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedFeedback.feedback_status)}`}>
                  {selectedFeedback.feedback_status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(selectedFeedback.priority)}`}>
                  {selectedFeedback.priority}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-navy-600 rounded-full text-xs font-medium border border-slate-200">
                  {getTypeLabel(selectedFeedback.feedback_type)}
                </span>
              </div>

              {/* Subject */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">
                  {selectedFeedback.email_subject}
                </h3>
                <p className="text-sm text-navy-500">
                  Submitted on {format(parseISO(selectedFeedback.created_at), 'MMMM d, yyyy')}
                </p>
              </div>

              {/* Content */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-navy-700 whitespace-pre-wrap">
                  {selectedFeedback.email_content}
                </p>
              </div>

              {/* NPS Score */}
              {selectedFeedback.nps_score && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-navy-700 mb-2">NPS Score</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-bold ${
                      selectedFeedback.nps_score >= 9 ? 'text-green-600' :
                      selectedFeedback.nps_score >= 7 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {selectedFeedback.nps_score}
                    </span>
                    <span className="text-sm text-navy-500">/10</span>
                  </div>
                </div>
              )}

              {/* Admin Response */}
              {selectedFeedback.admin_response && (
                <div className="border border-gold-200 rounded-lg p-4 bg-gold-50">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gold-600" />
                    <h4 className="font-medium text-navy-900">Response from Veridian</h4>
                  </div>
                  <p className="text-navy-700 whitespace-pre-wrap">
                    {selectedFeedback.admin_response}
                  </p>
                  {selectedFeedback.responded_at && (
                    <p className="text-xs text-navy-400 mt-2">
                      Responded on {format(parseISO(selectedFeedback.responded_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}