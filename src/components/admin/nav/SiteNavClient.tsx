'use client'

import { useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Dropdown } from '../ui/Dropdown'
import { Flag } from '../ui/Flag'
import { setPanelSite, useAllowedSites, usePanelSite, type Choice } from '../ui/SitePicker'

export type NavItem = { kind: 'collection' | 'global'; slug: string; label: string; icon: string }

/**
 * O seletor grava a escolha num cookie que o controle de acesso lê
 * (src/access/roles.ts → bySite): Leads, Visão geral, Analytics e Blog mostram
 * só o site escolhido. Anda junto com o seletor de dentro das páginas.
 * O Blog abre o card, em destaque, em qualquer escolha (junta os dois sites).
 */
type BlogPerms = Record<'br' | 'us', { read: boolean; create: boolean }>
const NEW_POST = { br: '/admin/collections/articles/create', us: '/admin/collections/posts-us/create' }

function Globe() {
  return (
    <svg className="juma-globe" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  )
}

const OPTIONS = [
  { value: 'todos' as const, label: 'Todos os sites', hint: 'Leads e números juntos', icon: <Globe /> },
  { value: 'br' as const, label: 'Site Brasil', hint: 'Produtos, destaques, culturas, blog e contato', icon: <Flag site="br" size={18} /> },
  { value: 'us' as const, label: 'Site EUA', hint: 'Blog e contato', icon: <Flag site="us" size={18} /> },
]

const hrefOf = (item: NavItem) => `/admin/${item.kind === 'collection' ? 'collections' : 'globals'}/${item.slug}`

function NavLink({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link href={href} className="nav__link" data-icon={icon} aria-current={active ? 'page' : undefined} prefetch={false}>
      {active && <span className="nav__link-indicator" />}
      <span className="nav__link-label">{label}</span>
    </Link>
  )
}

export function SiteNavClient({
  initial,
  items,
  canSeeLeads,
  blog,
}: {
  initial: Choice
  items: Record<'br' | 'us', NavItem[]>
  canSeeLeads: boolean
  blog: BlogPerms
}) {
  const { navOpen, setNavOpen } = useNav()
  const router = useRouter()
  const pathname = usePathname()
  const [choice, setChoice] = usePanelSite(initial)

  // No desktop a sidebar fica sempre aberta, como na referência.
  useEffect(() => {
    if (!navOpen && window.innerWidth > 1024) setNavOpen(true)
  }, [navOpen, setNavOpen])

  const sites = useAllowedSites()
  const single = sites.length < 2
  const current: Choice = single ? (sites[0] ?? 'br') : choice
  const meta = OPTIONS.find((o) => o.value === current)!
  const siteItems = current === 'todos' ? [] : items[current]

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const blogScope = (current === 'todos' ? sites : [current]).filter((s) => blog[s].read)
  const blogActive = isActive('/admin/blog') || isActive('/admin/collections/articles') || isActive('/admin/collections/posts-us')
  // "+" cria no site do card; em "Todos" abre o Blog, onde se escolhe o site.
  const newPost = current !== 'todos' && blog[current].create ? NEW_POST[current] : null

  const choose = (value: Choice) => {
    setChoice(value)
    setPanelSite(value)
    // Numa tela do outro site, volta para a Visão geral.
    const onOtherSite = value !== 'todos' && (value === 'br' ? items.us : items.br).some((i) => isActive(hrefOf(i)))
    const onSiteScreen = value === 'todos' && [...items.br, ...items.us].some((i) => isActive(hrefOf(i)))
    if (onOtherSite || onSiteScreen) router.push('/admin')
    else router.refresh()
  }

  return (
    <>
      <div className={`jsn-card jsn-card--${current}`}>
        <Dropdown
          className="juma-site"
          tone="dark"
          label="Site exibido no painel"
          value={current}
          options={OPTIONS.filter((o) => (o.value === 'todos' ? !single : sites.includes(o.value)))}
          onChange={choose}
          disabled={single}
          trigger={
            <>
              {meta.icon}
              <span className="juma-site__text">{meta.label}</span>
              {!single && (
                <svg className="jdd__chevron" viewBox="0 0 24 24" aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </>
          }
        />
        {(siteItems.length > 0 || blogScope.length > 0) && (
          <nav className="jsn-card__links" aria-label={meta.label}>
            {blogScope.length > 0 && (
              <div className={`jsn-blog${blogActive ? ' is-active' : ''}`}>
                <NavLink href="/admin/blog" icon="blog" label="Blog" active={blogActive} />
                {newPost && (
                  <Link href={newPost} className="jsn-blog__new" title="Novo post" aria-label="Novo post" prefetch={false}>
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </Link>
                )}
              </div>
            )}
            {siteItems.map((item) => (
              <NavLink key={item.slug} href={hrefOf(item)} icon={item.icon} label={item.label} active={isActive(hrefOf(item))} />
            ))}
          </nav>
        )}
      </div>

      <nav className="jsn-general" aria-label="Painel">
        <NavLink href="/admin" icon="overview" label="Visão geral" active={pathname === '/admin' || pathname === '/admin/'} />
        {canSeeLeads && <NavLink href="/admin/collections/leads" icon="leads" label="Leads" active={isActive('/admin/collections/leads')} />}
        <NavLink href="/admin/analytics" icon="analytics" label="Analytics" active={isActive('/admin/analytics')} />
        <NavLink
          href="/admin/configuracoes"
          icon="settings"
          label="Configurações"
          active={isActive('/admin/configuracoes') || isActive('/admin/collections/users') || isActive('/admin/account')}
        />
      </nav>
    </>
  )
}
