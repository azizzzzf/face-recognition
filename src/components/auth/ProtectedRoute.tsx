'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { Role } from '@prisma/client'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Card, CardContent } from '@/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: Role[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [],
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const { appUser, hasAnyRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, redirectTo, router])

  // Still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null // Will redirect in useEffect
  }

  // App user not loaded yet
  if (!appUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Check role permissions
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Akses Ditolak
            </h2>
            <p className="text-gray-600 mb-4">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <p className="text-sm text-gray-500">
              Role Anda: <span className="font-medium">{appUser.role}</span>
            </p>
            <p className="text-sm text-gray-500">
              Role yang diperlukan: <span className="font-medium">{requiredRoles.join(', ')}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}