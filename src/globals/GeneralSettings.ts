import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const DEFAULT_NEW_PRODUCT_DAYS = 30

const optionalUrlValidation = (value: unknown) => {
  if (!value) return true
  if (typeof value !== 'string') return 'Must be a valid URL.'

  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'URL must start with http:// or https://.'
    }
    return true
  } catch {
    return 'Must be a valid URL.'
  }
}

export const GeneralSettings: GlobalConfig = {
  slug: 'general-settings',
  label: 'General Settings',
  admin: {
    group: 'Settings',
    description: 'Configure global product age and storefront contact/social metadata.',
  },
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [
      async () => {
        const { revalidateTag } = await import('next/cache')
        revalidateTag('global_general-settings')
      },
    ],
  },
  fields: [
    {
      name: 'newProductDays',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: DEFAULT_NEW_PRODUCT_DAYS,
      admin: {
        description:
          'Number of days after creation that a product is considered new. Product is new when current date - createdAt < this value.',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
          return 'New product days must be a positive whole number.'
        }
        return true
      },
    },
    {
      name: 'contactNumber',
      type: 'text',
      required: false,
      admin: {
        description: 'Primary contact number used across storefront surfaces.',
      },
    },
    {
      name: 'facebookPageLink',
      type: 'text',
      required: false,
      validate: optionalUrlValidation,
      admin: {
        description: 'Facebook page URL (optional).',
      },
    },
    {
      name: 'instagramPageLink',
      type: 'text',
      required: false,
      validate: optionalUrlValidation,
      admin: {
        description: 'Instagram page URL (optional).',
      },
    },
    {
      name: 'tiktokPageLink',
      type: 'text',
      required: false,
      validate: optionalUrlValidation,
      admin: {
        description: 'TikTok page URL (optional).',
      },
    },
    {
      name: 'shopeePageLink',
      type: 'text',
      required: false,
      validate: optionalUrlValidation,
      admin: {
        description: 'Shopee store URL (optional).',
      },
    },
  ],
}
