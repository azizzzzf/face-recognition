'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { DynamicAuthForm } from '@/components/DynamicComponents'
import { AuthGuard } from '@/components/AuthGuard'
import { Alert, AlertDescription } from '@/ui/alert'
import { CheckCircle } from 'lucide-react'

function LoginContent() {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { signIn } = useAuth()
  const searchParams = useSearchParams()

  // Handle query parameters for success messages
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'registration-success') {
      setSuccessMessage('Account created successfully! Please sign in with your credentials.')
    } else if (message === 'logout-success') {
      setSuccessMessage('You have been signed out successfully.')
    } else if (message === 'session-expired') {
      setSuccessMessage('Your session has expired. Please sign in again.')
    }
  }, [searchParams])

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true)
    setSuccessMessage(null) // Clear any previous success messages
    
    try {
      console.log('Login attempt for:', data.email.replace(/(.{3}).*@/, '$1***@'))
      
      const result = await signIn(data.email, data.password)
      
      if (!result.error && result.success) {
        console.log('Login successful')
        // Let the AuthGuard handle the redirect automatically
        // The auth state change will trigger the redirect
      }
      
      return result
    } catch (error) {
      console.error('Login error:', error)
      return { error: 'An unexpected error occurred during login. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          {/* Success message from URL params */}
          {successMessage && (
            <Alert className="border-green-200 bg-green-50 animate-in slide-in-from-top-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <DynamicAuthForm 
            mode="login" 
            onSubmit={handleLogin} 
            loading={loading}
            initialMessage={successMessage || undefined}
          />
          
          {/* Additional help section */}
          <div className="text-center text-sm text-gray-600 space-y-2">
            <div>
              <p>Need help? Contact support at</p>
              <a 
                href="mailto:support@example.com" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                support@example.com
              </a>
            </div>
            
            {/* Debugging info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="font-medium text-yellow-800">Development Mode</p>
                <p className="text-yellow-700">
                  Check browser console for detailed authentication logs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}