// src/app/auth/callback/route.ts // Callback Handler
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      // Get user metadata to determine provider
      const provider = session.user.app_metadata?.provider || 'email'
      
      // Check if user exists in our users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!existingUser) {
        // Create user profile for social login
        await supabase.from('users').insert({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
          auth_provider: provider,
          email_confirmed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      // Update last login
      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          last_login_method: provider
        })
        .eq('id', session.user.id)

      // Check if user is admin for redirect
      const { data: profile } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      // Redirect based on role
      if (profile?.is_admin) {
        return NextResponse.redirect(new URL('/admin', requestUrl.origin))
      } else {
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      }
    }
  }

  // Default redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}