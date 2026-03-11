// src/app/api/admin/customers/feedback/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: feedback, error } = await supabase
      .from('customer_feedback')
      .select(`
        *,
        users:user_id (
          id,
          email,
          company_name,
          full_name,
          subscription_tier,
          created_at
        ),
        assigned_to_user:assigned_to (
          id,
          email,
          full_name
        ),
        reviewed_by_user:reviewed_by (
          id,
          email,
          full_name
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(feedback)

  } catch (error) {
    console.error('Failed to fetch feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    // Get current user for audit trail
    const { data: { user } } = await supabase.auth.getUser()

    const updates: any = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // Handle status changes with audit timestamps
    if (body.status === 'reviewed' && !body.reviewed_at) {
      updates.reviewed_at = new Date().toISOString()
      updates.reviewed_by = user?.id
    }
    if (body.status === 'actioned' && !body.actioned_at) {
      updates.actioned_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('customer_feedback')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('Failed to update feedback:', error)
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { error } = await supabase
      .from('customer_feedback')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Failed to delete feedback:', error)
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
}