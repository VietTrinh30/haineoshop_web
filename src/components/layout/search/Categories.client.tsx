'use client'
import React, { useCallback, useMemo } from 'react'

import { Category, Media } from '@/payload-types'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Props = {
  category: Category
}

export const CategoryItem: React.FC<Props> = ({ category }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = useMemo(() => {
    return searchParams.get('category') === String(category.id)
  }, [category.id, searchParams])

  const setQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (isActive) {
      params.delete('category')
    } else {
      params.set('category', String(category.id))
    }

    const newParams = params.toString()

    router.push(pathname + '?' + newParams)
  }, [category.id, isActive, pathname, router, searchParams])

  const iconUrl =
    category.icon && typeof category.icon === 'object' ? (category.icon as Media).url : null

  return (
    <button
      onClick={() => setQuery()}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-all cursor-pointer',
        {
          'bg-primary text-white shadow-sm': isActive,
          'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary': !isActive,
        },
      )}
    >
      {iconUrl && (
        <span
          className="w-6 h-6 shrink-0 inline-block bg-current"
          style={{
            maskImage: `url(${iconUrl})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />
      )}
      <span className="text-sm font-medium">{category.title}</span>
    </button>
  )
}
