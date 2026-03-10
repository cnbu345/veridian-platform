// src/app/admin/blog/[id]/edit/page.tsx -  Edit Post Page
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import BlogPostForm from '../../BlogPostForm'

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
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

  // Fetch the post
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  // Fetch categories for dropdown
  const { data: categories } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name')

  return <BlogPostForm post={post} categories={categories || []} />
}