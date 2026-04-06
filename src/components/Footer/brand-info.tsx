import Link from 'next/link'
import { BrandSocialLinks } from './brand-social-links'

type Props = {
  facebookUrl?: string | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
  shopeeUrl?: string | null
}

export function BrandInfo({ facebookUrl, instagramUrl, tiktokUrl, shopeeUrl }: Props) {
  return (
    <div className="space-y-6">
      {/* Brand identity row */}
      <Link href="/" className="flex items-center gap-2">
        {/* Shop logo placeholder — swap the inner content when a real logo is available */}
        <div className="size-10 flex items-center justify-center rounded-full bg-primary text-white font-bold text-base select-none shrink-0">
          H
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Hai Neo Shop</h2>
      </Link>

      {/* Brand description */}
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
        Your one-stop destination for authentic skincare and cosmetics. We believe beauty is for
        everyone.
      </p>

      {/* Social links */}
      <BrandSocialLinks
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
        tiktokUrl={tiktokUrl}
        shopeeUrl={shopeeUrl}
      />
    </div>
  )
}
