'use client'

import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  MapPin, 
  Phone, 
  Shield, 
  FileText, 
  BookOpen,
  Building2,
  Users,
  Sparkles,
  ChevronRight
} from 'lucide-react'

const navigation = {
  solutions: [
    { name: 'Strategy Reports', href: '/generate', icon: FileText },
    { name: 'Regulatory Compliance', href: '/compliance', icon: Shield },
    { name: 'Talent Analysis', href: '/talent', icon: Users },
    { name: 'Competitor Intel', href: '/competitive', icon: Building2 },
    { name: 'Enterprise', href: '/enterprise', icon: Sparkles },
  ],
  resources: [
    { name: 'Sample Report', href: '/sample' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Web3 Guide', href: '/guide' },
    { name: 'Blog', href: '/blog' },
    { name: 'Documentation', href: '/docs' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Partners', href: '/partners' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Security', href: '/security' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative bg-navy-900 border-t border-navy-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative container-custom pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-navy-800">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg" />
              <div>
                <span className="text-xl font-display font-bold text-white">
                  Veridian
                </span>
                <span className="text-xl font-display font-bold text-gold-500">
                  Group
                </span>
              </div>
            </Link>
            
            <p className="text-navy-300 text-sm leading-relaxed mb-6 max-w-md">
              The only location-intelligent Web3 strategy platform trusted by 
              Fortune 500 executives. AI-powered analysis, human-validated strategy.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-navy-300">
                <MapPin className="w-4 h-4 text-gold-500" />
                <span>548 Market St, San Francisco, CA 94104</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-navy-300">
                <Mail className="w-4 h-4 text-gold-500" />
                <a href="mailto:executive@veridiangroup.com" className="hover:text-gold-500 transition">
                  executive@veridiangroup.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-navy-300">
                <Phone className="w-4 h-4 text-gold-500" />
                <a href="tel:+18885550987" className="hover:text-gold-500 transition">
                  (888) 555-0987
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: 'https://twitter.com/veridiangroup' },
                { icon: Linkedin, href: 'https://linkedin.com/company/veridiangroup' },
                { icon: Github, href: 'https://github.com/veridiangroup' }
              ].map((social, idx) => {
                const Icon = social.icon
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "w-10 h-10 bg-navy-800 rounded-lg",
                      "flex items-center justify-center",
                      "hover:bg-gold-500/10 hover:border-gold-500",
                      "border border-transparent transition-all duration-300 group"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 text-navy-300",
                      "group-hover:text-gold-500 transition-colors"
                    )} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Solutions */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Solutions</h3>
            <ul className="space-y-3">
              {navigation.solutions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm text-navy-300 hover:text-gold-500",
                      "transition-colors flex items-center gap-2 group"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-3 h-3 text-navy-600",
                      "group-hover:text-gold-500 group-hover:translate-x-1",
                      "transition-all"
                    )} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm text-navy-300 hover:text-gold-500",
                      "transition-colors flex items-center gap-2 group"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-3 h-3 text-navy-600",
                      "group-hover:text-gold-500 group-hover:translate-x-1",
                      "transition-all"
                    )} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm text-navy-300 hover:text-gold-500",
                      "transition-colors flex items-center gap-2 group"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-3 h-3 text-navy-600",
                      "group-hover:text-gold-500 group-hover:translate-x-1",
                      "transition-all"
                    )} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm text-navy-300 hover:text-gold-500",
                      "transition-colors flex items-center gap-2 group"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-3 h-3 text-navy-600",
                      "group-hover:text-gold-500 group-hover:translate-x-1",
                      "transition-all"
                    )} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-navy-400">
            © {new Date().getFullYear()} Veridian Group, Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-navy-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              SOC2 Type II Certified
            </span>
            <span className="text-sm text-navy-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              GDPR Compliant
            </span>
            <span className="text-sm text-navy-400">
              v2.4.0
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-navy-800">
          <p className="text-xs text-navy-500 text-center">
            This platform provides educational content and strategic recommendations. 
            Veridian Group is not a law firm, financial advisor, or registered investment 
            advisor. All Web3 and cryptocurrency strategies involve substantial risk. 
            Past performance does not guarantee future results. Consult with qualified 
            legal, tax, and financial professionals in your jurisdiction before 
            implementing any strategies.
          </p>
        </div>
      </div>
    </footer>
  )
}