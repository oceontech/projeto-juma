'use client'

import { useLocale } from '@payloadcms/ui'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { SitePicker, type Choice } from '../ui/SitePicker'
import { BackButton } from './BackButton'

// Telas que juntam os dois sites: o seletor Todos · Brasil · EUA fica no alto delas.
const SITE_SCREENS = ['/admin', '/admin/collections/leads', '/admin/analytics', '/admin/blog']

// Conteúdo com tradução (pt-BR, en, es): só nessas telas o idioma aparece.
const LOCALIZED = [
  /^\/admin\/collections\/(products|cultures|articles)\/[^/]+/,
  /^\/admin\/globals\/(destaques|settings)(\/|$)/,
]

// Posts do blog: o título grande do Payload sai (cabeçalho compacto) e o nome vem para esta barra.
const POST = /^\/admin\/collections\/(articles|posts-us)\/[^/]+/

/** Nome do post, lido do título do Payload (que fica escondido nas telas de post). */
function DocTitle() {
  const [title, setTitle] = useState('')
  useEffect(() => {
    const read = () => setTitle(document.querySelector('.doc-header__title')?.textContent?.trim() ?? '')
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.body, { subtree: true, childList: true, characterData: true })
    return () => mo.disconnect()
  }, [])
  if (!title) return null
  return (
    <span className="jhead__title" title={title}>
      {title}
    </span>
  )
}

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
  // Quem usa o painel não conta como visita do site Brasil (mesmo domínio): o Umami ignora este navegador.
  useEffect(() => {
    try {
      window.localStorage.setItem('umami.disabled', '1')
    } catch {
      // navegador sem armazenamento
    }
  }, [])
  const pathname = usePathname().replace(/\/$/, '') || '/admin'
  const siteScreen = SITE_SCREENS.includes(pathname)
  const localized = LOCALIZED.some((r) => r.test(pathname))

  return (
    <div className="jhead">
      <div className="jhead__left">
        {siteScreen ? <SitePicker value={initial} /> : <BackButton />}
        {POST.test(pathname) && <DocTitle />}
      </div>
      {localized && <ContentLocale />}
    </div>
  )
}
