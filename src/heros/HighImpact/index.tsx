'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { AnimatePresence, motion } from 'framer-motion'
import React, { type ComponentProps, useEffect, useMemo, useState } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  const slides = useMemo(
    () =>
      Array.isArray(media)
        ? media.filter(
            (item) =>
              item &&
              typeof item === 'object' &&
              'image' in item &&
              item.image &&
              typeof item.image === 'object',
          )
        : [],
    [media],
  )

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  type CMSLinkProps = ComponentProps<typeof CMSLink>

  const primaryLink = Array.isArray(links) ? links[0] : undefined

  const currentSlide: any = slides[currentIndex] || null
  const slideFeatured: string | undefined = currentSlide?.featured
  const slideTitle: string | undefined = currentSlide?.title
  const slideDescription: string | undefined = currentSlide?.description

  const slideButtonRow = Array.isArray(currentSlide?.button)
    ? currentSlide.button[0]
    : undefined
  const slideButtonLink: CMSLinkProps | null =
    slideButtonRow?.link && typeof slideButtonRow.link === 'object'
      ? (slideButtonRow.link as CMSLinkProps)
      : null

  const activeLink: CMSLinkProps | null =
    slideButtonLink ?? (primaryLink?.link ? (primaryLink.link as CMSLinkProps) : null)

  return (
    <section className="container px-6 md:px-10 py-6 md:py-10">
      <div className="@container relative overflow-hidden rounded-xl md:rounded-4xl bg-primary/5 border border-primary/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col @[864px]:flex-row items-center gap-8 md:gap-12 px-6 py-12 md:px-16 md:py-20"
          >
            {/* Left: text content */}
            <div className="flex-1 space-y-6 text-center @[864px]:text-left">
              {slideFeatured && (
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  {slideFeatured}
                </span>
              )}
              {slideTitle && (
                <h1 className="text-4xl md:text-6xl font-black text-foreground leading-[1.1]">
                  {slideTitle}
                </h1>
              )}
              {slideDescription && (
                <p className="text-lg text-muted-foreground max-w-lg mx-auto @[864px]:mx-0">
                  {slideDescription}
                </p>
              )}
              {activeLink && (
                <div className="flex flex-wrap items-center justify-center @[864px]:justify-start gap-4">
                  <CMSLink
                    {...activeLink}
                    className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Right: media frame (one visible per slide) */}
            {currentSlide?.image && (
              <div className="flex-1 w-full max-w-md @[864px]:max-w-none">
                <div className="relative aspect-square md:aspect-4/3 rounded-2xl overflow-hidden shadow-2xl">
                  <Media
                    fill
                    priority
                    resource={currentSlide.image}
                    imgClassName="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-primary/20 to-transparent" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
