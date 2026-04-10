// src/app/guide/page.tsx
// Guide page - Professional, responsive, mobile-friendly

import { BookOpen, FileText, Video, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const guides = [
  {
    title: 'Getting Started with Veridian Platform',
    description: 'Learn how to generate your first compliance report.',
    type: 'Guide',
    icon: BookOpen,
    link: '#'
  },
  {
    title: 'Understanding State Licensing Requirements',
    description: 'A comprehensive overview of 50-state compliance.',
    type: 'Whitepaper',
    icon: FileText,
    link: '#'
  },
  {
    title: 'Video Tutorial: Report Generation',
    description: 'Step-by-step walkthrough of the report generation process.',
    type: 'Video',
    icon: Video,
    link: '#'
  },
  {
    title: 'API Documentation',
    description: 'Technical documentation for our regulatory API.',
    type: 'Documentation',
    icon: Download,
    link: '#'
  }
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Resource Guide
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about regulatory compliance and our platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {guides.map((guide, idx) => {
            const Icon = guide.icon
            return (
              <a key={idx} href={guide.link} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-gold-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gold-600 font-medium mb-1">{guide.type}</div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">{guide.title}</h3>
                    <p className="text-gray-600 text-sm">{guide.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gold-600 transition-colors shrink-0" />
                </div>
              </a>
            )
          })}
        </div>

        <div className="bg-navy-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Need Help?</h2>
          <p className="text-navy-200 mb-4">
            Our support team is here to help you get the most out of Veridian Platform.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300">
            Contact Support <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}