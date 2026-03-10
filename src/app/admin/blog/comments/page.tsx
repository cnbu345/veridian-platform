// src/app/admin/blog/comments/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BlogCommentsClient from './BlogCommentsClient'

export default async function BlogCommentsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    redirect('/dashboard')
  }

  // Fetch comments with post and user info
  const { data: comments } = await supabase
    .from('blog_comments')
    .select(`
      *,
      post:blog_posts(title, slug),
      user:users(full_name, email)
    `)
    .order('created_at', { ascending: false })

  return <BlogCommentsClient initialComments={comments || []} />
}