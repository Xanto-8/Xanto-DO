'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl backdrop-blur-xl border transition-all duration-300',
        'bg-black/60',
        'border-green-500/20',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]',
        hover && 'hover:bg-black/70 hover:border-green-500/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:-translate-y-1',
        className
      )}
    >
      <div className="relative z-10 p-6">{children}</div>
      
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
    </div>
  )
}
