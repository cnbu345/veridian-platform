// src/lib/regulatory/external-apis/types.ts
// Shared types for external API integration

export interface SyncResult {
  state: string
  newFacts: number
  updatedFacts: number
  conflicts: number
  errors: string[]
}

export interface ExternalSource {
  name: 'NMLS' | 'CSBS'
  lastSync: string
  status: 'success' | 'partial' | 'failed'
  factsAdded: number
  factsUpdated: number
  errors: string[]
}