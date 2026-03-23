// src/app/dashboard/components/TemplateEditor.tsx
'use client'

import { useState } from 'react'

interface TemplateEditorProps {
  template: any
  onSave: (data: any) => void
  onCancel: () => void
  saving: boolean
  uploadingLogo: boolean
  onUploadLogo: (file: File) => Promise<string | null>
}

// Complete list of all report sections with control levels
const ALL_SECTIONS = [
  { 
    id: 'cover', 
    name: 'Cover Page', 
    type: 'cover', 
    required: false, 
    locked: false,
    description: 'Title page featuring your company name and report details',
    recommended: true
  },
  { 
    id: 'header', 
    name: 'Header', 
    type: 'header', 
    required: true, 
    locked: true,
    description: 'Report header with logo and date (required for page formatting)',
    recommended: true
  },
  { 
    id: 'executive_summary', 
    name: 'Executive Summary', 
    type: 'executive_summary', 
    required: false, 
    locked: false,
    description: 'High-level overview of key findings and strategic recommendations',
    recommended: true
  },
  { 
    id: 'client_input', 
    name: 'Client Input Summary', 
    type: 'client_input', 
    required: false, 
    locked: false,
    description: 'Summary of your specific compliance requests and priorities',
    recommended: true
  },
  { 
    id: 'market_analysis', 
    name: 'Market & Talent Analysis', 
    type: 'market_analysis', 
    required: false, 
    locked: false,
    description: 'Market conditions and compliance talent availability assessment',
    recommended: true
  },
  { 
    id: 'regulatory_analysis', 
    name: 'Regulatory Analysis', 
    type: 'regulatory_analysis', 
    required: false, 
    locked: false,
    description: 'Comprehensive analysis of primary state regulatory framework',
    recommended: true
  },
  { 
    id: 'multi_state_licensing', 
    name: 'Multi-State Licensing Matrix', 
    type: 'multi_state_licensing', 
    required: false, 
    locked: false,
    description: 'Detailed licensing requirements across jurisdictions',
    recommended: true
  },
  { 
    id: 'compliance_roadmap', 
    name: 'Compliance Roadmap', 
    type: 'compliance_roadmap', 
    required: false, 
    locked: false,
    description: 'Strategic implementation timeline and key milestones',
    recommended: true
  },
  { 
    id: 'technology_tools', 
    name: 'Technology & Tools', 
    type: 'technology_tools', 
    required: false, 
    locked: false,
    description: 'Curated compliance technology solutions and platforms',
    recommended: true
  },
  { 
    id: 'regulatory_resources', 
    name: 'Regulatory Resources', 
    type: 'regulatory_resources', 
    required: false, 
    locked: false,
    description: 'Essential regulators, legal counsel, and compliance consultants',
    recommended: true
  },
  { 
    id: 'risk_assessment', 
    name: 'Risk Assessment', 
    type: 'risk_assessment', 
    required: false, 
    locked: false,
    description: 'Comprehensive risk analysis with mitigation strategies',
    recommended: true
  },
  { 
    id: 'budget_guide', 
    name: 'Budget & Investment Guide', 
    type: 'budget_guide', 
    required: false, 
    locked: false,
    description: 'Detailed cost breakdown and investment recommendations',
    recommended: true
  },
  { 
    id: 'next_steps', 
    name: 'Next Steps', 
    type: 'next_steps', 
    required: false, 
    locked: false,
    description: 'Immediate and long-term action items for implementation',
    recommended: true
  },
  { 
    id: 'footer', 
    name: 'Footer', 
    type: 'footer', 
    required: false, 
    locked: false,
    description: 'Page footer with copyright and page numbers',
    recommended: false
  },
  { 
    id: 'disclaimer', 
    name: 'Legal Disclaimer', 
    type: 'disclaimer', 
    required: true, 
    locked: true,
    description: 'Legal disclaimer (required for liability protection)',
    recommended: true
  }
]

export function TemplateEditor({ template, onSave, onCancel, saving, uploadingLogo, onUploadLogo }: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    logo_url: template?.logo_url || null,
    styles: template?.styles || {
      primary_color: '#0A1A2F',
      secondary_color: '#D4AF37',
      font_family: 'Inter',
      show_logo: true,
      show_page_numbers: true
    },
    sections: template?.sections || ALL_SECTIONS.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      is_visible: s.required ? true : s.recommended
    }))
  })

  const [showAllSections, setShowAllSections] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = await onUploadLogo(file)
      if (url) {
        setFormData({ ...formData, logo_url: url })
      }
    }
  }

  const toggleSection = (sectionId: string) => {
    const section = ALL_SECTIONS.find(s => s.id === sectionId)
    if (section?.locked) return
    
    setFormData({
      ...formData,
      sections: formData.sections.map(s =>
        s.id === sectionId ? { ...s, is_visible: !s.is_visible } : s
      )
    })
  }

  const visibleCount = formData.sections.filter(s => s.is_visible).length
  const hiddenCount = ALL_SECTIONS.length - visibleCount

  // Rich preview renderer based on section type
  const renderRichPreview = (section: typeof ALL_SECTIONS[0], isVisible: boolean) => {
    if (!isVisible) return null
    
    switch (section.id) {
      case 'executive_summary':
        return (
          <div className="mt-3 p-4 bg-gradient-to-br from-navy-50 to-slate-50 rounded-xl border border-navy-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 text-xs font-bold">✓</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-navy-900">Strategic Overview</p>
                <p className="text-xs text-navy-600 mt-1 leading-relaxed">
                  Comprehensive regulatory analysis for your organization, identifying key compliance requirements and strategic opportunities across your operating jurisdictions.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-navy-100 text-navy-700 px-2 py-1 rounded">Risk Profile: Moderate</span>
                  <span className="text-xs bg-navy-100 text-navy-700 px-2 py-1 rounded">Timeline: 6 Months</span>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'client_input':
        return (
          <div className="mt-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="mb-3">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Primary Focus</p>
              <p className="text-sm font-medium text-amber-900">Regulatory Compliance</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Timeline</p>
                <p className="text-sm font-medium text-amber-900">6 Months (Standard)</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Secondary Focus</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Licensing</span>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Risk Assessment</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs font-semibold text-amber-700">Your Concerns</p>
                <p className="text-xs text-amber-800 italic mt-1">"Regulatory compliance across multiple states..."</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs font-semibold text-amber-700">Your Goals</p>
                <p className="text-xs text-amber-800 italic mt-1">"Achieve full compliance within 6 months..."</p>
              </div>
            </div>
          </div>
        )
      
      case 'market_analysis':
        return (
          <div className="mt-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 border-r border-slate-200">
                <p className="text-2xl font-bold text-gold-600">15%</p>
                <p className="text-xs text-navy-500">Market Growth</p>
              </div>
              <div className="text-center p-2 border-r border-slate-200">
                <p className="text-2xl font-bold text-gold-600">High</p>
                <p className="text-xs text-navy-500">Talent Density</p>
              </div>
              <div className="text-center p-2">
                <p className="text-2xl font-bold text-gold-600">85/100</p>
                <p className="text-xs text-navy-500">Opportunity Score</p>
              </div>
            </div>
            <p className="text-xs text-navy-600 leading-relaxed">
              Your location offers strong market opportunities with a growing compliance talent pool. 
              Competitive landscape analysis indicates favorable conditions for market entry.
            </p>
          </div>
        )
      
      case 'multi_state_licensing':
        return (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
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
              </tbody>
            </table>
          </div>
        )
      
      case 'compliance_roadmap':
        return (
          <div className="mt-3 space-y-3">
            <div className="p-3 border-l-4 rounded-r-xl bg-slate-50" style={{ borderLeftColor: formData.styles.secondary_color }}>
              <p className="text-sm font-semibold text-navy-800">Phase 1: Foundation</p>
              <p className="text-xs text-navy-500 mt-1">Days 1-30</p>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-navy-600">Engage qualified compliance counsel</li>
                <li className="text-xs text-navy-600">Submit initial license applications</li>
                <li className="text-xs text-navy-600">Designate Chief Compliance Officer</li>
              </ul>
            </div>
            <div className="p-3 border-l-4 rounded-r-xl bg-slate-50" style={{ borderLeftColor: formData.styles.secondary_color }}>
              <p className="text-sm font-semibold text-navy-800">Phase 2: Licensing & Development</p>
              <p className="text-xs text-navy-500 mt-1">Days 31-60</p>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-navy-600">Complete remaining license applications</li>
                <li className="text-xs text-navy-600">Finalize compliance policies</li>
                <li className="text-xs text-navy-600">Select compliance technology</li>
              </ul>
            </div>
          </div>
        )
      
      case 'technology_tools':
        return (
          <div className="mt-3 space-y-3">
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
          </div>
        )
      
      case 'risk_assessment':
        return (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
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
              </tbody>
            </table>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-lg font-semibold text-navy-900">Template Configuration</h3>
        <p className="text-sm text-navy-500 mt-1">Customize your report appearance and content</p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1.5">Template Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Custom Template"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 transition-all bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1.5">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            placeholder="Describe your template..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 transition-all bg-white"
          />
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-navy-800 mb-1.5">Company Logo</label>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center">
                <div className="text-2xl mb-1">🖼️</div>
                <span className="text-xs text-navy-400">No logo</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100 transition-colors"
            />
            {uploadingLogo && (
              <p className="text-xs text-navy-500 mt-2">Uploading...</p>
            )}
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div>
        <label className="block text-sm font-medium text-navy-800 mb-3">Brand Colors</label>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-navy-500 mb-1.5">Primary Color</label>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl border border-slate-200 shadow-sm"
                style={{ backgroundColor: formData.styles.primary_color }}
              />
              <input
                type="color"
                value={formData.styles.primary_color}
                onChange={(e) => setFormData({
                  ...formData,
                  styles: { ...formData.styles, primary_color: e.target.value }
                })}
                className="w-20 h-10 p-1 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-navy-500 mb-1.5">Accent Color</label>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl border border-slate-200 shadow-sm"
                style={{ backgroundColor: formData.styles.secondary_color }}
              />
              <input
                type="color"
                value={formData.styles.secondary_color}
                onChange={(e) => setFormData({
                  ...formData,
                  styles: { ...formData.styles, secondary_color: e.target.value }
                })}
                className="w-20 h-10 p-1 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-navy-800 mb-1.5">Font Family</label>
        <select
          value={formData.styles.font_family}
          onChange={(e) => setFormData({
            ...formData,
            styles: { ...formData.styles, font_family: e.target.value }
          })}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 bg-white"
        >
          <option value="Inter">Inter (Modern Sans-Serif)</option>
          <option value="Helvetica">Helvetica (Professional Sans-Serif)</option>
          <option value="Times New Roman">Times New Roman (Traditional Serif)</option>
          <option value="Georgia">Georgia (Elegant Serif)</option>
          <option value="Arial">Arial (Clean Sans-Serif)</option>
        </select>
      </div>

      {/* Section Visibility */}
      <div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <label className="block text-sm font-medium text-navy-800">Report Sections</label>
            <p className="text-xs text-navy-500 mt-0.5">Select which sections appear in your reports</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-gold-600">{visibleCount}</span>
            <span className="text-xs text-navy-400"> of {ALL_SECTIONS.length} visible</span>
            {hiddenCount > 0 && (
              <p className="text-xs text-amber-600 mt-0.5">{hiddenCount} section{hiddenCount !== 1 ? 's' : ''} hidden</p>
            )}
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/30">
          {ALL_SECTIONS.map((section) => {
            const sectionData = formData.sections.find(s => s.id === section.id)
            const isVisible = sectionData?.is_visible ?? section.recommended
            const isLocked = section.locked
            
            return (
              <div 
                key={section.id} 
                className={`flex items-start justify-between p-3 rounded-xl transition-all ${
                  !isVisible && !isLocked ? 'bg-white/50 opacity-60' : 'bg-white hover:shadow-sm'
                } border border-slate-100`}
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium text-navy-800">{section.name}</span>
                    {isLocked && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Required</span>
                    )}
                    {!isLocked && !section.recommended && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Optional</span>
                    )}
                    {!isLocked && section.recommended && (
                      <span className="text-xs bg-gold-50 text-gold-600 px-2 py-0.5 rounded-full">Recommended</span>
                    )}
                  </div>
                  <p className="text-xs text-navy-400 leading-relaxed">{section.description}</p>
                  
                  {/* Rich Preview for visible sections */}
                  {isVisible && renderRichPreview(section, isVisible)}
                </div>
                <div className="ml-4">
                  {isLocked ? (
                    <div className="w-9 h-5 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-xs text-slate-500">🔒</span>
                    </div>
                  ) : (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleSection(section.id)}
                        className="sr-only peer"
                      />
                      <div className={`w-10 h-5 rounded-full peer transition-all ${
                        isVisible ? 'bg-gold-500' : 'bg-slate-300'
                      }`}>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                          isVisible ? 'translate-x-5' : ''
                        }`} />
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              setFormData({
                ...formData,
                sections: formData.sections.map(s => ({
                  ...s,
                  is_visible: !ALL_SECTIONS.find(section => section.id === s.id)?.locked
                }))
              })
            }}
            className="text-xs text-navy-600 hover:text-navy-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white"
          >
            Show All
          </button>
          <button
            onClick={() => {
              setFormData({
                ...formData,
                sections: formData.sections.map(s => ({
                  ...s,
                  is_visible: ALL_SECTIONS.find(section => section.id === s.id)?.locked || false
                }))
              })
            }}
            className="text-xs text-navy-600 hover:text-navy-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white"
          >
            Hide Optional
          </button>
          <button
            onClick={() => {
              setFormData({
                ...formData,
                sections: formData.sections.map(s => ({
                  ...s,
                  is_visible: ALL_SECTIONS.find(section => section.id === s.id)?.locked || 
                             ALL_SECTIONS.find(section => section.id === s.id)?.recommended || false
                }))
              })
            }}
            className="text-xs text-navy-600 hover:text-navy-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white"
          >
            Reset to Recommended
          </button>
        </div>
      </div>

      {/* Style Options */}
      <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm font-medium text-navy-800">Layout Options</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.styles.show_logo}
              onChange={(e) => setFormData({
                ...formData,
                styles: { ...formData.styles, show_logo: e.target.checked }
              })}
              className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500"
            />
            <span className="text-sm text-navy-700">Display logo on all pages</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.styles.show_page_numbers}
              onChange={(e) => setFormData({
                ...formData,
                styles: { ...formData.styles, show_page_numbers: e.target.checked }
              })}
              className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500"
            />
            <span className="text-sm text-navy-700">Show page numbers</span>
          </label>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-gold-500 rounded-full"></div>
          <h3 className="text-sm font-semibold text-navy-800">Live Preview</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-center">
            {formData.styles.show_logo && formData.logo_url && (
              <img src={formData.logo_url} alt="Logo" className="h-12 mx-auto mb-4" />
            )}
            <h2 style={{ color: formData.styles.primary_color }} className="text-xl font-bold tracking-tight">
              Regulatory Compliance Report
            </h2>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <div className="mt-3 text-xs text-navy-500">
              {visibleCount} section{visibleCount !== 1 ? 's' : ''} will appear in your report
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
              {formData.sections.filter(s => s.is_visible).slice(0, 8).map(s => {
                const sectionInfo = ALL_SECTIONS.find(section => section.id === s.id)
                return (
                  <span key={s.id} className="text-xs bg-navy-50 text-navy-600 px-2.5 py-1 rounded-full">
                    {sectionInfo?.name || s.name}
                  </span>
                )
              })}
              {visibleCount > 8 && (
                <span className="text-xs text-navy-400 px-2.5 py-1">
                  +{visibleCount - 8} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-navy-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={saving || !formData.name}
          className="px-5 py-2.5 bg-gold-600 text-white rounded-xl text-sm font-medium hover:bg-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </div>
  )
}