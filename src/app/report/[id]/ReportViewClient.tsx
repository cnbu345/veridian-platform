// src/app/reports/[id]/ReportViewClient.tsx
'use client'

import { useState, useEffect } from 'react'
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
  AlertTriangle,
  ExternalLink,
  Copy,
  Check
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
  const [copied, setCopied] = useState(false)

  const reportContent = report.report_content || {}
  const createdAt = new Date(report.created_at)
  const status = reportContent.status || report.status || 'ready'

  const tabs = [
    { id: 'executive-summary', label: 'Executive Summary', icon: FileText },
    { id: 'regulatory', label: 'Regulatory Analysis', icon: Scale },
    { id: 'licensing', label: 'Licensing Matrix', icon: Gavel },
    { id: 'compliance', label: 'Compliance Roadmap', icon: Clock },
    { id: 'resources', label: 'Regulatory Contacts', icon: Landmark },
    { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse AI report content if it's a string
  const parseReportContent = () => {
    if (typeof reportContent.content === 'string') {
      return reportContent.content
    }
    return null
  }

  const fullReportContent = parseReportContent()

  // Extract section from full report
  const extractSection = (sectionTitle: string): string => {
    if (!fullReportContent) return ''
    
    const sectionRegex = new RegExp(`## ${sectionTitle}[\\s\\S]*?(?=##|$)`, 'i')
    const match = fullReportContent.match(sectionRegex)
    return match ? match[0] : ''
  }

  // Loading state
  if (status === 'generating') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-32">
        <div className="container-custom max-w-6xl text-center py-20">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-gold-500/20 to-gold-600/20 
                          rounded-full flex items-center justify-center">
              <Scale className="w-12 h-12 text-gold-600" />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-navy-900 mb-3">
            Your Report is Being Generated
          </h2>
          
          <p className="text-navy-600 mb-8 max-w-md mx-auto">
            Our AI compliance engine is analyzing {report.state} regulations and 
            generating your comprehensive report. This page will refresh automatically.
          </p>

          <div className="w-64 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold-600 to-gold-500 
                          rounded-full animate-pulse w-3/4" />
          </div>

          <div className="mt-8 space-y-2 text-sm text-navy-500">
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Analyzing {report.state} regulatory framework
            </p>
            <p className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Identifying license requirements
            </p>
            <p className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-gold-600 animate-spin" />
              Generating compliance recommendations
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-32">
        <div className="container-custom max-w-6xl text-center py-20">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-navy-900 mb-3">
            Report Generation Failed
          </h2>
          
          <p className="text-navy-600 mb-8 max-w-md mx-auto">
            We encountered an error while generating your report. Please try again 
            or contact support if the issue persists.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push('/generate')}
              className="px-6 py-3 bg-gold-600 text-white rounded-lg 
                       hover:bg-gold-500 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border border-navy-300 text-navy-700 
                       rounded-lg hover:bg-navy-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
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
            <button 
              onClick={() => window.print()}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-5 h-5 text-navy-600" />
            </button>
            <button 
              onClick={handleCopyLink}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors relative"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-navy-600" />
              )}
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
                <span className="px-3 py-1 bg-green-100 text-green-800 
                               rounded-full text-xs font-medium">
                  Compliance Report Ready
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
              <p className="text-xs font-mono text-navy-900">{report.id.slice(0, 8)}</p>
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
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'border-b-2 border-gold-600 text-navy-900' 
                      : 'text-navy-500 hover:text-navy-700'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          {activeTab === 'executive-summary' && (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-gold-600" />
                Executive Summary
              </h2>
              
              {fullReportContent ? (
                <div className="whitespace-pre-wrap font-sans text-navy-700">
                  {extractSection('1. EXECUTIVE SUMMARY') || fullReportContent}
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-navy-700 leading-relaxed">
                    {reportContent.executive_summary || 
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
                          Regulatory climate: {reportContent.regulatory_climate || 'Moderate'} in {report.state}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-navy-700">
                          Primary focus: {reportContent.primary_focus || 'Regulatory compliance'}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-navy-700">
                          Implementation timeline: {reportContent.timeline || '90-180 days'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'regulatory' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <Scale className="w-6 h-6 text-gold-600" />
                {report.state} Regulatory Analysis
              </h2>
              
              {fullReportContent ? (
                <div className="whitespace-pre-wrap font-sans text-navy-700">
                  {extractSection('2. STATE REGULATORY ANALYSIS')}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-navy-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                      <Gavel className="w-5 h-5" />
                      Regulatory Climate
                    </h3>
                    <p className="text-lg font-semibold text-navy-900 mb-2">
                      {report.state === 'NY' && 'Strict - BitLicense Required'}
                      {report.state === 'CA' && 'Strict - DFPI Oversight'}
                      {report.state === 'TX' && 'Friendly - Business First'}
                      {report.state === 'WY' && 'Most Friendly - DAO Structure'}
                      {!['NY','CA','TX','WY'].includes(report.state) && 'Moderate - Standard Requirements'}
                    </p>
                    <p className="text-sm text-navy-600 mt-2">
                      {report.state === 'NY' && 'BitLicense required for virtual currency business activity. NYDFS maintains strict oversight and regular examinations.'}
                      {report.state === 'CA' && 'Money transmitter licensing through DFPI required. Active enforcement and pending comprehensive crypto legislation.'}
                      {report.state === 'TX' && 'No specific money transmission license for crypto. Texas Department of Banking has issued favorable guidance.'}
                      {report.state === 'WY' && 'Most comprehensive digital asset laws, including DAO LLC structures and special purpose depository institutions.'}
                    </p>
                  </div>
                  <div className="bg-navy-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Key Requirements
                    </h3>
                    <ul className="space-y-2">
                      <li className="text-sm text-navy-700">• Money transmitter license: {report.state === 'TX' ? 'Not required' : 'Required'}</li>
                      <li className="text-sm text-navy-700">• Bonding requirements: $25,000 - $500,000</li>
                      <li className="text-sm text-navy-700">• Annual reporting: Required</li>
                      <li className="text-sm text-navy-700">• Regular examinations: {report.state === 'NY' ? 'Annual' : 'Biennial'}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'licensing' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <Gavel className="w-6 h-6 text-gold-600" />
                Multi-State Licensing Matrix
              </h2>
              
              {fullReportContent ? (
                <div className="whitespace-pre-wrap font-sans text-navy-700">
                  {extractSection('3. MULTI-STATE LICENSING MATRIX')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-navy-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-navy-900">License Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-navy-900">Required</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-navy-900">Timeline</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-navy-900">Bonding</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-navy-900">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-navy-700">Money Transmitter</td>
                        <td className="px-4 py-3 text-sm text-navy-700">{report.state === 'TX' ? 'Not Required' : 'Required'}</td>
                        <td className="px-4 py-3 text-sm text-navy-700">4-8 months</td>
                        <td className="px-4 py-3 text-sm text-navy-700">$25k-$500k</td>
                        <td className="px-4 py-3 text-sm text-navy-700">$1k-$5k</td>
                      </tr>
                      {report.state === 'NY' && (
                        <tr>
                          <td className="px-4 py-3 text-sm text-navy-700">BitLicense</td>
                          <td className="px-4 py-3 text-sm text-navy-700">Required</td>
                          <td className="px-4 py-3 text-sm text-navy-700">6-12 months</td>
                          <td className="px-4 py-3 text-sm text-navy-700">$50k-$500k</td>
                          <td className="px-4 py-3 text-sm text-navy-700">$5,000</td>
                        </tr>
                      )}
                      {report.state === 'CA' && (
                        <tr>
                          <td className="px-4 py-3 text-sm text-navy-700">DFPI License</td>
                          <td className="px-4 py-3 text-sm text-navy-700">Required</td>
                          <td className="px-4 py-3 text-sm text-navy-700">4-8 months</td>
                          <td className="px-4 py-3 text-sm text-navy-700">$25k-$500k</td>
                          <td className="px-4 py-3 text-sm text-navy-700">$1k-$5k</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-gold-600" />
                Compliance Implementation Roadmap
              </h2>
              
              {fullReportContent ? (
                <div className="whitespace-pre-wrap font-sans text-navy-700">
                  {extractSection('5. COMPLIANCE IMPLEMENTATION ROADMAP')}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-navy-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-navy-900 mb-4">Days 1-30: Foundation & Legal Setup</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Engage qualified legal counsel
                      </li>
                      <li className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Determine license requirements
                      </li>
                      <li className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Begin license applications
                      </li>
                    </ul>
                  </div>
                  <div className="bg-navy-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-navy-900 mb-4">Days 31-60: Policy Development</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Submit all license applications
                      </li>
                      <li className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Finalize compliance policies
                      </li>
                      <li className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Select compliance technology
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <Landmark className="w-6 h-6 text-gold-600" />
                Regulatory Resources
              </h2>
              
              {fullReportContent ? (
                <div className="whitespace-pre-wrap font-sans text-navy-700">
                  {extractSection('6. REGULATORY RESOURCES')}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-navy-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-navy-900 mb-4">State Regulator</h3>
                    {report.state === 'NY' && (
                      <>
                        <p className="font-medium">NYDFS</p>
                        <p className="text-sm text-navy-600">(212) 709-3500</p>
                        <p className="text-sm text-navy-600">licensing@dfs.ny.gov</p>
                      </>
                    )}
                    {report.state === 'CA' && (
                      <>
                        <p className="font-medium">DFPI</p>
                        <p className="text-sm text-navy-600">(866) 275-2677</p>
                        <p className="text-sm text-navy-600">licensing@dfpi.ca.gov</p>
                      </>
                    )}
                    {report.state === 'TX' && (
                      <>
                        <p className="font-medium">Texas Department of Banking</p>
                        <p className="text-sm text-navy-600">(877) 276-5554</p>
                        <p className="text-sm text-navy-600">info@dob.texas.gov</p>
                      </>
                    )}
                  </div>
                  <div className="bg-navy-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-navy-900 mb-4">Legal Counsel</h3>
                    {report.state === 'NY' && (
                      <>
                        <p className="font-medium">Perkins Coie LLP</p>
                        <p className="text-sm text-navy-600">Blockchain & Crypto</p>
                        <p className="font-medium mt-2">Sullivan & Cromwell</p>
                        <p className="text-sm text-navy-600">FinTech Practice</p>
                      </>
                    )}
                    {report.state === 'CA' && (
                      <>
                        <p className="font-medium">Cooley LLP</p>
                        <p className="text-sm text-navy-600">Digital Assets</p>
                        <p className="font-medium mt-2">Fenwick & West</p>
                        <p className="text-sm text-navy-600">Crypto Compliance</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-gold-600" />
                Risk Assessment
              </h2>
              
              {fullReportContent ? (
                <div className="whitespace-pre-wrap font-sans text-navy-700">
                  {extractSection('7. RISK ASSESSMENT')}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      High Priority Risks
                    </h3>
                    <ul className="space-y-2">
                      <li className="text-sm text-amber-700">• Regulatory changes in {report.state}</li>
                      <li className="text-sm text-amber-700">• Multi-state licensing requirements</li>
                      <li className="text-sm text-amber-700">• Recent enforcement trends</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Mitigation Strategies
                    </h3>
                    <ul className="space-y-2">
                      <li className="text-sm text-green-700">• Quarterly legal compliance reviews</li>
                      <li className="text-sm text-green-700">• Regulatory monitoring subscription</li>
                      <li className="text-sm text-green-700">• Regular compliance audits</li>
                      <li className="text-sm text-green-700">• Document all compliance activities</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-6 bg-navy-50 rounded-xl border border-navy-200">
          <p className="text-xs text-navy-500 text-center">
            DISCLAIMER: This report provides regulatory intelligence and educational guidance 
            based on AI analysis and human review. Veridian Group is not a law firm. 
            All compliance recommendations should be reviewed with qualified legal counsel 
            in {report.state} before implementation. Regulations are subject to change without notice.
          </p>
        </div>
      </div>
    </div>
  )
}