import type { Category, Media, Product } from '@/payload-types'

export function getPrimaryCategoryLabel(product: Product): string | null {
  const first = product.categories?.[0]
  if (!first || typeof first !== 'object') return null
  const title = (first as Category).title
  return typeof title === 'string' && title.trim() ? title : null
}

export function getProductPrimaryImage(product: Product): Media | null {
  return ((product.gallery &&
    product.gallery[0] &&
    typeof product.gallery[0] === 'object'
      ? (product.gallery[0] as { image: Media }).image
      : null) ?? product.meta?.image) as Media | null
}
