import type { Product } from '@/payload-types'

export type ListingMode = 'categories' | 'newProducts' | 'topSelling'

export type TabWithProducts = {
  id: string
  label: string
  products: Product[]
}

export type ProductListingClientProps = {
  heading: string
  listingMode?: ListingMode | null
  modeLimit?: number | null
  enableSearch?: boolean
  tabs: TabWithProducts[]
}
