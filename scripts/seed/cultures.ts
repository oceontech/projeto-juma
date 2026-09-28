/**
 * Importa as 10 culturas que viviam no código para o Payload, nos 3 idiomas:
 * metadados de scripts/seed/cultures-data.ts, textos de
 * scripts/seed/cultures-messages/<idioma>.json e fotos de public/assets/cultures.
 * Os produtos recomendados são ligados aos produtos já cadastrados (rode antes
 * scripts/seed/products.ts).
 *
 * Idempotente: cultura com o mesmo slug é pulada (use --atualizar para regravar).
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
const { CULTURE_META, HOME_CULTURES } = await import('./cultures-data')

type Locale = 'pt-BR' | 'en' | 'es'
const LOCALES: Locale[] = ['pt-BR', 'en', 'es']
const TEXTS = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(fs.readFileSync(`scripts/seed/cultures-messages/${l}.json`, 'utf8')).cultureData]),
) as Record<Locale, Record<string, any>>

const payload = await getPayload({ config: await config })
const values = <T>(obj: Record<string, T> | T[] | undefined | null): T[] => (obj ? Object.values(obj) : [])

async function media(publicPath: string, alt: string) {
  const clean = publicPath.split('?')[0]
  const fileName = path.basename(clean)
  const found = (await payload.find({ collection: 'media', where: { filename: { equals: fileName } }, limit: 1, overrideAccess: true })).docs[0]
  if (found) return found.id
  const data = fs.readFileSync(path.join('public', clean))
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/webp', name: fileName, size: data.length },
    overrideAccess: true,
  })
  return doc.id
}

// Produtos já cadastrados, por slug, para os recomendados.
const products = new Map(
  (await payload.find({ collection: 'products', limit: 500, depth: 0, pagination: false, draft: true, overrideAccess: true })).docs.map((p) => [p.slug, p.id]),
)

function localized(slug: string, locale: Locale) {
  const d = TEXTS[locale][slug]
  return {
    nome: d.name,
    etiqueta: d.badge,
    descricao: d.description,
    listaAtuacao: values<string>(d.actua).join('\n'),
    listaDesafios: values<{ stage: string; title: string; desc: string }>(d.challenges).map((c) => ({
      etapa: c.stage,
      titulo: c.title,
      descricao: c.desc,
    })),
    fasesManejo: values<{ label: string; fase: string; products?: { name: string; dose: string }[] }>(d.management).map((f) => ({
      rotulo: f.label,
      fase: f.fase,
      itens: values(f.products).map((p) => ({ produto: p.name, dose: p.dose })),
    })),
    notaManejo: d.managementNote ?? null,
    fonte: d.source ?? null,
    preposicoes: { em: d.prep?.in, de: d.prep?.of, para: d.prep?.for, sua: d.prep?.your },
    recomendados: Object.entries((d.recommended ?? {}) as Record<string, { tag: string; desc: string }>)
      .filter(([productSlug]) => products.has(productSlug))
      .map(([productSlug, r]) => ({ produto: products.get(productSlug)!, tag: r.tag, descricao: r.desc })),
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

let created = 0
let skipped = 0
for (const [index, home] of HOME_CULTURES.entries()) {
  const slug = home.slug
  const meta = CULTURE_META[slug]
  const existing = (await payload.find({ collection: 'cultures', where: { slug: { equals: slug } }, limit: 1, draft: true, overrideAccess: true })).docs[0]
  if (existing && !args.has('--atualizar')) {
    skipped++
    console.log(`= ${slug} (já existe)`)
    continue
  }

  const pt = localized(slug, 'pt-BR')
  const base = {
    slug,
    ordem: (index + 1) * 10,
    foto: await media(meta.image, `Lavoura de ${pt.nome}`),
    aparencia: { gradienteHero: meta.gradient, fundoHome: home.bg },
    _status: 'published' as const,
  }
  const doc = existing
    ? await payload.update({ collection: 'cultures', id: existing.id, locale: 'pt-BR', data: { ...base, ...pt } as any, overrideAccess: true })
    : await payload.create({ collection: 'cultures', locale: 'pt-BR', data: { ...base, ...pt } as any, overrideAccess: true })

  for (const locale of ['en', 'es'] as const) {
    const t = localized(slug, locale)
    await payload.update({
      collection: 'cultures',
      id: doc.id,
      locale,
      data: {
        ...t,
        listaDesafios: withIds(t.listaDesafios, doc.listaDesafios),
        fasesManejo: withIds(t.fasesManejo, doc.fasesManejo, 'itens'),
        recomendados: withIds(t.recomendados, doc.recomendados),
        _status: 'published',
      } as any,
      overrideAccess: true,
    })
  }
  created++
  console.log(`+ ${slug}`)
}

console.log(`\nCulturas importadas: ${created} · puladas: ${skipped}`)
process.exit(0)
