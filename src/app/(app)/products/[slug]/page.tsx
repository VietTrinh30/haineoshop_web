import type { Media, Product, SaleEvent } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RichText } from '@/components/RichText'
import { Gallery } from '@/components/product/Gallery'
import { ProductBreadcrumb } from '@/components/product/ProductBreadcrumb'
import { ProductDescription } from '@/components/product/ProductDescription'
import { YouMayAlsoLike } from '@/components/product/YouMayAlsoLike'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug({ slug })

  if (!product) return notFound()

  const payload = await getPayload({ config: configPromise })

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === 'object')
      .map((item) => ({
        ...item,
        image: item.image as Media,
      })) || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined

  const now = new Date().toISOString()
  const activeCampaignsResult = await payload.find({
    collection: 'sale-events',
    where: {
      and: [
        { status: { not_equals: 'expired' } },
        { startsAt: { less_than_equal: now } },
        { endsAt: { greater_than_equal: now } },
      ],
    },
    limit: 100,
    depth: 1,
  })
  const activeCampaigns = activeCampaignsResult.docs as SaleEvent[]

  let price = product.priceInVND ?? 0

  if (product.enableVariants && product?.variants?.docs?.length) {
    for (const variant of product.variants.docs) {
      if (typeof variant === 'object' && variant?.priceInVND) {
        const variantPrice = variant.priceInVND
        if (variantPrice > price) {
          price = variantPrice
        }
      }
    }
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/InStock',
      price: price,
      priceCurrency: 'VND',
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []

  const featuredVideo =
    typeof product.featuredVideo === 'object' && product.featuredVideo
      ? (product.featuredVideo as Media)
      : undefined

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />

      <div className="container pt-8 pb-8">
        <ProductBreadcrumb product={product} />

        <div className="flex flex-col gap-12 rounded-lg lg:flex-row lg:gap-8">
          <div className="h-full w-full basis-full lg:basis-1/2">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-137.5 w-full overflow-hidden" />
              }
            >
              {Boolean(gallery?.length) && <Gallery gallery={gallery} video={featuredVideo} />}
            </Suspense>
          </div>

          <div className="basis-full lg:basis-1/2">
            <ProductDescription product={product} activeCampaigns={activeCampaigns} />
          </div>
        </div>
      </div>

      {product.description && (
        <div className="container py-12 px-5 flex flex-col gap-1 border-t border-border mt-12">
          <h2 className="text-xl font-semibold uppercase tracking-widest mb-6">
            Product Information
          </h2>
          <RichText data={product.description} enableGutter={false} />
        </div>
      )}

      {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : null}

      {relatedProducts.length ? (
        <div className="container pb-12">
          <YouMayAlsoLike products={relatedProducts as Product[]} activeCampaigns={activeCampaigns} />
        </div>
      ) : null}
    </React.Fragment>
  )
}


const queryProductBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })

  return result.docs?.[0] || null
}
