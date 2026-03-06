// src/app/support/article/[slug]/not-found.tsx
import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-white rounded-xl border border-slate-200 p-12">
          <FileQuestion className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Article Not Found</h1>
          <p className="text-navy-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/support/kb"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
          >
            Browse Knowledge Base
          </Link>
        </div>
      </div>
    </div>
  )
}