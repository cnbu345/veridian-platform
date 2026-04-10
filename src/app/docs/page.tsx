// src/app/docs/page.tsx
// Documentation page - Professional, responsive, mobile-friendly

import { BookOpen, Code, Shield, Zap, ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'

const docSections = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    links: ['Quick Start Guide', 'Account Setup', 'First Report Generation']
  },
  {
    title: 'API Reference',
    icon: Code,
    links: ['Authentication', 'Endpoints', 'Rate Limits', 'Error Codes']
  },
  {
    title: 'Security',
    icon: Shield,
    links: ['Data Encryption', 'Compliance Standards', 'Privacy Policy']
  },
  {
    title: 'Integrations',
    icon: Zap,
    links: ['Webhooks', 'Third-party Integrations', 'Custom Reports']
  }
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Documentation
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to integrate and use Veridian Platform.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {docSections.map((section, idx) => {
            const Icon = section.icon
            return (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gold-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-navy-900">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a href="#" className="text-gray-600 hover:text-gold-600 transition-colors text-sm flex items-center gap-1">
                        {link}
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* API Status */}
        <div className="mt-12 bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">
            API Status: <span className="text-green-600 font-medium">All Systems Operational</span>
          </p>
        </div>
      </div>
    </div>
  )
}