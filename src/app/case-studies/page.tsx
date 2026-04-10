// src/app/case-studies/page.tsx
// Case Studies page - Professional, responsive, mobile-friendly

import { Building2, TrendingUp, Shield, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const caseStudies = [
  {
    company: 'First National Bank',
    industry: 'Banking',
    challenge: 'Navigating multi-state compliance for digital asset custody',
    solution: 'Implemented Veridian Platform for 50-state regulatory monitoring',
    result: 'Reduced compliance review time by 75%',
    icon: Building2
  },
  {
    company: 'Lexington Law Partners',
    industry: 'Legal',
    challenge: 'Manual research for state licensing requirements',
    solution: 'Automated regulatory intelligence reports',
    result: 'Decreased research time from weeks to hours',
    icon: Shield
  },
  {
    company: 'Crypto Custody Trust',
    industry: 'Digital Assets',
    challenge: 'Understanding evolving state regulations',
    solution: 'Real-time regulatory monitoring and alerts',
    result: 'Successfully launched in 15 states',
    icon: TrendingUp
  }
]

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Customer Success Stories
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            See how financial institutions and law firms use Veridian Platform to streamline compliance.
          </p>
        </div>

        <div className="space-y-8 mb-12">
          {caseStudies.map((study, idx) => {
            const Icon = study.icon
            return (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-navy-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-navy-900">{study.company}</h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{study.industry}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2"><span className="font-medium">Challenge:</span> {study.challenge}</p>
                    <p className="text-gray-600 text-sm mb-2"><span className="font-medium">Solution:</span> {study.solution}</p>
                    <p className="text-gold-600 font-medium text-sm">{study.result}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-navy-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Ready to Transform Your Compliance?</h2>
          <p className="text-navy-200 mb-4">
            Join hundreds of financial institutions using Veridian Platform.
          </p>
          <Link href="/pricing" className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300">
            View Pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}