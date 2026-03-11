// src/app/api/admin/customers/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''
    
    // Start building query to get real users with their health data
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        company_name,
        subscription_tier,
        last_login,
        created_at,
        customer_health (
          health_score,
          risk_level,
          report_count,
          support_tickets,
          churn_probability,
          nps_score,
          csat_score,
          expansion_opportunity,
          last_feedback_date,
          feedback_trend,
          feature_requests
        )
      `)
      .order('created_at', { ascending: false })
    
    // Apply search if provided
    if (search) {
      query = query.or(`company_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    
    const { data: users, error } = await query
    
    if (error) throw error
    
    // Transform the data to match your frontend interface
    const customers = (users || []).map(user => ({
      id: user.id, // This is the real UUID!
      company_name: user.company_name || 'Unknown Company',
      email: user.email,
      health_score: user.customer_health?.[0]?.health_score || 50,
      risk_level: user.customer_health?.[0]?.risk_level || 'moderate',
      last_login: user.last_login || user.created_at,
      report_count: user.customer_health?.[0]?.report_count || 0,
      support_tickets: user.customer_health?.[0]?.support_tickets || 0,
      churn_probability: user.customer_health?.[0]?.churn_probability || 0.5,
      subscription_tier: user.subscription_tier || 'free',
      nps_score: user.customer_health?.[0]?.nps_score,
      csat_score: user.customer_health?.[0]?.csat_score,
      expansion_opportunity: user.customer_health?.[0]?.expansion_opportunity || [],
      last_feedback_date: user.customer_health?.[0]?.last_feedback_date,
      feedback_trend: user.customer_health?.[0]?.feedback_trend,
      feature_requests: user.customer_health?.[0]?.feature_requests || []
    }))
    
    // Calculate metrics
    const metrics = {
      averageHealthScore: customers.length > 0 
        ? Math.round(customers.reduce((sum, c) => sum + c.health_score, 0) / customers.length)
        : 0,
      atRiskCount: customers.filter(c => c.risk_level === 'at_risk').length,
      atRiskMrr: customers.filter(c => c.risk_level === 'at_risk').length * 7997, // Calculate properly later
      expansionOpportunities: customers.filter(c => c.expansion_opportunity.length > 0).length,
      expansionPotential: customers.filter(c => c.expansion_opportunity.length > 0).length * 15000,
      npsScore: customers.filter(c => c.nps_score).length > 0
        ? Math.round(customers.filter(c => c.nps_score).reduce((sum, c) => sum + (c.nps_score || 0), 0) / 
          customers.filter(c => c.nps_score).length)
        : 0
    }
    
    return NextResponse.json({ 
      customers,
      metrics 
    })
    
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}