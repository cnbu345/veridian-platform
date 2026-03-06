// src/components/notifications/NotificationBell.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
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
  Inbox
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
  new_subscription: CreditCard
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
  const pathname = usePathname()

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
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=10')
      const data = await response.json()
      
      if (response.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } else {
        console.error('Error fetching notifications:', data.error)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchNotifications()
    
    // Get current user for real-time subscription
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Subscribe to new notifications
      const subscription = supabase
        .channel('notifications-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification
            setNotifications(prev => [newNotification, ...prev].slice(0, 10))
            setUnreadCount(prev => prev + 1)
            
            // Show toast for new notifications
            toast.custom((t) => (
              <div className={cn(
                "max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
                t.visible ? 'animate-enter' : 'animate-leave'
              )}>
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {(() => {
                        const Icon = NOTIFICATION_ICONS[newNotification.type] || Bell
                        return <Icon className="h-6 w-6 text-gold-600" />
                      })()}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                      <p className="text-sm font-medium text-navy-900">
                        {newNotification.title}
                      </p>
                      <p className="mt-1 text-sm text-navy-500">
                        {newNotification.message}
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
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }

    setupRealtimeSubscription()
  }, [])

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

      const data = await response.json()

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            ids.includes(n.id) ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - ids.length))
      } else {
        throw new Error(data.error || 'Failed to mark notifications as read')
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      toast.error('Failed to update notifications')
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })

      const data = await response.json()

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      } else {
        throw new Error(data.error || 'Failed to mark notifications as read')
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark notifications as read')
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?clearAll=true', {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setNotifications([])
        setUnreadCount(0)
        toast.success('All notifications cleared')
      } else {
        throw new Error(data.error || 'Failed to clear notifications')
      }
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast.error('Failed to clear notifications')
    }
  }

  // Handle notification click with proper routing based on user role
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await markAsRead([notification.id])
    }
    
    // Navigate to the link if it exists
    if (notification.link) {
      let finalLink = notification.link
      
      // Force correct routing based on user role
      if (isAdmin) {
        // If admin, ensure link goes to admin section
        if (finalLink.includes('/support?')) {
          finalLink = finalLink.replace('/support?', '/admin/support?')
        } else if (finalLink.includes('/dashboard/support?')) {
          finalLink = finalLink.replace('/dashboard/support?', '/admin/support?')
        }
      } else {
        // If client, ensure link goes to client section
        if (finalLink.includes('/admin/support?')) {
          finalLink = finalLink.replace('/admin/support?', '/support?')
        }
      }
      
      console.log('🔔 Notification clicked:', {
        original: notification.link,
        final: finalLink,
        isAdmin
      })
      
      router.push(finalLink)
      setShowDropdown(false)
    }
  }

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    return NOTIFICATION_ICONS[type] || Bell
  }

  // Get the correct "View all" link based on admin status
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
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gold-600 hover:text-gold-700 font-medium transition-colors px-2 py-1 hover:bg-gold-50 rounded"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors px-2 py-1 hover:bg-red-50 rounded flex items-center gap-1"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
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
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "px-4 py-4 border-b border-slate-100 last:border-0 cursor-pointer transition-all hover:bg-slate-50",
                      !notification.is_read && "bg-gold-50/30 hover:bg-gold-100/50",
                      isReopened && !notification.is_read && "border-l-4 border-l-amber-500"
                    )}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        !notification.is_read ? "bg-gold-100" : "bg-slate-100",
                        isReopened && !notification.is_read && "bg-amber-100"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          !notification.is_read ? "text-gold-600" : "text-navy-500",
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
                        <div className="w-2 h-2 bg-gold-600 rounded-full flex-shrink-0 mt-2 animate-pulse" />
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