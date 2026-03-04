// src/app/dashboard/consultations/ClientConsultations.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar, 
  Video, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Filter,
  Search,
  RefreshCw,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { format, parseISO, isToday, isTomorrow, isFuture } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Consultation {
  id: string
  consultation_date: string
  consultation_type: 'discovery' | 'strategy' | 'technical' | 'compliance'
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  meeting_link: string | null
  reminder_sent: boolean
  reminder_sent_at: string | null
  notes: string | null
  users?: {
    full_name: string
    email: string
  }
}

interface ClientConsultationsProps {
  initialConsultations: Consultation[]
  error?: string
}

type FilterStatus = 'all' | 'scheduled' | 'completed' | 'cancelled'
type SortOption = 'date-asc' | 'date-desc' | 'type'

export default function ClientConsultations({ 
  initialConsultations, 
  error: initialError 
}: ClientConsultationsProps) {
  const [consultations, setConsultations] = useState(initialConsultations)
  const [filteredConsultations, setFilteredConsultations] = useState(initialConsultations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError || null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date-asc')
  const [showFilters, setShowFilters] = useState(false)
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  // Filter and sort consultations
  useEffect(() => {
    let filtered = [...consultations]

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.consultation_type.toLowerCase().includes(term) ||
        (c.notes?.toLowerCase().includes(term)) ||
        format(parseISO(c.consultation_date), 'MMM d, yyyy').toLowerCase().includes(term)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.consultation_date).getTime() - new Date(b.consultation_date).getTime()
        case 'date-desc':
          return new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime()
        case 'type':
          return a.consultation_type.localeCompare(b.consultation_type)
        default:
          return 0
      }
    })

    setFilteredConsultations(filtered)
  }, [consultations, filterStatus, searchTerm, sortBy])

  const getTypeLabel = (type: string) => {
    const types = {
      discovery: 'Discovery Call',
      strategy: 'Strategy Session',
      technical: 'Technical Review',
      compliance: 'Compliance Check'
    }
    return types[type as keyof typeof types] || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      discovery: 'bg-purple-100 text-purple-700',
      strategy: 'bg-blue-100 text-blue-700',
      technical: 'bg-amber-100 text-amber-700',
      compliance: 'bg-green-100 text-green-700'
    }
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-green-100 text-green-700',
      completed: 'bg-slate-100 text-slate-700',
      cancelled: 'bg-red-100 text-red-700',
      rescheduled: 'bg-amber-100 text-amber-700'
    }
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-3 h-3" />
      case 'completed':
        return <CheckCircle className="w-3 h-3" />
      case 'cancelled':
        return <XCircle className="w-3 h-3" />
      default:
        return <AlertCircle className="w-3 h-3" />
    }
  }

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d, yyyy')
  }

  const handleSendReminder = async (consultationId: string) => {
    try {
      setSendingReminder(consultationId)
      setError(null)

      const response = await fetch('/api/consultations/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          consultationId,
          source: 'manual' 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder')
      }

      // Update local state
      setConsultations(prev => prev.map(c => 
        c.id === consultationId 
          ? { ...c, reminder_sent: true, reminder_sent_at: new Date().toISOString() }
          : c
      ))

      // Show success message (you might want to add a toast notification here)
      console.log('Reminder sent successfully')

    } catch (err) {
      console.error('Error sending reminder:', err)
      setError(err instanceof Error ? err.message : 'Failed to send reminder')
    } finally {
      setSendingReminder(null)
    }
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('consultation_date', { ascending: true })
      
      if (error) throw error
      
      setConsultations(data || [])
    } catch (err) {
      console.error('Error refreshing consultations:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh consultations')
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">
            My Consultations
          </h1>
          <p className="text-navy-600">
            View and manage your scheduled consultations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-navy-600 hover:text-navy-900 bg-white rounded-lg border border-slate-200 hover:border-gold-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          
          <Link
            href="/consultation"
            className="px-6 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/25"
          >
            Schedule New
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search consultations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-4 py-2 text-sm border rounded-lg flex items-center gap-2 transition-colors",
              showFilters 
                ? "bg-gold-50 border-gold-300 text-gold-700" 
                : "border-slate-200 text-navy-600 hover:border-gold-300"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-4 pt-4 mt-4 border-t border-slate-200">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-navy-500">Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="px-3 py-1 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-navy-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-1 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  >
                    <option value="date-asc">Date (Earliest)</option>
                    <option value="date-desc">Date (Latest)</option>
                    <option value="type">Type</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Consultations List */}
      {filteredConsultations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            No consultations found
          </h3>
          <p className="text-navy-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Schedule your first consultation to get started'}
          </p>
          {(searchTerm || filterStatus !== 'all') ? (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="text-gold-600 hover:text-gold-700 font-semibold"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-semibold"
            >
              Schedule a consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredConsultations.map((consultation, index) => (
            <motion.div
              key={consultation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-gold-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Date/Time Column */}
                  <div className="text-center min-w-[100px]">
                    <div className="text-sm font-medium text-gold-600">
                      {getDateLabel(consultation.consultation_date)}
                    </div>
                    <div className="text-lg font-bold text-navy-900">
                      {format(parseISO(consultation.consultation_date), 'h:mm a')}
                    </div>
                  </div>

                  {/* Details Column */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                        getTypeColor(consultation.consultation_type)
                      )}>
                        {getTypeLabel(consultation.consultation_type)}
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                        getStatusColor(consultation.status)
                      )}>
                        {getStatusIcon(consultation.status)}
                        {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                      </span>
                      {consultation.reminder_sent && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          Reminder Sent
                        </span>
                      )}
                    </div>
                    
                    {consultation.notes && (
                      <p className="text-sm text-navy-600 mt-2">
                        {consultation.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Column */}
                <div className="flex items-center gap-2">
                  {canSendReminder(consultation) && (
                    <button
                      onClick={() => handleSendReminder(consultation.id)}
                      disabled={sendingReminder === consultation.id}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-lg flex items-center gap-1",
                        "bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors",
                        sendingReminder === consultation.id && "opacity-50 cursor-not-allowed"
                      )}
                      title="Send reminder email"
                    >
                      {sendingReminder === consultation.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Send Reminder
                        </>
                      )}
                    </button>
                  )}
                  
                  {consultation.meeting_link && consultation.status === 'scheduled' && (
                    <a
                      href={consultation.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gold-50 text-gold-700 rounded-lg hover:bg-gold-100 transition-colors text-sm flex items-center gap-1"
                    >
                      <Video className="w-4 h-4" />
                      Join
                    </a>
                  )}
                  
                  <Link
                    href={`/dashboard/consultations/${consultation.id}`}
                    className="p-2 text-navy-400 hover:text-gold-600 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}