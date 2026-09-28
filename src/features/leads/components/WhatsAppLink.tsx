'use client'

import type { AnchorHTMLAttributes } from 'react'

import { contact } from '@/config/site'

import { whatsappUrl, type LeadContext } from '../whatsapp'
import { useLead } from './LeadProvider'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> & {
  context?: LeadContext
}

/**
 * CTA de WhatsApp do site (ADR-005): o clique abre o pop-up de lead, que grava
 * o contato e só então leva à conversa. Sem JS, o link funciona direto.
 */
export function WhatsAppLink({ context, onClick, children, ...rest }: Props) {
  const lead = useLead()
  const href = lead ? whatsappUrl(lead.messageFor(context)) : contact.whatsappHref

  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || !lead) return
        // Ctrl/Cmd-clique continua abrindo o link direto, como o usuário pediu.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        lead.openWhatsApp(context)
      }}
    >
      {children}
    </a>
  )
}
