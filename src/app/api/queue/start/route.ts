// src/app/api/queue/start/route.ts // Manual queue start
import { NextResponse } from 'next/server'
import { startQueueProcessor } from '@/lib/queue/init'

// This endpoint will be called from the client to start the queue processor
let processorStarted = false

export async function POST() {
  try {
    if (!processorStarted) {
      console.log('🚀 Starting queue processor via API...')
      startQueueProcessor()
      processorStarted = true
      return NextResponse.json({ success: true, message: 'Queue processor started' })
    } else {
      return NextResponse.json({ success: true, message: 'Queue processor already running' })
    }
  } catch (error) {
    console.error('Failed to start queue processor:', error)
    return NextResponse.json(
      { error: 'Failed to start queue processor' },
      { status: 500 }
    )
  }
}