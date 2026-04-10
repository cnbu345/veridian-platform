// src/app/privacy/page.tsx
// Privacy Policy - Comprehensive, responsive, mobile-friendly

import { Calendar, Shield, Eye, Database, Mail, Globe, Lock } from 'lucide-react'

export default function PrivacyPage() {
  const lastUpdated = 'April 10, 2026'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container-custom max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-100 rounded-full text-gold-700 text-sm mb-4">
            <Shield className="w-4 h-4" />
            <span>Updated {lastUpdated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            How Veridian Group collects, uses, and protects your information.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10">
          <div className="prose prose-slate max-w-none">
            {/* Introduction */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Veridian Group, Inc. ("Veridian," "we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you visit our website, use our regulatory intelligence platform, or engage with our services.
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                By using our services, you consent to the data practices described in this policy. If you do not 
                agree with any part of this policy, please do not use our services.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">2. Information We Collect</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-gold-600" />
                    <h3 className="font-semibold text-navy-900">Personal Information You Provide</h3>
                  </div>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>Name, email address, phone number, and company information</li>
                    <li>Billing and payment information (processed securely by Stripe)</li>
                    <li>Account credentials and preferences</li>
                    <li>Communications with our team (email, chat, phone)</li>
                    <li>Feedback, survey responses, and support requests</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-gold-600" />
                    <h3 className="font-semibold text-navy-900">Automatically Collected Information</h3>
                  </div>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>IP address and device identifiers</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent on our platform</li>
                    <li>Referring website and exit pages</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-gold-600" />
                    <h3 className="font-semibold text-navy-900">Information from Third Parties</h3>
                  </div>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>Regulatory data from NMLS, CSBS, and state agencies</li>
                    <li>Lead information from marketing partners</li>
                    <li>Social media platform data (if you connect accounts)</li>
                    <li>Payment processing confirmation from Stripe</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">3. How We Use Your Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-navy-50 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">Service Delivery</h3>
                  <p className="text-sm text-gray-600">Generate compliance reports, process payments, and provide customer support.</p>
                </div>
                <div className="bg-navy-50 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">Platform Improvement</h3>
                  <p className="text-sm text-gray-600">Analyze usage patterns to enhance features and user experience.</p>
                </div>
                <div className="bg-navy-50 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">Communication</h3>
                  <p className="text-sm text-gray-600">Send important updates, security alerts, and service notifications.</p>
                </div>
                <div className="bg-navy-50 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">Legal Compliance</h3>
                  <p className="text-sm text-gray-600">Fulfill regulatory requirements and respond to legal requests.</p>
                </div>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">4. Data Sharing & Disclosure</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li><strong>Service Providers:</strong> Stripe (payment processing), AWS (cloud hosting), SendGrid (email delivery)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or regulatory authority</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">5. Data Security</h2>
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Our Security Measures</h3>
                </div>
                <ul className="list-disc pl-5 text-green-700 space-y-1 text-sm">
                  <li>AES-256 encryption for data at rest</li>
                  <li>TLS 1.3 encryption for data in transit</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Role-based access controls and multi-factor authentication</li>
                  <li>SOC 2 Type II certified infrastructure</li>
                </ul>
              </div>
              <p className="text-gray-600 leading-relaxed mt-3 text-sm">
                While we implement industry-standard security measures, no method of transmission over the Internet 
                is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>

            {/* Your Rights */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">6. Your Privacy Rights</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Access & Portability</h3>
                  <p className="text-xs text-gray-500">Request a copy of your data</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Correction</h3>
                  <p className="text-xs text-gray-500">Update inaccurate information</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Deletion</h3>
                  <p className="text-xs text-gray-500">Request data deletion (subject to legal retention)</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="font-semibold text-navy-900 text-sm">Opt-Out</h3>
                  <p className="text-xs text-gray-500">Unsubscribe from marketing communications</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                To exercise these rights, contact us at <a href="mailto:privacy@veridiangroup.com" className="text-gold-600 hover:underline">privacy@veridiangroup.com</a>.
              </p>
            </div>

            {/* Cookies */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">7. Cookies & Tracking</h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience. You can control cookie 
                preferences through your browser settings. For more details, see our <a href="/cookies" className="text-gold-600 hover:underline">Cookie Policy</a>.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">8. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our services are not directed to individuals under 18. We do not knowingly collect personal information 
                from children. If you believe a child has provided us with personal information, please contact us.
              </p>
            </div>

            {/* International Users */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">9. International Users</h2>
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and processed in the United States. By using our services, 
                you consent to this transfer. For users in the EEA, UK, or Switzerland, we comply with GDPR requirements.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-navy-900 mb-3">10. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of material changes by posting the 
                new policy on this page and updating the "Last Updated" date. Continued use of our services constitutes 
                acceptance of the revised policy.
              </p>
            </div>

            {/* Contact Us */}
            <div className="bg-navy-900 rounded-xl p-6 pt-0 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-gold-400 mt-4" />
                <h3 className="text-lg text-navy-200 text-xl font-semibold">Contact Us</h3>
              </div>
              <p className="text-navy-200 text-sm mb-3">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p>📧 <a href="mailto:privacy@veridiangroup.com" className="text-gold-400 hover:underline">privacy@veridiangroup.com</a></p>
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