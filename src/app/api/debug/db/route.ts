// src/app/api/debug/db/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const results: any = {
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    tests: {}
  }
  
  // Test with anon key
  try {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data, error } = await anonClient
      .from('reports')
      .select('count')
      .limit(1)
    
    results.tests.anon = {
      success: !error,
      error: error?.message,
      data
    }
  } catch (e) {
    results.tests.anon = { success: false, error: String(e) }
  }
  
  // Test with service role key
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const { data, error } = await serviceClient
        .from('reports')
        .select('count')
        .limit(1)
      
      results.tests.service = {
        success: !error,
        error: error?.message,
        data
      }
      
      // Test insert with service role
      if (!error) {
        const testInsert = await serviceClient
          .from('reports')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            company_name: 'Test Company',
            industry: 'Test',
            city: 'Test',
            state: 'TX',
            location_tier: 'test',
            status: 'test',
            created_at: new Date().toISOString()
          })
          .select()
        
        results.tests.serviceInsert = {
          success: !testInsert.error,
          error: testInsert.error?.message
        }
      }
    } catch (e) {
      results.tests.service = { success: false, error: String(e) }
    }
  }
  
  return NextResponse.json(results)
}