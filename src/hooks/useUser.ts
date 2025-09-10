'use client'

import { useAuth } from '@/context/AuthContext'
import { Role } from '@prisma/client'

export function useUser() {
  const { user, appUser, loading } = useAuth()

  const hasRole = (role: Role) => appUser?.role === role
  const hasAnyRole = (roles: Role[]) => appUser ? roles.includes(appUser.role) : false
  const isAdmin = () => hasRole(Role.ADMIN)
  const isUser = () => hasRole(Role.USER)

  return {
    user,
    appUser,
    loading,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
    isAdmin,
    isUser,
  }
}