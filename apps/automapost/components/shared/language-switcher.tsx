'use client'

import { Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { locales } from '@/lib/i18n/config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
    
    router.push(newPath)
  }

  const currentLocale = locales.find(l => l.code === locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/20 text-white hover:text-gray-900 transition-colors">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {currentLocale?.name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-50 bg-white border border-gray-200 shadow-lg">
        <DropdownMenuItem onClick={() => switchLocale('en')}>
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('es')}>
          <span>Español</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-gray-500">Português</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => switchLocale('br')}>
          <span>Brasil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale('pt')}>
          <span>Portugal</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => switchLocale('fr')}>
          <span>Français</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}