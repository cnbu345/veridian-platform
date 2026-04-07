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
        {/* Mobile: Stack vertically, Desktop: 2 columns */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center lg:items-start">
          
          {/* Left Column - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left w-full"
          >
            {/* Live Viewer Counter - Mobile optimized */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 mb-6 border border-white/20 mx-auto lg:mx-0">
              <div className="relative">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping absolute" />
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full relative" />
              </div>
              <span className="text-xs text-white font-medium">
                {viewerCount} officers viewing
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Join the institutions that stopped guessing and started complying.
            </h2>

            <p className="text-base sm:text-lg text-navy-200 mb-6 leading-relaxed">
              Founder's Circle members receive their report within{' '}
              <span className="font-bold text-white bg-white/20 px-2 py-1 rounded-lg inline-block whitespace-nowrap">
                {timeLeft || '6m 0s'}
              </span>
            </p>

            {/* Trust Badges - Responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
                <Shield className="w-4 h-4 text-gold-400 mb-1 mx-auto" />
                <div className="text-xs font-semibold text-white">30-Day</div>
                <div className="text-[10px] text-navy-200">Guarantee</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
                <Clock className="w-4 h-4 text-gold-400 mb-1 mx-auto" />
                <div className="text-xs font-semibold text-white">Quarterly</div>
                <div className="text-[10px] text-navy-200">Updates</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
                <FileCheck className="w-4 h-4 text-gold-400 mb-1 mx-auto" />
                <div className="text-xs font-semibold text-white">Board-Ready</div>
                <div className="text-[10px] text-navy-200">Docs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
                <Scale className="w-4 h-4 text-gold-400 mb-1 mx-auto" />
                <div className="text-xs font-semibold text-white">Analyst</div>
                <div className="text-[10px] text-navy-200">Review</div>
              </div>
            </div>

            {/* CTA Buttons - Stack on mobile, row on tablet */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="default" className="bg-gold-500 hover:bg-gold-600 text-navy-900 group w-full sm:w-auto">
                <Link href="/generate" className="flex items-center justify-center text-sm">
                  Get Founder's Pricing ($997)
                  <Zap className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
              <Button size="default" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                <Link href="/consultation" className="flex items-center justify-center text-sm">
                  Schedule Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Social Proof Mini - Centered on mobile, left on desktop */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 border-2 border-white" />
                ))}
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
                ))}
              </div>
              <span className="text-xs text-navy-200">
                87+ officers
              </span>
            </div>
          </motion.div>

          {/* Right Column - Urgency Builder (Mobile optimized, no -top positioning) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <Badge variant="premium" className="px-2 py-0.5 text-xs">
                  Founder's Circle
                </Badge>
                <span className="text-xs text-slate-500">
                  First 50 customers
                </span>
              </div>

              {/* Pricing */}
              <div className="text-center mb-4">
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                  $997
                </div>
                <div className="text-sm sm:text-base text-slate-500 line-through">
                  $2,497
                </div>
                <div className="text-xs text-green-600 font-semibold mt-1">
                  You save $1,500 (60% off)
                </div>
              </div>

              {/* Spots Remaining Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Founder's spots remaining</span>
                  <span className="font-semibold text-slate-900">{spotsLeft} left</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full transition-all duration-500" 
                    style={{ width: `${(50 - spotsLeft) / 50 * 100}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Total: 50</span>
                  <span className="text-gold-600 font-semibold">{50 - spotsLeft} claimed</span>
                </div>
              </div>

              {/* Value Add Box */}
              <div className="bg-navy-50 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Landmark className="w-4 h-4 text-navy-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-navy-900">
                      Enterprise-grade intelligence
                    </div>
                    <div className="text-[10px] text-navy-700">
                      Includes 30-min consultation ($500 value)
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button size="default" variant="premium" className="w-full group mb-4">
                <Link href="/generate" className="flex items-center justify-center text-sm">
                  Claim Your Founder's Pricing
                  <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              {/* Security Badges - Horizontal scroll on mobile, wrap on tablet */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-500">
                <span className="whitespace-nowrap">🔒 SSL Encrypted</span>
                <span className="text-slate-300 hidden xs:inline">•</span>
                <span className="whitespace-nowrap">30-Day Guarantee</span>
                <span className="text-slate-300 hidden xs:inline">•</span>
                <span className="whitespace-nowrap">24-Hour Delivery</span>
              </div>

              {/* Urgency Message - Now visible on ALL devices (no longer hidden) */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-amber-600 font-medium">
                  💡 Founder's pricing ends at 50 customers. <span className="font-bold">{spotsLeft} spots remain.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}