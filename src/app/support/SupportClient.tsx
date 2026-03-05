// src/app/support/SupportClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageCircle, Send, Clock, CheckCircle, AlertCircle,
  ChevronRight, Paperclip, X, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { format } from 'date-fns'

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
  created_at: string
  updated_at: string
  messages?: TicketMessage[]
}

interface TicketMessage {
  id: string
  user_id: string
  message: string
  created_at: string
  is_internal: boolean
}

interface Props {
  userId: string
}

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  waiting_on_customer: 'bg-purple-100 text-purple-700 border-purple-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200'
}

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700'
}

export default function SupportClient({ userId }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    category: 'technical',
    message: ''
  })

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/support/tickets')
      const data = await response.json()
      
      if (response.ok) {
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTicketMessages = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`)
      const data = await response.json()
      
      if (response.ok) {
        setSelectedTicket(prev => prev ? {
          ...prev,
          messages: data.messages
        } : null)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    loadTicketMessages(ticket.id)
  }

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    try {
      setSending(true)
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      })

      if (response.ok) {
        setNewMessage('')
        await loadTicketMessages(selectedTicket.id)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

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
        await loadTickets()
        if (data.ticket) {
          handleSelectTicket(data.ticket)
        }
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Support Center</h1>
          <p className="text-navy-600">
            Get help with your reports, account, or schedule a consultation
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h2 className="font-semibold text-navy-900">Your Tickets</h2>
                <button
                  onClick={() => setShowNewTicket(true)}
                  className="p-2 text-gold-600 hover:text-gold-700 hover:bg-gold-50 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-navy-500">No support tickets yet</p>
                    <button
                      onClick={() => setShowNewTicket(true)}
                      className="mt-4 text-gold-600 hover:text-gold-700 font-medium"
                    >
                      Create your first ticket
                    </button>
                  </div>
                ) : (
                  tickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-slate-50 transition-colors",
                        selectedTicket?.id === ticket.id && "bg-gold-50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-navy-900">
                          {ticket.ticket_number}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          STATUS_COLORS[ticket.status]
                        )}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-navy-900 mb-1 truncate">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-navy-500">
                        <Clock className="w-3 h-3" />
                        {format(new Date(ticket.updated_at), 'MMM d, h:mm a')}
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-xs",
                          PRIORITY_COLORS[ticket.priority]
                        )}>
                          {ticket.priority}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Ticket Header */}
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-xl font-bold text-navy-900 mb-1">
                        {selectedTicket.subject}
                      </h2>
                      <p className="text-sm text-navy-500">
                        Ticket #{selectedTicket.ticket_number}
                      </p>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      STATUS_COLORS[selectedTicket.status]
                    )}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      PRIORITY_COLORS[selectedTicket.priority]
                    )}>
                      {selectedTicket.priority} priority
                    </span>
                    <span className="text-navy-400">•</span>
                    <span className="text-navy-600">
                      Created {format(new Date(selectedTicket.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                  {selectedTicket.messages?.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.user_id === userId ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[80%] rounded-xl p-4",
                        message.user_id === userId
                          ? "bg-gold-600 text-white"
                          : "bg-slate-100 text-navy-900"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className={cn(
                          "text-xs mt-2",
                          message.user_id === userId ? "text-gold-200" : "text-navy-500"
                        )}>
                          {format(new Date(message.created_at), 'h:mm a • MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-slate-200">
                  <div className="flex gap-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-3 bg-gold-600 text-white rounded-xl hover:bg-gold-700 transition-colors disabled:opacity-50 self-end"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-navy-400 mt-2">
                    Our support team typically responds within 2-4 hours
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">
                <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-navy-900 mb-2">
                  No Ticket Selected
                </h3>
                <p className="text-navy-600 mb-6">
                  Select a ticket from the list or create a new one
                </p>
                <button
                  onClick={() => setShowNewTicket(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl hover:bg-navy-800 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create New Ticket
                </button>
              </div>
            )}
          </div>
        </div>

        {/* New Ticket Modal */}
        {showNewTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-lg w-full"
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
          </div>
        )}
      </div>
    </div>
  )
}