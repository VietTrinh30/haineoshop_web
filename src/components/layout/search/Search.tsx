'use client'

import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { ChevronDown, SearchIcon, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import type { Category } from '@/payload-types'

type Props = {
  className?: string
  categories?: (Category | number | null)[]
  /** Compact pill used in site header (icon + input; no category dropdown). */
  variant?: 'default' | 'header'
  placeholder?: string
}

export const Search: React.FC<Props> = ({
  className,
  categories,
  variant = 'default',
  placeholder: placeholderProp,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [query, setQuery] = React.useState<string>(searchParams.get('q') || '')
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const didMountRef = React.useRef(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false)

  const categoryList =
    categories?.filter((cat): cat is Category => typeof cat === 'object' && cat !== null) || []

  React.useEffect(() => {
    setQuery(searchParams.get('q') || '')
    const categoryParam = searchParams.get('category')
    setSelectedCategory(categoryParam || 'all')
  }, [searchParams])

  // Debounced search: run automatically 500ms after user stops typing / changes category
  React.useEffect(() => {
    // Skip on first mount to avoid double-running initial URL state
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    // Chỉ auto-search khi đang đứng trên trang /shop
    if (!pathname.startsWith('/shop')) {
      return
    }

    const trimmed = query.trim()

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      applySearch(trimmed, selectedCategory)
    }, 500)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, selectedCategory, pathname])

  function applySearch(nextQuery: string, nextCategory: string) {
    const newParams = new URLSearchParams(searchParams.toString())

    if (nextQuery) {
      newParams.set('q', nextQuery)
    } else {
      newParams.delete('q')
    }

    if (nextCategory !== 'all') {
      newParams.set('category', nextCategory)
    } else {
      newParams.delete('category')
    }

    router.push(createUrl('/shop', newParams))
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    applySearch(query.trim(), selectedCategory)
  }

  const hasActiveFilters = Boolean(query.trim() || selectedCategory !== 'all')

  const placeholder =
    placeholderProp ??
    (variant === 'header' ? 'Find your beauty essentials...' : 'Search product...')

  function onClear() {
    setQuery('')
    setSelectedCategory('all')
    applySearch('', 'all')
  }

  return (
    <form
      className={cn(
        'relative flex items-center',
        variant === 'default' && 'w-full',
        variant === 'header' &&
          'gap-2 bg-primary/5 dark:bg-primary/10 rounded-full px-4 py-2 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all',
        className,
      )}
      onSubmit={onSubmit}
    >
      {/* Category Dropdown (full shop search bar only) */}
      {variant === 'default' && (
        <div className="relative border-r border-neutral-200 h-full hidden lg:block overflow-visible">
          <button
            type="button"
            className="h-full flex items-center px-4 cursor-pointer min-w-40 justify-between text-sm font-medium hover:text-primary transition-colors w-full text-left"
            onClick={() => setShowCategoryDropdown((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={showCategoryDropdown}
          >
            <span>
              {categoryList.find((c) => String(c.id) === selectedCategory)?.title ||
                'All Categories'}
            </span>
            <ChevronDown size={14} />
          </button>
          <div
            className={cn(
              'absolute top-full left-0 bg-background border shadow-lg z-60 min-w-full py-2 max-h-75 overflow-y-auto',
              showCategoryDropdown ? 'block' : 'hidden',
            )}
            role="listbox"
          >
            <div
              onClick={() => {
                setSelectedCategory('all')
                setShowCategoryDropdown(false)
              }}
              className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
            >
              All Categories
            </div>
            {categoryList.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(String(cat.id))
                  setShowCategoryDropdown(false)
                }}
                className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
              >
                {cat.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === 'header' && (
        <img
          src="/media/icons/search.svg"
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0 opacity-60"
          aria-hidden
        />
      )}

      <input
        autoComplete="off"
        className={cn(
          variant === 'default' &&
            'grow rounded-none bg-background px-6 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border-none focus:outline-none focus:ring-0 focus:border-none',
          variant === 'header' &&
            'grow min-w-0 bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-primary/40 outline-none focus:outline-none',
        )}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        name="search"
        placeholder={placeholder}
        type="text"
      />

      {variant === 'header' ? (
        hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors p-1"
            aria-label="Clear search and category filters"
          >
            <X size={18} />
          </button>
        )
      ) : (
        <button
          type={hasActiveFilters ? 'button' : 'submit'}
          onClick={hasActiveFilters ? onClear : undefined}
          className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors pr-2"
          aria-label={hasActiveFilters ? 'Clear search and category filters' : 'Search products'}
        >
          {hasActiveFilters ? <X size={18} /> : <SearchIcon size={20} />}
        </button>
      )}
    </form>
  )
}

