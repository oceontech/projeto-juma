import { addDataAndFileToRequest, type PayloadHandler, type PayloadRequest } from 'payload'

import { hasRole } from '../../access/roles'
import { AiError, chatJSON, generateImage } from './openai'
import { blocksToLexical, blocksToPlain, cleanBlocks, lexicalToBlocks, type Block } from './lexical'
import { rulesFor } from './rules'

/**
 * POST /api/ai/:action — assistente de posts do blog (Matéria BR e Post EUA).
 * Só admin e editor. O formulário manda o que está preenchido; a resposta
 * volta pronta para aplicar nos campos (o usuário decide o que usar).
 */

type Site = 'br' | 'us'
type Section = { titulo?: string; paragrafos?: string }
type Content = {
  site: Site
  title: string
  summary: string
  author: string
  category: string
  intro: string
  sections: Section[]
  quote: string
  blocks: Block[]
  raw: string
}

const MAX = 24_000
const cut = (s: unknown, n = MAX) => String(s ?? '').slice(0, n)
/** A IA às vezes devolve os parágrafos como lista: vira texto com linha em branco entre eles. */
const asText = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => String(x ?? '').trim()).filter(Boolean).join('\n\n') : String(v ?? '').trim()
const asSections = (list: unknown): { titulo: string; paragrafos: string }[] =>
  (Array.isArray(list) ? list : [])
    .map((s) => ({ titulo: asText((s as Section)?.titulo), paragrafos: asText((s as Section)?.paragrafos) }))
    .filter((s) => s.paragrafos)

function readContent(body: Record<string, any>): Content {
  const site: Site = body.site === 'us' ? 'us' : 'br'
  const sections: Section[] = Array.isArray(body.secoes)
    ? body.secoes.filter(Boolean).map((s: Section) => ({ titulo: cut(s.titulo, 300), paragrafos: cut(s.paragrafos, 8000) }))
    : []
  return {
    site,
    title: cut(site === 'us' ? body.title : body.titulo, 300),
    summary: cut(site === 'us' ? body.excerpt : body.subtitulo, 600),
    author: cut(site === 'us' ? body.author : body.assinatura, 200),
    category: cut(body.categoriaNome, 120),
    intro: cut(body.introducao, 6000),
    sections,
    quote: cut(body.citacao, 600),
    blocks: site === 'us' ? lexicalToBlocks(body.body) : [],
    raw: cut(body.bruto),
  }
}

/** Texto corrido do post, para a IA ler. */
function plain(c: Content) {
  if (c.site === 'us') return blocksToPlain(c.blocks)
  return [c.intro, ...c.sections.map((s) => [s.titulo ? `## ${s.titulo}` : '', s.paragrafos].filter(Boolean).join('\n\n')), c.quote ? `> ${c.quote}` : '']
    .filter(Boolean)
    .join('\n\n')
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length
const lang = (site: Site) => (site === 'us' ? 'inglês americano' : 'português do Brasil')

function header(c: Content) {
  return [
    `Título: ${c.title || '(vazio)'}`,
    `${c.site === 'us' ? 'Resumo' : 'Subtítulo'}: ${c.summary || '(vazio)'}`,
    c.category ? `Categoria: ${c.category}` : '',
    c.author ? `Autor: ${c.author}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

async function categories(req: PayloadRequest, site: Site) {
  const { docs } = await req.payload.find({
    collection: 'categorias',
    where: { site: { equals: site } },
    locale: 'pt-BR',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })
  return docs.map((d) => ({ id: d.id, nome: d.nome }))
}

// ─── Ações ──────────────────────────────────────────────────────────────

async function assunto(req: PayloadRequest, c: Content) {
  if (words(plain(c)) < 15 && !c.title) throw new AiError('Escreva o texto (etapa Texto) ou um rascunho de título antes: a IA sugere a partir dele.', 400)
  const cats = await categories(req, c.site)
  const out = await chatJSON<{ titulos?: string[]; resumo?: string; categoriaId?: number | null; categoriaNova?: string | null }>(
    rulesFor(c.site),
    `Com base no rascunho abaixo, em ${lang(c.site)}:
1. Sugira 3 títulos diferentes, claros e específicos (até 70 caracteres cada). Nada de clickbait.
2. Escreva ${c.site === 'us' ? 'um resumo' : 'um subtítulo'} de uma ou duas frases (até 160 caracteres), que funcione também como descrição no Google.
3. Escolha a categoria mais adequada entre: ${cats.map((k) => `${k.id}=${k.nome}`).join(', ') || '(nenhuma)'}. Se nenhuma servir de verdade, sugira um nome curto de categoria nova.

${header(c)}

Texto:
${plain(c).slice(0, 8000) || '(ainda sem texto)'}

Responda em JSON: {"titulos": ["", "", ""], "resumo": "", "categoriaId": número ou null, "categoriaNova": "nome" ou null}`,
  )
  const valid = cats.find((k) => k.id === Number(out.categoriaId))
  return {
    titulos: (out.titulos ?? []).map(String).filter(Boolean).slice(0, 3),
    resumo: String(out.resumo ?? ''),
    categoria: valid ? { id: valid.id, nome: valid.nome } : out.categoriaNova ? { nova: String(out.categoriaNova) } : null,
  }
}

async function organizar(c: Content) {
  if (!c.raw.trim()) throw new AiError('Cole o texto que você quer organizar.', 400)
  if (c.site === 'us') {
    const out = await chatJSON<{ blocos?: unknown; resumo?: string }>(
      rulesFor('us'),
      `Organize the raw text below into a blog post in American English. Keep the author's facts and numbers exactly; do not add information.
Structure: short opening paragraphs, then sections with h2 headings, paragraphs, bullet lists where natural, and at most one quote (only if it is a sentence from the text).
${header(c)}

Raw text:
${c.raw}

Answer in JSON: {"blocos": [{"type": "p"|"h2"|"h3"|"quote", "text": ""} | {"type": "ul", "items": [""]}], "resumo": "one-sentence summary"}`,
      { effort: 'medium' },
    )
    const blocks = cleanBlocks(out.blocos)
    if (!blocks.length) throw new AiError('A IA não conseguiu organizar esse texto. Tente com mais conteúdo.', 422)
    return { body: blocksToLexical(blocks), resumo: String(out.resumo ?? '') }
  }
  const out = await chatJSON<{ introducao?: string; secoes?: Section[]; citacao?: string }>(
    rulesFor('br'),
    `Organize o texto bruto abaixo numa matéria do blog, em português do Brasil. Mantenha os fatos, números e fontes do autor exatamente; não acrescente informação.
Estrutura: uma introdução curta (1 ou 2 parágrafos), de 2 a 6 seções com intertítulo e parágrafos, e uma citação em destaque só se houver uma frase forte do próprio texto (senão, vazio).
Separe parágrafos com uma linha em branco.
${header(c)}

Texto bruto:
${c.raw}

Responda em JSON: {"introducao": "", "secoes": [{"titulo": "", "paragrafos": ""}], "citacao": ""}`,
    { effort: 'medium' },
  )
  const secoes = asSections(out.secoes)
  if (!secoes.length && !asText(out.introducao)) throw new AiError('A IA não conseguiu organizar esse texto. Tente com mais conteúdo.', 422)
  return { introducao: asText(out.introducao), secoes, citacao: asText(out.citacao) }
}

async function melhorar(c: Content) {
  const text = plain(c)
  if (words(text) < 20) throw new AiError('Escreva um pouco mais de texto antes de pedir melhorias.', 400)
  if (c.site === 'us') {
    const out = await chatJSON<{ blocos?: unknown; mudancas?: string[] }>(
      rulesFor('us'),
      `Edit the blog post below for clarity, flow, grammar and compliance with the rules. Keep the structure, meaning, facts and every number exactly. Do not add new claims.
${header(c)}

Post:
${text}

Answer in JSON: {"blocos": [{"type": "p"|"h2"|"h3"|"quote", "text": ""} | {"type": "ul", "items": [""]}], "mudancas": ["what you changed, in Portuguese, one short line each"]}`,
      { effort: 'medium' },
    )
    const blocks = cleanBlocks(out.blocos)
    if (!blocks.length) throw new AiError('A IA não devolveu o texto. Tente de novo.', 502)
    return { body: blocksToLexical(blocks), mudancas: (out.mudancas ?? []).map(String).slice(0, 8) }
  }
  const out = await chatJSON<{ introducao?: string; secoes?: Section[]; citacao?: string; mudancas?: string[] }>(
    rulesFor('br'),
    `Revise a matéria abaixo: clareza, ritmo, gramática e as regras de escrita. Mantenha a estrutura (mesmas seções), o sentido, os fatos e todos os números. Não acrescente afirmações novas.
Separe parágrafos com uma linha em branco.
${header(c)}

Introdução:
${c.intro}

Seções:
${c.sections.map((s, i) => `[${i + 1}] ${s.titulo ?? ''}\n${s.paragrafos ?? ''}`).join('\n\n')}

Citação: ${c.quote || '(vazia)'}

Responda em JSON: {"introducao": "", "secoes": [{"titulo": "", "paragrafos": ""}], "citacao": "", "mudancas": ["o que mudou, uma linha curta cada"]}`,
    { effort: 'medium' },
  )
  const secoes = asSections(out.secoes)
  return {
    introducao: asText(out.introducao) || c.intro,
    secoes: secoes.length ? secoes : c.sections.map((s) => ({ titulo: s.titulo ?? '', paragrafos: s.paragrafos ?? '' })),
    citacao: out.citacao === undefined ? c.quote : asText(out.citacao),
    mudancas: (out.mudancas ?? []).map(String).slice(0, 8),
  }
}

async function revisar(c: Content) {
  const text = plain(c)
  const n = words(text)
  if (n < 30) throw new AiError('Escreva o texto antes da revisão final.', 400)
  const out = await chatJSON<{
    tempoLeitura?: number
    resumo?: string
    problemas?: { tipo?: string; trecho?: string; sugestao?: string }[]
    parecer?: string
  }>(
    rulesFor(c.site),
    `Faça a revisão final do post abaixo antes de publicar. Responda em português do Brasil (o post pode estar em ${lang(c.site)}).
1. Estime o tempo de leitura em minutos inteiros para um leitor do agro, considerando a densidade técnica (o texto tem ${n} palavras).
2. Aponte até 8 problemas concretos: violações das regras de escrita${c.site === 'us' ? ' e de FIFRA' : ''}, números ou resultados sem fonte, erros de gramática ou digitação, trechos confusos.
   Um número TEM fonte quando o próprio trecho ou a frase ao lado cita quem mediu (instituição, ensaio, órgão ou ano). Recomendações técnicas gerais (estádio V4, faixa de pH) não precisam de fonte. Não aponte o que já está certo. Para cada um, cite o trecho exato e sugira a correção. Se estiver tudo certo, lista vazia.
3. Escreva ${c.site === 'us' ? 'um resumo (em inglês)' : 'um subtítulo'} de até 160 caracteres para o Google.
4. Dê um parecer de uma frase sobre se está pronto para publicar.

${header(c)}

Post:
${text.slice(0, 16000) || '(sem texto)'}

Responda em JSON: {"tempoLeitura": número, "resumo": "", "problemas": [{"tipo": "regra|número sem fonte|gramática|clareza${c.site === 'us' ? '|FIFRA' : ''}", "trecho": "", "sugestao": ""}], "parecer": ""}`,
    { effort: 'medium' },
  )
  // Sanidade: entre ~120 e ~300 palavras por minuto.
  const min = Math.max(1, Math.round(n / 300))
  const max = Math.max(1, Math.ceil(n / 120))
  const tempo = Math.min(max, Math.max(min, Math.round(Number(out.tempoLeitura) || n / 200)))
  return {
    tempoLeitura: tempo,
    resumo: String(out.resumo ?? ''),
    problemas: (out.problemas ?? [])
      .filter((p) => p?.trecho || p?.sugestao)
      .slice(0, 8)
      .map((p) => ({ tipo: String(p.tipo ?? 'clareza'), trecho: String(p.trecho ?? ''), sugestao: String(p.sugestao ?? '') })),
    parecer: String(out.parecer ?? ''),
    palavras: n,
  }
}

async function capa(req: PayloadRequest, c: Content, detalhe: string) {
  if (!c.title) throw new AiError('Preencha o título antes de gerar a capa.', 400)
  const brief = await chatJSON<{ prompt?: string; alt?: string }>(
    'You write prompts for an image model that creates editorial cover photos for an agriculture blog.',
    `Create one image prompt (in English, up to 90 words) for the cover of this post.
Style: photorealistic editorial photography, natural light, wide 3:2 composition with calm space, rich but natural greens, ${c.site === 'us' ? 'American farmland (Florida citrus, row crops or vegetables)' : 'Brazilian farmland (soy, corn, coffee, sugarcane, pasture)'} matching the topic.
Rules: no text, letters, logos, labels or watermarks; no product bottles or packaging; no identifiable faces in close-up; no chemicals being sprayed on people.
Also write a short alt text describing the image, in ${c.site === 'us' ? 'English' : 'Portuguese (Brazil)'}.

${header(c)}
${detalhe ? `Pedido do autor: ${detalhe}` : ''}
Trecho: ${plain(c).slice(0, 1200)}

Answer in JSON: {"prompt": "", "alt": ""}`,
  )
  if (!brief.prompt) throw new AiError('A IA não conseguiu descrever a imagem. Tente de novo.', 502)
  const image = await generateImage(brief.prompt)
  const slug = c.title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
  const media = await req.payload.create({
    collection: 'media',
    data: { alt: brief.alt || c.title },
    file: { data: image, mimetype: 'image/webp', name: `capa-ia-${slug || 'post'}-${Date.now()}.webp`, size: image.length },
    req,
    overrideAccess: true,
  })
  return { id: media.id, url: media.url, alt: media.alt }
}

async function traduzir(req: PayloadRequest, id: number) {
  const doc = await req.payload.findByID({ collection: 'articles', id, locale: 'pt-BR', fallbackLocale: false, depth: 1, draft: true, overrideAccess: true })
  const source = {
    titulo: doc.titulo ?? '',
    subtitulo: doc.subtitulo ?? '',
    assinatura: doc.assinatura ?? '',
    introducao: doc.introducao ?? '',
    secoes: (doc.secoes ?? []).map((s) => ({ titulo: s.titulo ?? '', paragrafos: s.paragrafos ?? '' })),
    citacao: doc.citacao ?? '',
  }
  if (!source.titulo) throw new AiError('Salve a matéria em português antes de traduzir.', 400)
  type T = typeof source
  const out = await chatJSON<{ en?: T; es?: T }>(
    'You are a professional agronomy translator. Translate faithfully from Brazilian Portuguese, keeping every number, unit, product name (Aminosan, Acorda Ultra, KMEP Ultra…) and paragraph break. Natural, fluent style for farmers. No em dashes.',
    `Translate this blog post into English (en) and Latin American Spanish (es). Keep the same JSON structure and the same number of sections. Keep "assinatura" (author) names as they are, translating only job titles.

${JSON.stringify(source)}

Answer in JSON: {"en": {same fields}, "es": {same fields}}`,
    { effort: 'medium' },
  )
  const done: string[] = []
  for (const locale of ['en', 'es'] as const) {
    const t = out[locale]
    if (!t?.titulo) continue
    await req.payload.update({
      collection: 'articles',
      id,
      locale,
      draft: true,
      data: {
        titulo: asText(t.titulo),
        subtitulo: asText(t.subtitulo),
        assinatura: asText(t.assinatura),
        introducao: asText(t.introducao),
        secoes: asSections(t.secoes),
        citacao: asText(t.citacao),
      },
      req,
      overrideAccess: true,
    })
    done.push(locale)
  }
  // A categoria criada só em português ganha o nome nos outros idiomas também.
  const tema = doc.tema as { id: number; nome?: string } | null
  if (tema && typeof tema === 'object') {
    const names = await chatJSON<{ en?: string; es?: string }>(
      'Translate agriculture blog category names.',
      `Category in Brazilian Portuguese: "${tema.nome}". Answer in JSON: {"en": "", "es": ""}`,
    ).catch(() => ({}) as { en?: string; es?: string })
    for (const locale of ['en', 'es'] as const) {
      const current = await req.payload.findByID({ collection: 'categorias', id: tema.id, locale, fallbackLocale: false, depth: 0, overrideAccess: true })
      if (!current.nome && names[locale]) {
        await req.payload.update({ collection: 'categorias', id: tema.id, locale, data: { nome: names[locale] }, req, overrideAccess: true })
      }
    }
  }
  if (!done.length) throw new AiError('A IA não devolveu a tradução. Tente de novo.', 502)
  return { idiomas: done }
}

// ─── Handler ────────────────────────────────────────────────────────────

export const aiHandler: PayloadHandler = async (req) => {
  if (!req.user) return Response.json({ error: 'Entre no painel para usar a IA.' }, { status: 401 })
  if (!hasRole(req, 'admin', 'editor')) return Response.json({ error: 'Seu perfil não pode usar o assistente de posts.' }, { status: 403 })

  const action = String(req.routeParams?.action ?? '')
  await addDataAndFileToRequest(req)
  const body = (req.data ?? {}) as Record<string, any>
  const c = readContent(body)

  try {
    let result: unknown
    if (action === 'assunto') result = await assunto(req, c)
    else if (action === 'organizar') result = await organizar(c)
    else if (action === 'melhorar') result = await melhorar(c)
    else if (action === 'revisar') result = await revisar(c)
    else if (action === 'capa') result = await capa(req, c, cut(body.detalhe, 300))
    else if (action === 'traduzir') result = await traduzir(req, Number(body.id))
    else return Response.json({ error: 'Ação desconhecida.' }, { status: 404 })
    return Response.json(result)
  } catch (err) {
    if (err instanceof AiError) return Response.json({ error: err.message }, { status: err.status })
    req.payload.logger.error({ err }, 'Assistente de IA falhou')
    return Response.json({ error: 'Algo deu errado com a IA. Tente de novo.' }, { status: 500 })
  }
}
