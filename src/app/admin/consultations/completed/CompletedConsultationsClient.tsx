// src/app/admin/consultations/completed/CompletedConsultationsClient.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, User, Building2, CheckCircle, XCircle, 
  AlertCircle, DollarSign, Search, Filter, ChevronDown, Download,
  FileText, Eye, Video, ExternalLink, Copy, X, Mail, Phone
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Consultation {
  id: string
  customer_name: string
  company_name: string
  customer_email?: string
  customer_phone?: string
  consultation_date: string
  consultation_type: 'discovery' | 'strategy' | 'technical' | 'compliance'
  status: 'completed' | 'cancelled' | 'no-show'
  converted_to_sale: boolean
  sale_amount?: number
  notes?: string | null
  meeting_link?: string | null
}

interface Props {
  initialConsultations: Consultation[]
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-600 bg-green-50' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-red-600 bg-red-50' },
  'no-show': { icon: AlertCircle, label: 'No Show', color: 'text-amber-600 bg-amber-50' }
}

const CONSULTATION_TYPES = {
  discovery: { label: 'Discovery Call', color: 'bg-purple-100 text-purple-700' },
  strategy: { label: 'Strategy Session', color: 'bg-blue-100 text-blue-700' },
  technical: { label: 'Technical Review', color: 'bg-amber-100 text-amber-700' },
  compliance: { label: 'Compliance Check', color: 'bg-green-100 text-green-700' },
  enterprise: { label: 'Enterprise Strategy', color: 'bg-indigo-100 text-indigo-700' }
}

export default function CompletedConsultationsClient({ initialConsultations }: Props) {
  const [consultations] = useState(initialConsultations)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all')
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Calculate metrics
  const metrics = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    cancelled: consultations.filter(c => c.status === 'cancelled').length,
    noShow: consultations.filter(c => c.status === 'no-show').length,
    converted: consultations.filter(c => c.converted_to_sale).length,
    revenue: consultations.reduce((sum, c) => sum + (c.sale_amount || 0), 0)
  }

  // Filter consultations
  const filteredConsultations = consultations.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (typeFilter !== 'all' && c.consultation_type !== typeFilter) return false
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        c.customer_name.toLowerCase().includes(term) ||
        c.company_name.toLowerCase().includes(term) ||
        (c.customer_email?.toLowerCase().includes(term) || false) ||
        (c.customer_phone?.includes(term) || false)
      )
    }
    
    return true
  })

  const handleJoinMeeting = (link: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const handleCopyMeetingLink = (link: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(link)
    toast.success('Meeting link copied to clipboard')
  }

  const handleViewDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setShowDetailsModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Consultation History</h1>
          <p className="text-navy-600">View completed, cancelled, and no-show consultations</p>
        </div>
        <Link
          href="/admin/consultations/upcoming"
          className="px-4 py-2 border border-navy-200 text-navy-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          View Upcoming
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-navy-900">{metrics.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{metrics.cancelled}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">No Show</p>
          <p className="text-2xl font-bold text-amber-600">{metrics.noShow}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Converted</p>
          <p className="text-2xl font-bold text-gold-600">{metrics.converted}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-navy-500 mb-1">Revenue</p>
          <p className="text-2xl font-bold text-green-600">${metrics.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="Search by name, company, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="discovery">Discovery</option>
            <option value="strategy">Strategy</option>
            <option value="technical">Technical</option>
            <option value="compliance">Compliance</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">This Year</option>
          </select>

          <button className="px-4 py-2 border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
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
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">Client</th>
              <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">Date & Time</th>
              <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">Type</th>
              <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">Status</th>
              <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">Outcome</th>
              <th className="text-left text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">Meeting</th>
              <th className="text-right text-xs font-medium text-navy-500 uppercase tracking-wider py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredConsultations.map((consultation) => {
              const StatusIcon = STATUS_CONFIG[consultation.status].icon
              
              return (
                <tr key={consultation.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-navy-900">{consultation.customer_name}</p>
                      <p className="text-sm text-navy-500">{consultation.company_name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-navy-900">
                        {format(parseISO(consultation.consultation_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-navy-500">
                        {format(parseISO(consultation.consultation_date), 'h:mm a')}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      CONSULTATION_TYPES[consultation.consultation_type].color
                    )}>
                      {CONSULTATION_TYPES[consultation.consultation_type].label}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      STATUS_CONFIG[consultation.status].color
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      {STATUS_CONFIG[consultation.status].label}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {consultation.converted_to_sale ? (
                      <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                        <DollarSign className="w-3 h-3" />
                        ${consultation.sale_amount?.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-navy-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {consultation.meeting_link ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleJoinMeeting(consultation.meeting_link!, e)}
                          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          title="Join meeting"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleCopyMeetingLink(consultation.meeting_link!, e)}
                          className="p-1 text-navy-400 hover:text-navy-600 hover:bg-slate-100 rounded transition-colors"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={consultation.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-navy-400 hover:text-navy-600 hover:bg-slate-100 rounded transition-colors"
                          title="Opens in new tab"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-navy-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleViewDetails(consultation)}
                      className="inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredConsultations.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-navy-300 mx-auto mb-4" />
            <p className="text-navy-500">No consultations found matching your filters</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
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
                {/* Status Badge */}
                <div className="flex justify-end">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                    STATUS_CONFIG[selectedConsultation.status].color
                  )}>
                    {(() => {
                      const Icon = STATUS_CONFIG[selectedConsultation.status].icon
                      return <Icon className="w-4 h-4" />
                    })()}
                    {STATUS_CONFIG[selectedConsultation.status].label}
                  </span>
                </div>

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
                    {selectedConsultation.customer_email && (
                      <div>
                        <p className="text-xs text-navy-400">Email</p>
                        <p className="text-navy-900 break-all flex items-center gap-1">
                          <Mail className="w-3 h-3 text-navy-400" />
                          {selectedConsultation.customer_email}
                        </p>
                      </div>
                    )}
                    {selectedConsultation.customer_phone && (
                      <div>
                        <p className="text-xs text-navy-400">Phone</p>
                        <p className="text-navy-900 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-navy-400" />
                          {selectedConsultation.customer_phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Consultation Details */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-navy-500 mb-3">Consultation Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-navy-400" />
                      <span className="text-navy-900">
                        {format(parseISO(selectedConsultation.consultation_date), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-navy-400" />
                      <span className="text-navy-900">
                        {format(parseISO(selectedConsultation.consultation_date), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        CONSULTATION_TYPES[selectedConsultation.consultation_type].color
                      )}>
                        {CONSULTATION_TYPES[selectedConsultation.consultation_type].label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sale Information */}
                {selectedConsultation.converted_to_sale && selectedConsultation.sale_amount && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Sale Information
                    </h3>
                    <p className="text-green-800 font-semibold">
                      Converted to sale: ${selectedConsultation.sale_amount.toLocaleString()}
                    </p>
                  </div>
                )}

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
                          onClick={(e) => handleJoinMeeting(selectedConsultation.meeting_link!, e)}
                          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Video className="w-5 h-5" />
                          Join Meeting
                        </button>
                        <button
                          onClick={(e) => handleCopyMeetingLink(selectedConsultation.meeting_link!, e)}
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

                {/* Close Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-full px-4 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
                  >
                    Close
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