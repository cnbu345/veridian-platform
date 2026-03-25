// src/lib/queue/init.ts
// Initializes queue processor

import { reportQueue } from './reportQueue'

// This file ensures the queue processor is initialized when the app starts
export function startQueueProcessor() {
  console.log('🚀 Starting queue processor...')
  // Start processing if not already running
  reportQueue.startProcessing()
  return reportQueue
}

// Export the queue instance
export { reportQueue }

// Optional: Auto-initialize when imported on server
if (typeof window === 'undefined') {
  console.log('📦 Auto-initializing queue processor on server...')
  startQueueProcessor()
}