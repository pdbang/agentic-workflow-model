'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Activate = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace('/apps')
  }, [router])

  return null
}

export default Activate
