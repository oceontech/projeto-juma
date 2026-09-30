'use client'

import { useLocale } from 'next-intl'
import { useEffect, useState, type RefObject } from 'react'

import type { Block } from '../blocks'
import './article-body.css'

/**
 * Texto da matéria em blocos (o mesmo formato do blog EUA): primeiro parágrafo
 * com a letra grande, intertítulos, listas, citação em destaque. Também a
 * barra de leitura no topo e os botões de compartilhar.
 */

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'secao'

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  const firstP = blocks.findIndex((b) => b.type === 'p')
  const used = new Set<string>()
  return (
    <div className="article-body">
      {blocks.map((b, i) => {
        if (b.type === 'h2' || b.type === 'h3') {
          let id = slug(b.text)
          for (let n = 2; used.has(id); n++) id = `${slug(b.text)}-${n}`
          used.add(id)
          return (
            <h2 key={i} id={id} data-content-block className="article-body__h2">
              {b.text}
            </h2>
          )
        }
        if (b.type === 'ul')
          return (
            <ul key={i} data-content-block className="article-body__list">
              {b.items.map((item, k) => (
                <li key={k}>{item}</li>
              ))}
            </ul>
          )
        if (b.type === 'quote')
          return (
            <blockquote key={i} data-content-block className="article-body__quote">
              <p>{b.text}</p>
            </blockquote>
          )
        return (
          <p key={i} data-content-block className={i === firstP ? 'article-body__p article-body__p--first' : 'article-body__p'}>
            {b.text}
          </p>
        )
      })}
    </div>
  )
}

/** Barra verde no topo que enche conforme a leitura do texto. */
export function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = target.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight * 0.6
      setPct(Math.max(0, Math.min(1, (window.innerHeight * 0.4 - r.top) / Math.max(total, 1))))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [target])
  return (
    <div className="article-progress" aria-hidden>
      <span style={{ transform: `scaleX(${pct})` }} />
    </div>
  )
}

const LABELS = {
  'pt-BR': { share: 'Compartilhar', copy: 'Copiar link', copied: 'Link copiado' },
  en: { share: 'Share', copy: 'Copy link', copied: 'Link copied' },
  es: { share: 'Compartir', copy: 'Copiar enlace', copied: 'Enlace copiado' },
} as const

/** Compartilhar: WhatsApp, LinkedIn, Facebook e copiar link. */
export function ShareButtons({ title, withLabel }: { title: string; withLabel?: boolean }) {
  const locale = useLocale() as keyof typeof LABELS
  const l = LABELS[locale] ?? LABELS['pt-BR']
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  useEffect(() => setUrl(window.location.href.split('#')[0]), [])
  const enc = encodeURIComponent
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* sem permissão de área de transferência */
    }
  }
  return (
    <div className="article-share">
      {withLabel && <span className="article-share__label">{l.share}</span>}
      <a href={`https://wa.me/?text=${enc(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1z" />
          <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.3-1.8-.9-.8.8a4 4 0 0 1-2.2-2.2l.8-.8-.9-1.8z" />
        </svg>
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M6.5 9.5v8M6.5 6.5v.01M10.5 17.5v-4.5a3 3 0 0 1 6 0v4.5M10.5 9.5v8" />
        </svg>
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6.5H14V14h2.5l.5-3.5h-3V8.5A.5.5 0 0 1 14 8z" />
        </svg>
      </a>
      <button type="button" onClick={copy} aria-label={l.copy} title={copied ? l.copied : l.copy} data-copied={copied || undefined}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
          <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
        </svg>
      </button>
      {copied && <span className="article-share__toast">{l.copied}</span>}
    </div>
  )
}
