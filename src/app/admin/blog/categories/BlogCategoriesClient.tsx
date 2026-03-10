// src/app/admin/blog/categories/BlogCategoriesClient.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Edit2, Trash2, Save, X, FolderOpen,
  FileText, ChevronRight, AlertCircle, Check
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  post_count: number
  created_at: string
  updated_at: string
}

interface Props {
  initialCategories: Category[]
}

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'green', label: 'Green', class: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'gold', label: 'Gold', class: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'red', label: 'Red', class: 'bg-red-100 text-red-700 border-red-200' }
]

export default function BlogCategoriesClient({ initialCategories }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue'
  })
  const [saving, setSaving] = useState(false)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Posts in this category will become uncategorized.')) return

    try {
      const response = await fetch(`/api/admin/blog/categories/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete category')

      setCategories(prev => prev.filter(c => c.id !== id))
      toast.success('Category deleted')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Category name is required')
      return
    }

    try {
      setSaving(true)

      const payload = {
        ...formData,
        slug: generateSlug(formData.name)
      }

      const url = editingCategory 
        ? `/api/admin/blog/categories/${editingCategory.id}`
        : '/api/admin/blog/categories'
      
      const method = editingCategory ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save category')
      }

      toast.success(editingCategory ? 'Category updated' : 'Category created')
      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '', color: 'blue' })
      
      // Refresh the page to get updated data
      router.refresh()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Blog Categories</h1>
          <p className="text-navy-600">Organize your blog posts with categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({ name: '', description: '', color: 'blue' })
            setShowModal(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const colorClass = COLOR_OPTIONS.find(c => c.value === category.color)?.class || 'bg-slate-100 text-slate-700'
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass.split(' ')[0])}>
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gold-600 hover:text-gold-700 hover:bg-gold-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-navy-900 mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-navy-500 mb-3 line-clamp-2">{category.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", colorClass)}>
                  {category.post_count} {category.post_count === 1 ? 'post' : 'posts'}
                </span>
                <span className="text-xs text-navy-400">
                  Slug: {category.slug}
                </span>
              </div>
            </motion.div>
          )
        })}

        {categories.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No categories yet</h3>
            <p className="text-navy-500 mb-4">Create your first category to organize your blog posts</p>
            <button
              onClick={() => {
                setEditingCategory(null)
                setFormData({ name: '', description: '', color: 'blue' })
                setShowModal(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Category
            </button>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-navy-900">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
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
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Compliance News"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                  <p className="text-xs text-navy-400 mt-1">
                    Slug will be: {generateSlug(formData.name)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this category"
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          color.class,
                          formData.color === color.value && "ring-2 ring-offset-2 ring-gold-500"
                        )}
                      >
                        {color.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-navy-600 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
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
                        {editingCategory ? 'Update' : 'Create'}
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