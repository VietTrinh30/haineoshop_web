import type { Block } from 'payload'

export const ProductListing: Block = {
  slug: 'productListing',
  interfaceName: 'ProductListingBlock',
  labels: {
    singular: 'Product Listing',
    plural: 'Product Listings',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      defaultValue: 'Products',
      label: 'Section heading',
      admin: {
        description: 'Main title for the product listing section.',
      },
    },
    {
      name: 'listingMode',
      type: 'select',
      required: true,
      defaultValue: 'categories',
      label: 'Listing mode',
      options: [
        {
          label: 'Categories',
          value: 'categories',
        },
        {
          label: 'New Products',
          value: 'newProducts',
        },
        {
          label: 'Top Selling',
          value: 'topSelling',
        },
      ],
    },
    {
      name: 'enableSearch',
      type: 'checkbox',
      label: 'Enable search input',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.listingMode === 'categories',
      },
    },
    {
      name: 'tabs',
      type: 'array',
      label: 'Tabs',
      minRows: 1,
      admin: {
        condition: (_, siblingData) => siblingData?.listingMode === 'categories',
      },
      labels: {
        singular: 'Tab',
        plural: 'Tabs',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label',
        },
        {
          name: 'categories',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: true,
          label: 'Categories (optional)',
          admin: {
            description:
              'If empty, this tab will show all products. If set, it will show products in the selected categories.',
          },
        },
        {
          name: 'limit',
          type: 'number',
          label: 'Max products to show (up to 8)',
          defaultValue: 8,
          min: 1,
          max: 8,
          admin: {
            step: 1,
          },
        },
      ],
    },
    {
      name: 'newProductDays',
      type: 'number',
      label: 'New product days',
      required: true,
      min: 1,
      admin: {
        condition: (_, siblingData) => siblingData?.listingMode === 'newProducts',
        description:
          'Product is new when current date - createdAt is less than this value.',
        step: 1,
      },
    },
    {
      name: 'modeLimit',
      type: 'number',
      label: 'Max products to show (up to 24)',
      defaultValue: 24,
      min: 1,
      max: 24,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.listingMode === 'newProducts' ||
          siblingData?.listingMode === 'topSelling',
        step: 1,
      },
    },
  ],
}

