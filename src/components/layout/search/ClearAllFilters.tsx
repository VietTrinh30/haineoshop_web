'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export function ClearAllFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hasActiveFilters =
    searchParams.has('category') ||
    searchParams.has('q') ||
    searchParams.has('minPrice') ||
    searchParams.has('maxPrice')

  if (!hasActiveFilters) return null

  return (
    <button
      onClick={() => router.push(pathname)}
      className="w-full py-3 px-4 bg-primary/10 text-primary border border-primary/20 font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-sm"
    >
      Clear All Filters
    </button>
  )
}
