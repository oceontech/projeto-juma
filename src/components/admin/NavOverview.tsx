'use client'

import { useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Links "Visão geral" e "Analytics" no topo da sidebar (o Payload não lista
 * views próprias). No desktop a sidebar fica sempre aberta, como na referência.
 */
export function NavOverview() {
  const pathname = usePathname()
  const { navOpen, setNavOpen } = useNav()
  const active = pathname === '/admin' || pathname === '/admin/'
  const analytics = pathname.startsWith('/admin/analytics')

  useEffect(() => {
    if (!navOpen && window.innerWidth > 1024) setNavOpen(true)
  }, [navOpen, setNavOpen])

  return (
    <>
      <p className="juma-nav-label">Navegação</p>
      <Link href="/admin" className="nav__link" aria-current={active ? 'page' : undefined}>
        {active && <span className="nav__link-indicator" />}
        <span className="nav__link-label">Visão geral</span>
      </Link>
      <Link id="nav-analytics" href="/admin/analytics" className="nav__link" aria-current={analytics ? 'page' : undefined}>
        {analytics && <span className="nav__link-indicator" />}
        <span className="nav__link-label">Analytics</span>
      </Link>
    </>
  )
}
