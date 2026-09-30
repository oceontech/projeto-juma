// Só servidor: importa o Payload (usado pelas páginas e pelo layout, nunca por componente cliente).
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Article as ArticleDoc, Categoria, Media } from '@/payload-types'

import { legacyToBlocks, readBlocks, type Block } from './blocks'

/** Texto em blocos; matéria que ainda não foi convertida usa o formato antigo. */
function articleBlocks(doc: ArticleDoc): Block[] {
  const blocks = readBlocks((doc as { conteudo?: unknown }).conteudo)
  return blocks.length ? blocks : legacyToBlocks(doc as Parameters<typeof legacyToBlocks>[0])
}

/** Matéria pronta para as páginas, já no idioma pedido. */
export type ArticleView = {
  id: string
  /** Endereço da categoria (filtro) e nome no idioma pedido (Blog › Categorias). */
  category: string
  categoryLabel: string
  categoryOrder: number
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
  /** Texto em blocos (parágrafo, intertítulo, lista, citação), igual ao blog EUA. */
  blocks: Block[]
  featured: boolean
}

/** Fundo verde Juma mostrado enquanto a capa carrega; sem capa, o fundo claro do site (nada no lugar da foto). */
const COVER_COLOR = 'from-green-700 to-emerald-950'
export const NO_COVER_COLOR = 'from-[#F2F6F2] to-[#F2F6F2]'

type Locale = 'pt-BR' | 'en' | 'es'

function formatDate(iso: string, locale: Locale) {
  const parts = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' })
    .formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('day')} ${get('month').replace('.', '').toUpperCase()} ${get('year')}`
}

function toView(doc: ArticleDoc, locale: Locale): ArticleView {
  const capa = doc.capa as Media | number | null | undefined
  const minutes = doc.tempoLeitura ?? 1
  const image = (typeof capa === 'object' && capa?.url) || ''
  const tema = doc.tema as Categoria | number | null | undefined
  const cat = typeof tema === 'object' && tema ? tema : null
  return {
    id: doc.slug,
    category: cat?.slug ?? 'geral',
    categoryLabel: cat?.nome ?? '',
    categoryOrder: cat?.ordem ?? 100,
    date: formatDate(doc.data, locale),
    readTime: `${minutes} MIN`,
    readMinutes: minutes,
    image,
    color: image ? COVER_COLOR : NO_COVER_COLOR,
    title: doc.titulo,
    subtitle: doc.subtitulo ?? '',
    author: doc.assinatura ?? '',
    blocks: articleBlocks(doc),
    featured: Boolean(doc.destaque),
  }
}

/**
 * Todas as matérias publicadas, da mais recente para a mais antiga.
 * Publicação agendada: a matéria só aparece quando a data dela chega (as
 * páginas do blog se regeneram a cada 15 minutos para pegar essas).
 */
export const getArticles = cache(async (locale: string): Promise<ArticleView[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'articles',
    locale: locale as Locale,
    fallbackLocale: 'pt-BR',
    where: { _status: { equals: 'published' }, data: { less_than_equal: new Date().toISOString() } },
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

/** A home mostra sempre as 3 mais recentes. */
export async function getHomeArticles(locale: string) {
  return (await getArticles(locale)).slice(0, 3)
}
