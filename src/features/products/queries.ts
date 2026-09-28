// Só servidor: importa o Payload (usado pelas páginas, nunca por componente cliente).
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Media, Product as ProductDoc } from '@/payload-types'

import type { ProductData } from './components/ProductPage'
import type { ProblemIconName } from './options'

type Locale = 'pt-BR' | 'en' | 'es'

/** Card do catálogo /produtos. */
export type ProductCard = {
  id: string
  name: string
  tag: string
  description: string
  categoryId: string
  cultures: string[]
  color: string
  href: string
  image: string
}

const FALLBACK_IMAGE = '/brand/logo-juma-agro.png'
const lines = (text?: string | null) =>
  (text ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
const mediaUrl = (m: number | Media | null | undefined) => (typeof m === 'object' && m?.url) || undefined

// Posição na grade da galeria: a 1ª foto é grande e a 4ª larga (layout da página).
function galleryLayout(index: number) {
  if (index === 0) return { span: 'col-span-2 row-span-2', sizes: '(min-width: 768px) 50vw, 100vw' }
  if (index === 3) return { span: 'col-span-2', sizes: '(min-width: 768px) 50vw, 100vw' }
  return { span: '', sizes: '(min-width: 768px) 25vw, 50vw' }
}

function toProductData(doc: ProductDoc): ProductData {
  const problems = (doc.problemas ?? []).map((p) => ({
    title: p.titulo ?? '',
    desc: p.descricao ?? '',
    icon: p.icone as ProblemIconName,
  }))
  const related = (doc.relacionados ?? [])
    .map((r) => ({ ...r, produto: typeof r.produto === 'object' ? r.produto : null }))
    .filter((r) => r.produto && r.produto._status === 'published')
    .map((r) => ({
      slug: r.produto!.slug,
      name: r.produto!.nome,
      tag: r.tag ?? '',
      desc: r.descricao ?? '',
      labelColor: r.produto!.corRotulo,
      image: mediaUrl(r.produto!.frasco),
    }))

  return {
    labelColor: doc.corRotulo,
    problemsMeta: problems.map((p) => p.icon),
    relatedMeta: related.map((r) => ({ slug: r.slug, labelColor: r.labelColor })),
    image: mediaUrl(doc.frasco),
    sizes: doc.embalagens ?? [],
    name: doc.nome,
    tag: doc.tag ?? '',
    description: doc.descricao ?? '',
    crops: lines(doc.culturasRotulo),
    cropGroups: (doc.gruposCulturas ?? []).map((g) => ({ label: g.rotulo ?? '', crops: lines(g.culturas) })),
    cropsNote: doc.notaCulturas ?? '',
    problems,
    benefits: (doc.listaBeneficios ?? []).map((b) => ({ title: b.titulo ?? '', desc: b.descricao ?? '' })),
    applications: (doc.aplicacoes ?? []).map((a) => ({
      label: a.rotulo ?? '',
      note: a.nota ?? undefined,
      rows: (a.linhas ?? []).map((l) => ({ crop: l.cultura ?? undefined, when: l.quando ?? '' })),
    })),
    applicationsNote: doc.notaAplicacoes ?? '',
    results: (doc.listaResultados ?? []).map((r) => ({ value: r.valor ?? '', unit: r.unidade ?? '', desc: r.descricao ?? '' })),
    related,
    gallery: (doc.galeria ?? [])
      .map((m) => mediaUrl(m))
      .filter((src): src is string => Boolean(src))
      .map((src, i) => ({ src, ...galleryLayout(i) })),
  }
}

/** Produtos publicados, na ordem do catálogo. */
export const getProducts = cache(async (locale: string): Promise<ProductDoc[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    locale: locale as Locale,
    fallbackLocale: 'pt-BR',
    where: { _status: { equals: 'published' } },
    sort: 'ordem',
    limit: 200,
    depth: 2,
  })
  return docs
})

export async function getProduct(slug: string, locale: string): Promise<ProductData | null> {
  const doc = (await getProducts(locale)).find((p) => p.slug === slug)
  return doc ? toProductData(doc) : null
}

export async function getProductCards(locale: string): Promise<ProductCard[]> {
  return (await getProducts(locale)).map((doc) => ({
    id: doc.slug,
    name: doc.nome,
    tag: doc.tagCatalogo || doc.tag || '',
    description: doc.resumoCatalogo || doc.descricao || '',
    categoryId: doc.categoria,
    cultures: doc.culturasFiltro ?? [],
    color: doc.corCard || doc.corRotulo,
    href: `/produtos/${doc.slug}`,
    image: mediaUrl(doc.frasco) ?? FALLBACK_IMAGE,
  }))
}
