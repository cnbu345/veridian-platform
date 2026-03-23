// src/app/admin/customers/[id]/templates/[templateId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Layout,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  Calendar,
  User,
  Lock,
  Info,
  TrendingUp,
  Shield,
  DollarSign,
  Clock,
  MapPin,
  Building2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TemplateSection {
  id: string
  name: string
  type: string
  is_visible: boolean
  is_required?: boolean
  order?: number
}

interface TemplateStyles {
  primary_color: string
  secondary_color: string
  font_family: string
  show_logo: boolean
  show_page_numbers: boolean
}

interface ClientTemplate {
  id: string
  name: string
  description: string
  logo_url: string | null
  styles: TemplateStyles
  sections: TemplateSection[]
  is_default: boolean
  created_at: string
  updated_at: string
  usage_count: number
  user_id: string
}

const sectionTypeToName: Record<string, string> = {
  cover: 'Cover Page',
  header: 'Header',
  executive_summary: 'Executive Summary',
  client_input: 'Client Input Summary',
  location_analysis: 'Location Analysis',
  regulatory_analysis: 'Regulatory Analysis',
  talent_analysis: 'Talent Analysis',
  licensing_matrix: 'Licensing Matrix',
  compliance_roadmap: 'Compliance Roadmap',
  technology_tools: 'Technology & Tools',
  risk_assessment: 'Risk Assessment',
  budget_guide: 'Budget Guide',
  next_steps: 'Next Steps',
  footer: 'Footer',
  disclaimer: 'Disclaimer'
}

// FULLY ENHANCED rich preview renderer for each section type
const renderRichPreview = (section: TemplateSection, styles: TemplateStyles) => {
  const accentColor = styles.secondary_color
  
  switch (section.type) {
    case 'executive_summary':
      return (
        <div className="mt-4 space-y-4">
          <div className="bg-gradient-to-br from-navy-50 to-slate-50 p-4 rounded-xl border border-navy-100">
            <p className="text-sm font-semibold text-navy-800 mb-2">Strategic Overview</p>
            <p className="text-xs text-navy-600 leading-relaxed">
              Comprehensive regulatory analysis for your organization, identifying key compliance requirements 
              and strategic opportunities across your operating jurisdictions. Risk profile indicates moderate 
              exposure with clear mitigation pathways.
            </p>
            <div className="flex gap-2 mt-3">
              <span className="text-xs bg-navy-100 text-navy-700 px-2 py-1 rounded">Risk Profile: Moderate</span>
              <span className="text-xs bg-navy-100 text-navy-700 px-2 py-1 rounded">Timeline: 6 Months</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
              <p className="text-xs font-semibold text-amber-800">Key Findings</p>
              <ul className="text-xs text-amber-700 mt-2 space-y-1 list-disc list-inside">
                <li>Regulatory requirements across 15+ jurisdictions</li>
                <li>Licensing timeline: 4-8 months</li>
                <li>Compliance infrastructure needed</li>
              </ul>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-800">Recommendations</p>
              <ul className="text-xs text-emerald-700 mt-2 space-y-1 list-disc list-inside">
                <li>Engage compliance counsel immediately</li>
                <li>Prioritize license applications</li>
                <li>Implement monitoring systems</li>
              </ul>
            </div>
          </div>
        </div>
      )
    
    case 'client_input':
      return (
        <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 text-xs font-bold">✓</span>
            </div>
            <p className="text-sm font-semibold text-amber-800">Your Custom Compliance Request</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-amber-600 font-medium">PRIMARY FOCUS</p>
              <p className="text-sm text-amber-900">Regulatory Compliance</p>
            </div>
            <div>
              <p className="text-xs text-amber-600 font-medium">TIMELINE</p>
              <p className="text-sm text-amber-900">6 Months (Standard)</p>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-xs text-amber-600 font-medium">SECONDARY FOCUS</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Licensing</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Risk Assessment</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-2">
              <p className="text-xs font-medium text-amber-700">Your Concerns</p>
              <p className="text-xs text-amber-800 italic mt-1">"Regulatory compliance across multiple states..."</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <p className="text-xs font-medium text-amber-700">Your Goals</p>
              <p className="text-xs text-amber-800 italic mt-1">"Achieve full compliance within 6 months..."</p>
            </div>
          </div>
        </div>
      )
    
    case 'location_analysis':
      return (
        <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 border-r border-slate-200">
              <p className="text-2xl font-bold" style={{ color: accentColor }}>15%</p>
              <p className="text-xs text-navy-500">Market Growth</p>
            </div>
            <div className="text-center p-2 border-r border-slate-200">
              <p className="text-2xl font-bold" style={{ color: accentColor }}>High</p>
              <p className="text-xs text-navy-500">Talent Density</p>
            </div>
            <div className="text-center p-2">
              <p className="text-2xl font-bold" style={{ color: accentColor }}>85/100</p>
              <p className="text-xs text-navy-500">Opportunity Score</p>
            </div>
          </div>
          <p className="text-xs text-navy-600 leading-relaxed">
            Your location offers strong market opportunities with a growing compliance talent pool. 
            Competitive landscape analysis indicates favorable conditions for market entry.
          </p>
        </div>
      )
    
    case 'licensing_matrix':
      return (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">State</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">License Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">Timeline</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 text-xs text-navy-600">Texas</td>
                <td className="px-3 py-2 text-xs text-navy-600">Money Services Business</td>
                <td className="px-3 py-2 text-xs text-navy-600">3-4 months</td>
                <td className="px-3 py-2 text-xs text-navy-600">$500</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 text-xs text-navy-600">New York</td>
                <td className="px-3 py-2 text-xs text-navy-600">BitLicense</td>
                <td className="px-3 py-2 text-xs text-navy-600">6-12 months</td>
                <td className="px-3 py-2 text-xs text-navy-600">$5,000</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 text-xs text-navy-600">California</td>
                <td className="px-3 py-2 text-xs text-navy-600">DFPI License</td>
                <td className="px-3 py-2 text-xs text-navy-600">4-8 months</td>
                <td className="px-3 py-2 text-xs text-navy-600">$1,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    
    case 'compliance_roadmap':
      return (
        <div className="mt-4 space-y-3">
          <div className="p-3 border-l-4 rounded-r-xl bg-slate-50" style={{ borderLeftColor: accentColor }}>
            <p className="text-sm font-semibold text-navy-800">Phase 1: Foundation</p>
            <p className="text-xs text-navy-500 mt-1">Days 1-30</p>
            <ul className="mt-2 space-y-1">
              <li className="text-xs text-navy-600">• Engage qualified compliance counsel</li>
              <li className="text-xs text-navy-600">• Submit initial license applications</li>
              <li className="text-xs text-navy-600">• Designate Chief Compliance Officer</li>
            </ul>
          </div>
          <div className="p-3 border-l-4 rounded-r-xl bg-slate-50" style={{ borderLeftColor: accentColor }}>
            <p className="text-sm font-semibold text-navy-800">Phase 2: Licensing & Development</p>
            <p className="text-xs text-navy-500 mt-1">Days 31-60</p>
            <ul className="mt-2 space-y-1">
              <li className="text-xs text-navy-600">• Complete remaining license applications</li>
              <li className="text-xs text-navy-600">• Finalize compliance policies</li>
              <li className="text-xs text-navy-600">• Select compliance technology</li>
            </ul>
          </div>
          <div className="p-3 border-l-4 rounded-r-xl bg-slate-50" style={{ borderLeftColor: accentColor }}>
            <p className="text-sm font-semibold text-navy-800">Phase 3: Implementation & Monitoring</p>
            <p className="text-xs text-navy-500 mt-1">Days 61-90</p>
            <ul className="mt-2 space-y-1">
              <li className="text-xs text-navy-600">• Full compliance system implementation</li>
              <li className="text-xs text-navy-600">• Staff training completion</li>
              <li className="text-xs text-navy-600">• Initial regulatory reporting</li>
            </ul>
          </div>
        </div>
      )
    
    case 'technology_tools':
      return (
        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-navy-800">Chainalysis</p>
                <p className="text-xs text-navy-500 mt-1">Blockchain analytics and transaction monitoring</p>
              </div>
              <p className="text-xs text-gold-600 font-medium">4-6 weeks</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-navy-800">ComplyAdvantage</p>
                <p className="text-xs text-navy-500 mt-1">AML screening and sanctions monitoring</p>
              </div>
              <p className="text-xs text-gold-600 font-medium">3-5 weeks</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-navy-800">Elliptic</p>
                <p className="text-xs text-navy-500 mt-1">Blockchain analytics and compliance screening</p>
              </div>
              <p className="text-xs text-gold-600 font-medium">4-6 weeks</p>
            </div>
          </div>
        </div>
      )
    
    case 'risk_assessment':
      return (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-navy-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">Risk Category</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">Likelihood</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-navy-700">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 text-xs text-navy-600">Regulatory Change</td>
                <td className="px-3 py-2 text-xs text-amber-600 font-medium">Medium</td>
                <td className="px-3 py-2 text-xs text-red-600 font-medium">High</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 text-xs text-navy-600">License Delays</td>
                <td className="px-3 py-2 text-xs text-amber-600 font-medium">Medium</td>
                <td className="px-3 py-2 text-xs text-orange-600 font-medium">Medium</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 text-xs text-navy-600">Enforcement Action</td>
                <td className="px-3 py-2 text-xs text-green-600 font-medium">Low</td>
                <td className="px-3 py-2 text-xs text-red-600 font-medium">Critical</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    
    case 'budget_guide':
      return (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-navy-700">Legal & Compliance Counsel</span>
            <span className="text-sm font-semibold text-gold-600">$25,000 - $100,000</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-navy-700">Licensing & Filing Fees</span>
            <span className="text-sm font-semibold text-gold-600">$5,000 - $50,000</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-navy-700">Technology & Software</span>
            <span className="text-sm font-semibold text-gold-600">$30,000 - $150,000</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-navy-700">Compliance Staff</span>
            <span className="text-sm font-semibold text-gold-600">$80,000 - $250,000</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-navy-900 rounded-lg mt-3">
            <span className="text-sm text-white font-medium">Total Estimated Investment</span>
            <span className="text-sm font-bold text-gold-400">$140,000 - $550,000</span>
          </div>
        </div>
      )
    
    case 'next_steps':
      return (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-2">Immediate (Next 7 Days)</p>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>Engage qualified compliance counsel</li>
              <li>Begin license application preparation</li>
              <li>Designate interim Compliance Officer</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-2">Short-Term (30-90 Days)</p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Submit license applications</li>
              <li>Select compliance technology</li>
              <li>Hire permanent Compliance Officer</li>
            </ul>
          </div>
        </div>
      )
    
    default:
      return (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-navy-600">
            Sample content for {sectionTypeToName[section.type] || section.name}. This demonstrates how the section will appear in the final report.
          </p>
        </div>
      )
  }
}

export default function ClientTemplateDetailPage() {
  const params = useParams()
  const [template, setTemplate] = useState<ClientTemplate | null>(null)
  const [customer, setCustomer] = useState<{ company_name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const customerId = params?.id as string
  const templateId = params?.templateId as string

  useEffect(() => {
    if (customerId && templateId) {
      fetchTemplate()
      fetchCustomer()
    }
  }, [customerId, templateId])

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/customers/${customerId}/templates/${templateId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch template')
      }
      
      setTemplate(data.template)
    } catch (error) {
      console.error('Failed to fetch template:', error)
      setError(error instanceof Error ? error.message : 'Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`)
      const data = await response.json()
      
      if (response.ok) {
        setCustomer({
          company_name: data.user.company_name || 'Unknown Company',
          email: data.user.email
        })
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error)
    }
  }

  const getSectionStatusBadge = (section: TemplateSection) => {
    if (section.type === 'header' || section.type === 'disclaimer') {
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
          <Lock className="w-3 h-3" />
          Required
        </span>
      )
    }
    if (section.is_visible) {
      return (
        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Visible
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
        <Eye className="w-3 h-3" />
        Hidden
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(/([AP]M)$/, ' $1')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-navy-900 mb-2">Template Not Found</h2>
        <p className="text-navy-600 mb-4">{error || 'The requested template could not be found'}</p>
        <Link
          href={`/admin/customers/${customerId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/customers/${customerId}`}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-navy-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">{template.name}</h1>
            <p className="text-navy-600 mt-1">
              Customer: {customer?.company_name || 'Unknown'} • Template ID: {template.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {template.is_default ? (
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Active Template
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium flex items-center gap-1">
              <Layout className="w-4 h-4" />
              Inactive
            </span>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Template Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Info Card - View Only */}
          <div className={`rounded-xl border p-4 ${template.is_default ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-start gap-3">
              <Info className={`w-5 h-5 ${template.is_default ? 'text-green-600' : 'text-slate-500'}`} />
              <div>
                {template.is_default ? (
                  <>
                    <p className="text-sm font-medium text-green-800">Active Template</p>
                    <p className="text-xs text-green-700 mt-0.5">
                      This is the customer's active template. All new reports will use this branding and layout.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-700">Inactive Template</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      This template is available but not active. The customer can activate it from their dashboard.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Template Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Name</label>
                <p className="text-navy-900">{template.name}</p>
              </div>
              {template.description && (
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
                  <p className="text-navy-600">{template.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Created</label>
                  <p className="text-navy-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(template.created_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Last Updated</label>
                  <p className="text-navy-600 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {formatDate(template.updated_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Usage Count</label>
                  <p className="text-navy-600 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {template.usage_count} reports generated
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Branding Styles */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Branding Styles</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm" 
                      style={{ backgroundColor: template.styles.primary_color }}
                    />
                    <span className="text-sm text-navy-600 font-mono">{template.styles.primary_color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg border border-slate-200 shadow-sm" 
                      style={{ backgroundColor: template.styles.secondary_color }}
                    />
                    <span className="text-sm text-navy-600 font-mono">{template.styles.secondary_color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Font Family</label>
                  <p className="text-sm text-navy-600">{template.styles.font_family}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Logo</label>
                {template.logo_url ? (
                  <div className="flex items-center gap-3">
                    <img src={template.logo_url} alt="Logo" className="h-12 w-auto object-contain" />
                    <a 
                      href={template.logo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-gold-600 hover:text-gold-700"
                    >
                      View Full Size
                      <ExternalLink className="w-3 h-3 inline ml-1" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-navy-400">No logo uploaded</p>
                )}
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={template.styles.show_logo}
                    disabled
                    className="w-4 h-4 rounded border-slate-300 bg-slate-100"
                  />
                  <span className="text-sm text-navy-600">Show logo on reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={template.styles.show_page_numbers}
                    disabled
                    className="w-4 h-4 rounded border-slate-300 bg-slate-100"
                  />
                  <span className="text-sm text-navy-600">Show page numbers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Report Sections</h2>
            <div className="space-y-2">
              {template.sections?.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-navy-800">{sectionTypeToName[section.type] || section.name}</span>
                      {getSectionStatusBadge(section)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Preview & Customer Info */}
        <div className="space-y-6">
          {/* Live Preview Card - FULLY ENHANCED */}
          {showPreview && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Live Preview</h2>
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {/* Header Preview */}
                <div className="border-b pb-4" style={{ borderColor: template.styles.secondary_color }}>
                  <div className="text-center">
                    {template.styles.show_logo && template.logo_url && (
                      <img src={template.logo_url} alt="Logo" className="h-12 mx-auto mb-3" />
                    )}
                    <h2 style={{ color: template.styles.primary_color }} className="text-xl font-bold">
                      Regulatory Compliance Report
                    </h2>
                    <p className="text-xs text-navy-400 mt-1">Prepared for: Sample Company</p>
                  </div>
                </div>
                
                {/* Preview each visible section with FULL rich content */}
                {template.sections?.filter(s => s.is_visible && s.type !== 'header' && s.type !== 'footer').map((section) => (
                  <div key={section.id} className="border-b pb-4 last:border-b-0">
                    <h3 className="text-md font-semibold mb-2" style={{ color: template.styles.primary_color }}>
                      {sectionTypeToName[section.type] || section.name}
                    </h3>
                    {renderRichPreview(section, template.styles)}
                  </div>
                ))}
                
                {/* Footer Preview */}
                {template.styles.show_page_numbers && (
                  <div className="text-center text-xs text-navy-400 pt-2">
                    Page 1 of 1
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Info Card */}
          {customer && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Customer</h2>
              <div className="space-y-2">
                <p className="text-sm text-navy-700 font-medium">{customer.company_name}</p>
                <p className="text-sm text-navy-500 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {customer.email}
                </p>
                <Link
                  href={`/admin/customers/${customerId}`}
                  className="inline-flex items-center gap-1 text-sm text-gold-600 hover:text-gold-700 mt-2"
                >
                  View Customer Profile
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}