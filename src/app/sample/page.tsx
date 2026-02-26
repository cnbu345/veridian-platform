// src/app/sample/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight,
  Download,
  Eye,
  Star,
  ChevronRight,
  CheckCircle,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Scale,
  Gavel,
  Clock,
  Landmark,
  AlertTriangle,
  Users,
  Shield,
  TrendingUp,
  Target,
  Award
} from 'lucide-react'
import { sampleReportData, getIconByName } from '@/lib/sample/sampleReportData'

export default function SamplePage() {
  const [activeTab, setActiveTab] = useState('executive-summary')
  const [showFullReport, setShowFullReport] = useState(false)

  const data = sampleReportData
  const company = data.company

  const tabs = [
    { id: 'executive-summary', label: 'Executive Summary', icon: FileText },
    { id: 'regulatory', label: 'Regulatory Analysis', icon: Scale },
    { id: 'licensing', label: 'Licensing Matrix', icon: Gavel },
    { id: 'compliance', label: 'Compliance Roadmap', icon: Clock },
    { id: 'resources', label: 'Regulatory Contacts', icon: Landmark },
    { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
  ]

  // Helper function to get icon component
  const getIcon = (iconName: string, className: string = 'w-5 h-5') => {
    const Icon = getIconByName(iconName)
    return <Icon className={className} />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white pt-32 pb-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Sample Regulatory Intelligence Report
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              See What <span className="text-gold-400">$2,500+</span> Compliance Intelligence Looks Like
            </h1>
            <p className="text-xl text-navy-200 mb-8 max-w-2xl mx-auto">
              Preview the comprehensive, multi-state regulatory analysis that leading digital asset firms trust for their compliance strategy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/generate"
                className="px-8 py-4 bg-gold-500 text-navy-900 font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/25 inline-flex items-center gap-2"
              >
                Get Your Report Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setShowFullReport(!showFullReport)}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 inline-flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showFullReport ? 'Show Summary' : 'View Full Sample'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-navy-600">
              <Shield className="w-5 h-5 text-gold-600" />
              <span>SOC2 Type II Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-navy-600">
              <Users className="w-5 h-5 text-gold-600" />
              <span>Trusted by 50+ Digital Asset Firms</span>
            </div>
            <div className="flex items-center gap-2 text-navy-600">
              <TrendingUp className="w-5 h-5 text-gold-600" />
              <span>Updated Weekly with Regulatory Changes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview Section */}
      <div className="section-padding">
        <div className="container-custom max-w-6xl">
          {/* Report Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-gold-400 text-sm mb-2">
                    <FileText className="w-4 h-4" />
                    <span>SAMPLE REPORT • CONFIDENTIAL</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{company.name}</h2>
                  <div className="flex items-center gap-4 text-navy-300 text-sm">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {company.industry}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {company.city}, {company.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {company.date}
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <span className="text-xs text-navy-300">Report ID</span>
                  <p className="text-sm font-mono text-gold-400">SAMPLE-2026-001</p>
                </div>
              </div>
            </div>

            {/* Market Tier Badge */}
            <div className="px-8 py-4 border-b border-slate-200 bg-navy-50/50">
              <div className="flex items-center gap-4">
                <span className="text-sm text-navy-600">Market Analysis:</span>
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  <MapPin className="w-3 h-3 mr-1" />
                  Major Market • {company.msa} • Population: {company.population}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3 mr-1" />
                  Regulatory Climate: {company.regulatoryClimate === 'friendly' ? 'Friendly' : 'Moderate'}
                </span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200">
              <div className="flex overflow-x-auto px-8">
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

            {/* Tab Content - Dynamically Rendered */}
            <div className="p-8">
              {activeTab === 'executive-summary' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gold-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900">Executive Summary</h3>
                  </div>

                  {/* Company Overview Card */}
                  <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gold-400 text-sm mb-1">INSTITUTION PROFILE</p>
                        <h4 className="text-xl font-bold mb-2">{company.name}</h4>
                        <div className="flex items-center gap-3 text-navy-300 text-sm">
                          <span>{company.industry}</span>
                          <span>•</span>
                          <span>{company.city}, {company.state}</span>
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-lg px-3 py-1">
                        <p className="text-xs text-navy-300">Report Date</p>
                        <p className="text-sm font-semibold text-gold-400">{company.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Findings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-navy-900">Key Findings</h4>
                    <div className="grid gap-3">
                      {data.keyFindings.map((finding, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-navy-50 rounded-lg">
                          {getIcon(finding.icon, 'w-5 h-5 text-gold-600 mt-0.5 flex-shrink-0')}
                          <p className="text-navy-700 text-sm">{finding.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk and Strategy Cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`${data.riskSummary.bgColor} border ${data.riskSummary.borderColor} rounded-xl p-4`}>
                      <h5 className={`font-semibold ${data.riskSummary.textColor} mb-2 flex items-center gap-2`}>
                        {getIcon(data.riskSummary.icon, 'w-4 h-4')}
                        Risk Summary
                      </h5>
                      <p className={`text-sm ${data.riskSummary.textColor.replace('800', '700')}`}>
                        {data.riskSummary.text}
                      </p>
                    </div>
                    <div className={`${data.strategicFocus.bgColor} border ${data.strategicFocus.borderColor} rounded-xl p-4`}>
                      <h5 className={`font-semibold ${data.strategicFocus.textColor} mb-2 flex items-center gap-2`}>
                        {getIcon(data.strategicFocus.icon, 'w-4 h-4')}
                        Strategic Focus
                      </h5>
                      <p className={`text-sm ${data.strategicFocus.textColor.replace('800', '700')}`}>
                        {data.strategicFocus.text}
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    {data.metrics.map((metric, i) => (
                      <div key={i} className="bg-navy-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-navy-500 mb-1">{metric.label}</p>
                        <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'regulatory' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                      <Scale className="w-5 h-5 text-gold-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900">Regulatory Analysis: {company.state}</h3>
                  </div>

                  <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                    <p className="text-navy-700">{data.regulatoryAnalysis.summary}</p>
                  </div>

                  <h4 className="text-lg font-semibold text-navy-900">Licensing Requirements</h4>
                  <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-navy-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">License Type</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Requirement</th>
                          <th className="text-left py-3 px-4 text-navy-700 font-semibold text-sm">Timeline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-100">
                        {data.regulatoryAnalysis.requirements.map((req, i) => (
                          <tr key={i}>
                            <td className="py-3 px-4 text-navy-700">{req.type}</td>
                            <td className="py-3 px-4 text-navy-700">{req.requirement}</td>
                            <td className="py-3 px-4 text-navy-700">{req.timeline}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h4 className="text-lg font-semibold text-navy-900">Regulator Contact</h4>
                  <div className="bg-navy-50 rounded-xl p-4 border border-navy-200">
                    <p className="font-semibold text-navy-900">{data.regulatoryAnalysis.regulator.name}</p>
                    <p className="text-sm text-navy-600 mt-1">Phone: {data.regulatoryAnalysis.regulator.phone}</p>
                    <p className="text-sm text-navy-600">Email: {data.regulatoryAnalysis.regulator.email}</p>
                    <p className="text-sm text-navy-600">Website: {data.regulatoryAnalysis.regulator.website}</p>
                  </div>
                </div>
              )}

              {activeTab === 'licensing' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-gold-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900">Multi-State Licensing Matrix</h3>
                  </div>

                  <p className="text-navy-600">
                    Based on your operational footprint, the following licensing requirements have been identified across key jurisdictions:
                  </p>

                  <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
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
                        {data.licensingMatrix.map((item, i) => (
                          <tr key={i} className="hover:bg-navy-50">
                            <td className="py-3 px-4 font-medium text-navy-900">{item.state}</td>
                            <td className="py-3 px-4 text-navy-700">{item.license}</td>
                            <td className="py-3 px-4 text-navy-700">{item.timeline}</td>
                            <td className="py-3 px-4 text-navy-700">{item.bonding}</td>
                            <td className="py-3 px-4 text-navy-700">{item.renewal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gold-50 border border-gold-200 rounded-xl p-5">
                    <h5 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-gold-600" />
                      Application Requirements
                    </h5>
                    <div className="grid md:grid-cols-2 gap-2">
                      {data.applicationRequirements.map((item, i) => (
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

              {activeTab === 'compliance' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gold-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900">Compliance Roadmap</h3>
                  </div>

                  <div className="space-y-4">
                    {data.compliancePhases.map((phase, idx) => (
                      <div key={idx} className={`${phase.color} border rounded-xl p-5`}>
                        <h4 className={`text-lg font-semibold ${phase.textColor} mb-3`}>{phase.phase}</h4>
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
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                      <Landmark className="w-5 h-5 text-gold-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy-900">Regulatory Resources</h3>
                  </div>

                  <div className="grid gap-4">
                    <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                      <div className="bg-navy-800 px-6 py-3">
                        <h4 className="text-white font-semibold">State Regulators</h4>
                      </div>
                      <div className="divide-y divide-navy-100">
                        {data.regulatorContacts.map((reg, i) => (
                          <div key={i} className="p-4 hover:bg-navy-50">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-semibold text-navy-900">{reg.state}</span>
                                <p className="text-sm text-navy-600">{reg.agency}</p>
                              </div>
                              <span className="text-gold-600 font-medium text-sm">{reg.phone}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                        <h4 className="font-semibold text-navy-900 mb-3">Qualified Legal Counsel</h4>
                        <div className="space-y-3">
                          {data.legalCounsel.map((counsel, i) => (
                            <div key={i}>
                              <p className="font-medium text-navy-800">{counsel.name}</p>
                              <p className="text-sm text-navy-600">{counsel.specialty}</p>
                              <p className="text-sm text-navy-600">{counsel.phone}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-navy-50 rounded-xl p-5 border border-navy-200">
                        <h4 className="font-semibold text-navy-900 mb-3">Technology Providers</h4>
                        <div className="space-y-3">
                          {data.technologyProviders.map((provider, i) => (
                            <div key={i}>
                              <p className="font-medium text-navy-800">{provider.name}</p>
                              <p className="text-sm text-navy-600">{provider.specialty}</p>
                            </div>
                          ))}
                        </div>
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
                    <h3 className="text-2xl font-bold text-navy-900">Risk Assessment</h3>
                  </div>

                  <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                    <div className="bg-navy-800 px-6 py-3">
                      <h4 className="text-white font-semibold">Risk Matrix</h4>
                    </div>
                    <div className="p-4">
                      <table className="w-full">
                        <thead className="bg-navy-50">
                          <tr>
                            <th className="text-left py-2 px-3 text-navy-700 font-semibold text-sm">Risk Category</th>
                            <th className="text-left py-2 px-3 text-navy-700 font-semibold text-sm">Likelihood</th>
                            <th className="text-left py-2 px-3 text-navy-700 font-semibold text-sm">Impact</th>
                            <th className="text-left py-2 px-3 text-navy-700 font-semibold text-sm">Mitigation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-100">
                          {data.riskMatrix.map((risk, i) => (
                            <tr key={i}>
                              <td className="py-2 px-3 text-sm text-navy-700">{risk.category}</td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  risk.likelihood === 'High' ? 'bg-red-100 text-red-800' :
                                  risk.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {risk.likelihood}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  risk.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                                  risk.impact === 'High' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {risk.impact}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-sm text-navy-600">{risk.mitigation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                    <h4 className="font-semibold text-amber-800 mb-2">Overall Risk Rating: {data.overallRisk.rating}</h4>
                    <p className="text-sm text-amber-700">{data.overallRisk.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Report Footer */}
            <div className="border-t border-slate-200 px-8 py-4 bg-navy-50/50">
              <p className="text-xs text-navy-500 text-center">
                This is a SAMPLE report for demonstration purposes only. Actual reports contain complete analysis for all 50 states.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 text-white text-center mt-8">
            <h3 className="text-2xl font-bold mb-3">Ready for Your Complete Report?</h3>
            <p className="text-navy-200 mb-6 max-w-2xl mx-auto">
              Get your personalized regulatory intelligence report with analysis for all states where you operate.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 text-navy-900 font-semibold rounded-xl hover:bg-gold-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/25"
            >
              Generate Your Report Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white section-padding border-t border-slate-200">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">What's Included in Every Report</h2>
            <p className="text-lg text-navy-600">
              Comprehensive regulatory intelligence that digital asset firms rely on for compliance confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.features.map((feature, index) => (
              <div key={index} className="bg-navy-50 rounded-xl p-6 border border-navy-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
                  {getIcon(feature.icon, 'w-6 h-6 text-gold-600')}
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-navy-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Trusted by Industry Leaders</h2>
            <p className="text-lg text-navy-600">
              See what compliance officers and executives say about our regulatory intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {data.testimonials.map((testimonial, index) => (
              <div key={index} className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <p className="text-navy-700 mb-4 text-sm italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-navy-900">{testimonial.name}</p>
                  <p className="text-sm text-navy-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white section-padding border-t border-slate-200">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {data.faqs.map((faq, index) => (
              <div key={index} className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                <h3 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gold-600" />
                  {faq.q}
                </h3>
                <p className="text-navy-600 text-sm ml-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-gold-600 to-gold-500 py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-4">Stop Researching. Start Complying.</h2>
          <p className="text-lg text-navy-800 mb-8 max-w-2xl mx-auto">
            Get your comprehensive regulatory intelligence report in minutes, not months.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/generate"
              className="px-8 py-4 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-all duration-300 hover:scale-105 shadow-lg shadow-navy-900/25"
            >
              Get Started Now
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-white text-navy-900 font-semibold rounded-xl hover:bg-navy-50 transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}