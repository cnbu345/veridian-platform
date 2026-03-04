// src/app/dashboard/DashboardClient.tsx
'use client'

import { cn } from '@/lib/utils/utils'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Scale,
  Building2, 
  Calendar,
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronDown,
  Video
} from 'lucide-react'
import EmptyState from './components/EmptyState'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface DashboardClientProps {
  user: User
  profile?: {
    full_name: string | null
    company_name: string | null
  } | null
  initialReports: any[]
  error?: string
}

interface Consultation {
  id: string
  consultation_date: string
  consultation_type: 'discovery' | 'strategy' | 'technical' | 'compliance'
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  meeting_link: string | null
  reminder_sent: boolean
  notes: string | null
}

export default function DashboardClient({ 
  user, 
  profile,
  initialReports, 
  error 
}: DashboardClientProps) {
  const [reports] = useState(initialReports)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [upcomingConsultations, setUpcomingConsultations] = useState<Consultation[]>([])
  const [loadingConsultations, setLoadingConsultations] = useState(true)

  // Fetch upcoming consultations
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const supabase = createClient()
        const now = new Date().toISOString()
        
        const { data, error } = await supabase
          .from('consultations')
          .select('*')
          .eq('status', 'scheduled')
          .gte('consultation_date', now)
          .order('consultation_date', { ascending: true })
          .limit(5)
        
        if (error) throw error
        setUpcomingConsultations(data || [])
      } catch (error) {
        console.error('Error fetching consultations:', error)
      } finally {
        setLoadingConsultations(false)
      }
    }

    fetchConsultations()
  }, [])

  // Get consultation type label
  const getTypeLabel = (type: string) => {
    const types = {
      discovery: 'Discovery Call',
      strategy: 'Strategy Session',
      technical: 'Technical Review',
      compliance: 'Compliance Check'
    }
    return types[type as keyof typeof types] || type
  }

  // Get first name from profile or fallback to email username
  const getFirstName = () => {
    if (profile && profile.full_name) {
      return profile.full_name.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'there'
  }

  // Stats calculation
  const totalReports = reports.length
  const reportsThisMonth = reports.filter(r => {
    const date = new Date(r.created_at)
    const now = new Date()
    return date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear()
  }).length

  const completedReports = reports.filter(r => 
    r.report_content?.status === 'ready' || r.status === 'ready'
  ).length

  // Filter reports based on status and search - only show active statuses
  const filteredReports = reports.filter(report => {
    const status = report.status
    // Only include non-failed reports in filters
    if (status === 'failed') return filterStatus === 'all'
    const matchesStatus = filterStatus === 'all' || status === filterStatus
    const matchesSearch = report.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.state.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">
            Welcome back, {getFirstName()}
          </h1>
          <p className="text-navy-600">
            Manage your regulatory intelligence reports and compliance analysis
          </p>
        </div>
        
        <Link
          href="/generate"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 hover:to-gold-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/25 group"
        >
          <Plus className="w-5 h-5 mr-2" />
          Generate New Report
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Stats Grid - Enhanced with better styling */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Reports', value: totalReports, color: 'navy', bg: 'navy' },
          { icon: Scale, label: 'This Month', value: reportsThisMonth, color: 'green', bg: 'green' },
          { icon: CheckCircle, label: 'Completed', value: completedReports, color: 'blue', bg: 'blue' },
          { icon: Clock, label: 'In Progress', value: totalReports - completedReports, color: 'amber', bg: 'amber' }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-gold-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  `bg-${stat.bg}-50 group-hover:bg-${stat.bg}-100`
                )}>
                  <Icon className={cn("w-5 h-5", `text-${stat.color}-600`)} />
                </div>
                <span className="text-2xl font-bold text-navy-900">{stat.value}</span>
              </div>
              <p className="text-sm text-navy-600">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Consultations Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-gold-600" />
            Upcoming Consultations
          </h3>
          <Link 
            href="/dashboard/consultations" 
            className="text-sm text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loadingConsultations ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingConsultations.length > 0 ? (
          <div className="space-y-3">
            {upcomingConsultations.slice(0, 2).map((consultation) => (
              <div key={consultation.id} className="flex items-center gap-3 group hover:bg-slate-50 p-2 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-navy-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">
                    {format(parseISO(consultation.consultation_date), 'MMM d, h:mm a')}
                  </p>
                  <p className="text-xs text-navy-500">
                    {getTypeLabel(consultation.consultation_type)}
                  </p>
                </div>
                {consultation.meeting_link && (
                  <a
                    href={consultation.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 bg-gold-50 text-gold-600 rounded-full hover:bg-gold-100 transition-colors font-medium"
                  >
                    Join
                  </a>
                )}
              </div>
            ))}
            
            {upcomingConsultations.length > 2 && (
              <Link
                href="/dashboard/consultations"
                className="block text-center text-xs text-navy-500 hover:text-navy-700 mt-2 pt-2 border-t border-slate-100"
              >
                +{upcomingConsultations.length - 2} more upcoming
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-navy-500 mb-3">No upcoming consultations</p>
            <Link
              href="/consultation"
              className="text-sm text-gold-600 hover:text-gold-700 font-medium inline-flex items-center gap-1"
            >
              Schedule one now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </motion.div>

      {/* Reports Section */}
      <div>
        {/* Section Header with Filters */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-600" />
            Your Reports
          </h2>
          
          {reports.length > 0 && (
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent w-64 bg-white placeholder:text-navy-400"
                />
              </div>

              {/* Status Filter - Only positive/neutral statuses */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-4 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent appearance-none bg-white text-navy-900"
                >
                  <option value="all">All Reports</option>
                  <option value="ready">Ready</option>
                  <option value="generating">Generating</option>
                  <option value="pending">In Progress</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === 'list' ? 'bg-navy-900 text-white' : 'text-navy-500 hover:bg-slate-100'
                  )}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === 'grid' ? 'bg-navy-900 text-white' : 'text-navy-500 hover:bg-slate-100'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Unable to Load Reports</h3>
            <p className="text-amber-600 mb-4">Please try refreshing the page</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Refresh Page
            </button>
          </motion.div>
        ) : reports.length === 0 ? (
          <EmptyState />
        ) : filteredReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-12 text-center"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No matching reports</h3>
            <p className="text-navy-600 mb-4">
              Try adjusting your search or filter
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="text-gold-600 hover:text-gold-700 font-semibold"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200 overflow-hidden shadow-sm"
              >
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/report/${report.id}`}
                      className="block hover:bg-slate-50 transition-colors group"
                    >
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            report.status === 'ready' ? 'bg-green-100' :
                            report.status === 'generating' || report.status === 'pending' ? 'bg-amber-100' :
                            'bg-navy-100'
                          )}>
                            <FileText className={cn(
                              "w-5 h-5",
                              report.status === 'ready' ? 'text-green-600' :
                              report.status === 'generating' || report.status === 'pending' ? 'text-amber-600' :
                              'text-navy-600'
                            )} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-navy-900 group-hover:text-gold-600 transition-colors">
                              {report.company_name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-navy-500">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {report.city}, {report.state}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(report.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                            report.status === 'ready' ? 'bg-green-100 text-green-800' :
                            report.status === 'generating' ? 'bg-amber-100 text-amber-800' :
                            report.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-800'
                          )}>
                            {report.status === 'generating' && <Clock className="w-3 h-3 animate-spin" />}
                            {report.status === 'pending' && <Clock className="w-3 h-3 animate-spin" />}
                            {report.status === 'ready' ? 'Ready' :
                             report.status === 'generating' ? 'Generating' :
                             report.status === 'pending' ? 'In Progress' :
                             'Processing'}
                          </span>
                          <ArrowRight className="w-4 h-4 text-navy-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 gap-4"
              >
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/report/${report.id}`}
                      className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-gold-300 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          report.status === 'ready' ? 'bg-green-100' :
                          report.status === 'generating' || report.status === 'pending' ? 'bg-amber-100' :
                          'bg-navy-100'
                        )}>
                          <FileText className={cn(
                            "w-6 h-6",
                            report.status === 'ready' ? 'text-green-600' :
                            report.status === 'generating' || report.status === 'pending' ? 'text-amber-600' :
                            'text-navy-600'
                          )} />
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          report.status === 'ready' ? 'bg-green-100 text-green-800' :
                          report.status === 'generating' ? 'bg-amber-100 text-amber-800' :
                          report.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        )}>
                          {report.status === 'ready' ? 'Ready' :
                           report.status === 'generating' ? 'Generating' :
                           report.status === 'pending' ? 'In Progress' :
                           'Processing'}
                        </span>
                      </div>

                      <h3 className="font-semibold text-navy-900 mb-1 group-hover:text-gold-600 transition-colors">
                        {report.company_name}
                      </h3>
                      
                      <p className="text-sm text-navy-500 mb-4">
                        {report.city}, {report.state}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-navy-400">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-gold-600 font-medium flex items-center gap-1">
                          View
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}