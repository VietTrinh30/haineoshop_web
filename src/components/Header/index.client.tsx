'use client'

import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { CategoriesNavBar } from '@/components/Header/CategoriesNavBar'
import { MobileMenu } from '@/components/Header/MobileMenu'
import { Search } from '@/components/layout/search/Search'
import Link from 'next/link'
import { Suspense, useMemo } from 'react'

import { Category, Header } from '@/payload-types'
import { useTheme } from '@/providers/Theme'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '@/providers/Auth'

type Props = {
  header: Header
  categories: Category[]
}

export function HeaderClient({ header, categories }: Props) {
  const { navItems = [], topBarContent } = header
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategoryId = searchParams.get('category')

  const { theme = 'light', setTheme } = useTheme()
  const { user } = useAuth()

  const selectedCategoryTitle = useMemo(() => {
    if (!currentCategoryId) return 'Categories'
    const found = categories?.find((cat) => String(cat.id) === currentCategoryId)
    return found ? found.title : 'Categories'
  }, [currentCategoryId, categories])

  const themeLabel = useMemo(() => {
    if (theme === 'light') return 'Light'
    if (theme === 'dark') return 'Dark'
    return 'Light'
  }, [theme])

  // const formattedContactNumber = useMemo(() => {
  //   const raw = (contactNumber || '+0123456789').trim()
  //   const digits = raw.replace(/\D/g, '')

  //   if (!digits) return raw

  //   // Vietnam: local number starting with 0, e.g. 0388291140 -> (+84)388 291 140
  //   if (digits.startsWith('0') && digits.length >= 9) {
  //     const rest = digits.slice(1)
  //     const restFormatted = rest.replace(/(\d{3})(?=\d)/g, '$1 ').trim()

  //     return `(+84)${restFormatted}`
  //   }

  //   // Vietnam: already with country code, e.g. 84388291140 -> (+84)388 291 140
  //   if (digits.startsWith('84') && digits.length > 2) {
  //     const rest = digits.slice(2)
  //     const restFormatted = rest.replace(/(\d{3})(?=\d)/g, '$1 ').trim()

  //     return `(+84)${restFormatted}`
  //   }

  //   // Generic international: +CC XXXX XXXX...
  //   const country = digits.slice(0, 2)
  //   const rest = digits.slice(2)
  //   const restFormatted = rest.replace(/(\d{4})(?=\d)/g, '$1 ').trim()

  //   return `+${country}${restFormatted ? ` ${restFormatted}` : ''}`
  // }, [contactNumber])

  return (
    <header className="relative z-50 w-full bg-white text-black" data-theme="light">
      {/* Top Bar */}
      <div className="bg-white border-b py-2 hidden md:block debug-outline debug-grid">
        <div className="container debug-container flex justify-between items-center text-sm font-light text-muted-foreground">
          <div>{topBarContent || 'Free Delivery: Take advantage of our limited time offer!'}</div>
          <div className="flex gap-6">
            <div className="relative group cursor-pointer py-1">
              <span className="flex items-center gap-1 hover:text-primary transition-colors">
                English <ChevronDown size={12} />
              </span>
              <div className="absolute top-full right-0 bg-background border shadow-lg hidden group-hover:block z-70 min-w-30 py-2">
                <div className="px-4 py-1.5 hover:bg-muted transition-colors">English</div>
                <div className="px-4 py-1.5 hover:bg-muted transition-colors">Vietnam</div>
              </div>
            </div>
            <div className="relative group cursor-pointer py-1">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                Theme: {themeLabel} <ChevronDown size={12} />
              </button>
              <div className="absolute top-full right-0 bg-background border shadow-lg hidden group-hover:block z-70 min-w-30 py-2">
                <button
                  type="button"
                  className="block w-full text-left px-4 py-1.5 hover:bg-muted transition-colors"
                  onClick={() => setTheme('light')}
                >
                  Light
                </button>
                <button
                  type="button"
                  className="block w-full text-left px-4 py-1.5 hover:bg-muted transition-colors"
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Header - higher z so search dropdown can overlap nav bar */}
      <div className="relative z-60 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="border-b border-[#E963A6]/10 px-4 md:px-20 lg:px-40 py-3">
          <div className="flex items-center justify-between gap-4 max-w-[1280px] mx-auto">
            {/* Left: Logo + Search */}
            <div className="flex items-center gap-6">
              {/* Mobile Menu Button - only on mobile */}
              <div className="md:hidden flex items-center">
                <Suspense fallback={null}>
                  <MobileMenu menu={navItems} />
                </Suspense>
              </div>

              <a className="flex items-center gap-2" href="/">
                {/* Logo image placeholder — replace src when asset is ready */}
                <div className="size-10 flex items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                  <span className="text-primary/40 text-[10px] font-bold uppercase tracking-tight">
                    Logo
                  </span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-xl font-extrabold leading-tight tracking-tight">
                  Hai Neo <span className="text-primary">Shop</span>
                </h2>
              </a>

              {/* Desktop Search — shared Search component (shop q/category + debounce) */}
              <div className="hidden md:block w-64 lg:w-96 shrink-0">
                <Suspense fallback={null}>
                  <Search variant="header" categories={categories} className="w-full" />
                </Suspense>
              </div>
            </div>

            {/* Right: Action icons — user + cart only (wishlist hidden per design) */}
            <div className="flex items-center gap-3 md:gap-6">
              <Link
                href={user ? '/account' : '/login'}
                className="flex items-center justify-center p-2 rounded-full hover:bg-primary/10 transition-colors text-slate-700 dark:text-slate-200"
                aria-label={user ? 'Open account' : 'Log in'}
              >
                <img
                  src="/media/icons/person.svg"
                  alt=""
                  width={26}
                  height={26}
                  className="size-6 shrink-0"
                  aria-hidden
                />
              </Link>

              <Cart
                renderTrigger={({ quantity }) => (
                  <button
                    type="button"
                    className="flex items-center justify-center p-2 rounded-full hover:bg-primary/10 transition-colors text-slate-700 dark:text-slate-200"
                    aria-label="Open cart"
                  >
                    <OpenCartButton quantity={quantity} />
                  </button>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories + Nav bar — desktop only; mobile nav lives in MobileMenu */}
      <CategoriesNavBar
        categories={categories}
        navItems={navItems ?? []}
        pathname={pathname}
        selectedCategoryTitle={selectedCategoryTitle}
      />
    </header>
  )
}
