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
  Calendar,
  Layout,
  Palette,
  Crown,
  Sparkles,
  Trash2
} from 'lucide-react'
import { downloadPDF } from '@/lib/pdf'  // Import from factory pattern

interface ReportsListProps {
  reports: any[]
  onDelete?: (reportId: string) => void
}

export default function ReportsList({ reports, onDelete }: ReportsListProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'company'>('newest')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'generating'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

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
          report.state?.toLowerCase().includes(searchLower) ||
          report.template?.name?.toLowerCase().includes(searchLower)
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
        return <AlertCircle className="w-4 h-4 text-navy-400" />
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

  const getStatusBadgeClass = (status: string) => {
    const normalizedStatus = status === 'pending' ? 'generating' : status
    switch (normalizedStatus) {
      case 'ready':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'generating':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200'
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
      'suburban': 'Suburban Market',
      'rural': 'Rural Market',
    }
    return tiers[tier] || tier
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDownload = async (e: React.MouseEvent, report: any) => {
    e.preventDefault()
    e.stopPropagation()
    
    const status = report.report_content?.status || report.status
    if (status !== 'ready') {
      alert('Report is not ready for download yet. Please wait for generation to complete.')
      return
    }
    
    setDownloadingId(report.id)
    
    try {
      // Use the factory pattern - automatically selects correct generator based on template
      const blob = await downloadPDF(report)
      
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF is empty')
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fileName = `${report.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Regulatory_Report.pdf`
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      console.log(`✅ Download completed for ${report.company_name}`)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download PDF. Please try again or contact support.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (e: React.MouseEvent, reportId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      onDelete?.(reportId)
    }
  }

  // Get template badge color based on template styles
  const getTemplateBadgeStyle = (template: any) => {
    if (!template) return {}
    return {
      backgroundColor: `${template.styles?.primary_color || '#0A1A2F'}10`,
      borderColor: template.styles?.primary_color || '#0A1A2F',
      color: template.styles?.primary_color || '#0A1A2F'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-navy-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-600" />
            All Reports
          </h2>
          <p className="text-sm text-navy-500 mt-0.5">
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, location, or template..."
              className="w-64 pl-9 pr-4 py-2 bg-white border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
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
      <div className="flex items-center gap-1 border-b border-navy-100">
        <button
          onClick={() => setFilterStatus('all')}
          className={`relative px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'text-gold-600'
              : 'text-navy-500 hover:text-navy-700'
          }`}
        >
          All
          <span className="ml-2 text-xs text-navy-400">{reports.length}</span>
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
          <div className="w-16 h-16 mx-auto mb-4 bg-navy-50 rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-navy-400" />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">No reports found</h3>
          <p className="text-sm text-navy-500 max-w-sm mx-auto">
            {searchTerm || filterStatus !== 'all' 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Get started by generating your first regulatory intelligence report."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredReports.map((report) => {
              const status = report.report_content?.status || report.status
              const isExpanded = expandedId === report.id
              const reportContent = report.report_content || {}
              const template = report.template || report.user_templates
              const isDownloading = downloadingId === report.id
              
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                  className="bg-white rounded-xl border border-navy-100 overflow-hidden hover:border-navy-200 hover:shadow-md transition-all duration-200"
                >
                  {/* Main row - Always visible */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left side - Company info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Icon with status indicator */}
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-navy-50 to-gold-50 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-navy-600" />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            status === 'ready' ? 'bg-green-500' : 
                            status === 'generating' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold text-navy-900 truncate">
                              {report.company_name}
                            </h4>
                            <span className="text-xs text-navy-400">•</span>
                            <div className="flex items-center gap-1 text-sm text-navy-500">
                              <MapPin className="w-3 h-3" />
                              <span>{report.city}, {report.state}</span>
                            </div>
                            
                            {/* TEMPLATE BADGE - Enhanced with custom colors */}
                            {template && (
                              <div 
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all hover:shadow-sm"
                                style={getTemplateBadgeStyle(template)}
                              >
                                <Layout className="w-3 h-3" />
                                <span>{template.name}</span>
                                {template.is_default && (
                                  <span className="ml-0.5 text-[10px] opacity-70">(Default)</span>
                                )}
                              </div>
                            )}
                            
                            {/* Enterprise Badge for custom templates */}
                            {template && !template.is_default && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-gold-50 rounded-full">
                                <Crown className="w-3 h-3 text-gold-600" />
                                <span className="text-[10px] font-medium text-gold-700">White-Label</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 text-navy-400">
                              <Calendar className="w-3 h-3" />
                              {formatDate(report.created_at)}
                            </span>
                            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${getStatusBadgeClass(status)}`}>
                              {getStatusIcon(status)}
                              <span className="font-medium">{getStatusText(status)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/report/${report.id}`}
                          className="p-2 hover:bg-navy-50 rounded-lg transition-colors group"
                          title="View Report"
                        >
                          <Eye className="w-4 h-4 text-navy-500 group-hover:text-navy-700" />
                        </Link>
                        
                        <button
                          onClick={(e) => handleDownload(e, report)}
                          disabled={status !== 'ready' || isDownloading}
                          className="p-2 hover:bg-navy-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                          title={status === 'ready' ? 'Download PDF' : 'Report not ready'}
                        >
                          {isDownloading ? (
                            <Clock className="w-4 h-4 text-gold-600 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 text-navy-500 group-hover:text-navy-700" />
                          )}
                        </button>

                        {onDelete && (
                          <button
                            onClick={(e) => handleDelete(e, report.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4 text-navy-400 group-hover:text-red-500" />
                          </button>
                        )}

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

                  {/* Expanded summary with template preview */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-2 border-t border-navy-100 bg-navy-50/30">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                              <span className="text-xs font-medium text-navy-500 uppercase tracking-wide block mb-2">
                                Industry
                              </span>
                              <p className="text-sm text-navy-800 font-medium">
                                {report.industry || reportContent.industry || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-navy-500 uppercase tracking-wide block mb-2">
                                Compliance Budget
                              </span>
                              <p className="text-sm text-navy-800 font-medium">
                                {formatBudget(report.budget || reportContent.budget)}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-navy-500 uppercase tracking-wide block mb-2">
                                Market Classification
                              </span>
                              <p className="text-sm text-navy-800 font-medium">
                                {formatMarketTier(report.location_tier || reportContent.locationTier)}
                              </p>
                            </div>
                            <div className="md:col-span-3">
                              <span className="text-xs font-medium text-navy-500 uppercase tracking-wide block mb-2">
                                Primary Compliance Focus
                              </span>
                              <p className="text-sm text-navy-800">
                                {report.primaryFocus || reportContent.primaryFocus || 'Not specified'}
                              </p>
                            </div>
                            
                            {/* Template Preview Section */}
                            {template && (
                              <div className="md:col-span-3 mt-3 pt-3 border-t border-navy-100">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-gold-600" />
                                    <span className="text-xs font-medium text-navy-700">
                                      Template Preview
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <div 
                                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                                      style={{ backgroundColor: template.styles?.primary_color || '#0A1A2F' }}
                                      title="Primary Color"
                                    />
                                    <div 
                                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm" 
                                      style={{ backgroundColor: template.styles?.secondary_color || '#D4AF37' }}
                                      title="Secondary Color"
                                    />
                                    {template.logo_url && (
                                      <div className="flex items-center gap-1 text-xs text-navy-500">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Logo included</span>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-xs text-navy-400">
                                    Font: {template.styles?.font_family || 'Inter'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-navy-100">
                            {status === 'ready' && (
                              <button
                                onClick={(e) => handleDownload(e, report)}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gold-600 text-white text-sm font-medium rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50"
                              >
                                {isDownloading ? (
                                  <>
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                  </>
                                )}
                              </button>
                            )}
                            <Link
                              href={`/report/${report.id}`}
                              className="flex items-center gap-2 px-3 py-1.5 border border-navy-200 text-navy-700 text-sm font-medium rounded-lg hover:bg-navy-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Full Report
                            </Link>
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
      
      {/* Export Summary */}
      {filteredReports.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-navy-100">
          <p className="text-xs text-navy-500">
            Showing {filteredReports.length} of {reports.length} reports
          </p>
          <div className="flex items-center gap-2 text-xs text-navy-400">
            <Sparkles className="w-3 h-3" />
            <span>Reports include AI-powered regulatory analysis</span>
          </div>
        </div>
      )}
    </div>
  )
}