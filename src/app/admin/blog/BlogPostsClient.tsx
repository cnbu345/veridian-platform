// src/app/admin/blog/BlogPostsClient.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Calendar, User, Tag, Filter, ChevronRight,
  Star, Clock, Globe, MoreVertical, Copy,
  CheckCircle, XCircle, AlertCircle, FileText,
  Archive, BookOpen, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  views: number
  is_featured: boolean
  created_at: string
  author: {
    full_name: string | null
    email: string
  } | null
  category: {
    name: string
    slug: string
    color: string
  } | null
}

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

interface Props {
  initialPosts: BlogPost[]
  categories: Category[]
}

const STATUS_COLORS = {
  draft: 'bg-slate-200 text-slate-800 border-slate-300',
  published: 'bg-green-200 text-green-800 border-green-300',
  archived: 'bg-amber-200 text-amber-800 border-amber-300'
}

const STATUS_ICONS = {
  draft: EyeOff,
  published: Globe,
  archived: Archive
}

const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived'
}

const CATEGORY_COLORS: Record<string, string> = {
  blue: 'bg-blue-200 text-blue-800 border-blue-300',
  green: 'bg-green-200 text-green-800 border-green-300',
  purple: 'bg-purple-200 text-purple-800 border-purple-300',
  orange: 'bg-orange-200 text-orange-800 border-orange-300',
  gold: 'bg-amber-200 text-amber-800 border-amber-300',
  red: 'bg-red-200 text-red-800 border-red-300'
}

export default function BlogPostsClient({ initialPosts, categories }: Props) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete post')

      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success('Post deleted successfully')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !current })
      })

      if (!response.ok) throw new Error('Failed to update post')

      setPosts(prev => prev.map(p => 
        p.id === id ? { ...p, is_featured: !current } : p
      ))
      toast.success(current ? 'Removed from featured' : 'Added to featured')
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to update post')
    }
  }

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'published' ? 'draft' : 'published'
    
    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update post')

      setPosts(prev => prev.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ))
      toast.success(newStatus === 'published' ? 'Post published' : 'Post unpublished')
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Failed to update post')
    }
  }

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      })

      if (!response.ok) throw new Error('Failed to archive post')

      setPosts(prev => prev.map(p => 
        p.id === id ? { ...p, status: 'archived' } : p
      ))
      toast.success('Post archived')
    } catch (error) {
      console.error('Error archiving post:', error)
      toast.error('Failed to archive post')
    }
  }

  const filteredPosts = posts.filter(post => {
    if (statusFilter !== 'all' && post.status !== statusFilter) return false
    if (categoryFilter !== 'all' && post.category?.slug !== categoryFilter) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return post.title.toLowerCase().includes(term) ||
             post.excerpt?.toLowerCase().includes(term) ||
             post.author?.full_name?.toLowerCase().includes(term)
    }
    return true
  })

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-1">Blog Posts</h1>
          <p className="text-navy-600">Manage your blog content and publications</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-base font-medium"
        >
          <Plus className="w-5 h-5" />
          New Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Total Posts</p>
          <p className="text-2xl font-bold text-navy-900">{posts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {posts.filter(p => p.status === 'published').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Drafts</p>
          <p className="text-2xl font-bold text-amber-600">
            {posts.filter(p => p.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Featured</p>
          <p className="text-2xl font-bold text-gold-600">
            {posts.filter(p => p.is_featured).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-base"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white text-base"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white text-base"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-semibold text-navy-700 uppercase tracking-wider py-4 px-6">
                  Title
                </th>
                <th className="text-left text-xs font-semibold text-navy-700 uppercase tracking-wider py-4 px-6">
                  Author
                </th>
                <th className="text-left text-xs font-semibold text-navy-700 uppercase tracking-wider py-4 px-6">
                  Category
                </th>
                <th className="text-left text-xs font-semibold text-navy-700 uppercase tracking-wider py-4 px-6">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-navy-700 uppercase tracking-wider py-4 px-6">
                  Date
                </th>
                <th className="text-left text-xs font-semibold text-navy-700 uppercase tracking-wider py-4 px-6">
                  Views
                </th>
                <th className="text-right text-xs font-semibold text-navy-700 uppercase tracking-wider py-4 px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-16 h-16 text-slate-300 mb-4" />
                      <p className="text-lg text-navy-600 mb-2">No posts found</p>
                      <p className="text-sm text-navy-400 mb-4">
                        {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Get started by creating your first blog post'}
                      </p>
                      {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') ? (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setCategoryFilter('all')
                          }}
                          className="text-gold-600 hover:text-gold-700 font-medium"
                        >
                          Clear filters
                        </button>
                      ) : (
                        <Link
                          href="/admin/blog/new"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Create your first post
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => {
                  const StatusIcon = STATUS_ICONS[post.status]
                  
                  return (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="max-w-xs">
                          <div className="font-semibold text-navy-900 mb-1 flex items-center gap-2 text-base">
                            {post.title}
                            {post.is_featured && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-200 text-gold-800 rounded-full text-xs font-medium">
                                <Star className="w-3 h-3" />
                                Featured
                              </span>
                            )}
                          </div>
                          {post.excerpt && (
                            <p className="text-sm text-navy-500 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-navy-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-navy-900">
                              {post.author?.full_name || 'Unknown'}
                            </div>
                            <div className="text-xs text-navy-500">
                              {post.author?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {post.category && (
                          <span className={cn(
                            "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium",
                            CATEGORY_COLORS[post.category.color]
                          )}>
                            {post.category.name}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                          STATUS_COLORS[post.status]
                        )}>
                          <StatusIcon className="w-4 h-4" />
                          {STATUS_LABELS[post.status]}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-navy-600">
                          <Calendar className="w-4 h-4 text-navy-400" />
                          <span>
                            {post.published_at 
                              ? format(new Date(post.published_at), 'MMM d, yyyy')
                              : format(new Date(post.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-navy-600">
                          <Eye className="w-4 h-4 text-navy-400" />
                          <span className="font-medium">{post.views}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {/* Featured Toggle */}
                          <button
                            onClick={() => handleToggleFeatured(post.id, post.is_featured)}
                            className={cn(
                              "w-10 h-10 rounded-lg transition-colors group relative flex items-center justify-center",
                              post.is_featured
                                ? "bg-gold-200 text-gold-800 hover:bg-gold-300"
                                : "bg-slate-200 text-navy-700 hover:bg-gold-200 hover:text-gold-800"
                            )}
                            title={post.is_featured ? "Remove from featured" : "Add to featured"}
                          >
                            <Star className={cn("w-5 h-5", post.is_featured && "fill-current")} />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-navy-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              {post.is_featured ? 'Unfeature' : 'Feature'}
                            </span>
                          </button>

                          {/* Publish/Unpublish Toggle */}
                          <button
                            onClick={() => handleToggleStatus(post.id, post.status)}
                            className={cn(
                              "w-10 h-10 rounded-lg transition-colors group relative flex items-center justify-center",
                              post.status === 'published'
                                ? "bg-green-200 text-green-800 hover:bg-green-300"
                                : "bg-amber-200 text-amber-800 hover:bg-amber-300"
                            )}
                            title={post.status === 'published' ? "Unpublish" : "Publish"}
                          >
                            {post.status === 'published' ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Globe className="w-5 h-5" />
                            )}
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-navy-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              {post.status === 'published' ? 'Unpublish' : 'Publish'}
                            </span>
                          </button>

                          {/* Archive Button (only for non-archived) */}
                          {post.status !== 'archived' && (
                            <button
                              onClick={() => handleArchive(post.id)}
                              className="w-10 h-10 bg-slate-200 text-navy-700 rounded-lg hover:bg-amber-200 hover:text-amber-800 transition-colors group relative flex items-center justify-center"
                              title="Archive"
                            >
                              <Archive className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-navy-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Archive
                              </span>
                            </button>
                          )}

                          {/* Edit Button */}
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="w-10 h-10 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 transition-colors group relative flex items-center justify-center"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-navy-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              Edit
                            </span>
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="w-10 h-10 bg-red-200 text-red-800 rounded-lg hover:bg-red-300 transition-colors group relative flex items-center justify-center"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-navy-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              Delete
                            </span>
                          </button>

                          {/* View/Preview Button */}
                          {post.status === 'published' ? (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="w-10 h-10 bg-slate-200 text-navy-700 rounded-lg hover:bg-gold-200 hover:text-gold-800 transition-colors group relative flex items-center justify-center"
                              title="View live post"
                            >
                              <ExternalLink className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-navy-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                View Live
                              </span>
                            </Link>
                          ) : (
                            <Link
                              href={`/admin/blog/preview/${post.id}`}
                              target="_blank"
                              className="w-10 h-10 bg-slate-200 text-navy-700 rounded-lg hover:bg-gold-200 hover:text-gold-800 transition-colors group relative flex items-center justify-center"
                              title="Preview draft"
                            >
                              <Eye className="w-5 h-5" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-navy-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Preview Draft
                              </span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      {filteredPosts.length > 0 && (
        <div className="flex items-center justify-between text-sm text-navy-500">
          <p>
            Showing {filteredPosts.length} of {posts.length} posts
          </p>
          {filteredPosts.length < posts.length && (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setCategoryFilter('all')
              }}
              className="text-gold-600 hover:text-gold-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}