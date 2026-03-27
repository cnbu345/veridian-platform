// src/lib/supabase/server-client.ts
// This file is for client-side code that needs to call server actions
// DO NOT import this in server components

import { createClient } from './client';

// Re-export client functions that might be needed
export { createClient, getClientUser, onAuthStateChange, signOut } from './client';

// Create a safe wrapper for server functions that should only be called via API routes
export const serverApi = {
  async getCampaignsForExport(params?: { from_date?: string; to_date?: string }) {
    const response = await fetch(`/api/marketing/export?${new URLSearchParams(params as any)}`);
    if (!response.ok) throw new Error('Failed to export data');
    return response.json();
  }
};