import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { RouteFallback } from '@/components/shared/route-fallback'

/**
 * Lazily-loaded route components.
 *
 * Kept out of `router.jsx` so that file exports only the router object and
 * this one exports only components — Fast Refresh breaks on a module that
 * mixes the two.
 *
 * The homepage is deliberately **not** here: it is the most common entry
 * point, and lazily loading the route someone almost always lands on only adds
 * a round-trip. See `router.jsx` for what code splitting does and does not
 * achieve for the catalog.
 */
const CollectionsPage = lazy(() =>
  import('@/features/collections/collections-page').then((m) => ({
    default: m.CollectionsPage,
  })),
)
const CollectionDetailPage = lazy(() =>
  import('@/features/catalog/collection-detail-page').then((m) => ({
    default: m.CollectionDetailPage,
  })),
)
const ProductDetailPage = lazy(() =>
  import('@/features/product/product-detail-page').then((m) => ({
    default: m.ProductDetailPage,
  })),
)
const CartPage = lazy(() =>
  import('@/features/cart/cart-page').then((m) => ({ default: m.CartPage })),
)
const WishlistPage = lazy(() =>
  import('@/features/account/wishlist-page').then((m) => ({ default: m.WishlistPage })),
)
const AccountPage = lazy(() =>
  import('@/features/account/account-page').then((m) => ({ default: m.AccountPage })),
)
const CheckoutPage = lazy(() =>
  import('@/features/checkout/checkout-page').then((m) => ({ default: m.CheckoutPage })),
)
const PaymentPage = lazy(() =>
  import('@/features/checkout/payment-page').then((m) => ({ default: m.PaymentPage })),
)
const OrderConfirmationPage = lazy(() =>
  import('@/features/orders/order-confirmation-page').then((m) => ({
    default: m.OrderConfirmationPage,
  })),
)

/** Wrap a lazy route in the shared loading fallback. */
function withFallback(element) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export function CollectionsRoute() {
  return withFallback(<CollectionsPage />)
}

export function CollectionDetailRoute() {
  return withFallback(<CollectionDetailPage />)
}

/**
 * The product route, remounted when the slug changes.
 *
 * The page holds per-product selections (size, colour, quantity, the
 * add-to-bag confirmation). Keying on the slug resets all of it in one place
 * when the route moves to a different product, instead of each piece of state
 * needing its own reset effect.
 */
export function ProductDetailRoute() {
  const { slug } = useParams()
  return withFallback(<ProductDetailPage key={slug} />)
}

export function CartRoute() {
  return withFallback(<CartPage />)
}

export function WishlistRoute() {
  return withFallback(<WishlistPage />)
}

export function AccountRoute() {
  return withFallback(<AccountPage />)
}

export function CheckoutRoute() {
  return withFallback(<CheckoutPage />)
}

export function PaymentRoute() {
  return withFallback(<PaymentPage />)
}

export function OrderConfirmationRoute() {
  return withFallback(<OrderConfirmationPage />)
}
