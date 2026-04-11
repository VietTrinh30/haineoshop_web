'use client'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import type { Category, Media as MediaType, ShopByCategoriesBlock } from '@/payload-types'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = ShopByCategoriesBlock

function isCategory(c: Category | number | null): c is Category {
  return c !== null && typeof c === 'object' && 'slug' in c
}

export const ShopByCategoriesBlockComponent: React.FC<Props> = (props) => {
  const { title, description, exploreMoreLink, categories } = props

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })

  const list = (Array.isArray(categories) ? categories.filter(isCategory) : [])
    .slice()
    .sort((a, b) =>
      (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' }),
    )

  if (list.length === 0) return null

  const hasExploreLink = Boolean(exploreMoreLink?.url || exploreMoreLink?.reference)

  return (
    <section className="bg-white section-spacing">
      <div className="container">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl space-y-2">
            {title ? (
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground md:text-base">{description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-4 self-start sm:self-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Show previous categories"
                className={
                  'flex size-8 items-center justify-center rounded-full border ' +
                  'border-primary/20 text-primary transition-all ' +
                  'hover:bg-primary hover:text-primary-foreground'
                }
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Show next categories"
                className={
                  'flex size-8 items-center justify-center rounded-full border ' +
                  'border-primary/20 text-primary transition-all ' +
                  'hover:bg-primary hover:text-primary-foreground'
                }
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
            {hasExploreLink && exploreMoreLink ? (
              <CMSLink
                appearance="inline"
                className="text-sm font-bold text-primary hover:underline"
                label={exploreMoreLink.label ?? 'View All'}
                newTab={exploreMoreLink.newTab}
                reference={exploreMoreLink.reference ?? undefined}
                type={exploreMoreLink.type ?? undefined}
                url={exploreMoreLink.url}
              />
            ) : (
              <Link
                href="/shop"
                className="text-sm font-bold text-primary hover:underline"
              >
                View All
              </Link>
            )}
          </div>
        </div>

        <div className="overflow-hidden pb-2" ref={emblaRef}>
          <div className="flex">
            {list.map((category) => {
              const media =
                category.image && typeof category.image === 'object'
                  ? (category.image as MediaType)
                  : null
              const id = category.id

              return (
                <div
                  key={category.id}
                  className={
                    'min-w-0 flex-[0_0_50%] pl-px pr-4 sm:flex-[0_0_25%] ' +
                    'lg:flex-[0_0_calc(100%/6)]'
                  }
                >
                  <Link href={`/shop?category=${id}`} className="group block">
                    <div
                      className={
                        'mb-3 aspect-square overflow-hidden rounded-full border-2 ' +
                        'border-transparent bg-card p-2 transition-all ' +
                        'group-hover:border-primary'
                      }
                    >
                      <div className="relative size-full overflow-hidden rounded-full bg-muted">
                        {media ? (
                          <Media
                            className="relative size-full"
                            resource={media}
                            fill
                            imgClassName="object-cover rounded-full"
                          />
                        ) : null}
                      </div>
                    </div>
                    <p className="text-center font-bold text-foreground">{category.title}</p>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
