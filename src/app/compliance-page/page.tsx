// src/app/compliance/page.tsx
// Compliance page - Professional, responsive, mobile-friendly

import { Shield, FileText, Users, Bell, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const complianceFeatures = [
  {
    title: 'Regulatory Monitoring',
    description: 'Real-time alerts for regulatory changes across all 50 states.',
    icon: Bell
  },
  {
    title: 'License Management',
    description: 'Track and manage multi-state licensing requirements.',
    icon: FileText
  },
  {
    title: 'Compliance Reporting',
    description: 'Generate detailed compliance reports on demand.',
    icon: Shield
  },
  {
    title: 'Team Collaboration',
    description: 'Work together with your compliance team.',
    icon: Users
  }
]

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Compliance Solutions
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your regulatory compliance with our comprehensive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {complianceFeatures.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4">
                <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-gold-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-navy-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Ready to Simplify Compliance?</h2>
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