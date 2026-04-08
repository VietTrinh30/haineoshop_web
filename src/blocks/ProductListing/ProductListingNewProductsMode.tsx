'use client'

import React from 'react'

type ProductListingNewProductsModeProps = {
  heading: string
  modeLimit?: number | null
}

export const ProductListingNewProductsMode: React.FC<ProductListingNewProductsModeProps> = ({
  heading,
  modeLimit,
}) => {
  return (
    <section className="bg-white section-spacing">
      <div className="container space-y-4 md:space-y-6">
        <div className="mb-2 md:mb-4 lg:mb-6 max-w-xl space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase text-foreground">
            {heading}
          </h2>
        </div>
        <div className="rounded-md border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
          <div>New Products placeholder (frontend implementation pending).</div>
          <div>Max products to show: {modeLimit ?? 24}</div>
        </div>
      </div>
    </section>
  )
}
