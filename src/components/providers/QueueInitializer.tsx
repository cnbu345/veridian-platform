// src/components/providers/QueueInitializer.tsx // Starts queue on client
'use client'

import { useEffect } from 'react'

export default function QueueInitializer() {
  useEffect(() => {
    // This runs only on the client side
    // We need to call the server to start the queue processor
    
    const initializeQueue = async () => {
      try {
        const response = await fetch('/api/queue/start', {
          method: 'POST',
        })
        const data = await response.json()
        console.log('Queue initialization response:', data)
      } catch (error) {
        console.error('Failed to initialize queue:', error)
      }
    }

    initializeQueue()
  }, [])

  // This component doesn't render anything
  return null
}