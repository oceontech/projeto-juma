import { headers } from 'next/headers'
import type { ListViewServerProps, Where } from 'payload'

import { inboxWhere } from '../../../features/leads/server/inboxWhere'
import { LEAD_STAGES, LEAD_TIPOS, type LeadStage } from '../leadMeta'
import { LeadsInboxClient, type InboxLead } from './LeadsInboxClient'

/**
 * Leads como caixa de entrada (substitui a lista padrão do Payload): quem
 * escreveu, o que quer e como responder. Filtros próprios na URL (`etapa`,
 * `tipo`, `busca`, `pagina`), com o mesmo controle de acesso do painel,
 * incluindo o site escolhido no seletor.
 */
const PER_PAGE = 25

export async function LeadsInbox(props: ListViewServerProps) {
  const { payload, user, searchParams, hasCreatePermission } = props
  const req = { headers: await headers(), user: user ?? null } as never

  const params = (searchParams ?? {}) as Record<string, string | undefined>
  const search = typeof params.busca === 'string' ? params.busca : ''
  const tipo = typeof params.tipo === 'string' ? params.tipo : 'todos'
  const page = Math.max(1, Number(params.pagina) || 1)

  const count = async (and: Where[]) =>
    (await payload.count({ collection: 'leads', where: and.length ? { and } : undefined, req, overrideAccess: false })).totalDocs

  // Contagem por situação (com a busca e o tipo escolhidos) e por tipo (na situação escolhida).
  const stageCounts = Object.fromEntries(
    await Promise.all(
      [...LEAD_STAGES.map((s) => s.value), 'todos'].map(async (v) => [v, await count(inboxWhere({ etapa: v, tipo, search }))] as const),
    ),
  ) as Record<string, number>
  // Sem escolha, abre em "Para responder" (se houver alguém esperando); senão, em "Todos".
  const etapa = (typeof params.etapa === 'string' ? params.etapa : stageCounts.responder > 0 ? 'responder' : 'todos') as LeadStage
  const tipoCounts = Object.fromEntries(
    await Promise.all(
      [...LEAD_TIPOS.map((t) => t.value), 'sem', 'todos'].map(async (v) => [v, await count(inboxWhere({ etapa, tipo: v, search }))] as const),
    ),
  ) as Record<string, number>

  const and = inboxWhere({ etapa, tipo, search })
  const data = await payload.find({
    collection: 'leads',
    where: and.length ? { and } : undefined,
    sort: '-createdAt',
    limit: PER_PAGE,
    page,
    depth: 0,
    req,
    overrideAccess: false,
  })

  const users = await payload.find({ collection: 'users', limit: 100, depth: 0, pagination: false, overrideAccess: true })
  const userName = new Map(users.docs.map((u) => [u.id, u.nome || u.email.split('@')[0]]))
  const nameOf = (ref: unknown) => {
    const id = typeof ref === 'object' && ref ? (ref as { id: number }).id : ref
    return id ? (userName.get(id as number) ?? null) : null
  }

  const leads: InboxLead[] = (data.docs as Record<string, any>[]).map((d) => ({
    id: d.id,
    nome: d.nome,
    empresa: d.empresa ?? null,
    email: d.email ?? null,
    telefone: d.telefone ?? null,
    mensagem: d.mensagem ?? null,
    site: d.site,
    status: d.status,
    tipo: d.tipo ?? null,
    formulario: d.formulario ?? null,
    produto: d.contexto?.produto ?? null,
    cultura: d.contexto?.cultura ?? null,
    detalhe: d.contexto?.detalhe ?? null,
    pagina: d.pagina ?? null,
    local: [d.geo?.cidade, d.geo?.regiao].filter(Boolean).join(', ') || null,
    dados: d.dados && typeof d.dados === 'object' ? (d.dados as Record<string, unknown>) : null,
    notas: (d.notas ?? []).map((n: Record<string, any>) => ({ id: n.id, texto: n.texto, data: n.data ?? null, autor: nameOf(n.autor) })),
    responsavel: nameOf(d.responsavel),
    duplicado: Boolean(d.duplicadoDe),
    createdAt: d.createdAt,
  }))

  return (
    <LeadsInboxClient
      leads={leads}
      stageCounts={stageCounts}
      tipoCounts={tipoCounts}
      etapa={etapa}
      tipo={tipo}
      search={search}
      page={data.page ?? 1}
      totalPages={data.totalPages ?? 1}
      totalDocs={data.totalDocs ?? leads.length}
      canCreate={hasCreatePermission}
      canExport={['admin', 'comercial'].includes((user as { papel?: string } | null)?.papel ?? '')}
    />
  )
}
