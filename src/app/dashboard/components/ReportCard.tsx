'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  ChevronUp,
  Loader2
} from 'lucide-react'
import { downloadReportPDF } from '@/lib/pdf/generator'

interface ReportCardProps {
  report: any
}

export default function ReportCard({ report }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  
  const status = report.report_content?.status || report.status || 'generating'
  const createdAt = new Date(report.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const getStatusIcon = () => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'generating':
        return <Clock className="w-5 h-5 text-amber-600 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-amber-600" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return 'Report Ready'
      case 'generating':
        return 'Generating...'
      case 'failed':
        return 'Generation Failed'
      default:
        return 'Processing'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'generating':
        return 'bg-amber-100 text-amber-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true)
      await downloadReportPDF(report)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden 
                    hover:border-gold-200 transition-all duration-300 hover:shadow-md">
      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-navy-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-900 mb-1">
                {report.company_name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-navy-600">
                  <Building2 className="w-4 h-4" />
                  {report.industry}
                </span>
                <span className="flex items-center gap-1 text-navy-600">
                  <MapPin className="w-4 h-4" />
                  {report.city}, {report.state}
                </span>
                <span className="flex items-center gap-1 text-navy-600">
                  <Calendar className="w-4 h-4" />
                  {createdAt}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              <span className="flex items-center gap-1.5">
                {getStatusIcon()}
                {getStatusText()}
              </span>
            </span>
            
            <div className="relative">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-navy-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Location Tier Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium
            ${report.location_tier === 'major' ? 'bg-blue-100 text-blue-800' : ''}
            ${report.location_tier === 'suburban' ? 'bg-purple-100 text-purple-800' : ''}
            ${report.location_tier === 'rural' ? 'bg-green-100 text-green-800' : ''}
          `}>
            {report.location_tier.charAt(0).toUpperCase() + report.location_tier.slice(1)} Market
          </span>
          
          {report.nearest_major_city && (
            <span className="text-xs text-navy-500">
              Near {report.nearest_major_city}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {status === 'ready' ? (
            <>
              <Link
                href={`/report/${report.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-navy-900 
                         text-white text-sm font-medium rounded-lg
                         hover:bg-navy-800 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Report
              </Link>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 
                         text-navy-700 text-sm font-medium rounded-lg
                         hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </button>
            </>
          ) : status === 'generating' ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 
                          text-amber-700 text-sm font-medium rounded-lg">
              <Clock className="w-4 h-4 animate-spin" />
              Generating... (2-3 minutes)
            </div>
          ) : (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-50 
                       text-red-700 text-sm font-medium rounded-lg
                       hover:bg-red-100 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              Retry Generation
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-4 py-2 text-sm text-navy-600 
                     hover:text-navy-900 transition-colors"
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show Details
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-navy-900 mb-3">
                Report Summary
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-navy-600">
                  <span className="font-medium">Company Size:</span>{' '}
                  {report.report_content?.company?.size || 'Not specified'}
                </p>
                <p className="text-navy-600">
                  <span className="font-medium">Budget Range:</span>{' '}
                  {report.report_content?.company?.budget || 'Not specified'}
                </p>
                <p className="text-navy-600">
                  <span className="font-medium">Primary Focus:</span>{' '}
                  {report.report_content?.strategy?.primary || 'Not specified'}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-navy-900 mb-3">
                Location Analysis
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-navy-600">
                  <span className="font-medium">Market Tier:</span>{' '}
                  {report.location_tier}
                </p>
                {report.nearest_major_city && (
                  <p className="text-navy-600">
                    <span className="font-medium">Nearest Major City:</span>{' '}
                    {report.nearest_major_city}
                  </p>
                )}
                <p className="text-navy-600">
                  <span className="font-medium">Report ID:</span>{' '}
                  <span className="font-mono text-xs">{report.id.slice(0, 8)}...</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}