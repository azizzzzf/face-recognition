import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Ensures the Supabase session is synchronized with the incoming Next.js request and returns the response (with any cookie updates) alongside the authenticated user.
 *
 * Creates a server-side Supabase client tied to the incoming request's cookies, applies any cookie changes to the outgoing NextResponse, and retrieves the current authenticated user. Uses fallback environment values for Supabase URL and anon key when those variables are not set.
 *
 * @param request - The incoming NextRequest whose cookies are used and may be updated to reflect Supabase session changes.
 * @returns An object containing:
 *   - `supabaseResponse`: the NextResponse that must be returned (it carries any cookie updates required by Supabase).
 *   - `user`: the authenticated user object (or null if no user is authenticated).
 *
 * Note: The returned `supabaseResponse` must be returned as-is. If you create a redirect or a new response, pass `request.url` as the first argument to the redirect and use `supabaseResponse` as the init parameter so cookie updates are preserved.
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  // Use fallback values for CI/build environments
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.redirect() or similar, make
  // sure to:
  // 1. Pass the request.url as the first argument to the redirect
  // 2. Pass the supabaseResponse as the init parameter to the redirect

  return { supabaseResponse, user }
}