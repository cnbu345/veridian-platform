// src/lib/queue/init.ts
import { reportQueue, initializeQueueProcessor } from './reportQueue'

// This file ensures the queue processor is initialized when the app starts
export function startQueueProcessor() {
  console.log('🚀 Starting report queue processor...')
  initializeQueueProcessor()
  console.log('✅ Report queue processor started')
}