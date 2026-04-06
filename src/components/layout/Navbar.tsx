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
  Sparkles,
  Scale,
  Landmark,
  Briefcase,
  Import
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
  const [isAdminRoute, setIsAdminRoute] = useState(false)
  
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Check if current route is admin
  useEffect(() => {
    setIsAdminRoute(pathname?.startsWith('/admin') || false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

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
        { name: 'Regulatory Intelligence Reports', href: '/generate', icon: Scale, description: 'State-by-state compliance analysis for digital assets' },
        { name: 'Compliance Monitoring', href: '/compliance', icon: Shield, description: 'Track regulatory changes across all 50 states' },
        { name: 'Risk Assessment', href: '/risk', icon: Landmark, description: 'Location-based exposure analysis for institutions' },
        { name: 'Enterprise Solutions', href: '/enterprise', icon: Briefcase, description: 'Custom compliance frameworks for scale' },
      ]
    },
    {
      name: 'Pricing',
      href: '/pricing',
      dropdown: [
        { name: 'Single Report', href: '/pricing#single', icon: FileText, description: '$2,497 one-time purchase' },
        { name: 'Quarterly Subscription', href: '/pricing#quarterly', icon: Sparkles, description: '$3,997/year - 4 reports' },
        { name: 'Monthly Subscription', href: '/pricing#monthly', icon: Building2, description: '$7,997/year - 12 reports' },
        { name: 'Enterprise', href: '/enterprise', icon: Building2, description: 'Starting at $15,000/year' },
      ]
    },
    {
      name: 'Resources',
      href: '#resources',
      dropdown: [
        { name: 'Sample Report', href: '/sample', icon: FileText, description: 'See the compliance intelligence' },
        { name: 'Case Studies', href: '/case-studies', icon: BookOpen, description: 'How banks use our intelligence' },
        { name: 'Regulatory Guide', href: '/guide', icon: BookOpen, description: 'State of digital asset regulation' },
      ]
    },
    {
      name: 'State Requirements',
      href: '/state-requirements',
      isPublic: true
    }
  ]

  // DON'T RENDER ANYTHING on admin routes
  if (isAdminRoute) {
    return null
  }

  // ALWAYS solid with dark text - no transparency
  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-soft">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="relative w-8 h-8 md:w-10 md:h-10">
                <img 
                  src="/veridian-logo-gold-192X192.png" 
                  alt="Veridian Group" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-lg md:text-xl font-display font-bold text-navy-900">
                  Veridian
                </span>
                <span className="text-lg md:text-xl font-display font-bold text-gold-600 ml-0 sm:ml-1">
                  Group
                </span>
                <span className="hidden xs:inline ml-0 sm:ml-2 text-[10px] md:text-xs font-medium text-navy-500 bg-navy-50 px-1.5 md:px-2 py-0.5 rounded-full whitespace-nowrap">
                  Regulatory Intelligence
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
                    className="bg-gold-600 text-white px-6 py-2.5 text-sm font-semibold rounded-lg hover:bg-gold-700 transition-colors flex items-center gap-2"
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
              className="lg:hidden relative w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-4 h-4 md:w-5 md:h-5 text-navy-800" />
              ) : (
                <Menu className="w-4 h-4 md:w-5 md:h-5 text-navy-800" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ top: '64px' }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 bg-white shadow-xl border-t border-slate-200"
              style={{ 
                maxHeight: 'calc(100vh - 64px)',
                overflowY: 'auto'
              }}
            >
              <div className="container-custom py-4 md:py-6">
                <div className="space-y-4 md:space-y-6 pb-8">
                  {/* Mobile Nav Links */}
                  {navLinks.map((item) => (
                    <div key={item.name} className="space-y-2 md:space-y-3">
                      <div className="text-xs md:text-sm font-semibold text-navy-400 uppercase tracking-wider px-2">
                        {item.name}
                      </div>
                      {item.dropdown ? (
                        <div className="space-y-1 md:space-y-2 pl-2">
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-2 md:gap-3 py-2 md:py-3 px-3 rounded-lg hover:bg-gold-50 transition-colors"
                            >
                              <dropdownItem.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-navy-500" />
                              <span className="text-xs md:text-sm font-medium text-navy-700">
                                {dropdownItem.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="block py-2 px-3 text-xs md:text-sm font-medium text-navy-700 hover:text-gold-600"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}

                  {/* Mobile Auth */}
                  <div className="pt-4 md:pt-6 border-t border-slate-200 px-2">
                    {user ? (
                      <div className="space-y-2 md:space-y-3">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="block w-full px-4 py-2.5 md:py-3 text-center text-xs md:text-sm font-semibold text-navy-700 bg-navy-50 rounded-lg hover:bg-navy-100"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setIsOpen(false)
                          }}
                          className="block w-full px-4 py-2.5 md:py-3 text-center text-xs md:text-sm font-semibold text-navy-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 md:space-y-3">
                        <Link
                          href="/auth"
                          onClick={() => setIsOpen(false)}
                          className="block w-full px-4 py-2.5 md:py-3 text-center text-xs md:text-sm font-semibold text-white bg-navy-800 rounded-lg hover:bg-navy-700"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/auth?signup=true"
                          onClick={() => setIsOpen(false)}
                          className="block w-full px-4 py-2.5 md:py-3 text-center text-xs md:text-sm font-semibold text-navy-800 bg-gold-500 rounded-lg hover:bg-gold-400"
                        >
                          Get Started
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Extra bottom padding */}
                  <div className="h-4 md:h-8" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}