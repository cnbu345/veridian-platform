// src/app/admin/consultations/completed/CompletedConsultationsClient.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, User, Building2, CheckCircle, XCircle, 
  AlertCircle, DollarSign, Search, Filter, ChevronDown, Download,
  FileText, Eye
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'

interface Consultation {
  id: string
  customer_name: string
  company_name: string
  consultation_date: string
  consultation_type: 'discovery' | 'strategy' | 'technical' | 'compliance'
  status: 'completed' | 'cancelled' | 'no-show'
  converted_to_sale: boolean
  sale_amount?: number
  notes?: string | null
}

interface Props {
  initialConsultations: Consultation[]
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-600 bg-green-50' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-red-600 bg-red-50' },
  'no-show': { icon: AlertCircle, label: 'No Show', color: 'text-amber-600 bg-amber-50' }
}

export default function CompletedConsultationsClient({ initialConsultations }: Props) {
  const [consultations] = useState(initialConsultations)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all')

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
        c.company_name.toLowerCase().includes(term)
      )
    }
    
    return true
  })

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
              placeholder="Search by name or company..."
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
                    <span className="capitalize text-navy-900">{consultation.consultation_type}</span>
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
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/consultations/${consultation.id}`}
                      className="inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
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
    </div>
  )
}