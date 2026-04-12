import type { Block } from 'payload'

export const SaleOffer: Block = {
  slug: 'saleOffer',
  interfaceName: 'SaleOfferBlock',
  labels: {
    singular: 'Sale Offer',
    plural: 'Sale Offers',
  },
  fields: [
    {
      name: 'offerMode',
      type: 'select',
      required: true,
      defaultValue: 'product',
      label: 'Offer mode',
      options: [
        { label: 'Product', value: 'product' },
        { label: 'Sale event', value: 'saleEvent' },
      ],
    },
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Section heading',
      admin: {
        description:
          'Optional title above the offer (e.g. "Limited Time Offer"). ' +
          'Used in both Product and Sale event modes.',
      },
    },
    {
      name: 'sectionDescription',
      type: 'textarea',
      label: 'Section description',
      admin: {
        description: 'Optional short intro below the heading.',
        condition: (_, siblingData) => siblingData?.offerMode === 'product',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Linked product',
      admin: {
        description:
          'Optional. If set, this offer can reuse the product gallery and link to the product detail page.',
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.offerMode === 'product',
      },
    },
    {
      name: 'highlight',
      type: 'text',
      label: 'Highlight text',
      defaultValue: "BEST DEAL, LIMITED TIME OFFER GET YOUR'S NOW!",
      admin: {
        condition: (_, siblingData) => siblingData?.offerMode === 'product',
      },
    },
    {
      name: 'linkedSaleEvent',
      type: 'relationship',
      relationTo: 'sale-events',
      label: 'Linked sale event',
      admin: {
        description: 'Select an existing sale event from Ecommerce.',
        allowCreate: false,
        condition: (_, siblingData) => siblingData?.offerMode === 'saleEvent',
      },
    },
    {
      name: 'saleEventShowCountdown',
      type: 'checkbox',
      label: 'Show countdown',
      defaultValue: true,
      admin: {
        description: 'When enabled, a countdown can appear for the sale end time.',
        condition: (_, siblingData) => siblingData?.offerMode === 'saleEvent',
      },
    },
  ],
}
