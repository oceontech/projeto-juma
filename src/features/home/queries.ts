// Só servidor: destaques da home vindos do painel (Site Brasil › Destaques da home).
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Media, Product } from '@/payload-types'

import { darker, type ShowcaseIcon, type ShowcaseProduct } from './showcase'

type Locale = 'pt-BR' | 'en' | 'es'

// Recortes justos 1000×1000 que o teatro de frascos usa; os outros vêm da Mídia.
const LOCAL_BOTTLES = new Set([
  'acorda-cana', 'acorda-ultra', 'aduban', 'aminosan', 'fitofert', 'kmep-ultra', 'redutan-sili-4', 'redutan-sili-5',
  'revigo-cobre-ultra', 'revigo-comoni', 'revigo-milho', 'revigo-pasto', 'revigophos-amino', 'supermix',
])

const lines = (text?: string | null) =>
  (text ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

type Stat = { icone?: string | null; titulo?: string | null; apoio?: string | null }
const stats = (list?: Stat[] | null) =>
  (list ?? [])
    .filter((s) => s.titulo)
    .map((s) => ({ icon: (s.icone ?? 'leaf') as ShowcaseIcon, title: s.titulo ?? '', label: s.apoio ?? '' }))

/**
 * Destaques da home no idioma pedido. `null` enquanto o painel nunca foi
 * salvo: o componente usa os textos atuais (mensagens) nesse caso.
 * O Aminosan vem sempre primeiro, com cores fixas (a animação anterior
 * termina no frasco dele); dele só os textos são editáveis.
 */
export const getHomeShowcase = cache(
  async (locale: Locale): Promise<{ aminosan: Partial<ShowcaseProduct>; others: ShowcaseProduct[] } | null> => {
    try {
      const payload = await getPayload({ config })
      const g = await payload.findGlobal({ slug: 'destaques', locale, fallbackLocale: 'pt-BR', depth: 2 })
      if (!g.updatedAt) return null

      const others = (g.produtos ?? []).flatMap((item) => {
        const p = item.produto as Product | number | null
        if (!p || typeof p !== 'object' || p._status === 'draft') return []
        const frasco = p.frasco as Media | number | null | undefined
        const image = LOCAL_BOTTLES.has(p.slug)
          ? `/produtos/${p.slug}.webp`
          : (typeof frasco === 'object' && frasco?.url) || '/brand/logo-juma-agro.png'
        const base = item.corFundo || '#062418'
        return [
          {
            name: p.nome,
            titleLines: lines(item.titulo),
            description: item.descricao ?? '',
            stats: stats(item.beneficios),
            base,
            mid: darker(base),
            accent: item.corDestaque || p.corRotulo || '#f2c94c',
            sizes: (p.embalagens ?? []) as string[],
            href: `/produtos/${p.slug}`,
            image,
          } satisfies ShowcaseProduct,
        ]
      })
      // O carrossel precisa de pelo menos 3 frascos (Aminosan + 2).
      if (others.length < 2) return null

      return {
        aminosan: {
          description: g.aminosan?.descricao || undefined,
          stats: stats(g.aminosan?.beneficios).length === 3 ? stats(g.aminosan?.beneficios) : undefined,
        },
        others,
      }
    } catch {
      return null
    }
  },
)
