// src/app/dashboard/components/ReportCard.tsx - COMPLETE FIXED VERSION
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Building2,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import ReportSummary from './ReportSummary'
import { downloadReportPDF } from '@/lib/pdf/generator' // IMPORTANT: Add this import

interface ReportCardProps {
  report: any
}

export default function ReportCard({ report }: ReportCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false) // IMPORTANT: Add this state

  const status = report.status || 'pending'
  const createdAt = new Date(report.created_at)
  const reportContent = report.report_content || {}

  // Get values from report content
  const industry = report.industry || reportContent.industry || 'Not specified'
  const budget = report.budget || reportContent.budget || 'Not specified'
  const primaryFocus = report.primaryFocus || reportContent.primaryFocus || 'Not specified'
  const locationTier = report.location_tier || reportContent.locationTier || 'Not specified'

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (status !== 'ready') {
      alert('Report is not ready for download yet')
      return
    }
    
    try {
      setIsDownloading(true)
      console.log('📥 Downloading PDF for report:', report.id)
      
      const blob = await downloadReportPDF(report)
      
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF is empty')
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Regulatory_Report.pdf`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      console.log('✅ PDF downloaded successfully')
      
    } catch (error) {
      console.error('❌ Download failed:', error)
      alert('Failed to download PDF. Please try again or contact support.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-navy-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-900">{report.company_name}</h3>
              <div className="flex items-center gap-3 text-sm text-navy-500 mt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {industry}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {report.city}, {report.state}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              status === 'ready' ? 'bg-green-100 text-green-800' :
              status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
              status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              {status === 'ready' && <CheckCircle className="w-3 h-3" />}
              {status === 'generating' && <Clock className="w-3 h-3 animate-spin" />}
              {status === 'pending' && <Clock className="w-3 h-3 animate-spin" />}
              {status === 'failed' && <AlertCircle className="w-3 h-3" />}
              {status === 'ready' ? 'Ready' :
               status === 'generating' ? 'Generating...' :
               status === 'pending' ? 'Generating...' :
               status === 'failed' ? 'Failed' :
               status}
            </span>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {showDetails ? (
                <ChevronUp className="w-4 h-4 text-navy-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-navy-500" />
              )}
            </button>
          </div>
        </div>

        {/* Market Tier Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            locationTier === 'major' ? 'bg-purple-100 text-purple-800' :
            locationTier === 'suburban' ? 'bg-blue-100 text-blue-800' :
            'bg-slate-100 text-slate-800'
          }`}>
            <MapPin className="w-3 h-3 mr-1" />
            {locationTier === 'major' ? 'Major Market' :
             locationTier === 'suburban' ? 'Suburban Market' :
             'Rural Market'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/report/${report.id}`}
            className="flex-1 px-4 py-2 bg-gold-600 text-white text-sm font-medium rounded-lg hover:bg-gold-500 transition-colors text-center"
          >
            View Report
          </Link>
          <button
            onClick={handleDownload}
            disabled={status !== 'ready' || isDownloading}
            className="px-4 py-2 border border-slate-300 text-navy-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                PDF
              </>
            )}
          </button>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <ReportSummary
              institutionType={industry}
              annualBudget={budget}
              primaryConcern={primaryFocus}
              marketTier={locationTier}
            />
          </div>
        )}
      </div>
    </div>
  )
}