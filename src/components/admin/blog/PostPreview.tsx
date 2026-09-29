'use client'

import { useState, type ReactNode } from 'react'

/**
 * Moldura da prévia ao lado do formulário do post: como a página vai ficar,
 * como aparece no Google e o que ainda falta. Usada pela matéria (Brasil) e
 * pelo post do EUA.
 */
export type Check = { label: string; ok: boolean }

export function PostPreview({
  page,
  google,
  checks,
}: {
  page: ReactNode
  google: { url: string; title: string; description: string }
  checks: Check[]
}) {
  const [tab, setTab] = useState<'page' | 'google'>('page')
  const done = checks.filter((c) => c.ok).length

  return (
    <aside className="jpv" aria-label="Prévia do post">
      <header className="jpv__head">
        <b>Prévia</b>
        <div className="jsp" role="tablist">
          {(
            [
              ['page', 'Página'],
              ['google', 'Google'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              className={`jsp__opt${tab === value ? ' is-active' : ''}`}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {tab === 'page' ? (
        <div className="jpv__page">{page}</div>
      ) : (
        <div className="jpv__google">
          <small>{google.url}</small>
          <b>{google.title || 'Título do post'}</b>
          <p>{google.description || 'O resumo aparece aqui. Sem ele, o Google escolhe um trecho do texto.'}</p>
        </div>
      )}

      <div className="jpv__checks">
        <p>
          <b>
            {done} de {checks.length}
          </b>{' '}
          {done === checks.length ? 'pronto para publicar' : 'itens prontos'}
        </p>
        <ul>
          {checks.map((c) => (
            <li key={c.label} className={c.ok ? 'is-ok' : ''}>
              {c.label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export const paragraphs = (text?: string | null) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
