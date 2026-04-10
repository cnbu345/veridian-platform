// src/app/terms/page.tsx
// Terms of Service - Comprehensive, responsive, mobile-friendly

import { Shield, Scale, FileText, AlertTriangle, Mail, Lock, Clock } from 'lucide-react'

export default function TermsPage() {
  const lastUpdated = 'April 10, 2026'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-100 rounded-full text-gold-700 text-sm mb-4">
            <FileText className="w-4 h-4" />
            <span>Effective {lastUpdated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using Veridian Group's services.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10">
          <div className="prose prose-slate max-w-none">
            {/* Acceptance of Terms */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using Veridian Group's website, platform, or services (collectively, the "Services"), 
                you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
                please do not use our Services.
              </p>
            </div>

            {/* Description of Services */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">2. Description of Services</h2>
              <p className="text-gray-600 leading-relaxed">
                Veridian Group provides regulatory intelligence tools, including but not limited to:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
                <li>State-by-state regulatory compliance reports</li>
                <li>Licensing requirement databases and comparison tools</li>
                <li>AI-powered regulatory analysis and recommendations</li>
                <li>API access for regulatory data integration</li>
                <li>Compliance monitoring and alert services</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-3 text-sm bg-yellow-50 p-3 rounded-lg">
                <strong>Disclaimer:</strong> Veridian Group is not a law firm. Our Services provide regulatory 
                intelligence for informational purposes only and do not constitute legal advice. Always consult 
                qualified legal counsel for compliance decisions.
              </p>
            </div>

            {/* Account Registration */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">3. Account Registration</h2>
              <p className="text-gray-600 leading-relaxed">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </div>

            {/* Subscription and Payments */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">4. Subscription and Payments</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Single Report</h3>
                  <p className="text-xs text-gray-500">One-time payment of $997 (founder's pricing)</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Quarterly Subscription</h3>
                  <p className="text-xs text-gray-500">$5,997/year (4 reports)</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Enterprise Suite</h3>
                  <p className="text-xs text-gray-500">$14,997/year (12 reports + API)</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Custom Enterprise</h3>
                  <p className="text-xs text-gray-500">Contact sales for pricing</p>
                </div>
              </div>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Payments are processed securely via Stripe</li>
                <li>Subscriptions auto-renew unless cancelled</li>
                <li>Refunds are provided within 30 days of purchase</li>
                <li>We reserve the right to change pricing with 30 days' notice</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">5. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                All content, features, and functionality of our Services—including but not limited to reports, 
                databases, software, trademarks, and logos—are owned by Veridian Group and protected by copyright, 
                trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                You may not reproduce, distribute, modify, create derivative works of, or publicly display any 
                content from our Services without our prior written consent.
              </p>
            </div>

            {/* Prohibited Conduct */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">6. Prohibited Conduct</h2>
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">You agree NOT to:</h3>
                </div>
                <ul className="list-disc pl-5 text-red-700 space-y-1 text-sm">
                  <li>Use our Services for any illegal purpose</li>
                  <li>Attempt to bypass or circumvent security measures</li>
                  <li>Scrape, crawl, or extract data without authorization</li>
                  <li>Interfere with or disrupt our Services</li>
                  <li>Impersonate any person or entity</li>
                  <li>Share your account credentials with unauthorized users</li>
                  <li>Resell or redistribute our reports without permission</li>
                </ul>
              </div>
            </div>

            {/* Disclaimer of Warranties */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">7. Disclaimer of Warranties</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">
                  OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                  WHETHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, 
                  ERROR-FREE, OR COMPLETELY ACCURATE. REGULATORY INFORMATION MAY CHANGE RAPIDLY, AND WE 
                  DO NOT GUARANTEE REAL-TIME ACCURACY OF ALL DATA.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">8. Limitation of Liability</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, VERIDIAN GROUP SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, 
                  OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF OUR SERVICES. OUR TOTAL LIABILITY SHALL 
                  NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.
                </p>
              </div>
            </div>

            {/* Indemnification */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">9. Indemnification</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to indemnify and hold harmless Veridian Group, its officers, directors, employees, 
                and agents from any claims, damages, losses, or expenses arising from your use of our Services, 
                violation of these Terms, or infringement of any third-party rights.
              </p>
            </div>

            {/* Termination */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">10. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for conduct that 
                violates these Terms or is harmful to other users. Upon termination, your right to use our 
                Services will cease immediately.
              </p>
            </div>

            {/* Governing Law */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">11. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of 
                California, without regard to its conflict of law provisions. Any legal action shall be brought 
                exclusively in the federal or state courts located in San Francisco, California.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">12. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We may modify these Terms at any time. We will notify you of material changes by posting the 
                new Terms on this page and updating the "Effective" date. Your continued use of our Services 
                constitutes acceptance of the revised Terms.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-navy-900 rounded-xl p-6 pt-0 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-gold-400 mt-4" />
                <h3 className="text-lg text-navy-200 text-xl font-semibold">Contact Us</h3>
              </div>
              <p className="text-navy-200 text-sm mb-3">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p>📧 <a href="mailto:legal@veridiangroup.com" className="text-gold-400 hover:underline">legal@veridiangroup.com</a></p>
                <p>📞 <a href="tel:+18885550987" className="text-gold-400 hover:underline">(888) 555-0987</a></p>
                <p>📍 548 Market St, Suite 400, San Francisco, CA 94104</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}