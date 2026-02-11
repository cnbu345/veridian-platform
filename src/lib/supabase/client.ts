import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Helper function to get client-side user
export async function getClientUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper for real-time auth state
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = createClient()
  return supabase.auth.onAuthStateChange(callback)
}

// Sign out helper
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return true
}