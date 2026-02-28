// src/components/marketing/PainPoints.tsx
'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, DollarSign, Scale, Gavel, Landmark } from 'lucide-react'

const pains = [
  {
    icon: Scale,
    title: "Regulatory Uncertainty",
    stat: "79%",
    description: "of compliance officers say unclear state laws are blocking digital asset initiatives",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-50",
    iconColor: "text-red-600"
  },
  {
    icon: DollarSign,
    title: "Consultant Waste",
    stat: "$47,000",
    description: "Average annual spend on consultants who don't understand state-by-state requirements",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600"
  },
  {
    icon: Gavel,
    title: "Enforcement Risk",
    stat: "$2.8M",
    description: "Average fine for multi-state compliance failures in 2025",
    color: "from-navy-500 to-indigo-500",
    bgColor: "bg-navy-50",
    iconColor: "text-navy-600"
  }
]

export default function PainPoints() {
  return (
    <section className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 md:mb-6">
            The cost of regulatory uncertainty<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-navy-600 to-gold-600 bg-clip-text text-transparent block mt-1 md:mt-2 text-xl md:text-4xl lg:text-5xl">
              is higher than the cost of intelligence.
            </span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto px-4">
            For compliance officers, guessing isn't an option. Here's what's at stake.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {pains.map((pain, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${pain.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              <div className="relative bg-white rounded-2xl p-5 md:p-6 lg:p-8 border border-slate-200 h-full">
                {/* Icon and stat side by side - same for all screen sizes */}
                <div className="flex items-start gap-3 mb-3 md:mb-4">
                  {/* Icon - same size for all screens */}
                  <div className={`w-12 h-12 ${pain.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <pain.icon className={`w-5 h-5 ${pain.iconColor}`} />
                  </div>
                  
                  {/* Stat */}
                  <div className="flex-1 pt-1">
                    <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {pain.stat}
                    </span>
                  </div>
                </div>

                {/* Title below icon and stat - same for all screens */}
                <h3 className="text-lg font-semibold text-slate-900 mb-2 md:mb-3 pl-[60px]">
                  {pain.title}
                </h3>
                
                {/* Description indented below title - same for all screens */}
                <p className="text-sm text-slate-600 pl-[60px]">
                  {pain.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Regulatory Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 md:mt-16 lg:mt-20 bg-white rounded-2xl p-5 md:p-6 lg:p-8 border border-slate-200"
        >
          <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
            <Landmark className="w-5 h-5 md:w-6 md:h-6 text-navy-600" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              State Legislative Activity 2026
            </span>
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-1 md:mb-2">
                <span className="font-medium">States with pending digital asset legislation</span>
                <span className="text-amber-600 font-semibold">23 states</span>
              </div>
              <div className="h-2 md:h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-1 md:mb-2">
                <span className="font-medium">States that updated money transmitter laws</span>
                <span className="text-green-600 font-semibold">14 states</span>
              </div>
              <div className="h-2 md:h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs md:text-sm mb-1 md:mb-2">
                <span className="font-medium">Enforcement actions YTD</span>
                <span className="text-red-600 font-semibold">37</span>
              </div>
              <div className="h-2 md:h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full" />
              </div>
            </div>
          </div>
          
          <p className="mt-4 md:mt-6 text-[10px] md:text-xs text-slate-500 italic">
            *Source: Veridian Regulatory Intelligence Database, updated February 2026
          </p>
        </motion.div>
      </div>
    </section>
  )
}