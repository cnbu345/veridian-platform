// src/app/dashboard/templates/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Layout,
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Save,
  X,
  Palette,
  ImageIcon,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Copy,
  EyeIcon,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TemplateEditor } from '../components/TemplateEditor'
import { cn } from '@/lib/utils/utils'

interface Template {
  id: string
  name: string
  description: string
  logo_url: string | null
  styles: {
    primary_color: string
    secondary_color: string
    font_family: string
    show_logo: boolean
    show_page_numbers: boolean
    show_footer?: boolean
  }
  sections: {
    id: string
    name: string
    type: string
    is_visible: boolean
  }[]
  is_default: boolean
  created_at: string
}

export default function ClientTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      setUploadingLogo(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileName = `user-${user.id}-${Date.now()}.${file.name.split('.').pop()}`
      const filePath = `user-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Logo upload failed:', error)
      alert('Failed to upload logo')
      return null
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSaveTemplate = async (templateData: Partial<Template>) => {
    try {
      setSaving(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (editingTemplate?.id) {
        // Update existing template
        const { error } = await supabase
          .from('user_templates')
          .update({
            name: templateData.name,
            description: templateData.description,
            logo_url: templateData.logo_url,
            styles: templateData.styles,
            sections: templateData.sections,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new template
        const { error } = await supabase
          .from('user_templates')
          .insert({
            user_id: user.id,
            name: templateData.name || 'My Template',
            description: templateData.description || '',
            logo_url: templateData.logo_url || null,
            styles: templateData.styles || {
              primary_color: '#0A1A2F',
              secondary_color: '#D4AF37',
              font_family: 'Inter',
              show_logo: true,
              show_page_numbers: true,
              show_footer: true
            },
            sections: templateData.sections || [],
            is_default: templates.length === 0
          })

        if (error) throw error
      }

      await fetchTemplates()
      setShowEditor(false)
      setEditingTemplate(null)
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (templateId: string) => {
    try {
      await supabase
        .from('user_templates')
        .update({ is_default: false })
        .eq('is_default', true)

      await supabase
        .from('user_templates')
        .update({ is_default: true })
        .eq('id', templateId)

      await fetchTemplates()
    } catch (error) {
      console.error('Failed to set default:', error)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('user_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error
      await fetchTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert('Failed to delete template')
    }
  }

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const duplicate = {
        user_id: user.id,
        name: `${template.name} (Copy)`,
        description: template.description,
        logo_url: template.logo_url,
        styles: template.styles,
        sections: template.sections,
        is_default: false
      }

      const { error } = await supabase
        .from('user_templates')
        .insert(duplicate)

      if (error) throw error
      await fetchTemplates()
    } catch (error) {
      console.error('Failed to duplicate template:', error)
      alert('Failed to duplicate template')
    }
  }

  // Preview handler - make sure this is defined
  const handlePreview = (template: Template) => {
    console.log('Previewing template:', template.name)
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy-200 border-t-gold-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold-400 via-gold-600 to-gold-400 rounded-full" />
        <div className="pl-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-navy-900 to-navy-700 bg-clip-text text-transparent">
                Report Templates
              </h1>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gold-50 rounded-full">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span className="text-xs font-semibold text-gold-700">
                  {templates.length} {templates.length === 1 ? 'Template' : 'Templates'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingTemplate(null)
                setShowEditor(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg text-sm hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/25"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>
          <p className="text-navy-600 text-lg max-w-2xl">
            Customize your report branding and layout. Your template will be applied to all new reports.
            {templates.length === 0 && " Create your first template to get started."}
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-navy-100 p-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layout className="w-10 h-10 text-gold-600" />
          </div>
          <h3 className="text-xl font-semibold text-navy-900 mb-2">No Templates Yet</h3>
          <p className="text-navy-500 mb-6 max-w-md mx-auto">
            Create a custom template to brand your reports with your logo and colors.
          </p>
          <button
            onClick={() => setShowEditor(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white rounded-lg hover:from-gold-500 hover:to-gold-400 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-navy-100 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Template Preview Header */}
              <div className="h-24 bg-gradient-to-r from-navy-50 to-gold-50 relative border-b border-navy-100">
                {template.logo_url && (
                  <img 
                    src={template.logo_url} 
                    alt="Template logo" 
                    className="absolute top-3 left-3 h-12 w-auto object-contain"
                  />
                )}
                {template.is_default && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Default
                  </span>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-navy-900">{template.name}</h3>
                <p className="text-sm text-navy-500 mt-1 line-clamp-2">{template.description || 'No description'}</p>
                
                <div className="flex items-center gap-3 mt-3 text-xs text-navy-500">
                  <span className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: template.styles?.primary_color || '#0A1A2F' }}
                    />
                    Primary
                  </span>
                  <span className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: template.styles?.secondary_color || '#D4AF37' }}
                    />
                    Accent
                  </span>
                  <span className="flex items-center gap-1">
                    <Layout className="w-3 h-3" />
                    {template.sections?.filter(s => s.is_visible).length || 0} sections
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-navy-100">
                  <button
                    onClick={() => {
                      setEditingTemplate(template)
                      setShowEditor(true)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy-50 text-navy-700 rounded-lg text-sm hover:bg-navy-100"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handlePreview(template)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-navy-50 text-navy-700 rounded-lg text-sm hover:bg-navy-100"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="p-1.5 hover:bg-navy-50 rounded-lg text-navy-500"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {!template.is_default && (
                    <>
                      <button
                        onClick={() => handleSetDefault(template.id)}
                        className="ml-auto text-xs text-gold-600 hover:text-gold-700"
                      >
                        Set as Default
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-navy-900">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h2>
                <button
                  onClick={() => {
                    setShowEditor(false)
                    setEditingTemplate(null)
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-navy-400" />
                </button>
              </div>

              <TemplateEditor
                template={editingTemplate}
                onSave={handleSaveTemplate}
                onCancel={() => {
                  setShowEditor(false)
                  setEditingTemplate(null)
                }}
                saving={saving}
                uploadingLogo={uploadingLogo}
                onUploadLogo={uploadLogo}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-navy-900">Preview: {previewTemplate.name}</h2>
                <p className="text-sm text-navy-500 mt-1">See how your reports will look</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 mr-2">
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={cn(
                      "p-1.5 rounded",
                      previewMode === 'mobile' ? 'bg-navy-900 text-white' : 'hover:bg-slate-100'
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={cn(
                      "p-1.5 rounded",
                      previewMode === 'tablet' ? 'bg-navy-900 text-white' : 'hover:bg-slate-100'
                    )}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={cn(
                      "p-1.5 rounded",
                      previewMode === 'desktop' ? 'bg-navy-900 text-white' : 'hover:bg-slate-100'
                    )}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowPreview(false)
                    setPreviewTemplate(null)
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-navy-400" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-50">
              <div className={cn(
                "bg-white rounded-lg shadow-lg overflow-hidden transition-all mx-auto",
                previewMode === 'mobile' && 'max-w-[375px]',
                previewMode === 'tablet' && 'max-w-[768px]',
                previewMode === 'desktop' && 'max-w-full'
              )}>
                <div className="p-8" style={{
                  fontFamily: previewTemplate.styles?.font_family || 'Inter'
                }}>
                  {/* Header */}
                  <div className="mb-8 pb-4 border-b" style={{
                    borderBottomWidth: 2,
                    borderBottomColor: previewTemplate.styles?.secondary_color || '#D4AF37'
                  }}>
                    <div>
                      {previewTemplate.styles?.show_logo && previewTemplate.logo_url && (
                        <img 
                          src={previewTemplate.logo_url} 
                          alt="Company Logo" 
                          className="h-12 mb-4 object-contain"
                        />
                      )}
                      <h1 className="text-3xl font-bold" style={{
                        color: previewTemplate.styles?.primary_color || '#0A1A2F'
                      }}>
                        Regulatory Compliance Report
                      </h1>
                      <p className="text-navy-500 mt-2" style={{ fontSize: 11 }}>
                        Prepared for: Sample Company • Date: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Visible Sections */}
                  {previewTemplate.sections?.filter(s => s.is_visible && s.type !== 'header').map((section) => (
                    <div key={section.id} className="mb-8">
                      <h2 className="text-xl font-semibold mb-3 pb-1" style={{
                        color: previewTemplate.styles?.primary_color || '#0A1A2F',
                        borderBottomWidth: 1,
                        borderBottomColor: '#E2E8F0'
                      }}>
                        {section.name}
                      </h2>
                      <div className="prose max-w-none">
                        <p className="text-navy-700" style={{ fontSize: 11, lineHeight: 1.5 }}>
                          Sample content for {section.name.toLowerCase()}. This demonstrates how this section will appear in your actual report.
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Footer */}
                  <div className="mt-8 pt-4 border-t text-center text-xs text-navy-400" style={{
                    borderColor: previewTemplate.styles?.secondary_color || '#D4AF37'
                  }}>
                    <p>© {new Date().getFullYear()} Veridian Group. All rights reserved.</p>
                    {previewTemplate.styles?.show_page_numbers && (
                      <p className="mt-1">Page 1 of 1</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPreview(false)
                  setPreviewTemplate(null)
                }}
                className="px-4 py-2 bg-navy-900 text-white rounded-lg text-sm hover:bg-navy-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}