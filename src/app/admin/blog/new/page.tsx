// src/app/admin/blog/new/page.tsx - New Blog Post Page
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BlogPostForm from '../BlogPostForm'

export default async function NewBlogPostPage() {
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

  // Fetch categories for dropdown
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name')

  return <BlogPostForm categories={categories || []} />
}