'use client'

import { useLocale } from '@payloadcms/ui'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { SitePicker, type Choice } from '../ui/SitePicker'
import { BackButton } from './BackButton'

// Telas que juntam os dois sites: o seletor Todos · Brasil · EUA fica no alto delas.
const SITE_SCREENS = ['/admin', '/admin/collections/leads', '/admin/analytics', '/admin/blog']

// Conteúdo com tradução (pt-BR, en, es): só nessas telas o idioma aparece.
const LOCALIZED = [
  /^\/admin\/collections\/(products|cultures|articles)\/[^/]+/,
  /^\/admin\/globals\/(destaques|settings)(\/|$)/,
]

const LOCALES = [
  { code: 'pt-BR', short: 'PT', label: 'Português' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'es', short: 'ES', label: 'Español' },
]

function ContentLocale() {
  const locale = useLocale()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const choose = (code: string) => {
    if (code === locale?.code) return
    const params = new URLSearchParams(window.location.search)
    params.set('locale', code)
    startTransition(() => router.push(`${window.location.pathname}?${params.toString()}`))
  }

  return (
    <div className={`jlocale${pending ? ' is-pending' : ''}`}>
      <span className="jlocale__label">Idioma do conteúdo</span>
      <div className="jsp" role="radiogroup" aria-label="Idioma do conteúdo">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={locale?.code === l.code}
            title={l.label}
            className={`jsp__opt${locale?.code === l.code ? ' is-active' : ''}`}
            onClick={() => choose(l.code)}
          >
            {l.short}
          </button>
        ))}
      </div>
    </div>
  )
}

export function HeaderBarClient({ initial }: { initial: Choice }) {
  const pathname = usePathname().replace(/\/$/, '') || '/admin'
  const siteScreen = SITE_SCREENS.includes(pathname)
  const localized = LOCALIZED.some((r) => r.test(pathname))

  return (
    <div className="jhead">
      <div className="jhead__left">{siteScreen ? <SitePicker value={initial} /> : <BackButton />}</div>
      {localized && <ContentLocale />}
    </div>
  )
}
