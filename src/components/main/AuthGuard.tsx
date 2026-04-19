'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/landing' && !isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, pathname, router])

  if (!isLoggedIn && pathname !== '/landing') {
    return null
  }

  return <>{children}</>
}
