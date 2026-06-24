/**
 * Dados institucionais da Juma Agro.
 *
 * Valores fixos (contato, redes, endereços) tirados de:
 *   docs/00-contexto/01-cliente-e-stakeholders.md
 *   docs/04-copy/07-contato-e-microcopy.md
 *
 * Por ora são constantes; na Fase 3 passam a vir das Settings do Payload.
 */

/** Chaves de navegação. O rótulo vem do next-intl (namespace `nav`); o href é o mesmo nos 3 locales. */
export const navLinks = [
  { key: 'home', href: '/' },
  { key: 'products', href: '/produtos' },
  { key: 'cultures', href: '/culturas' },
  { key: 'experience', href: '/juma-experience' },
  { key: 'about', href: '/sobre' },
  { key: 'articles', href: '/materias' },
] as const

/** Link externo de vagas (Sólides), abre em nova aba. */
export const jobsUrl = 'https://juma-agro.vagas.solides.com.br/'

/** Canais de contato. */
export const contact = {
  /** WhatsApp de conversão do site. */
  whatsappNumber: '+55 19 99964-8186',
  whatsappHref: 'https://wa.me/5519999648186',
  email: 'marketing@juma-agro.com.br',
  phone: '(19) 3891-6415',
  phoneHref: 'tel:+551938916415',
} as const

/** Redes sociais oficiais. */
export const socials = [
  { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/jumaagro/' },
  { key: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@jumaagro' },
  { key: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@Juma-Agro30/videos' },
  { key: 'linkedin', label: 'LinkedIn', href: 'https://br.linkedin.com/company/juma-agro' },
  { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/JumaAgro30/' },
] as const

/** Endereços. */
export const addresses = {
  br: {
    company: 'Juma Agro Indústria e Comércio Ltda',
    lines: ['R. Victor Acierini, 2.370 — Distrito Industrial', 'Mogi Guaçu - SP, CEP 13.849-106'],
  },
  us: {
    company: 'Juma-Agro Fertilizer LLC',
    lines: ['3928 Anchuca Drive, Suite 11', 'Lakeland, FL 33811'],
  },
} as const

export const legalName = 'Juma Agro Indústria e Comércio Ltda'
