// src/app/blog/category/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, ChevronLeft, ChevronRight, Clock,
  Star, ArrowLeft, FolderOpen
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/utils'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const supabase = await createClient()

  // Fetch the category
  const { data: category, error: categoryError } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Fetch posts in this category
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(full_name, avatar_url),
      category:blog_categories(name, slug, color)
    `)
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false })

  const categoryColors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    gold: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/blog"
              className="text-navy-200 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
          
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                categoryColors[category.color] || 'bg-navy-700 text-navy-200'
              )}>
                {category.name}
              </span>
              <span className="text-navy-300">
                {posts?.length || 0} {posts?.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-navy-200">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-gold-300 hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    {post.category && (
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        categoryColors[post.category.color]
                      )}>
                        {post.category.name}
                      </span>
                    )}
                    {post.is_featured && (
                      <span className="px-2 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-navy-900 text-lg mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-navy-600 mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-navy-500 mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(post.published_at), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time} min
                      </span>
                    </div>
                    <span className="text-gold-600 font-medium flex items-center gap-1">
                      Read
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">No articles yet</h2>
            <p className="text-navy-600 mb-8">
              There are no published articles in this category yet.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
            >
              Browse all articles
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Back to All Articles */}
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-navy-600 hover:text-gold-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to all articles
          </Link>
        </div>
      </div>
    </div>
  )
}