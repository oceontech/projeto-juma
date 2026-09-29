import { readFileSync } from 'node:fs'
import path from 'node:path'

import { type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

import type { ShowcaseIcon } from '../features/home/showcase'

/**
 * Preenche "Destaques da home" com o que o site mostrava fixo no código
 * (textos das mensagens nos 3 idiomas), para o painel não abrir vazio.
 * Só roda se os destaques nunca foram salvos.
 */

type Locale = 'pt-BR' | 'en' | 'es'
const LOCALES: Locale[] = ['pt-BR', 'en', 'es']

const PRODUCTS: { slug: string; titulo: string; icons: ShowcaseIcon[]; corFundo: string; corDestaque: string }[] = [
  { slug: 'acorda-ultra', titulo: 'Acorda\nUltra', icons: ['sprout', 'roots', 'shield'], corFundo: '#052538', corDestaque: '#2c96c8' },
  { slug: 'kmep-ultra', titulo: '', icons: ['bug', 'molecule', 'award'], corFundo: '#141414', corDestaque: '#f0463a' },
  { slug: 'revigophos-amino', titulo: 'Revigo\nPhos\nAmino', icons: ['energy', 'metabolism', 'recovery'], corFundo: '#062418', corDestaque: '#f2c94c' },
]
const AMINOSAN_ICONS: ShowcaseIcon[] = ['recovery', 'leaf', 'bloom']

type Msg = { description: string; stats: Record<string, { title: string; label: string }> }

function messages(locale: Locale): Record<string, Msg> {
  const file = path.resolve(process.cwd(), 'messages', `${locale}.json`)
  return JSON.parse(readFileSync(file, 'utf8')).homeProductShowcase.products
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const current = await payload.findGlobal({ slug: 'destaques', depth: 0, req })
  if (current.updatedAt) return

  const found = await payload.find({
    collection: 'products',
    where: { slug: { in: PRODUCTS.map((p) => p.slug) } },
    depth: 0,
    limit: 10,
    req,
    overrideAccess: true,
  })
  const idOf = new Map(found.docs.map((d) => [d.slug, d.id]))
  const products = PRODUCTS.map((p, i) => ({ ...p, index: i + 1, id: idOf.get(p.slug) })).filter((p) => p.id)
  if (products.length < 2) {
    payload.logger.info('Destaques: produtos do catálogo não encontrados, conteúdo inicial não criado.')
    return
  }

  const texts = (locale: Locale) => {
    const m = messages(locale)
    const stat = (msg: Msg, icons: ShowcaseIcon[], ids?: (string | null | undefined)[]) =>
      icons.map((icone, si) => ({ ...(ids?.[si] ? { id: ids[si] } : {}), icone, titulo: msg.stats[si].title, apoio: msg.stats[si].label }))
    return { m, stat }
  }

  // 1º idioma cria as linhas; os outros preenchem as mesmas linhas (mesmos ids).
  const pt = texts('pt-BR')
  await payload.updateGlobal({
    slug: 'destaques',
    locale: 'pt-BR',
    req,
    overrideAccess: true,
    data: {
      aminosan: { descricao: pt.m['0'].description, beneficios: pt.stat(pt.m['0'], AMINOSAN_ICONS) },
      produtos: products.map((p) => ({
        produto: p.id,
        titulo: p.titulo,
        descricao: pt.m[String(p.index)].description,
        beneficios: pt.stat(pt.m[String(p.index)], p.icons),
        corFundo: p.corFundo,
        corDestaque: p.corDestaque,
      })),
    },
  })

  const saved = await payload.findGlobal({ slug: 'destaques', locale: 'pt-BR', depth: 0, req })
  for (const locale of LOCALES.slice(1)) {
    const t = texts(locale)
    await payload.updateGlobal({
      slug: 'destaques',
      locale,
      req,
      overrideAccess: true,
      data: {
        aminosan: {
          descricao: t.m['0'].description,
          beneficios: t.stat(t.m['0'], AMINOSAN_ICONS, (saved.aminosan?.beneficios ?? []).map((b) => b.id)),
        },
        produtos: (saved.produtos ?? []).map((row, i) => ({
          ...row,
          descricao: t.m[String(products[i].index)].description,
          beneficios: t.stat(t.m[String(products[i].index)], products[i].icons, (row.beneficios ?? []).map((b) => b.id)),
        })),
      },
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Conteúdo: nada a desfazer no esquema.
}
