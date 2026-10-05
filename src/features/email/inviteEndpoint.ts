import crypto from 'crypto'
import { addDataAndFileToRequest, type PayloadHandler } from 'payload'

import { ROLES, SITES, hasRole, type Role, type Site } from '../../access/roles'
import { sendInvite } from './send'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * POST /api/users/invite (só admin). Cria a pessoa com uma senha aleatória que
 * ninguém conhece e manda o convite para ela criar a dela. Se o e-mail já está
 * cadastrado e a pessoa nunca entrou, reenvia o convite.
 */
export const inviteHandler: PayloadHandler = async (req) => {
  if (!hasRole(req, 'admin')) return Response.json({ ok: false, error: 'Só admin convida pessoas.' }, { status: 403 })

  await addDataAndFileToRequest(req)
  const body = (req.data ?? {}) as { nome?: string; email?: string; papel?: string; sites?: string[] }
  const nome = body.nome?.trim().slice(0, 120) || undefined
  const email = body.email?.trim().toLowerCase()
  const papel = body.papel as Role
  const sites = (Array.isArray(body.sites) ? body.sites : []).filter((s): s is Site => SITES.includes(s as Site))

  const errors: Record<string, string> = {}
  if (!email || !EMAIL.test(email)) errors.email = 'Informe um e-mail válido.'
  if (!ROLES.includes(papel)) errors.papel = 'Escolha um perfil.'
  if (papel !== 'admin' && !sites.length) errors.sites = 'Escolha ao menos um site.'
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 400 })

  const { payload } = req
  const existing = (
    await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true })
  ).docs[0]

  if (existing) {
    if (existing.ultimoAcesso) {
      return Response.json({ ok: false, errors: { email: 'Esta pessoa já tem acesso ao painel.' } }, { status: 409 })
    }
    try {
      await sendInvite({ payload, req, user: existing, invitedBy: req.user })
      return Response.json({ ok: true, resent: true, id: existing.id })
    } catch (err) {
      payload.logger.error({ err, msg: `Falha ao reenviar convite para ${email}` })
      return Response.json({ ok: false, error: 'Não foi possível enviar o e-mail agora. Tente de novo em instantes.' }, { status: 502 })
    }
  }

  const user = await payload.create({
    collection: 'users',
    data: {
      email: email!,
      nome,
      papel,
      sites: papel === 'admin' ? [...SITES] : sites,
      password: crypto.randomBytes(24).toString('base64url'),
    },
    overrideAccess: true,
    context: { invite: false },
  })

  try {
    await sendInvite({ payload, req, user, invitedBy: req.user })
    return Response.json({ ok: true, id: user.id }, { status: 201 })
  } catch (err) {
    payload.logger.error({ err, msg: `Falha ao enviar convite para ${email}` })
    return Response.json(
      { ok: true, id: user.id, emailFailed: true, error: 'A pessoa foi cadastrada, mas o e-mail não saiu. Use "Convidar" de novo para reenviar.' },
      { status: 201 },
    )
  }
}
