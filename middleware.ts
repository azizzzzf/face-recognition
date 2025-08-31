import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getRequiredRoles, getAPIRequiredRoles, hasPermission } from '@/lib/permissions'
import { getUserBySupabaseId } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // Update session
  const { supabaseResponse, user } = await updateSession(request)

  const path = request.nextUrl.pathname

  // Allow public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/callback']
  if (publicRoutes.includes(path)) {
    return supabaseResponse
  }

  // Redirect unauthenticated users to login
  if (!user && !path.startsWith('/auth/')) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl.toString())
  }

  // For authenticated users, check role-based permissions
  if (user) {
    try {
      const appUser = await getUserBySupabaseId(user.id)
      
      if (!appUser) {
        // User exists in Supabase but not in our database
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('error', 'user-not-found')
        return NextResponse.redirect(redirectUrl.toString())
      }

      // Check API route permissions
      if (path.startsWith('/api/')) {
        const requiredRoles = getAPIRequiredRoles(path)
        if (requiredRoles.length > 0 && !hasPermission(appUser.role, requiredRoles)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      } else {
        // Check page route permissions
        const requiredRoles = getRequiredRoles(path)
        if (requiredRoles.length > 0 && !hasPermission(appUser.role, requiredRoles)) {
          const redirectUrl = new URL('/unauthorized', request.url)
          return NextResponse.redirect(redirectUrl.toString())
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      // On error, allow the request to continue but it will be handled by ProtectedRoute
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}