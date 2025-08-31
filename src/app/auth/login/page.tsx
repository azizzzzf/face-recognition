'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/components/auth/AuthForm'
import { useEffect } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { signIn, user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true)
    try {
      const result = await signIn(data.email, data.password)
      if (!result.error) {
        router.push('/')
      }
      return result
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthForm 
          mode="login" 
          onSubmit={handleLogin} 
          loading={loading}
        />
      </div>
    </div>
  )
}