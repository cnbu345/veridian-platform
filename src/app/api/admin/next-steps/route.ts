// src/app/api/admin/next-steps/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get next steps templates
    const { data: templates, error: templatesError } = await supabase
      .from('next_steps_templates')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (templatesError) return NextResponse.json({ error: templatesError.message }, { status: 500 })
    
    // Get calendar templates with tasks
    const { data: calendarTemplates, error: calendarError } = await supabase
      .from('compliance_calendar_templates')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (calendarError) return NextResponse.json({ error: calendarError.message }, { status: 500 })
    
    const { data: calendarTasks, error: tasksError } = await supabase
      .from('compliance_calendar_tasks')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (tasksError) return NextResponse.json({ error: tasksError.message }, { status: 500 })
    
    // Combine calendar templates with their tasks
    const combinedCalendar = calendarTemplates.map(template => ({
      ...template,
      tasks: calendarTasks.filter(task => task.calendar_template_id === template.id)
    }))
    
    return NextResponse.json({
      data: {
        next_steps: templates,
        compliance_calendar: combinedCalendar
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { type, ...data } = body
    
    let result
    let tableName = ''
    
    if (type === 'next_step') {
      tableName = 'next_steps_templates'
      const { data: inserted, error: insertError } = await supabase.from(tableName).insert(data).select().single()
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
      result = inserted
    } else if (type === 'calendar_template') {
      tableName = 'compliance_calendar_templates'
      const { data: inserted, error: insertError } = await supabase.from(tableName).insert(data).select().single()
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
      result = inserted
    } else if (type === 'calendar_task') {
      tableName = 'compliance_calendar_tasks'
      const { data: inserted, error: insertError } = await supabase.from(tableName).insert(data).select().single()
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
      result = inserted
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: tableName,
      record_id: result.id,
      action: 'INSERT',
      new_data: data,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const type = searchParams.get('type')
    
    if (!id || !type) return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })
    
    const body = await request.json()
    
    let tableName = ''
    let oldData: any = null
    
    if (type === 'next_step') {
      tableName = 'next_steps_templates'
      const { data } = await supabase.from(tableName).select('*').eq('id', id).single()
      oldData = data
      const { data: updated, error: updateError } = await supabase.from(tableName).update(body).eq('id', id).select().single()
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    } else if (type === 'calendar_template') {
      tableName = 'compliance_calendar_templates'
      const { data } = await supabase.from(tableName).select('*').eq('id', id).single()
      oldData = data
      const { data: updated, error: updateError } = await supabase.from(tableName).update(body).eq('id', id).select().single()
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    } else if (type === 'calendar_task') {
      tableName = 'compliance_calendar_tasks'
      const { data } = await supabase.from(tableName).select('*').eq('id', id).single()
      oldData = data
      const { data: updated, error: updateError } = await supabase.from(tableName).update(body).eq('id', id).select().single()
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: tableName,
      record_id: id,
      action: 'UPDATE',
      old_data: oldData,
      new_data: body,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const type = searchParams.get('type')
    
    if (!id || !type) return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })
    
    let tableName = ''
    let oldData: any = null
    
    if (type === 'next_step') {
      tableName = 'next_steps_templates'
      const { data } = await supabase.from(tableName).select('*').eq('id', id).single()
      oldData = data
      await supabase.from(tableName).delete().eq('id', id)
    } else if (type === 'calendar_template') {
      tableName = 'compliance_calendar_templates'
      const { data } = await supabase.from(tableName).select('*').eq('id', id).single()
      oldData = data
      // Delete associated tasks first
      await supabase.from('compliance_calendar_tasks').delete().eq('calendar_template_id', id)
      await supabase.from(tableName).delete().eq('id', id)
    } else if (type === 'calendar_task') {
      tableName = 'compliance_calendar_tasks'
      const { data } = await supabase.from(tableName).select('*').eq('id', id).single()
      oldData = data
      await supabase.from(tableName).delete().eq('id', id)
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    
    await supabase.from('regulatory_audit_log').insert({
      table_name: tableName,
      record_id: id,
      action: 'DELETE',
      old_data: oldData,
      changed_by: session.user.id,
      changed_by_email: session.user.email
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}