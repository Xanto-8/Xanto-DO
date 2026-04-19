'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function Home() {
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/main')
    } else {
      router.push('/landing')
    }
  }, [isLoggedIn, router])

  return null
}
