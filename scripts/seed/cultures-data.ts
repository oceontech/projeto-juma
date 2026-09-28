/**
 * Metadados das culturas que viviam nos componentes (CulturePage, CulturesGrid,
 * HomeCultures) antes do painel. Fonte do seed (scripts/seed/cultures.ts).
 * Os textos ficam em scripts/seed/cultures-messages/<idioma>.json.
 */

type CultureMeta = { gradient: string; image: string }

export const REC_META: Record<string, { name: string, labelColor: string, image?: string }> = {
  'acorda-ultra': { name: 'Acorda Ultra', labelColor: '#008dc2', image: '/produtos/acorda-ultra.webp' },
  'acorda-cana': { name: 'Acorda Cana', labelColor: '#79ab34', image: '/produtos/acorda-cana.webp' },
  'aduban': { name: 'Aduban', labelColor: '#ad1115', image: '/produtos/aduban.webp' },
  'aminosan': { name: 'Aminosan®', labelColor: '#006838', image: '/produtos/aminosan.webp' },
  'fitofert': { name: 'Fitofert', labelColor: '#006838', image: '/produtos/fitofert.webp' },
  'revigophos-amino': { name: 'RevigoPhos Amino', labelColor: '#312783', image: '/produtos/revigophos-amino.webp' },
  'revigo-comoni': { name: 'Revigo CoMoNi', labelColor: '#312783', image: '/produtos/revigo-comoni.webp' },
  'revigo-milho': { name: 'Revigo + Milho', labelColor: '#312783', image: '/produtos/revigo-milho.webp' },
  'revigo-pasto': { name: 'Revigo + Pasto', labelColor: '#312783', image: '/produtos/revigo-pasto.webp' },
  'kmep-ultra': { name: 'Kmep Ultra', labelColor: '#ad1115', image: '/produtos/kmep-ultra.webp' },
  'redutan-sili-4': { name: 'Redutan NPK Sili-4', labelColor: '#006838', image: '/produtos/redutan-sili-4.webp' }
}

export const CULTURE_META: Record<string, CultureMeta> = {
  cafe: {
    gradient: 'linear-gradient(165deg, #6c4226 0%, #2a1a10 100%)',
    image: '/assets/cultures/cafe.webp?v=20260731',
  },
  soja: {
    gradient: 'linear-gradient(165deg, #5d7a3a, #2c3a18)',
    image: '/assets/cultures/soja.webp?v=20260731b',
  },
  milho: {
    gradient: 'linear-gradient(165deg, #c3a445, #6b4f15)',
    image: '/assets/cultures/milho.webp?v=20260731b',
  },
  cana: {
    gradient: 'linear-gradient(165deg, #7fa356, #364a1f)',
    image: '/assets/cultures/cana.webp?v=20260731',
  },
  algodao: {
    gradient: 'linear-gradient(165deg, #e7dfc9, #87826a)',
    image: '/assets/cultures/algodao.webp?v=20260731',
  },
  feijao: {
    gradient: 'linear-gradient(165deg, #8b5e3b, #2f1f12)',
    image: '/assets/cultures/feijao.webp?v=20260731b',
  },
  citros: {
    gradient: 'linear-gradient(165deg, #d3a52a, #5e4910)',
    image: '/assets/cultures/limao.webp?v=20260731',
  },
  batata: {
    gradient: 'linear-gradient(165deg, #a08562, #463623)',
    image: '/assets/cultures/batata.webp?v=20260731',
  },
  tomate: {
    gradient: 'linear-gradient(165deg, #b73a2a, #4e1410)',
    image: '/assets/cultures/tomate.webp?v=20260731',
  },
  pastagem: {
    gradient: 'linear-gradient(165deg, #80a558, #2c3e1d)',
    image: '/assets/cultures/pastagem.webp?v=20260731',
  },
}

export const GRID_CULTURES = [
  { id: 'soja', num: '01', color: 'from-green-600 to-green-800', image: '/assets/cultures/soja.webp?v=20260731b' },
  { id: 'milho', num: '02', color: 'from-yellow-500 to-amber-700', image: '/assets/cultures/milho.webp?v=20260731b' },
  { id: 'cafe', num: '03', color: 'from-amber-700 to-orange-900', image: '/assets/cultures/cafe.webp?v=20260731' },
  { id: 'cana', num: '04', color: 'from-lime-500 to-green-700', image: '/assets/cultures/cana.webp?v=20260731' },
  { id: 'algodao', num: '05', color: 'from-blue-100 to-slate-300', text: 'text-foreground', image: '/assets/cultures/algodao.webp?v=20260731' },
  { id: 'feijao', num: '06', color: 'from-orange-800 to-red-900', image: '/assets/cultures/feijao.webp?v=20260731b' },
  { id: 'citros', num: '07', color: 'from-orange-400 to-orange-600', image: '/assets/cultures/limao.webp?v=20260731' },
  { id: 'batata', num: '08', color: 'from-amber-200 to-yellow-600', text: 'text-foreground', image: '/assets/cultures/batata.webp?v=20260731' },
  { id: 'tomate', num: '09', color: 'from-red-500 to-red-700', image: '/assets/cultures/tomate.webp?v=20260731' },
  { id: 'pastagem', num: '10', color: 'from-green-400 to-green-600', image: '/assets/cultures/pastagem.webp?v=20260731' },
] as const

export const HOME_CULTURES = [
  { slug: 'soja',     label: 'Soja',           idx: '01', bg: 'linear-gradient(135deg, #2d6a1f 0%, #4a8c2a 100%)', image: '/assets/cultures/soja.webp?v=20260731b' },
  { slug: 'milho',    label: 'Milho',           idx: '02', bg: 'linear-gradient(135deg, #6b8c22 0%, #8fad2e 100%)', image: '/assets/cultures/milho.webp?v=20260731b' },
  { slug: 'cafe',     label: 'Café',            idx: '03', bg: 'linear-gradient(135deg, #4a2c0e 0%, #7a4a1a 100%)', image: '/assets/cultures/cafe.webp?v=20260731' },
  { slug: 'cana',     label: 'Cana-de-açúcar',  idx: '04', bg: 'linear-gradient(135deg, #3d6b1a 0%, #5e9926 100%)', image: '/assets/cultures/cana.webp?v=20260731' },
  { slug: 'algodao',  label: 'Algodão',         idx: '05', bg: 'linear-gradient(135deg, #5a7a3a 0%, #829b55 100%)', image: '/assets/cultures/algodao.webp?v=20260731' },
  { slug: 'feijao',   label: 'Feijão',          idx: '06', bg: 'linear-gradient(135deg, #6b3a0e 0%, #9a5e24 100%)', image: '/assets/cultures/feijao.webp?v=20260731b' },
  { slug: 'citros',   label: 'Citros',          idx: '07', bg: 'linear-gradient(135deg, #7a5a0a 0%, #b8850f 100%)', image: '/assets/cultures/limao.webp?v=20260731' },
  { slug: 'batata',   label: 'Batata',          idx: '08', bg: 'linear-gradient(135deg, #5a4a0a 0%, #8f7520 100%)', image: '/assets/cultures/batata.webp?v=20260731' },
  { slug: 'tomate',   label: 'Tomate',          idx: '09', bg: 'linear-gradient(135deg, #7a1a0e 0%, #b52a1a 100%)', image: '/assets/cultures/tomate.webp?v=20260731' },
  { slug: 'pastagem', label: 'Pastagem',        idx: '10', bg: 'linear-gradient(135deg, #1a5c14 0%, #2e8c24 100%)', image: '/assets/cultures/pastagem.webp?v=20260731' },
]
