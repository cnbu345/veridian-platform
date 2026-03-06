// src/app/dashboard/support/kb/KBClient.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, FileText, ChevronRight, BookOpen,
  Star, Eye, Clock, TrendingUp, Filter,
  Rocket, Calendar, CreditCard, User, Settings,
  Plus, X, Send
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  article_count: number
}

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  views: number
  is_featured: boolean
  category: {
    name: string
    slug: string
  } | null
}

interface Props {
  categories: Category[]
  featuredArticles: Article[]
  popularArticles: Article[]
  userId: string
}

interface NewTicketData {
  subject: string
  category: string
  message: string
}

const CATEGORY_ICONS: Record<string, any> = {
  'Getting Started': Rocket,
  'Reports': FileText,
  'Consultations': Calendar,
  'Billing': CreditCard,
  'Account': User,
  'Technical': Settings
}

export default function DashboardKBClient({ 
  categories, 
  featuredArticles, 
  popularArticles,
  userId 
}: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // New Ticket Modal State
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [sending, setSending] = useState(false)
  const [newTicketData, setNewTicketData] = useState<NewTicketData>({
    subject: '',
    category: 'technical',
    message: ''
  })

  const filteredCategories = categories.filter(cat => 
    !selectedCategory || cat.id === selectedCategory
  )

  const handleCreateTicket = async () => {
    if (!newTicketData.subject || !newTicketData.message) return

    try {
      setSending(true)
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicketData)
      })

      const data = await response.json()

      if (response.ok) {
        setShowNewTicket(false)
        setNewTicketData({ subject: '', category: 'technical', message: '' })
        toast.success('Ticket created successfully')
      } else {
        throw new Error(data.error || 'Failed to create ticket')
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Failed to create ticket')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Knowledge Base</h1>
        <p className="text-navy-600">
          Browse articles, guides, and documentation to get the most out of our platform
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
        <input
          type="text"
          placeholder="Search knowledge base..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.name] || BookOpen
            return (
              <Link
                key={category.id}
                href={`/dashboard/support/kb/category/${category.slug}`}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-gold-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center group-hover:bg-navy-200 transition-colors">
                    <Icon className="w-6 h-6 text-navy-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy-900 mb-1">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-navy-500 line-clamp-2">{category.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-navy-400">
                      <FileText className="w-3 h-3" />
                      <span>{category.article_count} articles</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-navy-400 group-hover:text-gold-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-gold-600" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/dashboard/support/kb/article/${article.slug}`}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:border-gold-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-gold-600" />
                  </div>
                  <div className="flex-1">
                    {article.category && (
                      <span className="text-xs px-2 py-0.5 bg-navy-100 text-navy-600 rounded-full mb-2 inline-block">
                        {article.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-navy-900 mb-1 group-hover:text-gold-600 transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-navy-500 line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-navy-400">
                      <Eye className="w-3 h-3" />
                      <span>{article.views} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-600" />
            Most Popular
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
            {popularArticles.map((article) => (
              <Link
                key={article.id}
                href={`/dashboard/support/kb/article/${article.slug}`}
                className="block p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {article.category && (
                        <span className="text-xs px-2 py-0.5 bg-navy-100 text-navy-600 rounded-full">
                          {article.category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-navy-900">{article.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-navy-400 ml-4">
                    <Eye className="w-3 h-3" />
                    <span>{article.views}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Need More Help */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 text-white mt-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Can't find what you need?</h3>
            <p className="text-navy-200">
              Our support team is ready to help with any questions.
            </p>
          </div>
          <div className="flex gap-3">
            {/* ONLY CHANGE: Replace Link with button that opens modal */}
            <button
              onClick={() => setShowNewTicket(true)}
              className="px-6 py-3 bg-gold-500 text-navy-900 rounded-xl hover:bg-gold-400 transition-colors font-medium whitespace-nowrap"
            >
              Create Ticket
            </button>
            <Link
              href="/dashboard/support/faq"
              className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors font-medium whitespace-nowrap"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </div>

      {/* New Ticket Modal - Copied exactly from SupportClient.tsx */}
      <AnimatePresence>
        {showNewTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewTicket(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-navy-900">Create New Ticket</h3>
                <button
                  onClick={() => setShowNewTicket(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={newTicketData.subject}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newTicketData.category}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  >
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="consultation">Schedule Consultation</option>
                    <option value="report">Report Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={newTicketData.message}
                    onChange={(e) => setNewTicketData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowNewTicket(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-navy-600 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTicket}
                    disabled={sending || !newTicketData.subject || !newTicketData.message}
                    className="flex-1 px-4 py-3 bg-navy-900 text-white rounded-xl hover:bg-navy-800 transition-colors disabled:opacity-50"
                  >
                    {sending ? 'Creating...' : 'Create Ticket'}
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