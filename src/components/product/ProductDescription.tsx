'use client'
import type { Category, Product, SaleEvent, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import { SalePrice } from '@/components/SalePrice'
import { cn } from '@/utilities/cn'
import { calculateDiscountPercentage, getEffectivePrice } from '@/utilities/saleEvents'
import { Link2, Mail, Share2 } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { VariantSelector } from './VariantSelector'

export function ProductDescription({
  product,
  activeCampaigns = [],
}: {
  product: Product
  activeCampaigns?: SaleEvent[]
}) {
  let lowestAmount = 0,
    highestAmount = 0
  let singleAmount = 0
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  const priceInfo = getEffectivePrice(product, activeCampaigns)
  const { price: effectivePrice, originalPrice, isOnSale, saleEvent } = priceInfo

  if (hasVariants) {
    const sorted = (product.variants?.docs ?? [])
      .filter((v): v is Variant => typeof v === 'object' && typeof v.priceInVND === 'number')
      .sort((a, b) => (a.priceInVND ?? 0) - (b.priceInVND ?? 0))

    if (sorted.length) {
      lowestAmount = sorted[0].priceInVND ?? 0
      highestAmount = sorted[sorted.length - 1].priceInVND ?? 0
    }
  } else {
    singleAmount = product.priceInVND ?? 0
  }

  const discountPct =
    !hasVariants && isOnSale && originalPrice != null
      ? calculateDiscountPercentage(originalPrice, effectivePrice)
      : 0

  const firstCategory = product.categories?.find(
    (c): c is Category => typeof c === 'object',
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Badge */}
      {product.isTopSelling && (
        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          Best Seller
        </span>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold leading-tight">{product.title}</h1>

      {/* Price box */}
      <div className="rounded-xl bg-primary/10 px-5 py-4 flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          {hasVariants ? (
            <Price highestAmount={highestAmount} lowestAmount={lowestAmount} />
          ) : isOnSale && originalPrice != null ? (
            <>
              <SalePrice
                salePrice={effectivePrice}
                originalPrice={originalPrice}
                as="div"
                className="flex-row items-center gap-3"
                salePriceClassName="text-2xl font-bold text-primary"
                originalPriceClassName="text-sm text-muted-foreground line-through"
                saleEndDate={saleEvent?.endsAt}
                showCountdown={false}
              />
              {discountPct > 0 && (
                <span className="rounded-lg bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                  -{discountPct}% OFF
                </span>
              )}
            </>
          ) : (
            <span className="text-2xl font-bold text-primary">
              <Price amount={singleAmount} />
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Free shipping on orders over 500,000₫</p>
      </div>

      {/* Variant selector */}
      {hasVariants && (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest">Select Types</p>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
        </>
      )}

      {/* Add to cart */}
      <Suspense fallback={null}>
        <AddToCart
          product={product}
          className="rounded-lg bg-primary text-white hover:bg-primary/90 h-14 text-sm font-semibold uppercase tracking-widest border-0"
        />
      </Suspense>

      {/* Metadata */}
      <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {product.sku && (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold text-slate-900 dark:text-slate-100">SKU:</span>
              <span>{product.sku}</span>
            </div>
          )}
          {firstCategory && (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Category:</span>
              <Link
                href={`/shop?category=${firstCategory.id}`}
                className="text-primary hover:underline"
              >
                {firstCategory.title}
              </Link>
            </div>
          )}
          {product.brand && (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Brand:</span>
              <span>{product.brand}</span>
            </div>
          )}
          {product.origin && (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Origin:</span>
              <span>{product.origin}</span>
            </div>
          )}
        </div>
      </div>

      {/* Share */}
      <ShareRow />
    </div>
  )
}

function ShareRow() {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Share:</span>
      <button
        type="button"
        aria-label="Share"
        onClick={() => {
          if (navigator.share) {
            navigator.share({ url: window.location.href })
          } else {
            navigator.clipboard.writeText(window.location.href)
          }
        }}
        className={cn(
          'flex size-8 items-center justify-center rounded-full bg-blue-500 text-white hover:opacity-80 transition-opacity',
        )}
      >
        <Share2 className="size-3.5" />
      </button>
      <a
        href={`mailto:?body=${typeof window !== 'undefined' ? window.location.href : ''}`}
        aria-label="Share via email"
        className="flex size-8 items-center justify-center rounded-full bg-blue-400 text-white hover:opacity-80 transition-opacity"
      >
        <Mail className="size-3.5" />
      </a>
      <a
        href="https://www.instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Instagram"
        className="flex size-8 items-center justify-center rounded-full bg-orange-400 text-white hover:opacity-80 transition-opacity"
      >
        <Link2 className="size-3.5" />
      </a>
    </div>
  )
}
