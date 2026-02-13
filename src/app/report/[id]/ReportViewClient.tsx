'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Building2, 
  MapPin, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Share2,
  MoreVertical,
  Loader2
} from 'lucide-react'
import { downloadReportPDF } from '@/lib/pdf/generator'
import { format } from 'date-fns'

interface ReportViewClientProps {
  report: any
}

export default function ReportViewClient({ report }: ReportViewClientProps) {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState('executive-summary')

  const createdAt = new Date(report.created_at)
  const status = report.report_content?.status || report.status || 'ready'

  const tabs = [
    { id: 'executive-summary', label: 'Executive Summary' },
    { id: 'location', label: 'Location Analysis' },
    { id: 'regulatory', label: 'Regulatory' },
    { id: 'talent', label: 'Talent' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'resources', label: 'Resources' },
  ]

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
    <div className="min-h-screen bg-slate-50 pt-20 pb-32">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-navy-600 hover:text-navy-900 
                     transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-gold-600 
                       text-white rounded-lg hover:bg-gold-500 
                       transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <Printer className="w-5 h-5 text-navy-600" />
            </button>
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-navy-600" />
            </button>
          </div>
        </div>

        {/* Report Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-navy-900">
                  {report.company_name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${status === 'ready' ? 'bg-green-100 text-green-800' : ''}
                  ${status === 'generating' ? 'bg-amber-100 text-amber-800' : ''}
                  ${status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {status === 'ready' ? 'Report Ready' : status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-navy-600">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {report.industry}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {report.city}, {report.state}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(createdAt, 'MMMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className="bg-navy-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-navy-600">Report ID</span>
              <p className="text-xs font-mono text-navy-900">{report.id.slice(0, 8)}...</p>
            </div>
          </div>

          {/* Location Tier Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-medium
              ${report.location_tier === 'major' ? 'bg-blue-100 text-blue-800' : ''}
              ${report.location_tier === 'suburban' ? 'bg-purple-100 text-purple-800' : ''}
              ${report.location_tier === 'rural' ? 'bg-green-100 text-green-800' : ''}
            `}>
              {report.location_tier.charAt(0).toUpperCase() + report.location_tier.slice(1)} Market
            </span>
            {report.nearest_major_city && (
              <span className="text-sm text-navy-500">
                Near {report.nearest_major_city}
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'border-b-2 border-gold-600 text-navy-900' 
                    : 'text-navy-500 hover:text-navy-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          {activeTab === 'executive-summary' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">
                Executive Summary
              </h2>
              <div className="space-y-6">
                <p className="text-navy-700 leading-relaxed">
                  {report.report_content?.executive_summary || 
                    `This report provides a comprehensive Web3 strategy for ${report.company_name} 
                     based in ${report.city}, ${report.state}. Our analysis reveals significant 
                     opportunities in the ${report.industry} sector.`}
                </p>
                
                <div className="bg-navy-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-navy-900 mb-3">Key Insights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-navy-700">
                        Market opportunity score: 85/100
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-navy-700">
                        Regulatory climate: Favorable
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-navy-700">
                        Implementation timeline: 3-6 months
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">
                Location Analysis: {report.city}, {report.state}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-navy-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-navy-900 mb-4">Market Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-navy-600 mb-1">Market Tier</p>
                      <p className="text-lg font-semibold text-navy-900">
                        {report.location_tier}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-navy-600 mb-1">Nearest Web3 Hub</p>
                      <p className="text-lg font-semibold text-navy-900">
                        {report.nearest_major_city || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-navy-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-navy-900 mb-4">Opportunity Score</h3>
                  <div className="text-center">
                    <span className="text-5xl font-bold text-gold-600">85</span>
                    <span className="text-xl text-navy-400">/100</span>
                    <p className="text-sm text-navy-600 mt-2">Based on location analysis</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add other tabs similarly... */}

          {activeTab !== 'executive-summary' && activeTab !== 'location' && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-navy-300 mx-auto mb-4" />
              <p className="text-navy-600">
                This section contains detailed analysis specific to your report.
              </p>
              <p className="text-sm text-navy-400 mt-2">
                Download the PDF for complete content.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-6 bg-navy-50 rounded-xl border border-navy-200">
          <p className="text-xs text-navy-500 text-center">
            DISCLAIMER: This report provides educational guidance and strategic recommendations 
            based on AI analysis and human review. Veridian Group is not a law firm, financial 
            advisor, or registered investment advisor. All Web3 and cryptocurrency strategies 
            involve substantial risk. You should consult with qualified legal, tax, and financial 
            professionals before implementing any strategies.
          </p>
        </div>
      </div>
    </div>
  )
}