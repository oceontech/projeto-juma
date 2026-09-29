import type { ListViewServerProps } from 'payload'

import { MediaGridClient, type MediaItem } from './MediaGridClient'

/**
 * Biblioteca de mídia em galeria (substitui a tabela padrão). Usa `data`, que
 * o Payload já consultou a partir da URL (tipo, busca, página).
 */
type Doc = Record<string, any>

const KINDS = {
  image: 'image/',
  video: 'video/',
  pdf: 'application/pdf',
} as const

export async function MediaGrid(props: ListViewServerProps) {
  const { data, payload, searchParams, hasCreatePermission } = props
  const params = (searchParams ?? {}) as Record<string, any>
  const like = params.where?.mimeType?.like as string | undefined
  const kind = (Object.entries(KINDS).find(([, v]) => v === like)?.[0] ?? 'todos') as keyof typeof KINDS | 'todos'
  const search = typeof params.search === 'string' ? params.search : ''

  const count = async (mime?: string) =>
    (await payload.count({ collection: 'media', where: mime ? { mimeType: { like: mime } } : undefined, overrideAccess: true })).totalDocs
  const [all, image, video, pdf, noAlt] = await Promise.all([
    count(),
    count(KINDS.image),
    count(KINDS.video),
    count(KINDS.pdf),
    payload
      .count({ collection: 'media', where: { or: [{ alt: { exists: false } }, { alt: { equals: '' } }] }, overrideAccess: true })
      .then((r) => r.totalDocs),
  ])

  const items: MediaItem[] = (data.docs as Doc[]).map((d) => ({
    id: d.id,
    url: d.url ?? null,
    thumb: d.sizes?.thumbnail?.url ?? d.url ?? null,
    filename: d.filename ?? 'arquivo',
    alt: d.alt ?? '',
    mimeType: d.mimeType ?? '',
    width: d.width ?? null,
    height: d.height ?? null,
    filesize: d.filesize ?? null,
    createdAt: d.createdAt,
  }))

  return (
    <MediaGridClient
      items={items}
      counts={{ todos: all, image, video, pdf }}
      noAlt={noAlt}
      kind={kind}
      search={search}
      page={data.page ?? 1}
      totalPages={data.totalPages ?? 1}
      totalDocs={data.totalDocs ?? items.length}
      canCreate={hasCreatePermission}
    />
  )
}
