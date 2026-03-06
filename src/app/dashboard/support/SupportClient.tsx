// src/app/dashboard/support/SupportClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, Send, Clock, CheckCircle, AlertCircle,
  ChevronRight, Plus, X, ExternalLink, Inbox, Archive,
  Check, RefreshCw, HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed'
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
  initialTicketId?: string
}

// Simplified status display for clients
const CLIENT_STATUS = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: RefreshCw },
  waiting_on_customer: { label: 'Awaiting Your Reply', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: HelpCircle },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Archive }
}

const CATEGORY_LABELS = {
  technical: 'Technical Support',
  billing: 'Billing Question',
  consultation: 'Schedule Consultation',
  report: 'Report Issue',
  other: 'Other'
}

export default function SupportClient({ userId, initialTicketId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketIdFromUrl = searchParams.get('ticket') || initialTicketId
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open')
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
      toast.error('Failed to load tickets')
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
      toast.error('Failed to load messages')
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
        await loadTickets() // Refresh ticket list to update status
        toast.success('Message sent')
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
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

  const handleMarkResolved = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      })

      if (response.ok) {
        toast.success('Ticket marked as resolved')
        await loadTickets()
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null)
        }
      } else {
        throw new Error('Failed to update ticket')
      }
    } catch (error) {
      console.error('Error marking ticket as resolved:', error)
      toast.error('Failed to update ticket')
    }
  }

  const handleReopenTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: 'open' })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Ticket reopened')
        
        // Update local state
        setTickets(prev => prev.map(t => 
          t.id === ticketId ? { ...t, status: 'open' } : t
        ))
        
        // If this is the selected ticket, update it and stay on the same view
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(prev => prev ? { ...prev, status: 'open' } : null)
          // Reload messages to show the ticket is now open
          await loadTicketMessages(ticketId)
        }
      } else {
        throw new Error(data.error || 'Failed to reopen ticket')
      }
    } catch (error) {
      console.error('Error reopening ticket:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reopen ticket')
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'open') {
      return !['resolved', 'closed'].includes(ticket.status)
    } else if (filter === 'resolved') {
      return ['resolved', 'closed'].includes(ticket.status)
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Support</h1>
          <p className="text-navy-600">Get help with your account, reports, or consultations</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Support Ticket
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setFilter('open')}
            className={cn(
              "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
              filter === 'open'
                ? "border-gold-600 text-navy-900"
                : "border-transparent text-navy-500 hover:text-navy-700"
            )}
          >
            Open Tickets ({tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={cn(
              "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
              filter === 'resolved'
                ? "border-gold-600 text-navy-900"
                : "border-transparent text-navy-500 hover:text-navy-700"
            )}
          >
            Resolved ({tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "pb-3 px-1 text-sm font-medium border-b-2 transition-colors",
              filter === 'all'
                ? "border-gold-600 text-navy-900"
                : "border-transparent text-navy-500 hover:text-navy-700"
            )}
          >
            All Tickets ({tickets.length})
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No tickets found</h3>
            <p className="text-navy-500 mb-6">
              {filter === 'open' 
                ? "You don't have any open tickets. Create one to get help!" 
                : filter === 'resolved'
                ? "You don't have any resolved tickets"
                : "Get started by creating your first support ticket"}
            </p>
            <button
              onClick={() => setShowNewTicket(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Ticket
            </button>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const statusConfig = CLIENT_STATUS[ticket.status] || CLIENT_STATUS.open
            const StatusIcon = statusConfig.icon
            
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-gold-300 transition-all shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-navy-500 font-mono">
                          #{ticket.ticket_number}
                        </span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                          statusConfig.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-navy-900 mb-1">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-navy-500">
                        {CATEGORY_LABELS[ticket.category as keyof typeof CATEGORY_LABELS] || ticket.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectTicket(ticket)}
                      className="flex items-center gap-1 text-gold-600 hover:text-gold-700 font-medium text-sm"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-navy-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Updated {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                      </span>
                      {ticket.messages && (
                        <span className="text-navy-500 flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          {ticket.messages.length} {ticket.messages.length === 1 ? 'message' : 'messages'}
                        </span>
                      )}
                    </div>

                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                      <button
                        onClick={() => handleMarkResolved(ticket.id)}
                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Mark as Resolved
                      </button>
                    )}
                    
                    {['resolved', 'closed'].includes(ticket.status) && (
                      <button
                        onClick={() => handleReopenTicket(ticket.id)}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reopen Ticket
                      </button>
                    )}

                    {['resolved', 'closed'].includes(ticket.status) && ticket.resolved_by && (
                      <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Resolved by {ticket.resolved_by === 'customer' ? 'you' : 'support team'}
                        {ticket.resolved_at && ` on ${format(new Date(ticket.resolved_at), 'MMM d, yyyy')}`}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-navy-500 font-mono">
                      #{selectedTicket.ticket_number}
                    </span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                      CLIENT_STATUS[selectedTicket.status].color
                    )}>
                      {(() => {
                        const Icon = CLIENT_STATUS[selectedTicket.status].icon
                        return <Icon className="w-3 h-3" />
                      })()}
                      {CLIENT_STATUS[selectedTicket.status].label}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-navy-900">{selectedTicket.subject}</h3>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {selectedTicket.messages?.map(message => {
                  const isUser = message.user_id === userId
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[80%] rounded-xl p-4",
                        isUser
                          ? "bg-gold-600 text-white rounded-br-none"
                          : "bg-slate-100 text-navy-900 rounded-bl-none"
                      )}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.message}
                        </p>
                        <p className={cn(
                          "text-xs mt-2",
                          isUser ? "text-gold-200" : "text-navy-500"
                        )}>
                          {format(new Date(message.created_at), 'h:mm a • MMM d, yyyy')}
                          {!isUser && " • Support Team"}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {selectedTicket.status === 'resolved' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-800 font-medium mb-1">This ticket has been resolved</p>
                    <p className="text-sm text-green-600">
                      Resolved by {selectedTicket.resolved_by === 'customer' ? 'you' : 'support team'}
                      {selectedTicket.resolved_at && ` on ${format(new Date(selectedTicket.resolved_at), 'MMMM d, yyyy')}`}
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      If you need further assistance, you can reopen this ticket or create a new one.
                    </p>
                  </div>
                )}
              </div>

              {/* Reply Input - Only show for unresolved tickets */}
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    Add Reply
                  </label>
                  <div className="flex gap-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none bg-white"
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
              )}

              {/* Footer with action buttons */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' ? (
                  <button
                    onClick={() => {
                      handleMarkResolved(selectedTicket.id)
                      setSelectedTicket(null)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Mark as Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleReopenTicket(selectedTicket.id)
                      setSelectedTicket(null)
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    Reopen Ticket
                  </button>
                )}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Ticket Modal */}
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