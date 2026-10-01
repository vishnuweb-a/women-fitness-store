import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Heart,
  Menu,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react'

import { SearchPanel } from '@/components/layout/search-panel'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useStore } from '@/features/cart/use-store'
import { catalogCategories } from '@/services/catalog'
import { cn } from '@/lib/utils'

/**
 * Navigation is generated from the real catalog categories.
 *
 * The reference screens show narrower menu entries ("Yoga & Pilates",
 * "Hydration", "New Arrivals"). Those are not created here: the scraped data
 * supports no reliable grouping for them and no recency field exists, so such
 * links would lead to empty collections. The three canonical category slugs
 * are used instead, under the friendly labels from the catalog service.
 */
const NAV_ITEMS = [
  { label: 'Shop All', to: '/collections' },
  ...catalogCategories.map((category) => ({
    label: category.label,
    to: `/collections/${category.slug}`,
  })),
]

/** Thin promotional strip above the header, as in every reference screen. */
export function AnnouncementBar() {
  return (
    <div className="bg-ink-950 text-ink-200">
      <div className="container-site flex min-h-9 flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2 text-center text-xs sm:justify-between">
        <p className="flex items-center gap-1.5">
          <PackageCheck className="size-3.5" aria-hidden="true" focusable="false" />
          Free shipping on orders over ₹999
        </p>
        <p className="hidden items-center gap-1.5 sm:flex">
          <RotateCcw className="size-3.5" aria-hidden="true" focusable="false" />
          30-day easy returns
        </p>
        <p className="hidden items-center gap-1.5 md:flex">
          <ShieldCheck className="size-3.5" aria-hidden="true" focusable="false" />
          Authentic &amp; quality products
        </p>
      </div>
    </div>
  )
}

/** Brand lockup. One link, one accessible name. */
function BrandMark({ className }) {
  return (
    <Link
      to="/"
      className={cn('shrink-0 leading-none', className)}
      aria-label="FITNEX WOMEN — home"
    >
      <span
        aria-hidden="true"
        className="block font-display text-xl font-extrabold tracking-tight text-ink-950 sm:text-2xl"
      >
        FITNE<span className="text-brand-500">X</span>
      </span>
      <span
        aria-hidden="true"
        className="block text-[0.5rem] font-semibold tracking-[0.42em] text-ink-500"
      >
        WOMEN
      </span>
    </Link>
  )
}

function navLinkClass({ isActive }) {
  return cn(
    'inline-flex min-h-11 items-center text-sm font-medium transition-colors',
    isActive ? 'text-brand-600' : 'text-ink-700 hover:text-brand-600',
  )
}

/** Count badge for the wishlist and bag buttons. */
function CountBadge({ count }) {
  if (!count) return null
  return (
    <span
      aria-hidden="true"
      className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[0.625rem] font-bold leading-5 text-white tabular-nums"
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function SiteHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { cartCount, wishlistCount } = useStore()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <AnnouncementBar />

      <div className="container-site flex h-16 items-center gap-2 sm:gap-3">
        {/* Mobile navigation */}
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
            <nav aria-label="Mobile" className="flex flex-col px-4 pb-6">
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
              <hr className="my-3 border-border" />
              <NavLink
                to="/wishlist"
                className={navLinkClass}
                onClick={() => setMobileNavOpen(false)}
              >
                Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
              </NavLink>
              <NavLink
                to="/cart"
                className={navLinkClass}
                onClick={() => setMobileNavOpen(false)}
              >
                Bag{cartCount > 0 ? ` (${cartCount})` : ''}
              </NavLink>
              <NavLink
                to="/account"
                className={navLinkClass}
                onClick={() => setMobileNavOpen(false)}
              >
                Account
              </NavLink>
            </nav>
          </SheetContent>
        </Sheet>

        <BrandMark />

        {/* Inline search entry on desktop */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="ml-4 hidden min-h-11 flex-1 items-center gap-2 rounded-control border border-border bg-muted px-3 text-left text-sm text-muted-foreground transition-colors hover:border-ink-300 lg:flex"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" focusable="false" />
          Search for sportswear, equipment, accessories…
        </button>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search products"
            onClick={() => setSearchOpen(true)}
            className="lg:hidden"
          >
            <Search aria-hidden="true" focusable="false" />
          </Button>

          <Button variant="ghost" size="icon" aria-label="Your account" asChild>
            <Link to="/account">
              <User aria-hidden="true" focusable="false" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Your wishlist, ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'}`}
            asChild
          >
            <Link to="/wishlist">
              <Heart aria-hidden="true" focusable="false" />
              <CountBadge count={wishlistCount} />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Your shopping bag, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
            asChild
          >
            <Link to="/cart">
              <ShoppingBag aria-hidden="true" focusable="false" />
              <CountBadge count={cartCount} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop category navigation */}
      <nav aria-label="Primary" className="hidden border-t border-border lg:block">
        <ul className="container-site flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
