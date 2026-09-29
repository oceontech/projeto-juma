'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * "← Voltar para …" no alto das telas internas (item aberto, versões, conta),
 * no lugar da trilha "⌂ / Mídia / arquivo" do Payload. Nas telas da sidebar
 * não aparece: a própria sidebar já é o caminho.
 */
const LIST_LABEL: Record<string, string> = {
  products: 'Produtos',
  cultures: 'Culturas',
  articles: 'Blog',
  'posts-us': 'Blog',
  leads: 'Leads',
  media: 'Mídia',
  users: 'Usuários',
}
const GLOBAL_LABEL: Record<string, string> = {
  destaques: 'Destaques da home',
  settings: 'Contato',
  'settings-us': 'Contato',
  redes: 'Redes sociais',
  'redes-us': 'Redes sociais',
}

function target(pathname: string): { href: string; label: string } | null {
  const parts = pathname.replace(/\/$/, '').split('/').filter(Boolean) // ['admin', 'collections', 'media', '12']
  if (parts[0] !== 'admin') return null
  const [, section, slug, id, sub] = parts

  if (section === 'account') return { href: '/admin/configuracoes', label: 'Configurações' }
  if (section === 'collections' && slug) {
    // Matérias e posts-us têm a lista junta em /admin/blog.
    const blog = slug === 'articles' || slug === 'posts-us'
    const list = blog ? { href: '/admin/blog', label: 'Blog' } : { href: `/admin/collections/${slug}`, label: LIST_LABEL[slug] ?? 'a lista' }
    if (!id) {
      // A lista de usuários fica dentro de Configurações; Mídia não está na sidebar.
      if (slug === 'users') return { href: '/admin/configuracoes', label: 'Configurações' }
      if (slug === 'media') return { href: '/admin', label: 'Visão geral' }
      return null
    }
    if (sub === 'versions' && parts[5]) return { href: `/admin/collections/${slug}/${id}/versions`, label: 'versões' }
    if (sub === 'versions' || sub === 'api') return { href: `/admin/collections/${slug}/${id}`, label: 'o item' }
    return list
  }
  if (section === 'globals' && slug && id === 'versions') {
    return parts[4]
      ? { href: `/admin/globals/${slug}/versions`, label: 'versões' }
      : { href: `/admin/globals/${slug}`, label: GLOBAL_LABEL[slug] ?? 'a tela' }
  }
  return null
}

export function BackButton() {
  const pathname = usePathname()
  const to = target(pathname)
  if (!to) return null
  return (
    <Link href={to.href} className="jback" prefetch={false}>
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Voltar para {to.label}
    </Link>
  )
}
