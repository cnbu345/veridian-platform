// src/app/dashboard/feedback/[id]/ClientFeedbackDetail.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  Lightbulb,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  User,
  Building2,
  X
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils/utils'

interface FeedbackDetailProps {
  feedback: any
}

export default function ClientFeedbackDetail({ feedback }: FeedbackDetailProps) {
  const router = useRouter()

  const getTypeIcon = (category: string) => {
    switch(category) {
      case 'nps': return <Star className="w-6 h-6" />
      case 'csat': return <ThumbsUp className="w-6 h-6" />
      case 'feature_request': return <Lightbulb className="w-6 h-6" />
      default: return <MessageSquare className="w-6 h-6" />
    }
  }

  const getTypeColor = (category: string) => {
    switch(category) {
      case 'nps': return 'bg-purple-100 text-purple-700'
      case 'csat': return 'bg-green-100 text-green-700'
      case 'feature_request': return 'bg-amber-100 text-amber-700'
      case 'support': return 'bg-blue-100 text-blue-700'
      default: return 'bg-slate-100 text-slate-700'
    }
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

  const getClientFriendlyStatus = (status: string): { label: string; description: string } => {
    const map: Record<string, { label: string; description: string }> = {
      pending_review: { 
        label: 'Received', 
        description: 'We\'ve received your feedback and are reviewing it' 
      },
      reviewed: { 
        label: 'Under Review', 
        description: 'Our team is evaluating your feedback' 
      },
      action_planned: { 
        label: 'Action Planned', 
        description: 'We\'ve planned next steps based on your input' 
      },
      implemented: { 
        label: 'Completed', 
        description: 'Changes have been implemented' 
      },
      closed: { 
        label: 'Closed', 
        description: 'This feedback thread is now closed' 
      }
    }
    return map[status] || { label: status, description: '' }
  }

  const statusInfo = getClientFriendlyStatus(feedback.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feedback History
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-navy-900 to-navy-800 border-b border-navy-700">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center",
              getTypeColor(feedback.feedback_type?.category || 'general')
            )}>
              {getTypeIcon(feedback.feedback_type?.category || 'general')}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gold-500 mb-2">
                {feedback.feedback_type?.name || 'Feedback'} Details
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-navy-300">
                  <Calendar className="w-4 h-4" />
                  {format(parseISO(feedback.created_at), 'MMMM d, yyyy')}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  getStatusBadge(feedback.status)
                )}>
                  {getStatusLabel(feedback.status)}
                </span>
              </div>
              {/* Status description tooltip */}
              <p className="text-sm text-navy-300 mt-2 italic">
                {statusInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Subject */}
          {feedback.email_subject && (
            <div>
              <h3 className="text-sm font-medium text-navy-500 mb-2">Subject</h3>
              <p className="text-lg text-navy-900">{feedback.email_subject}</p>
            </div>
          )}

          {/* NPS Score */}
          {feedback.nps_score && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-navy-500">Your NPS Score</h3>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-3xl font-bold",
                  feedback.nps_score >= 9 ? 'text-green-600' :
                  feedback.nps_score >= 7 ? 'text-amber-600' :
                  'text-red-600'
                )}>
                  {feedback.nps_score}/10
                </span>
                <span className="text-sm text-navy-500">
                  ({feedback.nps_score >= 9 ? 'Promoter' : 
                    feedback.nps_score >= 7 ? 'Passive' : 'Detractor'})
                </span>
              </div>
            </div>
          )}

          {/* CSAT Score */}
          {feedback.csat_score && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-navy-500">Your CSAT Score</h3>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-8 h-8",
                      star <= feedback.csat_score! ? 'text-gold-500 fill-gold-500' : 'text-slate-300'
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Your Message */}
          {(feedback.comments || feedback.email_content) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-navy-500">Your Message</h3>
              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-navy-700 whitespace-pre-wrap">
                  {feedback.comments || feedback.email_content}
                </p>
              </div>
            </div>
          )}

          {/* Feature Category */}
          {feedback.feature_category && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-navy-500">Category</h3>
              <span className="inline-flex px-3 py-1 bg-gold-50 text-gold-700 rounded-full text-sm">
                {feedback.feature_category}
              </span>
            </div>
          )}

          {/* Admin Response */}
          {feedback.admin_response && (
            <div className="border border-gold-200 rounded-lg p-6 bg-gold-50">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-gold-600" />
                <h3 className="font-medium text-navy-900">Response from Veridian</h3>
              </div>
              <p className="text-navy-700 whitespace-pre-wrap">
                {feedback.admin_response}
              </p>
              {feedback.responded_at && (
                <p className="text-xs text-navy-400 mt-3">
                  Responded on {format(parseISO(feedback.responded_at), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
          )}

          {/* Priority indicator */}
          {(feedback.priority === 'high' || feedback.priority === 'critical') && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">
                  {feedback.priority === 'critical' ? 'Critical Priority' : 'High Priority'}
                </p>
                <p className="text-sm text-red-600">
                  Our team is reviewing this urgently
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-center text-navy-500">
            Thank you for helping us improve Veridian Group. Your feedback is valuable to us.
          </p>
        </div>
      </div>
    </div>
  )
}