// src/app/blog/category/[slug]/not-found.tsx
import Link from 'next/link'
import { FolderX, Home, BookOpen } from 'lucide-react'

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12">
          <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FolderX className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-navy-900 mb-3">Category Not Found</h1>
          <p className="text-lg text-navy-600 mb-8 max-w-md mx-auto">
            The blog category you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 text-white rounded-xl hover:bg-gold-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Browse All Articles
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-navy-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}