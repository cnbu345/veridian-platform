// src/components/layout/Footer.tsx
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
  ChevronRight,
  Scale,
  Landmark
} from 'lucide-react'

const navigation = {
  solutions: [
    { name: 'Regulatory Intelligence', href: '/generate', icon: Scale },
    { name: 'Compliance Monitoring', href: '/compliance-page', icon: Shield },
    { name: 'Risk Assessment', href: '/risk', icon: Landmark },
    { name: 'Enterprise Solutions', href: '/enterprise', icon: Building2 },
    { name: 'API Access', href: '/api-page', icon: Sparkles },
  ],
  resources: [
    { name: 'Sample Report', href: '/sample' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Regulatory Guide', href: '/guide' },
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

      <div className="relative container-custom pt-12 md:pt-16 pb-6 md:pb-8">
        {/* Main Footer Content - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12 pb-8 md:pb-12 border-b border-navy-800">
          {/* Brand Column - Full width on mobile, then 2 cols on sm, 4 on lg */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10">
                <img 
                  src="/veridian-logo-gold-192X192.png" 
                  alt="Veridian Group" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-lg md:text-xl font-display font-bold text-white">
                  Veridian
                </span>
                <span className="text-lg md:text-xl font-display font-bold text-gold-500">
                  Group
                </span>
              </div>
            </Link>
            
            <p className="text-navy-300 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 max-w-md">
              Regulatory intelligence for digital assets. Trusted by compliance officers,
              law firms, and financial institutions for state-by-state analysis.
            </p>

            {/* Contact Info - Stack on mobile */}
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-navy-300">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gold-500 flex-shrink-0" />
                <span className="truncate">548 Market St, San Francisco, CA 94104</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-navy-300">
                <Mail className="w-3 h-3 md:w-4 md:h-4 text-gold-500 flex-shrink-0" />
                <a href="mailto:compliance@veridiangroup.com" className="hover:text-gold-500 transition truncate">
                  compliance@veridiangroup.com
                </a>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-navy-300">
                <Phone className="w-3 h-3 md:w-4 md:h-4 text-gold-500 flex-shrink-0" />
                <a href="tel:+18885550987" className="hover:text-gold-500 transition">
                  (888) 555-0987
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 md:gap-3">
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
                      "w-8 h-8 md:w-10 md:h-10 bg-navy-800 rounded-lg",
                      "flex items-center justify-center",
                      "hover:bg-gold-500/10 hover:border-gold-500",
                      "border border-transparent transition-all duration-300 group"
                    )}
                  >
                    <Icon className={cn(
                      "w-3 h-3 md:w-4 md:h-4 text-navy-300",
                      "group-hover:text-gold-500 transition-colors"
                    )} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Navigation Links - 2 columns on mobile, 4 columns on sm+ */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold text-sm md:text-base mb-3 md:mb-4">Solutions</h3>
            <ul className="space-y-2 md:space-y-3">
              {navigation.solutions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-xs md:text-sm text-navy-300 hover:text-gold-500",
                      "transition-colors flex items-center gap-1 md:gap-2 group"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-2 h-2 md:w-3 md:h-3 text-navy-600",
                      "group-hover:text-gold-500 group-hover:translate-x-1",
                      "transition-all"
                    )} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold text-sm md:text-base mb-3 md:mb-4">Resources</h3>
            <ul className="space-y-2 md:space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-xs md:text-sm text-navy-300 hover:text-gold-500",
                      "transition-colors flex items-center gap-1 md:gap-2 group"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-2 h-2 md:w-3 md:h-3 text-navy-600",
                      "group-hover:text-gold-500 group-hover:translate-x-1",
                      "transition-all"
                    )} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold text-sm md:text-base mb-3 md:mb-4">Company</h3>
            <ul className="space-y-2 md:space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-xs md:text-sm text-navy-300 hover:text-gold-500",
                      "transition-colors flex items-center gap-1 md:gap-2 group"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-2 h-2 md:w-3 md:h-3 text-navy-600",
                      "group-hover:text-gold-500 group-hover:translate-x-1",
                      "transition-all"
                    )} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 sm:col-span-1 lg:col-span-2">
            <h3 className="text-white font-semibold text-sm md:text-base mb-3 md:mb-4">Legal</h3>
            <ul className="space-y-2 md:space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-xs md:text-sm text-navy-300 hover:text-gold-500",
                      "transition-colors flex items-center gap-1 md:gap-2 group"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-2 h-2 md:w-3 md:h-3 text-navy-600",
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

        {/* Bottom Bar - Stack on mobile */}
        <div className="pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="text-xs md:text-sm text-navy-400 text-center md:text-left">
            © {new Date().getFullYear()} Veridian Group, Inc. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6">
            <span className="text-xs md:text-sm text-navy-400 flex items-center gap-1 md:gap-2">
              <Shield className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden xs:inline">SOC2 Type II Certified</span>
              <span className="xs:hidden">SOC2</span>
            </span>
            <span className="text-xs md:text-sm text-navy-400 flex items-center gap-1 md:gap-2">
              <Shield className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden xs:inline">GDPR Compliant</span>
              <span className="xs:hidden">GDPR</span>
            </span>
            <span className="text-xs md:text-sm text-navy-400">
              v2.5.0
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-navy-800">
          <p className="text-[10px] md:text-xs text-navy-500 text-center leading-relaxed">
            This platform provides regulatory intelligence and educational content. 
            Veridian Group is not a law firm, financial advisor, or registered investment 
            advisor. All compliance recommendations should be reviewed with qualified 
            legal counsel in your jurisdiction. Regulatory information is updated 
            weekly but may not reflect the most current legislative changes.
          </p>
        </div>
      </div>
    </footer>
  )
}