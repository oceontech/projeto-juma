'use client'

import { useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Links fixos do topo da sidebar: Visão geral, Leads e Analytics valem para os
 * dois sites (seguem o seletor). O grupo "Operação" do Payload fica escondido
 * para os leads não aparecerem duas vezes. No desktop a sidebar fica sempre
 * aberta, como na referência.
 */
export function NavOverview() {
  const pathname = usePathname()
  const { navOpen, setNavOpen } = useNav()
  const active = pathname === '/admin' || pathname === '/admin/'
  const analytics = pathname.startsWith('/admin/analytics')
  const leads = pathname.startsWith('/admin/collections/leads')

  useEffect(() => {
    if (!navOpen && window.innerWidth > 1024) setNavOpen(true)
  }, [navOpen, setNavOpen])

  return (
    <>
      <Link href="/admin" className="nav__link" aria-current={active ? 'page' : undefined}>
        {active && <span className="nav__link-indicator" />}
        <span className="nav__link-label">Visão geral</span>
      </Link>
      <Link id="nav-leads-top" href="/admin/collections/leads" className="nav__link" aria-current={leads ? 'page' : undefined}>
        {leads && <span className="nav__link-indicator" />}
        <span className="nav__link-label">Leads</span>
      </Link>
      <Link id="nav-analytics" href="/admin/analytics" className="nav__link" aria-current={analytics ? 'page' : undefined}>
        {analytics && <span className="nav__link-indicator" />}
        <span className="nav__link-label">Analytics</span>
      </Link>
    </>
  )
}
