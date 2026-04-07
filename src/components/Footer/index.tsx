import { getCachedGlobal } from '@/utilities/getGlobals'

import { CMSLink } from '@/components/Link'
import { Footer as FooterType, GeneralSetting } from '@/payload-types'
import { BrandInfo } from './brand-info'
import { ContactInformation } from './contact-information'
import { CopyRight } from './copy-right'

export async function Footer() {
  const footer = (await getCachedGlobal('footer', 1)()) as FooterType
  const generalSettings = (await getCachedGlobal('general-settings', 1)()) as GeneralSetting
  const { sections = [], openingHours = [], location, contactNumber, email } = footer

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

            <ContactInformation
              location={location}
              contactNumber={contactNumber}
              email={email}
              openingHours={openingHours}
            />
          </div>
        </div>

        <CopyRight />
      </div>
    </footer>
  )
}
