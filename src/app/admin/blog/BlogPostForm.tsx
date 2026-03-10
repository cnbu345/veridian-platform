'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Save, X, ArrowLeft, Image as ImageIcon,
  Tag, FolderOpen, Globe, Eye, EyeOff,
  Star, Calendar, Clock, Link as LinkIcon,
  FileText, AlertCircle, CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'  // <-- THIS IS CORRECT
import Link from 'next/link'
import toast from 'react-hot-toast'
import WysiwygEditor from '@/components/editor/WysiwygEditor'
import RichTextEditor from '@/components/editor/RichTextEditor'
import TipTapEditor from '@/components/editor/TipTapEditor'
import ImageUpload from '@/components/upload/ImageUpload'

interface Category {
  id: string
  name: string
  slug: string
  color: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  category_id: string | null
  status: 'draft' | 'published' | 'archived'
  tags: string[] | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  is_featured: boolean
  allow_comments: boolean
}

interface Props {
  post?: BlogPost
  categories: Category[]
}

export default function BlogPostForm({ post, categories }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showMeta, setShowMeta] = useState(false)
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    featured_image: post?.featured_image || '',
    category_id: post?.category_id || '',
    status: post?.status || 'draft',
    tags: post?.tags?.join(', ') || '',
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    meta_keywords: post?.meta_keywords || '',
    is_featured: post?.is_featured || false,
    allow_comments: post?.allow_comments ?? true
  })

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleSubmit = async (publish: boolean = false) => {
    // Validate required fields
    if (!formData.title) {
      toast.error('Title is required')
      return
    }
    if (!formData.slug) {
      toast.error('Slug is required')
      return
    }
    if (!formData.content) {
      toast.error('Content is required')
      return
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(formData.slug)) {
      toast.error('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }

    try {
      setSaving(true)

      // Process tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const payload = {
        ...formData,
        tags: tagsArray,
        status: publish ? 'published' : formData.status,
        published_at: publish ? new Date().toISOString() : post?.published_at
      }

      const url = post 
        ? `/api/admin/blog/posts/${post.id}`
        : '/api/admin/blog/posts'
      
      const method = post ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save post')
      }

      toast.success(post ? 'Post updated' : 'Post created')
      router.push('/admin/blog')
      router.refresh()
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-navy-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">
            {post ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-navy-600">
            {post ? 'Update your blog post' : 'Write a new blog post'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Slug - NOW VISIBLE TOGETHER */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  className="w-full px-4 py-3 text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-post-title"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
                <p className="text-xs text-navy-400 mt-1">
                  Auto-generated from title. Edit if needed (lowercase, hyphens only).
                </p>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Content *
            </label>
            <TipTapEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Write your blog post content here..."
              height="600px"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief summary of your post (optional)"
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
            <p className="text-xs text-navy-400 mt-1">
              If left blank, will be auto-generated from content
            </p>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Publish Box */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-navy-900">Publish</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-600">Status</span>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {post?.published_at && (
                <div className="flex items-center gap-2 text-sm text-navy-500">
                  <Calendar className="w-4 h-4" />
                  <span>Published: {new Date(post.published_at).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Category
              </h3>
            </div>
            <div className="p-4">
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
              >
                <option value="">Uncategorized</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Featured Image
              </h3>
            </div>
            <div className="p-4">
              <ImageUpload
                value={formData.featured_image}
                onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
              />
              <p className="text-xs text-navy-400 mt-2">
                Recommended size: 1200 x 630 pixels
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
              <p className="text-xs text-navy-400 mt-1">
                Comma-separated tags
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-navy-900">Options</h3>
            </div>
            <div className="p-4 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-4 h-4 text-gold-600 rounded border-slate-300 focus:ring-gold-500"
                />
                <span className="text-sm text-navy-700">Feature this post</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.allow_comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, allow_comments: e.target.checked }))}
                  className="w-4 h-4 text-gold-600 rounded border-slate-300 focus:ring-gold-500"
                />
                <span className="text-sm text-navy-700">Allow comments</span>
              </label>
            </div>
          </div>

          {/* SEO Meta */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setShowMeta(!showMeta)}
              className="w-full p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors"
            >
              <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                SEO Meta
              </h3>
              {showMeta ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            {showMeta && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO title (optional)"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO description (optional)"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-600 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                    placeholder="keyword1, keyword2"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}