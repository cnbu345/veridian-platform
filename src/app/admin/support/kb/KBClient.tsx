// // src/app/admin/support/kb/KBClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Edit2, Trash2, Save, X, Eye, EyeOff,
  FolderOpen, FileText, Tag, ChevronRight, Filter,
  Star, TrendingUp, Calendar, Copy, Check, AlertCircle,
  Upload, Image, Link2, Bold, Italic, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Code
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import WysiwygEditor from '@/components/editor/WysiwygEditor'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  article_count?: number
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  views: number
  helpful_count: number
  not_helpful_count: number
  is_published: boolean
  is_featured: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
  category_id: string | null
  category?: {
    name: string
    slug: string
  } | null
}

interface ArticleFormData {
  title: string
  slug: string
  content: string
  excerpt: string
  category_id: string
  tags: string
  is_published: boolean
  is_featured: boolean
}

export default function KBClient() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'FileText',
    is_active: true
  })
  const [articleForm, setArticleForm] = useState<ArticleFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    tags: '',
    is_published: true,
    is_featured: false
  })
  const [saving, setSaving] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, articlesRes] = await Promise.all([
        fetch('/api/admin/kb/categories'),
        fetch('/api/admin/kb/articles')
      ])
      
      if (!categoriesRes.ok) {
        console.error('Categories response not OK:', await categoriesRes.text())
        throw new Error('Failed to fetch categories')
      }
      
      if (!articlesRes.ok) {
        console.error('Articles response not OK:', await articlesRes.text())
        throw new Error('Failed to fetch articles')
      }
      
      const categoriesData = await categoriesRes.json()
      const articlesData = await articlesRes.json()
      
      setCategories(categoriesData.categories || [])
      setArticles(articlesData.articles || [])
    } catch (error) {
      console.error('Error loading KB data:', error)
      toast.error('Failed to load knowledge base')
    } finally {
      setLoading(false)
    }
  }

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setArticleForm(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
    setSlugError(null)
  }

  const handleSaveArticle = async () => {
    // Validate form
    if (!articleForm.title) {
      toast.error('Title is required')
      return
    }
    if (!articleForm.slug) {
      toast.error('Slug is required')
      return
    }
    if (!articleForm.content || articleForm.content === '<p><br></p>') {
      toast.error('Content is required')
      return
    }

    // Check if slug is valid format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(articleForm.slug)) {
      toast.error('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }

    try {
      setSaving(true)
      
      // Process tags
      const tagsArray = articleForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // Generate excerpt from content if not provided
      let excerpt = articleForm.excerpt
      if (!excerpt) {
        // Strip HTML tags and take first 160 characters
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = articleForm.content
        const textContent = tempDiv.textContent || tempDiv.innerText || ''
        excerpt = textContent.substring(0, 160) + '...'
      }

      const payload = {
        title: articleForm.title,
        slug: articleForm.slug,
        content: articleForm.content,
        excerpt,
        category_id: articleForm.category_id || null,
        tags: tagsArray,
        is_published: articleForm.is_published,
        is_featured: articleForm.is_featured
      }

      const url = editingArticle 
        ? `/api/admin/kb/articles/${editingArticle.id}`
        : '/api/admin/kb/articles'
      
      const method = editingArticle ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save article')
      }

      toast.success(editingArticle ? 'Article updated' : 'Article created')
      setShowArticleModal(false)
      setEditingArticle(null)
      setArticleForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category_id: '',
        tags: '',
        is_published: true,
        is_featured: false
      })
      await loadData()
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setArticleForm({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt || '',
      category_id: article.category_id || '',
      tags: article.tags?.join(', ') || '',
      is_published: article.is_published,
      is_featured: article.is_featured
    })
    setShowArticleModal(true)
  }

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/kb/articles/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete article')
      }

      toast.success('Article deleted')
      await loadData()
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('Failed to delete article')
    }
  }

  const handleToggleFeatured = async (article: Article) => {
    try {
      const response = await fetch(`/api/admin/kb/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !article.is_featured })
      })

      if (!response.ok) {
        throw new Error('Failed to update article')
      }

      toast.success(article.is_featured ? 'Removed from featured' : 'Added to featured')
      await loadData()
    } catch (error) {
      console.error('Error updating article:', error)
      toast.error('Failed to update article')
    }
  }

  const handleTogglePublish = async (article: Article) => {
    try {
      const response = await fetch(`/api/admin/kb/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !article.is_published })
      })

      if (!response.ok) {
        throw new Error('Failed to update article')
      }

      toast.success(article.is_published ? 'Article unpublished' : 'Article published')
      await loadData()
    } catch (error) {
      console.error('Error updating article:', error)
      toast.error('Failed to update article')
    }
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Category name is required')
      return
    }

    try {
      const response = await fetch('/api/admin/kb/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryForm,
          slug: categoryForm.name.toLowerCase().replace(/\s+/g, '-')
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      toast.success('Category created')
      setShowAddCategory(false)
      setCategoryForm({ name: '', description: '', icon: 'FileText', is_active: true })
      await loadData()
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    }
  }

  const filteredArticles = articles.filter(article => {
    if (selectedCategory !== 'all' && article.category_id !== selectedCategory) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return article.title.toLowerCase().includes(term) ||
             article.excerpt?.toLowerCase().includes(term) ||
             article.content.toLowerCase().includes(term)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Knowledge Base</h1>
          <p className="text-navy-600">Manage articles and categories</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddCategory(true)}
            className="px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Add Category
          </button>
          <button
            onClick={() => {
              setEditingArticle(null)
              setArticleForm({
                title: '',
                slug: '',
                content: '',
                excerpt: '',
                category_id: '',
                tags: '',
                is_published: true,
                is_featured: false
              })
              setShowArticleModal(true)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Article
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-white rounded-xl border p-6 cursor-pointer transition-all",
              selectedCategory === category.id
                ? "border-gold-500 ring-2 ring-gold-500/20"
                : "border-slate-200 hover:border-gold-300 hover:shadow-md"
            )}
            onClick={() => setSelectedCategory(
              selectedCategory === category.id ? 'all' : category.id
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-navy-600" />
              </div>
              {!category.is_active && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                  Hidden
                </span>
              )}
            </div>
            <h3 className="font-semibold text-navy-900 mb-1">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-navy-500 mb-3 line-clamp-2">{category.description}</p>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-navy-400">
                {category.article_count || 0} articles
              </span>
              <ChevronRight className="w-4 h-4 text-navy-400" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">
                  Title
                </th>
                <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">
                  Stats
                </th>
                <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-navy-500">No articles found</p>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-navy-900 mb-1 flex items-center gap-2">
                          {article.title}
                          {article.is_featured && (
                            <Star className="w-4 h-4 text-gold-600 fill-current" />
                          )}
                        </div>
                        {article.excerpt && (
                          <p className="text-sm text-navy-500 line-clamp-1">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-navy-100 text-navy-700 rounded-full text-xs">
                        {article.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-navy-600">
                          <Eye className="w-4 h-4" />
                          {article.views}
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          {article.helpful_count}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        article.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      )}>
                        {article.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleFeatured(article)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            article.is_featured 
                              ? "text-gold-600 hover:text-gold-700 hover:bg-gold-50"
                              : "text-navy-400 hover:text-navy-600 hover:bg-slate-100"
                          )}
                          title={article.is_featured ? "Remove from featured" : "Add to featured"}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(article)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            article.is_published
                              ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                              : "text-navy-400 hover:text-navy-600 hover:bg-slate-100"
                          )}
                          title={article.is_published ? "Unpublish" : "Publish"}
                        >
                          {article.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="p-2 text-gold-600 hover:text-gold-700 hover:bg-gold-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/support/article/${article.slug}`}
                          target="_blank"
                          className="p-2 text-navy-400 hover:text-navy-600 hover:bg-slate-100 rounded-lg"
                          title="View article"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddCategory(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-navy-900">Add Category</h2>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Getting Started"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this category"
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-gold-600 rounded border-slate-300 focus:ring-gold-500"
                  />
                  <label htmlFor="is_active" className="text-sm text-navy-700">
                    Active (visible to users)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddCategory(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-navy-600 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    className="flex-1 px-4 py-3 bg-navy-900 text-white rounded-xl hover:bg-navy-800 transition-colors"
                  >
                    Create Category
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Article Modal */}
      <AnimatePresence>
        {showArticleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowArticleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-xl font-semibold text-navy-900">
                  {editingArticle ? 'Edit Article' : 'Create New Article'}
                </h2>
                <button
                  onClick={() => setShowArticleModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Title and Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={articleForm.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter article title"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={articleForm.slug}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-friendly-article-title"
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent",
                        slugError ? "border-red-300" : "border-slate-200"
                      )}
                    />
                    {slugError && (
                      <p className="text-xs text-red-600 mt-1">{slugError}</p>
                    )}
                    <p className="text-xs text-navy-400 mt-1">
                      URL-friendly version of the title. Use lowercase letters, numbers, and hyphens.
                    </p>
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Category
                    </label>
                    <select
                      value={articleForm.category_id}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, category_id: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={articleForm.tags}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                    <p className="text-xs text-navy-400 mt-1">
                      Comma-separated tags
                    </p>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={articleForm.excerpt}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief summary of the article (optional)"
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                  <p className="text-xs text-navy-400 mt-1">
                    If left blank, will be auto-generated from content
                  </p>
                </div>

                {/* Content - WYSIWYG Editor */}
                <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                        Content *
                    </label>
                    <WysiwygEditor
                        value={articleForm.content}
                        onChange={(content) => setArticleForm(prev => ({ ...prev, content }))}
                        placeholder="Write your article content here..."
                        height="400px"
                    />
                </div>

                {/* Publishing Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={articleForm.is_published}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, is_published: e.target.checked }))}
                      className="w-4 h-4 text-gold-600 rounded border-slate-300 focus:ring-gold-500"
                    />
                    <label htmlFor="is_published" className="text-sm text-navy-700">
                      Publish immediately
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={articleForm.is_featured}
                      onChange={(e) => setArticleForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4 text-gold-600 rounded border-slate-300 focus:ring-gold-500"
                    />
                    <label htmlFor="is_featured" className="text-sm text-navy-700">
                      Feature this article
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowArticleModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-navy-600 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveArticle}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-navy-900 text-white rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingArticle ? 'Update Article' : 'Create Article'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}