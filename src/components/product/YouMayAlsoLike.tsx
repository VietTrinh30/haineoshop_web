'use client'

import type { Product, SaleEvent } from '@/payload-types'

import { ProductCartItem } from '@/components/product/ProductCartItem'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  products: Product[]
  activeCampaigns?: SaleEvent[]
}

export function YouMayAlsoLike({ products, activeCampaigns = [] }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })

  const listable = products.filter((p) => Boolean(p.slug))
  if (!listable.length) return null

  return (
    <div className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">You May Also Like</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Show previous products"
              className={
                'flex size-8 items-center justify-center rounded-full border ' +
                'border-primary/20 text-primary transition-all ' +
                'hover:bg-primary hover:text-primary-foreground'
              }
              onClick={() => emblaApi?.scrollPrev()}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Show next products"
              className={
                'flex size-8 items-center justify-center rounded-full border ' +
                'border-primary/20 text-primary transition-all ' +
                'hover:bg-primary hover:text-primary-foreground'
              }
              onClick={() => emblaApi?.scrollNext()}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          <Link href="/shop" className="text-sm font-bold text-primary hover:underline">
            View All
          </Link>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {listable.map((product) => (
            <div
              key={product.id}
              className="min-w-0 flex-[0_0_100%] pl-px pr-8 sm:flex-[0_0_50%] lg:flex-[0_0_25%] pb-2"
            >
              <ProductCartItem
                product={product}
                badge={product.isTopSelling ? 'bestSeller' : 'new'}
                campaigns={activeCampaigns}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
