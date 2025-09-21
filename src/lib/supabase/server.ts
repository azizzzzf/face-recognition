import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create and return a Supabase server client wired to Next.js cookies.
 *
 * This async helper reads the current Next.js cookie store and constructs a
 * Supabase server client using NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY (falls back to placeholders for CI/build
 * environments). The returned client uses a cookies adapter that:
 * - delegates reads to the Next.js cookie store,
 * - applies writes to the cookie store (writes may be silently ignored when
 *   invoked from a Server Component context).
 *
 * @returns A Supabase server client configured with the app URL, anon key, and a Next.js cookie adapter.
 */
export async function createClient() {
  const cookieStore = await cookies()

  // Use fallback values for CI/build environments
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}