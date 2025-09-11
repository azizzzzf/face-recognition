'use client'

import { useEffect, ReactNode, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { FaceRecognitionLoader } from './LoadingSpinner'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  allowedRoles?: ('ADMIN' | 'USER')[]
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [],
  redirectTo = '/auth/login'
}: AuthGuardProps) {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Don't redirect while still loading or already redirecting
    if (loading || isRedirecting) return

    // Add timeout to prevent infinite redirect loops
    const redirectTimeout = setTimeout(() => {
      // If auth is required but user is not authenticated
      if (requireAuth && !user) {
        if (pathname !== redirectTo) { // Prevent redirect loop
          setIsRedirecting(true)
          const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`
          router.push(redirectUrl)
        }
        return
      }

      // If user is authenticated but shouldn't be on auth pages
      if (!requireAuth && user) {
        if (pathname !== '/') { // Prevent redirect loop
          setIsRedirecting(true)
          router.push('/')
        }
        return
      }

      // If roles are specified and user doesn't have required role
      if (requireAuth && user && appUser && allowedRoles.length > 0) {
        if (!allowedRoles.includes(appUser.role) && pathname !== '/unauthorized') {
          setIsRedirecting(true)
          router.push('/unauthorized')
          return
        }
      }
    }, 150) // Slightly longer delay to ensure auth state is stable

    return () => clearTimeout(redirectTimeout)
  }, [user, appUser, loading, requireAuth, allowedRoles, redirectTo, pathname, router, isRedirecting])

  // Show loading if still loading auth state
  if (loading) {
    return <FaceRecognitionLoader />
  }

  // Show loading if redirecting to prevent flash content
  if (isRedirecting) {
    return <FaceRecognitionLoader />
  }

  // For auth pages (!requireAuth), render children if no user or while checking
  if (!requireAuth) {
    // If user is logged in, they will be redirected by the effect above
    // While redirecting or no user, show the auth page content
    if (!user || isRedirecting) {
      return <>{children}</>
    }
    // User is logged in and not redirecting yet, show loading
    return <FaceRecognitionLoader />
  }

  // For protected pages (requireAuth = true)
  if (requireAuth) {
    // If no user, they will be redirected to login
    if (!user) {
      return <FaceRecognitionLoader />
    }

    // If roles are required and user doesn't have access
    if (allowedRoles.length > 0 && appUser && !allowedRoles.includes(appUser.role)) {
      return <FaceRecognitionLoader />
    }

    // User has access, render children
    return <>{children}</>
  }

  // Fallback: render children
  return <>{children}</>
}