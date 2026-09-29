/**
 * Contexto do clique no WhatsApp. Vai para o lead (campo `contexto`) e escolhe
 * a mensagem pré-preenchida (docs/04-copy/07-contato-e-microcopy.md).
 */
export type LeadContext = {
  produto?: string
  cultura?: string
  /** Outras origens: título de matéria, "experience"… */
  detalhe?: string
  tipo?: 'experience'
}

/** `href` é o link do WhatsApp das Configurações (`useSiteSettings().whatsappHref`). */
export function whatsappUrl(href: string, message: string) {
  return `${href}?text=${encodeURIComponent(message)}`
}
