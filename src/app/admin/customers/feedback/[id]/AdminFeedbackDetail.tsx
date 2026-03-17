// src/app/admin/customers/feedback/[id]/AdminFeedbackDetail.tsx
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
  Edit,
  Save,
  X,
  Send
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils/utils'
import toast from 'react-hot-toast'

interface FeedbackDetailProps {
  feedback: any // You can type this properly later
}

export default function AdminFeedbackDetail({ feedback: initialFeedback }: FeedbackDetailProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState(initialFeedback)
  const [isEditing, setIsEditing] = useState(false)
  const [status, setStatus] = useState(feedback.status)
  const [priority, setPriority] = useState(feedback.priority)
  const [adminResponse, setAdminResponse] = useState(feedback.admin_response || '')
  const [saving, setSaving] = useState(false)

  console.log('Initial feedback status: ', feedback.status)

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

  const handleSave = async () => {
    setSaving(true)
    try {
        console.log('Status being sent:', status);
        console.log('Status type:', typeof status);
        console.log('Priority being sent:', priority);
        console.log('Admin response being sent:', adminResponse);
        console.log('Feedback ID:', feedback.id);

        const payload = {
        status: status,
        priority: priority,
        admin_response: adminResponse
        };
        
        console.log('Full payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(`/api/admin/customers/feedback/${feedback.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
        })

        console.log('Response status:', response.status);
        
        // Get the response data ONCE
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
        // Use the already-parsed responseData for the error
        console.error('Error response:', responseData);
        throw new Error(responseData.error || 'Failed to update');
        }

        // Use the already-parsed responseData for success
        setFeedback(responseData);
        setIsEditing(false);
        toast.success('Feedback updated successfully');

        router.refresh();
    } catch (error) {
        console.error('Error updating feedback:', error);
        toast.error('Failed to update feedback');
    } finally {
        setSaving(false);
    }
    }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feedback List
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-navy-900 to-navy-800 border-b border-navy-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                getTypeColor(feedback.feedback_type?.category || 'general')
              )}>
                {getTypeIcon(feedback.feedback_type?.category || 'general')}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gold-500">
                  {feedback.feedback_type?.name || 'Feedback'} Details
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-navy-300">
                    <Calendar className="w-4 h-4" />
                    {format(parseISO(feedback.created_at), 'MMMM d, yyyy')}
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusBadge(feedback.status)
                  )}>
                    {getStatusLabel(feedback.status)}
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getPriorityBadge(feedback.priority)
                  )}>
                    {feedback.priority}
                  </span>
                </div>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5 text-navy-300 hover:text-gold-500" />
              </button>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-navy-400" />
              <span className="text-sm font-medium text-navy-700">
                {feedback.users?.company_name || feedback.company_name || 'Unknown Company'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-navy-400" />
              <a href={`mailto:${feedback.users?.email}`} className="text-sm text-navy-600 hover:text-gold-600">
                {feedback.users?.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-navy-400" />
              <span className="text-sm text-navy-600">
                {feedback.users?.full_name || feedback.client_name || 'No name provided'}
              </span>
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
              <h3 className="text-sm font-medium text-navy-500">NPS Score</h3>
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
              <h3 className="text-sm font-medium text-navy-500">CSAT Score</h3>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-6 h-6",
                      star <= feedback.csat_score! ? 'text-gold-500 fill-gold-500' : 'text-slate-300'
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Client's Message */}
            {(feedback.comments || feedback.email_content || feedback.response_text) && (
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-navy-500">Client's Message</h3>
                <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-navy-700 whitespace-pre-wrap">
                    {feedback.comments || feedback.email_content || feedback.response_text}
                </p>
                </div>
            </div>
            )}

            {/* Debug info - remove after fixing */}
            {process.env.NODE_ENV === 'development' && !feedback.comments && !feedback.email_content && !feedback.response_text && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium mb-2">No message found. Available fields:</p>
                <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify({
                    has_comments: !!feedback.comments,
                    has_email_content: !!feedback.email_content,
                    has_response_text: !!feedback.response_text,
                    feedback_type: feedback.feedback_type,
                    status: feedback.status
                }, null, 2)}
                </pre>
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

          {/* Edit Mode */}
          {isEditing && (
            <div className="space-y-4 border-t border-slate-200 pt-6">
              <h3 className="font-medium text-navy-900">Edit Feedback</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  >
                    <option value="pending_review">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="action_planned">Action Planned</option>
                    <option value="implemented">Implemented</option>
                    <option value="closed">Closed</option>

                  </select>
                </div>
    
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Admin Response
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                  placeholder="Add your response to the client..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setStatus(feedback.status)
                    setPriority(feedback.priority)
                    setAdminResponse(feedback.admin_response || '')
                  }}
                  className="px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Admin Response Display */}
          {!isEditing && feedback.admin_response && (
            <div className="border border-gold-200 rounded-lg p-4 bg-gold-50">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gold-600" />
                <h4 className="font-medium text-navy-900">Your Response</h4>
              </div>
              <p className="text-navy-700 whitespace-pre-wrap">
                {feedback.admin_response}
              </p>
              {feedback.responded_at && (
                <p className="text-xs text-navy-400 mt-2">
                  Responded on {format(parseISO(feedback.responded_at), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
          <p className="text-xs text-center text-navy-500">
            Feedback ID: {feedback.id}
          </p>
        </div>
      </div>
    </div>
  )
}