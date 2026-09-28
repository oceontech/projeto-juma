/**
 * Metadados dos produtos que viviam nos componentes (ProductPage e ProductGrid)
 * antes do painel. Fonte do seed (scripts/seed/products.ts); o site não lê mais daqui.
 * Os textos continuam em messages/*.json (namespaces productData e productsPage).
 */

type GalleryPhoto = { src: string; span: string; sizes: string }
type ProductMeta = {
  labelColor: string
  problemsMeta: ('seed' | 'sun' | 'drop' | 'leaf' | 'shield' | 'chart')[]
  relatedMeta: { slug: string; labelColor: string }[]
  image?: string
  sizes: string[]
}

const galleryImage = (
  name: string,
  span = '',
  sizes = '(min-width: 768px) 25vw, 50vw',
): GalleryPhoto => ({
  src: `/assets/products/gallery/${name}.webp?v=20260731c`,
  span,
  sizes,
})

export const PRODUCT_GALLERIES: Record<string, GalleryPhoto[]> = {
  'aminosan': [
    galleryImage('foliar-soja', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('raizes-vigor'),
    galleryImage('cafe-florada'),
    galleryImage('enchimento-soja', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'fitofert': [
    galleryImage('florada-cafe', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('tomate-frutificacao'),
    galleryImage('citros-foliar'),
    galleryImage('enchimento-soja', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'revigo-comoni': [
    galleryImage('deficiencia-foliar', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('citros-foliar'),
    galleryImage('tomate-frutificacao'),
    galleryImage('foliar-soja', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'revigophos-amino': [
    galleryImage('raizes-vigor', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('solo-raizes'),
    galleryImage('foliar-soja'),
    galleryImage('enchimento-soja', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'revigo-cobre-ultra': [
    galleryImage('deficiencia-foliar', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('citros-foliar'),
    galleryImage('tomate-frutificacao'),
    galleryImage('cafe-florada', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'acorda-cana': [
    galleryImage('sulco-cana', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('solo-raizes'),
    galleryImage('raizes-vigor'),
    galleryImage('pulverizacao-campo', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'acorda-ultra': [
    galleryImage('tratamento-sementes', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('emergencia-uniforme'),
    galleryImage('raizes-vigor'),
    galleryImage('solo-raizes', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'aduban': [
    galleryImage('solo-raizes', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('emergencia-uniforme'),
    galleryImage('raizes-vigor'),
    galleryImage('foliar-soja', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'kmep-ultra': [
    galleryImage('pragas-scouting', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('controle-gotas'),
    galleryImage('pulverizacao-campo'),
    galleryImage('enchimento-soja', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'redutan-sili-4': [
    galleryImage('controle-gotas', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('calda-homogenea'),
    galleryImage('pulverizacao-campo'),
    galleryImage('bicos-filtros', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'redutan-sili-5': [
    galleryImage('aplicacao-aerea', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('controle-gotas'),
    galleryImage('pulverizacao-campo'),
    galleryImage('calda-homogenea', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'supermix': [
    galleryImage('calda-homogenea', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('bicos-filtros'),
    galleryImage('controle-gotas'),
    galleryImage('pulverizacao-campo', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'revigo-milho': [
    galleryImage('milho-safrinha', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('foliar-soja'),
    galleryImage('pulverizacao-campo'),
    galleryImage('enchimento-soja', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
  'revigo-pasto': [
    galleryImage('pastagem-vigor', 'col-span-2 row-span-2', '(min-width: 768px) 50vw, 100vw'),
    galleryImage('pulverizacao-campo'),
    galleryImage('controle-gotas'),
    galleryImage('raizes-vigor', 'col-span-2', '(min-width: 768px) 50vw, 100vw'),
  ],
}


export const META: Record<string, ProductMeta> = {
  'aminosan': {
    labelColor: '#659357',
    problemsMeta: ['seed', 'sun', 'drop'],
    relatedMeta: [{ slug: 'fitofert', labelColor: '#659357' }, { slug: 'revigo-comoni', labelColor: '#302783' }, { slug: 'revigophos-amino', labelColor: '#302783' }],
    image: '/produtos/aminosan.webp',
    sizes: ['1L', '10L', '20L']
  },
  'fitofert': {
    labelColor: '#659357',
    problemsMeta: ['leaf', 'chart', 'sun'],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'revigophos-amino', labelColor: '#302783' }],
    image: '/produtos/fitofert.webp',
    sizes: ['20L']
  },
  'revigo-comoni': {
    labelColor: '#302783',
    problemsMeta: ['leaf', 'sun', 'drop'],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'fitofert', labelColor: '#659357' }],
    image: '/produtos/revigo-comoni.webp',
    sizes: ['1L']
  },
  'revigophos-amino': {
    labelColor: '#302783',
    problemsMeta: ['sun', 'drop', 'seed'],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'fitofert', labelColor: '#659357' }],
    image: '/produtos/revigophos-amino.webp',
    sizes: ['10L', '20L']
  },
  'revigo-cobre-ultra': {
    labelColor: '#302783',
    problemsMeta: ['leaf', 'shield'],
    relatedMeta: [{ slug: 'revigo-comoni', labelColor: '#302783' }, { slug: 'aminosan', labelColor: '#659357' }],
    image: '/produtos/revigo-cobre-ultra.webp',
    sizes: ['1L', '10L']
  },
  'acorda-cana': {
    labelColor: '#79ab34',
    problemsMeta: ['seed', 'drop'],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'redutan-sili-4', labelColor: '#7d252a' }],
    image: '/produtos/acorda-cana.webp',
    sizes: ['20L']
  },
  'acorda-ultra': {
    labelColor: '#008dc2',
    problemsMeta: ['chart', 'drop'],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'aduban', labelColor: '#ad1115' }],
    image: '/produtos/acorda-ultra.webp',
    sizes: ['1L', '10L']
  },
  'aduban': {
    labelColor: '#ad1115',
    problemsMeta: ['drop', 'seed'],
    relatedMeta: [{ slug: 'acorda-ultra', labelColor: '#008dc2' }, { slug: 'aminosan', labelColor: '#659357' }],
    image: '/produtos/aduban.webp',
    sizes: ['20L']
  },
  'kmep-ultra': {
    labelColor: '#ad1115',
    problemsMeta: ['shield', 'chart'],
    relatedMeta: [{ slug: 'redutan-sili-4', labelColor: '#7d252a' }, { slug: 'supermix', labelColor: '#388123' }],
    image: '/produtos/kmep-ultra.webp',
    sizes: ['10L', '20L']
  },
  // Redutan NPK Sili-4 representada pelo Sili-4; o Sili-5 tem página própria.
  'redutan-sili-4': {
    labelColor: '#006838',
    problemsMeta: ['sun', 'drop'],
    relatedMeta: [{ slug: 'redutan-sili-5', labelColor: '#7d252a' }, { slug: 'supermix', labelColor: '#388123' }],
    image: '/produtos/redutan-sili-4.webp',
    sizes: ['1L']
  },
  // Sili-5: mesma linha do Sili-4, formulação de maior intensidade
  // (docs/04-copy/04-produtos.md, "[OS TRÊS PRODUTOS]").
  'redutan-sili-5': {
    labelColor: '#7d252a',
    problemsMeta: ['sun', 'drop'],
    relatedMeta: [{ slug: 'redutan-sili-4', labelColor: '#006838' }, { slug: 'supermix', labelColor: '#388123' }],
    image: '/produtos/redutan-sili-5.webp',
    sizes: ['1L']
  },
  'supermix': {
    labelColor: '#388123',
    problemsMeta: ['drop', 'chart'],
    relatedMeta: [{ slug: 'redutan-sili-4', labelColor: '#7d252a' }, { slug: 'kmep-ultra', labelColor: '#ad1115' }],
    image: '/produtos/supermix.webp',
    sizes: ['1L', '10L', '20L']
  },
  'revigo-milho': {
    labelColor: '#302783',
    problemsMeta: ['chart', 'sun'],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'fitofert', labelColor: '#659357' }],
    image: '/produtos/revigo-milho.webp',
    sizes: ['20L']
  },
  'revigo-pasto': {
    labelColor: '#302783',
    problemsMeta: ['leaf', 'chart'],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'redutan-sili-4', labelColor: '#7d252a' }],
    image: '/produtos/revigo-pasto.webp',
    sizes: ['20L']
  }
}

export const GRID_PRODUCTS = [
  {
    id: 'acorda-cana',
    name: 'Acorda Cana',
    tKey: 'acordaCana' as const,
    categoryId: 'cat-tratamento',
    cultures: ['cul-cana'],
    color: '#79ab34',
    href: '/produtos/acorda-cana',
    image: '/produtos/acorda-cana.webp',
  },
  {
    id: 'acorda-ultra',
    name: 'Acorda Ultra',
    tKey: 'acordaUltra' as const,
    categoryId: 'cat-tratamento',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#008dc2',
    href: '/produtos/acorda-ultra',
    image: '/produtos/acorda-ultra.webp',
  },
  {
    id: 'aduban',
    name: 'Aduban',
    tKey: 'aduban' as const,
    categoryId: 'cat-tratamento',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#ad1115',
    href: '/produtos/aduban',
    image: '/produtos/aduban.webp',
  },
  {
    id: 'aminosan',
    name: 'Aminosan®',
    tKey: 'aminosan' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#006838',
    href: '/produtos/aminosan',
    image: '/produtos/aminosan.webp',
  },
  {
    id: 'fitofert',
    name: 'Fitofert',
    tKey: 'fitofert' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-cafe', 'cul-feijao', 'cul-citros', 'cul-tomate'],
    color: '#006838',
    href: '/produtos/fitofert',
    image: '/produtos/fitofert.webp',
  },
  {
    id: 'revigo-comoni',
    name: 'Revigo CoMoNi',
    tKey: 'revigoComoni' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-cana'],
    color: '#312783',
    href: '/produtos/revigo-comoni',
    image: '/produtos/revigo-comoni.webp',
  },
  {
    id: 'revigophos-amino',
    name: 'RevigoPhos Amino',
    tKey: 'revigophosAmino' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-pastagem'],
    color: '#312783',
    href: '/produtos/revigophos-amino',
    image: '/produtos/revigophos-amino.webp',
  },
  {
    id: 'revigo-cobre-ultra',
    name: 'Revigo Cobre Ultra',
    tKey: 'revigoCobreUltra' as const,
    categoryId: 'cat-nutricao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#312783',
    href: '/produtos/revigo-cobre-ultra',
    image: '/produtos/revigo-cobre-ultra.webp',
  },
  {
    id: 'kmep-ultra',
    name: 'Kmep Ultra',
    tKey: 'kmepUltra' as const,
    categoryId: 'cat-protecao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata'],
    color: '#ad1115',
    href: '/produtos/kmep-ultra',
    image: '/produtos/kmep-ultra.webp',
  },
  {
    id: 'redutan-sili-4',
    name: 'Redutan NPK Sili-4',
    tKey: 'redutanSili4' as const,
    categoryId: 'cat-aplicacao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-cana', 'cul-pastagem'],
    color: '#006838',
    href: '/produtos/redutan-sili-4',
    image: '/produtos/redutan-sili-4.webp',
  },
  {
    id: 'redutan-sili-5',
    name: 'Redutan NPK Sili-5',
    tKey: 'redutanSili5' as const,
    categoryId: 'cat-aplicacao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-cana', 'cul-pastagem'],
    color: '#7d252a',
    href: '/produtos/redutan-sili-5',
    image: '/produtos/redutan-sili-5.webp',
  },
  {
    id: 'supermix',
    name: 'Supermix',
    tKey: 'supermix' as const,
    categoryId: 'cat-aplicacao',
    cultures: ['cul-soja', 'cul-milho', 'cul-cafe', 'cul-algodao', 'cul-feijao', 'cul-citros', 'cul-tomate', 'cul-batata', 'cul-cana', 'cul-pastagem'],
    color: '#388123',
    href: '/produtos/supermix',
    image: '/produtos/supermix.webp',
  },
  {
    id: 'revigo-milho',
    name: 'Revigo + Milho',
    tKey: 'revigoMilho' as const,
    categoryId: 'cat-manejo',
    cultures: ['cul-milho'],
    color: '#312783',
    href: '/produtos/revigo-milho',
    image: '/produtos/revigo-milho.webp',
  },
  {
    id: 'revigo-pasto',
    name: 'Revigo + Pasto',
    tKey: 'revigoPasto' as const,
    categoryId: 'cat-manejo',
    cultures: ['cul-pastagem', 'cul-milho'],
    color: '#312783',
    href: '/produtos/revigo-pasto',
    image: '/produtos/revigo-pasto.webp',
  },
]
