'use client'

import { useUser } from '@/hooks/useUser'
import { Role } from '@prisma/client'

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: Role[]
  fallback?: React.ReactNode
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { hasAnyRole } = useUser()

  if (!hasAnyRole(allowedRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}