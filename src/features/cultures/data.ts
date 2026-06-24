/**
 * 10 culturas da home (doc 04-copy/05-culturas, doc 01-home grid). O nome visível
 * vem do i18n (namespace `culturesGrid.names`); aqui ficam só slug e a chave do
 * nome, mais a cor de acento para o card sem foto (placeholder enquanto não há
 * imagem do acervo).
 *
 * TODO: Payload — trocar por query da coleção Cultures (com imagem localizada).
 */

export type Culture = {
  slug: string
  /** chave i18n do nome (namespace `culturesGrid.names`). */
  nameKey: string
  /** cor de acento do card placeholder (sem foto ainda). */
  accent: string
  href: string
}

export const cultures: Culture[] = [
  { slug: 'soja', nameKey: 'soja', accent: '#006838', href: '/culturas/soja' },
  { slug: 'milho', nameKey: 'milho', accent: '#C2B400', href: '/culturas/milho' },
  { slug: 'cafe', nameKey: 'cafe', accent: '#7D252A', href: '/culturas/cafe' },
  { slug: 'cana', nameKey: 'cana', accent: '#79AB34', href: '/culturas/cana' },
  { slug: 'algodao', nameKey: 'algodao', accent: '#388123', href: '/culturas/algodao' },
  { slug: 'feijao', nameKey: 'feijao', accent: '#AD1115', href: '/culturas/feijao' },
  { slug: 'citros', nameKey: 'citros', accent: '#008DC2', href: '/culturas/citros' },
  { slug: 'batata', nameKey: 'batata', accent: '#3A3600', href: '/culturas/batata' },
  { slug: 'tomate', nameKey: 'tomate', accent: '#AD1115', href: '/culturas/tomate' },
  { slug: 'pastagem', nameKey: 'pastagem', accent: '#312783', href: '/culturas/pastagem' },
]
