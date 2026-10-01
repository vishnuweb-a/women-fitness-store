import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from '@/components/layout/root-layout'
import { NotFoundPage } from '@/components/shared/not-found-page'
import { RouteError } from '@/components/shared/route-error'
import { AccountPage } from '@/features/account/account-page'
import { WishlistPage } from '@/features/account/wishlist-page'
import { CartPage } from '@/features/cart/cart-page'
import { CollectionDetailPage } from '@/features/catalog/collection-detail-page'
import { CheckoutPage } from '@/features/checkout/checkout-page'
import { PaymentPage } from '@/features/checkout/payment-page'
import { CollectionsPage } from '@/features/collections/collections-page'
import { HomePage } from '@/features/home/home-page'
import { OrderConfirmationPage } from '@/features/orders/order-confirmation-page'
import { ProductDetailPage } from '@/features/product/product-detail-page'

/**
 * Application routes.
 *
 * Every storefront route shares `RootLayout`, so the header, main landmark,
 * and footer stay consistent. Pages are imported eagerly while the app is
 * small; route-level `React.lazy` splitting is worth adding once the real
 * screens land.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'collections', element: <CollectionsPage /> },
      { path: 'collections/:slug', element: <CollectionDetailPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'checkout/payment', element: <PaymentPage /> },
      { path: 'orders/:id/confirmation', element: <OrderConfirmationPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
