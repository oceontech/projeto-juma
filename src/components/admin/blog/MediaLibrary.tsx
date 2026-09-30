'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type MediaItem = { id: number; url: string; alt: string; filename: string; width?: number; height?: number }

/**
 * Biblioteca de imagens do painel em pop-up: busca pelo nome, miniaturas
 * quadradas e "Usar esta imagem". Substitui a gaveta padrão do Payload.
 * A rolagem é interna e sem barra; a altura corta a última fileira ao meio
 * (como a Netflix) para mostrar que tem mais embaixo, e as próximas imagens
 * carregam sozinhas ao chegar no fim.
 */
export function MediaLibrary({ onPick, onClose }: { onPick: (m: MediaItem) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)
  const [atEnd, setAtEnd] = useState(false)

  // Altura da área: fileiras inteiras + 45% da próxima, dentro do espaço da tela.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () => {
      const grid = el.firstElementChild as HTMLElement | null
      const tile = grid?.querySelector<HTMLElement>('.jlib__item')
      if (!grid || !tile) return setHeight(undefined)
      const gap = parseFloat(getComputedStyle(grid).rowGap) || 12
      const row = tile.offsetWidth + gap
      // Espaço livre: altura máxima do pop-up menos cabeçalho, busca e rodapé.
      const panel = el.closest('.jlib__panel') as HTMLElement | null
      const chrome = panel
        ? [...panel.children]
            .filter((c) => c !== el)
            .reduce((sum, c) => {
              const st = getComputedStyle(c)
              return sum + (c as HTMLElement).offsetHeight + parseFloat(st.marginTop) + parseFloat(st.marginBottom)
            }, 0)
        : 230
      const room = Math.min(window.innerHeight * 0.86, 900) - chrome
      const rows = Math.max(1, Math.floor(room / row - 0.45))
      setHeight(Math.round((rows + 0.45) * row + 4))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [items.length > 0])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const left = el.scrollHeight - el.scrollTop - el.clientHeight
    setAtEnd(left < 4)
    if (left < 240 && hasMore && !loading) setPage((p) => p + 1)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) setAtEnd(el.scrollHeight - el.scrollTop - el.clientHeight < 4)
  }, [items, height])

  useEffect(() => {
    const t = window.setTimeout(async () => {
      setLoading(true)
      const q = new URLSearchParams({ limit: '24', page: String(page), sort: '-createdAt', depth: '0' })
      q.set('where[mimeType][like]', 'image/')
      if (term.trim()) q.set('where[filename][like]', term.trim())
      try {
        const res = await fetch(`/api/media?${q.toString()}`, { credentials: 'include' })
        const data = await res.json()
        const next = (data.docs ?? []).map((d: Record<string, any>) => ({
          id: d.id,
          url: d.sizes?.thumbnail?.url ?? d.url,
          alt: d.alt ?? '',
          filename: d.filename ?? '',
          width: d.width,
          height: d.height,
        }))
        setItems((prev) => (page === 1 ? next : [...prev, ...next]))
        setHasMore(Boolean(data.hasNextPage))
      } finally {
        setLoading(false)
      }
    }, term ? 300 : 0)
    return () => window.clearTimeout(t)
  }, [page, term])

  useEffect(() => {
    searchRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return createPortal(
    <div className="jlib" role="dialog" aria-modal="true" aria-label="Biblioteca de mídia" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="jlib__panel">
        <header className="jlib__head">
          <div>
            <b>Biblioteca de mídia</b>
            <small>Escolha uma imagem já enviada ao painel</small>
          </div>
          <button type="button" className="jlib__close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>
        <label className="jl-search jlib__search">
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            value={term}
            onChange={(e) => {
              setTerm(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar pelo nome do arquivo"
          />
        </label>
        <div
          ref={scrollRef}
          className={`jlib__scroll${atEnd && !hasMore ? '' : ' has-more'}`}
          style={{ height: items.length ? height : undefined }}
          onScroll={onScroll}
        >
          <div className="jlib__grid">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`jlib__item${selected?.id === m.id ? ' is-selected' : ''}`}
                onClick={() => setSelected(m)}
                onDoubleClick={() => onPick(m)}
                title={m.alt || m.filename}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" loading="lazy" />
                <span>{m.alt || m.filename}</span>
              </button>
            ))}
            {!loading && items.length === 0 && <p className="jlib__empty">Nenhuma imagem encontrada.</p>}
            {loading && <p className="jlib__empty">Carregando…</p>}
          </div>
        </div>
        <footer className="jlib__foot">
          <span>{selected ? selected.alt || selected.filename : 'Clique numa imagem para selecionar'}</span>
          <button type="button" className="jd-btn" disabled={!selected} onClick={() => selected && onPick(selected)}>
            Usar esta imagem
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
