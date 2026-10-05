import { resendAdapter } from '@payloadcms/email-resend'

/**
 * E-mail transacional do painel (docs/01-prd/painel-central.md, D3): só
 * recuperação de senha, convite de usuário e aviso de lead novo. Envio pelo
 * Resend, com o domínio juma-agro.com.br verificado lá.
 *
 * Sem RESEND_API_KEY (dev e testes), o Payload só escreve o e-mail no log.
 * EMAIL_TEST_TO desvia todos os envios para um endereço só.
 */

export const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM || 'painel@juma-agro.com.br'
export const EMAIL_FROM_NAME = 'Juma Agro'

/** Endereço do painel para links em e-mails que não nascem de um pedido do painel (aviso de lead). */
export function panelUrl() {
  const url =
    process.env.PAINEL_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    'http://localhost:3000'
  return url.replace(/\/$/, '')
}

/** Imagens do e-mail sempre do site no ar: o leitor de e-mail não enxerga localhost. */
export const EMAIL_ASSET_URL = (process.env.EMAIL_ASSET_URL || 'https://www.juma-agro.com.br').replace(/\/$/, '')

export function emailAdapter() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return undefined
  return resendAdapter({
    apiKey,
    defaultFromAddress: EMAIL_FROM_ADDRESS,
    defaultFromName: EMAIL_FROM_NAME,
    overrideRecipientAddress: process.env.EMAIL_TEST_TO || undefined,
  })
}
