/**
 * Centralised access to the public (browser-safe) configuration.
 *
 * Only `VITE_`-prefixed variables reach the browser bundle. Anything secret —
 * the Supabase service-role key, the Cloudinary API key/secret — must never be
 * given a `VITE_` prefix and must never be imported from this file.
 *
 * The local `.env` predates this app and uses unprefixed names; see
 * docs/PROJECT_SETUP.md for the mapping to the `VITE_` names used here.
 */

/** Read a public variable, returning `undefined` when unset or blank. */
function readPublic(key) {
  const value = import.meta.env[key]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export const env = {
  supabaseUrl: readPublic('VITE_SUPABASE_URL'),
  supabasePublishableKey: readPublic('VITE_SUPABASE_PUBLISHABLE_KEY'),
  cloudinaryCloudName: readPublic('VITE_CLOUDINARY_CLOUD_NAME'),
}

/** True when both Supabase values are present, so callers can degrade gracefully. */
export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabasePublishableKey,
)

/** True when Cloudinary delivery URLs can be built. */
export const isCloudinaryConfigured = Boolean(env.cloudinaryCloudName)

/**
 * Report missing public configuration once at startup.
 *
 * This warns rather than throws: Phase 0 is a runnable shell that must boot
 * even before the environment is filled in.
 */
export function reportEnvStatus() {
  if (import.meta.env.PROD) return

  const missing = []
  if (!env.supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!env.supabasePublishableKey) missing.push('VITE_SUPABASE_PUBLISHABLE_KEY')
  if (!env.cloudinaryCloudName) missing.push('VITE_CLOUDINARY_CLOUD_NAME')

  if (missing.length > 0) {
    console.warn(
      `[env] Missing public configuration: ${missing.join(', ')}.\n` +
        'Copy .env.example to .env.local and fill in the public values. ' +
        'Features depending on these will stay inactive until then.',
    )
  }
}
