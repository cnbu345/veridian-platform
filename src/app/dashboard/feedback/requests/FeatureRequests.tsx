// src/app/dashboard/feedback/requests/FeatureRequests.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Lightbulb,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  X,
  Calendar,
  Filter,
  ChevronRight
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils/utils'
import toast from 'react-hot-toast'

interface FeatureRequest {
  id: string
  title: string
  description: string
  category: string
  status: 'submitted' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined'
  priority: 'low' | 'medium' | 'high' | 'critical'
  votes: number
  user_voted?: boolean
  admin_response?: string
  estimated_completion?: string
  created_at: string
  updated_at: string
}

export default function FeatureRequests() {
  const [requests, setRequests] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'feature'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/client/feedback/requests')
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      toast.error('Failed to load feature requests')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRequest.title || !newRequest.description) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/client/feedback/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      })

      if (!response.ok) throw new Error('Failed to submit request')

      toast.success('Feature request submitted!')
      setShowNewModal(false)
      setNewRequest({ title: '', description: '', category: 'feature' })
      fetchRequests()
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (requestId: string) => {
    try {
      const response = await fetch(`/api/client/feedback/requests/${requestId}/vote`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to vote')

      setRequests(prev => prev.map(r => 
        r.id === requestId 
          ? { ...r, votes: r.votes + 1, user_voted: true }
          : r
      ))
      toast.success('Vote recorded!')
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to record vote')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800 border-blue-200',
      under_review: 'bg-purple-100 text-purple-800 border-purple-200',
      planned: 'bg-amber-100 text-amber-800 border-amber-200',
      in_progress: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-green-600 text-white border-green-600',
      declined: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-800'
  }

  const filteredRequests = requests.filter(r => 
    filter === 'all' || r.status === filter
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
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Feature Requests</h1>
          <p className="text-navy-600">Suggest and vote on new features</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/25 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Suggest Feature
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
        >
          <option value="all">All Requests</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Lightbulb className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No feature requests</h3>
          <p className="text-navy-600 mb-6">Be the first to suggest a new feature</p>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700"
          >
            <Plus className="w-4 h-4" />
            Suggest Feature
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                    {request.priority === 'high' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200">
                        High Priority
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-navy-900 mb-2">
                    {request.title}
                  </h3>
                  
                  <p className="text-navy-600 mb-4">
                    {request.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-navy-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(request.created_at), 'MMM d, yyyy')}
                    </span>
                    {request.estimated_completion && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Est. {request.estimated_completion}
                      </span>
                    )}
                  </div>

                  {request.admin_response && (
                    <div className="mt-4 p-3 bg-gold-50 rounded-lg">
                      <p className="text-sm text-gold-800">
                        <span className="font-medium">Response: </span>
                        {request.admin_response}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleVote(request.id)}
                    disabled={request.user_voted}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg transition-colors min-w-[60px]",
                      request.user_voted
                        ? "bg-gold-100 text-gold-600 cursor-default"
                        : "bg-slate-50 hover:bg-gold-50 text-navy-600 hover:text-gold-600"
                    )}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm font-bold mt-1">{request.votes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy-900">Suggest a Feature</h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="Brief description of the feature"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  rows={4}
                  placeholder="Detailed explanation of the feature and how it would help your compliance needs"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Category
                </label>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                >
                  <option value="feature">New Feature</option>
                  <option value="improvement">Improvement</option>
                  <option value="integration">Integration</option>
                  <option value="report">Report Type</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}