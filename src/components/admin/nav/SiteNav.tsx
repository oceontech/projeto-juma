import { cookies } from 'next/headers'
import type { SanitizedPermissions } from 'payload'

import type { Choice } from '../ui/SitePicker'
import { SiteNavClient, type NavItem } from './SiteNavClient'

/**
 * Sidebar do painel. No alto, o card do site escolhido: o seletor e, dentro
 * dele, só o que é daquele site. Abaixo, o que vale para os dois (Visão geral,
 * Leads, Analytics, Configurações do painel). Cada botão só aparece para
 * quem pode usar a tela (perfil do usuário).
 */

const BR: NavItem[] = [
  { kind: 'collection', slug: 'products', label: 'Produtos', icon: 'products' },
  { kind: 'global', slug: 'destaques', label: 'Destaques da home', icon: 'destaques' },
  { kind: 'collection', slug: 'cultures', label: 'Culturas', icon: 'cultures' },
  { kind: 'global', slug: 'settings', label: 'Contato', icon: 'contact' },
  { kind: 'global', slug: 'redes', label: 'Redes sociais', icon: 'social' },
]

const US: NavItem[] = [
  { kind: 'global', slug: 'settings-us', label: 'Contato', icon: 'contact' },
  { kind: 'global', slug: 'redes-us', label: 'Redes sociais', icon: 'social' },
]

function allowed(items: NavItem[], permissions?: SanitizedPermissions) {
  return items.filter((item) =>
    item.kind === 'collection'
      ? permissions?.collections?.[item.slug]?.read
      : // Os globais são públicos para o site ler; no painel, aparece para quem pode editar.
        permissions?.globals?.[item.slug]?.update,
  )
}

export async function SiteNav({ permissions }: { permissions?: SanitizedPermissions }) {
  const value = (await cookies()).get('painel_site')?.value
  const initial: Choice = value === 'br' || value === 'us' ? value : 'todos'
  return (
    <SiteNavClient
      initial={initial}
      items={{ br: allowed(BR, permissions), us: allowed(US, permissions) }}
      canSeeLeads={Boolean(permissions?.collections?.leads?.read)}
      blog={{
        br: { read: Boolean(permissions?.collections?.articles?.read), create: Boolean(permissions?.collections?.articles?.create) },
        us: { read: Boolean(permissions?.collections?.['posts-us']?.read), create: Boolean(permissions?.collections?.['posts-us']?.create) },
      }}
    />
  )
}
