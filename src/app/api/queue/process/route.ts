// src/app/api/queue/process/route.ts
import { NextResponse } from 'next/server'
import { reportQueue } from '@/lib/queue/reportQueue'

export async function POST() {
  try {
    console.log('🔄 Manually triggering queue processing...')
    await reportQueue.processQueue()
    return NextResponse.json({ success: true, message: 'Queue processing triggered' })
  } catch (error: any) {
    console.error('Failed to process queue:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}