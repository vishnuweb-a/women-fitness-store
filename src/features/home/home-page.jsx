import { CategoryCard } from '@/components/shared/category-card'
import { HeroBanner } from '@/components/shared/hero-banner'
import { ProductGrid } from '@/components/shared/product-grid'
import { PromotionalBanner } from '@/components/shared/promotional-banner'
import { SectionHeading } from '@/components/shared/section-heading'
import {
  catalogCategories,
  catalogProducts,
  getCuratedProducts,
  getProductsByCategory,
} from '@/services/catalog'

/**
 * Landing page, built from the `01 HOME` reference screen.
 *
 * Section order follows the reference: hero, category rail, featured products,
 * promotional banners, a curated row, a collection discovery band, and the
 * wide "gear up" banner. The newsletter strip and footer live in
 * `SiteFooter`, as they are shared across every route.
 *
 * Two things in the reference are deliberately **not** reproduced, because no
 * data supports them and inventing them would mislead shoppers:
 *
 *   - **"Best Sellers" and "New Arrivals"** — the catalog has no sales rank
 *     and no date field. The curated rows use neutral titles instead.
 *   - **Customer testimonials and the membership programme** — FITNEX has
 *     collected no reviews and runs no membership tier. Fabricating review
 *     text and customer identities is not an option, so those sections are
 *     omitted rather than faked.
 */
export function HomePage() {
  const featured = getCuratedProducts({ count: 8, offset: 0 })
  const curated = getCuratedProducts({ count: 8, offset: 3 })

  const equipment = getProductsByCategory('women-sports-equipments').slice(0, 4)

  return (
    <div className="flex flex-col">
      <HeroBanner />

      {/* Category rail */}
      <section
        aria-labelledby="home-categories"
        className="border-b border-border bg-background"
      >
        <div className="container-site py-6">
          <h2 id="home-categories" className="sr-only">
            Shop by category
          </h2>
          <ul className="flex items-start justify-center gap-5 overflow-x-auto pb-1 sm:gap-10">
            {catalogCategories.map((category) => (
              <li key={category.slug}>
                <CategoryCard category={category} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured products */}
      <section aria-labelledby="home-featured" className="container-site py-section">
        <SectionHeading
          id="home-featured"
          title="Featured products"
          subtitle="Handpicked for your fitness journey."
          actionLabel="View all"
          actionTo="/collections"
        />
        <ProductGrid products={featured} className="mt-6" />
      </section>

      {/* Collection banners — artwork carries its own headline and button. */}
      <section aria-labelledby="home-collections" className="container-site pb-section">
        <SectionHeading
          id="home-collections"
          title="Shop the collections"
          subtitle="Built around the way you train."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <PromotionalBanner
            src="/assets/banners/banner3.webp"
            to="/collections/women-sportswear-clothing"
            label="Yoga and Pilates — shop the sportswear collection"
          />
          <PromotionalBanner
            src="/assets/banners/banner5.webp"
            to="/collections/women-sports-equipments"
            label="Strength training — shop the equipment collection"
          />
          <PromotionalBanner
            src="/assets/banners/banner4.webp"
            to="/collections/women-sports-accessories"
            label="Gym bags — shop the accessories collection"
          />
          <PromotionalBanner
            src="/assets/banners/banner6.webp"
            to="/collections/women-sports-accessories"
            label="Hydration — shop the accessories collection"
          />
        </div>
      </section>

      {/* Curated row on a dark athletic band */}
      <section aria-labelledby="home-curated" className="bg-ink-950">
        <div className="container-site py-section">
          <SectionHeading
            id="home-curated"
            title="More to explore"
            subtitle="A cross-section of the catalog, from every category."
            actionLabel="Browse everything"
            actionTo="/collections"
            tone="dark"
          />
          <ProductGrid products={curated} className="mt-6" />
        </div>
      </section>

      {/* Equipment discovery */}
      <section aria-labelledby="home-equipment" className="container-site py-section">
        <SectionHeading
          id="home-equipment"
          title="Training equipment"
          subtitle={`${getProductsByCategory('women-sports-equipments').length} products for every session.`}
          actionLabel="View equipment"
          actionTo="/collections/women-sports-equipments"
        />
        <ProductGrid products={equipment} className="mt-6" />
      </section>

      {/* Wide closing banner */}
      <section aria-label="Shop all accessories" className="container-site pb-section">
        <PromotionalBanner
          src="/assets/banners/banner9.webp"
          to="/collections/women-sports-accessories"
          label="Gear up for a stronger tomorrow — shop all accessories"
          aspect="aspect-[3/1]"
        />
      </section>

      {/* Catalog scale, stated plainly rather than as a marketing claim. */}
      <section aria-label="Catalog summary" className="border-t border-border bg-muted">
        <div className="container-site flex flex-wrap justify-center gap-x-12 gap-y-4 py-8 text-center">
          <p>
            <span className="block font-display text-3xl font-extrabold tabular-nums text-ink-950">
              {catalogProducts.length}
            </span>
            <span className="text-sm text-muted-foreground">Products</span>
          </p>
          <p>
            <span className="block font-display text-3xl font-extrabold tabular-nums text-ink-950">
              {catalogCategories.length}
            </span>
            <span className="text-sm text-muted-foreground">Categories</span>
          </p>
          <p>
            <span className="block font-display text-3xl font-extrabold tabular-nums text-ink-950">
              {new Set(catalogProducts.map((product) => product.brand).filter(Boolean)).size}
            </span>
            <span className="text-sm text-muted-foreground">Brands</span>
          </p>
        </div>
      </section>
    </div>
  )
}
