import { Categories } from '@/components/layout/search/Categories'
import { ClearAllFilters } from '@/components/layout/search/ClearAllFilters'
import { PriceRangeFilter } from '@/components/layout/search/PriceRangeFilter'
import {
  DEFAULT_PRICE_RANGE_MAX,
  DEFAULT_PRICE_RANGE_MIN,
} from '@/globals/GeneralSettings'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React, { Suspense } from 'react'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getCachedGlobal('general-settings', 0)()
  const priceMin = settings.priceRangeMin ?? DEFAULT_PRICE_RANGE_MIN
  const priceMax = settings.priceRangeMax ?? DEFAULT_PRICE_RANGE_MAX

  return (
    <Suspense fallback={null}>
      <div className="grow max-w-[1600px] mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-16 md:gap-4">
          <div className="w-full flex-none flex flex-col gap-4 md:gap-8 basis-1/5">
            <Categories />
            <PriceRangeFilter min={priceMin} max={priceMax} />
            <ClearAllFilters />
          </div>
          <div className="min-h-screen w-full">{children}</div>
        </div>
      </div>
    </Suspense>
  )
}
