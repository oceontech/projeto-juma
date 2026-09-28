/**
 * Opções dos produtos compartilhadas entre a coleção do Payload e as páginas.
 * Os ids batem com os filtros do catálogo (`cat-*`, `cul-*`) e com as chaves de
 * tradução de `productsPage.categories` / `productsPage.cultures`.
 */

export const PRODUCT_CATEGORIES = [
  { value: 'cat-tratamento', label: 'Tratamento e arranque' },
  { value: 'cat-nutricao', label: 'Nutrição e fisiologia' },
  { value: 'cat-protecao', label: 'Proteção de cultivos' },
  { value: 'cat-aplicacao', label: 'Tecnologia de aplicação' },
  { value: 'cat-manejo', label: 'Manejo completo' },
] as const

/** Culturas do filtro do catálogo (as 10 do site). */
export const PRODUCT_FILTER_CROPS = [
  { value: 'cul-soja', label: 'Soja' },
  { value: 'cul-milho', label: 'Milho' },
  { value: 'cul-cafe', label: 'Café' },
  { value: 'cul-cana', label: 'Cana' },
  { value: 'cul-algodao', label: 'Algodão' },
  { value: 'cul-feijao', label: 'Feijão' },
  { value: 'cul-citros', label: 'Citros' },
  { value: 'cul-tomate', label: 'Tomate' },
  { value: 'cul-batata', label: 'Batata' },
  { value: 'cul-pastagem', label: 'Pastagem' },
] as const

/** Embalagens de fábrica. Lista fechada passada pelo cliente. */
export const PRODUCT_SIZES = ['1L', '10L', '20L'] as const

export const PROBLEM_ICONS = [
  { value: 'seed', label: 'Semente' },
  { value: 'sun', label: 'Sol' },
  { value: 'drop', label: 'Gota' },
  { value: 'leaf', label: 'Folha' },
  { value: 'shield', label: 'Escudo' },
  { value: 'chart', label: 'Gráfico' },
] as const

export type ProblemIconName = (typeof PROBLEM_ICONS)[number]['value']
