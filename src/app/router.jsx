import { createBrowserRouter } from 'react-router-dom'

import {
  AccountRoute,
  CartRoute,
  CheckoutRoute,
  CollectionDetailRoute,
  CollectionsRoute,
  OrderConfirmationRoute,
  PaymentRoute,
  ProductDetailRoute,
  WishlistRoute,
} from '@/app/lazy-routes'
import { RootLayout } from '@/components/layout/root-layout'
import { NotFoundPage } from '@/components/shared/not-found-page'
import { RouteError } from '@/components/shared/route-error'
import { HomePage } from '@/features/home/home-page'

/**
 * Application routes.
 *
 * Every storefront route shares `RootLayout`, so the header, main landmark,
 * and footer stay consistent.
 *
 * ## Code splitting
 *
 * The homepage is imported eagerly: it is the most common entry point, and
 * lazily loading the route someone almost always lands on only adds a
 * round-trip. Every other route is lazy (see `lazy-routes.jsx`), so a first
 * paint no longer carries the cart, product, collection, checkout, and account
 * screens.
 *
 * **What splitting does _not_ do on its own**, measured rather than assumed:
 * lazy routes alone left the initial bundle almost unchanged, because the site
 * header renders on every page and its search panel read the catalog. Two
 * changes fixed that:
 *
 *   - the header and footer take their navigation from `category-meta.js`,
 *     which carries no product import;
 *   - the search panel is itself lazy, so the catalog is fetched when search
 *     is first opened rather than on every route.
 *
 * The catalog is then pinned to one shared chunk by the manual chunking in
 * `vite.config.js`, so routes that do need it reuse a single copy instead of
 * each embedding its own.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'collections', element: <CollectionsRoute /> },
      { path: 'collections/:slug', element: <CollectionDetailRoute /> },
      { path: 'products/:slug', element: <ProductDetailRoute /> },
      { path: 'cart', element: <CartRoute /> },
      { path: 'checkout', element: <CheckoutRoute /> },
      { path: 'checkout/payment', element: <PaymentRoute /> },
      { path: 'orders/:id/confirmation', element: <OrderConfirmationRoute /> },
      { path: 'account', element: <AccountRoute /> },
      { path: 'wishlist', element: <WishlistRoute /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
