// src/app/dashboard/components/DashboardSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/utils'
import { 
  FileText, 
  Settings, 
  User, 
  LogOut,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Camera,
  Calendar,
  MessageCircle,
  HelpCircle,
  BookOpen,
  PlusCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Tooltip from '@/components/ui/Tooltip'

interface DashboardSidebarProps {
  user: any
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    support: true // Default expanded
  })
  const [profileImage, setProfileImage] = useState<string | null>(
    user.user_metadata?.avatar_url || null
  )
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && session?.user?.user_metadata?.avatar_url) {
        setProfileImage(session.user.user_metadata.avatar_url)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleProfileImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) throw updateError

      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      router.refresh()
    } catch (error) {
      console.error('Error uploading profile image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }))
  }

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'My Reports',
      href: '/dashboard/reports',
      icon: FileText
    },
    {
      name: 'Consultations',
      href: '/dashboard/consultations',
      icon: Calendar
    },
    {
      name: 'Support',
      href: '/dashboard/support',
      icon: MessageCircle,
      subItems: [
        { title: 'My Tickets', href: '/dashboard/support', icon: MessageCircle },
        { title: 'FAQ', href: '/dashboard/support/faq', icon: HelpCircle },
        { title: 'Knowledge Base', href: '/dashboard/support/kb', icon: BookOpen },
      ]
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const isSubItemActive = (href: string) => {
    return pathname === href
  }

  // Check if any subitem is active to keep menu expanded
  const isSupportActive = navItems[3].subItems?.some(item => pathname === item.href) || pathname.startsWith('/dashboard/support')

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-navy-900 transition-all duration-300 z-30 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-4 border-b border-navy-700 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 relative shrink-0">
            <Image
              src="/veridian-logo-gold-192X192.png"
              alt="Veridian"
              width={32}
              height={32}
              className="object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-gold-500">
              Veridian
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 hover:bg-navy-800 rounded-lg transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gold-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gold-400" />
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-navy-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button
              onClick={handleProfileImageClick}
              disabled={isUploading}
              className="w-10 h-10 rounded-full overflow-hidden bg-navy-800 flex items-center justify-center ring-2 ring-gold-500/50 group-hover:ring-gold-500 transition-all"
            >
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gold-400" />
              )}
            </button>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-3 h-3 text-navy-900" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gold-400 truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-navy-400 truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-visible">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isExpanded = expandedMenus[item.name.toLowerCase()] || (item.name === 'Support' && isSupportActive)

            // If collapsed, render simple tooltip links
            if (collapsed) {
              if (hasSubItems) {
                // For items with subitems in collapsed mode, just show the parent with tooltip
                return (
                  <Tooltip key={item.href} text={item.name}>
                    <div className="relative">
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          active
                            ? "bg-gold-500 text-navy-900"
                            : "text-gold-400 hover:bg-gold-500"
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4 shrink-0",
                          active ? "text-navy-900" : "text-gold-400",
                          !active && "hover:text-navy-900"
                        )} />
                      </Link>
                    </div>
                  </Tooltip>
                )
              }
              
              return (
                <Tooltip key={item.href} text={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      active
                        ? "bg-gold-500 text-navy-900"
                        : "text-gold-400 hover:bg-gold-500"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 shrink-0",
                      active ? "text-navy-900" : "text-gold-400",
                      !active && "hover:text-navy-900"
                    )} />
                  </Link>
                </Tooltip>
              )
            }

            // Expanded mode
            return (
              <div key={item.href} className="space-y-1">
                {/* Parent Item */}
                {hasSubItems ? (
                  <button
                    onClick={() => toggleMenu(item.name.toLowerCase())}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      active && !isSupportActive
                        ? "bg-gold-500 text-navy-900"
                        : "text-gold-400 hover:bg-gold-500"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 shrink-0",
                      active && !isSupportActive ? "text-navy-900" : "text-gold-400 group-hover:text-navy-900"
                    )} />
                    <span className={cn(
                      "flex-1 text-left",
                      !active && "group-hover:text-navy-900"
                    )}>{item.name}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gold-400 group-hover:text-navy-900" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gold-400 group-hover:text-navy-900" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      active
                        ? "bg-gold-500 text-navy-900"
                        : "text-gold-400 hover:bg-gold-500"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 shrink-0",
                      active ? "text-navy-900" : "text-gold-400 group-hover:text-navy-900"
                    )} />
                    <span className={cn(
                      "flex-1",
                      !active && "group-hover:text-navy-900"
                    )}>{item.name}</span>
                  </Link>
                )}

                {/* Sub Items */}
                {hasSubItems && isExpanded && (
                  <div className="ml-9 pl-2 border-l border-navy-700 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const SubIcon = subItem.icon || MessageCircle
                      const subActive = isSubItemActive(subItem.href)
                      
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                            subActive
                              ? "bg-gold-500/20 text-gold-400"
                              : "text-navy-400 hover:bg-navy-800 hover:text-gold-400"
                          )}
                        >
                          <SubIcon className="w-4 h-4 shrink-0" />
                          <span className="flex-1">{subItem.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t border-navy-700 shrink-0">
        {collapsed ? (
          <Tooltip text="Sign Out">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center px-3 py-2 w-full text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors group"
          >
            <LogOut className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  )
}