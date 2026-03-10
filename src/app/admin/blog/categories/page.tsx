// src/app/admin/blog/categories/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BlogCategoriesClient from './BlogCategoriesClient'

export default async function BlogCategoriesPage() {
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

  // Fetch categories with post counts
  const { data: categories } = await supabase
    .from('blog_categories')
    .select(`
      *,
      posts:blog_posts(count)
    `)
    .order('name')

  const processedCategories = (categories || []).map(cat => ({
    ...cat,
    post_count: cat.posts?.[0]?.count || 0
  }))

  return <BlogCategoriesClient initialCategories={processedCategories} />
}