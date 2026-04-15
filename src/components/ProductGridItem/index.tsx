'use client'

import type { Product, SaleEvent } from '@/payload-types'

import { ProductBadge } from '@/components/product/ProductBadge'
import { Price } from '@/components/Price'
import { SalePrice } from '@/components/SalePrice'
import { calculateDiscountPercentage, getEffectivePrice } from '@/utilities/saleEvents'
import { getPrimaryCategoryLabel, getProductPrimaryImage } from '@/utilities/product'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  product: Product
  /** Defaults to "new" ribbon; use "bestSeller" or flash-sale "-X%". */
  badge?: 'new' | 'bestSeller' | 'salePercent'
  /** When set, sale prices resolve against these campaigns (e.g. linked flash event). */
  campaigns?: SaleEvent[]
}

export const ProductGridItem: React.FC<Props> = ({ product, badge = 'new', campaigns = [] }) => {
  const image = getProductPrimaryImage(product)

  const priceInfo = getEffectivePrice(product, campaigns)
  const { price, originalPrice, isOnSale } = priceInfo
  const discountPct =
    isOnSale && originalPrice != null && typeof price === 'number'
      ? calculateDiscountPercentage(originalPrice, price)
      : 0
  const categoryLabel = getPrimaryCategoryLabel(product)
  const slug = product.slug

  if (!slug) return null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300 cursor-pointer">
      <Link href={`/products/${slug}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.title ?? ''}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-slate-100" />
        )}
        <ProductBadge badge={badge} discountPct={discountPct} isOnSale={isOnSale} />
      </Link>
      <div className="p-3">
        {categoryLabel ? (
          <p className="text-primary text-[10px] font-bold uppercase mb-1">{categoryLabel}</p>
        ) : null}
        <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm mb-2 line-clamp-2">
          {product.title}
        </h3>
        {typeof price === 'number' ? (
          <>
            {isOnSale && originalPrice ? (
              <SalePrice
                salePrice={price}
                originalPrice={originalPrice}
                as="div"
                className="flex items-center gap-2"
                salePriceClassName="text-base font-extrabold text-slate-900 dark:text-slate-100"
                originalPriceClassName="text-sm text-slate-400 line-through"
              />
            ) : (
              <Price
                as="p"
                amount={price}
                className="text-base font-extrabold text-slate-900 dark:text-slate-100"
              />
            )}
          </>
        ) : null}
      </div>
    </article>
  )
}
