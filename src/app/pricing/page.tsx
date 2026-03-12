// src/app/pricing/page.tsx
'use client'

import Link from 'next/link'
import { Check, Shield, Clock, Users, Building2, Scale, FileText, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

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
              <p className="text-xs text-center text-navy-500 mt-2">
                Includes 1 free 30-minute consultation ($500 value)
              </p>
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
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Quarterly Intelligence</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-navy-900">$5,997</span>
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
                  <span>2 complimentary strategy sessions per year ($1,000 value)</span>
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
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Enterprise Suite</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-navy-900">$14,997</span>
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
                  <span>Team access (up to 10 users)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>4 quarterly strategy calls ($2,000 value)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>White-label option for client reports</span>
                </li>
              </ul>

              <Link
                href="/generate?tier=monthly"
                className="block w-full py-3 px-4 text-center bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors"
              >
                Subscribe Year
              </Link>
            </div>
          </div>

          {/* Tier 4: Enterprise */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl shadow-soft hover:shadow-premium transition-all duration-300 overflow-hidden">
            <div className="p-8">
              <h3 className="text-lg font-semibold text-white mb-2">Custom Enterprise</h3>
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

              <button
                onClick={() => {
                  // Open enterprise lead modal
                  const modal = document.getElementById('enterprise-lead-modal')
                  if (modal) modal.style.display = 'flex'
                }}
                className="block w-full py-3 px-4 text-center bg-gold-500 text-navy-900 font-semibold rounded-xl hover:bg-gold-400 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>

          {/* Add Enterprise Lead Modal */}
          <div 
            id="enterprise-lead-modal" 
            className="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                const modal = document.getElementById('enterprise-lead-modal')
                if (modal) modal.style.display = 'none'
              }
            }}
          >
            <div className="bg-white rounded-2xl max-w-lg w-full">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-navy-900">Contact Enterprise Sales</h2>
                <button
                  onClick={() => {
                    const modal = document.getElementById('enterprise-lead-modal')
                    if (modal) modal.style.display = 'none'
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form 
                className="p-6 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const form = e.currentTarget // Store reference to form
                  
                  try {
                    console.log('Submitting enterprise lead:', {
                      company_name: formData.get('company_name'),
                      contact_name: formData.get('contact_name'),
                      contact_email: formData.get('contact_email'),
                      contact_phone: formData.get('contact_phone'),
                      company_size: formData.get('company_size'),
                      message: formData.get('message')
                    })

                    const response = await fetch('/api/public/enterprise/leads', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        company_name: formData.get('company_name'),
                        contact_name: formData.get('contact_name'),
                        contact_email: formData.get('contact_email'),
                        contact_phone: formData.get('contact_phone'),
                        company_size: formData.get('company_size'),
                        message: formData.get('message'),
                        source: 'pricing_page'
                      })
                    })

                    const data = await response.json()
                    
                    if (!response.ok) {
                      console.error('Server error:', data)
                      throw new Error(data.error || 'Failed to submit')
                    }

                    // Show success message first
                    toast.success('Thank you! Our enterprise team will contact you within 24 hours.')
                    
                    // Reset form before closing modal
                    form.reset()
                    
                    // Close modal after a brief delay to ensure everything is processed
                    setTimeout(() => {
                      const modal = document.getElementById('enterprise-lead-modal')
                      if (modal) modal.style.display = 'none'
                    }, 100)

                  } catch (error) {
                    console.error('Submission error:', error)
                    toast.error('Failed to submit. Please try again.')
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Contact Name *</label>
                  <input
                    type="text"
                    name="contact_name"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Work Email *</label>
                  <input
                    type="email"
                    name="contact_email"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Company Size</label>
                  <select
                    name="company_size"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">Select...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Tell us about your needs</label>
                  <textarea
                    name="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="What compliance challenges are you facing? What features are you most interested in?"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-gold-600 text-white rounded-lg font-medium hover:bg-gold-700"
                  >
                    Submit Request
                  </button>
                  <p className="text-xs text-center text-navy-500 mt-3">
                    Our enterprise team typically responds within 24 hours
                  </p>
                </div>
              </form>
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