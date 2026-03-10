// src/app/admin/blog/comments/BlogCommentsClient.tsx - Comments Management
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Filter, Check, X, Trash2,
  MessageCircle, User, Calendar, ExternalLink,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  post_id: string
  user_id: string | null
  author_name: string | null
  author_email: string | null
  content: string
  is_approved: boolean
  created_at: string
  post: {
    title: string
    slug: string
  } | null
  user: {
    full_name: string | null
    email: string
  } | null
}

interface Props {
  initialComments: Comment[]
}

export default function BlogCommentsClient({ initialComments }: Props) {
  const [comments, setComments] = useState(initialComments)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blog/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: true })
      })

      if (!response.ok) throw new Error('Failed to approve comment')

      setComments(prev => prev.map(c => 
        c.id === id ? { ...c, is_approved: true } : c
      ))
      toast.success('Comment approved')
    } catch (error) {
      console.error('Error approving comment:', error)
      toast.error('Failed to approve comment')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blog/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: false })
      })

      if (!response.ok) throw new Error('Failed to reject comment')

      setComments(prev => prev.map(c => 
        c.id === id ? { ...c, is_approved: false } : c
      ))
      toast.success('Comment rejected')
    } catch (error) {
      console.error('Error rejecting comment:', error)
      toast.error('Failed to reject comment')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/admin/blog/comments/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      setComments(prev => prev.filter(c => c.id !== id))
      toast.success('Comment deleted')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const filteredComments = comments.filter(comment => {
    if (filter === 'approved' && !comment.is_approved) return false
    if (filter === 'pending' && comment.is_approved) return false
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return comment.content.toLowerCase().includes(term) ||
             comment.author_name?.toLowerCase().includes(term) ||
             comment.author_email?.toLowerCase().includes(term) ||
             comment.post?.title.toLowerCase().includes(term)
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 mb-1">Blog Comments</h1>
        <p className="text-navy-600">Manage comments on your blog posts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === 'all' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600 hover:text-navy-900'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === 'pending' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600 hover:text-navy-900'
              )}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === 'approved' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600 hover:text-navy-900'
              )}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {filteredComments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No comments found</h3>
            <p className="text-navy-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No comments have been submitted yet'}
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                      comment.is_approved
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {comment.is_approved ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <p className="text-navy-700 mb-3">{comment.content}</p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-navy-500">
                      <User className="w-4 h-4" />
                      <span>{comment.author_name || comment.user?.full_name || 'Anonymous'}</span>
                    </div>
                    {comment.author_email && (
                      <span className="text-navy-400">{comment.author_email}</span>
                    )}
                    <div className="flex items-center gap-1 text-navy-400">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(comment.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {/* Post Link */}
                  {comment.post && (
                    <Link
                      href={`/blog/${comment.post.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sm text-gold-600 hover:text-gold-700 mt-2"
                    >
                      View on post: {comment.post.title}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {!comment.is_approved && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {comment.is_approved && (
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}