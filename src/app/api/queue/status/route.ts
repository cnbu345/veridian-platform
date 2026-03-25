// src/app/api/queue/status/route.ts
// Queue status endpoint
import { NextResponse } from 'next/server'
import { reportQueue } from '@/lib/queue/reportQueue'

export async function GET() {
  try {
    const status = reportQueue.getQueueStatus()
    const items = reportQueue.getQueueItems()
    
    return NextResponse.json({
      success: true,
      status,
      items: items.map(item => ({
        id: item.id,
        reportId: item.reportId,
        status: item.status,
        retryCount: item.retryCount,
        createdAt: item.createdAt,
        templateId: item.templateId
      }))
    })
  } catch (error) {
    console.error('Failed to get queue status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get queue status' },
      { status: 500 }
    )
  }
}