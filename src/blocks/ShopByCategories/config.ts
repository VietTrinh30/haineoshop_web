import { link } from '@/fields/link'
import type { Block } from 'payload'

export const ShopByCategories: Block = {
  slug: 'shopByCategories',
  interfaceName: 'ShopByCategoriesBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Shop By Categories',
      admin: {
        description: 'Section heading.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Subtitle or short intro below the heading.',
      },
    },
    link({
      appearances: false,
      overrides: {
        name: 'exploreMoreLink',
        admin: {
          description: 'Optional "View All" link (header, next to carousel arrows).',
        },
      },
    }),
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
      maxRows: 24,
      admin: {
        description:
          'Categories shown as circular tiles in a horizontal carousel (sorted A–Z by title on the site).',
      },
    },
  ],
}
