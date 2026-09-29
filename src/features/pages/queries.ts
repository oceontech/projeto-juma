// Só servidor: Páginas simples do painel (política, termos, campanhas).
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Page } from '@/payload-types'

type Locale = 'pt-BR' | 'en' | 'es'

export const getPage = cache(async (slug: string, locale: Locale): Promise<Page | null> => {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug }, _status: { equals: 'published' } },
      locale,
      fallbackLocale: 'pt-BR',
      limit: 1,
      depth: 1,
      overrideAccess: false,
    })
    return docs[0] ?? null
  } catch {
    return null
  }
})

/** Endereços publicados, para gerar as páginas no build e mostrar os links do rodapé. */
export const getPublishedPageSlugs = cache(async (): Promise<string[]> => {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' } },
      select: { slug: true },
      limit: 200,
      depth: 0,
      overrideAccess: false,
    })
    return docs.map((d) => d.slug)
  } catch {
    return []
  }
})
