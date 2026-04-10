// src/app/careers/page.tsx
// Careers page - Professional, responsive, mobile-friendly

import { Briefcase, MapPin, Clock, DollarSign, Heart, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const openPositions = [
  {
    title: 'Senior Compliance Analyst',
    department: 'Compliance',
    location: 'Remote (US)',
    type: 'Full-time',
    salary: '$90,000 - $120,000'
  },
  {
    title: 'Full Stack Developer',
    department: 'Engineering',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$110,000 - $150,000'
  },
  {
    title: 'Regulatory Attorney',
    department: 'Legal',
    location: 'Remote (US)',
    type: 'Contract',
    salary: '$150,000 - $200,000'
  },
  {
    title: 'Sales Development Representative',
    department: 'Sales',
    location: 'Remote (US)',
    type: 'Full-time',
    salary: '$60,000 - $80,000 + Commission'
  }
]

const benefits = [
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive medical, dental, and vision coverage' },
  { icon: Clock, title: 'Flexible PTO', description: 'Unlimited paid time off' },
  { icon: Users, title: 'Remote-First', description: 'Work from anywhere in the US' },
  { icon: DollarSign, title: '401(k) Matching', description: 'Competitive retirement benefits' }
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Help us build the future of regulatory intelligence for financial institutions.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon
            return (
              <div key={idx} className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-gold-600" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-1">{benefit.title}</h3>
                <p className="text-xs text-gray-500">{benefit.description}</p>
              </div>
            )
          })}
        </div>

        {/* Open Positions */}
        <h2 className="text-2xl font-bold text-navy-900 mb-6">Open Positions</h2>
        <div className="space-y-4 mb-12">
          {openPositions.map((position, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{position.title}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {position.department}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {position.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {position.type}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {position.salary}</span>
                  </div>
                </div>
                <Link href="/contact" className="px-4 py-2 bg-gold-600 text-white rounded-lg text-sm font-semibold hover:bg-gold-700 transition-colors text-center">
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-navy-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Don't see the right role?</h2>
          <p className="text-navy-200 mb-4">
            We're always looking for talented individuals. Send us your resume.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}