/**
 * Opções das matérias compartilhadas entre a coleção do Payload e as páginas.
 * As classes de cor ficam escritas por extenso aqui para o Tailwind gerá-las.
 */

export const ARTICLE_CATEGORIES = [
  { value: 'manejo', label: 'Manejo' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'pecuaria', label: 'Pecuária' },
  { value: 'pesquisa', label: 'Pesquisa' },
  { value: 'sustentabilidade', label: 'Sustentabilidade' },
] as const

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]['value']

/** Fundo em gradiente mostrado enquanto a capa carrega. */
export const ARTICLE_COLORS = [
  { value: 'from-green-700 to-emerald-950', label: 'Verde escuro' },
  { value: 'from-green-600 to-green-800', label: 'Verde' },
  { value: 'from-teal-600 to-emerald-800', label: 'Verde-azulado' },
  { value: 'from-amber-600 to-orange-800', label: 'Âmbar' },
  { value: 'from-blue-600 to-indigo-800', label: 'Azul' },
  { value: 'from-purple-600 to-purple-900', label: 'Roxo' },
] as const
