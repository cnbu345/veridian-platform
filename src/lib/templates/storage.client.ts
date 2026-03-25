// src/lib/templates/storage.client.ts
// Client-side only template operations

import { createClient } from '@/lib/supabase/client'

export interface TemplateStyles {
  primary_color: string
  secondary_color: string
  font_family: string
  show_logo: boolean
  show_page_numbers: boolean
  show_footer?: boolean
}

export interface TemplateSection {
  id: string
  name: string
  type: string
  is_visible: boolean
  order?: number
}

export interface AdminTemplate {
  id: string
  name: string
  description: string | null
  type: string | null
  thumbnail: string | null
  sections: TemplateSection[]
  styles: TemplateStyles
  is_active: boolean
  is_default: boolean
  usage_count: number
  logo_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface UserTemplate {
  id: string
  user_id: string
  name: string
  description: string | null
  logo_url: string | null
  styles: TemplateStyles
  sections: TemplateSection[]
  is_default: boolean
  created_at: string
  updated_at: string
}

export type Template = AdminTemplate | UserTemplate

export function isUserTemplate(template: Template): template is UserTemplate {
  return 'user_id' in template
}

export function isAdminTemplate(template: Template): template is AdminTemplate {
  return 'is_active' in template
}

// Get user's custom templates (client-side only)
export async function getUserTemplates(userId: string): Promise<UserTemplate[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('user_templates')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user templates:', error)
      return []
    }
    
    return (data || []) as UserTemplate[]
  } catch (error) {
    console.error('Exception fetching user templates:', error)
    return []
  }
}

// Get admin templates (client-side only)
export async function getAdminTemplates(): Promise<AdminTemplate[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching admin templates:', error)
      return []
    }
    
    return (data || []) as AdminTemplate[]
  } catch (error) {
    console.error('Exception fetching admin templates:', error)
    return []
  }
}

// Get available templates for a user (admin templates + their custom templates)
export async function getAvailableTemplates(userId: string): Promise<Template[]> {
  const templates: Template[] = []
  
  // Get admin templates
  const adminTemplates = await getAdminTemplates()
  templates.push(...adminTemplates)
  
  // Get user's custom templates
  const userTemplates = await getUserTemplates(userId)
  templates.push(...userTemplates)
  
  return templates
}

// Get default template for a user
export async function getDefaultTemplate(userId: string): Promise<Template | null> {
  const templates = await getAvailableTemplates(userId)
  return templates.find(t => t.is_default) || templates[0] || null
}

// Get a specific template by ID (client-side only)
export async function getTemplateClient(templateId: string, userId?: string): Promise<Template | null> {
  const supabase = createClient()
  
  // First, try to get from user_templates (if userId provided)
  if (userId) {
    const { data: userTemplate, error: userError } = await supabase
      .from('user_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if (!userError && userTemplate) {
      return userTemplate as UserTemplate
    }
  }
  
  // If not found or no userId, try admin templates
  const { data: adminTemplate, error: adminError } = await supabase
    .from('report_templates')
    .select('*')
    .eq('id', templateId)
    .maybeSingle()
  
  if (!adminError && adminTemplate) {
    return adminTemplate as AdminTemplate
  }
  
  return null
}