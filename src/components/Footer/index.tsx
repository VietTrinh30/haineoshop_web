import { getCachedGlobal } from '@/utilities/getGlobals'

import { CMSLink } from '@/components/Link'
import { Footer as FooterType, GeneralSetting } from '@/payload-types'
import { BrandInfo } from './brand-info'
import { CopyRight } from './copy-right'

export async function Footer() {
  const footer = (await getCachedGlobal('footer', 1)()) as FooterType
  const generalSettings = (await getCachedGlobal('general-settings', 1)()) as GeneralSetting
  const { sections = [], openingHours = [] } = footer

  return (
    <footer className="bg-white dark:bg-background-dark border-t border-primary/10 pt-8">
      {/* Main Footer Content */}
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="container debug-container py-6 md:py-8 lg:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Info */}
            <BrandInfo
              facebookUrl={generalSettings.facebookPageLink}
              instagramUrl={generalSettings.instagramPageLink}
              tiktokUrl={generalSettings.tiktokPageLink}
              shopeeUrl={generalSettings.shopeePageLink}
            />

            {/* Link Columns */}
            {sections &&
              sections.map((section, i: number) => (
                <div key={i}>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">
                    {section.title}
                  </h4>
                  <ul className="space-y-4 text-sm text-slate-500">
                    {section.navItems?.map((item, j: number) => (
                      <li key={j}>
                        <CMSLink {...item.link} className="hover:text-primary transition-colors" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

            {/* Opening Hours */}
            <div>
              <h4 className="text-base font-bold mb-3 uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-primary">
                Opening Hours
              </h4>
              <ul className="space-y-0">
                {openingHours && openingHours.length > 0 ? (
                  openingHours.map((item, i: number) => (
                    <li
                      key={i}
                      className="flex justify-between border-b border-border/40 pb-1.5 pt-1 text-base"
                    >
                      <span className="text-muted-foreground">{item.day}</span>
                      <span className="font-bold text-foreground">{item.hours}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex justify-between border-b border-border/40 pb-1.5 pt-1 text-base">
                      <span className="text-muted-foreground">Mon - Fri:</span>
                      <span className="font-bold text-foreground">9:00 AM - 6:00 PM</span>
                    </li>
                    <li className="flex justify-between border-b border-border/40 pb-1.5 pt-1 text-base">
                      <span className="text-muted-foreground">Saturday:</span>
                      <span className="font-bold text-foreground">10:00 AM - 5:00 PM</span>
                    </li>
                    <li className="flex justify-between border-b border-border/40 pb-1.5 pt-1 text-base">
                      <span className="text-muted-foreground">Sunday:</span>
                      <span className="font-bold text-foreground">Closed</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <CopyRight />
      </div>
    </footer>
  )
}
