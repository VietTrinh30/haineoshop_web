import { SaleOfferClient } from '@/blocks/SaleOffer/Client'
import type { Product, SaleEvent, SaleOfferBlock as SaleOfferBlockType } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type Props = SaleOfferBlockType

export const SaleOfferBlockComponent = async (props: Props) => {
  const payload = await getPayload({ config: configPromise })

  const productRel = props.product
  let product: Product | null = null

  if (productRel && typeof productRel === 'object') {
    product = productRel as Product
  } else if (typeof productRel === 'number') {
    const result = await payload.find({
      collection: 'products',
      where: { id: { equals: productRel } },
      limit: 1,
      depth: 2,
      overrideAccess: false,
    })
    const doc = result.docs[0]
    product = doc as Product
  }

  if (!product) return null

  // Fetch active campaigns and find the one covering this product
  const nowISO = new Date().toISOString()
  const { docs: campaigns } = await payload.find({
    collection: 'sale-events',
    where: {
      or: [
        { status: { equals: 'active' } },
        {
          and: [
            { status: { not_equals: 'expired' } },
            { startsAt: { less_than_equal: nowISO } },
            { endsAt: { greater_than_equal: nowISO } },
          ],
        },
      ],
    },
    limit: 50,
    depth: 1,
    overrideAccess: true,
  })

  // Find a campaign that includes this product
  const pid = String(product.id)
  let activeSaleEvent: (SaleEvent & { resolvedSalePrice?: number }) | null = null

  for (const campaign of campaigns) {
    const items = campaign.items as Array<{ product: unknown; salePrice: number }> | undefined
    if (!items?.length) continue
    for (const item of items) {
      const itemPid = String(
        typeof item.product === 'object' && item.product !== null
          ? (item.product as { id: string | number }).id
          : item.product,
      )
      if (itemPid === pid) {
        activeSaleEvent = { ...campaign, resolvedSalePrice: item.salePrice }
        break
      }
    }
    if (activeSaleEvent) break
  }

  return <SaleOfferClient block={props} product={product} activeSaleEvent={activeSaleEvent} />
}
