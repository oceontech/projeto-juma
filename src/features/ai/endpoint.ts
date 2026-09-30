import { addDataAndFileToRequest, type PayloadHandler, type PayloadRequest } from 'payload'

import { hasRole } from '../../access/roles'
import { readBlocks } from '../articles/blocks'
import { AiError, chatJSON, editImage, generateImage } from './openai'
import { blocksToPlain, cleanBlocks, lexicalToBlocks, type Block } from './lexical'
import { rulesFor } from './rules'

/**
 * POST /api/ai/:action — assistente de posts do blog (Matéria BR e Post EUA),
 * com o texto em blocos (parágrafo, intertítulo, lista, citação) nos dois sites:
 * assunto (títulos, subtítulo, categoria), bloco (✨ IA de um bloco), texto
 * (texto todo ou texto colado), revisar, corrigir, capa (3 modos) e traduzir.
 * Só admin e editor. A resposta volta pronta para aplicar no formulário.
 */

type Site = 'br' | 'us'
type Content = {
  site: Site
  title: string
  summary: string
  author: string
  category: string
  blocks: Block[]
}

const MAX = 24_000
const cut = (s: unknown, n = MAX) => String(s ?? '').slice(0, n)
/** A IA às vezes devolve os parágrafos como lista: vira texto com linha em branco entre eles. */
const asText = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => String(x ?? '').trim()).filter(Boolean).join('\n\n') : String(v ?? '').trim()
const unquote = (s: string) => s.replace(/^["“”'\s]+|["“”'\s]+$/g, '')

function readContent(body: Record<string, any>): Content {
  const site: Site = body.site === 'us' ? 'us' : 'br'
  return {
    site,
    title: cut(site === 'us' ? body.title : body.titulo, 300),
    summary: cut(site === 'us' ? body.excerpt : body.subtitulo, 600),
    author: cut(site === 'us' ? body.author : body.assinatura, 200),
    category: cut(body.categoriaNome, 120),
    // O editor manda os blocos prontos; a revisão manda os valores do formulário.
    blocks: Array.isArray(body.blocos) ? cleanBlocks(body.blocos) : site === 'us' ? lexicalToBlocks(body.body) : readBlocks(body.conteudo),
  }
}

/** Texto corrido do post, para a IA ler. */
const plain = (c: Content) => blocksToPlain(c.blocks).slice(0, 16000)

const words = (text: string) => text.split(/\s+/).filter(Boolean).length
const lang = (site: Site) => (site === 'us' ? 'inglês americano' : 'português do Brasil')

const KIND: Record<Block['type'], string> = { p: 'parágrafo', h2: 'intertítulo', h3: 'intertítulo', ul: 'lista', quote: 'citação' }
const blockText = (b: Block) => (b.type === 'ul' ? b.items.map((i) => `- ${i}`).join('\n') : b.text)

const BLOCKS_JSON = '{"blocos": [{"type": "p" | "h2" | "quote", "text": ""} | {"type": "ul", "items": [""]}]}'

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

type Mode = 'ortografia' | 'organizar' | 'aprimorar' | 'aumentar'
const MODES: Mode[] = ['ortografia', 'organizar', 'aprimorar', 'aumentar']
const modeOf = (v: unknown): Mode => (MODES.includes(v as Mode) ? (v as Mode) : 'aprimorar')

const TASK: Record<Mode, string> = {
  ortografia: 'Corrija só ortografia, acentuação, concordância e pontuação. Não mude palavras nem a ordem das ideias.',
  organizar:
    'Corrija e organize: ordem lógica das ideias, parágrafos curtos, frases claras, lista quando houver passos ou itens. Mantenha o conteúdo, sem acrescentar nem tirar informação.',
  aprimorar: 'Aprimore a redação: mais clara, direta e fluida para o produtor rural, com o mesmo tamanho aproximado e as mesmas informações.',
  aumentar:
    'Aprimore e desenvolva o texto em cerca de 1,5 a 2 vezes o tamanho, explicando melhor o que já está dito (como fazer, por que importa, cuidados práticos). Não invente números, ensaios, doses nem resultados.',
}

function blocksOut(v: unknown) {
  const blocks = cleanBlocks(v).map((b): Block => (b.type === 'h3' ? { type: 'h2', text: b.text } : b))
  if (!blocks.length) throw new AiError('A IA não devolveu o texto. Tente de novo.', 502)
  return blocks
}

/** ✨ IA de um bloco do editor: devolve o(s) bloco(s) que entram no lugar dele. */
async function bloco(c: Content, body: Record<string, any>) {
  const mode = modeOf(body.modo)
  const all: unknown[] = Array.isArray(body.blocos) ? body.blocos : []
  const index = Number(body.indice)
  const target = cleanBlocks([all[index]])[0]
  if (!target || words(blockText(target)) < 2) throw new AiError('Escreva algo neste bloco antes de usar a IA.', 400)

  const shape =
    target.type === 'h2' || target.type === 'h3'
      ? 'É um intertítulo: devolva UM bloco h2, curto (até 60 caracteres) e claro, que anuncie o que vem a seguir.'
      : target.type === 'quote'
        ? 'É a citação em destaque: devolva UM bloco quote com uma frase forte do próprio texto.'
        : target.type === 'ul'
          ? 'É uma lista: devolva UM bloco ul, com itens curtos e escritos do mesmo jeito.'
          : mode === 'organizar' || mode === 'aumentar'
            ? 'É um parágrafo: devolva um ou mais blocos (parágrafos curtos; uma lista ul se houver passos ou itens; h2 só se o assunto mudar).'
            : 'É um parágrafo: devolva um ou mais parágrafos (p).'
  const rest = cleanBlocks(all.filter((_, i) => i !== index))
  const context = rest.length ? `\nResto da matéria, só para contexto (não reescreva nem repita o que já está aqui; mantenha a coerência):\n${blocksToPlain(rest).slice(0, 6000)}\n` : ''

  const out = await chatJSON<{ blocos?: unknown }>(
    rulesFor(c.site),
    `${TASK[mode]}
Você vai reescrever só UM bloco da matéria (${KIND[target.type]}). ${shape}
Escreva em ${lang(c.site)}.
${header(c)}
${context}
Bloco a reescrever:
${blockText(target)}

Responda em JSON: ${BLOCKS_JSON}`,
    { effort: mode === 'ortografia' ? 'low' : 'medium' },
  )
  return { blocos: blocksOut(out.blocos) }
}

/** ✨ IA no texto todo, ou texto colado (`bruto`) que vira blocos. */
async function texto(c: Content, body: Record<string, any>) {
  const raw = cut(body.bruto, 30000).trim()
  const mode = raw ? 'organizar' : modeOf(body.modo)
  const source = raw || plain(c)
  if (words(source) < 5) throw new AiError('Escreva ou cole o texto antes de usar a IA.', 400)
  const out = await chatJSON<{ blocos?: unknown }>(
    rulesFor(c.site),
    `${TASK[mode]}
${
  raw
    ? 'O texto abaixo foi colado de outro lugar (e-mail, Word, WhatsApp). Monte a matéria em blocos: parágrafos curtos (p), intertítulo (h2) quando o assunto muda, lista (ul) para passos ou itens e no máximo uma citação (quote) se houver uma frase forte no próprio texto. A matéria sempre abre com um parágrafo (nunca com intertítulo nem lista), e intertítulo não repete a frase que vem logo depois. Corrija a ortografia. Não acrescente informação. Tire assinaturas de e-mail, saudações e linhas soltas que não fazem parte da matéria.'
    : 'Devolva a matéria inteira em blocos, na mesma ordem, aplicando a tarefa acima. Mantenha os intertítulos, listas e a citação que já existem, ajustando só o necessário.'
}
Escreva em ${lang(c.site)}.
${header(c)}

Texto:
${source}

Responda em JSON: ${BLOCKS_JSON}`,
    { effort: 'medium' },
  )
  return { blocos: blocksOut(out.blocos) }
}

/** Post com cada parte marcada, para a IA dizer onde está cada problema. */
function labeled(c: Content) {
  return [
    `[titulo] ${c.title}`,
    `[${c.site === 'us' ? 'resumo' : 'subtitulo'}] ${c.summary}`,
    ...c.blocks.map((b, i) => `[bloco ${i + 1} · ${KIND[b.type]}]\n${blockText(b)}`),
  ].join('\n\n')
}

type Issue = { tipo: string; onde: string; trecho: string; correcao: string; sugestao: string }

/**
 * O que falta e a IA pode sugerir na revisão (botão "Inserir"): a citação e
 * intertítulos. `ancora` é o texto do bloco de referência (depois dele entra a
 * citação; antes dele entra o intertítulo), para achar o lugar mesmo se o
 * texto mudou de posição.
 */
type Suggestion = { tipo: 'citacao' | 'intertitulo'; rotulo: string; texto: string; motivo: string; ancora: string }

async function revisar(c: Content) {
  const text = plain(c)
  const n = words(text)
  if (n < 30) throw new AiError('Escreva o texto antes da revisão final.', 400)
  const paragraphs = c.blocks.filter((b) => b.type === 'p').length
  const semCitacao = !c.blocks.some((b) => b.type === 'quote')
  const semIntertitulo = paragraphs >= 5 && !c.blocks.some((b) => b.type === 'h2' || b.type === 'h3')
  const extras = [
    semCitacao
      ? `Em "citacao", sugira a citação em destaque: UMA frase curta e forte (até 160 caracteres) tirada do próprio texto, com no máximo um ajuste leve, e em "depois_do_bloco" o número do parágrafo depois do qual ela fica melhor (no meio da matéria). Sem número que não esteja no texto com fonte.`
      : '',
    semIntertitulo
      ? `Em "intertitulos", sugira até 3 intertítulos curtos (até 60 caracteres) para dividir a matéria nos pontos em que o assunto muda, cada um com "antes_do_bloco": o número do parágrafo que ele abre (nunca o bloco 1).`
      : '',
  ].filter(Boolean)

  const out = await chatJSON<{
    tempoLeitura?: number
    descricaoGoogle?: string
    problemas?: Partial<Issue>[]
    parecer?: string
    citacao?: { texto?: string; depois_do_bloco?: number | string } | string
    intertitulos?: { antes_do_bloco?: number | string; titulo?: string }[]
  }>(
    rulesFor(c.site),
    `Faça a revisão final do post abaixo antes de publicar. Responda em português do Brasil (o post pode estar em ${lang(c.site)}).
1. Estime o tempo de leitura em minutos inteiros para um leitor do agro, considerando a densidade técnica (o texto tem ${n} palavras).
2. Aponte até 8 problemas concretos: violações das regras de escrita${c.site === 'us' ? ' e de FIFRA' : ''}, números ou resultados sem fonte, erros de gramática ou digitação, trechos confusos.
   Um número TEM fonte quando o próprio trecho ou a frase ao lado cita quem mediu (instituição, ensaio, órgão ou ano). Recomendações técnicas gerais (estádio V4, faixa de pH) não precisam de fonte. Não aponte o que já está certo. Se estiver tudo certo, lista vazia.
   Para cada problema:
   - "onde": a marca da parte em que ele está (titulo, ${c.site === 'us' ? 'resumo' : 'subtitulo'} ou "bloco 3");
   - "trecho": cópia EXATA, letra por letra, de um pedaço curto do post (uma frase ou menos) que contém o problema;
   - "correcao": esse mesmo trecho já corrigido, no idioma do post, pronto para substituir o trecho. Mude o mínimo. Nunca invente fonte, número ou ensaio: se falta fonte, reescreva sem o número ou sem afirmar o resultado;
   - "sugestao": em português, uma frase curta explicando o que estava errado.
3. Em "descricaoGoogle", escreva a descrição do post para aparecer no Google: ${c.site === 'us' ? 'em inglês, ' : ''}uma ou duas frases, até 160 caracteres, dizendo do que o post trata e o que o leitor aprende. Nada sobre a revisão ou sobre a qualidade do texto.
4. Dê um parecer de uma frase sobre se está pronto para publicar (sem falar das partes do item 5).
${extras.length ? `5. ${extras.join('\n   ')}\n` : ''}
${header(c)}

Post (cada parte começa com a marca entre colchetes, que não faz parte do texto):
${labeled(c).slice(0, 18000)}

Responda em JSON: {"tempoLeitura": número, "descricaoGoogle": "", "problemas": [{"tipo": "regra|número sem fonte|gramática|clareza${c.site === 'us' ? '|FIFRA' : ''}", "onde": "", "trecho": "", "correcao": "", "sugestao": ""}], "parecer": ""${semCitacao ? ', "citacao": {"texto": "", "depois_do_bloco": número}' : ''}${semIntertitulo ? ', "intertitulos": [{"antes_do_bloco": número, "titulo": ""}]' : ''}}`,
    { effort: 'medium' },
  )
  // Sanidade: entre ~120 e ~300 palavras por minuto.
  const min = Math.max(1, Math.round(n / 300))
  const max = Math.max(1, Math.ceil(n / 120))
  const tempo = Math.min(max, Math.max(min, Math.round(Number(out.tempoLeitura) || n / 200)))
  const num = (v: unknown) => Number(String(v ?? '').replace(/\D/g, '')) || 0
  const anchor = (n1: number) => (c.blocks[n1 - 1] ? blockText(c.blocks[n1 - 1]) : '')

  const sugestoes: Suggestion[] = []
  if (semCitacao && out.citacao) {
    const q = typeof out.citacao === 'string' ? { texto: out.citacao } : out.citacao
    const texto = unquote(asText(q.texto))
    const after = num((q as { depois_do_bloco?: unknown }).depois_do_bloco) || Math.ceil(c.blocks.length / 2)
    if (texto)
      sugestoes.push({
        tipo: 'citacao',
        rotulo: 'Citação em destaque',
        texto,
        motivo: 'A matéria está sem citação. Esta frase do próprio texto fica em destaque, com letra grande.',
        ancora: anchor(Math.min(after, c.blocks.length)),
      })
  }
  if (semIntertitulo) {
    for (const t of (out.intertitulos ?? []).slice(0, 3)) {
      const before = num(t?.antes_do_bloco)
      const titulo = unquote(asText(t?.titulo))
      if (before > 1 && before <= c.blocks.length && titulo)
        sugestoes.push({ tipo: 'intertitulo', rotulo: 'Intertítulo', texto: titulo, motivo: `Divide a matéria antes do bloco ${before}; ajuda a leitura e o Google.`, ancora: anchor(before) })
    }
  }

  return {
    tempoLeitura: tempo,
    resumo: String(out.descricaoGoogle ?? '').trim(),
    problemas: (out.problemas ?? [])
      .filter((p) => p?.trecho || p?.sugestao)
      .slice(0, 8)
      .map((p) => ({
        tipo: String(p.tipo ?? 'clareza'),
        onde: String(p.onde ?? '').toLowerCase(),
        trecho: unquote(String(p.trecho ?? '')),
        correcao: asText(p.correcao),
        sugestao: String(p.sugestao ?? ''),
      })),
    parecer: String(out.parecer ?? ''),
    palavras: n,
    sugestoes,
  }
}

/**
 * "Corrigir" de um ponto da revisão, quando o trecho não foi achado igual no
 * formulário: a IA reescreve o título, o subtítulo ou o bloco inteiro.
 */
async function corrigir(c: Content, body: Record<string, any>) {
  const p = (body.problema ?? {}) as Partial<Issue>
  const onde = String(p.onde ?? '').toLowerCase()
  const task = `Corrija só este problema, mudando o mínimo possível e mantendo o resto igual (mesmo idioma). Nunca invente fonte, número ou ensaio.
Problema (${p.tipo ?? 'clareza'}): ${cut(p.sugestao, 600)}
${p.trecho ? `Trecho apontado: "${cut(p.trecho, 600)}"` : ''}
${p.correcao ? `Correção sugerida para o trecho: "${cut(p.correcao, 600)}"` : ''}`

  if (onde === 'titulo' || onde === 'subtitulo' || onde === 'resumo') {
    const field = onde === 'titulo' ? (c.site === 'us' ? 'title' : 'titulo') : c.site === 'us' ? 'excerpt' : 'subtitulo'
    const current = onde === 'titulo' ? c.title : c.summary
    if (!current.trim()) throw new AiError('Não encontrei essa parte do post. Revise de novo.', 400)
    const out = await chatJSON<{ texto?: unknown }>(rulesFor(c.site), `${task}\n\nTexto a corrigir (devolva ele inteiro, corrigido):\n${current}\n\nResponda em JSON: {"texto": ""}`, { effort: 'low' })
    const texto = asText(out.texto)
    if (!texto) throw new AiError('A IA não devolveu o texto. Tente de novo.', 502)
    return { campo: field, texto }
  }

  const n = Number(onde.match(/bloco\s*(\d+)/)?.[1] ?? 0)
  const target = c.blocks[n - 1]
  if (!target) throw new AiError('Não encontrei esse trecho no texto. Revise de novo.', 400)
  const out = await chatJSON<{ blocos?: unknown }>(
    rulesFor(c.site),
    `${task}

Bloco a corrigir (${KIND[target.type]}; devolva o bloco inteiro, corrigido, com o mesmo tipo):
${blockText(target)}

Responda em JSON: ${BLOCKS_JSON}`,
    { effort: 'low' },
  )
  return { bloco: n - 1, blocos: blocksOut(out.blocos) }
}

/**
 * Linguagem de fotografia documental: é o que faz o modelo entregar algo com
 * cara de foto real (e não de render 3D ou banco de imagem saturado).
 */
const PLACE = (site: Site) =>
  site === 'us'
    ? 'a real American farm (Florida citrus grove, vegetable field or row crops in the Southeast)'
    : 'a real Brazilian farm (soy, corn, coffee, sugarcane, citrus or pasture; red or brown tropical soil)'

const photo = (scene: string) => `Candid documentary photograph for an agriculture magazine, taken on a full-frame camera with a 35mm lens at f/5.6, eye level, handheld. ${scene}
Real-world look: soft diffused daylight, true-to-life muted colors, natural skin texture, real dust and soil clumps, slightly uneven crop rows, some weeds and straw, worn clothes and equipment, subtle film grain, gentle depth of field.
Avoid: CGI or 3D render look, illustration, HDR, oversaturated greens, glowing golden-hour haze, dramatic sky, lens flare, perfect symmetry, plastic skin, posed model, stock-photo smile, before/after or side-by-side comparisons of plants. No text, letters, logos, labels or watermarks; no product bottles or packaging.`

const KEEP_REAL =
  'Keep it looking like an unedited real photograph taken on a camera: natural light and colors, real textures, no CGI, illustration, HDR or oversaturation. No text, logos or watermarks.'

/** Lê os bytes de uma imagem da Mídia (Blob público ou arquivo local do painel). */
async function mediaBytes(req: PayloadRequest, id: number) {
  const media = await req.payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true })
  if (!media?.url || !String(media.mimeType ?? '').startsWith('image/')) throw new AiError('Escolha uma imagem para aprimorar.', 400)
  const url = new URL(media.url, req.url ?? 'http://localhost')
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  if (!res.ok) throw new AiError('Não foi possível abrir a imagem escolhida.', 502)
  const type = String(media.mimeType)
  return { data: Buffer.from(await res.arrayBuffer()), type: ['image/png', 'image/jpeg', 'image/webp'].includes(type) ? type : 'image/png' }
}

/**
 * Capa com IA, em três modos:
 * - contexto: a partir do título e do texto já escritos;
 * - prompt: do zero, com o pedido do autor;
 * - aprimorar: parte de uma imagem enviada ou da biblioteca.
 */
async function capa(req: PayloadRequest, c: Content, body: Record<string, any>) {
  const modo = body.modo === 'prompt' ? 'prompt' : body.modo === 'aprimorar' ? 'aprimorar' : 'contexto'
  const pedido = cut(body.pedido, 600).trim()
  if (modo === 'contexto' && !c.title && words(plain(c)) < 20) throw new AiError('Escreva o título e o texto antes: a capa nasce deles.', 400)
  if (modo !== 'contexto' && !pedido) throw new AiError(modo === 'prompt' ? 'Descreva a imagem que você quer.' : 'Diga o que melhorar na imagem.', 400)
  if (modo === 'aprimorar' && !body.imagem) throw new AiError('Escolha a imagem que você quer aprimorar.', 400)

  const alt = `in ${c.site === 'us' ? 'English' : 'Portuguese (Brazil)'}`
  const brief = await chatJSON<{ prompt?: string; alt?: string }>(
    'You are a photo editor for an agriculture magazine. You describe real, plausible farm scenes that a photojournalist could actually shoot.',
    modo === 'aprimorar'
      ? `Write an edit instruction (English, up to 60 words) for an image model, based on the author's request (in Portuguese or English): "${pedido}". Keep the same subject and framing unless the request says otherwise.
Also write a short alt text describing the resulting image, ${alt}.
Post title: ${c.title || '(none)'}
Answer in JSON: {"prompt": "", "alt": ""}`
      : `Describe ONE concrete scene (English, 40 to 70 words) for the cover photo of this post, on ${PLACE(c.site)}.
Say exactly what is in the frame: the crop and its growth stage, what the person (if any) is doing with their hands, tools or machines, the soil, where and at what time of day. Prefer an everyday moment of real field work that matches the post. Only what a camera could capture: no concepts, symbols, split screens or text. Never show a product effect (sick versus healthy plants, before and after); show the work, the crop and the place.
${modo === 'prompt' ? `The author asked for (this is the main subject): "${pedido}"` : ''}
Also write a short alt text describing the photo, ${alt}.

${header(c)}
${modo === 'contexto' ? `Excerpt: ${plain(c).slice(0, 1500)}` : ''}

Answer in JSON: {"prompt": "the scene", "alt": ""}`,
  )
  if (!brief.prompt) throw new AiError('A IA não conseguiu descrever a imagem. Tente de novo.', 502)

  const image =
    modo === 'aprimorar'
      ? await (async () => {
          const src = await mediaBytes(req, Number(body.imagem))
          return editImage(src.data, src.type, `${brief.prompt} ${KEEP_REAL}`)
        })()
      : await generateImage(photo(brief.prompt))

  const slug = (c.title || pedido)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
  const media = await req.payload.create({
    collection: 'media',
    data: { alt: brief.alt || c.title || pedido },
    file: { data: image, mimetype: 'image/webp', name: `capa-ia-${slug || 'post'}-${Date.now()}.webp`, size: image.length },
    req,
    overrideAccess: true,
  })
  return { id: media.id, url: media.url, alt: media.alt }
}

async function traduzir(req: PayloadRequest, id: number) {
  const doc = await req.payload.findByID({ collection: 'articles', id, locale: 'pt-BR', fallbackLocale: false, depth: 1, draft: true, overrideAccess: true })
  const blocks = readBlocks(doc.conteudo)
  const source = {
    titulo: doc.titulo ?? '',
    subtitulo: doc.subtitulo ?? '',
    assinatura: doc.assinatura ?? '',
    blocos: blocks,
  }
  if (!source.titulo || !blocks.length) throw new AiError('Salve a matéria em português, com o texto, antes de traduzir.', 400)
  type T = { titulo?: string; subtitulo?: string; assinatura?: string; blocos?: unknown }
  const out = await chatJSON<{ en?: T; es?: T }>(
    'You are a professional agronomy translator. Translate faithfully from Brazilian Portuguese, keeping every number, unit, product name (Aminosan, Acorda Ultra, KMEP Ultra…) and the block structure. Natural, fluent style for farmers. No em dashes.',
    `Translate this blog post into English (en) and Latin American Spanish (es). Keep the same JSON structure: the same number of blocks, in the same order, with the same "type" (p, h2, ul, quote); translate only the text. Keep "assinatura" (author) names as they are, translating only job titles.

${JSON.stringify(source)}

Answer in JSON: {"en": {same fields}, "es": {same fields}}`,
    { effort: 'medium' },
  )
  const done: string[] = []
  for (const locale of ['en', 'es'] as const) {
    const t = out[locale]
    const translated = cleanBlocks(t?.blocos)
    if (!t?.titulo || !translated.length) continue
    await req.payload.update({
      collection: 'articles',
      id,
      locale,
      draft: true,
      data: {
        titulo: asText(t.titulo),
        subtitulo: asText(t.subtitulo),
        assinatura: asText(t.assinatura),
        conteudo: translated,
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
    else if (action === 'bloco') result = await bloco(c, body)
    else if (action === 'texto') result = await texto(c, body)
    else if (action === 'revisar') result = await revisar(c)
    else if (action === 'corrigir') result = await corrigir(c, body)
    else if (action === 'capa') result = await capa(req, c, body)
    else if (action === 'traduzir') result = await traduzir(req, Number(body.id))
    else return Response.json({ error: 'Ação desconhecida.' }, { status: 404 })
    return Response.json(result)
  } catch (err) {
    if (err instanceof AiError) return Response.json({ error: err.message }, { status: err.status })
    req.payload.logger.error({ err }, 'Assistente de IA falhou')
    return Response.json({ error: 'Algo deu errado com a IA. Tente de novo.' }, { status: 500 })
  }
}
