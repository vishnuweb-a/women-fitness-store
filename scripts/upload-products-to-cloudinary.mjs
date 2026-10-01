/**
 * Upload the scraped product images to Cloudinary.
 *
 * SERVER-SIDE ONLY. This script reads the Cloudinary API secret and must never
 * be imported from anything under `src/`. It is a plain Node script: the
 * server-side `cloudinary` SDK is deliberately not installed, so signing is
 * done here with `node:crypto` and the upload is a plain `fetch` multipart
 * POST. Nothing here reaches the browser bundle.
 *
 * Behaviour:
 *   - Walks `public/assets/products/**` and uploads each unique file once.
 *   - Keeps a private, resumable checkpoint so a re-run skips what succeeded.
 *   - Limits concurrency and retries transient failures with bounded backoff.
 *   - Writes a public delivery manifest containing safe metadata only.
 *   - Never deletes a remote asset, and never overwrites one (`overwrite=false`
 *     plus a deterministic public ID scoped to `fitnex-women/products`).
 *
 * Usage:
 *   node scripts/upload-products-to-cloudinary.mjs            # upload
 *   node scripts/upload-products-to-cloudinary.mjs --dry-run  # plan only
 *   node scripts/upload-products-to-cloudinary.mjs --limit 20 # first N files
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

import {
  describeCredentials,
  loadCloudinaryCredentials,
  projectRoot,
} from './lib/cloudinary-credentials.js'

const SOURCE_ROOT = path.join(projectRoot, 'public', 'assets', 'products')
const CHECKPOINT = path.join(projectRoot, '.cloudinary-upload-checkpoint.json')
const MANIFEST = path.join(projectRoot, 'src', 'data', 'cloudinary-manifest.json')
const NAMESPACE = 'fitnex-women/products'

const CONCURRENCY = 6
const MAX_ATTEMPTS = 4
const BASE_BACKOFF_MS = 600

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const LIMIT = (() => {
  const i = argv.indexOf('--limit')
  return i === -1 ? Infinity : Number(argv[i + 1]) || Infinity
})()

/** Recursively list every file under a directory, as repo-relative POSIX paths. */
async function listImages(dir) {
  const out = []
  for (const entry of await fsp.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await listImages(full)))
    } else if (/\.(jpe?g|png|webp|avif)$/i.test(entry.name)) {
      out.push(path.relative(projectRoot, full).split(path.sep).join('/'))
    }
  }
  return out
}

/**
 * Deterministic, collision-resistant public ID.
 *
 * The scraped directory names are long and some differ only in a trailing
 * token, so the relative path (minus extension) is slugified and suffixed with
 * a short hash of the full path. Same input file always yields the same ID,
 * which is what makes a re-run idempotent.
 */
function publicIdFor(relativePath) {
  const withoutRoot = relativePath.replace(/^public\/assets\/products\//, '')
  const withoutExt = withoutRoot.replace(/\.[^.]+$/, '')
  const slug = withoutExt
    .split('/')
    .map((segment) =>
      segment
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80),
    )
    .join('/')
  const hash = crypto.createHash('sha1').update(relativePath).digest('hex').slice(0, 8)
  return `${NAMESPACE}/${slug}-${hash}`
}

/** Sign an upload request. The secret never leaves this process. */
function sign(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex')
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Upload one file, retrying transient failures with bounded backoff. */
async function uploadOne(relativePath, creds) {
  const publicId = publicIdFor(relativePath)
  const absolute = path.join(projectRoot, relativePath)
  const bytes = await fsp.readFile(absolute)

  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      // `overwrite: false` protects any unrelated asset that might already
      // occupy this ID. Cloudinary then returns the existing asset instead.
      const params = {
        overwrite: 'false',
        public_id: publicId,
        timestamp: String(timestamp),
        unique_filename: 'false',
      }
      const form = new FormData()
      form.append('file', new Blob([bytes]), path.basename(relativePath))
      for (const [key, value] of Object.entries(params)) form.append(key, value)
      form.append('api_key', creds.apiKey)
      form.append('signature', sign(params, creds.apiSecret))

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`,
        { method: 'POST', body: form },
      )
      const json = await response.json()

      if (!response.ok) {
        const message = json?.error?.message ?? `HTTP ${response.status}`
        // 4xx other than 429 is a permanent problem; retrying wastes time.
        if (response.status !== 429 && response.status < 500) {
          return { ok: false, relativePath, error: message, permanent: true }
        }
        throw new Error(message)
      }

      return {
        ok: true,
        relativePath,
        publicId: json.public_id,
        secureUrl: json.secure_url,
        width: json.width,
        height: json.height,
        format: json.format,
        bytes: json.bytes,
      }
    } catch (error) {
      lastError = error
      if (attempt < MAX_ATTEMPTS) {
        await sleep(BASE_BACKOFF_MS * 2 ** (attempt - 1) + Math.random() * 250)
      }
    }
  }

  return { ok: false, relativePath, error: String(lastError?.message ?? lastError) }
}

/** Run tasks with a fixed worker pool. */
async function runPool(items, worker, concurrency) {
  let cursor = 0
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      await worker(items[index], index)
    }
  })
  await Promise.all(workers)
}

async function main() {
  const creds = loadCloudinaryCredentials()
  const described = describeCredentials(creds)
  console.log('Cloudinary credentials:', described)

  if (!creds.cloudName || !creds.apiKey || !creds.apiSecret) {
    console.error(
      'Missing Cloudinary credentials. Expected a cloud name, API key, and API ' +
        'secret in .env (or CLOUDINARY_URL). Nothing was uploaded.',
    )
    process.exitCode = 1
    return
  }

  if (!fs.existsSync(SOURCE_ROOT)) {
    console.error(`No product images found at ${SOURCE_ROOT}.`)
    process.exitCode = 1
    return
  }

  const files = (await listImages(SOURCE_ROOT)).sort()
  console.log(`Found ${files.length} unique image files under public/assets/products.`)

  // Resume: anything already recorded as uploaded is skipped.
  let checkpoint = { uploaded: {}, failed: {} }
  if (fs.existsSync(CHECKPOINT)) {
    try {
      checkpoint = JSON.parse(await fsp.readFile(CHECKPOINT, 'utf8'))
      checkpoint.uploaded ??= {}
      checkpoint.failed ??= {}
    } catch {
      console.warn('Checkpoint unreadable; starting fresh.')
    }
  }

  const pending = files
    .filter((file) => !checkpoint.uploaded[file])
    .slice(0, LIMIT === Infinity ? undefined : LIMIT)

  console.log(
    `${Object.keys(checkpoint.uploaded).length} already uploaded, ${pending.length} to upload.`,
  )

  if (DRY_RUN) {
    console.log('Dry run — nothing uploaded. Sample public IDs:')
    for (const file of pending.slice(0, 5)) console.log(`  ${file}\n    -> ${publicIdFor(file)}`)
    return
  }

  let done = 0
  let failedCount = 0

  await runPool(
    pending,
    async (file) => {
      const result = await uploadOne(file, creds)
      done += 1

      if (result.ok) {
        checkpoint.uploaded[file] = {
          publicId: result.publicId,
          secureUrl: result.secureUrl,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        }
        delete checkpoint.failed[file]
      } else {
        failedCount += 1
        checkpoint.failed[file] = { error: result.error, permanent: Boolean(result.permanent) }
        console.warn(`  FAILED ${file}: ${result.error}`)
      }

      if (done % 25 === 0 || done === pending.length) {
        await fsp.writeFile(CHECKPOINT, JSON.stringify(checkpoint, null, 2))
        console.log(`  ${done}/${pending.length} processed (${failedCount} failed)`)
      }
    },
    CONCURRENCY,
  )

  await fsp.writeFile(CHECKPOINT, JSON.stringify(checkpoint, null, 2))

  // Public manifest: safe metadata only. No credentials, no checkpoint state.
  const entries = {}
  for (const [relativePath, record] of Object.entries(checkpoint.uploaded)) {
    entries[relativePath.replace(/^public/, '')] = {
      publicId: record.publicId,
      secureUrl: record.secureUrl,
      width: record.width,
      height: record.height,
      format: record.format,
    }
  }

  await fsp.writeFile(
    MANIFEST,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        cloudName: creds.cloudName,
        namespace: NAMESPACE,
        count: Object.keys(entries).length,
        images: entries,
      },
      null,
      2,
    )}\n`,
  )

  const failedTotal = Object.keys(checkpoint.failed).length
  console.log('')
  console.log(`Uploaded total: ${Object.keys(checkpoint.uploaded).length}`)
  console.log(`Failed:         ${failedTotal}`)
  console.log(`Manifest:       ${path.relative(projectRoot, MANIFEST)}`)
  if (failedTotal > 0) {
    console.log('Re-run the script to retry the failures; successes are skipped.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
