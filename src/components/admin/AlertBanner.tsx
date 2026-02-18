// src/components/admin/AlertBanner.tsx
'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, XCircle, AlertCircle, X } from 'lucide-react'

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  service: string
  timestamp: string
}

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)
  
  useEffect(() => {
    // Connect to WebSocket for real-time alerts
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/admin/alerts/ws`
    
    const websocket = new WebSocket(wsUrl)
    
    websocket.onmessage = (event) => {
      const alert = JSON.parse(event.data)
      setAlerts(prev => [alert, ...prev].slice(0, 5)) // Keep last 5
      
      // Play sound for critical alerts
      if (alert.severity === 'critical') {
        new Audio('/alert.mp3').play().catch(() => {})
      }
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(`Veridian Alert: ${alert.service}`, {
          body: alert.message,
          icon: '/icon.png'
        })
      }
    }
    
    setWs(websocket)
    
    return () => {
      websocket.close()
    }
  }, [])
  
  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }
  
  if (alerts.length === 0) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-96">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg shadow-lg border ${
            alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
            alert.severity === 'warning' ? 'bg-amber-50 border-amber-200' :
            'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {alert.severity === 'critical' && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
            {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
            {alert.severity === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-sm">{alert.service}</h4>
                <button onClick={() => dismissAlert(alert.id)}>
                  <X className="w-4 h-4 text-navy-400 hover:text-navy-600" />
                </button>
              </div>
              <p className="text-sm mt-1">{alert.message}</p>
              <p className="text-xs text-navy-500 mt-1">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}