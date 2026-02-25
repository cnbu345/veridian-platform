// src/app/api/test-webhook/route.ts // Can delete when done test
import { NextResponse } from 'next/server'

export async function POST() {
  console.log('✅ TEST WEBHOOK RECEIVED')
  return NextResponse.json({ received: true })
}

export async function GET() {
  return NextResponse.json({ message: 'Test webhook ready' })
}