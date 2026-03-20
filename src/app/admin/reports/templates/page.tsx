// src/app/admin/reports/templates/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Save,
  X,
  Check,
  AlertCircle,
  Layout,
  Type,
  Image,
  Palette,
  Code,
  EyeOff,
  Eye as EyeIcon,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Smartphone,
  Tablet,
  Monitor,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface Template {
  id: string
  name: string
  description: string
  type: 'standard' | 'premium' | 'enterprise'
  thumbnail: string | null
  logo_url: string | null
  sections: TemplateSection[]
  styles: TemplateStyles
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
  usage_count: number
}

interface TemplateSection {
  id: string
  name: string
  type: 'cover' | 'header' | 'executive_summary' | 'location_analysis' | 'regulatory_analysis' | 
        'talent_analysis' | 'licensing_matrix' | 'compliance_roadmap' | 'risk_assessment' |
        'budget_guide' | 'next_steps' | 'footer' | 'disclaimer'
  order: number
  is_required: boolean
  is_visible: boolean
  settings: Record<string, any>
}

interface TemplateStyles {
  font_family: string
  primary_color: string
  secondary_color: string
  accent_color: string
  header_style: 'modern' | 'classic' | 'minimal'
  table_style: 'bordered' | 'striped' | 'minimal'
  spacing: 'compact' | 'normal' | 'relaxed'
  show_logo: boolean
  show_page_numbers: boolean
  show_footer: boolean
  custom_css?: string
}

interface TemplateVersion {
  id: string
  template_id: string
  version: number
  content: any
  created_at: string
  created_by: string
  comment: string
}

// Section type to display name mapping
const sectionTypeToName: Record<string, string> = {
  'cover': 'Cover Page',
  'header': 'Header',
  'executive_summary': 'Executive Summary',
  'location_analysis': 'Location Analysis',
  'regulatory_analysis': 'Regulatory Analysis',
  'talent_analysis': 'Talent Analysis',
  'licensing_matrix': 'Licensing Matrix',
  'compliance_roadmap': 'Compliance Roadmap',
  'risk_assessment': 'Risk Assessment',
  'budget_guide': 'Budget Guide',
  'next_steps': 'Next Steps',
  'footer': 'Footer',
  'disclaimer': 'Disclaimer'
}

// Complete section list matching actual report
const completeSections: TemplateSection[] = [
  { id: 'cover', name: 'Cover Page', type: 'cover', order: 1, is_required: true, is_visible: true, settings: {} },
  { id: 'header', name: 'Header', type: 'header', order: 2, is_required: true, is_visible: true, settings: {} },
  { id: 'executive_summary', name: 'Executive Summary', type: 'executive_summary', order: 3, is_required: true, is_visible: true, settings: {} },
  { id: 'location_analysis', name: 'Location Analysis', type: 'location_analysis', order: 4, is_required: true, is_visible: true, settings: {} },
  { id: 'regulatory_analysis', name: 'Regulatory Analysis', type: 'regulatory_analysis', order: 5, is_required: true, is_visible: true, settings: {} },
  { id: 'talent_analysis', name: 'Talent Analysis', type: 'talent_analysis', order: 6, is_required: true, is_visible: true, settings: {} },
  { id: 'licensing_matrix', name: 'Licensing Matrix', type: 'licensing_matrix', order: 7, is_required: true, is_visible: true, settings: {} },
  { id: 'compliance_roadmap', name: 'Compliance Roadmap', type: 'compliance_roadmap', order: 8, is_required: true, is_visible: true, settings: {} },
  { id: 'risk_assessment', name: 'Risk Assessment', type: 'risk_assessment', order: 9, is_required: true, is_visible: true, settings: {} },
  { id: 'budget_guide', name: 'Budget Guide', type: 'budget_guide', order: 10, is_required: true, is_visible: true, settings: {} },
  { id: 'next_steps', name: 'Next Steps', type: 'next_steps', order: 11, is_required: true, is_visible: true, settings: {} },
  { id: 'footer', name: 'Footer', type: 'footer', order: 12, is_required: false, is_visible: true, settings: {} },
  { id: 'disclaimer', name: 'Disclaimer', type: 'disclaimer', order: 13, is_required: true, is_visible: true, settings: {} }
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [showPreview, setShowPreview] = useState(false)
  const [versions, setVersions] = useState<TemplateVersion[]>([])
  const [showVersions, setShowVersions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState<Partial<Template>>({})

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reports/templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplateVersions = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/templates/${templateId}/versions`)
      const data = await response.json()
      setVersions(data)
    } catch (error) {
      console.error('Failed to fetch versions:', error)
    }
  }

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      setUploadingLogo(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'template-logo')
      
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Logo upload failed:', error)
      alert('Failed to upload logo')
      return null
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCreateTemplate = () => {
    const newTemplate: Partial<Template> = {
      name: 'New Template',
      description: '',
      type: 'standard',
      thumbnail: null,
      logo_url: null,
      sections: [...completeSections],
      styles: {
        font_family: 'Inter',
        primary_color: '#0A1A2F',
        secondary_color: '#D4AF37',
        accent_color: '#E53E3E',
        header_style: 'modern',
        table_style: 'bordered',
        spacing: 'normal',
        show_logo: true,
        show_page_numbers: true,
        show_footer: true
      },
      is_active: true,
      is_default: false
    }
    setSelectedTemplate(newTemplate as Template)
    setIsEditing(true)
    setFormData(newTemplate)
  }

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setFormData(template)
    setIsEditing(true)
    fetchTemplateVersions(template.id)
  }

  const handleSaveTemplate = async () => {
    if (!formData.name) return

    try {
      setSaving(true)
      const method = selectedTemplate?.id ? 'PUT' : 'POST'
      const url = selectedTemplate?.id 
        ? `/api/admin/reports/templates/${selectedTemplate.id}`
        : '/api/admin/reports/templates'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchTemplates()
        setIsEditing(false)
        setSelectedTemplate(null)
      }
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/reports/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId))
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handleDuplicateTemplate = async (template: Template) => {
    const { id, ...templateData } = template
    const duplicate = {
      ...templateData,
      name: `${template.name} (Copy)`,
      is_default: false,
      usage_count: 0
    }

    try {
      const response = await fetch('/api/admin/reports/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicate)
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error)
    }
  }

  const handleSetDefault = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/templates/${templateId}/set-default`, {
        method: 'POST'
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error('Failed to set default template:', error)
    }
  }

  const handleExportTemplate = (template: Template) => {
    const dataStr = JSON.stringify(template, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportTemplate = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const template = JSON.parse(e.target?.result as string)
          const response = await fetch('/api/admin/reports/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(template)
          })

          if (response.ok) {
            await fetchTemplates()
          }
        } catch (error) {
          console.error('Failed to import template:', error)
          alert('Invalid template file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const getTemplateTypeColor = (type: string) => {
    const colors = {
      standard: 'bg-slate-100 text-slate-800',
      premium: 'bg-gold-100 text-gold-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    return colors[type as keyof typeof colors] || colors.standard
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!formData.sections) return

    const newSections = [...formData.sections]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newSections.length) return

    const temp = newSections[index]
    newSections[index] = newSections[newIndex]
    newSections[newIndex] = temp

    // Update order numbers
    newSections.forEach((section, i) => {
      section.order = i + 1
    })

    setFormData({ ...formData, sections: newSections })
  }

  // Update section name when type changes
  const updateSectionType = (sectionId: string, newType: string) => {
    const newSections = formData.sections?.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          type: newType as any,
          name: sectionTypeToName[newType] || section.name
        }
      }
      return section
    })
    setFormData({ ...formData, sections: newSections })
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Report Templates</h1>
          <p className="text-navy-600 mt-1">Create and manage report generation templates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleImportTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleCreateTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <div className="w-16 h-16 border-4 border-navy-200 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-navy-600">No templates yet</p>
          <p className="text-sm text-navy-400 mt-1">Create your first template to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Template Preview/Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-navy-50 to-gold-50 relative group cursor-pointer"
                   onClick={() => handleEditTemplate(template)}>
                {template.thumbnail ? (
                  <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-navy-300" />
                  </div>
                )}
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Click to edit</span>
                </div>

                {/* Type Badge */}
                <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(template.type)}`}>
                  {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                </span>

                {/* Default Badge */}
                {template.is_default && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Default
                  </span>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-navy-900">{template.name}</h3>
                    <p className="text-sm text-navy-500 line-clamp-2">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!template.is_active && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-xs text-navy-500">
                  <span className="flex items-center gap-1">
                    <Layout className="w-3 h-3" />
                    {template.sections.length} sections
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {template.usage_count} uses
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy-50 text-navy-700 rounded-lg text-sm hover:bg-navy-100"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template)
                      setShowPreview(true)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy-50 text-navy-700 rounded-lg text-sm hover:bg-navy-100"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-navy-500"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleExportTemplate(template)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-navy-500"
                    title="Export"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {!template.is_default && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 ml-auto"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-navy-900">
                {selectedTemplate?.id ? 'Edit Template' : 'Create Template'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedTemplate(null)
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-navy-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Editor */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-navy-700 mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-navy-600 mb-1">Template Name</label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-navy-600 mb-1">Description</label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-navy-600 mb-1">Type</label>
                          <select
                            value={formData.type || 'standard'}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400"
                          >
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-navy-600 mb-1">Status</label>
                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="checkbox"
                              checked={formData.is_active || false}
                              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                              className="rounded border-slate-300"
                            />
                            <span className="text-sm text-navy-600">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-navy-700 mb-3">Company Logo</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {formData.logo_url ? (
                          <img 
                            src={formData.logo_url} 
                            alt="Company Logo" 
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              // If image fails to load, show broken image placeholder
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`flex flex-col items-center justify-center ${formData.logo_url ? 'hidden' : ''} fallback`}>
                          <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                          <span className="text-xs text-slate-400">No logo</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-navy-600 mb-2">Upload logo (PNG, JPG, or WebP)</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              // Show preview immediately
                              const previewUrl = URL.createObjectURL(file)
                              const preview = document.createElement('img')
                              preview.src = previewUrl
                              
                              // Upload to server
                              const url = await uploadLogo(file)
                              if (url) {
                                setFormData({ ...formData, logo_url: url })
                              }
                              // Clean up preview URL
                              URL.revokeObjectURL(previewUrl)
                            }
                          }}
                          disabled={uploadingLogo}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100 disabled:opacity-50"
                        />
                        {uploadingLogo && (
                          <p className="text-xs text-navy-500 mt-1 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Uploading...
                          </p>
                        )}
                        {formData.logo_url && (
                          <button
                            onClick={() => setFormData({ ...formData, logo_url: null })}
                            className="text-xs text-red-500 hover:text-red-600 mt-2"
                          >
                            Remove logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-navy-700">Sections</h3>
                      <button
                        onClick={() => {
                          const newSection: TemplateSection = {
                            id: `section-${Date.now()}`,
                            name: 'New Section',
                            type: 'executive_summary',
                            order: (formData.sections?.length || 0) + 1,
                            is_required: false,
                            is_visible: true,
                            settings: {}
                          }
                          setFormData({
                            ...formData,
                            sections: [...(formData.sections || []), newSection]
                          })
                        }}
                        className="text-xs text-gold-600 hover:text-gold-700"
                      >
                        + Add Custom Section
                      </button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {formData.sections?.sort((a, b) => a.order - b.order).map((section, index) => (
                        <div key={section.id} className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-navy-900">{section.name}</span>
                              {section.is_required && (
                                <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Required</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveSection(index, 'up')}
                                disabled={index === 0}
                                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveSection(index, 'down')}
                                disabled={index === (formData.sections?.length || 0) - 1}
                                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                              >
                                ↓
                              </button>
                              {!section.is_required && (
                                <button
                                  onClick={() => {
                                    const newSections = formData.sections?.filter(s => s.id !== section.id)
                                    newSections?.forEach((s, i) => { s.order = i + 1 })
                                    setFormData({ ...formData, sections: newSections })
                                  }}
                                  className="p-1 hover:bg-red-50 rounded text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={section.type}
                              onChange={(e) => updateSectionType(section.id, e.target.value)}
                              disabled={section.is_required && section.type === 'cover'}
                              className="text-xs px-2 py-1 border border-slate-200 rounded disabled:opacity-50"
                            >
                              <option value="cover">Cover Page</option>
                              <option value="header">Header</option>
                              <option value="executive_summary">Executive Summary</option>
                              <option value="location_analysis">Location Analysis</option>
                              <option value="regulatory_analysis">Regulatory Analysis</option>
                              <option value="talent_analysis">Talent Analysis</option>
                              <option value="licensing_matrix">Licensing Matrix</option>
                              <option value="compliance_roadmap">Compliance Roadmap</option>
                              <option value="risk_assessment">Risk Assessment</option>
                              <option value="budget_guide">Budget Guide</option>
                              <option value="next_steps">Next Steps</option>
                              <option value="footer">Footer</option>
                              <option value="disclaimer">Disclaimer</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={section.is_visible}
                                onChange={(e) => {
                                  const newSections = formData.sections?.map(s =>
                                    s.id === section.id ? { ...s, is_visible: e.target.checked } : s
                                  )
                                  setFormData({ ...formData, sections: newSections })
                                }}
                                className="rounded border-slate-300"
                              />
                              Visible
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Styles */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-navy-700 mb-3">Styles</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-navy-600 mb-1">Font Family</label>
                        <select
                          value={formData.styles?.font_family || 'Inter'}
                          onChange={(e) => setFormData({
                            ...formData,
                            styles: { ...formData.styles, font_family: e.target.value } as TemplateStyles
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-navy-600 mb-1">Primary Color</label>
                          <input
                            type="color"
                            value={formData.styles?.primary_color || '#0A1A2F'}
                            onChange={(e) => setFormData({
                              ...formData,
                              styles: { ...formData.styles, primary_color: e.target.value } as TemplateStyles
                            })}
                            className="w-full h-10 p-1 border border-slate-200 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-navy-600 mb-1">Secondary Color</label>
                          <input
                            type="color"
                            value={formData.styles?.secondary_color || '#D4AF37'}
                            onChange={(e) => setFormData({
                              ...formData,
                              styles: { ...formData.styles, secondary_color: e.target.value } as TemplateStyles
                            })}
                            className="w-full h-10 p-1 border border-slate-200 rounded"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-navy-600 mb-1">Header Style</label>
                        <select
                          value={formData.styles?.header_style || 'modern'}
                          onChange={(e) => setFormData({
                            ...formData,
                            styles: { ...formData.styles, header_style: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        >
                          <option value="modern">Modern</option>
                          <option value="classic">Classic</option>
                          <option value="minimal">Minimal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-navy-600 mb-1">Table Style</label>
                        <select
                          value={formData.styles?.table_style || 'bordered'}
                          onChange={(e) => setFormData({
                            ...formData,
                            styles: { ...formData.styles, table_style: e.target.value as any }
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        >
                          <option value="bordered">Bordered</option>
                          <option value="striped">Striped</option>
                          <option value="minimal">Minimal</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.styles?.show_logo || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              styles: { ...formData.styles, show_logo: e.target.checked } as TemplateStyles
                            })}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-navy-600">Show Logo</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.styles?.show_page_numbers || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              styles: { ...formData.styles, show_page_numbers: e.target.checked } as TemplateStyles
                            })}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-navy-600">Show Page Numbers</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.styles?.show_footer || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              styles: { ...formData.styles, show_footer: e.target.checked } as TemplateStyles
                            })}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-navy-600">Show Footer</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm text-navy-600 mb-1">Custom CSS</label>
                        <textarea
                          value={formData.styles?.custom_css || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            styles: { ...formData.styles, custom_css: e.target.value } as TemplateStyles
                          })}
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm"
                          placeholder="/* Add custom CSS here */"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Preview */}
                {showPreview && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-navy-700">Preview</h3>
                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
                        <button
                          onClick={() => setPreviewMode('mobile')}
                          className={cn(
                            "p-1.5 rounded",
                            previewMode === 'mobile' ? 'bg-navy-900 text-white' : 'hover:bg-slate-200'
                          )}
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPreviewMode('tablet')}
                          className={cn(
                            "p-1.5 rounded",
                            previewMode === 'tablet' ? 'bg-navy-900 text-white' : 'hover:bg-slate-200'
                          )}
                        >
                          <Tablet className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPreviewMode('desktop')}
                          className={cn(
                            "p-1.5 rounded",
                            previewMode === 'desktop' ? 'bg-navy-900 text-white' : 'hover:bg-slate-200'
                          )}
                        >
                          <Monitor className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={cn(
                      "bg-white border border-slate-200 rounded-lg overflow-hidden",
                      previewMode === 'mobile' && 'max-w-[375px] mx-auto',
                      previewMode === 'tablet' && 'max-w-[768px] mx-auto'
                    )}>
                      {/* Preview Content - Matches actual PDF header style */}
                      <div className="p-6" style={{
                        fontFamily: formData.styles?.font_family || 'Inter'
                      }}>
                        {/* Header - Matches PDFHeader component style */}
                        <div className="mb-6 pb-4 border-b" style={{
                          borderBottomWidth: 2,
                          borderBottomColor: formData.styles?.secondary_color || '#D4AF37'
                        }}>
                          <div className="flex justify-between items-start">
                            <div>
                              {formData.styles?.show_logo && formData.logo_url && (
                                <img 
                                  src={formData.logo_url} 
                                  alt="Company Logo" 
                                  className="h-12 w-auto mb-2 object-contain"
                                  style={{ maxHeight: '48px' }}
                                />
                              )}
                              <h1 style={{ 
                                fontSize: 24, 
                                fontWeight: 'bold',
                                color: formData.styles?.primary_color || '#0A1A2F',
                                marginBottom: 8
                              }}>
                                Regulatory Compliance Report
                              </h1>
                              <p style={{ fontSize: 11, color: '#64748B' }}>
                                Prepared for: Sample Company • Report ID: SAMPLE-001 • Date: {new Date().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Sample Sections */}
                        {formData.sections?.filter(s => s.is_visible && s.type !== 'header' && s.type !== 'footer').map((section, i) => (
                          <div key={section.id} className="mb-6">
                            <h2 className="text-lg font-semibold mb-3 pb-1" style={{
                              color: formData.styles?.primary_color || '#0A1A2F',
                              borderBottomWidth: 1,
                              borderBottomColor: '#E2E8F0'
                            }}>
                              {section.name}
                            </h2>
                            <div className="space-y-2">
                              <p className="text-sm text-navy-600">
                                Sample content for {section.name.toLowerCase()}. This demonstrates how the section will appear in the final report.
                              </p>
                              {/* Sample table for licensing matrix */}
                              {section.type === 'licensing_matrix' && (
                                <table className="w-full text-sm border-collapse mt-3">
                                  <thead>
                                    <tr className={formData.styles?.table_style === 'striped' ? 'bg-slate-100' : 'border-b'}>
                                      <th className="p-2 text-left font-semibold">License Type</th>
                                      <th className="p-2 text-left font-semibold">Status</th>
                                      <th className="p-2 text-left font-semibold">Timeline</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className={formData.styles?.table_style === 'striped' ? 'bg-white' : 'border-b'}>
                                      <td className="p-2">Money Transmitter License</td>
                                      <td className="p-2">Required</td>
                                      <td className="p-2">4-8 months</td>
                                    </tr>
                                  </tbody>
                                </table>
                              )}
                              {/* Sample for compliance roadmap */}
                              {section.type === 'compliance_roadmap' && (
                                <div className="mt-3 space-y-2">
                                  <div className="border-l-4 pl-3" style={{ borderLeftColor: formData.styles?.secondary_color || '#D4AF37' }}>
                                    <h4 className="font-semibold text-sm">Phase 1: Foundation (Month 1)</h4>
                                    <ul className="list-disc ml-5 text-sm text-navy-600">
                                      <li>Engage legal counsel</li>
                                      <li>Begin license applications</li>
                                      <li>Designate compliance officer</li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Footer */}
                        {formData.styles?.show_footer && (
                          <div className="mt-8 pt-4 border-t text-center text-xs text-navy-400" style={{
                            borderColor: formData.styles?.secondary_color || '#D4AF37'
                          }}>
                            <p>© {new Date().getFullYear()} Veridian Group. All rights reserved.</p>
                            {formData.styles?.show_page_numbers && (
                              <p className="mt-1">Page 1 of 1</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex items-center justify-end gap-3">
              {selectedTemplate?.id && (
                <>
                  <button
                    onClick={() => {
                      setShowVersions(true)
                      fetchTemplateVersions(selectedTemplate.id)
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                  >
                    Version History
                  </button>
                  {!formData.is_default && (
                    <button
                      onClick={() => handleSetDefault(selectedTemplate.id)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                    >
                      Set as Default
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  setIsEditing(false)
                  setSelectedTemplate(null)
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving || !formData.name}
                className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg text-sm hover:bg-gold-700 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && !isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-900">Preview: {selectedTemplate.name}</h2>
              <button
                onClick={() => {
                  setShowPreview(false)
                  setSelectedTemplate(null)
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-navy-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-white border border-slate-200 rounded-lg p-8" style={{
                fontFamily: selectedTemplate.styles.font_family
              }}>
                {/* Header - Matches PDFHeader */}
                <div className="mb-8 pb-4 border-b" style={{
                  borderBottomWidth: 2,
                  borderBottomColor: selectedTemplate.styles.secondary_color
                }}>
                  <div className="flex justify-between items-start">
                    <div>
                      {selectedTemplate.styles.show_logo && selectedTemplate.logo_url && (
                        <img src={selectedTemplate.logo_url} alt="Logo" className="h-12 mb-4" />
                      )}
                      <h1 className="text-3xl font-bold" style={{
                        color: selectedTemplate.styles.primary_color
                      }}>
                        Regulatory Compliance Report
                      </h1>
                      <p className="text-navy-500 mt-2">Prepared for Sample Company</p>
                    </div>
                  </div>
                </div>

                {/* Render all sections */}
                {selectedTemplate.sections
                  .filter(s => s.is_visible && s.type !== 'header' && s.type !== 'footer')
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div key={section.id} className="mb-8">
                      <h2 className="text-xl font-semibold mb-4" style={{
                        color: selectedTemplate.styles.primary_color,
                        borderBottomWidth: 1,
                        borderBottomColor: '#E2E8F0',
                        paddingBottom: 8
                      }}>
                        {section.name}
                      </h2>
                      <div className="prose max-w-none">
                        <p className="text-navy-700">
                          This is a preview of the {section.name.toLowerCase()} section. 
                          The actual content will be dynamically generated based on the 
                          specific company and location data.
                        </p>
                        {section.type === 'licensing_matrix' && (
                          <table className="w-full mt-4 border-collapse">
                            <thead>
                              <tr className={selectedTemplate.styles.table_style === 'striped' ? 'bg-slate-100' : 'border-b'}>
                                <th className="p-3 text-left font-semibold">License Type</th>
                                <th className="p-3 text-left font-semibold">Required</th>
                                <th className="p-3 text-left font-semibold">Timeline</th>
                                <th className="p-3 text-left font-semibold">Fee Range</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className={selectedTemplate.styles.table_style === 'striped' ? 'bg-white' : 'border-b'}>
                                <td className="p-3">Money Transmitter License</td>
                                <td className="p-3">Yes</td>
                                <td className="p-3">4-8 months</td>
                                <td className="p-3">$1,000 - $5,000</td>
                              </tr>
                              <tr className={selectedTemplate.styles.table_style === 'striped' ? 'bg-slate-50' : 'border-b'}>
                                <td className="p-3">BitLicense</td>
                                <td className="p-3">Yes (NY only)</td>
                                <td className="p-3">6-12 months</td>
                                <td className="p-3">$5,000</td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                        {section.type === 'compliance_roadmap' && (
                          <div className="mt-4 space-y-4">
                            <div className="border-l-4 pl-4" style={{
                              borderLeftColor: selectedTemplate.styles.secondary_color
                            }}>
                              <h3 className="font-semibold">Phase 1: Foundation (Month 1)</h3>
                              <ul className="list-disc ml-5 mt-2">
                                <li>Engage legal counsel</li>
                                <li>Begin license applications</li>
                                <li>Designate compliance officer</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Footer */}
                {selectedTemplate.styles.show_footer && (
                  <div className="mt-8 pt-4 border-t text-center text-sm text-navy-400" style={{
                    borderColor: selectedTemplate.styles.secondary_color
                  }}>
                    <p>© {new Date().getFullYear()} Veridian Group. All rights reserved.</p>
                    {selectedTemplate.styles.show_page_numbers && (
                      <p className="mt-1">Page 1 of 1</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersions && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-900">Version History: {selectedTemplate.name}</h2>
              <button
                onClick={() => setShowVersions(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-navy-400" />
              </button>
            </div>
            <div className="p-6">
              {versions.length === 0 ? (
                <p className="text-center text-navy-500 py-8">No version history available</p>
              ) : (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div key={version.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-navy-900">Version {version.version}</span>
                        <span className="text-sm text-navy-500">
                          {new Date(version.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-navy-600 mb-2">{version.comment}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setFormData(version.content)
                            setShowVersions(false)
                          }}
                          className="text-xs text-gold-600 hover:text-gold-700"
                        >
                          Restore this version
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}