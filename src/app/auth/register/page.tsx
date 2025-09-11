'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { DynamicAuthForm } from '@/components/DynamicComponents'
import { AuthGuard } from '@/components/AuthGuard'
import { CheckCircle, Loader2 } from 'lucide-react'

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
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [successDetails, setSuccessDetails] = useState<{
    email?: string;
    needsVerification?: boolean;
  }>({})
  const { signUp } = useAuth()
  const router = useRouter()

  const handleRegister = async (data: RegisterFormData | LoginFormData) => {
    // Type guard to ensure we have RegisterFormData
    if (!('name' in data) || !('role' in data) || !('confirmPassword' in data)) {
      return { error: 'Invalid form data for registration' };
    }
    
    const registerData = data as RegisterFormData;
    setLoading(true)
    
    try {
      console.log('Registration attempt for:', registerData.email.replace(/(.{3}).*@/, '$1***@'), 'as', registerData.role)
      
      const result = await signUp(registerData.email, registerData.password, registerData.name, registerData.role)
      
      if (!result.error && result.success) {
        console.log('Registration successful')
        
        // Set success state with details
        setRegistrationSuccess(true)
        setSuccessDetails({
          email: registerData.email,
          needsVerification: true // Assuming email verification is required
        })
        
        // Redirect to login after showing success message
        setTimeout(() => {
          router.push('/auth/login?message=registration-success')
        }, 3000)
      }
      
      return result
    } catch (error) {
      console.error('Registration error:', error)
      return { error: 'An unexpected error occurred during registration. Please try again.' }
    } finally {
      setLoading(false)
    }
  }


  // Show success screen after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Account Created Successfully!
            </h2>
            
            <div className="space-y-4 text-gray-600">
              <p>
                Welcome! Your account has been created with email:
              </p>
              <p className="font-medium text-gray-900">
                {successDetails.email}
              </p>
              
              {successDetails.needsVerification && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    Please check your email and click the verification link to activate your account.
                  </p>
                </div>
              )}
              
              <p>
                Redirecting to sign in page in a few seconds...
              </p>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-gray-500">Redirecting...</span>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => router.push('/auth/login?message=registration-success')}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Go to Sign In now
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome message for new users */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Join Our Community
            </h1>
            <p className="text-gray-600">
              Create your account to get started with our face recognition system
            </p>
          </div>
          
          <DynamicAuthForm 
            mode="register" 
            onSubmit={handleRegister} 
            loading={loading}
          />
          
          {/* Registration benefits */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What you&apos;ll get:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Access to advanced face recognition features
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Secure and private data handling
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                24/7 customer support
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                Regular updates and new features
              </li>
            </ul>
          </div>
          
          {/* Additional help section */}
          <div className="text-center text-sm text-gray-600 space-y-2">
            <div>
              <p>Need help with registration?</p>
              <a 
                href="mailto:support@example.com" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Contact our support team
              </a>
            </div>
            
            {/* Debugging info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="font-medium text-yellow-800">Development Mode</p>
                <p className="text-yellow-700">
                  Check browser console for detailed registration logs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}