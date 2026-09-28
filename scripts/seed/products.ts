/**
 * Importa os 14 produtos que viviam no código para o Payload, nos 3 idiomas:
 * metadados de scripts/seed/products-data.ts, textos de
 * scripts/seed/products-messages/<idioma>.json, frascos de public/produtos e
 * galerias de public/assets/products/gallery.
 *
 * Idempotente: produto com o mesmo slug é pulado (use --atualizar para regravar).
 * Escreve no banco de PAYLOAD_DATABASE_URL; fora de localhost exige --sim.
 */
import nextEnv from '@next/env'
import fs from 'node:fs'
import path from 'node:path'

nextEnv.loadEnvConfig(process.cwd())

const args = new Set(process.argv.slice(2))
const target = new URL(process.env.PAYLOAD_DATABASE_URL ?? 'postgres://invalido')
const isLocal = ['localhost', '127.0.0.1'].includes(target.hostname)
console.log(`Destino: ${target.hostname}${target.pathname}  ·  mídia: ${process.env.BLOB_READ_WRITE_TOKEN ? 'Vercel Blob' : 'disco local'}`)
if (!isLocal && !args.has('--sim')) {
  console.log('Banco remoto: rode de novo com --sim para confirmar.')
  process.exit(0)
}

const { getPayload } = await import('payload')
const { default: config } = await import('../../src/payload.config')
const { META, PRODUCT_GALLERIES, GRID_PRODUCTS } = await import('./products-data')

type Locale = 'pt-BR' | 'en' | 'es'
const LOCALES: Locale[] = ['pt-BR', 'en', 'es']
type Texts = {
  productData: Record<string, any>
  productsPageProducts: Record<string, { tag: string; description: string }>
}
const TEXTS = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(fs.readFileSync(`scripts/seed/products-messages/${l}.json`, 'utf8')) as Texts]),
) as Record<Locale, Texts>

const payload = await getPayload({ config: await config })
const values = <T>(obj: Record<string, T> | undefined | null): T[] => (obj ? Object.values(obj) : [])

// --- mídia: um registro por arquivo, reaproveitado entre produtos
const mediaCache = new Map<string, number>()
async function media(publicPath: string, alt: string) {
  const clean = publicPath.split('?')[0]
  const fileName = path.basename(clean)
  if (mediaCache.has(fileName)) return mediaCache.get(fileName)!
  const found = (await payload.find({ collection: 'media', where: { filename: { equals: fileName } }, limit: 1, overrideAccess: true })).docs[0]
  const doc =
    found ??
    (await (() => {
      const data = fs.readFileSync(path.join('public', clean))
      const mimetype = fileName.endsWith('.png') ? 'image/png' : 'image/webp'
      return payload.create({
        collection: 'media',
        data: { alt },
        file: { data, mimetype, name: fileName, size: data.length },
        overrideAccess: true,
      })
    })())
  mediaCache.set(fileName, doc.id)
  return doc.id
}

// --- textos de um produto num idioma, no formato da coleção
function localized(slug: string, tKey: string, locale: Locale) {
  const d = TEXTS[locale].productData[slug]
  const card = TEXTS[locale].productsPageProducts[tKey]
  const meta = META[slug]
  return {
    nome: d.name,
    tag: d.tag,
    descricao: d.description,
    culturasRotulo: (d.crops ?? []).join('\n'),
    gruposCulturas: values<{ label: string; crops: string[] }>(d.cropGroups).map((g) => ({ rotulo: g.label, culturas: g.crops.join('\n') })),
    notaCulturas: d.cropsNote ?? null,
    problemas: values<{ title: string; desc: string }>(d.problems).map((p, i) => ({
      icone: meta.problemsMeta[i] ?? 'leaf',
      titulo: p.title,
      descricao: p.desc,
    })),
    listaBeneficios: values<{ title: string; desc: string }>(d.benefits).map((b) => ({ titulo: b.title, descricao: b.desc })),
    aplicacoes: values<{ label: string; note?: string; rows: Record<string, { crop?: string; when: string }> }>(d.applications).map((a) => ({
      rotulo: a.label,
      nota: a.note ?? null,
      linhas: values(a.rows).map((r) => ({ cultura: r.crop ?? null, quando: r.when })),
    })),
    notaAplicacoes: d.applicationsNote ?? null,
    listaResultados: values<{ value: string; unit: string; desc: string }>(d.results).map((r) => ({
      valor: r.value,
      unidade: r.unit,
      descricao: r.desc,
    })),
    tagCatalogo: card?.tag ?? null,
    resumoCatalogo: card?.description ?? null,
  }
}

/** Copia os ids das linhas já gravadas (por posição) para não recriar as listas em outro idioma. */
function withIds<T extends Record<string, any>>(rows: T[], saved: any[] | undefined | null, nested?: string): T[] {
  return rows.map((row, i) => {
    const current = saved?.[i]
    const out: Record<string, any> = { ...row, id: current?.id }
    if (nested && Array.isArray(row[nested])) out[nested] = withIds(row[nested], current?.[nested])
    return out as T
  })
}

const ids = new Map<string, number>()
let created = 0
let skipped = 0

// 1ª passada: produtos e textos (sem relacionados, que dependem dos ids de todos)
for (const [index, grid] of GRID_PRODUCTS.entries()) {
  const slug = grid.id
  const meta = META[slug]
  const existing = (await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1, draft: true, overrideAccess: true })).docs[0]
  if (existing && !args.has('--atualizar')) {
    ids.set(slug, existing.id)
    skipped++
    console.log(`= ${slug} (já existe)`)
    continue
  }

  const pt = localized(slug, grid.tKey, 'pt-BR')
  const base = {
    slug,
    categoria: grid.categoryId as any,
    culturasFiltro: grid.cultures as any,
    embalagens: meta.sizes as any,
    corRotulo: meta.labelColor,
    corCard: grid.color.toLowerCase() !== meta.labelColor.toLowerCase() ? grid.color : null,
    ordem: (index + 1) * 10,
    frasco: meta.image ? await media(meta.image, `Frasco ${pt.nome}`) : null,
    galeria: await Promise.all((PRODUCT_GALLERIES[slug] ?? []).map((g) => media(g.src, `${pt.nome}: aplicação no campo`))),
    _status: 'published' as const,
  }

  const doc = existing
    ? await payload.update({ collection: 'products', id: existing.id, locale: 'pt-BR', data: { ...base, ...pt }, overrideAccess: true })
    : await payload.create({ collection: 'products', locale: 'pt-BR', data: { ...base, ...pt } as any, overrideAccess: true })

  for (const locale of ['en', 'es'] as const) {
    const t = localized(slug, grid.tKey, locale)
    await payload.update({
      collection: 'products',
      id: doc.id,
      locale,
      data: {
        ...t,
        gruposCulturas: withIds(t.gruposCulturas, doc.gruposCulturas),
        problemas: withIds(t.problemas, doc.problemas),
        listaBeneficios: withIds(t.listaBeneficios, doc.listaBeneficios),
        aplicacoes: withIds(t.aplicacoes, doc.aplicacoes, 'linhas'),
        listaResultados: withIds(t.listaResultados, doc.listaResultados),
        _status: 'published',
      } as any,
      overrideAccess: true,
    })
  }
  ids.set(slug, doc.id)
  created++
  console.log(`+ ${slug}`)
}

// 2ª passada: relacionados (texto da chamada em cada idioma)
for (const grid of GRID_PRODUCTS) {
  const slug = grid.id
  const relatedFor = (locale: Locale) =>
    Object.entries((TEXTS[locale].productData[slug].related ?? {}) as Record<string, { tag: string; desc: string }>)
      .filter(([relSlug]) => ids.has(relSlug))
      .map(([relSlug, r]) => ({ produto: ids.get(relSlug)!, tag: r.tag, descricao: r.desc }))

  const doc = await payload.update({
    collection: 'products',
    id: ids.get(slug)!,
    locale: 'pt-BR',
    data: { relacionados: relatedFor('pt-BR'), _status: 'published' } as any,
    overrideAccess: true,
  })
  for (const locale of ['en', 'es'] as const) {
    await payload.update({
      collection: 'products',
      id: doc.id,
      locale,
      data: { relacionados: withIds(relatedFor(locale), doc.relacionados), _status: 'published' } as any,
      overrideAccess: true,
    })
  }
}

console.log(`\nProdutos importados: ${created} · pulados: ${skipped} · relacionados atualizados: ${ids.size}`)
process.exit(0)
