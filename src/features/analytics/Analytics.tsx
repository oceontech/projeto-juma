import Script from 'next/script'

/**
 * Umami (instalado pela Oceon em juma-stats.vercel.app): sem cookies, então
 * não precisa de banner de consentimento. Só carrega com as variáveis de
 * ambiente definidas, e `data-domains` ignora previews e localhost.
 */
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  if (!src || !id) return null
  return (
    <Script
      src={src}
      data-website-id={id}
      data-domains={process.env.NEXT_PUBLIC_UMAMI_DOMAINS || undefined}
      strategy="afterInteractive"
    />
  )
}
