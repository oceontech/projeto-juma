/**
 * Texto rico (Lexical, do post do EUA) ↔ blocos simples que a IA entende:
 * { type: 'h2' | 'h3' | 'p' | 'quote' | 'ul', text | items }.
 */

export type Block = { type: 'h2' | 'h3' | 'p' | 'quote'; text: string } | { type: 'ul'; items: string[] }

type Node = { type?: string; tag?: string; text?: string; children?: Node[]; listType?: string }

const textOf = (node: Node): string =>
  node.type === 'text' ? (node.text ?? '') : node.type === 'linebreak' ? '\n' : (node.children ?? []).map(textOf).join('')

export function lexicalToBlocks(value: unknown): Block[] {
  const root = (value as { root?: Node } | null)?.root
  const blocks: Block[] = []
  for (const node of root?.children ?? []) {
    if (node.type === 'heading') blocks.push({ type: node.tag === 'h3' || node.tag === 'h4' ? 'h3' : 'h2', text: textOf(node) })
    else if (node.type === 'quote') blocks.push({ type: 'quote', text: textOf(node) })
    else if (node.type === 'list') blocks.push({ type: 'ul', items: (node.children ?? []).map(textOf).filter(Boolean) })
    else {
      const t = textOf(node).trim()
      if (t) blocks.push({ type: 'p', text: t })
    }
  }
  return blocks
}

export const blocksToPlain = (blocks: Block[]) =>
  blocks.map((b) => (b.type === 'ul' ? b.items.map((i) => `- ${i}`).join('\n') : b.type.startsWith('h') ? `## ${b.text}` : b.text)).join('\n\n')

const text = (value: string) => ({ type: 'text', text: value, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })
const base = { direction: 'ltr', format: '', indent: 0, version: 1 }

export function blocksToLexical(blocks: Block[]) {
  const children = blocks.map((b) => {
    if (b.type === 'h2' || b.type === 'h3') return { ...base, type: 'heading', tag: b.type, children: [text(b.text)] }
    if (b.type === 'quote') return { ...base, type: 'quote', children: [text(b.text)] }
    if (b.type === 'ul')
      return {
        ...base,
        type: 'list',
        listType: 'bullet',
        tag: 'ul',
        start: 1,
        children: b.items.map((item, i) => ({ ...base, type: 'listitem', value: i + 1, children: [text(item)] })),
      }
    return { ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: [text(b.text)] }
  })
  return { root: { ...base, type: 'root', children } }
}

/** Blocos vindos da IA, validados (descarta o que não tiver texto). */
export function cleanBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) return []
  return input.flatMap((b): Block[] => {
    if (!b || typeof b !== 'object') return []
    const o = b as Record<string, unknown>
    if (o.type === 'ul' && Array.isArray(o.items)) {
      const items = o.items.map(String).map((s) => s.trim()).filter(Boolean)
      return items.length ? [{ type: 'ul', items }] : []
    }
    const t = String(o.text ?? '').trim()
    if (!t) return []
    const type = o.type === 'h2' || o.type === 'h3' || o.type === 'quote' ? o.type : 'p'
    return [{ type, text: t }]
  })
}
