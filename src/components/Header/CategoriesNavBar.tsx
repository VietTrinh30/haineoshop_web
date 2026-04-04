'use client'

import { CMSLink } from '@/components/Link'
import { Category, Header } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type NavItem = NonNullable<Header['navItems']>[number]

const PLACEHOLDER_CATEGORIES = [
  'Plant Stands',
  'Outdoor Pots',
  'Lighting',
  'Fresh Flowers',
  'House Plants',
]

type Props = {
  categories: Category[]
  navItems: NavItem[]
  pathname: string
  selectedCategoryTitle: string
}

export function CategoriesNavBar({ categories, navItems, pathname, selectedCategoryTitle }: Props) {
  const [showCategories, setShowCategories] = useState(false)

  return (
    <nav className="hidden md:block border-b border-primary/10">
      <div className="px-4 md:px-20 lg:px-40 py-4">
        <div className="max-w-[1280px] mx-auto flex items-center gap-8 text-sm font-semibold">
          {/* Categories Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="group flex items-center gap-1 cursor-pointer select-none"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowCategories((prev) => !prev)
              }}
              aria-expanded={showCategories}
              aria-haspopup="true"
            >
              <span
                className={cn(
                  'transition-colors duration-200',
                  showCategories
                    ? 'text-primary'
                    : 'text-[#334155] group-hover:text-primary',
                )}
              >
                {selectedCategoryTitle}
              </span>
              <ChevronDown
                size={16}
                aria-hidden
                className={cn(
                  'shrink-0 transition-all duration-200',
                  showCategories
                    ? 'text-primary'
                    : 'text-[#334155] group-hover:text-primary',
                  showCategories && 'rotate-180',
                )}
              />
            </button>

            <div
              className={cn(
                'absolute left-0 top-full mt-1.5 w-48 overflow-hidden rounded-[0.5rem] border border-primary/10 bg-white py-2 shadow-xl z-50 transition-all duration-200',
                showCategories ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
              )}
            >
              <Link
                href="/shop"
                className="block px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                onClick={() => setShowCategories(false)}
              >
                All Categories
              </Link>
              {categories && categories.length > 0
                ? categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.id}`}
                      className="block px-4 py-2 text-sm text-[#334155] hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setShowCategories(false)}
                    >
                      {cat.title}
                    </Link>
                  ))
                : PLACEHOLDER_CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      href="/shop"
                      className="block px-4 py-2 text-sm text-[#334155]/50 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setShowCategories(false)}
                    >
                      {cat}
                    </Link>
                  ))}
            </div>
          </div>

          {/* Nav items — hidden on mobile (MobileMenu handles mobile links) */}
          {navItems && navItems.length > 0 ? (
            navItems.map((item, i) => (
              <CMSLink
                key={item.id || i}
                {...item.link}
                className={cn(
                  'block text-[#334155] hover:text-primary transition-colors',
                  pathname === item.link?.url && 'text-primary',
                )}
              />
            ))
          ) : (
            <span className="text-[#334155]/50 text-sm italic">Navigation coming soon</span>
          )}
        </div>
      </div>
    </nav>
  )
}
