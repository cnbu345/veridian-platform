// src/app/pricing/page.tsx
import Link from 'next/link'
import { Check, Shield, Clock, Users, Building2, Scale, FileText, Sparkles } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="heading-1 text-navy-900 mb-6">
            Enterprise-Grade Regulatory Intelligence
          </h1>
          <p className="text-xl text-navy-600">
            Choose the plan that fits your institution's compliance needs.
            All reports include state-by-state analysis and 24-hour delivery.
          </p>
        </div>

        {/* Founder's Banner */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-gold-600 to-gold-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Founder's Circle Pricing</h3>
                <p className="text-gold-100">
                  First 50 customers receive 60% off. <span className="font-bold">38 spots remaining.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Tier 1: Single Report */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft hover:shadow-premium transition-all duration-300 overflow-hidden">
            <div className="p-8">
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Single Report</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-navy-900">$2,497</span>
                <span className="text-sm text-navy-500 ml-2">one-time</span>
              </div>
              <p className="text-sm text-navy-600 mb-6">
                Complete 5-page location-intelligent compliance report
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>State-specific regulatory analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>License requirement matrix</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>90-day compliance action plan</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>30-minute consultation call</span>
                </li>
              </ul>

              <Link
                href="/generate?tier=single"
                className="block w-full py-3 px-4 text-center bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors"
              >
                Purchase Report
              </Link>
              
              <p className="text-xs text-center text-navy-400 mt-4">
                Founder's: <span className="line-through">$2,497</span> <span className="text-gold-600 font-bold">$997</span>
              </p>
            </div>
          </div>

          {/* Tier 2: Quarterly Subscription */}
          <div className="bg-white rounded-2xl border-2 border-navy-200 shadow-soft hover:shadow-premium transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-navy-900 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
              Popular
            </div>
            <div className="p-8">
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Quarterly</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-navy-900">$3,997</span>
                <span className="text-sm text-navy-500 ml-2">/year</span>
              </div>
              <p className="text-sm text-navy-600 mb-6">
                4 reports per year + compliance monitoring
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Quarterly compliance updates</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Email alerts for state law changes</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Access to new features</span>
                </li>
              </ul>

              <Link
                href="/generate?tier=quarterly"
                className="block w-full py-3 px-4 text-center bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors"
              >
                Subscribe Quarterly
              </Link>
            </div>
          </div>

          {/* Tier 3: Monthly Subscription */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft hover:shadow-premium transition-all duration-300 overflow-hidden">
            <div className="p-8">
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Monthly</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-navy-900">$7,997</span>
                <span className="text-sm text-navy-500 ml-2">/year</span>
              </div>
              <p className="text-sm text-navy-600 mb-6">
                12 reports per year + multi-state analysis
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Monthly compliance reports</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Multi-state analysis capability</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>Team access (up to 5 users)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>API access (coming soon)</span>
                </li>
              </ul>

              <Link
                href="/generate?tier=monthly"
                className="block w-full py-3 px-4 text-center bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors"
              >
                Subscribe Monthly
              </Link>
            </div>
          </div>

          {/* Tier 4: Enterprise */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl shadow-soft hover:shadow-premium transition-all duration-300 overflow-hidden">
            <div className="p-8">
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">$15K+</span>
                <span className="text-sm text-navy-300 ml-2">/year</span>
              </div>
              <p className="text-sm text-navy-300 mb-6">
                Custom solutions for large institutions
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-navy-200">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <span>Custom industry deep-dives</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-navy-200">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <span>White-labeled reports</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-navy-200">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <span>Direct compliance consultation</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-navy-200">
                  <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <span>Early access to new features</span>
                </li>
              </ul>

              <Link
                href="/contact"
                className="block w-full py-3 px-4 text-center bg-gold-500 text-navy-900 font-semibold rounded-xl hover:bg-gold-400 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-navy-700" />
            </div>
            <h4 className="font-semibold text-navy-900 mb-2">24-Hour Delivery</h4>
            <p className="text-sm text-navy-600">
              Most clients receive their report within 24 hours of ordering
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Scale className="w-6 h-6 text-navy-700" />
            </div>
            <h4 className="font-semibold text-navy-900 mb-2">Human-Validated</h4>
            <p className="text-sm text-navy-600">
              Every report reviewed by a compliance analyst
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-navy-700" />
            </div>
            <h4 className="font-semibold text-navy-900 mb-2">30-Day Guarantee</h4>
            <p className="text-sm text-navy-600">
              Full refund if you're not satisfied
            </p>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-20 text-center">
          <p className="text-navy-600 mb-4">Questions about enterprise pricing?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-gold-600 font-semibold hover:text-gold-700"
          >
            Contact our compliance team
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}