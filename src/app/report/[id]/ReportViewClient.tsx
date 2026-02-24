// src/app/report/[id]/ReportViewClient.tsx
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
      }, 5000) // Refresh every 5 seconds
      
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
    if (report.pdf_url) {
      // If PDF exists, download it
      window.open(report.pdf_url, '_blank')
    } else {
      // If not, generate on-demand
      try {
        setIsDownloading(true)
        const blob = await downloadReportPDF(report)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${report.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Regulatory_Report.pdf`
        a.click()
      } catch (error) {
        console.error('Download failed:', error)
        alert('Failed to download PDF. Please try again.')
      } finally {
        setIsDownloading(false)
      }
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
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-gold-600" />
                Executive Summary
              </h2>
              
              {fullReportContent ? (
                <div className="whitespace-pre-wrap font-sans text-navy-700">
                  {extractSection('1. EXECUTIVE SUMMARY') || fullReportContent.slice(0, 1000)}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-navy-700">
                    {reportContent.executive_summary || 
                      `This regulatory intelligence report provides compliance analysis for ${report.company_name} in ${report.city}, ${report.state}.`}
                  </p>
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
                  {extractSection('2. STATE REGULATORY ANALYSIS') || 'Analysis content coming soon...'}
                </div>
              ) : (
                <p className="text-navy-600">Regulatory analysis will appear here once generated.</p>
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
                  {extractSection('3. MULTI-STATE LICENSING MATRIX') || 'Licensing information coming soon...'}
                </div>
              ) : (
                <p className="text-navy-600">Licensing matrix will appear here once generated.</p>
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
                  {extractSection('5. COMPLIANCE IMPLEMENTATION ROADMAP') || 'Roadmap information coming soon...'}
                </div>
              ) : (
                <p className="text-navy-600">Compliance roadmap will appear here once generated.</p>
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
                  {extractSection('6. REGULATORY RESOURCES') || 'Resources coming soon...'}
                </div>
              ) : (
                <p className="text-navy-600">Regulatory resources will appear here once generated.</p>
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
                  {extractSection('7. RISK ASSESSMENT') || 'Risk assessment coming soon...'}
                </div>
              ) : (
                <p className="text-navy-600">Risk assessment will appear here once generated.</p>
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