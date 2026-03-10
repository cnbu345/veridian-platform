// src/app/admin/blog/page.tsx - Main Blog Posts List Page
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BlogPostsClient from './BlogPostsClient'

export default async function AdminBlogPage() {
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

  // Fetch blog posts with author and category
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(full_name, email),
      category:blog_categories(name, slug, color)
    `)
    .order('created_at', { ascending: false })

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name')

  return (
    <BlogPostsClient 
      initialPosts={posts || []} 
      categories={categories || []}
    />
  )
}