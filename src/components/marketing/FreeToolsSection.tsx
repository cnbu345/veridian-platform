// src/components/marketing/FreeToolsSection.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, GitCompare, ArrowRight, Sparkles, CheckCircle } from 'lucide-react'

export default function FreeToolsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-green-50 rounded-full px-2.5 sm:px-3 py-1 text-xs sm:text-sm text-green-700 mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">Free Tools • No Credit Card Required</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-3 sm:mb-4 px-2">
            Start Your Compliance Research
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Explore our free regulatory intelligence tools. No signup required.
          </p>
        </motion.div>

        {/* Two Column Layout - Stacks on mobile */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
          
          {/* Tool 1: State Dashboard - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative bg-gradient-to-br from-blue-50 to-white rounded-xl sm:rounded-2xl border border-blue-100 p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Free Badge - Mobile friendly */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                Free
              </span>
            </div>
            
            {/* Icon - Responsive sizing */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 md:mb-5">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600" />
            </div>
            
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-navy-900 mb-1 sm:mb-2">
              State Licensing Dashboard
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
              Interactive map showing regulatory climate for all 50 states. Click any state for detailed licensing requirements, tax treatment, and regulator contacts.
            </p>
            
            {/* Feature list - Responsive */}
            <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 md:mb-6">
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Color-coded by climate (Friendly/Moderate/Strict)</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                <span>License requirements & descriptions</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Direct links to state regulators</span>
              </li>
            </ul>
            
            {/* CTA Link - Touch friendly */}
            <Link
              href="/state-requirements"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-gold-600 font-semibold text-sm sm:text-base group-hover:gap-2 sm:group-hover:gap-3 transition-all"
            >
              Explore Interactive Map
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Tool 2: Comparison Tool - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative bg-gradient-to-br from-purple-50 to-white rounded-xl sm:rounded-2xl border border-purple-100 p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Free Badge - Mobile friendly */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                Free
              </span>
            </div>
            
            {/* Icon - Responsive sizing */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 md:mb-5">
              <GitCompare className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600" />
            </div>
            
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-navy-900 mb-1 sm:mb-2">
              State Comparison Tool
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
              Compare up to 3 states side-by-side. See licensing requirements, tax treatment, and regulatory climate in one view.
            </p>
            
            {/* Feature list - Responsive */}
            <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 md:mb-6">
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Side-by-side comparison table</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                <span>License requirements & fees</span>
              </li>
              <li className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                <span>AI-powered recommendation</span>
              </li>
            </ul>
            
            {/* CTA Link - Touch friendly */}
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-gold-600 font-semibold text-sm sm:text-base group-hover:gap-2 sm:group-hover:gap-3 transition-all"
            >
              Compare States Now
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Bottom CTA - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 sm:mt-10 md:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-100"
        >
          <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-3">
            Need a comprehensive compliance report with attorney verification?
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-gold-600 font-semibold text-sm sm:text-base hover:text-gold-700 transition-colors"
          >
            View Pricing Plans
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}