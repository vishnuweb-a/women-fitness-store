import { env, isCloudinaryConfigured } from '@/lib/env'

/**
 * Cloudinary delivery URL builder.
 *
 * Deliberately dependency-free: the server-side `cloudinary` SDK must not be
 * installed into the browser bundle. Delivery URLs are public by design and
 * need only the cloud name, so no credential is involved here.
 *
 * UPLOADS ARE NOT IMPLEMENTED. Signing an upload requires the API secret,
 * which must never reach the browser. When uploads are needed, add a trusted
 * backend (a Supabase Edge Function is the natural fit here) that signs the
 * request server-side and returns the signature to the client. An unsigned
 * preset is acceptable only if it is tightly restricted (fixed folder, allowed
 * formats, size cap). See docs/PROJECT_SETUP.md.
 */

const CLOUDINARY_BASE = 'https://res.cloudinary.com'

/** Default transformations: modern format and quality chosen automatically. */
const DEFAULT_TRANSFORMS = ['f_auto', 'q_auto']

/**
 * Build a delivery URL for a Cloudinary image.
 *
 * @param {string} publicId - The asset's public ID, e.g. `banners/hero-1`.
 * @param {object} [options]
 * @param {number} [options.width] - Target width in pixels.
 * @param {number} [options.height] - Target height in pixels.
 * @param {string} [options.crop] - Crop mode, e.g. `fill`, `fit`.
 * @param {string} [options.gravity] - Focal point, e.g. `auto`, `face`.
 * @param {string} [options.format] - Force an extension instead of `f_auto`.
 * @returns {string|null} The URL, or `null` when unconfigured or given no ID.
 */
export function buildCloudinaryUrl(publicId, options = {}) {
  if (!isCloudinaryConfigured || !publicId) return null

  const { width, height, crop, gravity, format } = options

  const transforms = [...DEFAULT_TRANSFORMS]
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (crop) transforms.push(`c_${crop}`)
  if (gravity) transforms.push(`g_${gravity}`)

  const encodedId = publicId.replace(/^\/+/, '')
  const suffix = format ? `.${format}` : ''

  return `${CLOUDINARY_BASE}/${env.cloudinaryCloudName}/image/upload/${transforms.join(',')}/${encodedId}${suffix}`
}

/**
 * Build a `srcset` string across the given widths, for responsive images.
 *
 * @param {string} publicId
 * @param {number[]} [widths]
 * @returns {string|null}
 */
export function buildCloudinarySrcSet(publicId, widths = [640, 960, 1280, 1920]) {
  if (!isCloudinaryConfigured || !publicId) return null

  return widths
    .map((width) => `${buildCloudinaryUrl(publicId, { width })} ${width}w`)
    .join(', ')
}

/**
 * Resolve an image source, preferring Cloudinary and falling back to a local
 * asset. Phase 0 ships local banners, so the fallback is the active path.
 *
 * @param {object} params
 * @param {string} [params.publicId] - Cloudinary public ID, when available.
 * @param {string} [params.localSrc] - Path under `public/`, e.g. `/assets/...`.
 * @param {object} [params.options] - Passed through to `buildCloudinaryUrl`.
 * @returns {string|undefined}
 */
export function resolveImageSrc({ publicId, localSrc, options } = {}) {
  return buildCloudinaryUrl(publicId, options) ?? localSrc
}

export { isCloudinaryConfigured }
