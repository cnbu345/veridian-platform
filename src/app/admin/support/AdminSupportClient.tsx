// src/app/admin/support/AdminSupportClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Send, Clock, CheckCircle, AlertCircle,
  ChevronRight, Search, Filter, MoreVertical, User,
  Mail, Building2, Tag, RefreshCw, X, Eye, EyeOff,
  CheckCircle2, Archive, Trash2, Star, Inbox, Plus,
  HelpCircle, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string
  created_at: string
  updated_at: string
  resolved_at: string | null
  resolved_by: string | null
  reopened_at: string | null  // Add this line
  user_id: string
  users: {
    full_name: string | null
    email: string
    company_name: string | null
    subscription_tier: string
  }
  messages?: Array<{
    id: string
    created_at: string
    user_id: string
    message: string
    is_internal: boolean
    users?: {
      full_name: string | null
      email: string
      is_admin: boolean
    }
  }>
}

interface Props {
  initialTickets: Ticket[]
  initialTicketId?: string
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

const STATUS_OPTIONS = ['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed']
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent']

export default function AdminSupportClient({ initialTickets, initialTicketId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ticketIdFromUrl = searchParams.get('ticket') || initialTicketId
  
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  // Load ticket from URL if present
  useEffect(() => {
    if (ticketIdFromUrl) {
      const ticket = tickets.find(t => t.id === ticketIdFromUrl)
      if (ticket) {
        setSelectedTicket(ticket)
        loadTicketMessages(ticket.id)
      }
    }
  }, [ticketIdFromUrl, tickets])

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        ticket.ticket_number.toLowerCase().includes(term) ||
        ticket.subject.toLowerCase().includes(term) ||
        ticket.users?.full_name?.toLowerCase().includes(term) ||
        ticket.users?.email?.toLowerCase().includes(term) ||
        ticket.users?.company_name?.toLowerCase().includes(term)
      )
    }
    
    return true
  })

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
    // Update URL with ticket ID without page reload
    router.push(`/admin/support?ticket=${ticket.id}`, { scroll: false })
    setSelectedTicket(ticket)
    loadTicketMessages(ticket.id)
  }

  const handleCloseTicket = () => {
    router.push('/admin/support', { scroll: false })
    setSelectedTicket(null)
  }

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    try {
      setSending(true)
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newMessage,
          is_internal: isInternal 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Update local state
      setSelectedTicket(prev => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...(prev.messages || []), data.message],
          updated_at: new Date().toISOString()
        }
      })
      
      // Update ticket in list
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id 
          ? { ...t, updated_at: new Date().toISOString() } 
          : t
      ))
      
      setNewMessage('')
      toast.success(isInternal ? 'Internal note added' : 'Message sent')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleUpdateTicket = async (updates: Partial<Ticket>) => {
    if (!selectedTicket) return

    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update ticket')
      }

      const data = await response.json()
      
      // Update local state
      setSelectedTicket(prev => ({ ...prev!, ...data.ticket }))
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id ? { ...t, ...data.ticket } : t
      ))
      
      toast.success('Ticket updated')
    } catch (error) {
      console.error('Error updating ticket:', error)
      toast.error('Failed to update ticket')
    }
  }

  const handleReopenTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'open' })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Ticket reopened')
        
        // Update local state
        setTickets(prev => prev.map(t => 
          t.id === ticketId ? { ...t, status: 'open', resolved_at: null, resolved_by: null } : t
        ))
        
        // If this is the selected ticket, update it
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(prev => prev ? { 
            ...prev, 
            status: 'open', 
            resolved_at: null, 
            resolved_by: null 
          } : null)
          
          // Reload messages to show the ticket is now open
          await loadTicketMessages(ticketId)
        }
      } else {
        throw new Error(data.error || 'Failed to reopen ticket')
      }
    } catch (error) {
      console.error('Error reopening ticket:', error)
      toast.error('Failed to reopen ticket')
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/support/tickets')
      const data = await response.json()
      setTickets(data.tickets || [])
      toast.success('Tickets refreshed')
    } catch (error) {
      console.error('Error refreshing tickets:', error)
      toast.error('Failed to refresh')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Tickets List - Left Panel */}
      <div className="w-96 border-r border-slate-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-900">Support Tickets</h2>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4 text-navy-600", loading && "animate-spin")} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
            >
              <option value="all">All Priority</option>
              {PRIORITY_OPTIONS.map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-navy-500">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => handleSelectTicket(ticket)}
                className={cn(
                  "w-full p-4 text-left hover:bg-slate-50 transition-colors",
                  selectedTicket?.id === ticket.id && "bg-gold-50"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-navy-500">
                    #{ticket.ticket_number}
                  </span>
                  <div className="flex items-center gap-2">
                    {ticket.reopened_at && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Reopened
                      </span>
                    )}
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      STATUS_COLORS[ticket.status]
                    )}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-medium text-navy-900 text-sm mb-1 line-clamp-1">
                  {ticket.subject}
                </h3>
                
                <p className="text-xs text-navy-500 mb-2 line-clamp-1">
                  {ticket.users?.full_name} • {ticket.users?.company_name || 'No company'}
                </p>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full",
                    PRIORITY_COLORS[ticket.priority]
                  )}>
                    {ticket.priority}
                  </span>
                  <span className="text-navy-400">•</span>
                  <span className="text-navy-500">
                    {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Ticket Details - Right Panel */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedTicket ? (
          <>
            {/* Ticket Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-navy-900">
                      {selectedTicket.subject}
                    </h2>
                    {selectedTicket.reopened_at && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Reopened {formatDistanceToNow(new Date(selectedTicket.reopened_at), { addSuffix: true })}
                      </span>
                    )}
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      STATUS_COLORS[selectedTicket.status]
                    )}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-navy-500">
                    Ticket #{selectedTicket.ticket_number}
                  </p>
                  {selectedTicket.reopened_at && (
                    <p className="text-xs text-amber-600 mt-1">
                      Previously resolved on {selectedTicket.resolved_at ? format(new Date(selectedTicket.resolved_at), 'MMM d, yyyy') : 'unknown date'}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateTicket({ status: e.target.value as any })}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handleUpdateTicket({ priority: e.target.value as any })}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  >
                    {PRIORITY_OPTIONS.map(priority => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleCloseTicket}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-navy-600" />
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-navy-400 mb-1">Customer</p>
                  <p className="font-medium text-navy-900">{selectedTicket.users?.full_name}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-navy-400 mb-1">Email</p>
                  <p className="font-medium text-navy-900">{selectedTicket.users?.email}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-navy-400 mb-1">Company</p>
                  <p className="font-medium text-navy-900">{selectedTicket.users?.company_name || 'N/A'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-navy-400 mb-1">Plan</p>
                  <p className="font-medium text-navy-900 capitalize">{selectedTicket.users?.subscription_tier || 'free'}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedTicket.messages?.map(message => {
                const isAdmin = message.user_id !== selectedTicket.user_id
                
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.is_internal ? "justify-center" : (isAdmin ? "justify-start" : "justify-end")
                    )}
                  >
                    {message.is_internal ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <EyeOff className="w-3 h-3 text-amber-600" />
                          <span className="text-xs font-medium text-amber-700">Internal Note</span>
                        </div>
                        <p className="text-sm text-amber-800">{message.message}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    ) : (
                      <div className={cn(
                        "max-w-[70%] rounded-xl p-4",
                        isAdmin
                          ? "bg-slate-100 text-navy-900"
                          : "bg-gold-600 text-white"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className={cn(
                          "text-xs mt-2",
                          isAdmin ? "text-navy-500" : "text-gold-200"
                        )}>
                          {format(new Date(message.created_at), 'h:mm a • MMM d')}
                          {isAdmin && ` • Support Team`}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setIsInternal(!isInternal)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                    isInternal
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-navy-600 hover:bg-slate-200"
                  )}
                >
                  {isInternal ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      Internal Note
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      Public Reply
                    </>
                  )}
                </button>
                <span className="text-xs text-navy-400">
                  {isInternal 
                    ? "Only visible to support team" 
                    : "Visible to customer"}
                </span>
              </div>
              
              <div className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isInternal ? "Add internal note..." : "Type your reply..."}
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
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy-900 mb-2">
                No Ticket Selected
              </h3>
              <p className="text-navy-500">
                Select a ticket from the list to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}