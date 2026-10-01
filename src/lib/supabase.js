import { createClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '@/lib/env'

/**
 * The single Supabase browser client for the app.
 *
 * Browser code uses the project URL and the publishable (anon) key only. Those
 * are safe to ship because Row Level Security governs what they can read. The
 * service-role key bypasses RLS and must stay server-side — never import it
 * here and never expose it through a `VITE_` variable.
 *
 * `null` when configuration is absent, so the shell still renders; call sites
 * should guard with `isSupabaseConfigured` or `requireSupabase()`.
 */
export const supabase = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Return the client, throwing a clear error when it is not configured. */
export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and ' +
        'VITE_SUPABASE_PUBLISHABLE_KEY in your local environment file.',
    )
  }
  return supabase
}

export { isSupabaseConfigured }
