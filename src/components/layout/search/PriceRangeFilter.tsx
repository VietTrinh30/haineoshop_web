'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  min: number
  max: number
}

export function PriceRangeFilter({ min: MIN, max: MAX }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didMountRef = useRef(false)

  const [minVal, setMinVal] = useState(MIN)
  const [maxVal, setMaxVal] = useState(MAX)

  useEffect(() => {
    const urlMin = Number(searchParams.get('minPrice') ?? MIN)
    const urlMax = Number(searchParams.get('maxPrice') ?? MAX)
    setMinVal(isNaN(urlMin) ? MIN : urlMin)
    setMaxVal(isNaN(urlMax) ? MAX : urlMax)
  }, [searchParams])

  const pushParams = useCallback(
    (nextMin: number, nextMax: number) => {
      const params = new URLSearchParams(searchParams.toString())

      if (nextMin === MIN) {
        params.delete('minPrice')
      } else {
        params.set('minPrice', String(nextMin))
      }

      if (nextMax === MAX) {
        params.delete('maxPrice')
      } else {
        params.set('maxPrice', String(nextMax))
      }

      router.push(pathname + '?' + params.toString())
    },
    [pathname, router, searchParams],
  )

  const scheduleUpdate = useCallback(
    (nextMin: number, nextMax: number) => {
      if (!didMountRef.current) {
        didMountRef.current = true
        return
      }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => pushParams(nextMin, nextMax), 500)
    },
    [pushParams],
  )

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - 1)
    setMinVal(val)
    scheduleUpdate(val, maxVal)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + 1)
    setMaxVal(val)
    scheduleUpdate(minVal, val)
  }

  const minPct = ((minVal - MIN) / (MAX - MIN)) * 100
  const maxPct = ((maxVal - MIN) / (MAX - MIN)) * 100

  return (
    <div>
      <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4">Price Range</h3>
      <div className="px-2">
        <div className="relative h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-6">
          {/* Active track */}
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />

          {/* Min thumb handle (visual) */}
          <div
            className="absolute -top-1.5 size-4 bg-primary border-2 border-white dark:border-background-dark rounded-full shadow-md pointer-events-none"
            style={{ left: `calc(${minPct}% - 8px)` }}
          />

          {/* Max thumb handle (visual) */}
          <div
            className="absolute -top-1.5 size-4 bg-primary border-2 border-white dark:border-background-dark rounded-full shadow-md pointer-events-none"
            style={{ left: `calc(${maxPct}% - 8px)` }}
          />

          {/* Min range input (invisible, interactive) */}
          <input
            type="range"
            min={MIN}
            max={MAX}
            value={minVal}
            onChange={handleMinChange}
            className="absolute inset-0 w-full h-4 -top-1.5 opacity-0 cursor-pointer"
            style={{ zIndex: minVal > MAX - 10 ? 5 : 3 }}
          />

          {/* Max range input (invisible, interactive) */}
          <input
            type="range"
            min={MIN}
            max={MAX}
            value={maxVal}
            onChange={handleMaxChange}
            className="absolute inset-0 w-full h-4 -top-1.5 opacity-0 cursor-pointer"
            style={{ zIndex: 4 }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{minVal} VND</span>
          <span>{maxVal} VND</span>
        </div>
      </div>
    </div>
  )
}
