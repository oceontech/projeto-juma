import { contact } from '@/config/site'

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

export function whatsappUrl(message: string) {
  return `${contact.whatsappHref}?text=${encodeURIComponent(message)}`
}
