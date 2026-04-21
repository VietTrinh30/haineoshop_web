import type { Category, Product, Subcategory } from '@/payload-types'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Props = {
  product: Product
}

export function ProductBreadcrumb({ product }: Props) {
  const firstCategory =
    product.categories?.find((c) => typeof c === 'object') as Category | undefined

  const firstSubcategory =
    product.subcategories?.find((s) => typeof s === 'object') as Subcategory | undefined

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link href="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {firstCategory && (
        <>
          <ChevronRight className="size-3.5 shrink-0" />
          <Link
            href={`/shop?category=${firstCategory.id}`}
            className="hover:text-foreground transition-colors"
          >
            {firstCategory.title}
          </Link>
        </>
      )}
      {firstSubcategory && (
        <>
          <ChevronRight className="size-3.5 shrink-0" />
          <Link
            href={`/shop?subcategory=${firstSubcategory.id}`}
            className="hover:text-foreground transition-colors"
          >
            {firstSubcategory.title}
          </Link>
        </>
      )}
      <ChevronRight className="size-3.5 shrink-0" />
      <span className="text-foreground font-medium truncate">{product.title}</span>
    </nav>
  )
}
