import { headers } from 'next/headers'
import type { ListViewServerProps, Where } from 'payload'

import { LEAD_STATUS } from '../leadMeta'
import { LeadsInboxClient, type InboxLead } from './LeadsInboxClient'

/**
 * Lista de leads como caixa de entrada (substitui a lista padrão do Payload).
 * Os leads vêm de `data`, que o Payload já consultou a partir da URL (status,
 * busca, página) com o controle de acesso aplicado. As contagens das abas usam
 * o mesmo filtro de acesso, incluindo o site escolhido na sidebar.
 */
export async function LeadsInbox(props: ListViewServerProps) {
  const { data, payload, user, searchParams, hasCreatePermission } = props
  const req = { headers: await headers(), user: user ?? null }

  const params = (searchParams ?? {}) as Record<string, unknown>
  const where = params.where as { status?: { equals?: string } } | undefined
  const currentStatus = where?.status?.equals ?? 'todos'
  const search = typeof params.search === 'string' ? params.search : ''

  const searchWhere: Where | undefined = search
    ? { or: ['nome', 'email', 'telefone', 'empresa'].map((f) => ({ [f]: { like: search } })) }
    : undefined
  const count = async (status?: string) =>
    (
      await payload.count({
        collection: 'leads',
        where: { and: [...(status ? [{ status: { equals: status } }] : []), ...(searchWhere ? [searchWhere] : [])] },
        req: req as never,
        overrideAccess: false,
      })
    ).totalDocs
  const counts = Object.fromEntries(
    await Promise.all([['todos', await count()] as const, ...LEAD_STATUS.map(async (s) => [s.value, await count(s.value)] as const)]),
  ) as Record<string, number>

  const users = await payload.find({ collection: 'users', limit: 100, depth: 0, pagination: false, overrideAccess: true })
  const userName = new Map(users.docs.map((u) => [u.id, u.nome || u.email.split('@')[0]]))

  const leads: InboxLead[] = (data.docs as Record<string, any>[]).map((d) => ({
    id: d.id,
    nome: d.nome,
    empresa: d.empresa ?? null,
    email: d.email ?? null,
    telefone: d.telefone ?? null,
    site: d.site,
    status: d.status,
    formulario: d.formulario ?? null,
    interesse: d.contexto?.produto || d.contexto?.cultura || null,
    regiao: d.geo?.regiao ?? null,
    responsavel: d.responsavel ? (userName.get(typeof d.responsavel === 'object' ? d.responsavel.id : d.responsavel) ?? null) : null,
    duplicado: Boolean(d.duplicadoDe),
    createdAt: d.createdAt,
  }))

  return (
    <LeadsInboxClient
      leads={leads}
      counts={counts}
      currentStatus={currentStatus}
      search={search}
      page={data.page ?? 1}
      totalPages={data.totalPages ?? 1}
      totalDocs={data.totalDocs ?? leads.length}
      canCreate={hasCreatePermission}
      canExport={['admin', 'comercial'].includes((user as { papel?: string } | null)?.papel ?? '')}
    />
  )
}
