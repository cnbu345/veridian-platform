// src/app/dashboard/support/kb/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardKBClient from './KBClient'

export default async function DashboardKBPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }
  
  // Fetch categories with article counts
  const { data: categories } = await supabase
    .from('kb_categories')
    .select(`
      *,
      articles:kb_articles(count)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Fetch featured articles
  const { data: featuredArticles } = await supabase
    .from('kb_articles')
    .select(`
      *,
      category:kb_categories(name, slug)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('views', { ascending: false })
    .limit(6)

  // Fetch most viewed articles
  const { data: popularArticles } = await supabase
    .from('kb_articles')
    .select(`
      *,
      category:kb_categories(name, slug)
    `)
    .eq('is_published', true)
    .order('views', { ascending: false })
    .limit(8)

  // Process categories with counts
  const processedCategories = (categories || []).map(cat => ({
    ...cat,
    article_count: cat.articles?.[0]?.count || 0
  }))

  return (
    <DashboardKBClient 
      categories={processedCategories}
      featuredArticles={featuredArticles || []}
      popularArticles={popularArticles || []}
    />
  )
}