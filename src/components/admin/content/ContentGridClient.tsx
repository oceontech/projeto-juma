'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { relativeDate } from '../leadMeta'

export type ContentCard = {
  id: number
  title: string
  image: string | null
  meta: string[]
  flags: string[]
  color: string | null
  status: 'published' | 'draft'
  updatedAt: string
}

type Props = {
  collection: string
  title: string
  singular: string
  sort: string
  cards: ContentCard[]
  counts: Record<string, number>
  currentStatus: string
  search: string
  page: number
  totalPages: number
  canCreate: boolean
}

const TABS = [
  { value: 'todos', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Rascunhos' },
]

export function ContentGridClient(p: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [term, setTerm] = useState(p.search)

  const query = (status: string, search: string, page = 1) => {
    const q = new URLSearchParams()
    if (status !== 'todos') q.set('where[_status][equals]', status)
    if (search) q.set('search', search)
    if (page > 1) q.set('page', String(page))
    q.set('sort', p.sort)
    q.set('limit', '24')
    return `?${q.toString()}`
  }

  useEffect(() => {
    if (term === p.search) return
    const t = window.setTimeout(() => startTransition(() => router.replace(pathname + query(p.currentStatus, term.trim()))), 350)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  const base = `/admin/collections/${p.collection}`
  const feminine = p.singular.endsWith('a')

  return (
    <div className={`jl${pending ? ' is-pending' : ''}`}>
      <header className="jl-head">
        <div>
          <h1>{p.title}</h1>
          <p>
            {p.counts.published} publicad{feminine ? 'a' : 'o'}
            {p.counts.published === 1 ? '' : 's'}
            {p.counts.draft ? ` · ${p.counts.draft} em rascunho` : ''}
          </p>
        </div>
        {p.canCreate && (
          <Link className="jd-btn" href={`${base}/create`}>
            + Nov{feminine ? 'a' : 'o'} {p.singular}
          </Link>
        )}
      </header>

      <div className="jl-toolbar">
        <nav className="jl-tabs" aria-label="Filtrar por publicação">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={pathname + query(t.value, p.search)}
              className={`jl-tab${t.value === p.currentStatus ? ' is-active' : ''}`}
              aria-current={t.value === p.currentStatus ? 'page' : undefined}
            >
              {t.label}
              <span className="jl-tab__count">{p.counts[t.value] ?? 0}</span>
            </Link>
          ))}
        </nav>
        <label className="jl-search jl-search--inline">
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder={`Buscar ${p.title.toLowerCase()}`} aria-label={`Buscar ${p.title.toLowerCase()}`} />
        </label>
      </div>

      {p.cards.length === 0 ? (
        <div className="jl-empty">
          <b>Nada encontrado.</b>
          <span>Tente outro filtro ou limpe a busca.</span>
        </div>
      ) : (
        <ul className={`jc-grid jc-grid--${p.collection}`}>
          {p.cards.map((c) => (
            <li key={c.id}>
              <Link href={`${base}/${c.id}`} className="jc-card">
                <span className="jc-card__media">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" loading="lazy" />
                  ) : (
                    <span className="jc-card__placeholder">Sem imagem</span>
                  )}
                  <span className={`jc-status jc-status--${c.status}`}>{c.status === 'published' ? 'Publicado' : 'Rascunho'}</span>
                </span>
                <span className="jc-card__body">
                  <b>
                    {c.color && <i className="jc-color" style={{ background: c.color }} />}
                    {c.title}
                  </b>
                  <small>{c.meta.join(' · ')}</small>
                  <span className="jc-card__foot">
                    {c.flags.map((f) => (
                      <em key={f}>{f}</em>
                    ))}
                    <span className="jc-updated">editado {relativeDate(c.updatedAt)}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {p.totalPages > 1 && (
        <nav className="jl-pager" aria-label="Páginas">
          <Link className={`jl-pager__btn${p.page <= 1 ? ' is-disabled' : ''}`} href={pathname + query(p.currentStatus, p.search, Math.max(1, p.page - 1))}>
            ← Anterior
          </Link>
          <span>
            Página {p.page} de {p.totalPages}
          </span>
          <Link className={`jl-pager__btn${p.page >= p.totalPages ? ' is-disabled' : ''}`} href={pathname + query(p.currentStatus, p.search, Math.min(p.totalPages, p.page + 1))}>
            Próxima →
          </Link>
        </nav>
      )}
    </div>
  )
}
