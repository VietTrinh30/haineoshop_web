import Link from 'next/link'

const ICONS = {
  facebook: '/media/icons/ic_facebook.svg',
  shopee: '/media/icons/ic_shopee.svg',
  instagram: '/media/icons/ic_instagram.svg',
  tiktok: '/media/icons/ic_tiktok.svg',
} as const

type SocialLinkDef = {
  href: string
  label: string
  iconSrc: (typeof ICONS)[keyof typeof ICONS]
}

type Props = {
  facebookUrl?: string | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
  shopeeUrl?: string | null
}

function SocialIconMask({ src }: { src: string }) {
  return (
    <span
      aria-hidden
      className="inline-block size-[18px] shrink-0 bg-current"
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}

export function BrandSocialLinks({ facebookUrl, instagramUrl, tiktokUrl, shopeeUrl }: Props) {
  const links: SocialLinkDef[] = [
    { href: (facebookUrl ?? '').trim(), label: 'Facebook', iconSrc: ICONS.facebook },
    { href: (shopeeUrl ?? '').trim(), label: 'Shopee', iconSrc: ICONS.shopee },
    { href: (instagramUrl ?? '').trim(), label: 'Instagram', iconSrc: ICONS.instagram },
    { href: (tiktokUrl ?? '').trim(), label: 'TikTok', iconSrc: ICONS.tiktok },
  ].filter((l) => Boolean(l.href))

  if (links.length === 0) return null

  return (
    <div className="flex gap-4">
      {links.map(({ href, label, iconSrc }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
        >
          <SocialIconMask src={iconSrc} />
        </Link>
      ))}
    </div>
  )
}
