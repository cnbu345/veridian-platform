// src/app/admin/customers/feedback/components/FeedbackCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Mail,
  Building2,
  Tag,
  Flag,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

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

interface FeedbackCardProps {
  feedback: Feedback
  onStatusChange?: (id: string, status: string) => void
}

export default function FeedbackCard({ feedback, onStatusChange }: FeedbackCardProps) {
  const [showActions, setShowActions] = useState(false)

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'nps':
        return <Star className="w-4 h-4" />
      case 'csat':
        return <ThumbsUp className="w-4 h-4" />
      case 'bug_report':
        return <AlertCircle className="w-4 h-4" />
      case 'feature_request':
        return <Flag className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'reviewed':
        return 'bg-amber-100 text-amber-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'actioned':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return 'text-green-600'
    if (rating >= 7) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Left side - Main content */}
        <div className="flex-1">
          {/* Header with company and status */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <Link 
                href={`/admin/customers/${feedback.user_id}`}
                className="text-lg font-semibold text-navy-900 hover:text-gold-600"
              >
                {feedback.users.company_name || 'Unknown Company'}
              </Link>
              <div className="flex items-center gap-2 text-sm text-navy-500 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {feedback.users.email}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                {feedback.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(feedback.priority)}`}>
                {feedback.priority}
              </span>
            </div>
          </div>

          {/* Feedback meta */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-xs text-navy-600">
              {getTypeIcon(feedback.feedback_type)}
              {feedback.feedback_type.replace('_', ' ')}
            </span>
            
            {feedback.rating !== null && (
              <span className={`flex items-center gap-1 text-sm font-medium ${getRatingColor(feedback.rating)}`}>
                <Star className="w-4 h-4 fill-current" />
                {feedback.rating}
              </span>
            )}
            
            <span className="flex items-center gap-1 text-xs text-navy-400">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(feedback.created_at).toLocaleDateString()}
            </span>

            <span className="text-xs text-navy-400 capitalize">
              via {feedback.source.replace('_', ' ')}
            </span>
          </div>

          {/* Feedback comment */}
          {feedback.comment && (
            <div className="bg-slate-50 rounded-lg p-4 mb-3">
              <p className="text-navy-700 italic">"{feedback.comment}"</p>
            </div>
          )}

          {/* Category and tags */}
          <div className="flex flex-wrap items-center gap-2">
            {feedback.category && (
              <span className="flex items-center gap-1 px-2 py-1 bg-gold-50 text-gold-700 rounded-full text-xs">
                <Tag className="w-3 h-3" />
                {feedback.category}
              </span>
            )}
            {feedback.tags?.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-slate-100 text-navy-600 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex lg:flex-col items-center gap-2 lg:min-w-[120px]">
          <Link
            href={`/admin/customers/feedback/${feedback.id}`}
            className="w-full px-4 py-2 bg-gold-600 text-white rounded-lg text-sm font-medium hover:bg-gold-700 text-center"
          >
            View Details
          </Link>
          
          {onStatusChange && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-navy-400 hover:text-navy-600 hover:bg-slate-100 rounded-lg"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 lg:left-0 mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onStatusChange(feedback.id, 'pending_review')
                        setShowActions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-navy-600 hover:bg-slate-50"
                    >
                      Mark as Pending Review
                    </button>
                    <button
                      onClick={() => {
                        onStatusChange(feedback.id, 'reviewed')
                        setShowActions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-navy-600 hover:bg-slate-50"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => {
                        onStatusChange(feedback.id, 'action_planned')
                        setShowActions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-navy-600 hover:bg-slate-50"
                    >
                      Mark as Action Planned
                    </button>
                    <button
                      onClick={() => {
                        onStatusChange(feedback.id, 'implemented')
                        setShowActions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-navy-600 hover:bg-slate-50"
                    >
                      Mark as Implemented
                    </button>
                    <div className="border-t border-slate-100"></div>
                    <button
                      onClick={() => {
                        onStatusChange(feedback.id, 'closed')
                        setShowActions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}