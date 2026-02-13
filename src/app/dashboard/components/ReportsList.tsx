'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Eye, 
  MoreVertical,
  Building2,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import ReportCard from './ReportCard'

interface ReportsListProps {
  reports: any[]
}

export default function ReportsList({ reports }: ReportsListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'generating'>('all')

  const filteredReports = reports
    .filter(report => {
      if (filterStatus === 'all') return true
      const status = report.report_content?.status || report.status
      return status === filterStatus
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-navy-700">Filter:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                  ${filterStatus === 'all' 
                    ? 'bg-navy-900 text-white' 
                    : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('ready')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                  ${filterStatus === 'ready' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
                  }`}
              >
                Ready
              </button>
              <button
                onClick={() => setFilterStatus('generating')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                  ${filterStatus === 'generating' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
                  }`}
              >
                Generating
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-navy-700">Sort:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                  ${sortBy === 'newest' 
                    ? 'bg-navy-900 text-white' 
                    : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
                  }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                  ${sortBy === 'oldest' 
                    ? 'bg-navy-900 text-white' 
                    : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
                  }`}
              >
                Oldest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            No reports found
          </h3>
          <p className="text-navy-600 mb-6">
            {filterStatus !== 'all' 
              ? `No ${filterStatus} reports match your filter.` 
              : 'You haven\'t generated any reports yet.'}
          </p>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="text-gold-600 hover:text-gold-700 font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ReportCard report={report} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}