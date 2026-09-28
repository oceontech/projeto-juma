'use client'

import { useAuth } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Seletor "Todos / Brasil / EUA" no topo da sidebar. Grava a escolha num
 * cookie que o controle de acesso lê (src/access/roles.ts → bySite): as listas
 * de leads e os números da Visão geral passam a mostrar só o site escolhido,
 * sempre dentro dos sites que o usuário pode ver.
 */
const COOKIE = 'painel_site'
type Choice = 'todos' | 'br' | 'us'

const LABEL: Record<Choice, string> = { todos: 'Todos os sites', br: 'Juma Brasil', us: 'Juma EUA' }

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

  const choose = (value: Choice) => {
    document.cookie = `${COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setChoice(value)
    router.refresh()
  }

  return (
    <label className="juma-site">
      <span className={`juma-site__icon juma-site__icon--${current}`} aria-hidden>
        {current === 'us' ? 'US' : current === 'br' ? 'BR' : '✦'}
      </span>
      <span className="juma-site__text">
        <small>Site</small>
        <b>{LABEL[current]}</b>
      </span>
      {!single && (
        <>
          <svg className="juma-site__chevron" viewBox="0 0 24 24" aria-hidden>
            <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <select aria-label="Site exibido no painel" value={current} onChange={(e) => choose(e.target.value as Choice)}>
            <option value="todos">{LABEL.todos}</option>
            <option value="br">{LABEL.br}</option>
            <option value="us">{LABEL.us}</option>
          </select>
        </>
      )}
    </label>
  )
}
