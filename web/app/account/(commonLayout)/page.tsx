'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Account() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/apps')
  }, [router])

  return null
}
