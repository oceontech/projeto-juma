import type { Payload, PayloadRequest } from 'payload'

import { panelUrl } from './config'
import { inviteEmail, newLeadEmail, resetPasswordEmail, type LeadNotice } from './templates'

/** Convite vale mais que a troca de senha (1 hora): a pessoa pode demorar a abrir. */
export const INVITE_DAYS = 7

type UserDoc = { id: number | string; email: string; nome?: string | null; papel?: string | null; sites?: string[] | null }

/** Endereço do painel de onde veio o pedido, para o link cair no mesmo domínio. */
export function originOf(req?: Partial<PayloadRequest> | null) {
  const headers = req?.headers
  const host = headers?.get?.('x-forwarded-host') || headers?.get?.('host')
  if (!host) return panelUrl()
  let proto = headers?.get?.('x-forwarded-proto')?.split(',')[0]?.trim()
  if (!proto) {
    try {
      proto = new URL(req?.url ?? '').protocol.replace(':', '')
    } catch {
      proto = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https'
    }
  }
  return `${proto}://${host}`
}

const resetUrl = (req: Partial<PayloadRequest> | null | undefined, token: string) => `${originOf(req)}/admin/reset/${token}`

/** HTML e assunto do "Esqueci a senha" (usado no auth.forgotPassword da coleção Users). */
export function forgotPasswordContent({ req, token, user }: { req?: Partial<PayloadRequest>; token?: string; user?: unknown }) {
  return resetPasswordEmail({ user: (user ?? {}) as UserDoc, url: resetUrl(req, token ?? '') })
}

/**
 * Convite: gera um link de criar senha válido por INVITE_DAYS dias e manda
 * para a pessoa. Usa o mesmo fluxo da troca de senha do Payload (/admin/reset).
 */
export async function sendInvite({
  payload,
  req,
  user,
  invitedBy,
}: {
  payload: Payload
  req?: Partial<PayloadRequest>
  user: UserDoc
  invitedBy?: { nome?: string | null; email?: string | null } | null
}) {
  const token = await payload.forgotPassword({
    collection: 'users',
    data: { email: user.email },
    disableEmail: true,
    expiration: INVITE_DAYS * 24 * 60 * 60 * 1000,
    overrideAccess: true,
    req,
  })
  if (!token) throw new Error(`Usuário não encontrado para o convite: ${user.email}`)
  const { subject, html } = inviteEmail({ user, url: resetUrl(req, token), invitedBy, days: INVITE_DAYS })
  await payload.sendEmail({ to: user.email, subject, html })
}

/**
 * Aviso de lead novo para quem atende o site (perfil comercial com aquele
 * site). Sem ninguém do comercial, vai para os admins. Nunca derruba a gravação
 * do lead: falha de envio só vai para o log.
 */
export async function notifyNewLead(payload: Payload, lead: LeadNotice) {
  try {
    const team = await payload.find({
      collection: 'users',
      where: { and: [{ papel: { equals: 'comercial' } }, { sites: { in: [lead.site] } }] },
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })
    const people = team.docs.length
      ? team.docs
      : (await payload.find({ collection: 'users', where: { papel: { equals: 'admin' } }, limit: 50, depth: 0, overrideAccess: true })).docs
    const to = [...new Set(people.map((u) => u.email).filter(Boolean))]
    if (!to.length) return

    const { subject, html } = newLeadEmail({ lead, url: `${panelUrl()}/admin/collections/leads/${lead.id}` })
    await payload.sendEmail({ to, subject, html, ...(lead.email ? { replyTo: lead.email } : {}) })
  } catch (err) {
    payload.logger.error({ err, msg: `Falha ao avisar lead novo por e-mail (lead ${lead.id})` })
  }
}
