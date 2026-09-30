'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

import { Engagement } from './Engagement'

/** Script do Umami, fora da prévia do painel (a matéria em edição não é visita). */
export function Tracker({ src, id, domains }: { src: string; id: string; domains?: string }) {
  const pathname = usePathname()
  if (pathname.includes('/materias/previa')) return null
  return (
    <>
      <Script src={src} data-website-id={id} data-domains={domains || undefined} strategy="afterInteractive" />
      <Engagement />
    </>
  )
}
