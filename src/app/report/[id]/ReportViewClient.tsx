// src/app/report/[id]/ReportViewClient.tsx - 10-Page Premium Report Viewer
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
  Target,
  Award,
  TrendingUp,
  Users,
  Star,
  Briefcase,
  Cpu,
  DollarSign,
  CalendarCheck,
  RefreshCw,
} from 'lucide-react'
import { downloadReportPDF } from '@/lib/pdf/generator'
import { format } from 'date-fns'
import { 
  buildReportData, 
  formatPrimaryFocus, 
  formatTimeline, 
  formatSecondaryFocus,
  formatCurrency 
} from '@/lib/reports/reportData'

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

  // Parse secondary focus correctly
  let secondaryFocus: string[] = []
  if (reportContent.secondaryFocus) {
    if (Array.isArray(reportContent.secondaryFocus)) {
      secondaryFocus = reportContent.secondaryFocus
    } else if (typeof reportContent.secondaryFocus === 'string') {
      try {
        const parsed = JSON.parse(reportContent.secondaryFocus)
        if (Array.isArray(parsed)) {
          secondaryFocus = parsed
        }
      } catch (e) {
        secondaryFocus = reportContent.secondaryFocus.split(',').map(s => s.trim())
      }
    }
  } else if (reportContent.strategy_focus?.secondary) {
    if (Array.isArray(reportContent.strategy_focus.secondary)) {
      secondaryFocus = reportContent.strategy_focus.secondary
    } else if (typeof reportContent.strategy_focus.secondary === 'string') {
      try {
        const parsed = JSON.parse(reportContent.strategy_focus.secondary)
        if (Array.isArray(parsed)) {
          secondaryFocus = parsed
        }
      } catch (e) {
        secondaryFocus = reportContent.strategy_focus.secondary.split(',').map(s => s.trim())
      }
    }
  }

  // Build report data from real sources
  const reportData = buildReportData(
    {
      name: report.company_name,
      industry: report.industry,
      size: reportContent.company?.size || '1-10',
      budget: reportContent.company?.budget || 'under-50k',
    },
    {
      city: report.city,
      state: report.state,
      tier: (report.location_tier as any) || 'major',
      nearestRegulatoryHub: report.nearest_major_city,
      regulatoryClimate: reportContent.regulatory_analysis?.climate || 'moderate',
      licenseRequired: reportContent.licensing_matrix?.licenses?.[0]?.required ? 'mtl' : 'none',
      talentDensity: 'moderate',
    },
    {
      primary: reportContent.strategy_focus?.primary || 'compliance',
      secondary: secondaryFocus,
      timeline: reportContent.strategy_focus?.timeline || '6-months',
      concerns: reportContent.concerns || 'No specific concerns provided.',
      goals: reportContent.goals || 'No specific goals provided.',
    }
  )

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

  // Define tabs for the 10-page structure
  const tabs = [
    { id: 'executive-summary', label: 'Executive Summary', icon: FileText },
    { id: 'market-talent', label: 'Market & Talent', icon: TrendingUp },
    { id: 'regulatory', label: 'Regulatory Analysis', icon: Scale },
    { id: 'licensing', label: 'Licensing Matrix', icon: Gavel },
    { id: 'compliance', label: 'Compliance Roadmap', icon: Clock },
    { id: 'technology', label: 'Tech & Tools', icon: Cpu },
    { id: 'resources', label: 'Resources', icon: Landmark },
    { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
    { id: 'budget', label: 'Budget Guide', icon: DollarSign },
    { id: 'next-steps', label: 'Next Steps', icon: CalendarCheck },
  ]

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true)
      console.log('📥 Starting PDF download...')
      
      const blob = await downloadReportPDF(report)
      
      if (!blob || blob.size === 0) {
        throw new Error('Generated PDF is empty')
      }
      
      const sanitizedName = report.company_name.replace(/[^a-zA-Z0-9]/g, '_')
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      const filename = `Veridian_Regulatory_Report_${sanitizedName}_${dateStr}.pdf`
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
      
      console.log('✅ PDF download triggered successfully')
      
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
            Our AI compliance engine is generating your comprehensive 10-page report.
          </p>

          <div className="w-64 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold-600 to-gold-500 rounded-full animate-pulse w-3/4" />
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
            We encountered an error. Please try again or contact support.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push('/generate')}
              className="px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border border-navy-300 text-navy-700 rounded-lg hover:bg-navy-50 transition-colors"
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
            className="flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF (10 Pages)
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-gold-400 text-sm mb-2">
                  <FileText className="w-4 h-4" />
                  <span>CONFIDENTIAL • 10-PAGE PREMIUM REPORT</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">{report.company_name}</h1>
                <div className="flex items-center gap-4 text-navy-300 text-sm">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {report.industry || 'Financial Services'}
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
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <span className="text-xs text-navy-300">Report ID</span>
                <p className="text-sm font-mono text-gold-400">{report.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Market Tier Badge */}
          <div className="px-8 py-4 border-b border-slate-200 bg-navy-50/50">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-navy-600">Market Analysis:</span>
              <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                <MapPin className="w-3 h-3 mr-1" />
                {reportData.location.tier === 'major' ? 'Major Market' : 
                 reportData.location.tier === 'suburban' ? 'Suburban Market' : 'Rural Market'}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                reportData.location.regulatoryClimate === 'friendly' ? 'bg-green-100 text-green-800' :
                reportData.location.regulatoryClimate === 'strict' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                <Shield className="w-3 h-3 mr-1" />
                Climate: {reportData.location.regulatoryClimate === 'friendly' ? 'Friendly' : 
                          reportData.location.regulatoryClimate === 'strict' ? 'Strict' : 'Moderate'}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                <Award className="w-3 h-3 mr-1" />
                Talent: {reportData.talentAnalysis.talentRank === 'high' ? 'High Density' : 
                        reportData.talentAnalysis.talentRank === 'medium' ? 'Medium Density' : 'Developing'}
              </span>
            </div>
          </div>

          {/* Tab Navigation - Scrollable */}
          <div className="border-b border-slate-200 overflow-x-auto">
            <div className="flex px-8 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                      ${activeTab === tab.id 
                        ? 'border-gold-600 text-navy-900' 
                        : 'border-transparent text-navy-500 hover:text-navy-700'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-gold-600' : 'text-navy-400'}`} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* PAGE 1: Executive Summary */}
            {activeTab === 'executive-summary' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl shadow-lg shadow-gold-500/20 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Executive Summary</h2>
                      <p className="text-navy-500 mt-1">Strategic overview for {report.company_name}</p>
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
                          {report.industry || 'Financial Services'}
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
                    {reportData.metrics.slice(0, 3).map((metric, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                        <p className="text-xs text-navy-300 mb-1">{metric.label}</p>
                        <p className={`text-lg font-semibold ${
                          metric.label === 'Licenses Required' ? 'text-gold-400' : 'text-white'
                        }`}>
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client's Specific Input Card */}
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 shadow-soft overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Your Custom Compliance Request
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">
                          Primary Focus
                        </p>
                        <p className="text-navy-900 font-medium">
                          {formatPrimaryFocus(reportData.strategy.primary)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">
                          Timeline
                        </p>
                        <p className="text-navy-900 font-medium">
                          {formatTimeline(reportData.strategy.timeline)}
                        </p>
                      </div>
                    </div>

                    {reportData.strategy.secondary.length > 0 && (
                      <div>
                        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-2">
                          Secondary Focus ({reportData.strategy.secondary.length} areas)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {reportData.strategy.secondary.map((focus, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white text-navy-700 border border-amber-200 rounded-full text-sm">
                              {formatSecondaryFocus(focus)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {reportData.strategy.concerns !== 'No specific concerns provided.' && (
                        <div className="bg-white rounded-xl p-4 border border-amber-200">
                          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-2">
                            Your Concerns
                          </p>
                          <p className="text-navy-700 italic">"{reportData.strategy.concerns.substring(0, 150)}..."</p>
                        </div>
                      )}
                      {reportData.strategy.goals !== 'No specific goals provided.' && (
                        <div className="bg-white rounded-xl p-4 border border-amber-200">
                          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-2">
                            Your Goals
                          </p>
                          <p className="text-navy-700 italic">"{reportData.strategy.goals.substring(0, 150)}..."</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 pt-4 border-t border-amber-200">
                      <p className="text-sm text-navy-600">
                        <span className="font-semibold text-navy-900">✓ How this report addresses your needs:</span> 
                        Tailored to your {formatPrimaryFocus(reportData.strategy.primary).toLowerCase()} priorities 
                        within your {formatTimeline(reportData.strategy.timeline).toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strategic Overview */}
                <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
                  <div className="bg-gradient-to-r from-gold-50 to-transparent px-8 py-4 border-b border-navy-100">
                    <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gold-600 rounded-full" />
                      Strategic Overview
                    </h3>
                  </div>
                  <div className="p-8">
                    <p className="text-navy-700 leading-relaxed text-lg">
                      This comprehensive 10-page regulatory intelligence report provides detailed compliance analysis for {report.company_name} 
                      in {report.city}, {report.state}. Based on your specified priorities, we have developed a tailored regulatory roadmap 
                      spanning {formatTimeline(reportData.strategy.timeline)} with immediate, short-term, and ongoing action items.
                    </p>
                  </div>
                </div>

                {/* Key Findings */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-navy-900">Key Findings</h4>
                  <div className="grid gap-3">
                    {[
                      { icon: Scale, text: `${report.state} maintains a ${reportData.location.regulatoryClimate} regulatory climate` },
                      { icon: Gavel, text: `Multi-state licensing requirements span ${reportData.multiStateLicenses.length}+ jurisdictions` },
                      { icon: Clock, text: `Critical compliance deadlines require immediate action (30-90 days)` },
                      { icon: Shield, text: `${reportData.overallRisk} risk based on current compliance posture` }
                    ].map((finding, i) => {
                      const Icon = finding.icon
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 bg-navy-50 rounded-lg">
                          <Icon className="w-5 h-5 text-gold-600 mt-0.5 flex-shrink-0" />
                          <p className="text-navy-700 text-sm">{finding.text}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Risk and Strategy Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`${
                    reportData.overallRisk === 'Elevated' ? 'bg-red-50 border-red-200' :
                    reportData.overallRisk === 'Low' ? 'bg-green-50 border-green-200' :
                    'bg-amber-50 border-amber-200'
                  } border rounded-xl p-5`}>
                    <h5 className={`font-semibold ${
                      reportData.overallRisk === 'Elevated' ? 'text-red-800' :
                      reportData.overallRisk === 'Low' ? 'text-green-800' :
                      'text-amber-800'
                    } mb-2 flex items-center gap-2`}>
                      <AlertTriangle className="w-4 h-4" />
                      Risk Summary
                    </h5>
                    <p className={`text-sm ${
                      reportData.overallRisk === 'Elevated' ? 'text-red-700' :
                      reportData.overallRisk === 'Low' ? 'text-green-700' :
                      'text-amber-700'
                    }`}>
                      {reportData.overallRisk === 'Elevated' 
                        ? 'Enhanced compliance measures recommended.'
                        : reportData.overallRisk === 'Low'
                        ? 'Favorable risk profile.'
                        : 'Moderate risk profile.'}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Strategic Focus
                    </h5>
                    <p className="text-sm text-blue-700">
                      Prioritize license applications in Q{Math.ceil(new Date().getMonth()/3)+1} while building compliance infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 2: Market & Talent Analysis */}
            {activeTab === 'market-talent' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Market & Talent Analysis</h2>
                      <p className="text-navy-500 mt-1">Local market conditions and compliance talent availability</p>
                    </div>
                  </div>
                </div>

                {/* Market Analysis */}
                <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-transparent px-8 py-4 border-b border-navy-100">
                    <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      Market Overview: {reportData.marketAnalysis.tier}
                    </h3>
                  </div>
                  <div className="p-8">
                    <p className="text-navy-700 mb-6">{reportData.marketAnalysis.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-navy-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-navy-500 mb-1">Growth Rate</p>
                        <p className="text-2xl font-bold text-navy-900">{reportData.marketAnalysis.growthRate}%</p>
                      </div>
                      <div className="bg-navy-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-navy-500 mb-1">Competitors</p>
                        <p className="text-2xl font-bold text-navy-900">{reportData.marketAnalysis.competitorDensity}</p>
                      </div>
                      <div className="bg-navy-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-navy-500 mb-1">Opportunity</p>
                        <p className="text-2xl font-bold text-navy-900">{reportData.marketAnalysis.opportunityScore}/100</p>
                      </div>
                      <div className="bg-navy-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-navy-500 mb-1">Key Industries</p>
                        <p className="text-sm font-semibold text-navy-900">{reportData.marketAnalysis.keyIndustries.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Talent Analysis */}
                <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-transparent px-8 py-4 border-b border-navy-100">
                    <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      Compliance Talent Analysis
                    </h3>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-navy-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-navy-500 mb-1">Talent Score</p>
                        <p className="text-2xl font-bold text-navy-900">{reportData.talentAnalysis.talentScore}/100</p>
                      </div>
                      <div className="bg-navy-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-navy-500 mb-1">Talent Rank</p>
                        <p className="text-2xl font-bold text-navy-900">
                          {reportData.talentAnalysis.talentRank === 'high' ? 'High' :
                           reportData.talentAnalysis.talentRank === 'medium' ? 'Medium' : 'Developing'}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-navy-500 mb-1">Professionals</p>
                        <p className="text-2xl font-bold text-navy-900">{reportData.talentAnalysis.totalProfessionals.toLocaleString()}</p>
                      </div>
                      <div className="bg-navy-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-navy-500 mb-1">Avg. Salary</p>
                        <p className="text-2xl font-bold text-gold-600">{formatCurrency(reportData.talentAnalysis.avgSalary)}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-3">Hiring Strategy</h4>
                        <p className="text-navy-700 mb-4">{reportData.talentAnalysis.hiringStrategy}</p>
                        
                        <h4 className="font-semibold text-navy-900 mb-3">Top Recruitment Channels</h4>
                        <ul className="space-y-2">
                          {reportData.talentAnalysis.topChannels.map((channel, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                              <span className="text-navy-700 text-sm">{channel}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-3">Time to Hire</h4>
                          <p className="text-3xl font-bold text-purple-900 mb-2">{reportData.talentAnalysis.timeToHire}</p>
                          <p className="text-sm text-purple-700">Estimated from engagement to offer acceptance</p>
                          
                          <div className="mt-6 pt-4 border-t border-purple-200">
                            <p className="text-sm text-purple-800">
                              <span className="font-bold">Growth Rate:</span> {reportData.talentAnalysis.growthRate}% YoY increase in compliance professionals
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 3: Regulatory Analysis */}
            {activeTab === 'regulatory' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center">
                      <Scale className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Regulatory Analysis: {report.state}</h2>
                      <p className="text-navy-500 mt-1">Detailed framework and requirements</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                    <p className="text-sm text-navy-500 mb-1">Regulatory Climate</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        reportData.location.regulatoryClimate === 'friendly' ? 'bg-green-500' :
                        reportData.location.regulatoryClimate === 'strict' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <p className="text-xl font-bold text-navy-900">
                        {reportData.location.regulatoryClimate === 'friendly' ? 'Friendly' :
                         reportData.location.regulatoryClimate === 'strict' ? 'Strict' : 'Moderate'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                    <p className="text-sm text-navy-500 mb-1">Primary License</p>
                    <p className="text-xl font-bold text-navy-900">
                      {reportData.licenses.length > 0 ? reportData.licenses[0].licenseType : 'Money Transmitter License'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-navy-200 overflow-hidden">
                  <div className="bg-navy-800 px-6 py-4">
                    <h3 className="text-white font-semibold">Licensing Requirements</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-navy-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">License Type</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Requirement</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Timeline</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-100">
                        {reportData.licenses.slice(0, 4).map((license, i) => (
                          <tr key={i} className="hover:bg-navy-50">
                            <td className="py-3 px-4 text-navy-700">{license.licenseType}</td>
                            <td className="py-3 px-4 text-navy-700">{license.required ? 'Required' : 'May be required'}</td>
                            <td className="py-3 px-4 text-navy-700">{license.timeline}</td>
                            <td className="py-3 px-4 text-navy-700">{license.fees || '$500 - $5,000'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                  <h4 className="font-semibold text-navy-900 mb-2">Regulator Contact</h4>
                  <p className="font-medium text-navy-800">{reportData.providers.regulator.name}</p>
                  <p className="text-sm text-navy-600 mt-1">Phone: {reportData.providers.regulator.phone}</p>
                  <p className="text-sm text-navy-600">Email: {reportData.providers.regulator.email}</p>
                  <p className="text-xs text-gold-600 mt-2">{reportData.providers.regulator.specialty}</p>
                </div>

                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Recent Enforcement Activity
                  </h4>
                  <p className="text-sm text-amber-700">
                    {reportData.stateRegulation?.cryptoFriendly === 'strict' 
                      ? 'Active enforcement program with 5+ actions in 2025. Focus on unlicensed money transmission.'
                      : reportData.stateRegulation?.cryptoFriendly === 'friendly'
                      ? 'Limited enforcement activity. Consumer protection remains priority.'
                      : 'Moderate enforcement activity. Regular examinations conducted.'}
                  </p>
                </div>
              </div>
            )}

            {/* PAGE 4: Licensing Matrix */}
            {activeTab === 'licensing' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center">
                      <Gavel className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Multi-State Licensing Matrix</h2>
                      <p className="text-navy-500 mt-1">Requirements across {reportData.multiStateLicenses.length} key jurisdictions</p>
                    </div>
                  </div>
                </div>

                <p className="text-navy-600">
                  Based on your operational footprint, the following licensing requirements have been identified across key jurisdictions:
                </p>

                <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-navy-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">State</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">License Type</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Timeline</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Bonding</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Renewal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-100">
                        {reportData.multiStateLicenses.map((item, i) => (
                          <tr key={i} className="hover:bg-navy-50">
                            <td className="py-3 px-4 font-medium text-navy-900">{item.state}</td>
                            <td className="py-3 px-4 text-navy-700">{item.licenseType}</td>
                            <td className="py-3 px-4 text-navy-700">{item.timeline}</td>
                            <td className="py-3 px-4 text-navy-700">{item.bonding}</td>
                            <td className="py-3 px-4 text-navy-700">{item.renewal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gold-50 border border-gold-200 rounded-xl p-6">
                  <h5 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gold-600" />
                    Standard Application Requirements
                  </h5>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Complete application forms with business plans',
                      'Fingerprint-based background checks for principals',
                      'Audited financial statements',
                      'Surety bonds as specified',
                      'Designate compliance officer',
                      'Written policies and procedures',
                      'Proof of net worth requirements',
                      'Business continuity plan'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-gold-200 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-gold-700 text-xs">✓</span>
                        </div>
                        <span className="text-sm text-navy-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 5: Compliance Roadmap */}
            {activeTab === 'compliance' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/20 flex items-center justify-center">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Compliance Implementation Roadmap</h2>
                      <p className="text-navy-500 mt-1">Phased approach to full compliance</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {reportData.compliancePhases.map((phase, idx) => (
                    <div key={idx} className={`${phase.color} border rounded-xl p-5`}>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold text-navy-900">{phase.phase}</h4>
                        <span className="text-gold-600 font-medium text-sm">{phase.timeline}</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {phase.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className={`w-4 h-4 ${phase.textColor} mt-0.5`} />
                            <span className="text-sm text-navy-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h5 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Key Milestones
                  </h5>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Legal counsel engaged by end of Week 1',
                      'License applications submitted by end of Month 1',
                      'Compliance systems operational by Month 3',
                      'Full compliance achieved by Month 6'
                    ].map((milestone, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-amber-200 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-amber-700 text-xs">✓</span>
                        </div>
                        <span className="text-sm text-amber-800">{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 6: Technology & Tools */}
            {activeTab === 'technology' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                      <Cpu className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Technology & Compliance Tools</h2>
                      <p className="text-navy-500 mt-1">Recommended platforms and solutions</p>
                    </div>
                  </div>
                </div>

                {reportData.techRecommendations.map((category, catIndex) => (
                  <div key={catIndex} className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-50 to-transparent px-8 py-4 border-b border-navy-100">
                      <h3 className="text-lg font-semibold text-navy-900">{category.category}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {category.recommendations.map((rec, recIndex) => (
                        <div key={recIndex} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-navy-50 rounded-xl">
                          <div className="mb-2 md:mb-0">
                            <p className="font-semibold text-navy-900">{rec.name}</p>
                            <p className="text-sm text-navy-600">{rec.description}</p>
                            <p className="text-xs text-navy-500 mt-1">Implementation: {rec.implementationTime}</p>
                          </div>
                          <div className="bg-white px-3 py-1 rounded-full border border-gold-200">
                            <span className="text-sm font-semibold text-gold-700">{rec.priceRange}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bg-gold-50 border border-gold-200 rounded-xl p-6">
                  <h5 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold-600" />
                    Technology Implementation Timeline
                  </h5>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Weeks 1-2: Evaluate vendors, request demos',
                      'Weeks 3-4: Select platforms, begin contracting',
                      'Weeks 5-8: Implementation and integration',
                      'Weeks 9-10: Testing and staff training',
                      'Week 12: Go live'
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-gold-200 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-gold-700 text-xs">✓</span>
                        </div>
                        <span className="text-sm text-navy-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 7: Regulatory Resources */}
            {activeTab === 'resources' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                      <Landmark className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Regulatory Resources</h2>
                      <p className="text-navy-500 mt-1">Key contacts and service providers</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {/* State Regulator */}
                  <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                    <div className="bg-navy-800 px-6 py-3">
                      <h3 className="text-white font-semibold">State Regulator</h3>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-navy-900">{reportData.providers.regulator.name}</p>
                      <p className="text-sm text-navy-600 mt-1">Phone: {reportData.providers.regulator.phone}</p>
                      <p className="text-sm text-navy-600">Email: {reportData.providers.regulator.email}</p>
                      <p className="text-xs text-gold-600 mt-2">{reportData.providers.regulator.specialty}</p>
                    </div>
                  </div>

                  {/* Legal Counsel */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                      <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gold-600" />
                        Qualified Legal Counsel
                      </h4>
                      <div className="space-y-3">
                        {reportData.providers.legalCounsel.slice(0, 3).map((counsel, i) => (
                          <div key={i} className="border-b border-navy-200 pb-2 last:border-0 last:pb-0">
                            <p className="font-medium text-navy-800">{counsel.name}</p>
                            <p className="text-xs text-gold-600">{counsel.specialty}</p>
                            <p className="text-xs text-navy-600">{counsel.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Consultants */}
                    <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                      <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gold-600" />
                        Compliance Consultants
                      </h4>
                      <div className="space-y-3">
                        {reportData.providers.consultants.slice(0, 3).map((consultant, i) => (
                          <div key={i} className="border-b border-navy-200 pb-2 last:border-0 last:pb-0">
                            <p className="font-medium text-navy-800">{consultant.name}</p>
                            <p className="text-xs text-gold-600">{consultant.specialty}</p>
                            <p className="text-xs text-navy-600">{consultant.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Technology & Associations */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                      <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-gold-600" />
                        Technology Providers
                      </h4>
                      <div className="space-y-2">
                        {reportData.providers.techProviders.slice(0, 4).map((provider, i) => (
                          <p key={i} className="text-sm text-navy-700">• {provider.name} - {provider.specialty}</p>
                        ))}
                      </div>
                    </div>

                    <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                      <h4 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-gold-600" />
                        Industry Associations
                      </h4>
                      <div className="space-y-2">
                        {reportData.providers.associations.slice(0, 4).map((assoc, i) => (
                          <p key={i} className="text-sm text-navy-700">• {assoc.name} - {assoc.specialty}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 8: Risk Assessment */}
            {activeTab === 'risk' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Risk Assessment</h2>
                      <p className="text-navy-500 mt-1">Comprehensive risk analysis and mitigation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                  <div className="bg-navy-800 px-6 py-4">
                    <h3 className="text-white font-semibold">Risk Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-navy-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Risk Category</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Likelihood</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Impact</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Mitigation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-100">
                        {reportData.risks.map((risk, i) => (
                          <tr key={i}>
                            <td className="py-3 px-4 text-sm font-medium text-navy-900">{risk.category}</td>
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
                            <td className="py-3 px-4 text-sm text-navy-600">{risk.mitigation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`${
                  reportData.overallRisk === 'Elevated' ? 'bg-red-50 border-red-200' :
                  reportData.overallRisk === 'Low' ? 'bg-green-50 border-green-200' :
                  'bg-amber-50 border-amber-200'
                } border rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-semibold text-lg ${
                      reportData.overallRisk === 'Elevated' ? 'text-red-800' :
                      reportData.overallRisk === 'Low' ? 'text-green-800' :
                      'text-amber-800'
                    }`}>
                      Overall Risk Rating: {reportData.overallRisk}
                    </h4>
                    <Shield className={`w-6 h-6 ${
                      reportData.overallRisk === 'Elevated' ? 'text-red-600' :
                      reportData.overallRisk === 'Low' ? 'text-green-600' :
                      'text-amber-600'
                    }`} />
                  </div>
                  <p className={`text-sm ${
                    reportData.overallRisk === 'Elevated' ? 'text-red-700' :
                    reportData.overallRisk === 'Low' ? 'text-green-700' :
                    'text-amber-700'
                  }`}>
                    {reportData.overallRisk === 'Elevated' 
                      ? 'Enhanced compliance measures recommended. Prioritize licensing and monitoring systems.'
                      : reportData.overallRisk === 'Low'
                      ? 'Favorable risk profile. Maintain standard compliance protocols.'
                      : 'Moderate risk profile. Focus on timely licensing and regular audits.'}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Insurance Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Directors & Officers (D&O) Liability: $2-5M coverage',
                      'Errors & Omissions (E&O): $1-3M coverage',
                      'Cyber Liability: $1-5M coverage',
                      'Crime/Fidelity Bond: $500k-1M coverage'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span className="text-sm text-navy-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 9: Budget Guide */}
            {activeTab === 'budget' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                      <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Budget & Investment Guide</h2>
                      <p className="text-navy-500 mt-1">Estimated costs and allocation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                  <div className="bg-navy-800 px-6 py-4">
                    <h3 className="text-white font-semibold">Estimated Investment Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-navy-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold">Category</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold">Estimated Cost</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-100">
                        {reportData.budgetGuide.breakdown.map((item, i) => (
                          <tr key={i}>
                            <td className="py-3 px-4 font-medium text-navy-900">{item.category}</td>
                            <td className="py-3 px-4 text-gold-600 font-semibold">{item.amount}</td>
                            <td className="py-3 px-4 text-sm text-navy-600">{item.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-8 text-white shadow-xl">
                  <p className="text-gold-400 text-sm mb-2">Total Estimated Investment</p>
                  <p className="text-4xl font-bold text-white mb-2">
                    {formatCurrency(reportData.budgetGuide.totalEstimated.min)} - {formatCurrency(reportData.budgetGuide.totalEstimated.max)}
                  </p>
                  <p className="text-sm text-navy-300">
                    *Actual costs may vary based on specific requirements, state fees, and chosen vendors
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Cost-Saving Recommendations
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Bundle technology platforms where possible',
                      'Consider contract-to-hire for compliance roles',
                      'Leverage free regulatory monitoring tools initially',
                      'Join industry associations for discounted services',
                      'Negotiate multi-year vendor contracts',
                      'Share compliance resources across entities'
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <span className="text-sm text-navy-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 10: Next Steps & Ongoing Compliance */}
            {activeTab === 'next-steps' && (
              <div className="space-y-8">
                <div className="relative mb-8">
                  <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-gold-600 to-gold-400 rounded-full" />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center">
                      <CalendarCheck className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-navy-900">Next Steps & Ongoing Compliance</h2>
                      <p className="text-navy-500 mt-1">Your action plan and compliance calendar</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Immediate (Next 7 Days)
                    </h3>
                    <ul className="space-y-3">
                      {reportData.nextSteps.immediate.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-amber-700 text-xs font-bold">{idx + 1}</span>
                          </div>
                          <span className="text-sm text-navy-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Short-Term (30-90 Days)
                    </h3>
                    <ul className="space-y-3">
                      {reportData.nextSteps.shortTerm.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-blue-700 text-xs font-bold">{idx + 1}</span>
                          </div>
                          <span className="text-sm text-navy-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Ongoing Obligations
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {reportData.nextSteps.ongoing.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-navy-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Compliance Calendar
                  </h3>
                  <div className="space-y-4">
                    {reportData.nextSteps.complianceCalendar.map((item, idx) => (
                      <div key={idx}>
                        <h4 className="font-semibold text-purple-700 mb-2">{item.timeframe}</h4>
                        <ul className="space-y-2 ml-4">
                          {item.tasks.map((task, taskIdx) => (
                            <li key={taskIdx} className="flex items-start gap-2">
                              <div className="w-4 h-4 bg-purple-200 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-purple-700 text-xs">✓</span>
                              </div>
                              <span className="text-sm text-navy-700">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gold-50 border border-gold-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-navy-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-gold-600" />
                    Quarterly Review Checklist
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Review regulatory changes in all operating states',
                      'Audit transaction monitoring alerts and outcomes',
                      'Update risk assessment with new findings',
                      'Verify all licenses are current and renewals scheduled',
                      'Conduct staff training on new requirements',
                      'Review and update policies and procedures'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-gold-600 mt-0.5" />
                        <span className="text-sm text-navy-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Footer */}
          <div className="border-t border-slate-200 px-8 py-4 bg-navy-50/50">
            <p className="text-xs text-navy-500 text-center">
              DISCLAIMER: This 10-page report provides regulatory intelligence and educational guidance 
              based on AI analysis and human review. Veridian Group is not a law firm. 
              All compliance recommendations should be reviewed with qualified legal counsel 
              in {report.state} before implementation. Regulations are subject to change without notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}