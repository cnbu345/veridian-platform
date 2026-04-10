// src/app/risk/page.tsx
// Risk Assessment page - Professional, responsive, mobile-friendly

import { AlertTriangle, Shield, TrendingUp, FileText, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const riskFactors = [
  {
    category: 'Regulatory Change',
    risk: 'High',
    mitigation: 'Continuous monitoring and legal counsel engagement',
    color: 'text-red-600 bg-red-50'
  },
  {
    category: 'License Delays',
    risk: 'Medium',
    mitigation: 'Early application submission, expedited processing options',
    color: 'text-yellow-600 bg-yellow-50'
  },
  {
    category: 'Enforcement Action',
    risk: 'Medium',
    mitigation: 'Proactive compliance, documented procedures',
    color: 'text-yellow-600 bg-yellow-50'
  },
  {
    category: 'Examination Findings',
    risk: 'Medium',
    mitigation: 'Regular compliance audits, third-party reviews',
    color: 'text-yellow-600 bg-yellow-50'
  }
]

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Risk Assessment Guide
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Understand and mitigate regulatory compliance risks for digital asset businesses.
          </p>
        </div>

        {/* Risk Matrix */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-navy-900">Risk Assessment Matrix</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Risk Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Mitigation Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {riskFactors.map((factor, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{factor.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${factor.color}`}>
                        {factor.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{factor.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Practices */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">Proactive Monitoring</h3>
            <p className="text-gray-600 text-sm">Stay ahead of regulatory changes with real-time alerts.</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">Legal Counsel</h3>
            <p className="text-gray-600 text-sm">Maintain retainer with qualified compliance attorneys.</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">Documentation</h3>
            <p className="text-gray-600 text-sm">Maintain comprehensive compliance records.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-navy-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Need a Custom Risk Assessment?</h2>
          <p className="text-navy-200 mb-4">
            Get a personalized compliance report for your business.
          </p>
          <Link href="/pricing" className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}