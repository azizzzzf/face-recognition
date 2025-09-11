'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SidebarLayout } from './SidebarLayout'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Check if current path is auth-related
  const isAuthPage = pathname?.startsWith('/auth/') || pathname === '/unauthorized'
  
  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Always render children immediately after mounting to prevent loading issues
  // Let AuthGuard handle all auth logic and loading states
  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  // For auth pages, render clean layout without sidebar
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-white">
        {children}
      </div>
    )
  }

  // For authenticated pages, render with sidebar
  if (user) {
    return (
      <SidebarLayout>
        {children}
      </SidebarLayout>
    )
  }

  // For unauthenticated users on protected pages, render without sidebar
  // AuthGuard will handle the redirect and loading states
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}