/* eslint-disable @next/next/no-img-element */
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
  tabs,
}) => {
  if (listingMode === 'newProducts') {
    return <ProductListingNewProductsMode heading={heading} modeLimit={modeLimit} />
  }

  if (listingMode === 'topSelling') {
    return <ProductListingTopSellingMode heading={heading} modeLimit={modeLimit} />
  }

  return (
    <ProductListingCategoriesMode
      heading={heading}
      enableSearch={enableSearch}
      tabs={tabs}
    />
  )
}

