// src/app/blog/page.tsx - Public Blog Page
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, User, ChevronRight, Search,
  Tag, Clock, Eye, ArrowRight, Star
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/utils'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const supabase = await createClient()

  // Fetch featured posts
  const { data: featuredPosts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(full_name, avatar_url),
      category:blog_categories(name, slug, color)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(3)

  // Fetch recent posts
  const { data: recentPosts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(full_name, avatar_url),
      category:blog_categories(name, slug, color)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(9)

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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Dark background for contrast */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Veridian Insights
            </h1>
            <p className="text-xl text-navy-200 mb-8">
              Expert analysis on regulatory compliance, fintech trends, and industry best practices
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-white placeholder-navy-300 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar - Light background */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-navy-700">Topics:</span>
            <Link
              href="/blog"
              className="px-4 py-2 bg-gold-600 text-white rounded-full text-sm font-medium hover:bg-gold-700 transition-colors"
            >
              All
            </Link>
            {processedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className="px-4 py-2 bg-slate-100 text-navy-700 rounded-full text-sm font-medium hover:bg-gold-100 hover:text-gold-700 transition-colors"
              >
                {category.name} ({category.post_count})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - White background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 bg-white">
        {/* Featured Posts */}
        {featuredPosts && featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 flex items-center gap-2">
              <Star className="w-6 h-6 text-gold-600" />
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                    {post.featured_image && (
                      <div className="relative h-48 bg-slate-100">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {post.category && (
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium inline-block mb-3",
                          post.category.color === 'blue' && "bg-blue-100 text-blue-700",
                          post.category.color === 'green' && "bg-green-100 text-green-700",
                          post.category.color === 'purple' && "bg-purple-100 text-purple-700",
                          post.category.color === 'orange' && "bg-orange-100 text-orange-700",
                          post.category.color === 'gold' && "bg-amber-100 text-amber-700",
                          post.category.color === 'red' && "bg-red-100 text-red-700"
                        )}>
                          {post.category.name}
                        </span>
                      )}
                      <h3 className="font-bold text-navy-900 text-xl mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-navy-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 text-navy-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(post.published_at), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.read_time} min read
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gold-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts */}
        <div>
          <h2 className="text-2xl font-bold text-navy-900 mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts?.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-gold-300 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    {post.category && (
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        post.category.color === 'blue' && "bg-blue-100 text-blue-700",
                        post.category.color === 'green' && "bg-green-100 text-green-700",
                        post.category.color === 'purple' && "bg-purple-100 text-purple-700",
                        post.category.color === 'orange' && "bg-orange-100 text-orange-700",
                        post.category.color === 'gold' && "bg-amber-100 text-amber-700",
                        post.category.color === 'red' && "bg-red-100 text-red-700"
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
                    <p className="text-sm text-navy-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-navy-500">
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
        </div>
      </div>

      {/* Newsletter Section - Dark background */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay Informed</h2>
          <p className="text-xl text-navy-200 mb-8">
            Get the latest regulatory insights delivered to your inbox
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent text-white placeholder-navy-300"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gold-500 text-navy-900 rounded-xl hover:bg-gold-400 transition-colors font-semibold whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}