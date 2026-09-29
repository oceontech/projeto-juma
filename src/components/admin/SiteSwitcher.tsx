'use client'

import { useAuth } from '@payloadcms/ui'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { Dropdown } from './ui/Dropdown'
import { Flag } from './ui/Flag'

/**
 * Seletor "Todos / Brasil / EUA" no topo da sidebar. Grava a escolha num
 * cookie que o controle de acesso lê (src/access/roles.ts → bySite): leads,
 * Visão geral e Analytics mostram só o site escolhido. Também troca os itens
 * da sidebar: o marcador `data-panel-site` esconde, via CSS, o que é do outro
 * site (em "Todos" fica só o geral). A escolha inicial vem do servidor
 * (SiteSwitcherServer), então a sidebar já nasce certa, sem piscar.
 */
const COOKIE = 'painel_site'
export type Choice = 'todos' | 'br' | 'us'

// Telas de um site só: ao trocar para o outro, volta para a Visão geral.
const SITE_OF: Record<string, Choice> = {
  '/admin/collections/products': 'br',
  '/admin/collections/cultures': 'br',
  '/admin/collections/articles': 'br',
  '/admin/globals/settings': 'br',
  '/admin/globals/destaques': 'br',
  '/admin/collections/posts-us': 'us',
  '/admin/globals/settings-us': 'us',
}
const screenSite = (pathname: string) => SITE_OF[pathname.split('/').slice(0, 4).join('/')] ?? null

function Globe() {
  return (
    <svg className="juma-globe" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  )
}

const OPTIONS = [
  { value: 'todos' as const, label: 'Todos os sites', hint: 'Leads e números juntos', icon: <Globe /> },
  { value: 'br' as const, label: 'Site Brasil', hint: 'Produtos, destaques, culturas e blog', icon: <Flag site="br" size={18} /> },
  { value: 'us' as const, label: 'Site EUA', hint: 'Blog e contato', icon: <Flag site="us" size={18} /> },
]

export function SiteSwitcher({ initial }: { initial: Choice }) {
  const { user } = useAuth<{ papel?: string; sites?: ('br' | 'us')[] }>()
  const router = useRouter()
  const pathname = usePathname()
  const [choice, setChoice] = useState<Choice>(initial)

  const allowed: ('br' | 'us')[] = user?.papel === 'admin' ? ['br', 'us'] : (user?.sites ?? [])
  const single = allowed.length < 2
  const current: Choice = single ? (allowed[0] ?? 'br') : choice
  const meta = OPTIONS.find((o) => o.value === current)!

  const choose = (value: Choice) => {
    document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setChoice(value)
    const here = screenSite(pathname)
    if (here && here !== value) router.push('/admin')
    else router.refresh()
  }

  const trigger = (
    <>
      {meta.icon}
      <span className="juma-site__text">{meta.label}</span>
      {!single && (
        <svg className="jdd__chevron" viewBox="0 0 24 24" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </>
  )

  return (
    <>
      <span data-panel-site={current} hidden />
      <Dropdown
        className="juma-site"
        tone="dark"
        label="Site exibido no painel"
        value={current}
        options={OPTIONS.filter((o) => (o.value === 'todos' ? !single : allowed.includes(o.value)))}
        onChange={choose}
        trigger={trigger}
        disabled={single}
      />
    </>
  )
}
