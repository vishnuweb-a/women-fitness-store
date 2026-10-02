/**
 * Which wishlist products need an option chosen before they can be added.
 *
 * Kept out of `wishlist-page.jsx` so that file exports only components and
 * Fast Refresh keeps working, and so the rule can be tested directly.
 */
/**
 * Does adding this product require a choice the wishlist cannot make?
 *
 * Mirrors the product page's own rule, so the two pages never disagree about
 * whether a size is required.
 */
export function requiresOptionChoice(product) {
  const needsSize = product.productType === 'clothing' && product.sizes.length > 1
  const needsColor = product.colors.length > 1
  return needsSize || needsColor
}
