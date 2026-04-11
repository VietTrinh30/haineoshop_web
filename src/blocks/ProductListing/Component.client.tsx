'use client'

import React from 'react'

import { ProductListingCategoriesMode } from './ProductListingCategoriesMode'
import { ProductListingNewProductsMode } from './ProductListingNewProductsMode'
import { ProductListingTopSellingMode } from './ProductListingTopSellingMode'
import type { ProductListingClientProps } from './types'

export const ProductListingClient: React.FC<ProductListingClientProps> = ({
  heading,
  listingMode,
  modeLimit,
  enableSearch,
  products,
  tabs,
}) => {
  if (listingMode === 'newProducts') {
    return (
      <ProductListingNewProductsMode
        heading={heading}
        products={products ?? []}
      />
    )
  }

  if (listingMode === 'topSelling') {
    return (
      <ProductListingTopSellingMode
        heading={heading}
        products={products ?? []}
      />
    )
  }

  return (
    <ProductListingCategoriesMode
      heading={heading}
      enableSearch={enableSearch}
      tabs={tabs}
    />
  )
}

