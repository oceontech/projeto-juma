import type { Where } from 'payload'

import { LEAD_STAGES, LEAD_TIPOS } from '../../../components/admin/leadMeta'

/**
 * Filtro da caixa de entrada de leads, o mesmo para a lista e para a planilha:
 * situação (para responder, em conversa, encerrados), tipo de contato e busca.
 */
export function inboxWhere({ etapa, tipo, search }: { etapa?: string | null; tipo?: string | null; search?: string | null }): Where[] {
  const and: Where[] = []
  const stage = LEAD_STAGES.find((s) => s.value === etapa)
  if (stage) and.push({ status: { in: [...stage.statuses] } })
  if (tipo === 'sem') and.push({ tipo: { exists: false } })
  else if (LEAD_TIPOS.some((t) => t.value === tipo)) and.push({ tipo: { equals: tipo } })
  const term = search?.trim()
  if (term) and.push({ or: ['nome', 'email', 'telefone', 'empresa', 'mensagem'].map((f) => ({ [f]: { like: term } })) })
  return and
}
