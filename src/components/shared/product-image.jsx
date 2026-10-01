import { useState } from 'react'

import { buildProductSrcSet } from '@/lib/product-images'
import { cn } from '@/lib/utils'

/**
 * The neutral placeholder shipped with the build.
 *
 * It lives in `public/assets/` rather than `public/assets/products/`, which the
 * build plugin strips from `dist/`, so it is genuinely present in production.
 */
const PRODUCT_PLACEHOLDER = '/assets/product-placeholder.svg'

/**
 * A catalog image with stable dimensions and a fallback chain that terminates.
 *
 * ## Fallback behaviour
 *
 * Phase 1 fell back from a failed Cloudinary URL to the local
 * `/assets/products/...` path. **That path does not exist in production**: the
 * raw product JPEGs are ~66 MB and are deliberately removed from `dist/` by
 * the Vite plugin in `vite.config.js`. So the fallback was guaranteed to 404,
 * and the second failure then re-entered the same error handler.
 *
 * The chain is now explicit and finite, and each stage can fire at most once:
 *
 *   1. the Cloudinary delivery URL;
 *   2. **in development only**, the local file, which the dev server does
 *      serve — useful when Cloudinary is unconfigured or offline;
 *   3. the shipped neutral placeholder, which is part of the build.
 *
 * If the placeholder itself fails, the `onError` handler is removed with it
 * and a CSS-only box is rendered instead, so there is no way to loop.
 *
 * `width`/`height` are always emitted so the browser reserves the right box
 * before the bytes arrive — no layout shift. Apparel and equipment are shot at
 * different aspect ratios, so the image is contained rather than cropped and
 * the container supplies the ratio.
 */
export function ProductImage({ image, className, sizes, priority = false }) {
  // 0 = delivery URL, 1 = local file (dev only), 2 = shipped placeholder,
  // 3 = everything failed.
  const [stage, setStage] = useState(0)

  if (!image) {
    return <PlaceholderBox className={className} alt={null} />
  }

  // In production the local path is not shipped, so it is skipped entirely
  // rather than being requested and 404ing on the way to the placeholder.
  const localAvailable = import.meta.env.DEV && Boolean(image.localSrc)
  const chain = [image.src, ...(localAvailable ? [image.localSrc] : []), PRODUCT_PLACEHOLDER]

  const src = chain[stage]
  if (!src) {
    return <PlaceholderBox className={className} alt={image.alt} />
  }

  const isPlaceholder = src === PRODUCT_PLACEHOLDER
  const srcSet = stage === 0 ? buildProductSrcSet(image.localSrc) : null

  return (
    <img
      // Keying on the stage forces a fresh element for each attempt, so a
      // browser that has already cached the failure for one URL still tries
      // the next one.
      key={stage}
      src={src}
      srcSet={srcSet ?? undefined}
      sizes={srcSet ? sizes : undefined}
      /*
       * The placeholder is not the product, so it must not claim to be: the
       * alt text says the image is unavailable and still names the product, so
       * a screen reader user learns both what this is and that the picture is
       * missing.
       */
      alt={isPlaceholder ? `${image.alt} — image unavailable` : image.alt}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      // No handler on the last stage — nothing is left to fall back to, so the
      // chain cannot restart.
      onError={isPlaceholder ? undefined : () => setStage((value) => value + 1)}
      className={className}
    />
  )
}

/** CSS-only last resort: no network request, so it cannot fail in turn. */
function PlaceholderBox({ className, alt }) {
  return (
    <div
      role="img"
      aria-label={alt ? `${alt} — image unavailable` : 'Image unavailable'}
      className={cn('size-full bg-muted', className)}
    />
  )
}
