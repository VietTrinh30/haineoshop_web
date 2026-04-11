import type { Product, ProductListingBlock as ProductListingBlockProps } from '@/payload-types'

import { DEFAULT_NEW_PRODUCT_DAYS } from '@/globals/GeneralSettings'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { ProductListingClient } from './Component.client'

type Props = ProductListingBlockProps

export const ProductListingBlock: React.FC<Props> = async (props) => {
  const { heading, listingMode, enableSearch, tabs, modeLimit, newProductDays } = props
  const activeMode = listingMode || 'categories'

  if (activeMode !== 'categories') {
    const normalizedModeLimit =
      typeof modeLimit === 'number' && modeLimit > 0 ? Math.min(24, modeLimit) : 24

    if (activeMode === 'newProducts') {
      const payload = await getPayload({ config: configPromise })
      const days =
        typeof newProductDays === 'number' && newProductDays > 0
          ? newProductDays
          : DEFAULT_NEW_PRODUCT_DAYS

      const now = new Date()
      const thresholdMs = now.getTime() - days * 24 * 60 * 60 * 1000
      const thresholdISO = new Date(thresholdMs).toISOString()

      const fetched = await payload.find({
        collection: 'products',
        depth: 1,
        limit: normalizedModeLimit,
        sort: '-createdAt',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { createdAt: { greater_than: thresholdISO } },
          ],
        },
      })

      return (
        <ProductListingClient
          heading={heading}
          listingMode={activeMode}
          modeLimit={normalizedModeLimit}
          products={fetched.docs as Product[]}
          tabs={[]}
        />
      )
    }

    if (activeMode === 'topSelling') {
      const payload = await getPayload({ config: configPromise })
      const fetched = await payload.find({
        collection: 'products',
        depth: 1,
        limit: normalizedModeLimit,
        where: {
          and: [
            { _status: { equals: 'published' } },
            { isTopSelling: { equals: true } },
          ],
        },
        sort: 'topSellingOrder',
      })

      const docs = [...(fetched.docs as Product[])].sort((a, b) => {
        const orderA =
          typeof a.topSellingOrder === 'number'
            ? a.topSellingOrder
            : Number.MAX_SAFE_INTEGER
        const orderB =
          typeof b.topSellingOrder === 'number'
            ? b.topSellingOrder
            : Number.MAX_SAFE_INTEGER
        if (orderA !== orderB) return orderA - orderB
        return (a.title || '').localeCompare(b.title || '')
      })

      return (
        <ProductListingClient
          heading={heading}
          listingMode={activeMode}
          modeLimit={normalizedModeLimit}
          products={docs}
          tabs={[]}
        />
      )
    }

    return (
      <ProductListingClient
        heading={heading}
        listingMode={activeMode}
        modeLimit={normalizedModeLimit}
        tabs={[]}
      />
    )
  }

  const payload = await getPayload({ config: configPromise })

  const adminTabs = Array.isArray(tabs) ? tabs : []

  // Always inject an implicit \"All\" tab as the first tab.
  // Admin can configure additional tabs (Bouquets, Indoor Plants, etc.)
  const tabsToUse = [
    {
      id: 'all',
      label: 'All',
      categories: null,
      limit: 8,
    },
    ...adminTabs,
  ]

  const tabsWithProducts = await Promise.all(
    tabsToUse.map(async (tab, index) => {
      const rawLimit = typeof tab.limit === 'number' && tab.limit > 0 ? tab.limit : 8
      const limit = Math.min(8, rawLimit)

      const flattenedCategories = tab.categories?.length
        ? tab.categories.map((category) => {
            if (typeof category === 'object') return category.id
            return category
          })
        : null

      const fetched = await payload.find({
        collection: 'products',
        depth: 1,
        limit,
        ...(flattenedCategories && flattenedCategories.length > 0
          ? {
              where: {
                categories: {
                  in: flattenedCategories,
                },
              },
            }
          : {}),
      })

      return {
        id: `${tab.id ?? `tab-${index}`}`,
        label: tab.label || (index === 0 ? 'All' : `Tab ${index}`),
        products: fetched.docs as Product[],
      }
    }),
  )

  // Always keep the first (All) tab, even if it is empty; drop other empty tabs.
  const nonEmptyTabs = tabsWithProducts.filter((tab, index) => tab.products.length > 0 || index === 0)

  return (
    <ProductListingClient
      heading={heading}
      listingMode={activeMode}
      enableSearch={enableSearch ?? undefined}
      tabs={nonEmptyTabs}
    />
  )
}

