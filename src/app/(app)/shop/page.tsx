import { Grid } from '@/components/Grid'
import { SortBy } from '@/components/layout/search/SortBy'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPayload } from 'payload'

export const metadata = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

// 2xl (6 cols) × 3 rows = 18 — the maximum needed across all breakpoints
const LIMIT = 18

// CSS hiding: each item index maps to the breakpoint at which it becomes visible.
// Items beyond 3 rows for smaller screens are hidden until the grid is wide enough.
function getVisibilityClass(index: number): string {
  if (index < 6) return ''               // all sizes   (2 cols → 3 rows)
  if (index < 9) return 'hidden sm:block'  // sm+         (3 cols → 3 rows)
  if (index < 12) return 'hidden lg:block' // lg+         (4 cols → 3 rows)
  if (index < 15) return 'hidden xl:block' // xl+         (5 cols → 3 rows)
  return 'hidden 2xl:block'               // 2xl+        (6 cols → 3 rows)
}

function buildPageUrl(params: SearchParams, pageNum: number): string {
  const p = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (key === 'page') continue
    if (val === undefined) continue
    if (Array.isArray(val)) {
      val.forEach((v) => p.append(key, v))
    } else {
      p.set(key, val)
    }
  }
  if (pageNum > 1) p.set('page', String(pageNum))
  return `/shop${p.toString() ? '?' + p.toString() : ''}`
}

function getPageRange(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  if (current <= 3) {
    // e.g. page 1 of 8  →  1, 2, 3, ..., 8
    return [1, 2, 3, 'ellipsis', total]
  }
  if (current >= total - 2) {
    // e.g. page 7 of 8  →  1, ..., 6, 7, 8
    return [1, 'ellipsis', total - 2, total - 1, total]
  }
  // middle  →  1, ..., prev, current, next, ..., last
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const { q: searchValue, sort, category, minPrice, maxPrice, page } = params
  const payload = await getPayload({ config: configPromise })

  const pageNum = page ? Number(page) : 1
  const minPriceNum = minPrice ? Number(minPrice) : undefined
  const maxPriceNum = maxPrice ? Number(maxPrice) : undefined

  const hasFilters =
    searchValue || category || minPriceNum !== undefined || maxPriceNum !== undefined

  const now = new Date().toISOString()
  const activeCampaignsResult = await payload.find({
    collection: 'sale-events',
    where: {
      and: [
        { status: { not_equals: 'expired' } },
        { startsAt: { less_than_equal: now } },
        { endsAt: { greater_than_equal: now } },
      ],
    },
    limit: 100,
    depth: 1,
  })
  const activeCampaigns = activeCampaignsResult.docs

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    depth: 1,
    limit: LIMIT,
    page: pageNum,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInVND: true,
      saleEvents: true,
      topSellingOrder: true,
    },
    ...(sort ? { sort } : { sort: 'title' }),
    ...(hasFilters
      ? {
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              ...(searchValue
                ? [
                    {
                      or: [
                        {
                          title: {
                            like: searchValue,
                          },
                        },
                        {
                          description: {
                            like: searchValue,
                          },
                        },
                      ],
                    },
                  ]
                : []),
              ...(category
                ? [
                    {
                      categories: {
                        contains: category,
                      },
                    },
                  ]
                : []),
              ...(minPriceNum !== undefined
                ? [{ priceInVND: { greater_than_equal: minPriceNum } }]
                : []),
              ...(maxPriceNum !== undefined
                ? [{ priceInVND: { less_than_equal: maxPriceNum } }]
                : []),
            ],
          },
        }
      : {}),
  })

  const resultsText = products.docs.length > 1 ? 'results' : 'result'
  const currentPage = products.page ?? 1
  const totalPages = products.totalPages ?? 1
  const pageRange = getPageRange(currentPage, totalPages)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {products.docs.length}
          </span>{' '}
          of{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {products.totalDocs}
          </span>{' '}
          {products.totalDocs === 1 ? 'product' : 'products'}
        </p>
        <SortBy />
      </div>

      {searchValue ? (
        <p>
          {products.docs?.length === 0
            ? 'There are no products that match '
            : `Showing ${products.docs.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && products.docs?.length === 0 && (
        <p>No products found. Please try different filters.</p>
      )}

      {products?.docs.length > 0 ? (
        <Grid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {products.docs.map((product, index) => (
            <div key={product.id} className={getVisibilityClass(index)}>
              <ProductGridItem product={product as any} campaigns={activeCampaigns} />
            </div>
          ))}
        </Grid>
      ) : null}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-1">
            {/* Previous */}
            <a
              href={products.hasPrevPage ? buildPageUrl(params, currentPage - 1) : undefined}
              aria-label="Go to previous page"
              aria-disabled={!products.hasPrevPage}
              className={`size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-primary/10 hover:text-primary transition-all ${
                !products.hasPrevPage ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <ChevronLeft className="size-4" />
            </a>

            {/* Page numbers */}
            {pageRange.map((item, idx) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                  ...
                </span>
              ) : (
                <a
                  key={item}
                  href={buildPageUrl(params, item)}
                  aria-current={item === currentPage ? 'page' : undefined}
                  className={
                    item === currentPage
                      ? 'size-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-sm'
                      : 'size-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary font-medium transition-all'
                  }
                >
                  {item}
                </a>
              ),
            )}

            {/* Next */}
            <a
              href={products.hasNextPage ? buildPageUrl(params, currentPage + 1) : undefined}
              aria-label="Go to next page"
              aria-disabled={!products.hasNextPage}
              className={`size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-primary/10 hover:text-primary transition-all ${
                !products.hasNextPage ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <ChevronRight className="size-4" />
            </a>
          </nav>
        </div>
      )}
    </div>
  )
}
