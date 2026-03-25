// src/app/generate/components/TemplateSelector.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Layout, 
  Check, 
  ChevronDown, 
  Palette, 
  Loader2, 
  Crown, 
  Sparkles,
  Eye,
  Star,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/utils'
import { 
  getAvailableTemplates, 
  getDefaultTemplate, 
  Template, 
  isUserTemplate,
  getTemplateClient
} from '@/lib/templates'

interface TemplateSelectorProps {
  userId: string
  selectedTemplateId: string | null
  onTemplateSelect: (templateId: string | null) => void
  disabled?: boolean
}

// Enterprise tiers that have access to custom templates
const ENTERPRISE_TIERS = ['enterprise', 'enterprise_suite', 'custom_enterprise', 'enterprise_plus']
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_TEMPLATES === 'true'

export default function TemplateSelector({
  userId,
  selectedTemplateId,
  onTemplateSelect,
  disabled = false
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [hasAccess, setHasAccess] = useState(DEV_MODE)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // Fetch available templates (both admin and user templates)
  const fetchTemplates = async () => {
    try {
      setError(null)
      const availableTemplates = await getAvailableTemplates(userId)
      setTemplates(availableTemplates)
      
      // Auto-select default template if available
      if (availableTemplates.length > 0 && hasAccess && !selectedTemplateId) {
        const defaultTemplate = await getDefaultTemplate(userId)
        if (defaultTemplate) {
          onTemplateSelect(defaultTemplate.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      setError('Unable to load templates. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  // Check user subscription tier
  const checkTemplateAccess = async () => {
    if (DEV_MODE) {
      setHasAccess(true)
      setCheckingAccess(false)
      return
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setHasAccess(false)
        setCheckingAccess(false)
        return
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()
      
      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setHasAccess(false)
      } else {
        const tier = profile?.subscription_tier || 'free'
        const hasEnterpriseAccess = ENTERPRISE_TIERS.includes(tier)
        setHasAccess(hasEnterpriseAccess)
        
        if (!hasEnterpriseAccess && selectedTemplateId) {
          onTemplateSelect(null)
        }
      }
    } catch (error) {
      console.error('Failed to check template access:', error)
      setHasAccess(false)
    } finally {
      setCheckingAccess(false)
    }
  }

  useEffect(() => {
    checkTemplateAccess()
  }, [userId])

  useEffect(() => {
    if (hasAccess) {
      fetchTemplates()
    } else {
      setLoading(false)
    }
  }, [hasAccess, userId])

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  const handleSelectTemplate = (templateId: string | null) => {
    if (!hasAccess) {
      setShowUpgradePrompt(true)
      return
    }
    onTemplateSelect(templateId)
    setIsOpen(false)
  }

  // Helper to get template badge
  const getTemplateBadge = (template: Template): { text: string; icon: React.ReactNode; className: string } => {
    if (isUserTemplate(template)) {
      return {
        text: 'Custom',
        icon: <Crown className="w-3 h-3" />,
        className: 'bg-gold-50 text-gold-700 border-gold-200'
      }
    }
    return {
      text: 'Premium',
      icon: <Star className="w-3 h-3" />,
      className: 'bg-purple-50 text-purple-700 border-purple-200'
    }
  }

  // Helper to get template styles safely
  const getTemplateStyles = (template: Template) => {
    const styles = template.styles as any
    return {
      primary: styles?.primary_color || '#0A1A2F',
      secondary: styles?.secondary_color || '#D4AF37',
      font: styles?.font_family || 'Inter'
    }
  }

  // Loading state
  if (checkingAccess) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-gold-600 animate-spin" />
          <span className="text-sm text-navy-600">Checking template access...</span>
        </div>
      </div>
    )
  }

  // No access state
  if (!hasAccess) {
    return (
      <>
        <div className="bg-gradient-to-r from-navy-50 to-gold-50/30 rounded-xl border border-gold-200 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-gold-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-navy-900 mb-1 flex items-center gap-2">
                Unlock Custom Branding
                <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">
                  Enterprise Feature
                </span>
              </h4>
              <p className="text-sm text-navy-600 mb-3">
                Create custom-branded reports with your logo, colors, and preferred sections. 
                Available exclusively with Enterprise plans.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowUpgradePrompt(true)}
                  className="px-4 py-2 bg-gold-600 text-white text-sm font-medium rounded-lg hover:bg-gold-700 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Enterprise
                </button>
                <button
                  onClick={() => window.open('/pricing', '_blank')}
                  className="px-4 py-2 border border-slate-300 text-navy-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-all"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradePrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 text-white">
                <div className="w-14 h-14 bg-gold-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Crown className="w-7 h-7 text-gold-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Enterprise Feature</h3>
                <p className="text-navy-300 text-sm">
                  Custom report templates are available for Enterprise clients
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gold-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gold-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">Custom Branding</p>
                      <p className="text-xs text-navy-500">Add your logo, brand colors, and custom fonts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gold-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gold-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">Selectable Sections</p>
                      <p className="text-xs text-navy-500">Choose exactly which sections appear in your reports</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gold-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gold-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">White-Label Reports</p>
                      <p className="text-xs text-navy-500">Present compliance reports with your own branding</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => window.open('/pricing?tab=enterprise', '_blank')}
                    className="w-full py-3 bg-gold-600 text-white font-semibold rounded-xl hover:bg-gold-700 transition-all"
                  >
                    Upgrade to Enterprise
                  </button>
                  <button
                    onClick={() => setShowUpgradePrompt(false)}
                    className="w-full text-sm text-navy-400 hover:text-navy-600 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 mb-1">Error Loading Templates</h4>
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchTemplates}
              className="text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Try Again →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No templates state
  if (!loading && templates.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center">
            <Layout className="w-5 h-5 text-navy-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-navy-900 mb-1">No Templates Yet</h4>
            <p className="text-sm text-navy-500 mb-3">
              Create custom templates to brand your reports with your logo and colors.
            </p>
            <button
              onClick={() => window.open('/dashboard/templates', '_blank')}
              className="text-sm text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
            >
              Create Your First Template
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-gold-600 animate-spin" />
          <span className="text-sm text-navy-600">Loading your templates...</span>
        </div>
      </div>
    )
  }

  // Main selector UI
  const selectedStyles = selectedTemplate ? getTemplateStyles(selectedTemplate) : null

  return (
    <div className="space-y-3">
      {/* Header with premium badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gold-500 rounded-full" />
          <label className="text-sm font-semibold text-navy-900">
            Report Template
          </label>
          <span className="text-xs bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Enterprise
          </span>
        </div>
        {selectedStyles && (
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full ring-1 ring-white shadow-sm" 
              style={{ backgroundColor: selectedStyles.primary }}
              title="Primary Color"
            />
            <div 
              className="w-3 h-3 rounded-full ring-1 ring-white shadow-sm" 
              style={{ backgroundColor: selectedStyles.secondary }}
              title="Secondary Color"
            />
          </div>
        )}
      </div>

      {/* Template Count Badge */}
      <div className="flex items-center gap-2 text-xs text-navy-500">
        <Sparkles className="w-3 h-3" />
        <span>{templates.length} template{templates.length !== 1 ? 's' : ''} available</span>
      </div>

      {/* Dropdown Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between px-5 py-4 bg-white border-2 rounded-xl transition-all duration-200",
            isOpen 
              ? "border-gold-500 ring-2 ring-gold-500/20 shadow-lg" 
              : "border-slate-200 hover:border-gold-300 hover:shadow-md",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50"
          )}
        >
          <div className="flex items-center gap-4">
            {/* Template Preview Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-navy-50 to-gold-50 rounded-xl flex items-center justify-center">
                {selectedTemplate?.logo_url ? (
                  <img 
                    src={selectedTemplate.logo_url} 
                    alt="" 
                    className="max-w-8 max-h-8 object-contain"
                  />
                ) : (
                  <Layout className="w-5 h-5 text-gold-600" />
                )}
              </div>
              {selectedTemplate && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            
            <div className="text-left">
              {selectedTemplate ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-navy-900">
                      {selectedTemplate.name}
                    </p>
                    {(() => {
                      const badge = getTemplateBadge(selectedTemplate)
                      return (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", badge.className)}>
                          {badge.icon}
                          <span className="ml-1">{badge.text}</span>
                        </span>
                      )
                    })()}
                  </div>
                  <p className="text-xs text-navy-500 mt-0.5">
                    {selectedTemplate.description || 'Custom branded template'}
                  </p>
                  {selectedStyles && (
                    <div className="flex gap-1 mt-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: selectedStyles.primary }}
                      />
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: selectedStyles.secondary }}
                      />
                      <span className="text-[10px] text-navy-400 ml-1">
                        {selectedStyles.font}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-navy-700">
                    Select a template
                  </p>
                  <p className="text-xs text-navy-500">
                    Choose a branded layout for your report
                  </p>
                </>
              )}
            </div>
          </div>
          
          {loading ? (
            <Loader2 className="w-5 h-5 text-navy-400 animate-spin" />
          ) : (
            <ChevronDown className={cn(
              "w-5 h-5 text-navy-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-2 space-y-1">
              {/* Default Option - No Template */}
              <button
                type="button"
                onClick={() => handleSelectTemplate(null)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-lg transition-all text-left group",
                  !selectedTemplateId 
                    ? "bg-gold-50 border border-gold-200 shadow-sm" 
                    : "hover:bg-slate-50"
                )}
              >
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <Layout className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">
                    Default Template
                  </p>
                  <p className="text-xs text-navy-500">
                    Standard Veridian Group branding and layout
                  </p>
                </div>
                {!selectedTemplateId && (
                  <Check className="w-5 h-5 text-gold-600" />
                )}
              </button>

              {/* Divider */}
              {templates.length > 0 && (
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-xs text-navy-400">
                      Your Templates
                    </span>
                  </div>
                </div>
              )}

              {/* Template Options */}
              {templates.map((template) => {
                const badge = getTemplateBadge(template)
                const styles = getTemplateStyles(template)
                const isSelected = selectedTemplateId === template.id
                
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelectTemplate(template.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-3 rounded-lg transition-all text-left group",
                      isSelected 
                        ? "bg-gold-50 border border-gold-200 shadow-sm" 
                        : "hover:bg-slate-50"
                    )}
                  >
                    {/* Template Logo/Icon */}
                    <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-navy-100 transition-colors">
                      {template.logo_url ? (
                        <img 
                          src={template.logo_url} 
                          alt="" 
                          className="max-w-8 max-h-8 object-contain"
                        />
                      ) : (
                        <Palette className="w-5 h-5 text-navy-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-navy-900">
                          {template.name}
                        </p>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", badge.className)}>
                          {badge.icon}
                          <span className="ml-1">{badge.text}</span>
                        </span>
                        {template.is_default && (
                          <span className="text-[10px] bg-navy-100 text-navy-600 px-1.5 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-navy-500 mt-0.5 line-clamp-1">
                        {template.description || 'Custom branded template'}
                      </p>
                      {/* Color preview */}
                      <div className="flex gap-1 mt-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: styles.primary }}
                        />
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: styles.secondary }}
                        />
                        <span className="text-[10px] text-navy-400">
                          {styles.font}
                        </span>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <Check className="w-5 h-5 text-gold-600" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Template Preview Card - Show when template is selected */}
      {selectedTemplate && selectedStyles && (
        <div className="mt-4 p-4 bg-gradient-to-r from-navy-50 via-white to-gold-50/20 rounded-xl border border-navy-100 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Template Logo Preview */}
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
              {selectedTemplate.logo_url ? (
                <img 
                  src={selectedTemplate.logo_url} 
                  alt="" 
                  className="max-w-12 max-h-12 object-contain"
                />
              ) : (
                <Palette className="w-6 h-6 text-navy-400" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-navy-900">
                  {selectedTemplate.name}
                </p>
                <div className="flex gap-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: selectedStyles.primary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: selectedStyles.secondary }}
                  />
                </div>
              </div>
              <p className="text-xs text-navy-600 mb-3">
                This report will use your custom branding including logo, brand colors, 
                and {selectedStyles.font} font.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    window.open(`/dashboard/templates?preview=${selectedTemplate.id}`, '_blank')
                  }}
                  className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  Preview Template
                </button>
                <span className="text-xs text-navy-300">•</span>
                <button
                  type="button"
                  onClick={() => window.open('/dashboard/templates', '_blank')}
                  className="text-xs text-navy-500 hover:text-navy-700 font-medium flex items-center gap-1"
                >
                  Manage Templates
                  <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Tip */}
      {hasAccess && templates.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-navy-500">
          <Sparkles className="w-3 h-3 text-gold-500" />
          <span>Enterprise feature • Create and manage templates in your dashboard</span>
        </div>
      )}
    </div>
  )
}