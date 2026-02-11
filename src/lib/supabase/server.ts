import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies()
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Ignore errors in middleware
              }
            })
          } catch {
            // Ignore errors in middleware
          }
        },
      },
    }
  )
}

// Helper to get authenticated user on server
export async function getServerUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting server user:', error)
    return null
  }
  
  return user
}

// Helper to get user with profile data
export async function getServerUserWithProfile() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, profile: null }
  }
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return { user, profile }
}