'use client'

import { Button } from '@/components/ui/button'
import { QuantityStepper } from '@/components/product/QuantityStepper'
import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

type Props = {
  product: Product
  className?: string
}

export function AddToCart({ product, className }: Props) {
  const { addItem, isLoading } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')

      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, searchParams, variants])

  const addToCart = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      addItem(
        {
          product: product.id,
          variant: selectedVariant?.id ?? undefined,
        },
        quantity,
      ).then(() => {
        toast.success('Item added to cart.')
        setQuantity(1)
      })
    },
    [addItem, product, selectedVariant, quantity],
  )

  const buyNow = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      addItem(
        {
          product: product.id,
          variant: selectedVariant?.id ?? undefined,
        },
        quantity,
      ).then(() => {
        router.push('/checkout')
      })
    },
    [addItem, product, selectedVariant, quantity, router],
  )

  const disabled = useMemo<boolean>(() => {
    if (product.enableVariants && !selectedVariant) {
      return true
    }
    return false
  }, [product.enableVariants, selectedVariant])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} min={1} disabled={isLoading} />
        <Button
          aria-label="Add to cart"
          variant={'outline'}
          className={clsx('flex-1 hover:opacity-90', className)}
          disabled={disabled || isLoading}
          onClick={addToCart}
          type="submit"
        >
          Add To Cart
        </Button>
      </div>
      <Button
        aria-label="Buy now"
        variant={'outline'}
        className="w-full h-14 rounded-lg text-sm font-semibold uppercase tracking-widest border-primary text-primary hover:bg-primary/5"
        disabled={disabled || isLoading}
        onClick={buyNow}
        type="button"
      >
        Buy Now
      </Button>
    </div>
  )
}
