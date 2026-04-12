'use client'

import { FlashSaleTimer } from '@/components/FlashSaleTimer'
import { ProductCartItem } from '@/components/product/ProductCartItem'
import type { Product, SaleEvent } from '@/payload-types'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export type SaleOfferSaleEventModeProps = {
  sectionTitle?: string | null
  saleEvent: SaleEvent
  saleEventShowCountdown?: boolean | null
  products: Product[]
}

export function SaleOfferSaleEventMode({
  sectionTitle,
  saleEvent,
  saleEventShowCountdown = true,
  products,
}: SaleOfferSaleEventModeProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })

  const heading = sectionTitle?.trim() || saleEvent.title?.trim() || 'Flash Sale'

  const listable = products.filter((p) => Boolean(p.slug))
  if (!listable.length) return null

  const campaignForCards = [saleEvent]

  return (
    <section className="section-spacing">
      <div className="container">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
            {saleEventShowCountdown !== false ? (
              <FlashSaleTimer endDate={saleEvent.endsAt} />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
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
            <Link
              href="/shop"
              className={
                'rounded-full bg-primary/10 px-6 py-2 text-sm font-bold ' +
                'text-primary transition-all hover:bg-primary ' +
                'hover:text-primary-foreground'
              }
            >
              View Flash Deals
            </Link>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {listable.map((product) => (
              <div
                key={product.id}
                className={
                  'min-w-0 flex-[0_0_100%] pl-px pr-8 pb-2 ' + 'sm:flex-[0_0_50%] lg:flex-[0_0_25%]'
                }
              >
                <ProductCartItem
                  badge="salePercent"
                  campaigns={campaignForCards}
                  product={product}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
