'use client'

import { useAuth } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Dropdown } from './ui/Dropdown'

/**
 * Seletor "Todos / Brasil / EUA" no topo da sidebar. Grava a escolha num
 * cookie que o controle de acesso lê (src/access/roles.ts → bySite): as listas
 * de leads e os números da Visão geral passam a mostrar só o site escolhido,
 * sempre dentro dos sites que o usuário pode ver.
 */
const COOKIE = 'painel_site'
type Choice = 'todos' | 'br' | 'us'

const OPTIONS = [
  { value: 'todos' as const, label: 'Todos os sites', dot: '#a1a1aa' },
  { value: 'br' as const, label: 'Juma Brasil', dot: '#22c55e' },
  { value: 'us' as const, label: 'Juma EUA', dot: '#3b82f6' },
]

function readCookie(): Choice {
  const value = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1]
  return value === 'br' || value === 'us' ? value : 'todos'
}

export function SiteSwitcher() {
  const { user } = useAuth<{ papel?: string; sites?: ('br' | 'us')[] }>()
  const router = useRouter()
  const [choice, setChoice] = useState<Choice>('todos')

  useEffect(() => {
    setChoice(readCookie())
  }, [])

  const allowed: ('br' | 'us')[] = user?.papel === 'admin' ? ['br', 'us'] : (user?.sites ?? [])
  const single = allowed.length < 2
  const current: Choice = single ? (allowed[0] ?? 'br') : choice
  const meta = OPTIONS.find((o) => o.value === current)!

  const choose = (value: Choice) => {
    document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setChoice(value)
    router.refresh()
  }

  const trigger = (
    <>
      <span className="juma-site__dot" style={{ background: meta.dot }} />
      <span className="juma-site__text">{meta.label}</span>
      {!single && (
        <svg className="jdd__chevron" viewBox="0 0 24 24" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </>
  )

  return (
    <Dropdown
      className="juma-site"
      tone="dark"
      label="Site exibido no painel"
      value={current}
      options={OPTIONS.filter((o) => o.value === 'todos' ? !single : allowed.includes(o.value))}
      onChange={choose}
      trigger={trigger}
      disabled={single}
    />
  )
}
