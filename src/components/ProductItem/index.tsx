import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { SaleBadge } from '@/components/SaleBadge'
import { SalePrice } from '@/components/SalePrice'
import { Product, Variant } from '@/payload-types'
import { getEffectivePrice } from '@/utilities/saleEvents'
import Link from 'next/link'

type Props = {
  product: Product
  style?: 'compact' | 'default'
  variant?: Variant
  quantity?: number
  /**
   * Force all formatting to a particular currency.
   */
  currencyCode?: string
}

export const ProductItem: React.FC<Props> = ({ product, quantity, variant, currencyCode }) => {
  const { title } = product

  const metaImage =
    product.meta?.image && typeof product.meta?.image !== 'string' ? product.meta.image : undefined

  const firstGalleryImage =
    typeof product.gallery?.[0]?.image !== 'string' ? product.gallery?.[0]?.image : undefined

  let image = firstGalleryImage || metaImage

  const isVariant = Boolean(variant) && typeof variant === 'object'

  if (isVariant) {
    const imageVariant = product.gallery?.find((item) => {
      if (!item.variantOptionId) return false

      const optionsArray = variant?.options as any[] | undefined
      const hasMatch = optionsArray?.some((option: any) => {
        return option.optionId === item.variantOptionId
      })

      return hasMatch
    })

    if (imageVariant && typeof imageVariant.image !== 'string') {
      image = imageVariant.image
    }
  }

  const priceInfo = getEffectivePrice(product)
  const { price: effectivePrice, originalPrice, isOnSale } = priceInfo

  // Use variant price if available, otherwise use effective price from sale calculation
  let itemPrice = variant?.priceInVND ? variant.priceInVND : effectivePrice
  let itemOriginalPrice = variant?.priceInVND ? variant.priceInVND : originalPrice
  let itemIsOnSale = isOnSale && !variant

  // Check variant hot deal price
  if (variant && typeof variant === 'object') {
    const variantHotDeal = (variant as any)?.hotDealPrice
    if (typeof variantHotDeal === 'number' && variantHotDeal > 0 && variantHotDeal < (variant.priceInVND || 0)) {
      itemPrice = variantHotDeal
      itemOriginalPrice = variant.priceInVND || 0
      itemIsOnSale = true
    }
  }

  const itemURL = `/products/${product.slug}${variant ? `?variant=${variant.id}` : ''}`

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border relative">
        <div className="relative w-full h-full">
          {image && typeof image !== 'string' && (
            <Media className="" fill imgClassName="rounded-lg object-cover" resource={image} />
          )}
        </div>

        {/* Sale Badge for products on sale (including variant hot deals) */}
        {itemIsOnSale && itemOriginalPrice && (
          <SaleBadge
            originalPrice={itemOriginalPrice}
            salePrice={itemPrice}
            variant="corner"
            className="top-1 left-1"
          />
        )}
      </div>
      <div className="flex grow justify-between items-center">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-lg">
            <Link href={itemURL}>{title}</Link>
          </p>
          {variant && (
            <p className="text-sm font-mono text-primary/50 tracking-widest">
              {(variant.options as any[])
                ?.map((option: any) => option.label)
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
          <div>
            {'x'}
            {quantity}
          </div>
        </div>

        {itemPrice && quantity && (
          <div className="text-right">
            <p className="font-medium text-lg">Subtotal</p>
            {itemIsOnSale && itemOriginalPrice ? (
              <SalePrice
                salePrice={itemPrice * quantity}
                originalPrice={itemOriginalPrice * quantity}
                as="div"
                className="flex-col items-end gap-0"
                salePriceClassName="font-mono text-sm"
                originalPriceClassName="font-mono text-xs"
                currencyCode={currencyCode}
              />
            ) : (
              <Price
                className="font-mono text-primary/50 text-sm"
                amount={itemPrice * quantity}
                currencyCode={currencyCode}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
