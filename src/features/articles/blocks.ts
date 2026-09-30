import { cleanBlocks, type Block } from '../ai/lexical'

/**
 * Texto da matéria em blocos (parágrafo, intertítulo, lista, citação): o mesmo
 * formato nos dois sites. No BR fica no campo `conteudo` (json, por idioma);
 * no EUA vai para o `body` (texto rico) convertido por `blocksToLexical`.
 */
export type { Block }

type Legacy = { introducao?: string | null; secoes?: { titulo?: string | null; paragrafos?: string | null }[] | null; citacao?: string | null }

const paragraphs = (text?: string | null) =>
  String(text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)

/** Matéria no formato antigo (introdução + seções + citação) em blocos. */
export function legacyToBlocks(d: Legacy): Block[] {
  const out: Block[] = paragraphs(d.introducao).map((text) => ({ type: 'p', text }))
  for (const s of d.secoes ?? []) {
    if (s?.titulo?.trim()) out.push({ type: 'h2', text: s.titulo.trim() })
    out.push(...paragraphs(s?.paragrafos).map((text): Block => ({ type: 'p', text })))
  }
  if (d.citacao?.trim()) out.push({ type: 'quote', text: d.citacao.trim() })
  return out
}

/** Blocos salvos no campo `conteudo` (descarta o que estiver vazio). */
export const readBlocks = (value: unknown): Block[] => cleanBlocks(value)

export const blockText = (b: Block) => (b.type === 'ul' ? b.items.join(' ') : b.text)

export const blocksWords = (blocks: Block[]) =>
  blocks
    .map(blockText)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
