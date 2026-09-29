'use client'

import { toast } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { relativeDate } from '../leadMeta'

export type MediaItem = {
  id: number
  url: string | null
  thumb: string | null
  filename: string
  alt: string
  mimeType: string
  width: number | null
  height: number | null
  filesize: number | null
  createdAt: string
}

type Kind = 'todos' | 'image' | 'video' | 'pdf'

type Props = {
  items: MediaItem[]
  counts: Record<Kind, number>
  noAlt: number
  kind: Kind
  search: string
  page: number
  totalPages: number
  totalDocs: number
  canCreate: boolean
}

const TABS: { value: Kind; label: string; mime?: string }[] = [
  { value: 'todos', label: 'Tudo' },
  { value: 'image', label: 'Imagens', mime: 'image/' },
  { value: 'video', label: 'Vídeos', mime: 'video/' },
  { value: 'pdf', label: 'PDFs', mime: 'application/pdf' },
]

function size(bytes: number | null) {
  if (!bytes) return null
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

/** Imagem acima de ~500 KB pesa no carregamento do site. */
const HEAVY = 500 * 1024

export function MediaGridClient(p: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [term, setTerm] = useState(p.search)

  const query = (kind: Kind, search: string, page = 1) => {
    const q = new URLSearchParams()
    const mime = TABS.find((t) => t.value === kind)?.mime
    if (mime) q.set('where[mimeType][like]', mime)
    if (search) q.set('search', search)
    if (page > 1) q.set('page', String(page))
    q.set('sort', '-createdAt')
    q.set('limit', '30')
    return `?${q.toString()}`
  }

  useEffect(() => {
    if (term === p.search) return
    const t = window.setTimeout(() => startTransition(() => router.replace(pathname + query(p.kind, term.trim()))), 350)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  const copy = async (item: MediaItem) => {
    if (!item.url) return
    const absolute = new URL(item.url, window.location.origin).toString()
    try {
      await navigator.clipboard.writeText(absolute)
      toast.success('Link copiado')
    } catch {
      toast.error('Não foi possível copiar. Abra o arquivo e copie da barra de endereço.')
    }
  }

  const base = '/admin/collections/media'

  return (
    <div className={`jl${pending ? ' is-pending' : ''}`}>
      <header className="jl-head">
        <div>
          <h1>Mídia</h1>
          <p>
            {p.counts.todos} arquivo{p.counts.todos === 1 ? '' : 's'}
            {p.noAlt ? ` · ${p.noAlt} sem texto alternativo` : ''}
          </p>
        </div>
        {p.canCreate && (
          <Link className="jd-btn" href={`${base}/create`}>
            + Enviar arquivo
          </Link>
        )}
      </header>

      <div className="jl-toolbar">
        <nav className="jl-tabs" aria-label="Filtrar por tipo">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={pathname + query(t.value, p.search)}
              className={`jl-tab${t.value === p.kind ? ' is-active' : ''}`}
              aria-current={t.value === p.kind ? 'page' : undefined}
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
          <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar pelo nome do arquivo" aria-label="Buscar mídia" />
        </label>
      </div>

      {p.items.length === 0 ? (
        <div className="jl-empty">
          <b>Nenhum arquivo por aqui.</b>
          <span>{p.search || p.kind !== 'todos' ? 'Tente outro filtro ou limpe a busca.' : 'Envie a primeira imagem pelo botão acima.'}</span>
        </div>
      ) : (
        <ul className="jm-grid">
          {p.items.map((m) => {
            const isImage = m.mimeType.startsWith('image/')
            const heavy = isImage && (m.filesize ?? 0) > HEAVY
            return (
              <li key={m.id} className="jm-card">
                <Link href={`${base}/${m.id}`} className="jm-card__media" title="Editar">
                  {isImage && m.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.thumb} alt="" loading="lazy" />
                  ) : (
                    <span className="jm-card__type">{m.mimeType.startsWith('video/') ? 'Vídeo' : m.mimeType === 'application/pdf' ? 'PDF' : 'Arquivo'}</span>
                  )}
                  {!m.alt.trim() && <span className="jm-warn">Sem texto alternativo</span>}
                </Link>
                <div className="jm-card__body">
                  <b title={m.filename}>{m.filename}</b>
                  <small title={m.alt}>{m.alt || '—'}</small>
                  <span className="jm-card__meta">
                    {m.width && m.height && (
                      <span>
                        {m.width}×{m.height}
                      </span>
                    )}
                    {size(m.filesize) && <span className={heavy ? 'is-heavy' : ''} title={heavy ? 'Arquivo pesado: comprima antes de usar no site' : undefined}>{size(m.filesize)}</span>}
                    <span>{relativeDate(m.createdAt)}</span>
                  </span>
                  <span className="jm-card__actions">
                    <button type="button" onClick={() => copy(m)} disabled={!m.url}>
                      Copiar link
                    </button>
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noreferrer">
                        Abrir
                      </a>
                    )}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {p.totalPages > 1 && (
        <nav className="jl-pager" aria-label="Páginas">
          <Link className={`jl-pager__btn${p.page <= 1 ? ' is-disabled' : ''}`} href={pathname + query(p.kind, p.search, Math.max(1, p.page - 1))}>
            ← Anterior
          </Link>
          <span>
            Página {p.page} de {p.totalPages}
          </span>
          <Link className={`jl-pager__btn${p.page >= p.totalPages ? ' is-disabled' : ''}`} href={pathname + query(p.kind, p.search, Math.min(p.totalPages, p.page + 1))}>
            Próxima →
          </Link>
        </nav>
      )}
    </div>
  )
}
