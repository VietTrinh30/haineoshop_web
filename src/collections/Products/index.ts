import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { deepMerge } from '@/utilities/deepMerge'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import {
  type Block,
  DefaultDocumentIDType,
  type Field,
  slugField,
  type Tab,
  ValidationError,
  Where,
} from 'payload'

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  hooks: {
    ...(defaultCollection?.hooks ?? {}),
    beforeValidate: [
      ...(defaultCollection?.hooks?.beforeValidate ?? []),
      async ({ data, req, operation }) => {
        if (!data?.subcategories || !Array.isArray(data.subcategories) || data.subcategories.length === 0) {
          return data
        }
        if (!data?.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
          throw new ValidationError({
            errors: [
              {
                message: 'A product must have at least one category before assigning subcategories.',
                path: 'subcategories',
              },
            ],
          })
        }

        const categoryIds = new Set(
          data.categories.map((c: string | number | { id: string | number }) =>
            String(typeof c === 'object' && c !== null ? c.id : c),
          ),
        )

        const subcategoryIds = data.subcategories.map(
          (s: string | number | { id: string | number }) =>
            String(typeof s === 'object' && s !== null ? s.id : s),
        )

        const subcategoryDocs = await req.payload.find({
          collection: 'subcategories',
          where: { id: { in: subcategoryIds } },
          limit: subcategoryIds.length,
          depth: 0,
          overrideAccess: true,
          req,
        })

        const mismatched: string[] = []
        for (const sub of subcategoryDocs.docs) {
          const parentId = String(
            typeof sub.category === 'object' && sub.category !== null
              ? sub.category.id
              : sub.category,
          )
          if (!categoryIds.has(parentId)) {
            mismatched.push(sub.title as string)
          }
        }

        if (mismatched.length > 0) {
          throw new ValidationError({
            errors: [
              {
                message: `Subcategories do not belong to the selected categories: ${mismatched.join(', ')}`,
                path: 'subcategories',
              },
            ],
          })
        }

        return data
      },
    ],
  },
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ['title', 'enableVariants', '_status', 'variants.variants'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    description: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    featuredVideo: true,
    priceInVND: true,
    inventory: true,
    meta: true,
    saleEvents: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: false,
            },
            {
              name: 'gallery',
              type: 'array',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  type: 'relationship',
                  relationTo: 'variantOptions',
                  admin: {
                    condition: (data) => {
                      return data?.enableVariants === true && data?.variantTypes?.length > 0
                    },
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes.map(
                        (item: string | number | { id: string | number }) => {
                          if (typeof item === 'object' && item?.id) {
                            return item.id
                          }
                          return item
                        },
                      ) as DefaultDocumentIDType[]

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        }

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },
            {
              name: 'featuredVideo',
              type: 'upload',
              relationTo: 'media',
              label: 'Featured Video',
              admin: {
                description: 'Optional single product video shown separately from the image gallery.',
              },
              filterOptions: () => {
                return {
                  mimeType: {
                    contains: 'video',
                  },
                }
              },
            },

            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock],
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            ...defaultCollection.fields.map(function fixFields(field: Field): Field {
              if ('name' in field && field.name === 'priceInVND') {
                const newField = deepMerge(field, {
                  label: 'Price (VND)',
                  admin: {
                    description: 'Price in VND (e.g. 500000).',
                    condition: () => true, // Always show the price input
                    width: '100%',
                  },
                })
                if (newField.admin?.components?.Field) {
                  delete newField.admin.components.Field
                }
                return newField
              }
              if ('name' in field && field.name === 'priceInVNDEnabled') {
                return deepMerge(field, {
                  defaultValue: true,
                  admin: {
                    hidden: true, // Hide the checkbox
                  },
                })
              }
              if ('fields' in field && Array.isArray(field.fields)) {
                return deepMerge(field, {
                  fields: field.fields.map(fixFields),
                })
              }
              if (field.type === 'tabs') {
                return deepMerge(field, {
                  tabs: field.tabs.map((tab: Tab) => ({
                    ...tab,
                    fields: tab.fields.map(fixFields),
                  })),
                })
              }
              if (field.type === 'blocks') {
                return deepMerge(field, {
                  blocks: field.blocks.map((block: Block) => ({
                    ...block,
                    fields: block.fields && block.fields.map(fixFields),
                  })),
                })
              }
              return field
            }),
            {
              name: 'relatedProducts',
              type: 'relationship',
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  }
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                }
              },
              hasMany: true,
              relationTo: 'products',
            },
          ],
          label: 'Product Details',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        sortOptions: 'title',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    {
      name: 'subcategories',
      type: 'relationship',
      relationTo: 'subcategories',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Optional subcategories. Must belong to one of the selected categories above.',
      },
      filterOptions: ({ data }) => {
        const categories = data?.categories
        if (!categories || (Array.isArray(categories) && categories.length === 0)) {
          // No categories selected — show no subcategories
          return false
        }
        const categoryIds = (Array.isArray(categories) ? categories : [categories]).map(
          (c: string | number | { id: string | number }) =>
            typeof c === 'object' && c !== null ? c.id : c,
        ) as (string | number)[]
        return { category: { in: categoryIds } }
      },
    },
    {
      name: 'saleEvents',
      type: 'join',
      collection: 'sale-events',
      on: 'product',
      admin: {
        allowCreate: true,
        defaultColumns: ['title', 'status', 'salePrice', 'startsAt', 'endsAt'],
      },
    },
    {
      name: 'taxClasses',
      type: 'relationship',
      relationTo: 'taxes',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Specific tax classes for this product. Overrides category and default taxes.',
      },
    },
    slugField(),
  ],
})
