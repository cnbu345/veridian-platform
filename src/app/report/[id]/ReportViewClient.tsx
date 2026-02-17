// src/app/report/[id]/ReportViewClient.tsx
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
  Loader2,
  Scale,
  Gavel,
  Landmark,
  Shield,
  AlertTriangle
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
    { id: 'regulatory', label: 'Regulatory Analysis' },
    { id: 'licensing', label: 'Licensing Matrix' },
    { id: 'compliance', label: 'Compliance Roadmap' },
    { id: 'resources', label: 'Regulatory Contacts' },
    { id: 'risk', label: 'Risk Assessment' },
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
                  {status === 'ready' ? 'Compliance Report Ready' : status}
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

          {/* Regulatory Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-medium
              ${report.location_tier === 'major' ? 'bg-blue-100 text-blue-800' : ''}
              ${report.location_tier === 'suburban' ? 'bg-purple-100 text-purple-800' : ''}
              ${report.location_tier === 'rural' ? 'bg-green-100 text-green-800' : ''}
            `}>
              {report.location_tier === 'major' ? 'Major Market' : 
               report.location_tier === 'suburban' ? 'Suburban Market' : 'Rural Market'}
            </span>
            {report.nearest_major_city && (
              <span className="text-sm text-navy-500">
                Compliance hub access via {report.nearest_major_city}
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
                    `This regulatory intelligence report provides a comprehensive compliance 
                     analysis for ${report.company_name} based in ${report.city}, ${report.state}. 
                     Our analysis identifies key regulatory requirements, licensing obligations, 
                     and compliance risks across your operating jurisdictions.`}
                </p>
                
                <div className="bg-navy-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-navy-900 mb-3">Key Compliance Insights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-navy-700">
                        Regulatory climate: {report.report_content?.regulatory_climate || 'Moderate'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-navy-700">
                        Licenses required: {report.report_content?.licenses_required || '2-3 states'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-navy-700">
                        Implementation timeline: {report.report_content?.timeline || '90 days'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'regulatory' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">
                {report.state} Regulatory Analysis
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-navy-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    Regulatory Climate
                  </h3>
                  <p className="text-lg font-semibold text-navy-900 mb-2">
                    {report.report_content?.regulatory_climate || 'Moderate'}
                  </p>
                  <p className="text-sm text-navy-600">
                    {report.state === 'NY' && 'BitLicense required - strict oversight'}
                    {report.state === 'CA' && 'DFPI licensing - active enforcement'}
                    {report.state === 'TX' && 'Business friendly - no specific license'}
                    {report.state === 'WY' && 'Most crypto-friendly - DAO structure available'}
                    {!['NY','CA','TX','WY'].includes(report.state) && 
                      'Moderate regulation - consult specific requirements'}
                  </p>
                </div>
                <div className="bg-navy-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Key Requirements
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-navy-700">• Money transmitter license: {report.state === 'TX' ? 'Not required' : 'Required in most states'}</li>
                    <li className="text-sm text-navy-700">• Bonding requirements: $25k-$500k depending on volume</li>
                    <li className="text-sm text-navy-700">• Annual reporting: Required</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">
                Compliance Risk Assessment
              </h2>
              <div className="space-y-4">
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    High Priority Risks
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-amber-700">• Multi-state licensing gaps identified</li>
                    <li className="text-sm text-amber-700">• Recent enforcement actions in {report.state}</li>
                    <li className="text-sm text-amber-700">• Pending legislation that may affect operations</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Mitigation Strategies
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-green-700">• 90-day compliance plan included</li>
                    <li className="text-sm text-green-700">• Regulatory contacts provided for each state</li>
                    <li className="text-sm text-green-700">• Quarterly monitoring subscription available</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'executive-summary' && activeTab !== 'regulatory' && activeTab !== 'risk' && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-navy-300 mx-auto mb-4" />
              <p className="text-navy-600">
                This section contains detailed compliance analysis specific to your report.
              </p>
              <p className="text-sm text-navy-400 mt-2">
                Download the PDF for complete regulatory intelligence.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-6 bg-navy-50 rounded-xl border border-navy-200">
          <p className="text-xs text-navy-500 text-center">
            DISCLAIMER: This report provides regulatory intelligence and educational guidance 
            based on AI analysis and human review. Veridian Group is not a law firm. 
            All compliance recommendations should be reviewed with qualified legal counsel 
            in {report.state} before implementation.
          </p>
        </div>
      </div>
    </div>
  )
}