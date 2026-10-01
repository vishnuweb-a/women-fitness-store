/**
 * Server-side Cloudinary credential loading.
 *
 * NEVER import this from anything under `src/` — it reads the API secret.
 * It is used only by Node scripts in `scripts/`, which never ship to the
 * browser bundle.
 *
 * The repository's pre-existing `.env` was written by hand before this app
 * existed. Its keys are irregular ("cloud name", "api key ", and a line that
 * reads `cloudnary url  : CLOUDINARY_URL=...`), so the parser below is
 * deliberately tolerant: it lowercases keys, strips spaces and underscores,
 * and takes the last `=`-separated segment of a line as the value.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
export const projectRoot = path.resolve(scriptDir, '..', '..')

/** Normalise a key: lowercase, drop spaces/underscores/colons. */
function normaliseKey(raw) {
  return raw.toLowerCase().replace(/[\s_:]+/g, '')
}

/** Parse a dotenv-ish file into a map of normalised keys to raw values. */
function parseEnvFile(filePath) {
  const result = new Map()
  if (!fs.existsSync(filePath)) return result

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eq = trimmed.indexOf('=')
    if (eq === -1) continue

    // `cloudnary url  : CLOUDINARY_URL=value` — the real key is the segment
    // immediately before the first `=`, after any `:` prefix.
    const keyPart = trimmed.slice(0, eq)
    const value = trimmed.slice(eq + 1).trim()
    const key = normaliseKey(keyPart.split(':').pop())
    if (key && value) result.set(key, value)
  }

  return result
}

/**
 * Resolve Cloudinary credentials from `.env`, `.env.local`, or the process
 * environment. Returns the values; callers must never print them.
 */
export function loadCloudinaryCredentials() {
  const merged = new Map()
  for (const file of ['.env', '.env.local']) {
    for (const [k, v] of parseEnvFile(path.join(projectRoot, file))) {
      merged.set(k, v)
    }
  }

  const pick = (...keys) => {
    for (const key of keys) {
      const value = merged.get(normaliseKey(key))
      if (value) return value
    }
    return undefined
  }

  // A CLOUDINARY_URL (cloudinary://key:secret@cloud) supersedes loose keys.
  const url = pick('CLOUDINARY_URL')
  if (url) {
    const match = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url.trim())
    if (match) {
      return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] }
    }
  }

  const cloudName =
    pick('cloud name', 'cloudname', 'CLOUDINARY_CLOUD_NAME') ??
    process.env.CLOUDINARY_CLOUD_NAME
  const apiKey =
    pick('api key', 'apikey', 'CLOUDINARY_API_KEY') ??
    process.env.CLOUDINARY_API_KEY
  const apiSecret =
    pick('api secret', 'apisecret', 'CLOUDINARY_API_SECRET') ??
    process.env.CLOUDINARY_API_SECRET

  return { cloudName, apiKey, apiSecret }
}

/** Report which credentials resolved, without revealing any value. */
export function describeCredentials(creds) {
  return {
    cloudName: creds.cloudName ? `set (${creds.cloudName})` : 'MISSING',
    apiKey: creds.apiKey ? `set (${creds.apiKey.length} chars)` : 'MISSING',
    apiSecret: creds.apiSecret ? `set (${creds.apiSecret.length} chars)` : 'MISSING',
  }
}
