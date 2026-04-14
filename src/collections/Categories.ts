import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Ecommerce',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short description for category cards (e.g. in Shop By Categories block).',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'SVG icon shown next to the category name in the shop sidebar.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'taxClasses',
      type: 'relationship',
      relationTo: 'taxes',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description:
          'Tax classes for all products in this category (unless overridden at product level).',
      },
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'subcategories',
      type: 'join',
      collection: 'subcategories',
      on: 'category',
      admin: {
        description: 'Subcategories that belong to this category.',
        defaultColumns: ['title', 'slug'],
      },
    },
  ],
}
