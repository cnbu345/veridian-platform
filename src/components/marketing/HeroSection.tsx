// src/components/marketing/HeroSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Shield, TrendingUp, Map, Users, Download, CheckCircle, Scale, Landmark } from 'lucide-react'
import Link from 'next/link'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import { cn } from '../../lib/utils/utils'

export default function HeroSection() {
  const [cityInput, setCityInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const cities = ['Regional Bank - Midwest', 'Law Firm - New York', 'Credit Union - Texas', 'Investment Fund - Delaware']
  const [currentCityIndex, setCurrentCityIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCityIndex((prev) => (prev + 1) % cities.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-navy-50 pt-16 md:pt-20 pb-16 md:pb-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center pt-5 mb-6 md:mb-8"
        >
          <Badge variant="trust" className={cn("px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm")}>
            <Scale className={cn("w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2")} />
            Trusted by Compliance Officers at Regional Banks
          </Badge>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Copy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <h1 className={cn(
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
              "font-bold tracking-tight text-slate-900",
              "mb-4 md:mb-6 leading-tight"
            )}>
              Regulatory Intelligence for Digital Assets.
              <span className={cn(
                "bg-gradient-to-r from-navy-600 to-gold-600",
                "bg-clip-text text-transparent block",
                "mt-1 md:mt-2"
              )}>
                State-by-State. Institution-Grade.
              </span>
            </h1>
            
            <p className={cn(
              "text-base md:text-lg lg:text-xl",
              "text-slate-600 mb-6 md:mb-8",
              "leading-relaxed"
            )}>
              Know exactly where and how to operate in the tokenized economy. 
              Our location-intelligent reports map regulations, compliance requirements, 
              and risk exposure for{' '}
              <span className="font-semibold text-navy-600 border-b-2 border-navy-200">
                banks, law firms, and institutional decision-makers
              </span>.
            </p>

            {/* Location Demo - Mobile optimized */}
            <div className={cn(
              "bg-white p-3 md:p-4 rounded-xl shadow-lg border border-slate-200",
              "mb-6 md:mb-8"
            )}>
              <div className={cn(
                "flex items-center gap-2 md:gap-3",
                "text-xs md:text-sm text-slate-600 mb-2"
              )}>
                <Landmark className={cn("w-3 h-3 md:w-4 md:h-4 text-navy-600")} />
                <span>See compliance analysis for</span>
              </div>
              <div className={cn(
                "flex flex-col sm:flex-row",
                "items-stretch sm:items-center",
                "gap-2 md:gap-3"
              )}>
                <div className={cn(
                  "flex-1 h-10 md:h-12 px-3 md:px-4",
                  "bg-slate-50 rounded-lg border border-slate-200",
                  "flex items-center text-xs md:text-sm",
                  "text-slate-700 font-medium truncate"
                )}>
                  {cities[currentCityIndex]}
                </div>
                <Link href="/generate" className="w-full sm:w-auto">
                  <Button 
                    size="default" 
                    className={cn(
                      "w-full sm:w-auto",
                      "bg-navy-700 hover:bg-navy-800",
                      "text-gold-500 text-sm md:text-base"
                    )}
                  >
                    Analyze <ArrowRight className={cn("ml-2 h-3 w-3 md:h-4 md:w-4")} />
                  </Button>
                </Link>
              </div>
              <div className="mt-2 md:mt-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-5 h-5 md:w-6 md:h-6",
                        "rounded-full bg-gradient-to-r from-navy-500 to-gold-500",
                        "border-2 border-white"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-xs md:text-sm text-slate-600">
                  <span className="font-semibold">47 compliance officers</span> from regional banks
                </span>
              </div>
            </div>

            {/* CTA Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
              <Button 
                size="default" 
                className={cn(
                  "w-full sm:flex-1",
                  "bg-gold-500 hover:bg-gold-600",
                  "text-white group"
                )}
              >
                <Link href="/generate" className="flex items-center justify-center">
                  Get Your $997 Report 
                  <span className="text-xs ml-2 line-through opacity-50">$2,497</span>
                  <ArrowRight className={cn(
                    "ml-2 h-4 w-4 md:h-5 md:w-5",
                    "group-hover:translate-x-1 transition-transform"
                  )} />
                </Link>
              </Button>
              <Button 
                size="default" 
                variant="outline" 
                className="w-full sm:flex-1 border-2"
              >
                <Link href="/sample" className="flex items-center justify-center">
                  View Sample Compliance Report
                </Link>
              </Button>
            </div>

            {/* Trust Indicators - 3 column grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 pt-4 border-t border-slate-200">
              <div className="text-center">
                <div className={cn(
                  "text-lg md:text-2xl lg:text-3xl",
                  "font-bold text-slate-900"
                )}>
                  <CountUp end={50} suffix="+" delay={0.5} /> 
                </div>
                <div className="text-xs md:text-sm text-slate-600">States Mapped</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-lg md:text-2xl lg:text-3xl",
                  "font-bold text-slate-900"
                )}>
                  <CountUp end={340} suffix="+" delay={0.5} />
                </div>
                <div className="text-xs md:text-sm text-slate-600">Regulations Tracked</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-lg md:text-2xl lg:text-3xl",
                  "font-bold text-slate-900"
                )}>
                  <CountUp end={24} suffix="h" delay={0.5} />
                </div>
                <div className="text-xs md:text-sm text-slate-600">Delivery Time</div>
              </div>
            </div>
            
            {/* Value Anchor */}
            <p className="text-[10px] md:text-xs text-slate-500 mt-3 md:mt-4">
              🔒 Founder's Circle pricing: 60% off for first 50 customers. Regular price $2,497.
            </p>
          </motion.div>

          {/* Right Column - Visual - Hide on small mobile, show on larger screens */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={cn(
              "relative order-1 lg:order-2",
              "hidden md:block"
            )}
          >
            <div className={cn(
              "relative bg-white rounded-2xl shadow-2xl border border-slate-200",
              "p-4 md:p-6"
            )}>
              {/* Dashboard Mockup */}
              <div className={cn(
                "absolute -top-4 -left-4",
                "w-16 h-16 md:w-20 md:h-20",
                "bg-gradient-to-r from-gold-400 to-gold-500",
                "rounded-full blur-2xl opacity-30"
              )} />
              <div className={cn(
                "absolute -bottom-4 -right-4",
                "w-24 h-24 md:w-32 md:h-32",
                "bg-gradient-to-r from-navy-400 to-indigo-500",
                "rounded-full blur-2xl opacity-30"
              )} />
              
              <div className="relative">
                <div className={cn(
                  "flex flex-col sm:flex-row sm:items-center",
                  "justify-between gap-2 mb-4 md:mb-6"
                )}>
                  <div>
                    <div className="text-xs md:text-sm text-slate-500">
                      Regulatory Intelligence Report
                    </div>
                    <div className={cn(
                      "text-lg md:text-2xl",
                      "font-bold text-slate-900"
                    )}>
                      Regional Bank - Midwest
                    </div>
                  </div>
                  <Badge 
                    variant="premium" 
                    className={cn(
                      "px-2 md:px-3 py-0.5 md:py-1",
                      "self-start sm:self-auto"
                    )}
                  >
                    Compliance Score
                  </Badge>
                </div>

                {/* Score Circle */}
                <div className="flex justify-center mb-4 md:mb-6">
                  <div className="relative w-24 h-24 md:w-32 md:h-32">
                    <div className={cn(
                      "absolute inset-0 rounded-full",
                      "border-4 md:border-8 border-slate-100"
                    )} />
                    <div className={cn(
                      "absolute inset-0 rounded-full",
                      "border-4 md:border-8",
                      "border-t-navy-600 border-r-gold-500",
                      "border-b-transparent border-l-transparent",
                      "rotate-45"
                    )} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl md:text-3xl font-bold text-slate-900">94</span>
                      <span className={cn(
                        "text-sm md:text-lg",
                        "text-slate-500 mt-1 md:mt-2"
                      )}>/100</span>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="bg-slate-50 p-2 md:p-3 rounded-lg">
                    <div className="text-[10px] md:text-xs text-slate-500">Regulatory Risk</div>
                    <div className={cn(
                      "text-sm md:text-lg",
                      "font-semibold text-slate-900"
                    )}>Low</div>
                    <div className="text-[8px] md:text-xs text-green-600">12 states analyzed</div>
                  </div>
                  <div className="bg-slate-50 p-2 md:p-3 rounded-lg">
                    <div className="text-[10px] md:text-xs text-slate-500">Licenses Required</div>
                    <div className={cn(
                      "text-sm md:text-lg",
                      "font-semibold text-slate-900"
                    )}>3</div>
                    <div className="text-[8px] md:text-xs text-amber-600">MTL, Lender, Broker</div>
                  </div>
                  <div className="bg-slate-50 p-2 md:p-3 rounded-lg">
                    <div className="text-[10px] md:text-xs text-slate-500">Compliance Cost</div>
                    <div className={cn(
                      "text-sm md:text-lg",
                      "font-semibold text-slate-900"
                    )}>$47K</div>
                    <div className="text-[8px] md:text-xs text-green-600">Est. annual</div>
                  </div>
                  <div className="bg-slate-50 p-2 md:p-3 rounded-lg">
                    <div className="text-[10px] md:text-xs text-slate-500">Action Items</div>
                    <div className={cn(
                      "text-sm md:text-lg",
                      "font-semibold text-slate-900"
                    )}>23</div>
                    <div className="text-[8px] md:text-xs text-blue-600">90-day plan</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}