// src/app/admin/data/verification/page.tsx
// OPTIMIZED - Only 5 database queries instead of 250+
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Shield, CheckCircle, AlertCircle, Clock, RefreshCw,
  MapPin, Calendar, Bell, X, Mail, Search,
  Server, DollarSign, TrendingUp, Users, FileText,
  ChevronRight
} from 'lucide-react'

// Types
interface ScheduledReview {
  id: string
  state_code: string
  scheduled_date: string
  assigned_to: string | null
  status: 'pending' | 'completed' | 'cancelled'
  reminder_sent: boolean
  notes: string | null
  created_at: string
}

interface ReviewAssignment {
  id: string
  email: string
  full_name: string
}

interface TableFreshness {
  table_name: string
  display_name: string
  icon: any
  last_updated: string | null
  days_since_update: number | null
  needs_review: boolean
}

// 50 states only
const usStates = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
]

// Report Data tables
const reportTables = [
  { key: 'technology_vendors', display: 'Technology Vendors', icon: Server, hasStateFilter: false },
  { key: 'budget_templates', display: 'Budget Templates', icon: DollarSign, hasStateFilter: false },
  { key: 'market_metrics', display: 'Market Metrics', icon: TrendingUp, hasStateFilter: true },
  { key: 'talent_metrics', display: 'Talent Metrics', icon: Users, hasStateFilter: true },
  { key: 'next_steps_templates', display: 'Next Steps', icon: FileText, hasStateFilter: false }
]

export default function VerificationDashboard() {
  const supabase = createClient()
  const [scheduledReviews, setScheduledReviews] = useState<ScheduledReview[]>([])
  const [tableFreshness, setTableFreshness] = useState<Map<string, TableFreshness[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleAssignee, setScheduleAssignee] = useState('')
  const [scheduleNote, setScheduleNote] = useState('')
  const [assignees, setAssignees] = useState<ReviewAssignment[]>([])
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showUpcomingReviews, setShowUpcomingReviews] = useState(true)
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  // OPTIMIZED: Fetch all data in parallel with minimal queries
  const fetchData = async () => {
    setLoading(true)
    try {
      // Parallel fetch for all data sources
      const [
        reviewsResult,
        usersResult,
        techVendorsResult,
        budgetTemplatesResult,
        marketMetricsResult,
        talentMetricsResult,
        nextStepsResult
      ] = await Promise.all([
        supabase.from('review_schedules').select('*').order('scheduled_date', { ascending: true }),
        supabase.from('users').select('id, email, full_name').eq('is_admin', true),
        supabase.from('technology_vendors').select('updated_at').order('updated_at', { ascending: false }).limit(1),
        supabase.from('budget_templates').select('updated_at').order('updated_at', { ascending: false }).limit(1),
        supabase.from('market_metrics').select('state_code, updated_at'),
        supabase.from('talent_metrics').select('state_code, updated_at'),
        supabase.from('next_steps_templates').select('updated_at').order('updated_at', { ascending: false }).limit(1)
      ])

      setScheduledReviews(reviewsResult.data || [])
      setAssignees(usersResult.data || [])

      // Build freshness map efficiently
      const freshnessMap = new Map<string, TableFreshness[]>()
      
      // Get latest dates for non-state-specific tables (same for all states)
      const techVendorsLastUpdated = techVendorsResult.data?.[0]?.updated_at || null
      const budgetTemplatesLastUpdated = budgetTemplatesResult.data?.[0]?.updated_at || null
      const nextStepsLastUpdated = nextStepsResult.data?.[0]?.updated_at || null
      
      // Build maps for state-specific tables for O(1) lookup
      const marketMetricsMap = new Map<string, string>()
      const talentMetricsMap = new Map<string, string>()
      
      marketMetricsResult.data?.forEach((record: any) => {
        if (record.state_code && record.updated_at) {
          const existing = marketMetricsMap.get(record.state_code)
          if (!existing || new Date(record.updated_at) > new Date(existing)) {
            marketMetricsMap.set(record.state_code, record.updated_at)
          }
        }
      })
      
      talentMetricsResult.data?.forEach((record: any) => {
        if (record.state_code && record.updated_at) {
          const existing = talentMetricsMap.get(record.state_code)
          if (!existing || new Date(record.updated_at) > new Date(existing)) {
            talentMetricsMap.set(record.state_code, record.updated_at)
          }
        }
      })
      
      // Build freshness for each state (now O(50) iterations, no nested DB calls)
      for (const state of usStates) {
        const stateFreshness: TableFreshness[] = []
        
        // Technology Vendors (same for all states)
        const techDays = techVendorsLastUpdated 
          ? Math.floor((new Date().getTime() - new Date(techVendorsLastUpdated).getTime()) / (1000 * 60 * 60 * 24))
          : null
        stateFreshness.push({
          table_name: 'technology_vendors',
          display_name: 'Technology Vendors',
          icon: Server,
          last_updated: techVendorsLastUpdated,
          days_since_update: techDays,
          needs_review: !techVendorsLastUpdated || (techDays !== null && techDays > 90)
        })
        
        // Budget Templates (same for all states)
        const budgetDays = budgetTemplatesLastUpdated 
          ? Math.floor((new Date().getTime() - new Date(budgetTemplatesLastUpdated).getTime()) / (1000 * 60 * 60 * 24))
          : null
        stateFreshness.push({
          table_name: 'budget_templates',
          display_name: 'Budget Templates',
          icon: DollarSign,
          last_updated: budgetTemplatesLastUpdated,
          days_since_update: budgetDays,
          needs_review: !budgetTemplatesLastUpdated || (budgetDays !== null && budgetDays > 90)
        })
        
        // Market Metrics (state-specific)
        const marketLastUpdated = marketMetricsMap.get(state.code) || null
        const marketDays = marketLastUpdated 
          ? Math.floor((new Date().getTime() - new Date(marketLastUpdated).getTime()) / (1000 * 60 * 60 * 24))
          : null
        stateFreshness.push({
          table_name: 'market_metrics',
          display_name: 'Market Metrics',
          icon: TrendingUp,
          last_updated: marketLastUpdated,
          days_since_update: marketDays,
          needs_review: !marketLastUpdated || (marketDays !== null && marketDays > 90)
        })
        
        // Talent Metrics (state-specific)
        const talentLastUpdated = talentMetricsMap.get(state.code) || null
        const talentDays = talentLastUpdated 
          ? Math.floor((new Date().getTime() - new Date(talentLastUpdated).getTime()) / (1000 * 60 * 60 * 24))
          : null
        stateFreshness.push({
          table_name: 'talent_metrics',
          display_name: 'Talent Metrics',
          icon: Users,
          last_updated: talentLastUpdated,
          days_since_update: talentDays,
          needs_review: !talentLastUpdated || (talentDays !== null && talentDays > 90)
        })
        
        // Next Steps Templates (same for all states)
        const nextStepsDays = nextStepsLastUpdated 
          ? Math.floor((new Date().getTime() - new Date(nextStepsLastUpdated).getTime()) / (1000 * 60 * 60 * 24))
          : null
        stateFreshness.push({
          table_name: 'next_steps_templates',
          display_name: 'Next Steps',
          icon: FileText,
          last_updated: nextStepsLastUpdated,
          days_since_update: nextStepsDays,
          needs_review: !nextStepsLastUpdated || (nextStepsDays !== null && nextStepsDays > 90)
        })
        
        freshnessMap.set(state.code, stateFreshness)
      }
      
      setTableFreshness(freshnessMap)
    } catch (error) {
      console.error('Error fetching data:', error)
      setNotification({ type: 'error', message: 'Failed to load data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const sendEmailReminder = async (toEmail: string, stateCode: string, dueDate: string, notes: string, recipientName?: string) => {
    try {
      const response = await fetch('/api/admin/send-review-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toEmail,
          name: recipientName,
          stateCode,
          dueDate,
          notes
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send email')
      }

      return true
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  const scheduleReview = async (stateCode: string, date: string, assignedTo: string, note: string) => {
    try {
      const { data: schedule, error: scheduleError } = await supabase
        .from('review_schedules')
        .insert({
          state_code: stateCode,
          scheduled_date: new Date(date).toISOString(),
          assigned_to: assignedTo || null,
          notes: note,
          status: 'pending',
          reminder_sent: false
        })
        .select()
        .single()

      if (scheduleError) throw scheduleError

      if (assignedTo) {
        const assignee = assignees.find(a => a.id === assignedTo)
        
        // Create in-app notification
        await supabase.from('notifications').insert({
          user_id: assignedTo,
          type: 'review_assignment',
          title: `Data Review Assigned: ${stateCode}`,
          message: `You have been assigned to review report data for ${stateCode} by ${new Date(date).toLocaleDateString()}.`,
          priority: 'medium',
          link: `/admin/data/verification?state=${stateCode}`
        })

        // Send email notification
        if (assignee?.email) {
          await sendEmailReminder(
            assignee.email,
            stateCode,
            new Date(date).toLocaleDateString(),
            note,
            assignee.full_name
          )
        }
      }

      setNotification({ type: 'success', message: `Review scheduled for ${stateCode} on ${new Date(date).toLocaleDateString()}` })
      fetchData()
      setIsScheduleModalOpen(false)
      setSelectedState(null)
      setScheduleDate('')
      setScheduleAssignee('')
      setScheduleNote('')
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error scheduling review:', error)
      setNotification({ type: 'error', message: 'Failed to schedule review' })
    }
  }

  const sendReminder = async (reviewId: string, stateCode: string, assignedTo: string, scheduledDate: string) => {
    setSendingReminder(reviewId)
    try {
      const assignee = assignees.find(a => a.id === assignedTo)
      if (!assignee) throw new Error('Assignee not found')

      await supabase.from('notifications').insert({
        user_id: assignedTo,
        type: 'review_reminder',
        title: `Reminder: ${stateCode} Data Review Due Soon`,
        message: `Your scheduled review for ${stateCode} report data is due on ${new Date(scheduledDate).toLocaleDateString()}.`,
        priority: 'high',
        link: `/admin/data/verification?state=${stateCode}`
      })

      await sendEmailReminder(
        assignee.email,
        stateCode,
        new Date(scheduledDate).toLocaleDateString(),
        `This is a reminder that your review for ${stateCode} is due soon.`,
        assignee.full_name
      )

      await supabase
        .from('review_schedules')
        .update({ reminder_sent: true })
        .eq('id', reviewId)

      setNotification({ type: 'success', message: `Reminder sent to ${assignee.email}` })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error sending reminder:', error)
      setNotification({ type: 'error', message: 'Failed to send reminder' })
    } finally {
      setSendingReminder(null)
    }
  }

  const cancelReview = async (reviewId: string, stateCode: string) => {
    if (!confirm(`Cancel the scheduled review for ${stateCode}?`)) return

    try {
      await supabase
        .from('review_schedules')
        .update({ status: 'cancelled' })
        .eq('id', reviewId)

      setNotification({ type: 'success', message: `Review for ${stateCode} cancelled` })
      fetchData()
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error cancelling review:', error)
      setNotification({ type: 'error', message: 'Failed to cancel review' })
    }
  }

  const markAsReviewed = async (stateCode: string) => {
    try {
      const pendingReview = scheduledReviews.find(r => r.state_code === stateCode && r.status === 'pending')
      if (pendingReview) {
        await supabase
          .from('review_schedules')
          .update({ status: 'completed' })
          .eq('id', pendingReview.id)
      }

      setNotification({ type: 'success', message: `${stateCode} marked as reviewed` })
      fetchData()
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Error marking reviewed:', error)
      setNotification({ type: 'error', message: 'Failed to mark as reviewed' })
    }
  }

  const getNeedsReviewCount = (stateCode: string): number => {
    const freshness = tableFreshness.get(stateCode) || []
    return freshness.filter(f => f.needs_review).length
  }

  const getOverallStatus = (stateCode: string): { status: string; color: string; bgColor: string } => {
    const needsReviewCount = getNeedsReviewCount(stateCode)
    if (needsReviewCount === 0) {
      return { status: 'Up to Date', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' }
    }
    if (needsReviewCount <= 2) {
      return { status: `${needsReviewCount} table${needsReviewCount > 1 ? 's' : ''} need review`, color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' }
    }
    return { status: `${needsReviewCount} tables need review`, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' }
  }

  const getUpcomingReviews = () => {
    const now = new Date()
    return scheduledReviews
      .filter(r => r.status === 'pending' && new Date(r.scheduled_date) >= now)
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
  }

  const getOverdueReviews = () => {
    const now = new Date()
    return scheduledReviews
      .filter(r => r.status === 'pending' && new Date(r.scheduled_date) < now)
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
  }

  const filteredStates = usStates.filter(state => {
    const matchesSearch = state.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const upcomingReviews = getUpcomingReviews()
  const overdueReviews = getOverdueReviews()
  const selectedStateData = selectedState ? usStates.find(s => s.code === selectedState) : null
  const selectedStateFreshness = selectedState ? tableFreshness.get(selectedState) || [] : []

  if (loading && tableFreshness.size === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gold-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Report Data Verification</h1>
        <p className="text-navy-600">Track freshness of report data tables and schedule reviews</p>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}
      
      {/* Upcoming Reviews Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowUpcomingReviews(!showUpcomingReviews)}
          className="flex items-center gap-2 text-lg font-semibold text-navy-900 mb-3"
        >
          <Bell className="w-5 h-5" />
          Upcoming & Overdue Reviews
          <ChevronRight className={`w-4 h-4 transition-transform ${showUpcomingReviews ? 'rotate-90' : ''}`} />
        </button>
        
        {showUpcomingReviews && (
          <div className="space-y-3">
            {overdueReviews.length > 0 && (
              <div className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Overdue Reviews ({overdueReviews.length})
                </h3>
                <div className="space-y-2">
                  {overdueReviews.map(review => {
                    const assignee = assignees.find(a => a.id === review.assigned_to)
                    return (
                      <div key={review.id} className="flex items-center justify-between bg-white rounded p-3">
                        <div>
                          <p className="font-medium">{review.state_code}</p>
                          <p className="text-xs text-red-600">
                            Due: {new Date(review.scheduled_date).toLocaleDateString()}
                          </p>
                          {assignee && (
                            <p className="text-xs text-gray-400">Assigned to: {assignee.full_name || assignee.email}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => markAsReviewed(review.state_code)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => sendReminder(review.id, review.state_code, review.assigned_to || '', review.scheduled_date)}
                            disabled={sendingReminder === review.id}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                          >
                            {sendingReminder === review.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            Remind
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {upcomingReviews.length > 0 && (
              <div className="border-l-4 border-gold-500 bg-gold-50 rounded-lg p-4">
                <h3 className="font-semibold text-gold-800 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Scheduled Reviews ({upcomingReviews.length})
                </h3>
                <div className="space-y-2">
                  {upcomingReviews.map(review => {
                    const assignee = assignees.find(a => a.id === review.assigned_to)
                    const daysUntil = Math.ceil((new Date(review.scheduled_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    
                    return (
                      <div key={review.id} className="flex items-center justify-between bg-white rounded p-3">
                        <div>
                          <p className="font-medium">{review.state_code}</p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(review.scheduled_date).toLocaleDateString()} 
                            {daysUntil <= 7 && daysUntil > 0 && ` (${daysUntil} days left)`}
                          </p>
                          {assignee && (
                            <p className="text-xs text-gray-400">Assigned to: {assignee.full_name || assignee.email}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => sendReminder(review.id, review.state_code, review.assigned_to || '', review.scheduled_date)}
                            disabled={sendingReminder === review.id}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                          >
                            {sendingReminder === review.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            Remind
                          </button>
                          <button
                            onClick={() => cancelReview(review.id, review.state_code)}
                            className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {upcomingReviews.length === 0 && overdueReviews.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No upcoming or overdue reviews scheduled</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by state code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
          />
        </div>
      </div>
      
      {/* States Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStates.map((state) => {
          const needsReviewCount = getNeedsReviewCount(state.code)
          const status = getOverallStatus(state.code)
          const scheduledReview = scheduledReviews.find(r => r.state_code === state.code && r.status === 'pending')
          
          return (
            <div
              key={state.code}
              className={`border rounded-lg p-4 transition-all ${status.bgColor}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-navy-900">{state.code}</h3>
                  <p className="text-sm text-gray-500">{state.name}</p>
                </div>
                <div className={`text-xs font-medium ${status.color}`}>
                  {status.status}
                </div>
              </div>
              
              {/* What needs review - list of tables */}
              <div className="mb-3 space-y-1">
                {tableFreshness.get(state.code)?.map((table) => (
                  table.needs_review && (
                    <div key={table.table_name} className="flex items-center gap-2 text-xs text-gray-600">
                      <table.icon className="w-3 h-3 text-yellow-500" />
                      <span>{table.display_name}</span>
                      {table.days_since_update && (
                        <span className="text-gray-400">({table.days_since_update} days)</span>
                      )}
                      {!table.last_updated && (
                        <span className="text-red-400">(No data)</span>
                      )}
                    </div>
                  )
                ))}
                {needsReviewCount === 0 && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    All tables up to date
                  </div>
                )}
              </div>
              
              {scheduledReview && (
                <div className="mb-3 text-xs text-gold-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Review scheduled: {new Date(scheduledReview.scheduled_date).toLocaleDateString()}
                </div>
              )}
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => markAsReviewed(state.code)}
                  disabled={needsReviewCount === 0}
                  className={`flex-1 px-3 py-1.5 text-sm rounded transition-colors ${
                    needsReviewCount === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-500'
                  }`}
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => {
                    setSelectedState(state.code)
                    setIsScheduleModalOpen(true)
                  }}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  Schedule
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      {filteredStates.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No states match your search</p>
        </div>
      )}
      
      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedStateData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Schedule Review for {selectedStateData.code}</h3>
              <button onClick={() => { setIsScheduleModalOpen(false); setSelectedState(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* What needs review summary */}
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800 mb-2">Tables needing review:</p>
                <div className="space-y-1">
                  {selectedStateFreshness.filter(t => t.needs_review).map(table => {
                    const Icon = table.icon
                    return (
                      <div key={table.table_name} className="flex items-center gap-2 text-xs text-yellow-700">
                        <Icon className="w-3 h-3" />
                        {table.display_name}
                        {!table.last_updated ? ' (No data)' : ` (${table.days_since_update} days old)`}
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Date *</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Optional)</label>
                <select
                  value={scheduleAssignee}
                  onChange={(e) => setScheduleAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="">Unassigned</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.full_name || assignee.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={scheduleNote}
                  onChange={(e) => setScheduleNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gold-500 focus:border-gold-500"
                  placeholder="Add any specific instructions or context..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => { setIsScheduleModalOpen(false); setSelectedState(null); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (scheduleDate) {
                    scheduleReview(selectedStateData.code, scheduleDate, scheduleAssignee, scheduleNote)
                  }
                }}
                disabled={!scheduleDate}
                className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-500 disabled:opacity-50"
              >
                Schedule Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}