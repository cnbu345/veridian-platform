// src/app/dashboard/components/TemplateEditor.tsx
'use client'

import { useState } from 'react'
import { Palette, ImageIcon, Eye, Save, X, RefreshCw, Lock, Unlock } from 'lucide-react'

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
    description: 'Title page with company name and report details',
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
    description: 'Overview of key findings and recommendations',
    recommended: true
  },
  { 
    id: 'client_input', 
    name: 'Client Input Summary', 
    type: 'client_input', 
    required: false, 
    locked: false,
    description: 'Summary of your specific compliance requests',
    recommended: true
  },
  { 
    id: 'market_analysis', 
    name: 'Market & Talent Analysis', 
    type: 'market_analysis', 
    required: false, 
    locked: false,
    description: 'Market overview and compliance talent availability',
    recommended: true
  },
  { 
    id: 'regulatory_analysis', 
    name: 'Regulatory Analysis', 
    type: 'regulatory_analysis', 
    required: false, 
    locked: false,
    description: 'Primary state regulatory framework',
    recommended: true
  },
  { 
    id: 'multi_state_licensing', 
    name: 'Multi-State Licensing Matrix', 
    type: 'multi_state_licensing', 
    required: false, 
    locked: false,
    description: 'Licensing requirements across states',
    recommended: true
  },
  { 
    id: 'compliance_roadmap', 
    name: 'Compliance Roadmap', 
    type: 'compliance_roadmap', 
    required: false, 
    locked: false,
    description: 'Implementation timeline and milestones',
    recommended: true
  },
  { 
    id: 'technology_tools', 
    name: 'Technology & Tools', 
    type: 'technology_tools', 
    required: false, 
    locked: false,
    description: 'Recommended compliance technology solutions',
    recommended: true
  },
  { 
    id: 'regulatory_resources', 
    name: 'Regulatory Resources', 
    type: 'regulatory_resources', 
    required: false, 
    locked: false,
    description: 'Regulators, legal counsel, and consultants',
    recommended: true
  },
  { 
    id: 'risk_assessment', 
    name: 'Risk Assessment', 
    type: 'risk_assessment', 
    required: false, 
    locked: false,
    description: 'Risk categories, likelihood, and mitigation',
    recommended: true
  },
  { 
    id: 'budget_guide', 
    name: 'Budget & Investment Guide', 
    type: 'budget_guide', 
    required: false, 
    locked: false,
    description: 'Estimated costs and budget breakdown',
    recommended: true
  },
  { 
    id: 'next_steps', 
    name: 'Next Steps', 
    type: 'next_steps', 
    required: false, 
    locked: false,
    description: 'Immediate and ongoing action items',
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
      is_visible: s.required ? true : s.recommended // Required sections visible, recommended sections visible by default
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
    if (section?.locked) return // Locked sections cannot be hidden
    
    setFormData({
      ...formData,
      sections: formData.sections.map(s =>
        s.id === sectionId ? { ...s, is_visible: !s.is_visible } : s
      )
    })
  }

  const visibleCount = formData.sections.filter(s => s.is_visible).length
  const hiddenCount = ALL_SECTIONS.length - visibleCount

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Template Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="My Custom Template"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          placeholder="Describe your template..."
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">Company Logo</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
            />
            {uploadingLogo && (
              <p className="text-xs text-navy-500 mt-1 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Uploading...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">Brand Colors</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-navy-500 mb-1">Primary Color</label>
            <input
              type="color"
              value={formData.styles.primary_color}
              onChange={(e) => setFormData({
                ...formData,
                styles: { ...formData.styles, primary_color: e.target.value }
              })}
              className="w-full h-10 p-1 border border-slate-200 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-navy-500 mb-1">Accent Color</label>
            <input
              type="color"
              value={formData.styles.secondary_color}
              onChange={(e) => setFormData({
                ...formData,
                styles: { ...formData.styles, secondary_color: e.target.value }
              })}
              className="w-full h-10 p-1 border border-slate-200 rounded"
            />
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Font Family</label>
        <select
          value={formData.styles.font_family}
          onChange={(e) => setFormData({
            ...formData,
            styles: { ...formData.styles, font_family: e.target.value }
          })}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg"
        >
          <option value="Inter">Inter</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Arial">Arial</option>
        </select>
      </div>

      {/* Section Visibility - Full Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="block text-sm font-medium text-navy-700">Report Sections</label>
            <p className="text-xs text-navy-400 mt-0.5">
              Choose which sections appear in your reports
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gold-600">{visibleCount}</span>
            <span className="text-xs text-navy-400"> of {ALL_SECTIONS.length} sections visible</span>
            {hiddenCount > 0 && (
              <p className="text-xs text-amber-600 mt-0.5">
                {hiddenCount} section{hiddenCount !== 1 ? 's' : ''} hidden
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-3">
          {ALL_SECTIONS.map((section) => {
            const sectionData = formData.sections.find(s => s.id === section.id)
            const isVisible = sectionData?.is_visible ?? section.recommended
            const isLocked = section.locked
            
            return (
              <div key={section.id} className={`flex items-start justify-between p-2 rounded-lg ${
                !isVisible && !isLocked ? 'bg-slate-50 opacity-70' : 'hover:bg-slate-50'
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-navy-700">{section.name}</span>
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                        <Lock className="w-3 h-3" />
                        Required
                      </span>
                    )}
                    {!isLocked && !section.recommended && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        Optional
                      </span>
                    )}
                    {!isLocked && section.recommended && (
                      <span className="text-xs bg-gold-50 text-gold-600 px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-navy-400 mt-0.5">{section.description}</p>
                </div>
                <div className="ml-4">
                  {isLocked ? (
                    <div className="w-9 h-5 bg-slate-200 rounded-full flex items-center justify-center">
                      <Lock className="w-3 h-3 text-slate-500" />
                    </div>
                  ) : (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleSection(section.id)}
                        className="sr-only peer"
                      />
                      <div className={`w-9 h-5 rounded-full peer transition-colors ${
                        isVisible ? 'bg-gold-500' : 'bg-slate-300'
                      }`}>
                        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                          isVisible ? 'translate-x-4' : ''
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
            className="text-xs text-navy-500 hover:text-navy-700 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
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
            className="text-xs text-navy-500 hover:text-navy-700 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
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
            className="text-xs text-navy-500 hover:text-navy-700 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
          >
            Reset to Recommended
          </button>
        </div>
      </div>

      {/* Additional Style Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.styles.show_logo}
            onChange={(e) => setFormData({
              ...formData,
              styles: { ...formData.styles, show_logo: e.target.checked }
            })}
            className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500"
          />
          <span className="text-sm text-navy-700">Show logo on all pages</span>
        </label>
        
        <label className="flex items-center gap-3">
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

      {/* Preview */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-navy-500" />
          <h3 className="text-sm font-medium text-navy-700">Preview</h3>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-center">
            {formData.styles.show_logo && formData.logo_url && (
              <img src={formData.logo_url} alt="Logo" className="h-12 mx-auto mb-3" />
            )}
            <h2 style={{ color: formData.styles.primary_color }} className="text-xl font-bold">
              Regulatory Compliance Report
            </h2>
            <div className="mt-2 text-xs text-navy-500">
              {visibleCount} sections will appear in your report
            </div>
            <div className="mt-3 flex flex-wrap gap-1 justify-center">
              {formData.sections.filter(s => s.is_visible).slice(0, 8).map(s => {
                const sectionInfo = ALL_SECTIONS.find(section => section.id === s.id)
                return (
                  <span key={s.id} className="text-xs bg-slate-100 text-navy-600 px-2 py-0.5 rounded">
                    {sectionInfo?.name || s.name}
                  </span>
                )
              })}
              {visibleCount > 8 && (
                <span className="text-xs text-navy-400">
                  +{visibleCount - 8} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={saving || !formData.name}
          className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </div>
  )
}