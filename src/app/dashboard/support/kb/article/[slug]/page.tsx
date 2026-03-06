// src/app/dashboard/support/kb/article/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Calendar, Eye, Tag, Clock, Share2, 
  Bookmark, ThumbsUp, MessageCircle, ChevronRight,
  Home, FileText, Star, Sparkles, BookOpen
} from 'lucide-react'
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

  // Fetch related articles (same category)
  const { data: relatedArticles } = await supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt, views')
    .eq('category_id', article.category_id)
    .eq('is_published', true)
    .neq('id', article.id)
    .limit(3)

  // Calculate reading time
  const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Refined Navigation Bar - More Elegant */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Elegant Breadcrumb */}
            <nav className="flex items-center text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link 
                    href="/dashboard/support/kb" 
                    className="text-navy-500 hover:text-gold-600 transition-colors flex items-center gap-1.5 group"
                  >
                    <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline font-medium">Knowledge Base</span>
                  </Link>
                </li>
                {article.category && (
                  <>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 text-navy-300" />
                    </li>
                    <li>
                      <Link
                        href={`/dashboard/support/kb/category/${article.category.slug}`}
                        className="text-navy-500 hover:text-gold-600 transition-colors font-medium"
                      >
                        {article.category.name}
                      </Link>
                    </li>
                  </>
                )}
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-navy-300" />
                </li>
                <li className="text-navy-900 font-medium truncate max-w-[200px] sm:max-w-xs">
                  {article.title}
                </li>
              </ol>
            </nav>

            {/* Back Button - Subtle Alternative */}
            <Link
              href="/dashboard/support/kb"
              className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-gold-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to KB</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section - More Refined */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          {/* Category & Featured Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {article.category && (
              <Link
                href={`/dashboard/support/kb/category/${article.category.slug}`}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gold-500 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                <span className="relative px-4 py-1.5 bg-gold-500/10 text-gold-400 rounded-full text-sm font-medium border border-gold-500/20 group-hover:bg-gold-500/20 transition-colors">
                  {article.category.name}
                </span>
              </Link>
            )}
            {article.is_featured && (
              <span className="px-4 py-1.5 bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-lg shadow-gold-500/20">
                <Star className="w-4 h-4 fill-current" />
                Featured Article
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Excerpt - More Elegant */}
          {article.excerpt && (
            <div className="relative mb-10">
              <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gold-500 rounded-full" />
              <p className="text-xl text-navy-200 pl-6 italic leading-relaxed">
                {article.excerpt}
              </p>
            </div>
          )}

          {/* Article Metrics - More Refined */}
          <div className="flex flex-wrap items-center gap-8 text-navy-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="text-xs text-navy-400 uppercase tracking-wider">Updated</div>
                <div className="text-sm font-medium">{format(new Date(article.updated_at), 'MMMM d, yyyy')}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Eye className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="text-xs text-navy-400 uppercase tracking-wider">Views</div>
                <div className="text-sm font-medium">{article.views || 0}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="text-xs text-navy-400 uppercase tracking-wider">Reading time</div>
                <div className="text-sm font-medium">{readingTime} min</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Article Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Content */}
          <div className="p-8 sm:p-12">
            <div 
              className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-navy-900
                prose-h1:text-4xl prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b prose-h1:border-gold-500/20
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-navy-700 prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-navy-900 prose-strong:font-semibold
                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
                prose-li:text-navy-700
                prose-blockquote:border-l-4 prose-blockquote:border-gold-500 prose-blockquote:bg-gold-50/50
                prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-6 prose-blockquote:rounded-r-xl
                prose-blockquote:text-navy-700 prose-blockquote:italic
                prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:text-sm prose-code:font-mono
                prose-pre:bg-navy-900 prose-pre:text-white prose-pre:p-6 prose-pre:rounded-xl prose-pre:my-6
                prose-pre:overflow-x-auto
                prose-a:text-gold-600 prose-a:no-underline hover:prose-a:text-gold-700 hover:prose-a:underline
                prose-table:w-full prose-table:my-8 prose-table:border-collapse
                prose-th:bg-navy-50 prose-th:p-4 prose-th:text-left prose-th:font-semibold prose-th:text-navy-900 prose-th:border-b-2 prose-th:border-navy-200
                prose-td:p-4 prose-td:border-b prose-td:border-slate-200
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8 prose-img:max-w-full prose-img:h-auto prose-img:mx-auto"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Tags Section - More Refined */}
          {article.tags && article.tags.length > 0 && (
            <div className="px-8 sm:px-12 pb-8 border-t border-slate-200 pt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gold-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-3 h-3 text-gold-600" />
                </div>
                <h3 className="font-semibold text-navy-900">Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/dashboard/support/kb/tag/${tag}`}
                    className="px-4 py-2 bg-slate-100 text-navy-700 rounded-full text-sm hover:bg-gold-100 hover:text-gold-700 hover:shadow-md transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Article Actions - More Refined */}
          <div className="px-8 sm:px-12 py-6 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-gold-50 hover:border-gold-300 hover:shadow-md transition-all group">
                  <ThumbsUp className="w-4 h-4 text-navy-400 group-hover:text-gold-600" />
                  <span className="text-sm font-medium text-navy-700 group-hover:text-gold-700">Helpful</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-gold-50 hover:border-gold-300 hover:shadow-md transition-all group">
                  <MessageCircle className="w-4 h-4 text-navy-400 group-hover:text-gold-600" />
                  <span className="text-sm font-medium text-navy-700 group-hover:text-gold-700">Feedback</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-gold-50 hover:border-gold-300 hover:shadow-md transition-all group">
                  <Bookmark className="w-4 h-4 text-navy-400 group-hover:text-gold-600" />
                </button>
                <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-gold-50 hover:border-gold-300 hover:shadow-md transition-all group">
                  <Share2 className="w-4 h-4 text-navy-400 group-hover:text-gold-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles - More Elegant */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-gold-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gold-600" />
              </div>
              <span>You might also like</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related, index) => (
                <Link
                  key={related.id}
                  href={`/dashboard/support/kb/article/${related.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-gold-300 hover:shadow-xl transition-all h-full flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-sm text-navy-600 line-clamp-3 mb-4">
                          {related.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs text-navy-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {related.views || 0} views
                      </span>
                      <span className="text-sm text-gold-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}