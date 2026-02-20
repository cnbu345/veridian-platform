// src/components/ui/Tooltip.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  children: React.ReactNode
  text: string
}

export default function Tooltip({ children, text }: TooltipProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top + (rect.height / 2),
        left: rect.right + 12
      })
    }
  }

  const handleMouseEnter = () => {
    updatePosition()
    setShow(true)
  }

  const handleMouseLeave = () => {
    setShow(false)
  }

  // Handle scroll and resize events
  useEffect(() => {
    if (!show) return

    const handleEvents = () => {
      updatePosition()
    }

    window.addEventListener('scroll', handleEvents, true)
    window.addEventListener('resize', handleEvents)

    return () => {
      window.removeEventListener('scroll', handleEvents, true)
      window.removeEventListener('resize', handleEvents)
    }
  }, [show])

  if (!mounted) {
    return <div ref={triggerRef}>{children}</div>
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {show && createPortal(
        <div 
          className="fixed px-2.5 py-1.5 bg-navy-900 text-white text-xs font-medium rounded-md whitespace-nowrap shadow-xl z-[9999] pointer-events-none"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translateY(-50%)'
          }}
        >
          {text}
          <div 
            className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-navy-900"
          />
        </div>,
        document.body
      )}
    </>
  )
}