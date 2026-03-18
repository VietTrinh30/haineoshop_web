import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const SaleEvents: CollectionConfig = {
  slug: 'sale-events',
  labels: {
    singular: 'Sale event',
    plural: 'Sale events',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Ecommerce',
    defaultColumns: ['title', 'status', 'startsAt', 'endsAt'],
    hidden: false,
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (!data) return data

        const items = data.items as Array<{ product: string | number | { id: string | number }; salePrice: number }> | undefined
        const startsAt = data.startsAt as string | undefined
        const endsAt = data.endsAt as string | undefined

        if (!items?.length) return data

        // Collect product IDs from current items
        const productIds = items.map((item) =>
          String(typeof item.product === 'object' && item.product !== null ? item.product.id : item.product),
        )

        // Reject products that already have an active Hot Deal price
        const hotDealConflicts = await req.payload.find({
          collection: 'products',
          where: {
            and: [
              { id: { in: productIds } },
              { hotDealPrice: { exists: true } },
              { hotDealPrice: { greater_than: 0 } },
            ],
          },
          limit: productIds.length,
          depth: 0,
          overrideAccess: true,
          req,
        })

        if (hotDealConflicts.docs.length > 0) {
          const titles = hotDealConflicts.docs.map((d) => `"${d.title}"`).join(', ')
          throw new Error(
            `The following products already have an active Hot Deal price and cannot be added to a sale event: ${titles}. Remove their Hot Deal price first.`,
          )
        }

        if (!startsAt || !endsAt) return data

        const currentId = operation === 'update' && data.id ? data.id : undefined

        // Find overlapping sale events for any of these products
        const overlapping = await req.payload.find({
          collection: 'sale-events',
          where: {
            and: [
              { 'items.product': { in: productIds } },
              { status: { not_equals: 'expired' } },
              // Overlap condition: existing.startsAt < new.endsAt AND existing.endsAt > new.startsAt
              { startsAt: { less_than: endsAt } },
              { endsAt: { greater_than: startsAt } },
              ...(currentId ? [{ id: { not_equals: currentId } }] : []),
            ],
          },
          limit: 10,
          depth: 0,
          overrideAccess: true,
          req,
        })

        if (overlapping.docs.length > 0) {
          const conflictTitles = overlapping.docs.map((d) => `"${d.title}"`).join(', ')
          throw new Error(
            `One or more products in this campaign overlap with existing events: ${conflictTitles}. Please adjust the dates or remove conflicting products.`,
          )
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal name for this campaign (e.g. Valentine\'s Day Sale 2025).',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Products in this campaign',
      minRows: 1,
      admin: {
        description: 'Add each product and its sale price for this campaign.',
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          filterOptions: () => ({
            or: [
              { hotDealPrice: { exists: false } },
              { hotDealPrice: { equals: null } },
            ],
          }),
        },
        {
          name: 'salePrice',
          type: 'number',
          required: true,
          admin: {
            description: 'Sale price in VND for this product. Does not change the product\'s original price.',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'scheduled',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
      ],
      admin: {
        description: 'Status is normally derived from the start/end time by the background job, but can be overridden.',
        position: 'sidebar',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startsAt',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'endsAt',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Optional notes for marketing or operations.',
      },
    },
  ],
}
