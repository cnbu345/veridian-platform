'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Map, Brain, Users, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const steps = [
  {
    icon: Map,
    title: "Enter Your Location",
    description: "Your city and state trigger our location intelligence engine. We analyze 50+ hyperlocal data points.",
    color: "from-blue-500 to-blue-600",
    lightColor: "bg-blue-50"
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our proprietary AI maps state regulations, talent density, competitor activity, and adoption patterns.",
    color: "from-purple-500 to-purple-600",
    lightColor: "bg-purple-50"
  },
  {
    icon: Users,
    title: "Human Validation",
    description: "A strategy analyst reviews, optimizes, and adds context your AI-generated insights.",
    color: "from-amber-500 to-amber-600",
    lightColor: "bg-amber-50"
  },
  {
    icon: FileText,
    title: "Your Strategy Report",
    description: "Receive a 5-page PDF with your custom roadmap, ready to present to stakeholders.",
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
          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-6 mb-6">
            Intelligence. Validation.<br />
            <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
              Strategy.
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            No black boxes. No generic templates. Every report combines AI efficiency with human expertise.
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
                    ? 'border-blue-200 bg-blue-50/50 shadow-lg' 
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
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-amber-500 rounded-3xl blur-3xl opacity-20" />
            
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
              {/* Status Bar */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-100">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-600">
                  {activeStep === 0 && "Analyzing location data..."}
                  {activeStep === 1 && "AI processing 47 data points..."}
                  {activeStep === 2 && "Strategy analyst reviewing..."}
                  {activeStep === 3 && "Report generation complete"}
                </span>
              </div>

              {/* Dynamic Content */}
              {activeStep === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Map className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Location detected: Austin, TX</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Identifying local Web3 ecosystem</span>
                      <span>47%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-purple-600">Regulatory Score</div>
                      <div className="text-lg font-bold text-purple-900">92</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-blue-600">Talent Density</div>
                      <div className="text-lg font-bold text-blue-900">87</div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600" />
                  <div>
                    <div className="font-semibold">Sarah Chen, Strategy Lead</div>
                    <div className="text-sm text-slate-600">Adding local context...</div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Your Report is Ready</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    5 pages • 47 insights • 90-day roadmap
                  </p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Preview Report
                  </Button>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Button size="lg" variant="premium" className="w-full group" >
                  <Link href="/generate">
                    Start Your Strategy Report
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