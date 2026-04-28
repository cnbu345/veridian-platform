// src/app/api/reports/route.ts
// Create a new report record - NOW FETCHES LICENSING DATA

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      userId, 
      companyName, 
      industry, 
      city, 
      state, 
      locationTier, 
      nearestRegulatoryHub, 
      templateId,
      companySize,
      budget,
      primaryFocus,
      secondaryFocus,
      timeline,
      concerns,
      goals,
      secondaryStates
    } = body

    if (!userId || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the user matches the authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 🔥 CRITICAL: Fetch licensing data for the primary state
    console.log(`📡 Fetching licensing data for state: ${state}`)
    let licensingData = null
    
    try {
      const { data: licenseData, error: licenseError } = await supabase
        .from('licensing_requirements')
        .select('*')
        .eq('state_code', state?.toUpperCase())
        .single()
      
      if (licenseError) {
        console.warn(`⚠️ No licensing data found for ${state}:`, licenseError.message)
      } else {
        licensingData = licenseData
        console.log(`✅ Retrieved licensing data for ${state}:`, {
          application_fee: licensingData?.application_fee,
          license_required: licensingData?.license_required,
          regulator_name: licensingData?.regulator_name
        })
      }
    } catch (error) {
      console.error(`❌ Error fetching licensing data for ${state}:`, error)
    }

    // Build initial report content WITH licensing data
    const reportContent: any = {
      company: { 
        name: companyName, 
        industry, 
        size: companySize, 
        budget 
      },
      location: { 
        city, 
        state, 
        tier: locationTier, 
        nearestRegulatoryHub 
      },
      strategy_focus: {
        primary: primaryFocus,
        secondary: secondaryFocus,
        timeline
      },
      concerns,
      goals,
      secondaryStates: secondaryStates || [],
      // 🔥 STORE THE LICENSING DATA HERE!
      licensing_data: licensingData,
      status: 'pending',
      created_at: new Date().toISOString(),
      template_id: templateId
    }

    console.log('📝 Creating report with licensing_data:', !!licensingData)

    // Create the report
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        company_name: companyName,
        industry: industry || '',
        city: city || '',
        state: state || '',
        location_tier: locationTier || 'major',
        nearest_regulatory_hub: nearestRegulatoryHub || null,
        status: 'pending',
        template_id: templateId || null,
        report_content: reportContent
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating report:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Report created: ${report.id}`)
    return NextResponse.json({ id: report.id })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to list reports
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reports })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}