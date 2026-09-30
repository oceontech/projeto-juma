import { readFileSync } from 'node:fs'
import path from 'node:path'

import { type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

import { blocksToLexical } from '../features/ai/lexical'
import { SEED_AUTHOR, SEED_POSTS } from './seed/blog-us/posts'

/**
 * Primeiros posts do blog do site EUA, para a página não abrir vazia.
 * Cria as categorias (site us) e as capas que faltarem; post com o mesmo
 * endereço já existente fica como está. Tudo pode ser editado ou apagado no
 * painel (Site EUA › Blog).
 */

const DIR = path.resolve(process.cwd(), 'src', 'migrations', 'seed', 'blog-us')

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const categoryIds = new Map<string, number>()
  const categoryId = async (nome: string) => {
    if (categoryIds.has(nome)) return categoryIds.get(nome)!
    const found = await payload.find({
      collection: 'categorias',
      where: { and: [{ site: { equals: 'us' } }, { nome: { equals: nome } }] },
      locale: 'pt-BR',
      depth: 0,
      limit: 1,
      req,
      overrideAccess: true,
    })
    const id =
      found.docs[0]?.id ??
      (await payload.create({ collection: 'categorias', data: { nome, site: 'us' }, locale: 'pt-BR', req, overrideAccess: true })).id
    categoryIds.set(nome, id)
    return id
  }

  for (const post of SEED_POSTS) {
    const exists = await payload.find({
      collection: 'posts-us',
      where: { slug: { equals: post.slug } },
      depth: 0,
      limit: 1,
      draft: true,
      req,
      overrideAccess: true,
    })
    if (exists.docs.length) continue

    const data = readFileSync(path.join(DIR, post.cover))
    const media = await payload.create({
      collection: 'media',
      data: { alt: post.coverAlt },
      file: { data, mimetype: 'image/webp', name: `blog-us-${post.cover}`, size: data.length },
      req,
      overrideAccess: true,
    })

    await payload.create({
      collection: 'posts-us',
      data: {
        title: post.title,
        excerpt: post.excerpt,
        slug: post.slug,
        author: SEED_AUTHOR,
        date: post.date,
        tema: await categoryId(post.category),
        cover: media.id,
        body: blocksToLexical(post.body) as never,
        _status: 'published',
      },
      req,
      overrideAccess: true,
    })
    payload.logger.info(`Blog EUA: post "${post.title}" criado.`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({
    collection: 'posts-us',
    where: { slug: { in: SEED_POSTS.map((p) => p.slug) } },
    req,
    overrideAccess: true,
  })
}
