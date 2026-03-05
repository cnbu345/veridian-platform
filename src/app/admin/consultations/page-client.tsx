// src/app/admin/consultations/page-client.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, Clock, User, Phone, Mail, Building2, Check, X, MoreVertical, 
  Filter, Download, ChevronLeft, ChevronRight, Video, Calendar as CalendarIcon,
  Search, RefreshCw, DollarSign, AlertCircle, Edit2, Trash2, Copy, Send,
  ExternalLink
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/utils'

interface Consultation {
  id: string
  user_id: string
  customer_name: string
  company_name: string
  customer_email: string
  customer_phone: string
  consultation_date: string
  duration_minutes: number
  consultation_type: 'discovery' | 'compliance' | 'enterprise'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  converted_to_sale: boolean
  sale_amount?: number
  meeting_link?: string
  created_at?: string
  updated_at?: string
  reminder_sent?: boolean
  reminder_sent_at?: string | null
}

type ViewMode = 'list' | 'calendar' | 'week'
type FilterStatus = 'all' | 'scheduled' | 'completed' | 'cancelled' | 'no-show'
type DateRange = 'today' | 'week' | 'month' | 'all'

interface Props {
  initialConsultations: Consultation[]
}

export default function ConsultationManagementClient({ initialConsultations }: Props) {
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>(initialConsultations)
  const [loading, setLoading] = useState(false)
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('scheduled')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [cancelReason, setCancelReason] = useState('')
  const [saleAmount, setSaleAmount] = useState<number>(2497)
  const [editNotes, setEditNotes] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    conversionRate: 0,
    totalRevenue: 0
  })

  // Calculate statistics whenever consultations change
  useEffect(() => {
    const total = consultations.length
    const scheduled = consultations.filter(c => c.status === 'scheduled').length
    const completed = consultations.filter(c => c.status === 'completed').length
    const cancelled = consultations.filter(c => c.status === 'cancelled').length
    const converted = consultations.filter(c => c.converted_to_sale).length
    const totalRevenue = consultations.reduce((sum, c) => sum + (c.sale_amount || 0), 0)
    
    setStats({
      total,
      scheduled,
      completed,
      cancelled,
      conversionRate: completed > 0 ? (converted / completed) * 100 : 0,
      totalRevenue
    })
  }, [consultations])

  const CONSULTATION_TYPES = [
  { value: 'discovery', label: 'Discovery Call', description: '30-minute intro call' },
  { value: 'strategy', label: 'Strategy Session', description: 'Deep dive strategy' },
  { value: 'technical', label: 'Technical Review', description: 'Technical consultation' },
  { value: 'compliance', label: 'Compliance Check', description: 'Compliance review' },
  { value: 'enterprise', label: 'Enterprise Strategy', description: 'Enterprise-level strategy' }
]

  // Filter consultations based on selected filter and search term
  const filteredConsultations = consultations.filter(c => {
    // Status filter
    if (filter !== 'all' && c.status !== filter) return false
    
    // Search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        c.customer_name.toLowerCase().includes(searchLower) ||
        c.company_name.toLowerCase().includes(searchLower) ||
        c.customer_email.toLowerCase().includes(searchLower) ||
        c.customer_phone.includes(searchTerm)
      if (!matchesSearch) return false
    }
    
    // Date range filter
    if (dateRange !== 'all') {
      const consultDate = new Date(c.consultation_date)
      const now = new Date()
      
      if (dateRange === 'today') {
        if (consultDate.toDateString() !== now.toDateString()) return false
      } else if (dateRange === 'week') {
        const weekStart = startOfWeek(now)
        const weekEnd = endOfWeek(now)
        if (consultDate < weekStart || consultDate > weekEnd) return false
      } else if (dateRange === 'month') {
        if (consultDate.getMonth() !== now.getMonth() || consultDate.getFullYear() !== now.getFullYear()) return false
      }
    }
    
    return true
  })

  const handleStatusChange = async (id: string, status: Consultation['status']) => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { error } = await supabase
        .from('consultations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setConsultations(consultations.map(c =>
        c.id === id ? { ...c, status } : c
      ))
      
      toast.success(`Consultation marked as ${status}`)
    } catch (error) {
      console.error('Error updating consultation:', error)
      toast.error('Failed to update consultation')
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToSale = async (id: string) => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { error } = await supabase
        .from('consultations')
        .update({ 
          converted_to_sale: true, 
          status: 'completed',
          sale_amount: saleAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setConsultations(consultations.map(c =>
        c.id === id ? { 
          ...c, 
          converted_to_sale: true, 
          status: 'completed', 
          sale_amount: saleAmount 
        } : c
      ))
      
      setShowConvertModal(false)
      toast.success(`Converted to sale! $${saleAmount.toLocaleString()}`)
    } catch (error) {
      console.error('Error converting to sale:', error)
      toast.error('Failed to convert to sale')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelConsultation = async (id: string) => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const notes = cancelReason ? `Cancelled: ${cancelReason}` : 'Cancelled by admin'
      
      const { error } = await supabase
        .from('consultations')
        .update({ 
          status: 'cancelled',
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setConsultations(consultations.map(c =>
        c.id === id ? { ...c, status: 'cancelled', notes } : c
      ))
      
      setShowCancelModal(false)
      setCancelReason('')
      toast.success('Consultation cancelled')
    } catch (error) {
      console.error('Error cancelling consultation:', error)
      toast.error('Failed to cancel consultation')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotes = async (id: string) => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { error } = await supabase
        .from('consultations')
        .update({ 
          notes: editNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setConsultations(consultations.map(c =>
        c.id === id ? { ...c, notes: editNotes } : c
      ))
      
      setShowNotesModal(false)
      toast.success('Notes updated')
    } catch (error) {
      console.error('Error updating notes:', error)
      toast.error('Failed to update notes')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyMeetingLink = (link: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    navigator.clipboard.writeText(link)
    toast.success('Meeting link copied to clipboard')
  }

  const handleJoinMeeting = (link: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const handleSendReminder = async (consultation: Consultation) => {
    try {
      setSendingReminder(consultation.id)
      
      const response = await fetch('/api/consultations/reminders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          consultationId: consultation.id,
          source: 'admin'
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send reminder')
      }
      
      // Update local state to show reminder was sent
      setConsultations(consultations.map(c =>
        c.id === consultation.id 
          ? { 
              ...c, 
              reminder_sent: true, 
              reminder_sent_at: new Date().toISOString() 
            } 
          : c
      ))
      
      toast.success(`Reminder sent to ${consultation.customer_email}`)
    } catch (error) {
      console.error('Error sending reminder:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send reminder')
    } finally {
      setSendingReminder(null)
    }
  }

  const canSendReminder = (consultation: Consultation) => {
    const consultationDate = parseISO(consultation.consultation_date)
    const now = new Date()
    const hoursUntilConsultation = (consultationDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return (
      consultation.status === 'scheduled' &&
      !consultation.reminder_sent &&
      hoursUntilConsultation > 0 &&
      hoursUntilConsultation <= 48 // Only allow reminders within 48 hours
    )
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('consultation_date', { ascending: true })
      
      if (error) throw error
      setConsultations(data || [])
      toast.success('Consultations refreshed')
    } catch (error) {
      console.error('Error refreshing consultations:', error)
      toast.error('Failed to refresh')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'discovery': return '🔍'
      case 'compliance': return '⚖️'
      case 'enterprise': return '🏢'
      default: return '📞'
    }
  }

  const getTypeLabel = (type: string) => {
  switch(type) {
    case 'discovery': return 'Discovery Call'
    case 'strategy': return 'Strategy Session'
    case 'technical': return 'Technical Review'
    case 'compliance': return 'Compliance Check'
    case 'enterprise': return 'Enterprise Strategy'
    default: return type
  }
}

  // Calendar view helpers
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate)
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekDays = getWeekDays()

  const getConsultationsForHour = (date: Date, hour: number) => {
    return consultations.filter(c => {
      const consultDate = parseISO(c.consultation_date)
      return isSameDay(consultDate, date) && consultDate.getHours() === hour
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Total Consultations</p>
          <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Conversion Rate</p>
          <p className="text-2xl font-bold text-gold-600">{stats.conversionRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-navy-900">Consultation Management</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-navy-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/consultations/availability"
            className="px-4 py-2 border border-navy-200 text-navy-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Set Availability
          </Link>
          <Link
            href="/admin/consultations/new"
            className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Schedule New
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            {(['all', 'scheduled', 'completed', 'cancelled', 'no-show'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === status
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                {status === 'no-show' ? 'No Show' : status}
              </button>
            ))}
          </div>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              <Filter className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'calendar'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'week'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              Week
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search by name, company, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            />
          </div>

          {/* Export Button */}
          <button className="px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-navy-500">
          Showing {filteredConsultations.length} of {consultations.length} consultations
        </p>
        {filteredConsultations.length > 0 && (
          <p className="text-sm text-navy-500">
            Page 1 of {Math.ceil(filteredConsultations.length / 10)}
          </p>
        )}
      </div>

      {/* Main Content */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <div
              key={consultation.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center text-2xl">
                    {getTypeIcon(consultation.consultation_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{consultation.customer_name}</h3>
                    <p className="text-sm text-navy-600">{consultation.company_name}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-navy-500">
                        <Mail className="w-3 h-3" />
                        {consultation.customer_email}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-navy-500">
                        <Phone className="w-3 h-3" />
                        {consultation.customer_phone}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {consultation.reminder_sent && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Reminder Sent
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(consultation.status)}`}>
                    {consultation.status === 'no-show' ? 'No Show' : consultation.status}
                  </span>
                  {consultation.converted_to_sale && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                      Sale: ${consultation.sale_amount?.toLocaleString()}
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedConsultation(consultation)
                      setShowDetailsModal(true)
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-navy-500" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-navy-400" />
                  <span>{format(parseISO(consultation.consultation_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-navy-400" />
                  <span>{format(parseISO(consultation.consultation_date), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-navy-400" />
                  <span>{consultation.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-navy-400" />
                  <span className="capitalize">{getTypeLabel(consultation.consultation_type)}</span>
                </div>
                {consultation.meeting_link && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4 text-navy-400" />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyMeetingLink(consultation.meeting_link!)}
                        className="text-gold-600 hover:text-gold-700 flex items-center gap-1"
                        title="Copy link"
                      >
                        Copy <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleJoinMeeting(consultation.meeting_link!, e)}
                        className="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 flex items-center gap-1"
                        title="Join meeting"
                      >
                        <Video className="w-3 h-3" />
                        Join
                      </button>
                      <a
                        href={consultation.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy-400 hover:text-navy-600"
                        title="Opens in new tab"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {consultation.status === 'scheduled' && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleStatusChange(consultation.id, 'completed')}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Mark Completed
                  </button>
                  <button
                    onClick={() => {
                      setSelectedConsultation(consultation)
                      setShowCancelModal(true)
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setSelectedConsultation(consultation)
                      setShowConvertModal(true)
                      setSaleAmount(2497)
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700 disabled:opacity-50 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    Convert to Sale
                  </button>
                  {canSendReminder(consultation) && (
                    <button
                      onClick={() => handleSendReminder(consultation)}
                      disabled={sendingReminder === consultation.id}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-navy-600 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      {sendingReminder === consultation.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy-600" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Reminder
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {consultation.notes && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-navy-600">
                  <span className="font-medium">Notes:</span> {consultation.notes}
                </div>
              )}
            </div>
          ))}

          {filteredConsultations.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-navy-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-navy-900 mb-2">No consultations found</h3>
              <p className="text-navy-600 mb-6">Try adjusting your filters or schedule a new consultation.</p>
              <Link
                href="/admin/consultations/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                Schedule New Consultation
              </Link>
            </div>
          )}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-navy-900">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-navy-600 py-2">
                {day}
              </div>
            ))}
            
            {weekDays.map((day, index) => {
              const dayConsultations = consultations.filter(c => 
                isSameDay(parseISO(c.consultation_date), day)
              )
              
              return (
                <div 
                  key={index} 
                  className={`border rounded-lg min-h-[120px] p-2 ${
                    isSameDay(day, new Date()) 
                      ? 'border-gold-500 bg-gold-50' 
                      : 'border-slate-200'
                  }`}
                >
                  <div className="text-sm font-medium text-navy-900 mb-2">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayConsultations.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedConsultation(c)
                          setShowDetailsModal(true)
                        }}
                        className={cn(
                          "text-xs p-1 rounded cursor-pointer transition-colors group relative",
                          c.status === 'scheduled' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                          c.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                          'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">
                            {format(parseISO(c.consultation_date), 'h:mm a')}
                          </span>
                          {c.meeting_link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleJoinMeeting(c.meeting_link!, e)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/30 rounded"
                              title="Join meeting"
                            >
                              <Video className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="truncate">{c.customer_name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-8 border-b border-slate-200">
            <div className="p-4 border-r border-slate-200 bg-slate-50">
              <span className="text-sm font-medium text-navy-600">Time</span>
            </div>
            {weekDays.map((day, index) => (
              <div key={index} className="p-4 text-center bg-slate-50">
                <div className="text-sm font-medium text-navy-900">{format(day, 'EEE')}</div>
                <div className={`text-xs ${
                  isSameDay(day, new Date()) ? 'text-gold-600 font-bold' : 'text-navy-500'
                }`}>
                  {format(day, 'MMM d')}
                </div>
              </div>
            ))}
          </div>
          
          {[9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-200 last:border-b-0">
              <div className="p-3 border-r border-slate-200 bg-slate-50">
                <span className="text-sm text-navy-600">{hour}:00</span>
              </div>
              {weekDays.map((day, dayIndex) => {
                const hourConsultations = getConsultationsForHour(day, hour)
                return (
                  <div key={dayIndex} className="p-2 min-h-[80px] border-r border-slate-200 last:border-r-0">
                    {hourConsultations.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedConsultation(c)
                          setShowDetailsModal(true)
                        }}
                        className={cn(
                          "text-xs p-2 mb-1 rounded cursor-pointer transition-colors group relative",
                          c.status === 'scheduled' ? 'bg-blue-100 hover:bg-blue-200' :
                          c.status === 'completed' ? 'bg-green-100 hover:bg-green-200' :
                          'bg-slate-100 hover:bg-slate-200'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-navy-900">{c.customer_name}</div>
                            <div className="text-navy-600 truncate">{c.company_name}</div>
                          </div>
                          {c.meeting_link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleJoinMeeting(c.meeting_link!, e)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/30 rounded"
                              title="Join meeting"
                            >
                              <Video className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-navy-900">Consultation Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-navy-500 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-navy-400">Name</p>
                    <p className="text-navy-900 font-medium">{selectedConsultation.customer_name}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-navy-400">Company</p>
                    <p className="text-navy-900">{selectedConsultation.company_name}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-navy-400">Email</p>
                    <p className="text-navy-900 break-all">{selectedConsultation.customer_email}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-navy-400">Phone</p>
                    <p className="text-navy-900">{selectedConsultation.customer_phone}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div>
                <h3 className="text-sm font-medium text-navy-500 mb-3">Consultation Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-navy-400">Date</p>
                    <p className="text-navy-900">
                      {format(parseISO(selectedConsultation.consultation_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-navy-400">Time</p>
                    <p className="text-navy-900">
                      {format(parseISO(selectedConsultation.consultation_date), 'h:mm a')} ({selectedConsultation.duration_minutes} min)
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-navy-400">Type</p>
                    <p className="text-navy-900 capitalize">{getTypeLabel(selectedConsultation.consultation_type)}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-navy-400">Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConsultation.status)}`}>
                      {selectedConsultation.status}
                    </span>
                  </div>
                  {selectedConsultation.reminder_sent && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-navy-400">Reminder</p>
                      <p className="text-navy-900">
                        Sent {selectedConsultation.reminder_sent_at 
                          ? format(parseISO(selectedConsultation.reminder_sent_at), 'MMM d, h:mm a')
                          : 'Yes'}
                      </p>
                    </div>
                  )}
                  {selectedConsultation.converted_to_sale && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-navy-400">Sale Amount</p>
                      <p className="text-navy-900 font-bold text-gold-600">
                        ${selectedConsultation.sale_amount?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-navy-500">Notes</h3>
                  <button
                    onClick={() => {
                      setEditNotes(selectedConsultation.notes || '')
                      setShowNotesModal(true)
                      setShowDetailsModal(false)
                    }}
                    className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit Notes
                  </button>
                </div>
                {selectedConsultation.notes ? (
                  <p className="text-navy-700 bg-slate-50 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedConsultation.notes}
                  </p>
                ) : (
                  <p className="text-navy-400 bg-slate-50 p-4 rounded-lg text-center">
                    No notes added
                  </p>
                )}
              </div>

              {/* Meeting Link */}
              {selectedConsultation.meeting_link && (
                <div>
                  <h3 className="text-sm font-medium text-navy-500 mb-3">Meeting Link</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedConsultation.meeting_link}
                        readOnly
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                      />
                      <a
                        href={selectedConsultation.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy-400 hover:text-navy-600"
                        title="Opens in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyMeetingLink(selectedConsultation.meeting_link!)}
                        className="px-4 py-2 border border-slate-300 text-navy-600 rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <button
                        onClick={(e) => handleJoinMeeting(selectedConsultation.meeting_link!, e)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-medium text-navy-500 mb-3">Timeline</h3>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  {selectedConsultation.created_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-navy-500">Created:</span>
                      <span className="text-navy-900">
                        {format(parseISO(selectedConsultation.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                  {selectedConsultation.updated_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-navy-500">Last Updated:</span>
                      <span className="text-navy-900">
                        {format(parseISO(selectedConsultation.updated_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedConsultation.status === 'scheduled' && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      handleStatusChange(selectedConsultation.id, 'completed')
                      setShowDetailsModal(false)
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowCancelModal(true)
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowConvertModal(true)
                      setSaleAmount(2497)
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700 disabled:opacity-50 transition-colors"
                  >
                    Convert to Sale
                  </button>
                  {canSendReminder(selectedConsultation) && (
                    <button
                      onClick={() => {
                        handleSendReminder(selectedConsultation)
                        setShowDetailsModal(false)
                      }}
                      disabled={sendingReminder === selectedConsultation.id}
                      className="flex-1 px-4 py-2 border border-slate-300 text-navy-600 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      {sendingReminder === selectedConsultation.id ? 'Sending...' : 'Send Reminder'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-navy-900">Cancel Consultation</h3>
            </div>
            <div className="p-6">
              <p className="text-navy-600 mb-4">
                Are you sure you want to cancel the consultation with{' '}
                <span className="font-semibold">{selectedConsultation.customer_name}</span>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="e.g., Client requested, schedule conflict, etc."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCancelConsultation(selectedConsultation.id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false)
                    setCancelReason('')
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Sale Modal */}
      {showConvertModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-navy-900">Convert to Sale</h3>
            </div>
            <div className="p-6">
              <p className="text-navy-600 mb-4">
                Convert consultation with{' '}
                <span className="font-semibold">{selectedConsultation.customer_name}</span> to a sale.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Sale Amount ($)
                </label>
                <input
                  type="number"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(Number(e.target.value))}
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>
              <div className="mb-4 p-3 bg-gold-50 rounded-lg">
                <p className="text-sm text-gold-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  This will mark the consultation as completed and record the sale.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleConvertToSale(selectedConsultation.id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 disabled:opacity-50 transition-colors"
                >
                  Convert to Sale
                </button>
                <button
                  onClick={() => setShowConvertModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notes Modal */}
      {showNotesModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-navy-900">Edit Notes</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Consultation Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Add notes about the consultation..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleUpdateNotes(selectedConsultation.id)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 transition-colors"
                >
                  Save Notes
                </button>
                <button
                  onClick={() => {
                    setShowNotesModal(false)
                    setShowDetailsModal(true)
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}