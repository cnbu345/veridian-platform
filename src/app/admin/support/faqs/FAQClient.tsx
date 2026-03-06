// src/app/admin/support/faqs/FAQClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp,
  Save, X, AlertCircle, CheckCircle, Eye, EyeOff,
  ArrowUp, ArrowDown, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import toast from 'react-hot-toast'

interface FAQItem {
  id: string
  category: string | null
  question: string
  answer: string
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export default function FAQClient() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null)
  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: '',
    is_published: true
  })

  const categories = ['General', 'Reports', 'Consultations', 'Billing', 'Technical', 'Account']

  useEffect(() => {
    loadFaqs()
  }, [])

  const loadFaqs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/faqs')
      const data = await response.json()
      if (response.ok) {
        setFaqs(data.faqs || [])
      }
    } catch (error) {
      console.error('Error loading FAQs:', error)
      toast.error('Failed to load FAQs')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const url = editingFaq 
        ? `/api/admin/faqs/${editingFaq.id}`
        : '/api/admin/faqs'
      
      const method = editingFaq ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingFaq ? 'FAQ updated' : 'FAQ created')
        setShowAddModal(false)
        setEditingFaq(null)
        setFormData({ category: '', question: '', answer: '', is_published: true })
        await loadFaqs()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving FAQ:', error)
      toast.error('Failed to save FAQ')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('FAQ deleted')
        await loadFaqs()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast.error('Failed to delete FAQ')
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const newFaqs = [...filteredFaqs]
    const temp = newFaqs[index]
    newFaqs[index] = newFaqs[index - 1]
    newFaqs[index - 1] = temp
    
    // Update order in database
    try {
      await Promise.all(newFaqs.map((faq, i) => 
        fetch(`/api/admin/faqs/${faq.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: i })
        })
      ))
      setFaqs(newFaqs)
    } catch (error) {
      console.error('Error reordering:', error)
      toast.error('Failed to reorder FAQs')
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === filteredFaqs.length - 1) return
    const newFaqs = [...filteredFaqs]
    const temp = newFaqs[index]
    newFaqs[index] = newFaqs[index + 1]
    newFaqs[index + 1] = temp
    
    try {
      await Promise.all(newFaqs.map((faq, i) => 
        fetch(`/api/admin/faqs/${faq.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: i })
        })
      ))
      setFaqs(newFaqs)
    } catch (error) {
      console.error('Error reordering:', error)
      toast.error('Failed to reorder FAQs')
    }
  }

  const filteredFaqs = faqs.filter(faq => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return faq.question.toLowerCase().includes(term) || 
             faq.answer.toLowerCase().includes(term)
    }
    return true
  }).sort((a, b) => a.display_order - b.display_order)

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
          <h1 className="text-2xl font-bold text-navy-900 mb-1">FAQ Management</h1>
          <p className="text-navy-600">Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => {
            setEditingFaq(null)
            setFormData({ category: '', question: '', answer: '', is_published: true })
            setShowAddModal(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
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
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No FAQs found</h3>
            <p className="text-navy-500 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by creating your first FAQ'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="text-gold-600 hover:text-gold-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {faq.category && (
                        <span className="px-2 py-1 bg-navy-100 text-navy-700 rounded-full text-xs font-medium">
                          {faq.category}
                        </span>
                      )}
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        faq.is_published 
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      )}>
                        {faq.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-navy-600 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-2 text-navy-400 hover:text-navy-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                      title="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === filteredFaqs.length - 1}
                      className="p-2 text-navy-400 hover:text-navy-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                      title="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingFaq(faq)
                        setFormData({
                          category: faq.category || '',
                          question: faq.question,
                          answer: faq.answer,
                          is_published: faq.is_published
                        })
                        setShowAddModal(true)
                      }}
                      className="p-2 text-gold-600 hover:text-gold-700 hover:bg-gold-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-navy-400">
                  Last updated: {new Date(faq.updated_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                <h2 className="text-xl font-semibold text-navy-900">
                  {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter the question"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Answer *
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Enter the answer"
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="w-4 h-4 text-gold-600 rounded border-slate-300 focus:ring-gold-500"
                  />
                  <label htmlFor="is_published" className="text-sm text-navy-700">
                    Publish immediately
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-navy-600 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-3 bg-navy-900 text-white rounded-xl hover:bg-navy-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingFaq ? 'Update' : 'Create'}
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