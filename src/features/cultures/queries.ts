// Só servidor: importa o Payload (usado pelas páginas, nunca por componente cliente).
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Culture as CultureDoc, Media, Product } from '@/payload-types'

import type { CultureData } from './components/CulturePage'

type Locale = 'pt-BR' | 'en' | 'es'

/** Card da cultura na grade /culturas e na home. */
export type CultureCard = {
  slug: string
  name: string
  image: string
  /** Número na grade: "01", "02"… */
  index: string
  homeBackground: string
}

const FALLBACK_IMAGE = '/brand/logo-juma-agro.png'
const lines = (text?: string | null) =>
  (text ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
const mediaUrl = (m: number | Media | null | undefined) => (typeof m === 'object' && m?.url) || undefined

function toCultureData(doc: CultureDoc): CultureData {
  return {
    gradient: doc.aparencia?.gradienteHero || 'linear-gradient(165deg, #2d4a1a, #0f1a0a)',
    image: mediaUrl(doc.foto) ?? FALLBACK_IMAGE,
    name: doc.nome,
    badge: doc.etiqueta ?? '',
    description: doc.descricao ?? '',
    actua: lines(doc.listaAtuacao),
    challenges: (doc.listaDesafios ?? []).map((c) => ({ stage: c.etapa ?? '', title: c.titulo ?? '', desc: c.descricao ?? '' })),
    management: (doc.fasesManejo ?? []).map((f) => ({
      label: f.rotulo ?? '',
      fase: f.fase ?? '',
      products: (f.itens ?? []).map((i) => ({ name: i.produto ?? '', dose: i.dose ?? '' })),
    })),
    prep: {
      in: doc.preposicoes?.em ?? '',
      of: doc.preposicoes?.de ?? '',
      for: doc.preposicoes?.para ?? '',
      your: doc.preposicoes?.sua ?? '',
    },
    managementNote: doc.notaManejo ?? '',
    source: doc.fonte ?? '',
    recommended: (doc.recomendados ?? [])
      .map((r) => ({ ...r, produto: typeof r.produto === 'object' ? (r.produto as Product) : null }))
      .filter((r) => r.produto && r.produto._status === 'published')
      .map((r) => ({
        slug: r.produto!.slug,
        name: r.produto!.nome,
        tag: r.tag ?? '',
        desc: r.descricao ?? '',
        labelColor: r.produto!.corCard || r.produto!.corRotulo,
        image: mediaUrl(r.produto!.frasco),
      })),
  }
}

/** Culturas publicadas, na ordem da grade. */
export const getCultures = cache(async (locale: string): Promise<CultureDoc[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'cultures',
    locale: locale as Locale,
    fallbackLocale: 'pt-BR',
    where: { _status: { equals: 'published' } },
    sort: 'ordem',
    limit: 100,
    depth: 2,
  })
  return docs
})

export async function getCulture(slug: string, locale: string): Promise<CultureData | null> {
  const doc = (await getCultures(locale)).find((c) => c.slug === slug)
  return doc ? toCultureData(doc) : null
}

export async function getCultureCards(locale: string): Promise<CultureCard[]> {
  return (await getCultures(locale)).map((doc, i) => ({
    slug: doc.slug,
    name: doc.nome,
    image: mediaUrl(doc.foto) ?? FALLBACK_IMAGE,
    index: String(i + 1).padStart(2, '0'),
    homeBackground: doc.aparencia?.fundoHome || 'linear-gradient(135deg, #2d6a1f 0%, #4a8c2a 100%)',
  }))
}
