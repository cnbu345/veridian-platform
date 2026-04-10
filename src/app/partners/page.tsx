// src/app/partners/page.tsx
// Partners page - Professional, responsive, mobile-friendly

import { Shield, Handshake, TrendingUp, Award, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Partner With Us
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Join our partner ecosystem and help financial institutions navigate regulatory compliance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Handshake className="w-8 h-8 text-gold-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">Law Firms</h3>
            <p className="text-gray-600 text-sm">Enhance your compliance practice with our regulatory intelligence.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gold-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">Compliance Consultants</h3>
            <p className="text-gray-600 text-sm">Access real-time regulatory data for your clients.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gold-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">Technology Partners</h3>
            <p className="text-gray-600 text-sm">Integrate our API into your compliance solutions.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gold-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">Resellers</h3>
            <p className="text-gray-600 text-sm">Offer our compliance reports to your clients.</p>
          </div>
        </div>

        <div className="bg-navy-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Partner?</h2>
          <p className="text-navy-200 mb-6 max-w-xl mx-auto">
            Let's discuss how we can work together to help financial institutions navigate regulatory compliance.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 text-white rounded-lg font-semibold hover:bg-gold-500 transition-colors"
          >
            Become a Partner
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}