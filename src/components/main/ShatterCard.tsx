'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import ShatterEffect from './ShatterEffect'

interface ShatterCardProps {
  children: React.ReactNode
  onDelete: () => void
  className?: string
  isShattering: boolean
}

export default function ShatterCard({ children, onDelete, className, isShattering }: ShatterCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<'idle' | 'feedback' | 'shatter'>('idle')
  const [showShatter, setShowShatter] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }, [])

  useEffect(() => {
    if (isShattering && phaseRef.current === 'idle') {
      phaseRef.current = 'feedback'
      setShowShatter(false)
      scheduleTimer(() => {
        phaseRef.current = 'shatter'
        setShowShatter(true)
      }, 120)
    }
  }, [isShattering, scheduleTimer])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  return (
    <div
      className={className}
      ref={containerRef}
    >
      <div
        style={{
          transition: 'background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease',
          transform: phaseRef.current === 'feedback' ? 'scaleX(0.98)' : 'none',
          backgroundColor: phaseRef.current === 'feedback' ? 'rgba(30, 10, 10, 0.5)' : undefined,
          borderColor: phaseRef.current === 'feedback' ? 'rgba(239, 68, 68, 0.5)' : undefined,
          boxShadow: phaseRef.current === 'feedback' ? '0 0 15px rgba(239, 68, 68, 0.3)' : undefined,
        }}
      >
        {children}
      </div>
      {showShatter && (
        <ShatterEffect
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          onComplete={onDelete}
          duration={500}
        />
      )}
    </div>
  )
}
