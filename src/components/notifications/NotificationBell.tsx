// src/components/notifications/NotificationBell.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  MessageSquare, 
  Calendar, 
  FileText, 
  CreditCard, 
  AlertCircle, 
  X, 
  ExternalLink, 
  Trash2,
  User,
  RefreshCw,
  HelpCircle,
  Archive,
  Inbox,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data: any
  is_read: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  link: string | null
  created_at: string
  expires_at: string | null
}

interface NotificationBellProps {
  isAdmin?: boolean
}

const NOTIFICATION_ICONS: Record<string, any> = {
  support_reply: MessageSquare,
  consultation_reminder: Clock,
  consultation_scheduled: Calendar,
  consultation_cancelled: Calendar,
  report_ready: FileText,
  report_failed: AlertCircle,
  payment_succeeded: CreditCard,
  payment_failed: AlertCircle,
  subscription_updated: CreditCard,
  system_alert: AlertCircle,
  welcome: Check,
  ticket_created: MessageSquare,
  ticket_updated: MessageSquare,
  ticket_resolved: CheckCheck,
  ticket_reopened: RefreshCw,
  user_registered: User,
  new_subscription: CreditCard,
  enterprise_lead: Building2
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700'
}

export default function NotificationBell({ isAdmin = false }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const pollingIntervalRef = useRef<NodeJS.Timeout>()

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    return NOTIFICATION_ICONS[type] || Bell
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=10&includeRead=true')
      const data = await response.json()
      
      if (response.ok) {
        const oldCount = unreadCount
        const newNotifications = data.notifications || []
        const newUnreadCount = data.unreadCount || 0
        
        setNotifications(newNotifications)
        setUnreadCount(newUnreadCount)
        
        // Check if we got new unread notifications
        if (newUnreadCount > oldCount) {
          console.log('🔔 New notification detected via polling!')
          
          // Find the newest notification
          const newest = newNotifications.find((n: Notification) => !n.is_read)
          if (newest) {
            // Show toast
            toast.custom((t) => (
              <div className={cn(
                "max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
                t.visible ? 'animate-enter' : 'animate-leave'
              )}>
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {(() => {
                        const Icon = getNotificationIcon(newest.type)
                        return <Icon className="h-6 w-6 text-gold-600" />
                      })()}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                      <p className="text-sm font-medium text-navy-900">
                        {newest.title}
                      </p>
                      <p className="mt-1 text-sm text-navy-500">
                        {newest.message}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="rounded-md inline-flex text-navy-400 hover:text-navy-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ), { duration: 5000 })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [unreadCount])

  // Initial fetch and polling
  useEffect(() => {
    console.log('🔔 NotificationBell mounted - starting polling')
    
    // Fetch immediately
    fetchNotifications()
    
    // Set up polling every 5 seconds
    pollingIntervalRef.current = setInterval(fetchNotifications, 5000)
    
    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [fetchNotifications])

  // Try real-time but don't rely on it
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      console.log('Attempting real-time connection (non-critical)')
      
      const channel = supabase
        .channel('notifications-fallback')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('📡 Real-time worked!', payload)
            fetchNotifications()
          }
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }

    setupRealtime()
  }, [supabase, fetchNotifications])

  // Mark notifications as read
  const markAsRead = async (notificationIds?: string[]) => {
    try {
      const ids = notificationIds || notifications.filter(n => !n.is_read).map(n => n.id)
      
      if (ids.length === 0) return

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            ids.includes(n.id) ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - ids.length))
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      toast.error('Failed to update notifications')
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark notifications as read')
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead([notification.id])
    }
    
    if (notification.link) {
      let finalLink = notification.link
      
      // Special handling for enterprise leads
      if (notification.type === 'enterprise_lead') {
        finalLink = `/admin/customers/enterprise/builder?lead=${notification.data?.lead_id}`
      } else {
        // Only modify support-related links
        if (isAdmin) {
          if (finalLink.includes('/support?')) {
            finalLink = finalLink.replace('/support?', '/admin/support?')
          } else if (finalLink.includes('/dashboard/support?')) {
            finalLink = finalLink.replace('/dashboard/support?', '/admin/support?')
          }
        } else {
          if (finalLink.includes('/admin/support?')) {
            finalLink = finalLink.replace('/admin/support?', '/dashboard/support?')
          }
        }
      }
      
      router.push(finalLink)
      setShowDropdown(false)
      console.log('Original link:', notification.link)
      console.log('Final link:', finalLink)
    }
  }

  const getViewAllLink = () => {
    return isAdmin ? '/admin/notifications' : '/dashboard/notifications'
  }

  return (
    <div className="relative inline-block">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-navy-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-[480px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[9999]"
          style={{ 
            maxWidth: 'calc(100vw - 2rem)',
            right: 0,
            top: '100%'
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                className="text-xs text-navy-600 hover:text-navy-700 font-medium transition-colors px-2 py-1 hover:bg-slate-200 rounded flex items-center gap-1"
                title="Refresh"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gold-600 hover:text-gold-700 font-medium transition-colors px-2 py-1 hover:bg-gold-50 rounded"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-navy-500">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                const isReopened = notification.type === 'ticket_reopened'
                
                // Check the context from the notification data
                const isAdminContext = notification.data?.context === 'admin'
                const isCustomerContext = notification.data?.context === 'customer'
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "px-4 py-4 border-b border-slate-100 last:border-0 cursor-pointer transition-all hover:bg-slate-50",
                      !notification.is_read && "bg-gold-50/30 hover:bg-gold-100/50",
                      isReopened && !notification.is_read && "border-l-4 border-l-amber-500",
                      // Add different left border for admin context
                      isAdminContext && !notification.is_read && "border-l-4 border-l-purple-500"
                    )}
                  >
                    <div className="flex gap-4">
                      {/* Icon with different colors based on context */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        !notification.is_read 
                          ? isAdminContext 
                            ? "bg-purple-100"  // Admin notifications use purple
                            : "bg-gold-100"     // Customer notifications use gold
                          : "bg-slate-100",
                        isReopened && !notification.is_read && "bg-amber-100"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          !notification.is_read 
                            ? isAdminContext
                              ? "text-purple-600"
                              : "text-gold-600"
                            : "text-navy-500",
                          isReopened && !notification.is_read && "text-amber-600"
                        )} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn(
                              "text-sm",
                              !notification.is_read ? "font-semibold text-navy-900" : "text-navy-700"
                            )}>
                              {notification.title}
                            </p>
                            {/* Add context badge */}
                            {isAdminContext && (
                              <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                Admin
                              </span>
                            )}
                            {isCustomerContext && (
                              <span className="ml-2 px-1.5 py-0.5 bg-gold-100 text-gold-700 rounded-full text-xs font-medium">
                                Customer
                              </span>
                            )}
                            {isReopened && (
                              <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                Reopened
                              </span>
                            )}
                          </div>
                          {notification.priority !== 'normal' && (
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0",
                              PRIORITY_COLORS[notification.priority]
                            )}>
                              {notification.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-navy-600 mt-1 break-words leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-navy-400">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {notification.link && (
                            <span className="text-xs text-gold-600 flex items-center gap-1 hover:text-gold-700">
                              View details
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {!notification.is_read && (
                        <div className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0 mt-2 animate-pulse",
                          isAdminContext ? "bg-purple-600" : "bg-gold-600"
                        )} />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <Link
              href={getViewAllLink()}
              className="block text-center text-sm text-gold-600 hover:text-gold-700 font-medium py-1 transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}