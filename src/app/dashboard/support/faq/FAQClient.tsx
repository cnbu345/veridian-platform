// src/app/dashboard/support/faq/FAQClient.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, ChevronDown, ChevronUp, HelpCircle,
  Mail, MessageSquare, ExternalLink, FileText,
  BookOpen, Star, TrendingUp, Filter, Plus, X, Send
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  display_order: number
}

interface Props {
  groupedFaqs: Record<string, FAQ[]>
  userId: string
}

interface NewTicketData {
  subject: string
  category: string
  message: string
}

export default function DashboardFAQClient({ groupedFaqs, userId }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.keys(groupedFaqs).reduce((acc, category) => ({ ...acc, [category]: true }), {})
  )
  
  // New Ticket Modal State
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [sending, setSending] = useState(false)
  const [newTicketData, setNewTicketData] = useState<NewTicketData>({
    subject: '',
    category: 'technical',
    message: ''
  })

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Filter FAQs based on search
  const filteredGroups = Object.entries(groupedFaqs).reduce((acc, [category, faqs]) => {
    const filtered = faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {} as Record<string, FAQ[]>)

  const categories = Object.keys(filteredGroups)

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-navy-600">
          Find answers to common questions about our platform, reports, and consultations
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
        />
      </div>

      {/* FAQ Categories */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No results found</h3>
          <p className="text-navy-500 mb-4">
            No FAQs match your search. Try different keywords or browse all categories.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-gold-600 hover:text-gold-700 font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-gold-600" />
                  <h2 className="text-lg font-semibold text-navy-900">{category}</h2>
                  <span className="px-2 py-1 bg-navy-100 text-navy-600 rounded-full text-xs">
                    {filteredGroups[category].length} {filteredGroups[category].length === 1 ? 'question' : 'questions'}
                  </span>
                </div>
                {expandedCategories[category] ? (
                  <ChevronUp className="w-5 h-5 text-navy-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-navy-400" />
                )}
              </button>

              {/* FAQ Items */}
              <AnimatePresence>
                {expandedCategories[category] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="divide-y divide-slate-200"
                  >
                    {filteredGroups[category].map((faq) => (
                      <div key={faq.id} className="p-6">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                          className="w-full flex items-start justify-between gap-4 text-left"
                        >
                          <h3 className="font-medium text-navy-900 flex-1 pr-4">
                            {faq.question}
                          </h3>
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-gold-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedFaq === faq.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4"
                            >
                              <div className="bg-slate-50 rounded-lg p-4 text-navy-700">
                                {faq.answer}
                              </div>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-xs text-navy-400">
                                  Was this helpful?
                                </span>
                                <button className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                                  Yes
                                </button>
                                <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                                  No
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Still Need Help */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 text-white mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Still need help?</h3>
            <p className="text-navy-200">
              Can't find what you're looking for? Create a support ticket and we'll help you out.
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
              href="/dashboard/support/kb"
              className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors font-medium whitespace-nowrap flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Browse KB
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