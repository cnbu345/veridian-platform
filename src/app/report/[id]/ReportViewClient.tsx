// src/app/report/[id]/ReportViewClient.tsx // Report viewer
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
  Loader2,
  Scale,
  Gavel,
  Landmark,
  Shield,
  AlertTriangle,
  Copy,
  Check,
  Target
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
  const [refreshCount, setRefreshCount] = useState(0)

  const reportContent = report.report_content || {}
  const createdAt = new Date(report.created_at)
  const status = report.status || 'pending'

  // Auto-refresh while generating
  useEffect(() => {
    if (status === 'generating' || status === 'pending') {
      const interval = setInterval(() => {
        router.refresh()
        setRefreshCount(prev => prev + 1)
      }, 5000) 
      
      return () => clearInterval(interval)
    }
  }, [status, router])

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
      console.log('📥 Starting PDF download...')
      
      // Generate the PDF blob
      const blob = await downloadReportPDF(report)
      console.log('✅ PDF blob generated, size:', blob.size, 'bytes')
      
      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF is empty')
      }
      
      // Create filename
      const sanitizedName = report.company_name.replace(/[^a-zA-Z0-9]/g, '_')
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      const filename = `Veridian_Regulatory_Report_${sanitizedName}_${dateStr}.pdf`
      
      // Create download link with proper error handling
      try {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.style.display = 'none'
        
        // Trigger download
        document.body.appendChild(link)
        link.click()
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }, 100)
        
        console.log('✅ PDF download triggered successfully')
        
      } catch (urlError) {
        console.error('❌ URL creation failed:', urlError)
        // Fallback: Try to open in new tab
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          window.open(dataUrl, '_blank')
        }
        reader.readAsDataURL(blob)
      }
      
    } catch (error) {
      console.error('❌ Download failed:', error)
      alert('Failed to download PDF. Please try again or contact support.')
    } finally {
      setIsDownloading(false)
    }
  };

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
    return match ? match[0].trim() : ''
  }

  // Loading state
  if (status === 'generating' || status === 'pending') {
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
            generating your comprehensive report. This page refreshes automatically.
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

          <p className="mt-8 text-sm text-navy-400">
            Refreshed {refreshCount} times • This usually takes 2-3 minutes
          </p>
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
      <div className="container-custom max-w-7xl">
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

          {/* PDF Download Link */}
          {report.pdf_url && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                PDF version available for download
              </p>
            </div>
          )}
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
            <div className="space-y-8">
              {/* Header with decorative element */}
              <div className="relative mb-8">
                <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl shadow-lg shadow-gold-500/20 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-navy-900">Executive Summary</h2>
                    <p className="text-navy-500 mt-1">Strategic compliance overview for {report.company_name}</p>
                  </div>
                </div>
              </div>

              {/* Company Overview Card */}
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-gold-400" />
                      <span className="text-gold-400 font-medium">INSTITUTION PROFILE</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-2">{report.company_name}</h3>
                    <div className="flex items-center gap-4 text-navy-200">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {report.city}, {report.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {report.industry || 'Investment Management'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                    <p className="text-xs text-navy-300">Report Date</p>
                    <p className="text-lg font-semibold text-gold-400">{format(createdAt, 'MMMM d, yyyy')}</p>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <p className="text-xs text-navy-300 mb-1">Primary Focus</p>
                    <p className="text-lg font-semibold text-white capitalize">{reportContent.primaryFocus || 'Regulatory Compliance'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <p className="text-xs text-navy-300 mb-1">Timeline</p>
                    <p className="text-lg font-semibold text-white">{reportContent.timeline || '6 Months'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <p className="text-xs text-navy-300 mb-1">Jurisdictions</p>
                    <p className="text-lg font-semibold text-white">{report.state} + Multi-State</p>
                  </div>
                </div>
              </div>

              {/* Strategic Overview Card */}
              <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
                <div className="bg-gradient-to-r from-gold-50 to-transparent px-8 py-4 border-b border-navy-100">
                  <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold-600 rounded-full" />
                    Strategic Overview
                  </h3>
                </div>
                <div className="p-8">
                  <p className="text-navy-700 leading-relaxed text-lg">
                    {reportContent.executive_summary || 
                    `This comprehensive regulatory intelligence report provides detailed compliance analysis for ${report.company_name}, 
                      a ${report.industry || 'financial services'} firm operating in ${report.city}, ${report.state}. Based on your specified 
                      compliance priorities and operational footprint, we have developed a tailored regulatory roadmap spanning 
                      ${reportContent.timeline || '6 months'} with immediate, short-term, and ongoing action items.`}
                  </p>
                </div>
              </div>

              {/* Key Highlights Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Compliance Concerns */}
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 shadow-soft overflow-hidden">
                  <div className="bg-amber-100 px-6 py-3 border-b border-amber-200">
                    <h3 className="text-amber-800 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Key Compliance Concerns
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-navy-700 italic leading-relaxed">
                      "{reportContent.concerns || 'Regulatory compliance across multiple jurisdictions, enforcement preparedness, and licensing requirements in 12+ states'}"
                    </p>
                  </div>
                </div>

                {/* Strategic Goals */}
                <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-200 shadow-soft overflow-hidden">
                  <div className="bg-green-100 px-6 py-3 border-b border-green-200">
                    <h3 className="text-green-800 font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Strategic Objectives
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-navy-700 italic leading-relaxed">
                      "{reportContent.goals || 'Obtain necessary licenses, implement compliance monitoring systems, achieve regulatory examination readiness'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Critical Action Items */}
              <div className="bg-gradient-to-br from-navy-50 to-white rounded-2xl border border-navy-200 shadow-soft overflow-hidden">
                <div className="bg-navy-100 px-6 py-4 border-b border-navy-200">
                  <h3 className="text-navy-900 font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Critical Action Items
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-red-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-1">Immediate (Next 30 Days)</h4>
                        <p className="text-navy-600 text-sm">Engage compliance counsel, begin license applications, designate Chief Compliance Officer</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-amber-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-1">Short-Term (30-90 Days)</h4>
                        <p className="text-navy-600 text-sm">Complete license applications, implement monitoring systems, conduct staff training</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-navy-100 shadow-sm">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-green-600 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-1">Ongoing</h4>
                        <p className="text-navy-600 text-sm">Quarterly reporting, annual audits, regulatory monitoring, license renewals</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Analysis Card */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-navy-100 p-5 shadow-soft">
                  <p className="text-xs text-navy-500 uppercase tracking-wider mb-2">Regulatory Climate</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      reportContent.regulatory_analysis?.climate === 'friendly' ? 'bg-green-500' :
                      reportContent.regulatory_analysis?.climate === 'moderate' ? 'bg-yellow-500' :
                      reportContent.regulatory_analysis?.climate === 'strict' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <p className="text-xl font-bold text-navy-900 capitalize">
                      {reportContent.regulatory_analysis?.climate || 'Moderate'}
                    </p>
                  </div>
                  <p className="text-xs text-navy-400 mt-2">
                    {report.state === 'TX' ? 'Business-friendly environment' :
                    report.state === 'NY' ? 'Strict oversight' :
                    report.state === 'CA' ? 'Comprehensive regulation' :
                    'Standard requirements'}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-navy-100 p-5 shadow-soft">
                  <p className="text-xs text-navy-500 uppercase tracking-wider mb-2">Licensing Required</p>
                  <p className="text-xl font-bold text-navy-900">
                    {reportContent.licensing_matrix?.licenses?.length || 'Multiple'} States
                  </p>
                  <p className="text-xs text-navy-400 mt-2">
                    Primary: {report.state}, NY, CA, FL
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-navy-100 p-5 shadow-soft">
                  <p className="text-xs text-navy-500 uppercase tracking-wider mb-2">Risk Level</p>
                  <p className="text-xl font-bold text-navy-900">
                    {reportContent.risk_assessment?.overall || 'Moderate'}
                  </p>
                  <p className="text-xs text-navy-400 mt-2">
                    Mitigation strategies included
                  </p>
                </div>
              </div>

              {/* Regulatory Snapshot */}
              <div className="bg-navy-900 rounded-2xl p-8 text-white shadow-xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-gold-400" />
                  {report.state} Regulatory Snapshot
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3 h-3 text-gold-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gold-400">License Framework</p>
                        <p className="text-white">
                          {reportContent.regulatory_analysis?.moneyTransmitter || 'Money Transmitter License'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3 h-3 text-gold-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gold-400">Enforcement Activity</p>
                        <p className="text-white">Active oversight program</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3 h-3 text-gold-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gold-400">Tax Treatment</p>
                        <p className="text-white">
                          {report.state === 'TX' ? 'No state income tax' : 'State income tax applies'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gold-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3 h-3 text-gold-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gold-400">Last Updated</p>
                        <p className="text-white">{reportContent.regulatory_analysis?.lastUpdated || '2024-01-15'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Recommendation */}
              <div className="bg-gradient-to-r from-gold-600 to-gold-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Strategic Recommendation</h4>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Based on your primary focus on {reportContent.primaryFocus || 'compliance'} and operations in {report.state}, 
                      we recommend prioritizing license applications in Q2 2024 while simultaneously building out your compliance 
                      infrastructure. This parallel approach ensures regulatory readiness while maintaining operational momentum.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-xs text-navy-400 border-t border-navy-200 pt-6 mt-4">
                <p className="leading-relaxed">
                  <span className="font-semibold text-navy-600">DISCLAIMER:</span> This executive summary provides regulatory intelligence for informational purposes only. 
                  Veridian Group is not a law firm. All compliance strategies should be reviewed with qualified legal counsel 
                  in {report.state} before implementation. Regulations are subject to change without notice.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'regulatory' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-gold-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900">{report.state} Regulatory Analysis</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                  <p className="text-sm text-navy-500 mb-1">Regulatory Climate</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      reportContent.regulatory_analysis?.climate === 'friendly' ? 'bg-green-500' :
                      reportContent.regulatory_analysis?.climate === 'moderate' ? 'bg-yellow-500' :
                      reportContent.regulatory_analysis?.climate === 'strict' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <p className="text-xl font-bold text-navy-900">
                      {reportContent.regulatory_analysis?.climate || 'Moderate'}
                    </p>
                  </div>
                </div>
                <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                  <p className="text-sm text-navy-500 mb-1">License Required</p>
                  <p className="text-xl font-bold text-navy-900">
                    {reportContent.regulatory_analysis?.moneyTransmitter || 'Varies by activity'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-navy-200 overflow-hidden">
                <div className="bg-navy-800 px-6 py-4">
                  <h3 className="text-white font-semibold">Regulatory Framework Breakdown</h3>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead className="bg-navy-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">Aspect</th>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">Requirement</th>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-100">
                      <tr>
                        <td className="py-3 px-4 text-navy-700">Money Transmitter License</td>
                        <td className="py-3 px-4 text-navy-700">{reportContent.regulatory_analysis?.moneyTransmitter || 'Required'}</td>
                        <td className="py-3 px-4 text-navy-700">3-6 months</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-navy-700">State Registration</td>
                        <td className="py-3 px-4 text-navy-700">Required</td>
                        <td className="py-3 px-4 text-navy-700">1-2 months</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-navy-700">AML Program</td>
                        <td className="py-3 px-4 text-navy-700">Mandatory</td>
                        <td className="py-3 px-4 text-navy-700">2-3 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'licensing' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                  <Gavel className="w-5 h-5 text-gold-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900">Multi-State Licensing Matrix</h2>
              </div>
              
              <div className="bg-white rounded-xl border border-navy-200 overflow-hidden">
                <div className="bg-navy-800 px-6 py-4">
                  <h3 className="text-white font-semibold">License Requirements by State</h3>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead className="bg-navy-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">State</th>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">License Type</th>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">Timeline</th>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">Bond/Net Worth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-100">
                      <tr className="hover:bg-navy-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-navy-900">TX</td>
                        <td className="py-3 px-4 text-navy-700">Money Services Business</td>
                        <td className="py-3 px-4 text-navy-700">3-4 months</td>
                        <td className="py-3 px-4 text-navy-700">$50,000</td>
                      </tr>
                      <tr className="hover:bg-navy-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-navy-900">NY</td>
                        <td className="py-3 px-4 text-navy-700">BitLicense</td>
                        <td className="py-3 px-4 text-navy-700">6-12 months</td>
                        <td className="py-3 px-4 text-navy-700">$250,000</td>
                      </tr>
                      <tr className="hover:bg-navy-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-navy-900">CA</td>
                        <td className="py-3 px-4 text-navy-700">DFPI License</td>
                        <td className="py-3 px-4 text-navy-700">4-8 months</td>
                        <td className="py-3 px-4 text-navy-700">$100,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gold-50 border border-gold-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gold-600" />
                  Application Requirements
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Complete application forms with business plans',
                    'Fingerprint-based background checks',
                    'Audited financial statements',
                    'Surety bonds as specified',
                    'Designate compliance officer',
                    'Written policies and procedures'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span className="text-navy-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gold-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900">Compliance Roadmap</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    phase: 'Immediate (Days 1-30)',
                    color: 'bg-red-100 border-red-200',
                    textColor: 'text-red-800',
                    items: [
                      'Engage qualified compliance counsel',
                      'Submit initial license applications',
                      'Designate Chief Compliance Officer',
                      'Draft compliance policies',
                      'Begin AML/KYC program development'
                    ]
                  },
                  {
                    phase: 'Short-Term (Days 31-90)',
                    color: 'bg-yellow-100 border-yellow-200',
                    textColor: 'text-yellow-800',
                    items: [
                      'Complete remaining license applications',
                      'Implement transaction monitoring systems',
                      'Conduct staff compliance training',
                      'Establish regulatory reporting protocols',
                      'Prepare for examinations'
                    ]
                  },
                  {
                    phase: 'Ongoing (90+ Days)',
                    color: 'bg-green-100 border-green-200',
                    textColor: 'text-green-800',
                    items: [
                      'Quarterly regulatory reporting',
                      'Annual compliance audit',
                      'Continuous employee training',
                      'Regulatory change monitoring',
                      'License renewals and amendments'
                    ]
                  }
                ].map((phase, idx) => (
                  <div key={idx} className={`${phase.color} border rounded-xl p-5`}>
                    <h3 className={`text-lg font-semibold ${phase.textColor} mb-3`}>{phase.phase}</h3>
                    <div className="space-y-2">
                      {phase.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className={`w-4 h-4 ${phase.textColor} mt-0.5`} />
                          <span className="text-navy-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-gold-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900">Regulatory Resources</h2>
              </div>

              <div className="grid gap-6">
                <div className="bg-white rounded-xl border border-navy-200 overflow-hidden">
                  <div className="bg-navy-800 px-6 py-3">
                    <h3 className="text-white font-semibold">State Regulators</h3>
                  </div>
                  <div className="divide-y divide-navy-100">
                    {[
                      { state: 'TX', agency: 'Texas Department of Banking', phone: '(877) 276-5554' },
                      { state: 'NY', agency: 'NYDFS', phone: '(212) 709-3500' },
                      { state: 'CA', agency: 'DFPI', phone: '(866) 275-2677' },
                    ].map((reg, i) => (
                      <div key={i} className="p-4 hover:bg-navy-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-navy-900">{reg.state}</span>
                            <p className="text-navy-700 text-sm mt-1">{reg.agency}</p>
                          </div>
                          <a href={`tel:${reg.phone}`} className="text-gold-600 hover:text-gold-700 font-medium">
                            {reg.phone}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                  <h3 className="text-lg font-semibold text-navy-900 mb-3">Qualified Legal Counsel</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Perkins Coie LLP - Blockchain Practice',
                      'Cooley LLP - FinTech Regulatory',
                      'Fenwick & West - Crypto Compliance',
                      'Local counsel in each state'
                    ].map((firm, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-gold-600 mt-0.5" />
                        <span className="text-navy-700 text-sm">{firm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-gold-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900">Risk Assessment</h2>
              </div>

              <div className="bg-white rounded-xl border border-navy-200 overflow-hidden">
                <div className="bg-navy-800 px-6 py-4">
                  <h3 className="text-white font-semibold">Risk Matrix</h3>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead className="bg-navy-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">Risk Category</th>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">Likelihood</th>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">Impact</th>
                        <th className="text-left py-3 px-4 text-navy-700 font-semibold">Mitigation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-100">
                      {[
                        { category: 'Regulatory Change', likelihood: 'High', impact: 'Critical', mitigation: 'Continuous monitoring' },
                        { category: 'License Delays', likelihood: 'Medium', impact: 'High', mitigation: 'Early application' },
                        { category: 'Enforcement Action', likelihood: 'Low', impact: 'Critical', mitigation: 'Proactive compliance' },
                        { category: 'Examination Findings', likelihood: 'Medium', impact: 'High', mitigation: 'Regular audits' },
                      ].map((risk, i) => (
                        <tr key={i} className="hover:bg-navy-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-navy-900">{risk.category}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              risk.likelihood === 'High' ? 'bg-red-100 text-red-800' :
                              risk.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {risk.likelihood}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              risk.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                              risk.impact === 'High' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {risk.impact}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-navy-700">{risk.mitigation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">Risk Mitigation Strategies</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Maintain retainer with compliance counsel',
                    'Implement regulatory monitoring system',
                    'Conduct quarterly compliance audits',
                    'Document all compliance activities',
                    'Establish regulator relationships',
                    'Regular staff training'
                  ].map((strategy, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-gold-600 mt-0.5" />
                      <span className="text-navy-700 text-sm">{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gold-50 border border-gold-200 rounded-lg p-5">
                <p className="text-navy-800 font-medium">
                  <span className="text-gold-700 font-bold">Overall Risk Rating:</span> Moderate • 
                  <span className="text-navy-600 ml-2">Prioritize licensing and monitoring systems with quarterly reviews</span>
                </p>
              </div>
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