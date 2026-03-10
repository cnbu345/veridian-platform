// src/app/blog/[slug]/page.tsx - Individual Blog Post Page
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, User, ChevronLeft, ChevronRight,
  Clock, Eye, Tag, Share2, Bookmark,
  Twitter, Linkedin, Facebook, ArrowLeft
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/utils'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const supabase = await createClient()

  // Fetch the post
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(full_name, avatar_url, email),
      category:blog_categories(name, slug, color)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !post) {
    notFound()
  }

  // Increment view count
  await supabase
    .from('blog_posts')
    .update({ views: (post.views || 0) + 1 })
    .eq('id', post.id)

  // Fetch related posts
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(name, slug)
    `)
    .eq('status', 'published')
    .eq('category_id', post.category_id)
    .neq('id', post.id)
    .limit(3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="flex items-center gap-2 text-navy-600 hover:text-gold-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Link>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bookmark className="w-4 h-4 text-navy-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Share2 className="w-4 h-4 text-navy-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Category */}
        {post.category && (
          <Link
            href={`/blog/category/${post.category.slug}`}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium inline-block mb-6",
              post.category.color === 'blue' && "bg-blue-100 text-blue-700",
              post.category.color === 'green' && "bg-green-100 text-green-700",
              post.category.color === 'purple' && "bg-purple-100 text-purple-700",
              post.category.color === 'orange' && "bg-orange-100 text-orange-700",
              post.category.color === 'gold' && "bg-amber-100 text-amber-700",
              post.category.color === 'red' && "bg-red-100 text-red-700"
            )}
          >
            {post.category.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-navy-600" />
            </div>
            <div>
              <div className="text-sm text-navy-500">Author</div>
              <div className="font-medium text-navy-900">
                {post.author?.full_name || 'Veridian Team'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-navy-400" />
            <span className="text-navy-600">
              {format(new Date(post.published_at), 'MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-navy-400" />
            <span className="text-navy-600">{post.read_time} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-navy-400" />
            <span className="text-navy-600">{post.views} views</span>
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-navy-900
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
          prose-p:text-navy-700 prose-p:leading-relaxed prose-p:mb-6
          prose-strong:text-navy-900
          prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
          prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
          prose-li:my-2
          prose-blockquote:border-l-4 prose-blockquote:border-gold-500 prose-blockquote:bg-gold-50/50
          prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl
          prose-blockquote:italic prose-blockquote:text-navy-700
          prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg
          prose-pre:bg-navy-900 prose-pre:text-white prose-pre:p-6 prose-pre:rounded-xl
          prose-a:text-gold-600 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-gold-600" />
              <h3 className="font-semibold text-navy-900">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="px-4 py-2 bg-slate-100 text-navy-700 rounded-full text-sm hover:bg-gold-100 hover:text-gold-700 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="font-semibold text-navy-900 mb-4">Share this article</h3>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="p-3 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity">
              <Linkedin className="w-5 h-5" />
            </button>
            <button className="p-3 bg-[#4267B2] text-white rounded-lg hover:opacity-90 transition-opacity">
              <Facebook className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="text-2xl font-bold text-navy-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-gold-300 hover:shadow-lg transition-all">
                    <h3 className="font-semibold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="text-sm text-navy-600 mb-4 line-clamp-3">
                        {related.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-navy-500">
                        {format(new Date(related.published_at), 'MMM d, yyyy')}
                      </span>
                      <span className="text-gold-600 font-medium flex items-center gap-1">
                        Read
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}