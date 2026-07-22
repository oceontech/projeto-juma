'use client'

import { Link, usePathname } from '@/i18n/navigation'
import Image from 'next/image'

export function MobileLogo() {
  const pathname = usePathname()

  // Se for a home page ('/'), não renderiza a logo, 
  // pois a HeroJornada já possui a sua própria logo e comportamento
  if (pathname === '/') {
    return null
  }

  return (
    <Link
      href="/"
      aria-label="Juma Agro — início"
      className="absolute top-6 left-lg z-[45] xl:hidden pointer-events-auto"
    >
      <Image
        src="/brand/logo-juma-agro.png"
        alt="Juma Agro"
        width={90}
        height={90}
        priority
        className="object-cover object-top"
      />
    </Link>
  )
}
