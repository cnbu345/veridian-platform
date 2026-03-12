// src/app/admin/consultations/upcoming/UpcomingConsultationsClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, User, Phone, Mail, Building2, Video, 
  MoreVertical, Check, X, Send, Copy, AlertCircle, Filter,
  Search, RefreshCw, ChevronDown, Download, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Edit2, Trash2, ExternalLink, FileText
} from 'lucide-react'
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, addDays } from 'date-fns'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Consultation {
  id: string
  customer_name: string
  company_name: string
  customer_email: string
  customer_phone: string
  consultation_date: string
  duration_minutes: number
  consultation_type: 'discovery' | 'strategy' | 'technical' | 'compliance'
  meeting_link?: string | null
  notes?: string | null
  reminder_sent: boolean
  reminder_sent_at?: string | null
  source?: 'enterprise_lead' | 'admin_scheduled' | 'user_scheduled'
  lead_id?: string | null
  users?: {
    full_name: string
    email: string
  }
}

interface Props {
  initialConsultations: Consultation[]
}

const CONSULTATION_TYPES = {
  discovery: { 
    label: 'Discovery Call', 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '🔍'
  },
  strategy: { 
    label: 'Strategy Session', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '📊'
  },
  technical: { 
    label: 'Technical Review', 
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: '⚙️'
  },
  compliance: { 
    label: 'Compliance Check', 
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: '✓'
  },
  enterprise: { 
    label: 'Enterprise Strategy', 
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: '🏢'
  }
}

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

export default function UpcomingConsultationsClient({ initialConsultations }: Props) {
  const [consultations, setConsultations] = useState(initialConsultations)
  const [filteredConsultations, setFilteredConsultations] = useState(initialConsultations)
  const [loading, setLoading] = useState(false)
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Helper function to convert UTC to local time
  const toLocalTime = (dateStr: string) => {
    const utcDate = parseISO(dateStr)
    return toZonedTime(utcDate, TIMEZONE)
  }

  // Helper function to format date in local timezone
  const formatLocalDate = (dateStr: string, formatStr: string) => {
    const localDate = toLocalTime(dateStr)
    return tzFormat(localDate, formatStr, { timeZone: TIMEZONE })
  }

  // Get time status with proper timezone handling
  const getTimeStatus = (dateStr: string) => {
    const localDate = toLocalTime(dateStr)
    const now = new Date()
    const localNow = toZonedTime(now, TIMEZONE)
    
    // Reset to start of day for date comparison
    const consultDay = startOfDay(localDate)
    const today = startOfDay(localNow)
    const tomorrow = startOfDay(addDays(localNow, 1))
    
    const hoursUntil = (localDate.getTime() - localNow.getTime()) / (1000 * 60 * 60)

    if (hoursUntil < 0) return { label: 'Past', color: 'bg-slate-100 text-slate-700' }
    if (hoursUntil < 1) return { label: 'Starting soon', color: 'bg-red-100 text-red-700 border-red-200' }
    if (consultDay.getTime() === today.getTime()) return { label: 'Today', color: 'bg-amber-100 text-amber-700 border-amber-200' }
    if (consultDay.getTime() === tomorrow.getTime()) return { label: 'Tomorrow', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    if (hoursUntil < 168) return { label: formatLocalDate(dateStr, 'EEE, MMM d'), color: 'bg-slate-100 text-slate-700' }
    return { label: formatLocalDate(dateStr, 'MMM d'), color: 'bg-slate-100 text-slate-700' }
  }

  // Calculate statistics with proper timezone
  const getStats = () => {
    const now = new Date()
    const localNow = toZonedTime(now, TIMEZONE)
    const today = startOfDay(localNow)
    const tomorrow = startOfDay(addDays(localNow, 1))
    const weekFromNow = addDays(localNow, 7)

    return {
      total: consultations.length,
      today: consultations.filter(c => {
        const localDate = toLocalTime(c.consultation_date)
        return startOfDay(localDate).getTime() === today.getTime()
      }).length,
      tomorrow: consultations.filter(c => {
        const localDate = toLocalTime(c.consultation_date)
        return startOfDay(localDate).getTime() === tomorrow.getTime()
      }).length,
      thisWeek: consultations.filter(c => {
        const localDate = toLocalTime(c.consultation_date)
        return localDate <= weekFromNow && localDate >= localNow
      }).length
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...consultations]
    const now = new Date()
    const localNow = toZonedTime(now, TIMEZONE)

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.customer_name.toLowerCase().includes(term) ||
        c.company_name.toLowerCase().includes(term) ||
        c.customer_email.toLowerCase().includes(term) ||
        c.customer_phone.includes(term)
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.consultation_type === typeFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      filtered = filtered.filter(c => {
        const localDate = toLocalTime(c.consultation_date)
        
        if (dateFilter === 'today') {
          return startOfDay(localDate).getTime() === startOfDay(localNow).getTime()
        }
        
        if (dateFilter === 'tomorrow') {
          const tomorrow = startOfDay(addDays(localNow, 1))
          return startOfDay(localDate).getTime() === tomorrow.getTime()
        }
        
        if (dateFilter === 'week') {
          const weekFromNow = addDays(localNow, 7)
          return isWithinInterval(localDate, { start: localNow, end: weekFromNow })
        }
        
        return true
      })
    }

    // Sort by date (ascending)
    filtered.sort((a, b) => {
      const dateA = toLocalTime(a.consultation_date)
      const dateB = toLocalTime(b.consultation_date)
      return dateA.getTime() - dateB.getTime()
    })

    setFilteredConsultations(filtered)
    setCurrentPage(1)
  }, [consultations, searchTerm, typeFilter, dateFilter])

  const handleSendReminder = async (consultation: Consultation) => {
    try {
      setSendingReminder(consultation.id)
      
      const response = await fetch('/api/consultations/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          consultationId: consultation.id,
          source: 'admin'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder')
      }

      // Update local state
      setConsultations(prev => prev.map(c =>
        c.id === consultation.id
          ? { ...c, reminder_sent: true, reminder_sent_at: new Date().toISOString() }
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

  const handleCancelConsultation = async () => {
    if (!selectedConsultation) return

    try {
      setLoading(true)
      
      const response = await fetch(`/api/consultations/${selectedConsultation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'cancelled',
          notes: cancelReason ? `Cancelled: ${cancelReason}` : 'Cancelled by admin'
        })
      })

      if (!response.ok) throw new Error('Failed to cancel consultation')

      // Remove from list
      setConsultations(prev => prev.filter(c => c.id !== selectedConsultation.id))

      toast.success('Consultation cancelled successfully')
      setShowCancelModal(false)
      setShowDetailsModal(false)
      setCancelReason('')
    } catch (error) {
      console.error('Error cancelling consultation:', error)
      toast.error('Failed to cancel consultation')
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!selectedConsultation || !rescheduleDate || !rescheduleTime) return

    try {
      setLoading(true)
      
      // Combine date and time
      const [year, month, day] = rescheduleDate.split('-').map(Number)
      const [hours, minutes] = rescheduleTime.split(':').map(Number)
      const newDate = new Date(year, month - 1, day, hours, minutes)
      
      const response = await fetch(`/api/consultations/${selectedConsultation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          consultation_date: newDate.toISOString(),
          status: 'rescheduled'
        })
      })

      if (!response.ok) throw new Error('Failed to reschedule consultation')

      // Update local state
      setConsultations(prev => prev.map(c =>
        c.id === selectedConsultation.id
          ? { ...c, consultation_date: newDate.toISOString(), status: 'rescheduled' }
          : c
      ))

      toast.success('Consultation rescheduled successfully')
      setShowRescheduleModal(false)
      setShowDetailsModal(false)
      setRescheduleDate('')
      setRescheduleTime('')
    } catch (error) {
      console.error('Error rescheduling consultation:', error)
      toast.error('Failed to reschedule consultation')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast.success('Meeting link copied to clipboard')
  }

  const handleJoinMeeting = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/consultations/upcoming')
      const data = await response.json()
      setConsultations(data)
      toast.success('Consultations refreshed')
    } catch (error) {
      console.error('Error refreshing:', error)
      toast.error('Failed to refresh')
    } finally {
      setLoading(false)
    }
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredConsultations.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage)

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Upcoming Consultations</h1>
          <p className="text-navy-600">Manage scheduled consultations and send reminders</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4 text-navy-600", loading && "animate-spin")} />
          </button>
          <Link
            href="/admin/consultations/calendar"
            className="flex-1 sm:flex-none px-4 py-2 border border-navy-200 text-navy-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="sm:inline">Calendar</span>
          </Link>
          <Link
            href="/admin/consultations/new"
            className="flex-1 sm:flex-none px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span className="sm:inline">Schedule</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs sm:text-sm text-navy-500 mb-1">Total Upcoming</p>
          <p className="text-xl sm:text-2xl font-bold text-navy-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs sm:text-sm text-navy-500 mb-1">Today</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.today}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs sm:text-sm text-navy-500 mb-1">Tomorrow</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.tomorrow}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs sm:text-sm text-navy-500 mb-1">This Week</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.thisWeek}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filter Toggle - Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "sm:hidden px-4 py-2 border rounded-lg flex items-center justify-center gap-2 transition-colors",
              showFilters ? "bg-gold-50 border-gold-300 text-gold-700" : "border-slate-200 text-navy-600"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
          </button>

          {/* Desktop Filters */}
          <div className="hidden sm:flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm bg-white"
            >
              <option value="all">All Types</option>
              <option value="discovery">Discovery Call</option>
              <option value="strategy">Strategy Session</option>
              <option value="technical">Technical Review</option>
              <option value="compliance">Compliance Check</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm bg-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
            </select>

            <button className="px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Mobile Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-slate-200">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="discovery">Discovery Call</option>
                  <option value="strategy">Strategy Session</option>
                  <option value="technical">Technical Review</option>
                  <option value="compliance">Compliance Check</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                </select>

                <button className="w-full px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>

                <button
                  onClick={() => {
                    setSearchTerm('')
                    setTypeFilter('all')
                    setDateFilter('all')
                  }}
                  className="text-sm text-gold-600 hover:text-gold-700 py-2"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="text-sm text-navy-500">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredConsultations.length)} of {filteredConsultations.length} consultations
        </p>
        <p className="text-xs text-navy-400">
          All times shown in {TIMEZONE} timezone
        </p>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {currentItems.map((consultation) => {
          const timeStatus = getTimeStatus(consultation.consultation_date)
          const type = CONSULTATION_TYPES[consultation.consultation_type]

          return (
            <motion.div
              key={consultation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:border-gold-300 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 w-full">
                  {/* Header with badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                  {/* ADD SOURCE BADGE HERE - at the beginning */}
                  {consultation.source === 'enterprise_lead' && (
                    <Link
                      href={`/admin/customers/enterprise/builder?lead=${consultation.lead_id}`}
                      className="px-2 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-medium border border-gold-200 flex items-center gap-1 hover:bg-gold-200 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Briefcase className="w-3 h-3" />
                      Enterprise Lead
                    </Link>
                  )}
                  {consultation.source === 'admin_scheduled' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium border border-purple-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Admin Scheduled
                    </span>
                  )}
                  {(!consultation.source || consultation.source === 'user_scheduled') && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      User Scheduled
                    </span>
                  )}

                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    type.color
                  )}>
                    {type.icon} {type.label}
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    timeStatus.color
                  )}>
                    {timeStatus.label}
                  </span>
                  {consultation.reminder_sent && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200 flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      Reminder Sent
                    </span>
                  )}
                </div>

                  {/* Customer Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-navy-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-navy-900 truncate">{consultation.customer_name}</h3>
                      <p className="text-sm text-navy-600 truncate mb-2">{consultation.company_name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <span className="flex items-center gap-1 text-navy-500 truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{consultation.customer_email}</span>
                        </span>
                        <span className="flex items-center gap-1 text-navy-500">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {consultation.customer_phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date/Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4 text-sm">
                    <span className="flex items-center gap-1 text-navy-600">
                      <Calendar className="w-4 h-4" />
                      {formatLocalDate(consultation.consultation_date, 'EEEE, MMMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1 text-navy-600">
                      <Clock className="w-4 h-4" />
                      {formatLocalDate(consultation.consultation_date, 'h:mm a')} ({consultation.duration_minutes} min)
                    </span>
                  </div>

                  {/* Notes Preview */}
                  {consultation.notes && (
                    <p className="mt-3 text-xs sm:text-sm text-navy-500 bg-slate-50 p-3 rounded-lg line-clamp-2">
                      📝 {consultation.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-start">
                  {consultation.meeting_link && (
                    <>
                      <button
                        onClick={() => handleCopyMeetingLink(consultation.meeting_link!)}
                        className="p-2 text-navy-500 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                        title="Copy meeting link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleJoinMeeting(consultation.meeting_link!)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 text-sm font-medium"
                        title="Join meeting"
                      >
                        <Video className="w-4 h-4" />
                        <span className="hidden sm:inline">Join</span>
                      </button>
                    </>
                  )}
                  
                  {!consultation.reminder_sent && (
                    <button
                      onClick={() => handleSendReminder(consultation)}
                      disabled={sendingReminder === consultation.id}
                      className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Send reminder"
                    >
                      {sendingReminder === consultation.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedConsultation(consultation)
                      setShowDetailsModal(true)
                    }}
                    className="p-2 text-navy-400 hover:text-navy-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="View details"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}

        {filteredConsultations.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-navy-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-navy-900 mb-2">No upcoming consultations</h3>
            <p className="text-sm sm:text-base text-navy-600 mb-6">
              {searchTerm || typeFilter !== 'all' || dateFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Schedule a new consultation to get started.'}
            </p>
            {(searchTerm || typeFilter !== 'all' || dateFilter !== 'all') ? (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('all')
                  setDateFilter('all')
                }}
                className="text-gold-600 hover:text-gold-700 font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/admin/consultations/new"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm sm:text-base"
              >
                <Calendar className="w-4 h-4" />
                Schedule New Consultation
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredConsultations.length > itemsPerPage && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-navy-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-navy-600" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-navy-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal - UPDATED to match the design from calendar and show full details */}
      <AnimatePresence>
        {showDetailsModal && selectedConsultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-xl font-semibold text-navy-900">Consultation Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Customer Info */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-navy-500 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-navy-400">Name</p>
                      <p className="text-navy-900 font-medium">{selectedConsultation.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-400">Company</p>
                      <p className="text-navy-900">{selectedConsultation.company_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-400">Email</p>
                      <p className="text-navy-900 break-all">{selectedConsultation.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-navy-400">Phone</p>
                      <p className="text-navy-900">{selectedConsultation.customer_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Consultation Details */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-navy-500 mb-3">Consultation Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-navy-400" />
                      <span className="text-navy-900">
                        {formatLocalDate(selectedConsultation.consultation_date, 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-navy-400" />
                      <span className="text-navy-900">
                        {formatLocalDate(selectedConsultation.consultation_date, 'h:mm a')} ({selectedConsultation.duration_minutes} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        CONSULTATION_TYPES[selectedConsultation.consultation_type].color
                      )}>
                        {CONSULTATION_TYPES[selectedConsultation.consultation_type].icon} {CONSULTATION_TYPES[selectedConsultation.consultation_type].label}
                      </span>
                    </div>
                    {selectedConsultation.reminder_sent && (
                      <div className="flex items-center gap-2 text-sm">
                        <Send className="w-4 h-4 text-navy-400" />
                        <span className="text-navy-900">
                          Reminder sent {selectedConsultation.reminder_sent_at 
                            ? formatLocalDate(selectedConsultation.reminder_sent_at, 'MMM d, h:mm a')
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                {selectedConsultation.notes ? (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-navy-500" />
                      <h3 className="text-sm font-medium text-navy-500">Notes</h3>
                    </div>
                    <p className="text-navy-700 whitespace-pre-wrap text-sm bg-white p-3 rounded-lg border border-slate-200">
                      {selectedConsultation.notes}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-navy-400" />
                      <h3 className="text-sm font-medium text-navy-500">Notes</h3>
                    </div>
                    <p className="text-navy-400 text-sm italic bg-white p-3 rounded-lg border border-slate-200">
                      No notes added for this consultation
                    </p>
                  </div>
                )}

                {/* Meeting Link */}
                {selectedConsultation.meeting_link ? (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-navy-500 mb-3">Meeting Link</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={selectedConsultation.meeting_link}
                          readOnly
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
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
                          onClick={() => handleJoinMeeting(selectedConsultation.meeting_link!)}
                          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Video className="w-5 h-5" />
                          Join Meeting Now
                        </button>
                        <button
                          onClick={() => handleCopyMeetingLink(selectedConsultation.meeting_link!)}
                          className="px-4 py-3 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors text-sm flex items-center justify-center"
                          title="Copy link"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-navy-500 mb-3">Meeting Link</h3>
                    <p className="text-navy-400 text-sm italic bg-white p-3 rounded-lg border border-slate-200">
                      No meeting link provided
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowRescheduleModal(true)
                    }}
                    className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowCancelModal(true)
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  {!selectedConsultation.reminder_sent && (
                    <button
                      onClick={() => {
                        handleSendReminder(selectedConsultation)
                        setShowDetailsModal(false)
                      }}
                      disabled={sendingReminder === selectedConsultation.id}
                      className="flex-1 px-4 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {sendingReminder === selectedConsultation.id ? 'Sending...' : 'Send Reminder'}
                    </button>
                  )}
                </div>

                {/* Close Button (shown when no actions available) */}
                {selectedConsultation.reminder_sent && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="w-full px-4 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && selectedConsultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <h3 className="text-lg sm:text-xl font-semibold text-navy-900">Cancel Consultation</h3>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-navy-600 mb-4">
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
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                    placeholder="e.g., Client requested, schedule conflict..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleCancelConsultation}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                  >
                    Yes, Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelModal(false)
                      setCancelReason('')
                    }}
                    className="flex-1 px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && selectedConsultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <h3 className="text-lg sm:text-xl font-semibold text-navy-900">Reschedule Consultation</h3>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-navy-600 mb-4">
                  Select a new date and time for the consultation with{' '}
                  <span className="font-semibold">{selectedConsultation.customer_name}</span>
                </p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      New Date
                    </label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      New Time
                    </label>
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleReschedule}
                    disabled={loading || !rescheduleDate || !rescheduleTime}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm"
                  >
                    Confirm Reschedule
                  </button>
                  <button
                    onClick={() => {
                      setShowRescheduleModal(false)
                      setRescheduleDate('')
                      setRescheduleTime('')
                    }}
                    className="flex-1 px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
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