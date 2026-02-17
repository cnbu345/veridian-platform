// src/app/dashboard/components/EmptyState.tsx
'use client'

import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, ArrowRight, Sparkles } from 'lucide-react'

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white",
        "rounded-2xl",
        "border border-slate-200",
        "shadow-soft",
        "p-12",
        "text-center"
      )}
    >
      <div className={cn("max-w-md", "mx-auto")}>
        <div className={cn("relative", "inline-block", "mb-6")}>
          <div className={cn(
            "w-20 h-20",
            "bg-gradient-to-br from-gold-500/20 to-gold-600/20",
            "rounded-3xl",
            "flex items-center justify-center"
          )}>
            <FileText className={cn("w-8 h-8", "text-gold-600")} />
          </div>
          <div className={cn(
            "absolute",
            "-bottom-2",
            "-right-2",
            "w-8 h-8",
            "bg-navy-900",
            "rounded-full",
            "flex items-center justify-center"
          )}>
            <Sparkles className={cn("w-4 h-4", "text-gold-500")} />
          </div>
        </div>

        <h2 className={cn(
          "text-2xl",
          "font-display",
          "font-bold",
          "text-navy-900",
          "mb-3"
        )}>
          No reports yet
        </h2>
        
        <p className={cn(
          "text-navy-600",
          "mb-8"
        )}>
          Generate your first regulatory intelligence report to get started with compliance analysis.
        </p>

        <Link
          href="/generate"
          className={cn(
            "inline-flex",
            "items-center",
            "justify-center",
            "px-8 py-4",
            "bg-gradient-to-r from-gold-600 to-gold-500",
            "text-white",
            "font-semibold",
            "rounded-xl",
            "hover:from-gold-500 hover:to-gold-400",
            "transition-all",
            "duration-300",
            "hover:scale-105",
            "shadow-lg",
            "shadow-gold-500/25",
            "group"
          )}
        >
          Generate Your First Report
          <ArrowRight className={cn(
            "w-5 h-5",
            "ml-2",
            "group-hover:translate-x-1",
            "transition-transform"
          )} />
        </Link>
      </div>
    </motion.div>
  )
}