// Só servidor: importa o Payload (usado pelas páginas e pelo layout, nunca por componente cliente).
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Article as ArticleDoc, Media } from '@/payload-types'

import type { ArticleCategory } from './options'

/** Matéria pronta para as páginas, já no idioma pedido. */
export type ArticleView = {
  id: string
  category: ArticleCategory
  /** "22 ABR 2026" */
  date: string
  /** "10 MIN" */
  readTime: string
  readMinutes: number
  image: string
  color: string
  title: string
  subtitle: string
  author: string
  introduction: string
  sections: { title?: string; content: string[] }[]
  quote?: string
  featured: boolean
  featuredHome: boolean
}

type Locale = 'pt-BR' | 'en' | 'es'

function formatDate(iso: string, locale: Locale) {
  const parts = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('day')} ${get('month').replace('.', '').toUpperCase()} ${get('year')}`
}

function toView(doc: ArticleDoc, locale: Locale): ArticleView {
  const capa = doc.capa as Media | number | null | undefined
  const minutes = doc.tempoLeitura ?? 1
  return {
    id: doc.slug,
    category: doc.categoria as ArticleCategory,
    date: formatDate(doc.data, locale),
    readTime: `${minutes} MIN`,
    readMinutes: minutes,
    image: (typeof capa === 'object' && capa?.url) || '/brand/logo-juma-agro.png',
    color: doc.cor ?? 'from-green-700 to-emerald-950',
    title: doc.titulo,
    subtitle: doc.subtitulo ?? '',
    author: doc.assinatura ?? '',
    introduction: doc.introducao ?? '',
    sections: (doc.secoes ?? []).map((s) => ({
      title: s.titulo ?? undefined,
      content: s.paragrafos
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    })),
    quote: doc.citacao ?? undefined,
    featured: Boolean(doc.destaque),
    featuredHome: Boolean(doc.destaqueHome),
  }
}

/** Todas as matérias publicadas, da mais recente para a mais antiga. */
export const getArticles = cache(async (locale: string): Promise<ArticleView[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'articles',
    locale: locale as Locale,
    fallbackLocale: 'pt-BR',
    where: { _status: { equals: 'published' } },
    sort: '-data',
    limit: 200,
    depth: 1,
  })
  return docs.map((doc) => toView(doc, locale as Locale))
})

export async function getArticle(slug: string, locale: string) {
  const articles = await getArticles(locale)
  return articles.find((a) => a.id === slug) ?? null
}

/** As 3 mais recentes marcadas para a home; completa com as mais recentes. */
export async function getHomeArticles(locale: string) {
  const articles = await getArticles(locale)
  const marked = articles.filter((a) => a.featuredHome)
  return [...marked, ...articles.filter((a) => !a.featuredHome)].slice(0, 3)
}
