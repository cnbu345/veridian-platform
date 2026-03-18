// src/app/dashboard/components/ReportsList.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Search,
  ArrowUpDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react'

interface ReportsListProps {
  reports: any[]
}

export default function ReportsList({ reports }: ReportsListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company'>('newest')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'generating'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Get counts
  const statusCounts = reports.reduce((acc, report) => {
    const status = report.report_content?.status || report.status
    if (status === 'ready' || status === 'generating' || status === 'pending') {
      acc[status === 'pending' ? 'generating' : status] = (acc[status === 'pending' ? 'generating' : status] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Filter and search
  const filteredReports = reports
    .filter(report => {
      if (filterStatus !== 'all') {
        const status = report.report_content?.status || report.status
        const normalizedStatus = status === 'pending' ? 'generating' : status
        if (normalizedStatus !== filterStatus) return false
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          report.company_name?.toLowerCase().includes(searchLower) ||
          report.city?.toLowerCase().includes(searchLower) ||
          report.state?.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA
        case 'oldest':
          return dateA - dateB
        case 'company':
          return (a.company_name || '').localeCompare(b.company_name || '')
        default:
          return dateB - dateA
      }
    })

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status === 'pending' ? 'generating' : status
    switch (normalizedStatus) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'generating':
        return <Clock className="w-4 h-4 text-amber-600 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-navy-400" />
    }
  }

  const getStatusText = (status: string) => {
    const normalizedStatus = status === 'pending' ? 'generating' : status
    switch (normalizedStatus) {
      case 'ready':
        return 'Ready'
      case 'generating':
        return 'Generating'
      default:
        return status
    }
  }

  const formatBudget = (budget: string) => {
    const budgets: Record<string, string> = {
      'under-50k': 'Under $50k',
      '50k-100k': '$50k - $100k',
      '100k-250k': '$100k - $250k',
      '250k-500k': '$250k - $500k',
      '500k-plus': '$500k+',
    }
    return budgets[budget] || budget
  }

  const formatMarketTier = (tier: string) => {
    const tiers: Record<string, string> = {
      'major': 'Major Market',
      'suburban': 'Suburban',
      'rural': 'Rural',
    }
    return tiers[tier] || tier
  }

  const handleDownload = async (e: React.MouseEvent, report: any) => {
    e.preventDefault()
    e.stopPropagation()
    
    const status = report.report_content?.status || report.status
    if (status !== 'ready') {
      alert('Report is not ready for download yet')
      return
    }
    
    // Import dynamically to avoid circular dependencies
    const { downloadReportPDF } = await import('@/lib/pdf/generator')
    
    try {
      const blob = await downloadReportPDF(report)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Regulatory_Report.pdf`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy-900">Reports</h2>
          <p className="text-sm text-navy-500 mt-0.5">{filteredReports.length} total</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="w-56 pl-9 pr-4 py-2 bg-white border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-4 pr-10 py-2 bg-white border border-navy-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 cursor-pointer hover:border-navy-300 transition-colors"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="company">Company name</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-100">
        <button
          onClick={() => setFilterStatus('all')}
          className={`relative px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'text-gold-600'
              : 'text-navy-500 hover:text-navy-700'
          }`}
        >
          All
          {filterStatus === 'all' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-600"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
        
        <button
          onClick={() => setFilterStatus('ready')}
          className={`relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            filterStatus === 'ready'
              ? 'text-green-600'
              : 'text-navy-500 hover:text-navy-700'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Ready
          {statusCounts.ready > 0 && (
            <span className={`ml-1 text-xs ${
              filterStatus === 'ready' ? 'text-green-600' : 'text-navy-400'
            }`}>
              {statusCounts.ready}
            </span>
          )}
          {filterStatus === 'ready' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
        
        <button
          onClick={() => setFilterStatus('generating')}
          className={`relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            filterStatus === 'generating'
              ? 'text-amber-600'
              : 'text-navy-500 hover:text-navy-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          In Progress
          {(statusCounts.generating || 0) > 0 && (
            <span className={`ml-1 text-xs ${
              filterStatus === 'generating' ? 'text-amber-600' : 'text-navy-400'
            }`}>
              {statusCounts.generating || 0}
            </span>
          )}
          {filterStatus === 'generating' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-3 bg-navy-50 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-navy-400" />
          </div>
          <h3 className="text-sm font-medium text-navy-900 mb-1">No reports found</h3>
          <p className="text-sm text-navy-500">
            {searchTerm || filterStatus !== 'all' 
              ? "Try adjusting your search or filters"
              : "Get started by generating your first report"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report) => {
              const status = report.report_content?.status || report.status
              const isExpanded = expandedId === report.id
              const reportContent = report.report_content || {}
              
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                  className="bg-white rounded-lg border border-navy-100 overflow-hidden hover:border-navy-200 transition-colors"
                >
                  {/* Main row - Always visible */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      {/* Left side - Company info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-navy-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-medium text-navy-900">
                              {report.company_name}
                            </h4>
                            <span className="text-xs text-navy-400">•</span>
                            <span className="text-sm text-navy-500">
                              {report.city}, {report.state}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-navy-400">
                              {new Date(report.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(status)}
                              <span className={
                                status === 'ready' ? 'text-green-600' :
                                status === 'generating' || status === 'pending' ? 'text-amber-600' :
                                'text-navy-400'
                              }>
                                {getStatusText(status)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/report/${report.id}`}
                          className="p-2 hover:bg-navy-50 rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-4 h-4 text-navy-500" />
                        </Link>
                        
                        <button
                          onClick={(e) => handleDownload(e, report)}
                          disabled={status !== 'ready'}
                          className="p-2 hover:bg-navy-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 text-navy-500" />
                        </button>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                          className="p-2 hover:bg-navy-50 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-navy-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-navy-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded summary */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-navy-100">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-xs text-navy-400 block mb-1">Industry</span>
                              <span className="text-navy-700">{report.industry || reportContent.industry || 'Not specified'}</span>
                            </div>
                            <div>
                              <span className="text-xs text-navy-400 block mb-1">Budget</span>
                              <span className="text-navy-700">{formatBudget(report.budget || reportContent.budget)}</span>
                            </div>
                            <div>
                              <span className="text-xs text-navy-400 block mb-1">Market</span>
                              <span className="text-navy-700">{formatMarketTier(report.location_tier || reportContent.locationTier)}</span>
                            </div>
                            <div className="col-span-3">
                              <span className="text-xs text-navy-400 block mb-1">Primary Focus</span>
                              <span className="text-navy-700">{report.primaryFocus || reportContent.primaryFocus || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}