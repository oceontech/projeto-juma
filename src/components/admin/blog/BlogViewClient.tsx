'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { relativeDate } from '../leadMeta'
import { Dropdown } from '../ui/Dropdown'
import { Flag } from '../ui/Flag'
import type { Choice } from '../ui/SitePicker'

export type BlogCard = {
  key: string
  site: 'br' | 'us'
  href: string
  title: string
  image: string | null
  meta: string[]
  status: 'published' | 'draft' | 'scheduled'
  date: string
  updatedAt: string
}

type Props = {
  site: Choice
  cards: BlogCard[]
  counts: Record<'todos' | 'published' | 'draft', number>
  status: 'todos' | 'published' | 'draft'
  search: string
  create: Record<'br' | 'us', boolean>
}

const TABS = [
  { value: 'todos', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Rascunhos' },
] as const

const NEW_POST = {
  br: { href: '/admin/collections/articles/create?locale=pt-BR', label: 'Matéria no site Brasil', hint: 'Em português, com tradução EN/ES' },
  us: { href: '/admin/collections/posts-us/create', label: 'Post no site EUA', hint: 'Em inglês' },
}

export function BlogViewClient(p: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [term, setTerm] = useState(p.search)

  const query = (status: string, q: string) => {
    const s = new URLSearchParams()
    if (status !== 'todos') s.set('status', status)
    if (q) s.set('q', q)
    const str = s.toString()
    return str ? `?${str}` : ''
  }

  useEffect(() => {
    if (term === p.search) return
    const t = window.setTimeout(() => startTransition(() => router.replace(pathname + query(p.status, term.trim()))), 350)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  // Botão "Novo post": no site escolhido vai direto; em "Todos", pergunta o site.
  const creatable = (['br', 'us'] as const).filter((s) => p.create[s] && (p.site === 'todos' || p.site === s))

  return (
    <div className={`jl${pending ? ' is-pending' : ''}`}>
      <header className="jl-head">
        <div>
          <h1>Blog</h1>
          <p>
            {p.counts.published} publicado{p.counts.published === 1 ? '' : 's'}
            {p.counts.draft ? ` · ${p.counts.draft} em rascunho` : ''}
          </p>
        </div>
        <div className="jl-head__actions">
          {creatable.length === 1 && (
            <Link className="jd-btn" href={NEW_POST[creatable[0]].href}>
              + Novo post
            </Link>
          )}
          {creatable.length > 1 && (
            <Dropdown
              label="Novo post"
              value={'' as string}
              align="right"
              options={creatable.map((s) => ({ value: s, label: NEW_POST[s].label, hint: NEW_POST[s].hint, icon: <Flag site={s} size={18} /> }))}
              onChange={(s) => router.push(NEW_POST[s as 'br' | 'us'].href)}
              trigger={<span className="jd-btn">+ Novo post</span>}
            />
          )}
        </div>
      </header>

      <div className="jl-toolbar">
        <nav className="jl-tabs" aria-label="Filtrar por publicação">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={pathname + query(t.value, p.search)}
              className={`jl-tab${t.value === p.status ? ' is-active' : ''}`}
              aria-current={t.value === p.status ? 'page' : undefined}
            >
              {t.label}
              <span className="jl-tab__count">{p.counts[t.value]}</span>
            </Link>
          ))}
        </nav>
        <label className="jl-search jl-search--inline">
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar pelo título" aria-label="Buscar no blog" />
        </label>
      </div>

      {p.cards.length === 0 ? (
        <div className="jl-empty">
          <b>Nenhum post por aqui.</b>
          <span>{p.search || p.status !== 'todos' ? 'Tente outro filtro ou limpe a busca.' : 'Crie o primeiro pelo botão “Novo post”.'}</span>
        </div>
      ) : (
        <ul className="jc-grid jc-grid--articles">
          {p.cards.map((c) => (
            <li key={c.key}>
              <Link href={c.href} className="jc-card">
                <span className="jc-card__media">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" loading="lazy" />
                  ) : (
                    <span className="jc-card__placeholder">Sem imagem</span>
                  )}
                  <span className={`jc-status jc-status--${c.status}`}>{c.status === 'published' ? 'Publicado' : c.status === 'scheduled' ? 'Agendado' : 'Rascunho'}</span>
                  <span className="jb-site" title={c.site === 'br' ? 'Site Brasil' : 'Site EUA'}>
                    <Flag site={c.site} size={20} />
                  </span>
                </span>
                <span className="jc-card__body">
                  <b>{c.title}</b>
                  <small>{c.meta.join(' · ')}</small>
                  <span className="jc-card__foot">
                    <span className="jc-updated">editado {relativeDate(c.updatedAt)}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
