// src/app/dashboard/notifications/NotificationsClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, Check, Clock, MessageSquare, Calendar, FileText, 
  CreditCard, AlertCircle, Trash2, Filter, ChevronDown,
  ExternalLink, CheckCheck, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data: any
  is_read: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  link: string | null
  created_at: string
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
  feedback_response: Check,
  feedback_status_updated: RefreshCw
}

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700'
}

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=50&includeRead=true')
      const data = await response.json()
      if (response.ok) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, is_read: true } : n
        ))
      }
    } catch (error) {
      console.error('Error marking as read:', error)
      toast.error('Failed to update notifications')
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
      toast.success('All notifications marked as read')
    }
  }

  const clearOld = async () => {
    try {
      const response = await fetch('/api/notifications?olderThan=30d', {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => {
          const daysOld = (Date.now() - new Date(n.created_at).getTime()) / (1000 * 60 * 60 * 24)
          return daysOld <= 30
        }))
        toast.success('Old notifications cleared')
      }
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast.error('Failed to clear notifications')
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.is_read) return false
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    return true
  })

  const notificationTypes = ['all', ...new Set(notifications.map(n => n.type))]

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Notifications</h1>
          <p className="text-navy-600">Stay updated on your reports, consultations, and support tickets</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Mark all as read
          </button>
          <button
            onClick={clearOld}
            className="px-4 py-2 text-sm border border-slate-200 text-navy-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Clear old
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === 'unread' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600 hover:text-navy-900'
              )}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === 'all' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-600 hover:text-navy-900'
              )}
            >
              All
            </button>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
          >
            {notificationTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Bell className="w-16 h-16 text-navy-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No notifications</h3>
            <p className="text-navy-500">
              {filter === 'unread' 
                ? 'You have no unread notifications' 
                : 'No notifications to display'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const Icon = NOTIFICATION_ICONS[notification.type] || Bell
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "bg-white rounded-xl border border-slate-200 p-6 transition-all",
                  !notification.is_read && "border-l-4 border-l-gold-500 bg-gold-50/30"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    !notification.is_read ? "bg-gold-100" : "bg-slate-100"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      !notification.is_read ? "text-gold-600" : "text-navy-500"
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={cn(
                          "text-lg mb-1",
                          !notification.is_read ? "font-bold text-navy-900" : "font-semibold text-navy-800"
                        )}>
                          {notification.title}
                        </h3>
                        <p className="text-navy-600">{notification.message}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {notification.priority !== 'normal' && (
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            PRIORITY_COLORS[notification.priority]
                          )}>
                            {notification.priority}
                          </span>
                        )}
                        <span className="text-sm text-navy-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-navy-400">
                        {format(new Date(notification.created_at), 'MMMM d, yyyy h:mm a')}
                      </span>
                      <span className="text-xs text-navy-300">•</span>
                      <span className="text-xs text-navy-400 capitalize">
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="inline-flex items-center gap-1 text-sm text-gold-600 hover:text-gold-700 font-medium"
                          onClick={() => !notification.is_read && markAsRead([notification.id])}
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead([notification.id])}
                          className="text-sm text-navy-500 hover:text-navy-700"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}