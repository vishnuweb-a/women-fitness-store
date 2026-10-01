import { useState } from 'react'
import { ImageOff } from 'lucide-react'

import { buildProductSrcSet } from '@/lib/product-images'
import { cn } from '@/lib/utils'

/**
 * A catalog image with stable dimensions and real loading/error states.
 *
 * `width`/`height` are always emitted so the browser reserves the right box
 * before the bytes arrive — no layout shift. Apparel and equipment are shot at
 * different aspect ratios, so the image is contained rather than cropped and
 * the container supplies the ratio.
 */
export function ProductImage({ image, className, sizes, priority = false }) {
  const [failed, setFailed] = useState(false)

  if (!image || failed) {
    return (
      <div
        className={cn(
          'flex size-full items-center justify-center bg-muted text-muted-foreground',
          className,
        )}
      >
        <ImageOff className="size-6" aria-hidden="true" focusable="false" />
        <span className="sr-only">{image?.alt ?? 'Image unavailable'}</span>
      </div>
    )
  }

  const srcSet = buildProductSrcSet(image.localSrc)

  return (
    <img
      src={image.src}
      srcSet={srcSet ?? undefined}
      sizes={srcSet ? sizes : undefined}
      alt={image.alt}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
