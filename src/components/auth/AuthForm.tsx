'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Card, CardContent } from '@/ui/card'
import { Alert, AlertDescription } from '@/ui/alert'
import { Label } from '@/ui/label'
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, WifiOff } from 'lucide-react'
import { RoleCombobox } from '@/components/ui/role-combobox'
import { useAuth } from '@/hooks/useAuth'

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData extends LoginFormData {
  name: string
  role: 'ADMIN' | 'USER'
  confirmPassword: string
}

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (data: LoginFormData | RegisterFormData) => Promise<{ error?: string; success?: boolean }>
  loading?: boolean
  initialMessage?: string
}

export function AuthForm({ mode, onSubmit, loading = false, initialMessage }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

  const { error: authError, isOnline, clearError } = useAuth()
  
  const { register, handleSubmit, formState: { errors, isValid, touchedFields }, watch, reset, control } = useForm<RegisterFormData>({ mode: 'onChange' })

  const password = watch('password')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const email = watch('email') // Used for form validation and display

  // Password strength calculation
  useEffect(() => {
    if (password && mode === 'register') {
      let strength: 'weak' | 'medium' | 'strong' = 'weak'
      
      if (password.length >= 8) {
        const hasNumbers = /\d/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasUpperCase = /[A-Z]/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
        
        const criteria = [hasNumbers, hasLowerCase, hasUpperCase, hasSpecialChar].filter(Boolean).length
        
        if (criteria >= 3) strength = 'strong'
        else if (criteria >= 2) strength = 'medium'
      }
      
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }, [password, mode])

  // Handle auth errors from context
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  // Handle initial message
  useEffect(() => {
    if (initialMessage) {
      if (initialMessage.includes('success')) {
        setSuccess('Registration successful! Please sign in with your credentials.')
      } else {
        setError(initialMessage)
      }
    }
  }, [initialMessage])

  const handleFormSubmit = async (data: RegisterFormData) => {
    setSubmitAttempted(true)
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    clearError()
    
    if (mode === 'register' && data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (!isOnline) {
      setError('No internet connection. Please check your network and try again.')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await onSubmit(data)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        const successMessage = mode === 'login' 
          ? 'Welcome back! Redirecting to dashboard...' 
          : 'Account created successfully! Please check your email for verification.'
        setSuccess(successMessage)
        
        if (mode === 'register') {
          reset()
        }
      }
    } catch (err) {
      console.error('Form submission error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputClassName = (fieldName: keyof RegisterFormData) => {
    const hasError = errors[fieldName]
    const isTouched = touchedFields[fieldName]
    const baseClass = 'transition-all duration-200'
    
    if (hasError) {
      return `${baseClass} border-red-300 focus:border-red-500 focus:ring-red-500`
    } else if (isTouched && !hasError) {
      return `${baseClass} border-green-300 focus:border-green-500 focus:ring-green-500`
    }
    
    return baseClass
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-gray-200">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
          </h2>
          <p className="text-sm text-gray-600">
            {mode === 'login' 
              ? 'Enter your credentials to access the system' 
              : 'Fill in the information to create your account'}
          </p>
          
          {/* Network status indicator */}
          <div className="flex items-center justify-center mt-2">
            {!isOnline && (
              <div className="flex items-center text-red-600 text-xs">
                <WifiOff className="h-3 w-3 mr-1" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 animate-in slide-in-from-top-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                  {...register('name', { 
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    pattern: {
                      value: /^[a-zA-Z\s]+$/,
                      message: 'Name can only contain letters and spaces'
                    }
                  })}
                  className={getInputClassName('name')}
                />
                {touchedFields.name && !errors.name && (
                  <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                disabled={isSubmitting}
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                className={getInputClassName('email')}
              />
              {touchedFields.email && !errors.email && (
                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                disabled={isSubmitting}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className={`pr-20 ${getInputClassName('password')}`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                {touchedFields.password && !errors.password && (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {/* Password strength indicator */}
            {mode === 'register' && password && (
              <div className="space-y-1">
                <div className="flex space-x-1">
                  <div className={`h-1 w-1/3 rounded ${passwordStrength === 'weak' ? 'bg-red-400' : passwordStrength === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                  <div className={`h-1 w-1/3 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? passwordStrength === 'medium' ? 'bg-yellow-400' : 'bg-green-400' : 'bg-gray-200'}`} />
                  <div className={`h-1 w-1/3 rounded ${passwordStrength === 'strong' ? 'bg-green-400' : 'bg-gray-200'}`} />
                </div>
                <p className={`text-xs ${passwordStrength === 'weak' ? 'text-red-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                  Password strength: {passwordStrength}
                </p>
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                {errors.password.message}
              </p>
            )}
            
            {/* Password requirements for registration */}
            {mode === 'register' && (
              <div className="text-xs text-gray-600 space-y-1">
                <p>Password should contain:</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li className={password && password.length >= 6 ? 'text-green-600' : ''}>At least 6 characters</li>
                  <li className={password && /\d/.test(password) ? 'text-green-600' : ''}>At least one number</li>
                  <li className={password && /[A-Z]/.test(password) ? 'text-green-600' : ''}>At least one uppercase letter</li>
                  <li className={password && /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}>At least one special character</li>
                </ul>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    className={`pr-20 ${getInputClassName('confirmPassword')}`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    {touchedFields.confirmPassword && !errors.confirmPassword && (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  User Role
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: 'Please select a user role' }}
                    render={({ field }) => (
                      <RoleCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select your role"
                        error={!!errors.role}
                      />
                    )}
                  />
                  {touchedFields.role && !errors.role && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500 pointer-events-none" />
                  )}
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    {errors.role.message}
                  </p>
                )}
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || loading || !isOnline || (submitAttempted && !isValid)}
            className={`w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
              isSubmitting || !isOnline 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {(isSubmitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isOnline && <WifiOff className="mr-2 h-4 w-4" />}
            {isSubmitting 
              ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') 
              : !isOnline 
                ? 'No Connection' 
                : (mode === 'login' ? 'Sign In' : 'Create Account')
            }
          </Button>
          
          {/* Form progress indicator for registration */}
          {mode === 'register' && (
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">Registration Progress</div>
              <div className="flex space-x-1 justify-center">
                <div className={`h-1 w-4 rounded ${touchedFields.name ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className={`h-1 w-4 rounded ${touchedFields.email ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className={`h-1 w-4 rounded ${touchedFields.password ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className={`h-1 w-4 rounded ${touchedFields.confirmPassword ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className={`h-1 w-4 rounded ${touchedFields.role ? 'bg-blue-500' : 'bg-gray-300'}`} />
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <a
              href={mode === 'login' ? '/auth/register' : '/auth/login'}
              className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {mode === 'login' ? 'Sign up here' : 'Sign in here'}
            </a>
          </p>
          
          {/* Additional help text */}
          <div className="mt-4 text-xs text-gray-500">
            {mode === 'login' ? (
              <p>Having trouble? Make sure you have a stable internet connection and check your credentials.</p>
            ) : (
              <p>By creating an account, you agree to our terms of service and privacy policy.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AuthForm