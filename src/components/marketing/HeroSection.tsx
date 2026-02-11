'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Shield, TrendingUp, Map, Users, Download, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

export default function HeroSection() {
  const [cityInput, setCityInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const cities = ['Austin, TX', 'Miami, FL', 'New York, NY', 'San Francisco, CA']
  const [currentCityIndex, setCurrentCityIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCityIndex((prev) => (prev + 1) % cities.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-20 pb-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <Badge variant="trust" className="px-4 py-2 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Trusted by Fortune 500 Strategy Teams
          </Badge>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Your Custom Web3 Strategy Report.
              <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent block mt-2">
                Analyzed By AI. Validated By Humans.
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              The only location-intelligent Web3 report that maps state regulations, 
              talent density, and adoption patterns to your{' '}
              <span className="font-semibold text-blue-600 border-b-2 border-blue-200">
                specific city and industry
              </span>.
            </p>

            {/* Location Demo */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                <Map className="w-4 h-4 text-blue-600" />
                <span>See real-time analysis for</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-12 px-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center text-slate-700 font-medium">
                  {cities[currentCityIndex]}
                </div>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Analyze <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-amber-500 border-2 border-white" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">
                  <span className="font-semibold">847 executives</span> have transformed their strategy
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="xl" variant="premium" className="group" >
                <Link href="/generate">
                  Get Your $497 Report
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="border-2" >
                <Link href="/sample">
                  View Sample Report (Free)
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  <CountUp end={50} suffix="+" delay={0.5} /> 
                </div>
                <div className="text-sm text-slate-600">States Mapped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  <CountUp end={15} suffix="+" delay={0.5} />
                </div>
                <div className="text-sm text-slate-600">Data Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  <CountUp end={60} suffix="m" delay={0.5} />
                </div>
                <div className="text-sm text-slate-600">Delivery Time</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
              {/* Dashboard Mockup */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-2xl opacity-30" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-2xl opacity-30" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm text-slate-500">Location Intelligence Report</div>
                    <div className="text-2xl font-bold text-slate-900">Austin, TX</div>
                  </div>
                  <Badge variant="premium" className="px-3 py-1">
                    Web3 Adoption Score
                  </Badge>
                </div>

                {/* Score Circle */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-8 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-8 border-t-blue-600 border-r-amber-500 border-b-transparent border-l-transparent rotate-45"
                         style={{ transform: 'rotate(45deg)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-slate-900">94</span>
                      <span className="text-lg text-slate-500 mt-2">/100</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">Regulatory Score</div>
                    <div className="text-lg font-semibold text-slate-900">92/100</div>
                    <div className="text-xs text-green-600">+12% vs national</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">Talent Density</div>
                    <div className="text-lg font-semibold text-slate-900">87/100</div>
                    <div className="text-xs text-green-600">Top 10 market</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">Investment Activity</div>
                    <div className="text-lg font-semibold text-slate-900">$847M</div>
                    <div className="text-xs text-green-600">YTD 2024</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500">Competitors</div>
                    <div className="text-lg font-semibold text-slate-900">23</div>
                    <div className="text-xs text-amber-600">+5 this quarter</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Human-Validated</div>
                  <div className="text-xs text-slate-500">Strategy team review</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}