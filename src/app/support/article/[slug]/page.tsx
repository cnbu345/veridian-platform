// src/app/support/article/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Eye, Tag } from 'lucide-react'
import { format } from 'date-fns'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const supabase = await createClient()
  
  // Fetch the article
  const { data: article, error } = await supabase
    .from('kb_articles')
    .select(`
      *,
      category:kb_categories(name, slug)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !article) {
    notFound()
  }

  // Increment view count
  await supabase
    .from('kb_articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id)

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <Link
          href="/support/kb"
          className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Knowledge Base
        </Link>

        {/* Article Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {article.category && (
              <Link
                href={`/support/kb/category/${article.category.slug}`}
                className="px-3 py-1 bg-navy-100 text-navy-700 rounded-full text-sm hover:bg-navy-200 transition-colors"
              >
                {article.category.name}
              </Link>
            )}
            {article.is_featured && (
              <span className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-navy-600 mb-6 border-l-4 border-gold-500 pl-4">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-navy-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Updated {format(new Date(article.updated_at), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{article.views || 0} views</span>
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <div className="flex gap-2">
                  {article.tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div 
            className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-gold-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Feedback Section */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Was this article helpful?</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                Yes, it helped
              </button>
              <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                No, I need more
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles (optional) */}
        <div className="mt-8">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700 font-medium"
          >
            Browse all articles
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  )
}