import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

/**
 * Primary navigation, mirroring the category bar in the reference screens.
 * Phase 0 ships the structure; counts and search are wired up in later phases.
 */
const NAV_ITEMS = [
  { label: 'Shop All', to: '/collections' },
  { label: 'Yoga & Pilates', to: '/collections/yoga-pilates' },
  { label: 'Training', to: '/collections/training' },
  { label: 'Bags', to: '/collections/bags' },
  { label: 'Hydration', to: '/collections/hydration' },
  { label: 'New Arrivals', to: '/collections/new-arrivals' },
]

/** Thin promotional strip above the header. */
function AnnouncementBar() {
  return (
    <div className="bg-ink-950 text-ink-50">
      <div className="container-site flex min-h-9 flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2 text-center text-xs sm:justify-between">
        <p>Free shipping on orders over ₹999</p>
        <p className="hidden sm:block">30-day easy returns</p>
      </div>
    </div>
  )
}

function navLinkClass({ isActive }) {
  return cn(
    'inline-flex min-h-11 items-center text-sm font-medium transition-colors',
    isActive ? 'text-brand-600' : 'text-ink-700 hover:text-brand-600',
  )
}

export function SiteHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <AnnouncementBar />

      <div className="container-site flex h-16 items-center gap-3">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu aria-hidden="true" focusable="false" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Browse</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col px-4 pb-4">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          className="font-display text-xl font-extrabold tracking-tight"
        >
          FITNEX<span className="text-brand-500">.</span>
          <span className="sr-only"> Women — home</span>
          <span aria-hidden="true" className="block text-[0.5rem] font-semibold tracking-[0.3em] text-ink-500">
            WOMEN
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search products" asChild>
            <Link to="/collections">
              <Search aria-hidden="true" focusable="false" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Your account" asChild>
            <Link to="/account">
              <User aria-hidden="true" focusable="false" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Your wishlist" asChild>
            <Link to="/wishlist">
              <Heart aria-hidden="true" focusable="false" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Your shopping bag" asChild>
            <Link to="/cart">
              <ShoppingBag aria-hidden="true" focusable="false" />
            </Link>
          </Button>
        </div>
      </div>

      <nav
        aria-label="Primary"
        className="hidden border-t border-border lg:block"
      >
        <ul className="container-site flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to="/collections/sale"
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-11 items-center text-sm font-semibold text-brand-600',
                  isActive && 'underline underline-offset-4',
                )
              }
            >
              Sale
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}
