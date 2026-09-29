/** Catálogo em destaque da home: tipos e ícones, usados pelo painel e pelo site. */

export const SHOWCASE_ICONS = [
  { value: 'recovery', label: 'Recuperação' },
  { value: 'leaf', label: 'Folha' },
  { value: 'bloom', label: 'Flor' },
  { value: 'sprout', label: 'Broto' },
  { value: 'roots', label: 'Raízes' },
  { value: 'shield', label: 'Proteção' },
  { value: 'bug', label: 'Praga' },
  { value: 'molecule', label: 'Molécula' },
  { value: 'award', label: 'Prêmio' },
  { value: 'energy', label: 'Energia' },
  { value: 'metabolism', label: 'Metabolismo' },
] as const

export type ShowcaseIcon = (typeof SHOWCASE_ICONS)[number]['value']

export type ShowcaseProduct = {
  name: string
  /** Nome quebrado em linhas no título (ex.: ["Acorda", "Ultra"]). */
  titleLines: string[]
  description: string
  stats: { icon: ShowcaseIcon; title: string; label: string }[]
  /** Fundo escuro (borda do gradiente). */
  base: string
  /** Fundo mais escuro (centro do gradiente). */
  mid: string
  /** Anéis, divisor, ícones e embalagens. */
  accent: string
  sizes: string[]
  href: string
  image: string
}

/** Centro do gradiente: a cor de fundo escurecida. */
export function darker(hex: string, amount = 0.55) {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  if (Number.isNaN(n)) return '#050505'
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount))
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')}`
}
