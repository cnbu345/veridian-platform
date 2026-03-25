// src/lib/templates/storage.server.ts
// Server-side only template operations

import { createClient } from '@/lib/supabase/server'
import type { TemplateStyles, TemplateSection, UserTemplate, AdminTemplate } from './storage.client'

// Create a new user template (server-side only)
export async function createUserTemplate(
  userId: string,
  data: {
    name: string
    description?: string
    logo_url?: string | null
    styles: TemplateStyles
    sections: TemplateSection[]
    is_default?: boolean
  }
): Promise<UserTemplate | null> {
  const supabase = await createClient()
  
  // If this template is set as default, unset any existing default
  if (data.is_default) {
    await supabase
      .from('user_templates')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
  }
  
  const { data: template, error } = await supabase
    .from('user_templates')
    .insert({
      user_id: userId,
      name: data.name,
      description: data.description || null,
      logo_url: data.logo_url || null,
      styles: data.styles,
      sections: data.sections,
      is_default: data.is_default || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user template:', error)
    return null
  }
  
  return template as UserTemplate
}

// Update a user template (server-side only)
export async function updateUserTemplate(
  templateId: string,
  userId: string,
  data: Partial<{
    name: string
    description: string
    logo_url: string | null
    styles: TemplateStyles
    sections: TemplateSection[]
    is_default: boolean
  }>
): Promise<UserTemplate | null> {
  const supabase = await createClient()
  
  // If setting as default, unset any existing default
  if (data.is_default) {
    await supabase
      .from('user_templates')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true)
      .neq('id', templateId)
  }
  
  const { data: template, error } = await supabase
    .from('user_templates')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user template:', error)
    return null
  }
  
  return template as UserTemplate
}

// Delete a user template (server-side only)
export async function deleteUserTemplate(templateId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('user_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error deleting user template:', error)
    return false
  }
  
  return true
}

// Increment usage count for admin template (server-side only)
export async function incrementAdminTemplateUsage(templateId: string): Promise<void> {
  const supabase = await createClient()
  
  // Get current usage count and increment
  const { data: template } = await supabase
    .from('report_templates')
    .select('usage_count')
    .eq('id', templateId)
    .single()
  
  if (template) {
    await supabase
      .from('report_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', templateId)
  }
}

// Create a version for a template (server-side only)
export async function createTemplateVersion(
  templateId: string,
  content: any,
  createdBy?: string,
  comment?: string
): Promise<void> {
  const supabase = await createClient()
  
  // Get current max version
  const { data: versions } = await supabase
    .from('template_versions')
    .select('version')
    .eq('template_id', templateId)
    .order('version', { ascending: false })
    .limit(1)
  
  const nextVersion = (versions?.[0]?.version || 0) + 1
  
  await supabase
    .from('template_versions')
    .insert({
      template_id: templateId,
      version: nextVersion,
      content: content,
      created_by: createdBy || null,
      comment: comment || null,
      created_at: new Date().toISOString()
    })
}

// Get template version history (server-side only)
export async function getTemplateVersions(templateId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('template_versions')
    .select('*')
    .eq('template_id', templateId)
    .order('version', { ascending: false })
  
  if (error) {
    console.error('Error fetching template versions:', error)
    return []
  }
  
  return data
}

// Get template with user check (server-side only)
export async function getTemplateServer(templateId: string, userId?: string) {
  const supabase = await createClient()
  
  // First, try to get from user_templates (if userId provided)
  if (userId) {
    const { data: userTemplate } = await supabase
      .from('user_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .maybeSingle()
    
    if (userTemplate) {
      return userTemplate
    }
  }
  
  // If not found or no userId, try admin templates
  const { data: adminTemplate } = await supabase
    .from('report_templates')
    .select('*')
    .eq('id', templateId)
    .maybeSingle()
  
  return adminTemplate
}