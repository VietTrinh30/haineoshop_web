export type SortFilterItem = {
  reverse: boolean
  slug: null | string
  title: string
}

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,
  title: 'A-Z',
}

export const sorting: SortFilterItem[] = [
  defaultSort,
  { slug: '-title', reverse: true, title: 'Z-A' },
  { slug: 'priceInVND', reverse: false, title: 'Price: Low to High' },
  { slug: '-priceInVND', reverse: true, title: 'Price: High to Low' },
  { slug: 'topSellingOrder', reverse: false, title: 'Top Rated' },
]
