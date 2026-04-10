// src/app/press/page.tsx
// Press page - Professional, responsive, mobile-friendly

import { Newspaper, Calendar, Download, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const pressReleases = [
  {
    date: 'March 15, 2026',
    title: 'Veridian Platform Launches AI-Powered Regulatory Intelligence Tool',
    excerpt: 'New platform helps banks and law firms navigate state-by-state compliance requirements.',
    link: '#'
  },
  {
    date: 'February 10, 2026',
    title: 'Veridian Platform Secures $5M in Seed Funding',
    excerpt: 'Investment to accelerate development of regulatory compliance technology.',
    link: '#'
  },
  {
    date: 'January 5, 2026',
    title: 'Veridian Platform Partners with Leading Compliance Law Firms',
    excerpt: 'Strategic partnerships enhance legal validation of regulatory data.',
    link: '#'
  }
]

const mediaKits = [
  { name: 'Company Fact Sheet', size: 'PDF, 250KB', icon: Newspaper },
  { name: 'Logo Package', size: 'ZIP, 5MB', icon: Download },
  { name: 'Brand Guidelines', size: 'PDF, 1.2MB', icon: Download }
]

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Press & Media
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Latest news, announcements, and media resources from Veridian Platform.
          </p>
        </div>

        {/* Press Releases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Press Releases</h2>
          <div className="space-y-4">
            {pressReleases.map((release, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  {release.date}
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{release.title}</h3>
                <p className="text-gray-600 mb-3">{release.excerpt}</p>
                <a href={release.link} className="inline-flex items-center gap-1 text-gold-600 hover:text-gold-700 text-sm">
                  Read more <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Media Kit */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-12">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Media Kit</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {mediaKits.map((kit, idx) => {
              const Icon = kit.icon
              return (
                <a key={idx} href="#" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Icon className="w-5 h-5 text-gold-600" />
                  <div>
                    <p className="font-medium text-navy-900 text-sm">{kit.name}</p>
                    <p className="text-xs text-gray-500">{kit.size}</p>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
              )
            })}
          </div>
        </div>

        {/* Media Contact */}
        <div className="bg-navy-900 rounded-2xl p-6 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Media Inquiries</h2>
          <p className="text-navy-200 mb-4">
            For media inquiries, please contact our press team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors"
          >
            Contact Press Team
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}