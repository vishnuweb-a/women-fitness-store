/**
 * Tests for per-route document titles.
 *
 * The property under test is the one that was actually broken before Phase 5:
 * every route served the same `<title>`, so a tab, a history entry, and a
 * bookmark were indistinguishable across all twenty routes, and a screen
 * reader announced the same page name after every navigation.
 *
 * These cover the composition rule only. Whether React hoists the tags into
 * `<head>` is React's behaviour, not this module's, and the suite runs in Node
 * with no DOM — that part was verified in the browser instead and is recorded
 * in docs/FRONTEND_FINAL_QA.md.
 */
import { describe, expect, it } from 'vitest'

import { buildPageTitle } from '@/lib/page-title'

describe('buildPageTitle', () => {
  it('suffixes a route title with the site name', () => {
    expect(buildPageTitle('Your bag')).toBe('Your bag | FITNEX WOMEN')
  })

  it('falls back to the site title when a route supplies none', () => {
    // The home page deliberately passes no title.
    expect(buildPageTitle(undefined)).toBe('FITNEX WOMEN | Stronger Every Day')
  })

  it('treats a blank or whitespace-only title as absent', () => {
    // Guards against a product whose name normalises to an empty string
    // producing a title that is just the separator.
    expect(buildPageTitle('')).toBe('FITNEX WOMEN | Stronger Every Day')
    expect(buildPageTitle('   ')).toBe('FITNEX WOMEN | Stronger Every Day')
  })

  it('trims surrounding whitespace rather than embedding it', () => {
    expect(buildPageTitle('  Wishlist  ')).toBe('Wishlist | FITNEX WOMEN')
  })

  it('gives distinct titles to distinct routes', () => {
    const titles = ['Your bag', 'Wishlist', 'Help centre', 'Customer hub'].map(buildPageTitle)
    expect(new Set(titles).size).toBe(titles.length)
  })
})
