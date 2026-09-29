// Só servidor: lê as Configurações do painel.
import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { DEFAULT_SETTINGS, digits, type SiteSettings } from './types'

type Locale = 'pt-BR' | 'en' | 'es'

const lines = (text?: string | null) =>
  (text ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

/**
 * Configurações do site no idioma pedido. Campo de contato vazio volta ao
 * padrão; redes só voltam ao padrão enquanto o painel nunca foi salvo (depois
 * disso, rede sem link é rede escondida).
 */
export const getSiteSettings = cache(async (locale: Locale): Promise<SiteSettings> => {
  try {
    const payload = await getPayload({ config })
    const [s, r] = await Promise.all([
      payload.findGlobal({ slug: 'settings', locale, fallbackLocale: 'pt-BR', depth: 0 }),
      payload.findGlobal({ slug: 'redes', depth: 0 }),
    ])
    const saved = Boolean(r.updatedAt)
    const d = DEFAULT_SETTINGS
    const whatsapp = s.whatsapp?.trim() || d.whatsappNumber
    const phone = s.telefone?.trim() || d.phone
    const br = s.enderecoBR
    const us = s.enderecoUS
    const redes = r as unknown as Record<string, string | null | undefined>

    return {
      whatsappNumber: whatsapp,
      whatsappHref: `https://wa.me/${digits(whatsapp)}`,
      phone,
      phoneHref: `tel:+${digits(phone).startsWith('55') ? '' : '55'}${digits(phone)}`,
      email: s.email?.trim() || d.email,
      emailPurchasing: s.emailCompras?.trim() || d.emailPurchasing,
      emailHr: s.emailRH?.trim() || d.emailHr,
      hours: lines(s.horario),
      addresses: {
        br: { company: br?.empresa?.trim() || d.addresses.br.company, lines: lines(br?.linhas).length ? lines(br?.linhas) : d.addresses.br.lines },
        us: { company: us?.empresa?.trim() || d.addresses.us.company, lines: lines(us?.linhas).length ? lines(us?.linhas) : d.addresses.us.lines },
      },
      mapQuery: s.mapa?.trim() || d.mapQuery,
      socials: saved
        ? d.socials.map((soc) => ({ ...soc, href: redes[soc.key]?.trim() ?? '' })).filter((soc) => soc.href)
        : d.socials,
    }
  } catch {
    // Build sem banco ou painel fora do ar: o site continua com os dados fixos.
    return DEFAULT_SETTINGS
  }
})
