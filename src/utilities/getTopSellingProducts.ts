import type { Product } from '@/payload-types'
import type { Payload } from 'payload'

type TopSellingProduct = Product & {
  isTopSelling?: boolean | null
  topSellingOrder?: number | null
}

type GetTopSellingProductsArgs = {
  payload: Payload
  limit?: number
}

export async function getTopSellingProducts({
  payload,
  limit,
}: GetTopSellingProductsArgs): Promise<TopSellingProduct[]> {
  const { docs } = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    depth: 1,
    ...(typeof limit === 'number' && limit > 0 ? { limit } : {}),
    where: {
      and: [{ isTopSelling: { equals: true } }, { _status: { equals: 'published' } }],
    },
    sort: 'topSellingOrder',
    select: {
      title: true,
      slug: true,
      gallery: true,
      priceInVND: true,
      hotDealPrice: true,
      saleEvents: true,
      isTopSelling: true,
      topSellingOrder: true,
    },
  })

  return [...(docs as TopSellingProduct[])].sort((a, b) => {
    const orderA = typeof a.topSellingOrder === 'number' ? a.topSellingOrder : Number.MAX_SAFE_INTEGER
    const orderB = typeof b.topSellingOrder === 'number' ? b.topSellingOrder : Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return (a.title || '').localeCompare(b.title || '')
  })
}
