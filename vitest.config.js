import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/**
 * Vitest runs the catalog data tests in Node. No DOM environment is needed —
 * these cover normalisation and cart identity, not rendering.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(rootDir, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
