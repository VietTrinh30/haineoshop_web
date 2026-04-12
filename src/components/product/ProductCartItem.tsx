'use client'

import type { Category, Media, Product, SaleEvent } from '@/payload-types'

import { Price } from '@/components/Price'
import { SalePrice } from '@/components/SalePrice'
import { calculateDiscountPercentage, getEffectivePrice } from '@/utilities/saleEvents'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  product: Product
  /** Defaults to "New" ribbon; use "bestSeller" or flash-sale "-X%". */
  badge?: 'new' | 'bestSeller' | 'salePercent'
  /** When set, sale prices resolve against these campaigns (e.g. linked flash event). */
  campaigns?: SaleEvent[]
}

function getPrimaryCategoryLabel(product: Product): string | null {
  const first = product.categories?.[0]
  if (!first || typeof first !== 'object') return null
  const title = (first as Category).title
  return typeof title === 'string' && title.trim() ? title : null
}

export const ProductCartItem: React.FC<Props> = ({
  product,
  badge = 'new',
  campaigns = [],
}) => {
  const image = ((product.gallery && product.gallery[0] && typeof product.gallery[0] === 'object'
    ? (product.gallery[0] as { image: Media }).image
    : null) ?? product.meta?.image) as Media | null

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
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/products/${slug}`} className="relative block aspect-square overflow-hidden">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.title ?? ''}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        {badge === 'bestSeller' ? (
          <span
            className={
              'absolute top-3 left-3 rounded-full bg-slate-900 px-2 py-1 ' +
              'text-[10px] font-bold uppercase tracking-tighter text-white'
            }
          >
            Best Seller
          </span>
        ) : badge === 'salePercent' ? (
          <span
            className={
              'absolute top-3 left-3 rounded-full bg-red-500 px-2 py-1 ' +
              'text-[10px] font-bold uppercase tracking-tighter text-primary-foreground'
            }
          >
            {discountPct > 0 ? `-${discountPct}%` : 'Sale'}
          </span>
        ) : (
          <span
            className={
              'absolute top-3 left-3 rounded-full bg-primary px-2 py-1 ' +
              'text-[10px] font-bold uppercase tracking-tighter text-primary-foreground'
            }
          >
            New
          </span>
        )}
      </Link>
      <div className="space-y-2 p-4">
        {categoryLabel ? (
          <p className="text-xs font-semibold uppercase text-primary">{categoryLabel}</p>
        ) : null}
        <h3 className="line-clamp-1 font-bold text-foreground">{product.title}</h3>
        {typeof price === 'number' ? (
          <>
            {isOnSale && originalPrice ? (
              <SalePrice
                salePrice={price}
                originalPrice={originalPrice}
                as="div"
                className="flex-col items-start gap-0"
                salePriceClassName="text-lg font-extrabold text-primary"
                originalPriceClassName="text-sm text-slate-400"
              />
            ) : (
              <Price as="p" amount={price} className="text-lg font-extrabold text-primary" />
            )}
          </>
        ) : null}
      </div>
    </article>
  )
}
