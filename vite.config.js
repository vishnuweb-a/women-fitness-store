import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/**
 * Keep the raw product images out of the production build.
 *
 * `public/` is copied verbatim into `dist/`, which would add ~66 MB of scraped
 * JPEGs that production never requests: every catalog image resolves through
 * the Cloudinary manifest instead (see `src/lib/product-images.js`). The files
 * stay on disk and are still served by the dev server, so local development
 * works with or without Cloudinary.
 *
 * `closeBundle` runs after Vite has copied `public/`, so removing the directory
 * there is the simplest approach that leaves the source untouched.
 *
 * If Cloudinary delivery is ever disabled, set `VITE_SHIP_LOCAL_PRODUCT_IMAGES=true`
 * to ship the local fallback instead and accept the bundle size.
 */
function excludeProductImagesFromBuild() {
  const shipLocal = process.env.VITE_SHIP_LOCAL_PRODUCT_IMAGES === 'true'

  return {
    name: 'fitnex-exclude-product-images',
    apply: 'build',
    async closeBundle() {
      if (shipLocal) {
        this.warn(
          'VITE_SHIP_LOCAL_PRODUCT_IMAGES=true — raw product images are included in dist/.',
        )
        return
      }

      const { rm, stat } = await import('node:fs/promises')
      const target = path.resolve(rootDir, 'dist/assets/products')
      try {
        await stat(target)
        await rm(target, { recursive: true, force: true })
        this.warn(
          'Removed dist/assets/products — product imagery is delivered by Cloudinary.',
        )
      } catch {
        // Nothing copied (e.g. the directory is absent locally); nothing to do.
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), excludeProductImagesFromBuild()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
})
