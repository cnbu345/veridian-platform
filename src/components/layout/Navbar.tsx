// src/components/layout/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  Scale,
  GitCompare,
  Sparkles,
  FileText
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

  // Simplified nav links - only what's built and useful
  const navLinks = [
    { name: 'State Dashboard', href: '/state-requirements', icon: Scale, isPublic: true },
    { name: 'Compare States', href: '/compare', icon: GitCompare, isPublic: true },
    { name: 'Pricing', href: '/pricing', isPublic: true },
    { name: 'About', href: '/about', isPublic: true },
  ]

  // DON'T RENDER ANYTHING on admin routes
  if (isAdminRoute) {
    return null
  }

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200' 
          : 'bg-white border-b border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo - Simplified for mobile */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8">
                <img 
                  src="/veridian-logo-gold-192X192.png" 
                  alt="Veridian Group" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-navy-900">
                  Veridian
                </span>
                <span className="text-lg font-bold text-gold-600">
                  Group
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Simplified */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    pathname === item.href 
                      ? "text-gold-600"
                      : "text-navy-700 hover:text-gold-600"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-navy-700 hover:text-gold-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium text-navy-700 hover:text-gold-600 transition-colors"
                  >
                    Sign Out
                  </button>
                  <Link
                    href="/generate"
                    className="px-5 py-2 bg-gold-600 text-white text-sm font-semibold rounded-lg hover:bg-gold-700 transition-colors"
                  >
                    Get Report
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="px-4 py-2 text-sm font-medium text-navy-700 hover:text-gold-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth?signup=true"
                    className="px-5 py-2 bg-gold-600 text-white text-sm font-semibold rounded-lg hover:bg-gold-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden relative w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-4 h-4 text-navy-800" />
              ) : (
                <Menu className="w-4 h-4 text-navy-800" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Simplified */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
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
              <div className="px-4 py-6 space-y-6">
                {/* Mobile Nav Links */}
                <div className="space-y-1">
                  {navLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-navy-700 hover:bg-gold-50 hover:text-gold-600 rounded-lg transition-colors"
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100" />

                {/* Mobile Auth */}
                {user ? (
                  <div className="space-y-2 px-4">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 text-center text-base font-semibold text-white bg-navy-800 rounded-lg"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                      className="block w-full py-3 text-center text-base font-semibold text-navy-700 border border-slate-200 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    <Link
                      href="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 text-center text-base font-semibold text-white bg-navy-800 rounded-lg"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth?signup=true"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 text-center text-base font-semibold text-navy-800 bg-gold-500 rounded-lg"
                    >
                      Get Started
                    </Link>
                  </div>
                )}

                {/* Trust Badge */}
                <div className="px-4 pt-4">
                  <div className="text-center text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Founder's Circle: $997
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}