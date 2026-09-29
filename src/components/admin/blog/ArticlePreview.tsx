'use client'

import { useLocale } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { useEffect, useState } from 'react'

import { PostPreview, paragraphs } from './PostPreview'
import { usePostForm } from './usePostForm'

/** URL de uma mídia do painel pelo id do campo de upload. */
export function useMediaUrl(ref: unknown) {
  const id = typeof ref === 'object' && ref ? (ref as { id: number }).id : ref
  const [url, setUrl] = useState<string | null>(typeof ref === 'object' && ref && 'url' in ref ? ((ref as { url?: string }).url ?? null) : null)
  useEffect(() => {
    if (!id) return setUrl(null)
    let alive = true
    fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => alive && setUrl(m?.url ?? null))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [id])
  return url
}

/** Nome e endereço da categoria escolhida, no idioma que está sendo editado. */
export function useCategory(ref: unknown, locale: string) {
  const id = typeof ref === 'object' && ref ? (ref as { id: number }).id : ref
  const [cat, setCat] = useState<{ nome: string; slug: string } | null>(null)
  useEffect(() => {
    if (!id) return setCat(null)
    let alive = true
    fetch(`/api/categorias/${id}?depth=0&locale=${locale}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setCat(d ? { nome: d.nome ?? '', slug: d.slug ?? '' } : null))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [id, locale])
  return cat
}

/** Mesmo formato de data da página do site: "22 ABR 2026". */
function siteDate(iso: string | undefined, locale: string) {
  const parts = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).formatToParts(
    iso ? new Date(iso) : new Date(),
  )
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('day')} ${get('month').replace('.', '').toUpperCase()} ${get('year')}`
}

/** Prévia da matéria do site Brasil, no idioma que está sendo editado. */
export const ArticlePreview: UIFieldClientComponent = () => {
  const { values: v, sections } = usePostForm()
  const locale = useLocale()?.code ?? 'pt-BR'
  const cover = useMediaUrl(v.capa)
  const category = useCategory(v.tema, locale)
  const minutes = Number(v.tempoLeitura) || Math.max(1, Math.round(JSON.stringify([v.introducao, sections]).split(/\s+/).length / 200))
  const date = siteDate(v.data, locale)

  // O mesmo formato que a página /materias/<endereço> recebe (ArticleView).
  const article = {
    id: v.slug || 'previa',
    category: category?.slug || 'geral',
    categoryLabel: category?.nome || '',
    categoryOrder: 0,
    date,
    readTime: `${minutes} MIN`,
    readMinutes: minutes,
    image: cover || '/brand/logo-juma-agro.png',
    color: 'from-green-700 to-emerald-950',
    title: v.titulo || 'O título aparece aqui',
    subtitle: v.subtitulo || '',
    author: v.assinatura || '',
    introduction: v.introducao || '',
    sections: sections
      .filter((s) => s.titulo || s.paragrafos)
      .map((s) => ({ title: s.titulo || undefined, content: paragraphs(s.paragrafos) })),
    quote: v.citacao || undefined,
    featured: Boolean(v.destaque),
  }

  return (
    <PostPreview
      frame={{
        src: `/${locale}/materias/previa`,
        origin: typeof window === 'undefined' ? '' : window.location.origin,
        message: { type: 'juma:article-preview', article },
      }}
      google={{
        url: `juma-agro.com.br/${locale}/materias/${v.slug || '…'}`,
        title: v.titulo ? `${v.titulo} · Juma-Agro` : '',
        description: v.subtitulo ?? '',
      }}
      card={
        <article className="jpv-card">
          <div className="jpv-card__cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {cover && <img src={cover} alt="" />}
            {category?.nome && <span className="jpv-card__pill">{category.nome}</span>}
          </div>
          <div className="jpv-card__body">
            <small>
              {date} · {minutes} MIN
            </small>
            <h3 className={v.titulo ? '' : 'is-empty'}>{v.titulo || 'O título aparece aqui'}</h3>
            {v.subtitulo && <p>{v.subtitulo}</p>}
          </div>
        </article>
      }
    />
  )
}
