import type { ListViewServerProps } from 'payload'

import { ARTICLE_CATEGORIES } from '../../../features/articles/options'
import { PRODUCT_CATEGORIES } from '../../../features/products/options'
import { ContentGridClient, type ContentCard } from './ContentGridClient'

/**
 * Lista de conteúdo em grade de cards (matérias, produtos e culturas).
 * Usa `data`, que o Payload já consultou a partir da URL (status, busca,
 * página), e busca só as imagens de capa para montar os cards.
 */
type Doc = Record<string, any>

const CONFIG = {
  articles: {
    title: 'Matérias',
    singular: 'matéria',
    image: 'capa',
    heading: (d: Doc) => d.titulo,
    meta: (d: Doc) => [
      ARTICLE_CATEGORIES.find((c) => c.value === d.categoria)?.label,
      d.data ? new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : null,
    ],
    flags: (d: Doc) => [d.destaque && 'Destaque', d.destaqueHome && 'Na home'].filter(Boolean) as string[],
    color: () => null,
    sort: '-data',
  },
  products: {
    title: 'Produtos',
    singular: 'produto',
    image: 'frasco',
    heading: (d: Doc) => d.nome,
    meta: (d: Doc) => [PRODUCT_CATEGORIES.find((c) => c.value === d.categoria)?.label, (d.embalagens ?? []).join(' · ') || null],
    flags: (d: Doc) => (d.ordem != null ? [`Ordem ${d.ordem}`] : []),
    color: (d: Doc) => d.corRotulo ?? null,
    sort: 'ordem',
  },
  cultures: {
    title: 'Culturas',
    singular: 'cultura',
    image: 'foto',
    heading: (d: Doc) => d.nome,
    meta: (d: Doc) => [d.etiqueta, `${(d.recomendados ?? []).length} produtos recomendados`],
    flags: (d: Doc) => (d.ordem != null ? [`Ordem ${d.ordem}`] : []),
    color: () => null,
    sort: 'ordem',
  },
} as const

export async function ContentGrid(props: ListViewServerProps) {
  const { data, payload, collectionSlug, searchParams, hasCreatePermission } = props
  const cfg = CONFIG[collectionSlug as keyof typeof CONFIG]
  const docs = data.docs as Doc[]

  const imageIds = docs.map((d) => (typeof d[cfg.image] === 'object' ? d[cfg.image]?.id : d[cfg.image])).filter(Boolean)
  const media = imageIds.length
    ? await payload.find({ collection: 'media', where: { id: { in: imageIds } }, limit: imageIds.length, depth: 0, overrideAccess: true })
    : { docs: [] }
  const urls = new Map(media.docs.map((m) => [m.id, m.url]))

  const params = (searchParams ?? {}) as Record<string, any>
  const currentStatus = params.where?._status?.equals ?? 'todos'
  const search = typeof params.search === 'string' ? params.search : ''

  const count = async (status?: 'published' | 'draft') =>
    (await payload.count({ collection: collectionSlug as 'articles', where: status ? { _status: { equals: status } } : undefined, overrideAccess: true }))
      .totalDocs
  const [all, published, drafts] = await Promise.all([count(), count('published'), count('draft')])

  const cards: ContentCard[] = docs.map((d) => {
    const imageId = typeof d[cfg.image] === 'object' ? d[cfg.image]?.id : d[cfg.image]
    return {
      id: d.id,
      title: cfg.heading(d) || 'Sem título',
      image: (imageId && urls.get(imageId)) || null,
      meta: cfg.meta(d).filter(Boolean) as string[],
      flags: cfg.flags(d),
      color: cfg.color(d),
      status: d._status === 'published' ? 'published' : 'draft',
      updatedAt: d.updatedAt,
    }
  })

  return (
    <ContentGridClient
      collection={collectionSlug}
      title={cfg.title}
      singular={cfg.singular}
      sort={cfg.sort}
      cards={cards}
      counts={{ todos: all, published, draft: drafts }}
      currentStatus={currentStatus}
      search={search}
      page={data.page ?? 1}
      totalPages={data.totalPages ?? 1}
      canCreate={hasCreatePermission}
    />
  )
}
