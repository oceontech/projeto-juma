'use client'

import { useFormFields } from '@payloadcms/ui'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { UIFieldClientComponent } from 'payload'
import { reduceFieldsToValues } from 'payload/shared'
import { useMemo } from 'react'

import { useMediaUrl } from './ArticlePreview'
import { PostPreview } from './PostPreview'

const CATEGORY: Record<string, string> = {
  'field-notes': 'Field notes',
  'crop-nutrition': 'Crop nutrition',
  trials: 'Trials',
  company: 'Company',
}

type Values = {
  title?: string
  excerpt?: string
  category?: string
  author?: string
  cover?: number | { id: number; url?: string } | null
  body?: unknown
  slug?: string
  date?: string
}

/** Prévia do post do blog do site EUA, no visual de lá (off-white, verde). */
export const PostUsPreview: UIFieldClientComponent = () => {
  const fields = useFormFields(([f]) => f)
  const v = reduceFieldsToValues(fields, true) as Values
  const cover = useMediaUrl(v.cover)
  const html = useMemo(() => {
    try {
      return v.body ? convertLexicalToHTML({ data: v.body as never, disableContainer: true }) : ''
    } catch {
      return ''
    }
  }, [v.body])
  const hasText = html.replace(/<[^>]+>/g, '').trim().length > 0
  const date = v.date ? new Date(v.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null

  return (
    <PostPreview
      google={{
        url: `juma-agro-eua.vercel.app/blog/${v.slug || '…'}`,
        title: v.title ? `${v.title} — Juma-Agro Fertilizer LLC` : '',
        description: v.excerpt ?? '',
      }}
      checks={[
        { label: 'Título e resumo', ok: Boolean(v.title && v.excerpt) },
        { label: 'Categoria', ok: Boolean(v.category) },
        { label: 'Foto de capa', ok: Boolean(v.cover) },
        { label: 'Texto', ok: hasText },
        { label: 'Endereço da página', ok: Boolean(v.slug) },
      ]}
      page={
        <article className="jpv-article jpv-article--us">
          <div className="jpv-article__cover" style={{ background: 'linear-gradient(145deg,#16261b,#004c25)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {cover && <img src={cover} alt="" />}
            {v.category && <span className="jpv-article__pill">{CATEGORY[v.category] ?? v.category}</span>}
          </div>
          <h3 className={v.title ? '' : 'is-empty'}>{v.title || 'The title shows here'}</h3>
          {v.excerpt && <p className="jpv-article__sub">{v.excerpt}</p>}
          <p className="jpv-article__meta">{[date, v.author ? `By ${v.author}` : null].filter(Boolean).join(' · ') || 'Date · author'}</p>
          {hasText ? <div className="jpv-article__html" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="is-empty">The text shows here.</p>}
        </article>
      }
    />
  )
}
