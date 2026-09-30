import { Tracker } from './Tracker'

/**
 * Umami (instalado pela Oceon em juma-stats.vercel.app): sem cookies, então
 * não precisa de banner de consentimento. Só carrega com as variáveis de
 * ambiente definidas, e `data-domains` ignora previews e localhost. Quem usa
 * o painel fica de fora (o cabeçalho do painel marca o navegador).
 */
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  if (!src || !id) return null
  return <Tracker src={src} id={id} domains={process.env.NEXT_PUBLIC_UMAMI_DOMAINS} />
}
