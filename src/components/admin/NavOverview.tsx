'use client'

import { useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Marca da Juma no topo da sidebar e o link "Visão geral" (o Payload não lista
 * o dashboard). No desktop a sidebar fica sempre aberta, como na referência.
 */
export function NavOverview() {
  const pathname = usePathname()
  const { navOpen, setNavOpen } = useNav()
  const active = pathname === '/admin' || pathname === '/admin/'

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
    </>
  )
}
