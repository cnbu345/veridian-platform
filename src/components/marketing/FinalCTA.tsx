// src/components/marketing/FinalCTA.tsx
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Shield, Clock, Zap, FileCheck, Star, Scale, Landmark } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function FinalCTA() {
  const [viewerCount, setViewerCount] = useState(12)
  const [timeLeft, setTimeLeft] = useState('')
  const [spotsLeft, setSpotsLeft] = useState(38)

  useEffect(() => {
    // Simulate changing viewer count
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(8, Math.min(23, prev + Math.floor(Math.random() * 3) - 1)))
    }, 5000)

    // Simulate time until next report
    const timer = setInterval(() => {
      const now = new Date()
      const nextReport = new Date(now.getTime() + 1000 * 60 * 6) // 6 minutes
      const diff = nextReport.getTime() - now.getTime()
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${minutes}m ${seconds}s`)
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timer)
    }
  }, [])

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Left Column - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            {/* Live Viewer Counter */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8 border border-white/20">
              <div className="relative">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-ping absolute" />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full relative" />
              </div>
              <span className="text-xs sm:text-sm text-white font-medium">
                {viewerCount} compliance officers viewing
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Join the institutions that stopped guessing and started complying.
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-navy-200 mb-6 sm:mb-8 leading-relaxed">
              Founder's Circle members receive their report within {' '}
              <span className="font-bold text-white bg-white/20 px-2 sm:px-3 py-1 rounded-lg inline-flex items-center whitespace-nowrap">
                {timeLeft || '6m 0s'}
              </span>{' '}
              of ordering.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 mb-1 sm:mb-2 mx-auto" />
                <div className="text-xs sm:text-sm font-semibold text-white">30-Day</div>
                <div className="text-[10px] sm:text-xs text-navy-200">Guarantee</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 mb-1 sm:mb-2 mx-auto" />
                <div className="text-xs sm:text-sm font-semibold text-white">Quarterly</div>
                <div className="text-[10px] sm:text-xs text-navy-200">Updates</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 mb-1 sm:mb-2 mx-auto" />
                <div className="text-xs sm:text-sm font-semibold text-white">Board-Ready</div>
                <div className="text-[10px] sm:text-xs text-navy-200">Docs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 mb-1 sm:mb-2 mx-auto" />
                <div className="text-xs sm:text-sm font-semibold text-white">Analyst</div>
                <div className="text-[10px] sm:text-xs text-navy-200">Review</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
              <Button size="xl" className="bg-gold-500 hover:bg-gold-600 text-navy-900 group w-full sm:w-auto">
                <Link href="/generate" className="flex items-center justify-center text-sm sm:text-base">
                  Get Founder's Pricing ($997)
                  <Zap className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                <Link href="/consultation" className="flex items-center justify-center text-sm sm:text-base">
                  Schedule Review
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>

            {/* Social Proof Mini */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 border-2 border-white" />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-navy-200">
                87+ officers
              </span>
            </div>
          </motion.div>

         {/* Right Column - Urgency Builder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative lg:mt-0 -top-12 sm:mt-10"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 relative pb-12 sm:pb-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <Badge variant="premium" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  Founder's Circle
                </Badge>
                <span className="text-xs sm:text-sm text-slate-500">
                  First 50 customers
                </span>
              </div>

              <div className="text-center mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">
                  $997
                </div>
                <div className="text-base sm:text-lg text-slate-500 line-through">
                  $2,497
                </div>
                <div className="text-xs sm:text-sm text-green-600 font-semibold mt-2">
                  You save $1,500 (60% off)
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Founder's spots remaining</span>
                  <span className="font-semibold text-slate-900">{spotsLeft} left</span>
                </div>
                <div className="h-2 sm:h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full" 
                      style={{ width: `${(50 - spotsLeft) / 50 * 100}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-slate-500">Total: 50</span>
                  <span className="text-gold-600 font-semibold">{50 - spotsLeft} claimed</span>
                </div>
              </div>

              <div className="bg-navy-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-navy-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-semibold text-navy-900 truncate">
                      Enterprise-grade intelligence
                    </div>
                    <div className="text-[10px] sm:text-xs text-navy-700">
                      Includes 30-min consultation ($500 value)
                    </div>
                  </div>
                </div>
              </div>

              <Button size="lg" variant="premium" className="w-full group">
                <Link href="/generate" className="flex items-center justify-center text-sm sm:text-base">
                  Claim Your Founder's Pricing
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <p className="text-[10px] sm:text-xs text-center text-slate-500 mt-4 flex flex-wrap items-center justify-center gap-1">
                <span className="whitespace-nowrap">🔒 SSL Encrypted</span>
                <span className="hidden xs:inline">•</span>
                <span className="whitespace-nowrap">30-Day Guarantee</span>
                <span className="hidden xs:inline">•</span>
                <span className="whitespace-nowrap">24-Hour Delivery</span>
              </p>

              {/* Exit Intent Trigger - Hidden on mobile, shown on tablet and up */}
              <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-full max-w-sm" 
                  style={{ bottom: '-20px' }}>
                <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 border border-slate-200 text-center text-[10px] sm:text-xs text-slate-600">
                  💡 Founder's pricing ends at 50 customers. <span className="font-semibold">{spotsLeft} spots remain.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}