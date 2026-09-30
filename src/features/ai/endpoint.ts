import { addDataAndFileToRequest, type PayloadHandler, type PayloadRequest } from 'payload'

import { hasRole } from '../../access/roles'
import { AiError, chatJSON, editImage, generateImage } from './openai'
import { blocksToLexical, blocksToPlain, cleanBlocks, lexicalToBlocks, type Block } from './lexical'
import { rulesFor } from './rules'

/**
 * POST /api/ai/:action — assistente de posts do blog (Matéria BR e Post EUA):
 * assunto (títulos, subtítulo, categoria), campo (etiqueta ✨ IA das caixas de
 * texto), revisar (revisão final), capa (3 modos) e traduzir (EN/ES).
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

type Mode = 'ortografia' | 'organizar' | 'aprimorar' | 'aumentar'

const MODE_BR: Record<Mode, string> = {
  ortografia: 'Corrija só ortografia, acentuação, concordância e pontuação. Não mude palavras nem a ordem das ideias.',
  organizar:
    'Corrija e organize: ordem lógica das ideias, parágrafos curtos (separados por uma linha em branco), frases claras. Mantenha o conteúdo, sem acrescentar nem tirar informação.',
  aprimorar: 'Aprimore a redação: mais clara, direta e fluida para o produtor rural, com o mesmo tamanho aproximado e as mesmas informações.',
  aumentar:
    'Aprimore e desenvolva o texto em cerca de 1,5 a 2 vezes o tamanho, explicando melhor o que já está dito (como fazer, por que importa, cuidados práticos). Não invente números, ensaios, doses nem resultados.',
}

const MODE_US: Record<Mode, string> = {
  ortografia: 'Fix only spelling, grammar and punctuation. Do not change wording or the order of ideas.',
  organizar: 'Fix and organize: logical order, short paragraphs, clear sentences, h2 headings where the topic changes. Keep the content; do not add or remove information.',
  aprimorar: 'Improve the writing: clearer, direct and fluent for growers, about the same length and the same information.',
  aumentar:
    'Improve and develop the text to about 1.5 to 2 times the length, explaining better what is already said (how, why it matters, practical care). Do not invent numbers, trials, rates or results.',
}

/**
 * IA por caixa de texto: a etiqueta "✨ IA" da introdução, de cada seção e do
 * texto do post EUA. "Organizar" na introdução também separa seções quando o
 * texto colado trata de mais de um assunto.
 */
async function campo(c: Content, body: Record<string, any>) {
  const mode: Mode = ['ortografia', 'organizar', 'aprimorar', 'aumentar'].includes(body.modo) ? body.modo : 'aprimorar'
  const alvo = body.alvo === 'secao' ? 'secao' : body.alvo === 'corpo' ? 'corpo' : 'intro'

  if (alvo === 'corpo') {
    const text = blocksToPlain(c.blocks)
    if (words(text) < 5) throw new AiError('Escreva o texto antes de usar a IA.', 400)
    const out = await chatJSON<{ blocos?: unknown }>(
      rulesFor('us'),
      `${MODE_US[mode]}
${header(c)}

Post:
${text}

Answer in JSON: {"blocos": [{"type": "p"|"h2"|"h3"|"quote", "text": ""} | {"type": "ul", "items": [""]}]}`,
      { effort: mode === 'ortografia' ? 'low' : 'medium' },
    )
    const blocks = cleanBlocks(out.blocos)
    if (!blocks.length) throw new AiError('A IA não devolveu o texto. Tente de novo.', 502)
    return { body: blocksToLexical(blocks) }
  }

  const texto = asText(body.texto)
  if (words(texto) < 3) throw new AiError('Escreva algo nesta caixa antes de usar a IA.', 400)
  const rules = rulesFor(c.site)
  const task = c.site === 'us' ? MODE_US[mode] : MODE_BR[mode]
  // O resto do post (sem a caixa em edição), só como contexto.
  const indice = alvo === 'secao' ? Number(body.indice) : -1
  const resto = [
    alvo === 'intro' ? '' : c.intro ? `Introdução: ${c.intro}` : '',
    ...c.sections.map((s, i) => (i === indice ? '' : `Seção ${i + 1}${s.titulo ? ` (${s.titulo})` : ''}: ${s.paragrafos ?? ''}`)),
  ]
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 5000)
  const contexto = resto
    ? `\nResto da matéria, só para contexto (não reescreva nem repita o que já está aqui; mantenha a coerência com ele):\n${resto}\n`
    : ''

  if (alvo === 'intro' && mode === 'organizar' && words(texto) > 120) {
    const out = await chatJSON<{ introducao?: unknown; secoes?: unknown }>(
      rules,
      `O texto abaixo foi colado na caixa de introdução da matéria. ${task}
Se ele tratar de mais de um assunto, deixe na introdução só a abertura (1 ou 2 parágrafos) e separe o resto em seções com intertítulo curto. Se for um texto curto de abertura, devolva seções vazias.
${header(c)}
${contexto}
Texto:
${texto}

Responda em JSON: {"introducao": "", "secoes": [{"titulo": "", "paragrafos": ""}]}`,
      { effort: 'medium' },
    )
    return { texto: asText(out.introducao) || texto, secoes: asSections(out.secoes) }
  }

  const out = await chatJSON<{ texto?: unknown; titulo?: unknown }>(
    rules,
    `${task}
${alvo === 'secao' ? `Este é o texto de uma seção da matéria${body.titulo ? ` com o intertítulo "${cut(body.titulo, 200)}"` : ''}. Sugira também um intertítulo curto e claro (até 60 caracteres).` : 'Este é o texto de abertura (introdução) da matéria.'}
Separe parágrafos com uma linha em branco.
${header(c)}
${contexto}
Texto:
${texto}

Responda em JSON: {"texto": ""${alvo === 'secao' ? ', "titulo": ""' : ''}}`,
    { effort: mode === 'ortografia' ? 'low' : 'medium' },
  )
  const result = asText(out.texto)
  if (!result) throw new AiError('A IA não devolveu o texto. Tente de novo.', 502)
  return { texto: result, titulo: alvo === 'secao' ? asText(out.titulo) : undefined }
}

/** Post com cada parte marcada, para a IA dizer onde está cada problema. */
function labeled(c: Content) {
  if (c.site === 'us') return [`[titulo] ${c.title}`, `[resumo] ${c.summary}`, `[texto]\n${blocksToPlain(c.blocks)}`].join('\n\n')
  return [
    `[titulo] ${c.title}`,
    `[subtitulo] ${c.summary}`,
    `[introducao]\n${c.intro}`,
    ...c.sections.map((s, i) => `[secao ${i + 1}] ${s.titulo ? `Intertítulo: ${s.titulo}` : '(sem intertítulo)'}\n${s.paragrafos ?? ''}`),
    c.quote ? `[citacao] ${c.quote}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

type Issue = { tipo: string; onde: string; trecho: string; correcao: string; sugestao: string }

/** O que falta preencher e a IA pode sugerir na revisão (com botão "Inserir"). */
type Suggestion = { campo: string; rotulo: string; texto: string; motivo: string }

async function revisar(c: Content) {
  const text = plain(c)
  const n = words(text)
  if (n < 30) throw new AiError('Escreva o texto antes da revisão final.', 400)
  // Partes vazias que valem sugestão: citação em destaque (só BR) e intertítulos de seção.
  const semCitacao = c.site === 'br' && !c.quote.trim()
  const semTitulo = c.site === 'br' ? c.sections.map((s, i) => (s.paragrafos?.trim() && !s.titulo?.trim() ? i + 1 : 0)).filter(Boolean) : []
  const extras = [
    semCitacao
      ? `Em "citacao", sugira a citação em destaque da matéria: UMA frase curta e forte (até 160 caracteres) tirada do próprio texto, com no máximo um ajuste leve de palavras. Sem número que não esteja no texto com fonte.`
      : '',
    semTitulo.length
      ? `Em "intertitulos", sugira um intertítulo curto e claro (até 60 caracteres) para cada seção sem intertítulo: ${semTitulo.map((i) => `secao ${i}`).join(', ')}.`
      : '',
  ].filter(Boolean)
  const out = await chatJSON<{
    tempoLeitura?: number
    descricaoGoogle?: string
    problemas?: Partial<Issue>[]
    parecer?: string
    citacao?: string
    intertitulos?: { secao?: number | string; titulo?: string }[]
  }>(
    rulesFor(c.site),
    `Faça a revisão final do post abaixo antes de publicar. Responda em português do Brasil (o post pode estar em ${lang(c.site)}).
1. Estime o tempo de leitura em minutos inteiros para um leitor do agro, considerando a densidade técnica (o texto tem ${n} palavras).
2. Aponte até 8 problemas concretos: violações das regras de escrita${c.site === 'us' ? ' e de FIFRA' : ''}, números ou resultados sem fonte, erros de gramática ou digitação, trechos confusos.
   Um número TEM fonte quando o próprio trecho ou a frase ao lado cita quem mediu (instituição, ensaio, órgão ou ano). Recomendações técnicas gerais (estádio V4, faixa de pH) não precisam de fonte. Não aponte o que já está certo. Se estiver tudo certo, lista vazia.
   Para cada problema:
   - "onde": a marca da parte em que ele está (titulo, subtitulo, resumo, introducao, "secao 2", citacao ou texto);
   - "trecho": cópia EXATA, letra por letra, de um pedaço curto do post (uma frase ou menos) que contém o problema;
   - "correcao": esse mesmo trecho já corrigido, no idioma do post, pronto para substituir o trecho. Mude o mínimo. Nunca invente fonte, número ou ensaio: se falta fonte, reescreva sem o número ou sem afirmar o resultado;
   - "sugestao": em português, uma frase curta explicando o que estava errado.
3. Em "descricaoGoogle", escreva a descrição do post para aparecer no Google: ${c.site === 'us' ? 'em inglês, ' : ''}uma ou duas frases, até 160 caracteres, dizendo do que o post trata e o que o leitor aprende. Nada sobre a revisão ou sobre a qualidade do texto.
4. Dê um parecer de uma frase sobre se está pronto para publicar (sem falar das partes vazias do item 5).
${extras.length ? `5. ${extras.join('\n   ')}\n` : ''}
${header(c)}

Post (cada parte começa com a marca entre colchetes, que não faz parte do texto):
${labeled(c).slice(0, 16000)}

Responda em JSON: {"tempoLeitura": número, "descricaoGoogle": "", "problemas": [{"tipo": "regra|número sem fonte|gramática|clareza${c.site === 'us' ? '|FIFRA' : ''}", "onde": "", "trecho": "", "correcao": "", "sugestao": ""}], "parecer": ""${semCitacao ? ', "citacao": ""' : ''}${semTitulo.length ? ', "intertitulos": [{"secao": número, "titulo": ""}]' : ''}}`,
    { effort: 'medium' },
  )
  // Sanidade: entre ~120 e ~300 palavras por minuto.
  const min = Math.max(1, Math.round(n / 300))
  const max = Math.max(1, Math.ceil(n / 120))
  const tempo = Math.min(max, Math.max(min, Math.round(Number(out.tempoLeitura) || n / 200)))
  return {
    tempoLeitura: tempo,
    resumo: String(out.descricaoGoogle ?? '').trim(),
    problemas: (out.problemas ?? [])
      .filter((p) => p?.trecho || p?.sugestao)
      .slice(0, 8)
      .map((p) => ({
        tipo: String(p.tipo ?? 'clareza'),
        onde: String(p.onde ?? '').toLowerCase(),
        trecho: String(p.trecho ?? '').replace(/^["“”'\s]+|["“”'\s]+$/g, ''),
        correcao: asText(p.correcao),
        sugestao: String(p.sugestao ?? ''),
      })),
    parecer: String(out.parecer ?? ''),
    palavras: n,
    sugestoes: [
      ...(semCitacao && asText(out.citacao)
        ? [{ campo: 'citacao', rotulo: 'Citação em destaque', texto: asText(out.citacao).replace(/^["“”'\s]+|["“”'\s]+$/g, ''), motivo: 'A matéria está sem citação. Esta frase do próprio texto fica em destaque na página.' }]
        : []),
      ...(out.intertitulos ?? [])
        .map((t) => ({ n: Number(String(t?.secao ?? '').replace(/\D/g, '')), titulo: asText(t?.titulo) }))
        .filter((t) => semTitulo.includes(t.n) && t.titulo)
        .map((t) => ({ campo: `secoes.${t.n - 1}.titulo`, rotulo: `Intertítulo da seção ${t.n}`, texto: t.titulo, motivo: 'A seção está sem intertítulo; ele ajuda a leitura e o Google.' })),
    ] satisfies Suggestion[],
  }
}

/**
 * "Corrigir" de um ponto da revisão, quando o trecho não foi achado igual no
 * formulário: a IA reescreve a parte inteira em que está o problema.
 */
async function corrigir(c: Content, body: Record<string, any>) {
  const p = (body.problema ?? {}) as Partial<Issue>
  const onde = String(p.onde ?? '').toLowerCase()
  const task = `Corrija só este problema, mudando o mínimo possível e mantendo o resto igual (mesmos parágrafos, mesmo idioma). Nunca invente fonte, número ou ensaio.
Problema (${p.tipo ?? 'clareza'}): ${cut(p.sugestao, 600)}
${p.trecho ? `Trecho apontado: "${cut(p.trecho, 600)}"` : ''}
${p.correcao ? `Correção sugerida para o trecho: "${cut(p.correcao, 600)}"` : ''}`

  if (c.site === 'us' && !['titulo', 'resumo'].includes(onde)) {
    const out = await chatJSON<{ blocos?: unknown }>(
      rulesFor('us'),
      `${task}

Post:
${blocksToPlain(c.blocks)}

Answer in JSON with the whole post text: {"blocos": [{"type": "p"|"h2"|"h3"|"quote", "text": ""} | {"type": "ul", "items": [""]}]}`,
      { effort: 'low' },
    )
    const blocks = cleanBlocks(out.blocos)
    if (!blocks.length) throw new AiError('A IA não devolveu o texto. Tente de novo.', 502)
    return { campo: 'body', body: blocksToLexical(blocks) }
  }

  const n = Number(onde.match(/secao\s*(\d+)/)?.[1] ?? 0)
  const target =
    onde === 'titulo'
      ? { campo: c.site === 'us' ? 'title' : 'titulo', texto: c.title }
      : onde === 'subtitulo' || onde === 'resumo'
        ? { campo: c.site === 'us' ? 'excerpt' : 'subtitulo', texto: c.summary }
        : onde === 'citacao'
          ? { campo: 'citacao', texto: c.quote }
          : n && c.sections[n - 1]
            ? { campo: `secoes.${n - 1}.paragrafos`, texto: c.sections[n - 1].paragrafos ?? '' }
            : { campo: 'introducao', texto: c.intro }
  if (!target.texto.trim()) throw new AiError('Não encontrei essa parte do post. Revise de novo.', 400)
  const out = await chatJSON<{ texto?: unknown }>(
    rulesFor(c.site),
    `${task}

Texto a corrigir (devolva ele inteiro, corrigido; parágrafos separados por uma linha em branco):
${target.texto}

Responda em JSON: {"texto": ""}`,
    { effort: 'low' },
  )
  const texto = asText(out.texto)
  if (!texto) throw new AiError('A IA não devolveu o texto. Tente de novo.', 502)
  return { campo: target.campo, texto }
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
    else if (action === 'campo') result = await campo(c, body)
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
