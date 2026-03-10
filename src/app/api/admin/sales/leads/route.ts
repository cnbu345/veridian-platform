// src/app/api/admin/sales/leads/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const state = searchParams.get('state')
    const industry = searchParams.get('industry')
    const minScore = searchParams.get('minScore')
    
    // Start query
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Apply filters if provided
    if (stage && stage !== 'all') {
      query = query.eq('stage', stage)
    }
    
    if (state && state !== 'all') {
      query = query.eq('state', state)
    }
    
    if (industry && industry !== 'all') {
      query = query.eq('industry', industry)
    }
    
    if (minScore && minScore !== '0') {
      query = query.gte('score', parseInt(minScore))
    }
    
    const { data: leads, error } = await query
    
    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }
    
    // Transform to match your Lead interface
    const transformedLeads = leads.map(lead => ({
      id: lead.id,
      companyName: lead.company_name,
      industry: lead.industry,
      state: lead.state,
      contactName: lead.contact_name,
      contactTitle: lead.contact_title,
      email: lead.contact_email,
      phone: lead.contact_phone,
      source: lead.source,
      score: lead.score,
      stage: lead.stage,
      value: lead.value || 0,
      lastContact: lead.last_contact,
      nextAction: lead.next_action || '',
      assignedTo: lead.assigned_to,
      tags: lead.tags || []
    }))
    
    return NextResponse.json(transformedLeads)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Transform from your Lead interface to database schema
    const dbLead = {
      company_name: body.companyName,
      industry: body.industry,
      state: body.state,
      contact_name: body.contactName,
      contact_title: body.contactTitle,
      contact_email: body.email,
      contact_phone: body.phone,
      source: body.source,
      score: body.score || 0,
      stage: body.stage || 'new',
      value: body.value || 0,
      last_contact: body.lastContact || new Date().toISOString(),
      next_action: body.nextAction,
      assigned_to: body.assignedTo,
      tags: body.tags || []
    }
    
    const { data, error } = await supabase
      .from('leads')
      .insert([dbLead])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
