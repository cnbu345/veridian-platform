// src/app/dashboard/components/EmptyState.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  ArrowRight,
  Map,
  Shield,
  TrendingUp,
  Scale,
  Landmark,
  Gavel
} from 'lucide-react'

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gold-500/20 to-gold-600/20 
                        rounded-3xl flex items-center justify-center">
            <Scale className="w-10 h-10 text-gold-600" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-navy-900 
                        rounded-full flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-display font-bold text-navy-900 mb-3">
          No compliance reports yet
        </h2>
        
        <p className="text-navy-600 mb-8">
          Generate your first regulatory intelligence report and get state-specific 
          compliance analysis for your institution in 24 hours.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-10 h-10 bg-navy-50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Scale className="w-5 h-5 text-navy-600" />
            </div>
            <span className="text-xs font-medium text-navy-700">Regulatory</span>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Landmark className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-navy-700">Compliance</span>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Gavel className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-navy-700">Licensing</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/generate"
          className="inline-flex items-center justify-center px-8 py-4 
                   bg-gradient-to-r from-gold-600 to-gold-500 
                   text-white font-semibold rounded-xl
                   hover:from-gold-500 hover:to-gold-400 
                   transition-all duration-300 hover:scale-105 
                   shadow-lg shadow-gold-500/25 group"
        >
          Generate Your First Report
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="text-xs text-navy-400 mt-4">
          Takes less than 5 minutes • Purchase order accepted
        </p>
      </div>
    </motion.div>
  )
}