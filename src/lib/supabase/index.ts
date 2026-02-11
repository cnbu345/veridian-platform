// Re-export everything from client and server
export { 
  createClient as createBrowserClient,
  getClientUser,
  onAuthStateChange,
  signOut 
} from './client'

// Default export for backward compatibility
import { createClient as createBrowserClient } from './client'
export default createBrowserClient