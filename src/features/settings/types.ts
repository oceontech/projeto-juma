import { addresses, contact, socials } from '@/config/site'

/** Contato e redes do site, já prontos para exibir (vêm das Configurações do painel). */
export type SiteSettings = {
  whatsappNumber: string
  whatsappHref: string
  phone: string
  phoneHref: string
  email: string
  emailPurchasing: string
  emailHr: string
  /** Linhas do horário; vazio usa o texto padrão (messages). */
  hours: string[]
  addresses: { br: { company: string; lines: string[] }; us: { company: string; lines: string[] } }
  mapQuery: string
  socials: { key: string; label: string; href: string }[]
}

export const digits = (s: string) => s.replace(/\D/g, '')

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: contact.whatsappNumber,
  whatsappHref: contact.whatsappHref,
  phone: contact.phone,
  phoneHref: contact.phoneHref,
  email: contact.email,
  emailPurchasing: 'analucia@juma-agro.com.br',
  emailHr: 'rh@juma-agro.com.br',
  hours: [],
  addresses: {
    br: { company: addresses.br.company, lines: [...addresses.br.lines] },
    us: { company: addresses.us.company, lines: [...addresses.us.lines] },
  },
  mapQuery: 'Juma Agro, R. Victor Acierini, 2370, Mogi Guaçu - SP',
  socials: socials.map((s) => ({ ...s })),
}

/** "+55 19 99964-8186" → "(19) 99964-8186": número brasileiro sem o DDI. */
export function localPhone(number: string) {
  const d = digits(number)
  if (d.length === 13 && d.startsWith('55')) return `(${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`
  if (d.length === 12 && d.startsWith('55')) return `(${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`
  return number
}
