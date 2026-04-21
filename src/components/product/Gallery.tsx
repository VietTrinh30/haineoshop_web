'use client'

import type { Media as MediaType, Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { GridTileImage } from '@/components/Grid/tile'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { DefaultDocumentIDType } from 'payload'
import { PlayIcon } from 'lucide-react'

type Props = {
  gallery: NonNullable<Product['gallery']>
  video?: MediaType
}

export const Gallery: React.FC<Props> = ({ gallery, video }) => {
  const searchParams = useSearchParams()
  // Index 0 is reserved for video when present; image indices start at videoOffset
  const videoOffset = video ? 1 : 0
  const [current, setCurrent] = React.useState(0)
  const [api, setApi] = React.useState<CarouselApi>()

  useEffect(() => {
    if (!api) {
      return
    }
  }, [api])

  useEffect(() => {
    const values = Array.from(searchParams.values())

    if (values && api) {
      const index = gallery.findIndex((item) => {
        if (!item.variantOption) return false

        let variantID: DefaultDocumentIDType

        if (typeof item.variantOption === 'object') {
          variantID = item.variantOption.id
        } else variantID = item.variantOption

        return Boolean(values.find((value) => value === String(variantID)))
      })
      if (index !== -1) {
        const adjustedIndex = index + videoOffset
        setCurrent(adjustedIndex)
        api.scrollTo(adjustedIndex, true)
      }
    }
  }, [searchParams, api, gallery, videoOffset])

  const isVideoSlide = video && current === 0

  return (
    <div>
      <div className="relative w-full overflow-hidden mb-8">
        {isVideoSlide ? (
          <Media resource={video} className="w-full" videoClassName="w-full rounded-lg" />
        ) : (
          <Media
            resource={gallery[current - videoOffset]?.image}
            className="w-full"
            imgClassName="w-full rounded-lg"
          />
        )}
      </div>

      <Carousel setApi={setApi} className="w-full" opts={{ align: 'start', loop: false }}>
        <CarouselContent>
          {video && (
            <CarouselItem className="basis-1/5" onClick={() => setCurrent(0)}>
              <div className="relative">
                <GridTileImage
                  active={current === 0}
                  media={
                    video.thumbnailURL
                      ? ({ ...video, url: video.thumbnailURL, mimeType: 'image/jpeg' } as MediaType)
                      : video
                  }
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 rounded-full p-1.5">
                    <PlayIcon className="size-4 text-white fill-white" />
                  </div>
                </div>
              </div>
            </CarouselItem>
          )}
          {gallery.map((item, i) => {
            if (typeof item.image !== 'object') return null

            return (
              <CarouselItem
                className="basis-1/5"
                key={`${item.image.id}-${i}`}
                onClick={() => setCurrent(i + videoOffset)}
              >
                <GridTileImage active={i + videoOffset === current} media={item.image} />
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
