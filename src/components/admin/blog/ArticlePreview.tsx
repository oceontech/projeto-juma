'use client'

import { useFormFields, useLocale } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { reduceFieldsToValues } from 'payload/shared'
import { useEffect, useState } from 'react'

import { ARTICLE_CATEGORIES } from '@/features/articles/options'

import { PostPreview, paragraphs } from './PostPreview'

/** Gradientes do campo "Cor de fundo da capa" (classes Tailwind do site). */
const GRADIENTS: Record<string, string> = {
  'from-green-700 to-emerald-950': 'linear-gradient(135deg,#15803d,#022c22)',
  'from-green-600 to-green-800': 'linear-gradient(135deg,#16a34a,#166534)',
  'from-teal-600 to-emerald-800': 'linear-gradient(135deg,#0d9488,#065f46)',
  'from-amber-600 to-orange-800': 'linear-gradient(135deg,#d97706,#9a3412)',
  'from-blue-600 to-indigo-800': 'linear-gradient(135deg,#2563eb,#3730a3)',
  'from-purple-600 to-purple-900': 'linear-gradient(135deg,#9333ea,#581c87)',
}

type Values = {
  titulo?: string
  subtitulo?: string
  categoria?: string
  assinatura?: string
  capa?: number | { id: number; url?: string } | null
  cor?: string
  introducao?: string
  secoes?: { titulo?: string; paragrafos?: string }[]
  citacao?: string
  slug?: string
  data?: string
  tempoLeitura?: number
}

export function useMediaUrl(ref: Values['capa']) {
  const id = typeof ref === 'object' && ref ? ref.id : ref
  const [url, setUrl] = useState<string | null>(typeof ref === 'object' && ref?.url ? ref.url : null)
  useEffect(() => {
    if (!id) return setUrl(null)
    let alive = true
    fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => alive && setUrl(m?.sizes?.card?.url ?? m?.url ?? null))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [id])
  return url
}

/** Prévia da matéria do site Brasil, no idioma que está sendo editado. */
export const ArticlePreview: UIFieldClientComponent = () => {
  const fields = useFormFields(([f]) => f)
  const v = reduceFieldsToValues(fields, true) as Values
  const locale = useLocale()
  const cover = useMediaUrl(v.capa)
  const category = ARTICLE_CATEGORIES.find((c) => c.value === v.categoria)?.label
  // No formulário a lista pode vir como contagem de linhas (número) antes de ter conteúdo.
  const sections = (Array.isArray(v.secoes) ? v.secoes : []).filter((s) => s && (s.titulo || s.paragrafos))
  const date = v.data ? new Date(v.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : null
  const prefix = locale?.code && locale.code !== 'pt-BR' ? `/${locale.code}` : '/pt-BR'

  return (
    <PostPreview
      google={{
        url: `juma-agro.com.br${prefix}/materias/${v.slug || '…'}`,
        title: v.titulo ? `${v.titulo} · Juma-Agro` : '',
        description: v.subtitulo ?? '',
      }}
      checks={[
        { label: 'Título e subtítulo', ok: Boolean(v.titulo && v.subtitulo) },
        { label: 'Categoria', ok: Boolean(v.categoria) },
        { label: 'Foto de capa', ok: Boolean(v.capa) },
        { label: 'Texto (introdução ou seções)', ok: Boolean(v.introducao || sections.length) },
        { label: 'Endereço da página', ok: Boolean(v.slug) },
      ]}
      page={
        <article className="jpv-article">
          <div className="jpv-article__cover" style={{ background: GRADIENTS[v.cor ?? ''] ?? GRADIENTS['from-green-700 to-emerald-950'] }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {cover && <img src={cover} alt="" />}
            {category && <span className="jpv-article__pill">{category}</span>}
          </div>
          <h3 className={v.titulo ? '' : 'is-empty'}>{v.titulo || 'O título aparece aqui'}</h3>
          {v.subtitulo && <p className="jpv-article__sub">{v.subtitulo}</p>}
          <p className="jpv-article__meta">
            {[v.assinatura, date, v.tempoLeitura ? `${v.tempoLeitura} min de leitura` : null].filter(Boolean).join(' · ') || 'Autor · data'}
          </p>
          {paragraphs(v.introducao).map((p, i) => (
            <p key={`i${i}`} className="jpv-article__lead">
              {p}
            </p>
          ))}
          {sections.map((s, i) => (
            <section key={i}>
              {s.titulo && <h4>{s.titulo}</h4>}
              {paragraphs(s.paragrafos).map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </section>
          ))}
          {v.citacao && <blockquote>{v.citacao}</blockquote>}
        </article>
      }
    />
  )
}
