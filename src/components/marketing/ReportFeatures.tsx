'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { 
  Scale, 
  Users2, 
  Building2, 
  Calendar, 
  BookOpen,
  MapPin,
  TrendingUp,
  Shield,
  Network,
  FileCheck,
  Zap,
  Target
} from 'lucide-react'

const features = [
  {
    id: 'compliance',
    label: 'State Compliance',
    icon: Scale,
    title: '50-State Regulatory Matrix',
    description: 'Every state has different crypto laws. We map them to your specific location.',
    points: [
      'Money transmitter license requirements by state',
      'Tax implications for your business structure',
      'Recent legislative changes (updated monthly)',
      'Compliance checklist for launch'
    ],
    color: 'from-blue-500 to-blue-600',
    visual: 'regulatory-heatmap'
  },
  {
    id: 'talent',
    label: 'Talent Analysis',
    icon: Users2,
    title: 'Local Talent Density Map',
    description: 'Find Web3 developers, designers, and community builders in your area.',
    points: [
      'Web3 developers per capita ranking',
      'Local meetups and communities',
      'Remote vs. on-site hiring strategy',
      'Salary benchmarks by market'
    ],
    color: 'from-purple-500 to-purple-600',
    visual: 'talent-map'
  },
  {
    id: 'competitors',
    label: 'Competitor Intel',
    icon: Building2,
    title: 'Local Adoption Intelligence',
    description: 'Who\'s already building in your market? What are they doing wrong?',
    points: [
      '3-5 competitors in your immediate area',
      'Their tech stack and approach',
      'Gaps in their strategy',
      'Opportunities they missed'
    ],
    color: 'from-amber-500 to-amber-600',
    visual: 'competitor-grid'
  },
  {
    id: 'roadmap',
    label: '90-Day Plan',
    icon: Calendar,
    title: 'Week-by-Week Execution',
    description: 'Not theory. A specific, actionable plan to launch in 90 days.',
    points: [
      'Days 1-30: Foundation & legal setup',
      'Days 31-60: MVP development',
      'Days 61-90: Launch & community',
      'Key milestones and deliverables'
    ],
    color: 'from-green-500 to-green-600',
    visual: 'roadmap-timeline'
  },
  {
    id: 'resources',
    label: 'Resource Directory',
    icon: BookOpen,
    title: 'Local Partners & Vendors',
    description: 'Vetted legal counsel, dev shops, and investors in your state.',
    points: [
      'Crypto-savvy attorneys (by state)',
      'Web3 development agencies',
      'Local angel investors and VCs',
      'Accelerator programs'
    ],
    color: 'from-red-500 to-red-600',
    visual: 'resource-list'
  }
]

export default function ReportFeatures() {
  const [activeTab, setActiveTab] = useState('compliance')

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
            Inside Your Report
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-6 mb-6">
            What's inside your $497 report?<br />
            <span className="text-slate-600 text-2xl md:text-3xl">
              (Actually, about $2,847 worth of research)
            </span>
          </h2>
        </motion.div>

        <Tabs.Root
          defaultValue="compliance"
          value={activeTab}
          onValueChange={setActiveTab}
          className="grid lg:grid-cols-2 gap-12 items-start"
        >
          {/* Tab List - Left Column */}
          <Tabs.List className="flex flex-col space-y-4">
            {features.map((feature) => (
              <Tabs.Trigger
                key={feature.id}
                value={feature.id}
                className={`group text-left p-6 rounded-2xl border-2 transition-all ${
                  activeTab === feature.id
                    ? 'bg-white border-blue-200 shadow-lg'
                    : 'border-transparent hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-500">
                        {feature.label}
                      </span>
                      {activeTab === feature.id && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Tab Content - Right Column */}
          <div className="lg:sticky lg:top-24">
            {features.map((feature) => (
              <Tabs.Content
                key={feature.id}
                value={feature.id}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {feature.title}
                  </h4>
                </div>

                <ul className="space-y-4 mb-8">
                  {feature.points.map((point, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-green-600" />
                      </div>
                      <span className="text-slate-700">{point}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Visual Preview */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-700">Preview</span>
                    <span className="text-xs text-slate-500">Actual report excerpt</span>
                  </div>
                  
                  {feature.id === 'compliance' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Texas Regulatory Summary:</span>
                      </div>
                      <p className="text-sm text-slate-600 pl-6">
                        No specific money transmission license required. Business-friendly environment. 
                        No state income tax on crypto gains.
                      </p>
                    </div>
                  )}

                  {feature.id === 'talent' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users2 className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Austin Talent Pool:</span>
                      </div>
                      <div className="pl-6">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Web3 Developers</span>
                          <span className="font-semibold">847</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full">
                          <div className="w-3/4 h-full bg-purple-600 rounded-full" />
                        </div>
                        <span className="text-xs text-slate-500 mt-1">Rank: #4 nationally</span>
                      </div>
                    </div>
                  )}

                  {feature.id === 'competitors' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <span className="font-medium">Local Competitors:</span>
                      </div>
                      <div className="pl-6 space-y-2">
                        <div className="text-sm">• ChainLink Solutions - Supply chain focus</div>
                        <div className="text-sm">• BlockTech ATX - DeFi infrastructure</div>
                        <div className="text-sm">• Web3 Builders - Agency services</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-500 line-through">$800 value</span>
                      <span className="ml-2 text-sm font-semibold text-green-600">
                        Included in your report
                      </span>
                    </div>
                  </div>
                </div>
              </Tabs.Content>
            ))}
          </div>
        </Tabs.Root>

        {/* Value Anchor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">
                  $2,847 <span className="text-lg font-normal text-slate-400 line-through">value</span>
                </div>
                <div className="text-slate-300">
                  Your price: <span className="text-2xl font-bold text-amber-400">$497</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">You save</div>
              <div className="text-3xl font-bold text-green-400">$2,350</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}