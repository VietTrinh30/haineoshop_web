'use client'

import { sorting } from '@/lib/constants'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function SortBy() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort')

  function handleSort(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('sort', slug)
    } else {
      params.delete('sort')
    }
    router.push(pathname + (params.toString() ? '?' + params.toString() : ''))
  }

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
        Sort By:
      </span>
      <div className="flex gap-2">
        {sorting.map((item) => {
          const isActive =
            item.slug === null
              ? currentSort === null || currentSort === ''
              : currentSort === item.slug
          return (
            <button
              key={item.title}
              onClick={() => handleSort(item.slug)}
              className={clsx(
                'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary',
              )}
            >
              {item.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}
