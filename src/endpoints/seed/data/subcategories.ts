export interface SubcategorySeed {
  title: string
  slug: string
  description: string
  categorySlug: string
}

export const subcategories: SubcategorySeed[] = [
  // Bouquets
  {
    title: 'Rose Bouquets',
    slug: 'rose-bouquets',
    description: 'Classic and premium rose bouquets for every occasion.',
    categorySlug: 'bouquets',
  },
  {
    title: 'Mixed Flower Bouquets',
    slug: 'mixed-flower-bouquets',
    description: 'Vibrant arrangements combining seasonal blooms.',
    categorySlug: 'bouquets',
  },

  // Indoor Plants
  {
    title: 'Succulents & Cacti',
    slug: 'succulents-cacti',
    description: 'Low-maintenance succulents and cacti for indoor spaces.',
    categorySlug: 'indoor-plants',
  },
  {
    title: 'Leafy & Tropical Plants',
    slug: 'leafy-tropical-plants',
    description: 'Lush tropical plants that bring life to any room.',
    categorySlug: 'indoor-plants',
  },

  // Outdoor Plants
  {
    title: 'Garden Shrubs',
    slug: 'garden-shrubs',
    description: 'Hardy shrubs for borders, hedges and garden beds.',
    categorySlug: 'outdoor-plants',
  },

  // Dried Flowers
  {
    title: 'Pampas Grass',
    slug: 'pampas-grass',
    description: 'Fluffy pampas grass stems for boho and natural arrangements.',
    categorySlug: 'dried-flowers',
  },
  {
    title: 'Dried Bouquets',
    slug: 'dried-bouquets',
    description: 'Ready-made dried flower bouquets that last for months.',
    categorySlug: 'dried-flowers',
  },

  // Flower Accessories
  {
    title: 'Vases & Pots',
    slug: 'vases-pots',
    description: 'Ceramic, glass and terracotta vessels for fresh or dried flowers.',
    categorySlug: 'flower-accessories',
  },
  {
    title: 'Ribbons & Wrapping',
    slug: 'ribbons-wrapping',
    description: 'Satin ribbons, kraft paper and eco wrapping materials.',
    categorySlug: 'flower-accessories',
  },

  // Gift Boxes
  {
    title: 'Flower & Candle Sets',
    slug: 'flower-candle-sets',
    description: 'Curated boxes combining blooms with scented candles.',
    categorySlug: 'gift-boxes',
  },
]
