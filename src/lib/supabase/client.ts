import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase browser client using public environment variables.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from the environment
 * and passes them to createBrowserClient. If either environment variable is missing
 * (e.g., in CI or certain build environments), a safe placeholder URL and anon key
 * are used to avoid passing `undefined`.
 *
 * @returns A browser Supabase client created with the resolved URL and anon key.
 */
export function createClient() {
  // Use fallback values for CI/build environments
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}