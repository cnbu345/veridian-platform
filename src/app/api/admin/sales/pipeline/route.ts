// src/app/api/admin/sales/pipeline/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const range = url.searchParams.get('range') || 'month'
    
    // Build date filter based on range
    let dateFilter = new Date()
    switch(range) {
      case 'week':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1)
        break
      case 'quarter':
        dateFilter.setMonth(dateFilter.getMonth() - 3)
        break
      case 'year':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1)
        break
    }

    // Fetch pipeline metrics
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_to_user:users!leads_assigned_to_fkey (
          email,
          full_name
        )
      `)
      .gte('created_at', dateFilter.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate pipeline stages
    const stages = ['new', 'contacted', 'consultation_scheduled', 'consultation_completed', 'proposal', 'negotiation']
    const stageColors: Record<string, string> = {
      'new': 'bg-blue-500',
      'contacted': 'bg-cyan-500',
      'consultation_scheduled': 'bg-purple-500',
      'consultation_completed': 'bg-indigo-500',
      'proposal': 'bg-amber-500',
      'negotiation': 'bg-orange-500'
    }

    const pipelineStages = stages.map(stage => {
      const stageLeads = leads?.filter(lead => lead.stage === stage) || []
      const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)
      const probability = stage === 'new' ? 10 :
                         stage === 'contacted' ? 20 :
                         stage === 'consultation_scheduled' ? 40 :
                         stage === 'consultation_completed' ? 60 :
                         stage === 'proposal' ? 80 : 90
      
      return {
        name: stage.replace('_', ' '),
        value: totalValue,
        count: stageLeads.length,
        probability,
        color: stageColors[stage] || 'bg-slate-500',
        weightedValue: totalValue * probability / 100
      }
    })

    // Get upcoming closures (deals in proposal or negotiation stage)
    const upcomingClosures = leads?.filter(lead => 
      (lead.stage === 'proposal' || lead.stage === 'negotiation') &&
      lead.next_action_date
    ).map(lead => ({
      companyName: lead.company_name,
      value: lead.value || 0,
      stage: lead.stage,
      probability: lead.probability || 0,
      closeDate: lead.next_action_date,
      owner: lead.assigned_to_user?.full_name || lead.assigned_to_user?.email || 'Unassigned'
    })).slice(0, 10) || []

    const metrics = {
      totalPipeline: leads?.reduce((sum, lead) => sum + (lead.value || 0), 0) || 0,
      weightedPipeline: leads?.reduce((sum, lead) => sum + ((lead.value || 0) * (lead.probability || 0) / 100), 0) || 0,
      activeDeals: leads?.filter(lead => !['closed_won', 'closed_lost'].includes(lead.stage || '')).length || 0,
      winRate: 65,
      pipelineStages,
      upcomingClosures
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Error fetching pipeline:', error)
    return NextResponse.json({ error: 'Failed to fetch pipeline' }, { status: 500 })
  }
}