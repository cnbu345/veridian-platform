'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Shield, Clock, Zap, FileCheck, Users, Star } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function FinalCTA() {
  const [viewerCount, setViewerCount] = useState(32)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    // Simulate changing viewer count
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(28, Math.min(47, prev + Math.floor(Math.random() * 3) - 1)))
    }, 5000)

    // Simulate time until next report
    const timer = setInterval(() => {
      const now = new Date()
      const nextReport = new Date(now.getTime() + 1000 * 60 * 4) // 4 minutes
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
    <section className="relative overflow-hidden py-24">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Live Viewer Counter */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute" />
                <div className="w-2 h-2 bg-green-400 rounded-full relative" />
              </div>
              <span className="text-sm text-white font-medium">
                {viewerCount} executives viewing this page
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Join the executives who stopped waiting and started building.
            </h2>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Most clients receive their report within{' '}
              <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">
                {timeLeft || '4m 0s'}
              </span>{' '}
              of ordering.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <Shield className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-sm font-semibold text-white">30-Day</div>
                <div className="text-xs text-blue-200">Money-Back</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <Clock className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-sm font-semibold text-white">60-Day</div>
                <div className="text-xs text-blue-200">Free Updates</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <FileCheck className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-sm font-semibold text-white">Enterprise</div>
                <div className="text-xs text-blue-200">Grade Security</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <Users className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-sm font-semibold text-white">Strategy Call</div>
                <div className="text-xs text-blue-200">Included</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" className="bg-amber-400 hover:bg-amber-500 text-slate-900 group w-full sm:w-auto" >
                <Link href="/generate">
                  Generate Your Report ($497)
                  <Zap className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto" >
                <Link href="/consultation">
                  Schedule Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Social Proof Mini */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 border-2 border-white" />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-blue-100">
                from 342+ verified reviews
              </span>
            </div>
          </motion.div>

          {/* Right Column - Urgency Builder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="premium" className="px-3 py-1">
                  Early Adopter Pricing
                </Badge>
                <span className="text-sm text-slate-500">
                  Ends Q1 2024
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  $497
                </div>
                <div className="text-lg text-slate-500 line-through">
                  $847
                </div>
                <div className="text-sm text-green-600 font-semibold mt-2">
                  You save $350
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Reports available this month</span>
                  <span className="font-semibold text-slate-900">10 remaining</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Monthly limit: 40 reports</span>
                  <span className="text-amber-600 font-semibold">30 sold</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-amber-900">
                      Complimentary add-on
                    </div>
                    <div className="text-xs text-amber-700">
                      State regulatory guide ($199 value) - included free
                    </div>
                  </div>
                </div>
              </div>

              <Button size="lg" variant="premium" className="w-full group" >
                <Link href="/generate">
                  Claim Your Report
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <p className="text-xs text-center text-slate-500 mt-4">
                🔒 SSL Encrypted • 30-Day Guarantee • Instant Access
              </p>
            </div>

            {/* Exit Intent Trigger (will be implemented with JS later) */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm">
              <div className="bg-white rounded-lg shadow-lg p-3 border border-slate-200 text-center text-sm text-slate-600">
                💡 Wait! Get your state regulations guide for <span className="font-bold text-green-600">$0</span> when you purchase today
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}