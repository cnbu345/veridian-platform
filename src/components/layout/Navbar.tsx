'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  ChevronDown,
  FileText,
  DollarSign,
  Building2,
  Users,
  LogIn,
  UserPlus,
  BarChart3,
  Shield,
  BookOpen,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface NavbarProps {
  initialUser: User | null
}

export default function Navbar({ initialUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(initialUser)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  const navLinks = [
    {
      name: 'Solutions',
      href: '#solutions',
      dropdown: [
        { name: 'Strategy Reports', href: '/generate', icon: FileText, description: 'AI-powered custom Web3 strategies' },
        { name: 'Regulatory Compliance', href: '/compliance', icon: Shield, description: 'State-by-state regulatory mapping' },
        { name: 'Talent Analysis', href: '/talent', icon: Users, description: 'Local Web3 talent density insights' },
        { name: 'Competitor Intel', href: '/competitive', icon: BarChart3, description: 'Market positioning analysis' },
      ]
    },
    {
      name: 'Pricing',
      href: '/pricing',
      dropdown: [
        { name: 'Single Report', href: '/pricing#single', icon: DollarSign, description: '$497 one-time purchase' },
        { name: 'Subscription', href: '/pricing#subscription', icon: Sparkles, description: '$197/month - 2 reports' },
        { name: 'Enterprise', href: '/enterprise', icon: Building2, description: 'Custom solutions for scale' },
      ]
    },
    {
      name: 'Resources',
      href: '#resources',
      dropdown: [
        { name: 'Sample Report', href: '/sample', icon: FileText, description: 'See what you get' },
        { name: 'Case Studies', href: '/case-studies', icon: BookOpen, description: 'Success stories' },
        { name: 'Web3 Guide', href: '/guide', icon: BookOpen, description: 'Executive introduction' },
      ]
    },
  ]

  return (
    <>
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled 
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-soft"
          : "bg-transparent"
      )}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className={cn(
                  "w-10 h-10",
                  "bg-gradient-to-br from-gold-500 to-gold-600",
                  "rounded-lg shadow-lg shadow-gold-500/20",
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse-slow" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <span className="text-xl font-display font-bold text-navy-900">
                  Veridian
                </span>
                <span className="text-xl font-display font-bold text-gold-600">
                  Group
                </span>
                <span className="ml-2 text-xs font-medium text-navy-500 bg-navy-50 px-2 py-0.5 rounded-full">
                  Executive
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.dropdown ? (
                    <button
                      className={cn(
                        "flex items-center gap-1.5 text-sm font-semibold transition-colors",
                        pathname === item.href 
                          ? "text-gold-600"
                          : "text-navy-700 hover:text-gold-600"
                      )}
                    >
                      {item.name}
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        activeDropdown === item.name && "rotate-180"
                      )} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        pathname === item.href 
                          ? "text-gold-600"
                          : "text-navy-700 hover:text-gold-600"
                      )}
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {activeDropdown === item.name && item.dropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "absolute top-full left-0 mt-2 w-72",
                          "bg-white rounded-card border border-slate-200",
                          "shadow-premium py-2"
                        )}
                      >
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className={cn(
                              "flex items-start gap-3 px-4 py-3",
                              "hover:bg-gold-50/50 transition-colors group"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 bg-navy-50 rounded-lg",
                              "flex items-center justify-center",
                              "group-hover:bg-gold-100 transition-colors"
                            )}>
                              <dropdownItem.icon className={cn(
                                "w-4 h-4 text-navy-600",
                                "group-hover:text-gold-600 transition-colors"
                              )} />
                            </div>
                            <div>
                              <div className={cn(
                                "text-sm font-semibold text-navy-900",
                                "group-hover:text-gold-600 transition-colors"
                              )}>
                                {dropdownItem.name}
                              </div>
                              <div className="text-xs text-navy-500">
                                {dropdownItem.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 text-sm font-semibold text-navy-700 hover:text-gold-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-5 py-2.5 text-sm font-semibold text-navy-700 hover:text-gold-600 transition-colors"
                  >
                    Sign Out
                  </button>
                  <Link
                    href="/generate"
                    className="btn-primary px-6 py-2.5 text-sm"
                  >
                    Get Report
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="px-5 py-2.5 text-sm font-semibold text-navy-700 hover:text-gold-600 transition-colors flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    href="/auth?signup=true"
                    className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "lg:hidden relative w-10 h-10",
                "rounded-lg bg-white/90 backdrop-blur-sm",
                "border border-slate-200 flex items-center justify-center"
              )}
            >
              {isOpen ? (
                <X className="w-5 h-5 text-navy-800" />
              ) : (
                <Menu className="w-5 h-5 text-navy-800" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-20 z-40 lg:hidden"
          >
            <div className="bg-white border-t border-slate-200 shadow-premium">
              <div className="container-custom py-6">
                <div className="space-y-6">
                  {/* Mobile Nav Links */}
                  {navLinks.map((item) => (
                    <div key={item.name} className="space-y-3">
                      <div className="text-sm font-semibold text-navy-400 uppercase tracking-wider">
                        {item.name}
                      </div>
                      {item.dropdown ? (
                        <div className="space-y-2 pl-2">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gold-50 transition-colors"
                            >
                              <dropdownItem.icon className="w-4 h-4 text-navy-500" />
                              <span className="text-sm font-medium text-navy-700">
                                {dropdownItem.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="block py-2 text-sm font-medium text-navy-700 hover:text-gold-600"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}

                  {/* Mobile Auth */}
                  <div className="pt-6 border-t border-slate-200">
                    {user ? (
                      <div className="space-y-3">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="block w-full px-4 py-3 text-center text-sm font-semibold text-navy-700 bg-navy-50 rounded-lg hover:bg-navy-100"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setIsOpen(false)
                          }}
                          className="block w-full px-4 py-3 text-center text-sm font-semibold text-navy-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          href="/auth"
                          onClick={() => setIsOpen(false)}
                          className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-navy-800 rounded-lg hover:bg-navy-700"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth?signup=true"
                          onClick={() => setIsOpen(false)}
                          className="block w-full px-4 py-3 text-center text-sm font-semibold text-navy-800 bg-gold-500 rounded-lg hover:bg-gold-400"
                        >
                          Get Started
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}