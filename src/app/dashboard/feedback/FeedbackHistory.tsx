// src/app/dashboard/feedback/FeedbackHistory.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  Building2,
  User,
  X
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
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
}

export default function FeedbackHistory() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchFeedback()
  }, [filter])

  const fetchFeedback = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('type', filter)
      }
      
      const response = await fetch(`/api/client/feedback?${params}`)
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
      nps: 'NPS Survey',
      csat: 'CSAT Survey',
      feature_request: 'Feature Request',
      support: 'Support Feedback',
      general: 'General Feedback',
      account_review: 'Account Review'
    }
    return types[type] || type.replace('_', ' ')
  }

  // NEW: Client-friendly status mapping
  const getClientFriendlyStatus = (status: string): { label: string; description: string; color: string } => {
    const statusMap: Record<string, { label: string; description: string; color: string }> = {
      pending_review: { 
        label: 'Received', 
        description: 'We\'ve received your feedback and are reviewing it',
        color: 'bg-amber-100 text-amber-800 border-amber-200'
      },
      reviewed: { 
        label: 'Under Review', 
        description: 'Our team is evaluating your feedback',
        color: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      action_planned: { 
        label: 'Action Planned', 
        description: 'We\'ve planned next steps based on your input',
        color: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      implemented: { 
        label: 'Completed', 
        description: 'Changes have been implemented',
        color: 'bg-green-100 text-green-800 border-green-200'
      },
      closed: { 
        label: 'Closed', 
        description: 'This feedback thread is now closed',
        color: 'bg-slate-100 text-slate-800 border-slate-200'
      }
    }
    
    // Default fallback for any unknown status
    return statusMap[status] || { 
      label: status.replace('_', ' '), 
      description: '',
      color: 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  // NEW: Priority mapping with client-friendly labels
  const getPriorityInfo = (priority: string): { label: string; color: string } => {
    const priorityMap: Record<string, { label: string; color: string }> = {
      critical: { 
        label: 'Critical', 
        color: 'bg-red-100 text-red-800 border-red-200'
      },
      high: { 
        label: 'High Priority', 
        color: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      medium: { 
        label: 'Medium Priority', 
        color: 'bg-amber-100 text-amber-800 border-amber-200'
      },
      low: { 
        label: 'Low Priority', 
        color: 'bg-green-100 text-green-800 border-green-200'
      }
    }
    return priorityMap[priority] || { 
      label: priority, 
      color: 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  // Keep this for backward compatibility during transition
  const getStatusBadge = (status: string) => {
    return getClientFriendlyStatus(status).color
  }

  const getStatusLabel = (status: string): string => {
    return getClientFriendlyStatus(status).label
  }

  const getPriorityBadge = (priority: string) => {
    return getPriorityInfo(priority).color
  }

  const filteredFeedback = feedback

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
            <option value="nps">NPS Surveys</option>
            <option value="csat">CSAT Surveys</option>
            <option value="feature_request">Feature Requests</option>
            <option value="support">Support Feedback</option>
            <option value="general">General Feedback</option>
            <option value="account_review">Account Reviews</option>
          </select>
          
          <span className="text-sm text-navy-500">
            {feedback.length} {feedback.length === 1 ? 'item' : 'items'}
          </span>
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
          {filteredFeedback.map((item) => {
            const statusInfo = getClientFriendlyStatus(item.status)
            const priorityInfo = getPriorityInfo(item.priority)
            
            return (
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
                      {/* Status Badge with hover tooltip for description */}
                      <div className="relative group">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {statusInfo.description && (
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-navy-900 text-white text-xs rounded-lg shadow-lg z-10">
                            {statusInfo.description}
                          </div>
                        )}
                      </div>
                      
                      {/* Priority Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityInfo.color}`}>
                        {priorityInfo.label}
                      </span>
                      
                      {/* Type Badge */}
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

                    {item.csat_score && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-navy-500">CSAT Score:</span>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-4 h-4",
                                star <= item.csat_score! ? 'text-gold-500 fill-gold-500' : 'text-slate-300'
                              )}
                            />
                          ))}
                        </div>
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
                      {item.company_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {item.company_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-navy-400" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Feedback Detail Modal */}
      {showDetails && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-navy-900">
              <h2 className="text-xl font-semibold text-gold-500">Feedback Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gold-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gold-500 text-lx hover:text-navy-900"/>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <div className="relative group">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getClientFriendlyStatus(selectedFeedback.status).color}`}>
                    {getClientFriendlyStatus(selectedFeedback.status).label}
                  </span>
                  {getClientFriendlyStatus(selectedFeedback.status).description && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-navy-900 text-white text-xs rounded-lg shadow-lg">
                      {getClientFriendlyStatus(selectedFeedback.status).description}
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityInfo(selectedFeedback.priority).color}`}>
                  {getPriorityInfo(selectedFeedback.priority).label}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-navy-600 rounded-full text-xs font-medium border border-slate-200">
                  {getTypeLabel(selectedFeedback.feedback_type?.category || 'general')}
                </span>
              </div>

              {/* Subject */}
              <div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">
                  {selectedFeedback.email_subject || getTypeLabel(selectedFeedback.feedback_type?.category || 'general')}
                </h3>
                <p className="text-sm text-navy-500">
                  Submitted on {format(parseISO(selectedFeedback.created_at), 'MMMM d, yyyy')}
                </p>
                {selectedFeedback.company_name && (
                  <p className="text-sm text-navy-500 mt-1">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    {selectedFeedback.company_name}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-navy-700 whitespace-pre-wrap">
                  {selectedFeedback.comments || selectedFeedback.email_content || 'No details provided'}
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

              {/* CSAT Score */}
              {selectedFeedback.csat_score && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-navy-700 mb-2">CSAT Score</p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-6 h-6",
                          star <= selectedFeedback.csat_score! ? 'text-gold-500 fill-gold-500' : 'text-slate-300'
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Feature Category */}
              {selectedFeedback.feature_category && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-navy-700 mb-2">Category</p>
                  <p className="text-navy-700 capitalize">{selectedFeedback.feature_category}</p>
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