'use client'

import { useAuth } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Flag } from './Flag'

export type Choice = 'todos' | 'br' | 'us'

const COOKIE = 'painel_site'
const EVENT = 'painel-site'

/**
 * Grava o site escolhido (cookie que o controle de acesso lê em
 * src/access/roles.ts → bySite) e avisa os outros seletores da tela — o da
 * sidebar e o da página andam juntos.
 */
export function setPanelSite(value: Choice) {
  document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
  window.dispatchEvent(new CustomEvent<Choice>(EVENT, { detail: value }))
}

/** Acompanha a escolha feita em qualquer seletor da tela. */
export function usePanelSite(initial: Choice) {
  const [value, setValue] = useState<Choice>(initial)
  useEffect(() => {
    const on = (e: Event) => setValue((e as CustomEvent<Choice>).detail)
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [])
  return [value, setValue] as const
}

/** Sites que o usuário pode ver (admin vê os dois). */
export function useAllowedSites(): ('br' | 'us')[] {
  const { user } = useAuth<{ papel?: string; sites?: ('br' | 'us')[] }>()
  return user?.papel === 'admin' ? ['br', 'us'] : (user?.sites ?? [])
}

const OPTIONS: { value: Choice; label: string; flag?: 'br' | 'us' }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'br', label: 'Brasil', flag: 'br' },
  { value: 'us', label: 'EUA', flag: 'us' },
]

/**
 * Seletor "Todos · Brasil · EUA" dentro das telas que juntam os dois sites
 * (Visão geral, Leads, Analytics, Blog). Some para quem só vê um site.
 */
export function SitePicker({ value: initial, onChange }: { value: Choice; onChange?: (value: Choice) => void }) {
  const router = useRouter()
  const sites = useAllowedSites()
  const [value, setValue] = usePanelSite(initial)
  if (sites.length < 2) return null

  const choose = (next: Choice) => {
    if (next === value) return
    setValue(next)
    setPanelSite(next)
    if (onChange) onChange(next)
    else router.refresh()
  }

  return (
    <div className="jsp" role="radiogroup" aria-label="Site">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={`jsp__opt${value === o.value ? ' is-active' : ''}`}
          onClick={() => choose(o.value)}
        >
          {o.flag && <Flag site={o.flag} size={16} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}
