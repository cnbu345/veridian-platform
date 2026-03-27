// src/lib/supabase/index.ts
// Re-export everything from client and server
export { 
  createClient as createBrowserClient,
  getClientUser,
  onAuthStateChange,
  signOut 
} from './client'

// Export server functions separately
export type { createClient as createServerClient, createAdminClient, getServerUser, getServerUserWithProfile } from './server'

// Default export for backward compatibility
import { createClient as createBrowserClient } from './client'
export default createBrowserClient