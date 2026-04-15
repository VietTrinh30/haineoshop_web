import React from 'react'

type Props = {
  badge?: 'new' | 'bestSeller' | 'salePercent'
  discountPct?: number
  /** When true, overrides badge to show the sale percent label automatically. */
  isOnSale?: boolean
}

export const ProductBadge: React.FC<Props> = ({ badge = 'new', discountPct = 0, isOnSale = false }) => {
  const resolved = isOnSale ? 'salePercent' : badge

  if (resolved === 'bestSeller') {
    return (
      <span
        className={
          'absolute top-3 left-3 rounded-full bg-slate-900 px-2 py-1 ' +
          'text-[10px] font-bold uppercase tracking-tighter text-white'
        }
      >
        Best Seller
      </span>
    )
  }

  if (resolved === 'salePercent') {
    return (
      <span
        className={
          'absolute top-3 left-3 rounded-full bg-red-500 px-2 py-1 ' +
          'text-[10px] font-bold uppercase tracking-tighter text-white'
        }
      >
        {discountPct > 0 ? `-${discountPct}%` : 'Sale'}
      </span>
    )
  }

  return (
    <span
      className={
        'absolute top-3 left-3 rounded-full bg-primary px-2 py-1 ' +
        'text-[10px] font-bold uppercase tracking-tighter text-primary-foreground'
      }
    >
      New
    </span>
  )
}
