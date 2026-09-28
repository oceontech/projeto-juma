/**
 * Importa as matérias que viviam no código (scripts/seed/articles-data.ts) para
 * o Payload, nos 3 idiomas, com as capas de public/materias.
 *
 * Idempotente: matéria com o mesmo slug é pulada (use --atualizar para regravar).
 * Escreve no banco de PAYLOAD_DATABASE_URL; fora de localhost exige --sim.
 *
 *   npx tsx scripts/seed/articles.ts            (mostra o destino e para)
 *   npx tsx scripts/seed/articles.ts --sim      (importa)
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
const { ARTICLES_DATA } = await import('./articles-data')

const payload = await getPayload({ config: await config })

const MONTHS: Record<string, string> = {
  JAN: '01', FEV: '02', MAR: '03', ABR: '04', MAI: '05', JUN: '06',
  JUL: '07', AGO: '08', SET: '09', OUT: '10', NOV: '11', DEZ: '12',
}
function parseDate(value: string) {
  const [day, month, year] = value.trim().split(/\s+/)
  return new Date(`${year}-${MONTHS[month.toUpperCase()]}-${day.padStart(2, '0')}T12:00:00.000Z`).toISOString()
}

// As cores antigas tinham variações fora da paleta; cada família vira a opção mais próxima.
type Cor = (typeof import('../../src/features/articles/options'))['ARTICLE_COLORS'][number]['value']
function color(value: string): Cor {
  if (value.startsWith('from-green-7')) return 'from-green-700 to-emerald-950'
  if (value.startsWith('from-green')) return 'from-green-600 to-green-800'
  if (value.startsWith('from-teal')) return 'from-teal-600 to-emerald-800'
  if (value.startsWith('from-amber')) return 'from-amber-600 to-orange-800'
  if (value.startsWith('from-blue')) return 'from-blue-600 to-indigo-800'
  if (value.startsWith('from-purple')) return 'from-purple-600 to-purple-900'
  return 'from-green-700 to-emerald-950'
}

const FEATURED = 'como-reduzir-o-estresse'
const HOME = ['como-reduzir-o-estresse', 'nutricao-fase-certa', 'manejo-pastagem']

type Translation = (typeof ARTICLES_DATA)[number]['translations']['pt-BR']
const localized = (t: Translation) => ({
  titulo: t.title,
  subtitulo: t.subtitle,
  assinatura: t.author,
  introducao: t.introduction,
  secoes: t.sections.map((s) => ({ titulo: s.title, paragrafos: s.content.join('\n\n') })),
  citacao: t.quote,
})

let created = 0
let skipped = 0
for (const article of ARTICLES_DATA) {
  const existing = await payload.find({
    collection: 'articles',
    where: { slug: { equals: article.id } },
    limit: 1,
    draft: true,
    overrideAccess: true,
  })
  if (existing.docs[0] && !args.has('--atualizar')) {
    skipped++
    console.log(`= ${article.id} (já existe)`)
    continue
  }

  // Capa: public/materias/<arquivo> vira um registro de mídia (reaproveitado se já existir).
  const fileName = path.basename(article.image)
  const alt = article.translations['pt-BR'].title
  const media =
    (await payload.find({ collection: 'media', where: { filename: { equals: fileName } }, limit: 1, overrideAccess: true })).docs[0] ??
    (await (async () => {
      const data = fs.readFileSync(path.join('public', article.image))
      return payload.create({
        collection: 'media',
        data: { alt },
        file: { data, mimetype: 'image/webp', name: fileName, size: data.length },
        overrideAccess: true,
      })
    })())

  const base = {
    slug: article.id,
    categoria: article.category,
    data: parseDate(article.date),
    capa: media.id,
    cor: color(article.color),
    destaque: article.id === FEATURED,
    destaqueHome: HOME.includes(article.id),
    // Mantém o tempo de leitura definido pela equipe ("10 MIN"), em vez do calculado.
    tempoLeitura: parseInt(article.readTime, 10) || 1,
    tempoLeituraManual: true,
    _status: 'published' as const,
  }

  const doc = existing.docs[0]
    ? await payload.update({
        collection: 'articles',
        id: existing.docs[0].id,
        locale: 'pt-BR',
        data: { ...base, ...localized(article.translations['pt-BR']) },
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'articles',
        locale: 'pt-BR',
        data: { ...base, ...localized(article.translations['pt-BR']) },
        overrideAccess: true,
      })

  for (const locale of ['en', 'es'] as const) {
    await payload.update({
      collection: 'articles',
      id: doc.id,
      locale,
      data: { ...localized(article.translations[locale]), _status: 'published' },
      overrideAccess: true,
    })
  }
  created++
  console.log(`+ ${article.id}`)
}

console.log(`\nMatérias importadas: ${created} · puladas: ${skipped}`)
process.exit(0)
