// src/components/marketing/ReportFeatures.tsx
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
  Target,
  Landmark,
  Gavel,
  AlertTriangle,
  ChevronDown
} from 'lucide-react'

const features = [
  {
    id: 'compliance',
    label: 'Regulatory Matrix',
    icon: Scale,
    title: '50-State Compliance Analysis',
    description: 'Every state has different digital asset laws. We map requirements to your specific jurisdictions.',
    points: [
      'Money transmitter license requirements by state',
      'Tax implications for your business structure',
      'Recent enforcement actions and precedents',
      'Pending legislation tracking (updated weekly)'
    ],
    color: 'from-navy-500 to-navy-600',
    visual: 'regulatory-heatmap'
  },
  {
    id: 'risk',
    label: 'Risk Assessment',
    icon: AlertTriangle,
    title: 'Jurisdictional Risk Profile',
    description: 'Identify high-risk states and compliance exposure before regulators do.',
    points: [
      'Enforcement history by state regulator',
      'Consumer protection requirements',
      'Disclosure obligations',
      'Examination frequency scoring'
    ],
    color: 'from-red-500 to-red-600',
    visual: 'risk-map'
  },
  {
    id: 'requirements',
    label: 'License Requirements',
    icon: Gavel,
    title: 'Multi-State Licensing Matrix',
    description: 'Know exactly which licenses you need in every state you operate.',
    points: [
      'MTL, lender, and money services licenses',
      'Bonding and capital requirements',
      'Application timelines and fees',
      'Renewal and reporting deadlines'
    ],
    color: 'from-amber-500 to-amber-600',
    visual: 'license-grid'
  },
  {
    id: 'roadmap',
    label: 'Compliance Roadmap',
    icon: Calendar,
    title: '90-Day Compliance Plan',
    description: 'Week-by-week execution plan to achieve multi-state compliance.',
    points: [
      'Days 1-30: Priority license applications',
      'Days 31-60: Policy and procedure development',
      'Days 61-90: Regulatory filing and reporting setup',
      'Key milestones and deliverables'
    ],
    color: 'from-green-500 to-green-600',
    visual: 'roadmap-timeline'
  },
  {
    id: 'resources',
    label: 'Regulatory Contacts',
    icon: BookOpen,
    title: 'State Regulator Directory',
    description: 'Direct contacts at every state regulator, with compliance officer names and exam schedules.',
    points: [
      'Primary regulator contacts by state',
      'Examination schedule and history',
      'Approved legal counsel and consultants',
      'Industry working groups and associations'
    ],
    color: 'from-purple-500 to-purple-600',
    visual: 'resource-list'
  }
]

export default function ReportFeatures() {
  const [activeTab, setActiveTab] = useState('compliance')

  return (
    <section className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-navy-600 bg-navy-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
            Inside Your Compliance Report
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-4 md:mt-6 mb-4 md:mb-6 px-4">
            What's inside your $2,497 report?
          </h2>
          <p className="text-lg md:text-2xl lg:text-3xl text-slate-600">
            (About $15,000 worth of regulatory research)
          </p>
        </motion.div>

        {/* Mobile Dropdown Selector - Visible only on mobile */}
        <div className="block lg:hidden mb-8">
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-4 pr-12 bg-white border-2 border-navy-200 rounded-xl text-slate-900 font-medium appearance-none cursor-pointer"
              style={{
                backgroundImage: 'none' // Ensure no default arrow in some browsers
              }}
            >
              {features.map((feature) => (
                <option key={feature.id} value={feature.id}>
                  {feature.label} - {feature.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-600 pointer-events-none" />
          </div>
          <p className="text-xs text-navy-600 mt-2 text-center">
            Tap to explore each section
          </p>
        </div>

        <Tabs.Root
          defaultValue="compliance"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-start"
        >
          {/* Tab List - Left Column - Hidden on mobile, shown on desktop */}
          <Tabs.List className="hidden lg:flex flex-col space-y-4">
            {features.map((feature) => (
              <Tabs.Trigger
                key={feature.id}
                value={feature.id}
                className={`group text-left p-6 rounded-2xl border-2 transition-all ${
                  activeTab === feature.id
                    ? 'bg-white border-navy-200 shadow-lg'
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
                        <span className="text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full">
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
          <div className="lg:sticky lg:top-24 w-full">
            {features.map((feature) => (
              <Tabs.Content
                key={feature.id}
                value={feature.id}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center shrink-0`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-slate-900">
                    {feature.title}
                  </h4>
                </div>

                <ul className="space-y-4 mb-6 md:mb-8">
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
                      <span className="text-sm md:text-base text-slate-700 leading-relaxed">{point}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Visual Preview */}
                <div className="bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-700">Preview</span>
                    <span className="text-xs text-slate-500">Actual report excerpt</span>
                  </div>
                  
                  {feature.id === 'compliance' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-navy-600 shrink-0" />
                        <span className="font-medium">Texas Regulatory Summary:</span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 pl-6 leading-relaxed">
                        No specific money transmission license required for custodial services. 
                        Must register as Money Services Business with Texas Department of Banking.
                        Pending HB 1234 would require licensing by Q4 2026.
                      </p>
                    </div>
                  )}

                  {feature.id === 'risk' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-medium">High-Risk Jurisdictions:</span>
                      </div>
                      <div className="pl-6 space-y-2">
                        <div className="flex flex-wrap justify-between text-xs md:text-sm gap-1">
                          <span>New York - BitLicense required</span>
                          <span className="text-red-600 font-semibold whitespace-nowrap">High</span>
                        </div>
                        <div className="flex flex-wrap justify-between text-xs md:text-sm gap-1">
                          <span>California - Under review</span>
                          <span className="text-amber-600 font-semibold whitespace-nowrap">Medium</span>
                        </div>
                        <div className="flex flex-wrap justify-between text-xs md:text-sm gap-1">
                          <span>Texas - Business friendly</span>
                          <span className="text-green-600 font-semibold whitespace-nowrap">Low</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {feature.id === 'requirements' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Gavel className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-medium">Licenses Required:</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        <div className="text-xs md:text-sm">• Money Transmitter License (7 states)</div>
                        <div className="text-xs md:text-sm">• Consumer Lender License (4 states)</div>
                        <div className="text-xs md:text-sm">• Mortgage Broker License (2 states)</div>
                      </div>
                    </div>
                  )}

                  {feature.id === 'roadmap' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="font-medium">90-Day Timeline:</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        <div className="text-xs md:text-sm">• Days 1-30: Priority applications</div>
                        <div className="text-xs md:text-sm">• Days 31-60: Policy development</div>
                        <div className="text-xs md:text-sm">• Days 61-90: Filing setup</div>
                      </div>
                    </div>
                  )}

                  {feature.id === 'resources' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="font-medium">Key Contacts:</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        <div className="text-xs md:text-sm">• State regulator directory</div>
                        <div className="text-xs md:text-sm">• Compliance officer contacts</div>
                        <div className="text-xs md:text-sm">• Approved legal counsel</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs md:text-sm text-slate-500 line-through">$5,000 value</span>
                      <span className="ml-2 text-xs md:text-sm font-semibold text-green-600">
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
          className="mt-10 md:mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col xs:flex-row items-center gap-4 text-center xs:text-left">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <Target className="w-8 h-8 text-gold-400" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  $15,000 <span className="text-base md:text-lg font-normal text-slate-400 line-through">consulting value</span>
                </div>
                <div className="text-base md:text-lg text-slate-300">
                  Your price: <span className="text-xl md:text-2xl font-bold text-gold-400">$2,497</span>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="text-sm text-slate-400 mb-1">You save</div>
              <div className="text-2xl md:text-3xl font-bold text-green-400">$12,503</div>
            </div>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-4 text-center">
            Founder's Circle: $997 for first 50 customers
          </p>
        </motion.div>
      </div>
    </section>
  )
}