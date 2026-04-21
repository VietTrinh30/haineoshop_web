'use client'

import type { Product, Variant } from '@/payload-types'

import { Price } from '@/components/Price'
import { createUrl } from '@/utilities/createUrl'
import { cn } from '@/utilities/cn'
import { CheckCircle2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export function VariantSelector({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const variants = product.variants?.docs
  const variantTypes = product.variantTypes
  const hasVariants = Boolean(product.enableVariants && variants?.length && variantTypes?.length)

  if (!hasVariants) {
    return null
  }

  return variantTypes?.map((type) => {
    if (!type || typeof type !== 'object') {
      return <React.Fragment key="empty" />
    }

    const options = type.options?.docs

    if (!options || !Array.isArray(options) || !options.length) {
      return <React.Fragment key="empty-opts" />
    }

    return (
      <div className="flex flex-wrap gap-3" key={type.id}>
        {options.map((option) => {
          if (!option || typeof option !== 'object') {
            return <React.Fragment key="empty-opt" />
          }

          const optionID = option.id
          const optionKeyLowerCase = type.name

          const optionSearchParams = new URLSearchParams(searchParams.toString())
          optionSearchParams.delete('variant')
          optionSearchParams.delete('image')
          optionSearchParams.set(optionKeyLowerCase, String(optionID))

          const currentOptions = Array.from(optionSearchParams.values())

          let matchingVariant: Variant | undefined

          if (variants) {
            matchingVariant = variants
              .filter((v): v is Variant => typeof v === 'object')
              .find((v) => {
                if (!v.options || !Array.isArray(v.options)) return false
                return v.options.every((vo) => {
                  if (typeof vo !== 'object') return currentOptions.includes(String(vo))
                  return currentOptions.includes(String(vo.id))
                })
              })

            if (matchingVariant) {
              optionSearchParams.set('variant', String(matchingVariant.id))
            }
          }

          const optionUrl = createUrl(pathname, optionSearchParams)
          const isActive = searchParams.get(optionKeyLowerCase) === String(optionID)

          const variantPrice = matchingVariant?.priceInVND ?? null

          return (
            <button
              key={option.id}
              type="button"
              title={option.label}
              onClick={() => router.replace(optionUrl, { scroll: false })}
              className={cn(
                'relative flex min-w-[100px] flex-col items-start rounded-lg border px-4 py-3 text-left transition-colors',
                'hover:border-primary/50',
                isActive ? 'border-primary bg-primary/5' : 'border-border bg-background',
              )}
            >
              {isActive && (
                <CheckCircle2 className="absolute right-2 top-2 size-4 fill-primary text-white" />
              )}
              <span className="text-sm font-medium">{option.label}</span>
              {variantPrice != null && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  <Price amount={variantPrice} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  })
}
