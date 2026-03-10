// src/app/admin/blog/preview/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, User, Clock, Eye, Tag, ArrowLeft,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/utils'

export default async function PreviewBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Unauthorized</h1>
          <p className="text-navy-600 mb-6">You must be logged in to preview drafts.</p>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Forbidden</h1>
          <p className="text-navy-600 mb-6">You don't have permission to preview drafts.</p>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  // Fetch the post (any status allowed for preview)
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(full_name, email),
      category:blog_categories(name, slug, color)
    `)
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Draft Warning Banner */}
      <div className="bg-amber-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">You are previewing a draft. This post is not published.</span>
          </div>
          <Link
            href={`/admin/blog/${post.id}/edit`}
            className="px-4 py-1.5 bg-white text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
          >
            Edit Post
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/blog"
              className="flex items-center gap-2 text-navy-600 hover:text-gold-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Category */}
        {post.category && (
          <span
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
          </span>
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
              {post.created_at ? format(new Date(post.created_at), 'MMMM d, yyyy') : 'Not published'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-navy-400" />
            <span className="text-navy-600">{post.read_time || 5} min read</span>
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
                <span
                  key={tag}
                  className="px-4 py-2 bg-slate-100 text-navy-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}