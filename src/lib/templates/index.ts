// src/lib/templates/index.ts
// Unified exports for template operations

// Export types and client-safe functions
export * from './storage.client'

// Note: Server-only functions are not exported from this index
// They should be imported directly from './storage.server' when needed on the server