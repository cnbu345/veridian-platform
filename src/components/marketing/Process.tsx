// src/components/marketing/Process.tsx
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Map, Brain, Users, FileText, CheckCircle, Scale, Landmark, Shield } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const steps = [
  {
    icon: Map,
    title: "Enter Your Jurisdiction",
    description: "Your institution's operating states trigger our regulatory intelligence engine. We analyze 50+ compliance data points per state.",
    color: "from-navy-500 to-navy-600",
    lightColor: "bg-navy-50"
  },
  {
    icon: Brain,
    title: "AI Regulatory Analysis",
    description: "Our proprietary AI maps state regulations, license requirements, enforcement history, and upcoming legislative changes.",
    color: "from-purple-500 to-purple-600",
    lightColor: "bg-purple-50"
  },
  {
    icon: Scale,
    title: "Compliance Review",
    description: "A regulatory analyst reviews findings, adds context, and flags jurisdiction-specific nuances.",
    color: "from-gold-500 to-gold-600",
    lightColor: "bg-gold-50"
  },
  {
    icon: FileText,
    title: "Your Compliance Report",
    description: "Receive a comprehensive PDF with your regulatory roadmap, ready for board review and compliance documentation.",
    color: "from-green-500 to-green-600",
    lightColor: "bg-green-50"
  }
]

export default function Process() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-navy-600 bg-navy-50 px-4 py-2 rounded-full">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-6 mb-6">
            Intelligence. Analysis.<br />
            <span className="bg-gradient-to-r from-navy-600 to-gold-600 bg-clip-text text-transparent">
              Compliance.
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            No black boxes. Every report combines AI efficiency with human regulatory expertise.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Process Steps */}
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setActiveStep(idx)}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  activeStep === idx ? 'scale-105' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className={`relative p-6 rounded-2xl border-2 transition-all ${
                  activeStep === idx 
                    ? 'border-navy-200 bg-navy-50/50 shadow-lg' 
                    : 'border-transparent hover:border-slate-200'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${step.lightColor} rounded-xl flex items-center justify-center shrink-0`}>
                      <step.icon className={`w-6 h-6 text-${step.color.split('-')[1]}-600`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-slate-400">
                          Step {idx + 1}
                        </span>
                        <div className={`w-1 h-1 rounded-full bg-${step.color.split('-')[1]}-400`} />
                        <span className={`text-sm font-medium bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                          {step.title}
                        </span>
                      </div>
                      
                      <p className="text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Visual Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-navy-500 to-gold-500 rounded-3xl blur-3xl opacity-20" />
            
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
              {/* Status Bar */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-100">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-600">
                  {activeStep === 0 && "Analyzing jurisdictional data..."}
                  {activeStep === 1 && "AI processing 50+ state regulations..."}
                  {activeStep === 2 && "Regulatory analyst reviewing..."}
                  {activeStep === 3 && "Compliance report generation complete"}
                </span>
              </div>

              {/* Dynamic Content */}
              {activeStep === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Landmark className="w-4 h-4 text-navy-600" />
                    <span className="font-medium">Jurisdictions detected: 12 states</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-navy-500 to-navy-600 rounded-full" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Mapping state requirements</span>
                      <span>47%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-purple-600">Licenses Required</div>
                      <div className="text-lg font-bold text-purple-900">3 states</div>
                    </div>
                    <div className="bg-navy-50 p-3 rounded-lg">
                      <div className="text-xs text-navy-600">Pending Legislation</div>
                      <div className="text-lg font-bold text-navy-900">7 states</div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gold-500 to-gold-600" />
                  <div>
                    <div className="font-semibold">Michael Chen, Compliance Analyst</div>
                    <div className="text-sm text-slate-600">Adding jurisdictional context...</div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Your Compliance Report is Ready</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    12 pages • 47 compliance items • 90-day action plan
                  </p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Preview Report
                  </Button>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Button size="lg" variant="premium" className="w-full group">
                  <Link href="/generate">
                    Generate Your Compliance Report
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}