import type { Product, SaleEvent } from '@/payload-types'

/**
 * Find the active sale event (campaign) for a given product ID from a list of
 * pre-fetched campaign docs.  Each campaign has `items[]` with product + salePrice.
 *
 * Usage (server-side): fetch active campaigns once, then call this per product.
 */
export function findActiveCampaignForProduct(
  productId: string | number,
  campaigns: SaleEvent[],
): { salePrice: number; campaign: SaleEvent } | null {
  const pid = String(productId)
  const now = new Date()

  for (const campaign of campaigns) {
    const isActive =
      campaign.status === 'active' ||
      (campaign.status !== 'expired' &&
        new Date(campaign.startsAt) <= now &&
        new Date(campaign.endsAt) >= now)

    if (!isActive) continue

    const items = campaign.items as Array<{ product: unknown; salePrice: number }> | undefined
    if (!items?.length) continue

    for (const item of items) {
      const itemPid = String(
        typeof item.product === 'object' && item.product !== null
          ? (item.product as { id: string | number }).id
          : item.product,
      )
      if (itemPid === pid && item.salePrice != null) {
        return { salePrice: item.salePrice, campaign }
      }
    }
  }

  return null
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

/**
 * Get the effective price for a product given a list of active campaigns.
 * Pass fetched campaigns from the server — the product itself no longer embeds sale events.
 *
 * With VND currency (decimals: 0), priceInVND is stored as-is (no ×100 factor).
 */
export function getEffectivePrice(
  product: Partial<Product>,
  campaigns: SaleEvent[] = [],
): {
  price: number
  originalPrice?: number
  saleEvent?: SaleEvent
  isOnSale: boolean
  isHotDeal?: boolean
} {
  let basePrice = product.priceInVND ?? 0

  // Handle variants
  const variants = product.variants?.docs
  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInVND &&
      typeof variant.priceInVND === 'number'
    ) {
      basePrice = variant.priceInVND
    }
  }

  if (basePrice <= 0) {
    return { price: 0, isOnSale: false }
  }

  // Hot Deal takes priority over sale events — they are mutually exclusive by validation,
  // but Hot Deal is checked first as a defensive measure.
  const hotDealPrice = (product as Product & { hotDealPrice?: number | null }).hotDealPrice
  if (typeof hotDealPrice === 'number' && hotDealPrice > 0 && hotDealPrice < basePrice) {
    return {
      price: hotDealPrice,
      originalPrice: basePrice,
      isOnSale: true,
      isHotDeal: true,
    }
  }

  if (!product.id) {
    return { price: basePrice, isOnSale: false }
  }

  const match = findActiveCampaignForProduct(product.id, campaigns)

  if (match) {
    return {
      price: match.salePrice,
      originalPrice: basePrice,
      saleEvent: match.campaign,
      isOnSale: true,
      isHotDeal: false,
    }
  }

  return {
    price: basePrice,
    isOnSale: false,
  }
}
