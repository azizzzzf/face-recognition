'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/components/auth/AuthForm'
import { useEffect } from 'react'

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData {
  email: string
  password: string
  name: string
  role: 'ADMIN' | 'USER'
  confirmPassword: string
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const { signUp, user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleRegister = async (data: RegisterFormData | LoginFormData) => {
    // Type guard to ensure we have RegisterFormData
    if (!('name' in data) || !('role' in data) || !('confirmPassword' in data)) {
      return { error: 'Invalid form data for registration' };
    }
    
    const registerData = data as RegisterFormData;
    setLoading(true)
    try {
      const result = await signUp(registerData.email, registerData.password, registerData.name, registerData.role)
      if (!result.error) {
        // Registration successful, redirect to login or dashboard
        router.push('/auth/login?message=registration-success')
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
          mode="register" 
          onSubmit={handleRegister} 
          loading={loading}
        />
      </div>
    </div>
  )
}