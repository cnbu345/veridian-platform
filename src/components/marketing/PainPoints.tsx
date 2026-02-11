'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, DollarSign, TrendingDown, Shield, Clock, Users } from 'lucide-react'

const pains = [
  {
    icon: Shield,
    title: "Regulatory Paralysis",
    stat: "79%",
    description: "of executives say regulatory uncertainty is blocking Web3 adoption",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-50"
  },
  {
    icon: DollarSign,
    title: "Consultant Waste",
    stat: "$47,000",
    description: "Average wasted on consultants who don't understand local markets",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50"
  },
  {
    icon: TrendingDown,
    title: "Competitive Gap",
    stat: "3.2x",
    description: "Your competitors in major metros are already testing Web3",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50"
  }
]

export default function PainPoints() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Stop guessing about Web3.<br />
            <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
              Start executing.
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            The cost of waiting is higher than the cost of acting. Here's what's at stake.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
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
              
              <div className="relative bg-white rounded-2xl p-8 border border-slate-200 h-full">
                <div className={`w-16 h-16 ${pain.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                  <pain.icon className={`w-8 h-8 text-${pain.color.split(' ')[0].replace('from-', '')}`} />
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {pain.stat}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {pain.title}
                </h3>
                
                <p className="text-slate-600">
                  {pain.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visual Stat Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-white rounded-2xl p-8 border border-slate-200"
        >
          <div className="flex items-center gap-4 mb-6">
            <Clock className="w-6 h-6 text-amber-600" />
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Adoption Timeline
            </span>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Your competitors in major metros</span>
                <span className="text-green-600 font-semibold">Already testing</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Suburban markets preparing</span>
                <span className="text-amber-600 font-semibold">6-12 months</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Rural markets evaluating</span>
                <span className="text-blue-600 font-semibold">12-24 months</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-1/4 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
              </div>
            </div>
          </div>
          
          <p className="mt-6 text-sm text-slate-500 italic">
            *Based on analysis of 847 companies across 50 states
          </p>
        </motion.div>
      </div>
    </section>
  )
}