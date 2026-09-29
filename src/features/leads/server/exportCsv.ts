import type { PayloadRequest, Where } from 'payload'

import { hasRole } from '../../../access/roles'

/**
 * `GET /api/leads/export`: planilha dos leads com os mesmos filtros da caixa
 * de entrada (status, busca, período) e o controle de acesso do usuário,
 * inclusive o site escolhido no seletor do painel.
 *
 * Separador `;` e BOM UTF-8: é o que o Excel em português abre direto, com
 * acentos e colunas certas.
 */

const STATUS: Record<string, string> = {
  novo: 'Novo',
  'em-contato': 'Em contato',
  qualificado: 'Qualificado',
  convertido: 'Convertido',
  descartado: 'Descartado',
}
const FORMS: Record<string, string> = {
  whatsapp: 'Pop-up WhatsApp',
  contato: 'Página de contato',
  trial: 'Trial',
  'trial-compact': 'Trial (LP)',
}

type Lead = Record<string, any>

const COLUMNS: [string, (l: Lead, users: Map<unknown, string>) => unknown][] = [
  ['Recebido em', (l) => new Date(l.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })],
  ['Site', (l) => (l.site === 'us' ? 'EUA' : 'Brasil')],
  ['Status', (l) => STATUS[l.status] ?? l.status],
  ['Responsável', (l, users) => (l.responsavel ? users.get(typeof l.responsavel === 'object' ? l.responsavel.id : l.responsavel) : '')],
  ['Nome', (l) => l.nome],
  ['Empresa / fazenda', (l) => l.empresa],
  ['E-mail', (l) => l.email],
  ['Telefone', (l) => l.telefone],
  ['Mensagem', (l) => l.mensagem],
  ['Formulário', (l) => FORMS[l.formulario] ?? l.formulario],
  ['Produto', (l) => l.contexto?.produto],
  ['Cultura', (l) => l.contexto?.cultura],
  ['Detalhe', (l) => l.contexto?.detalhe],
  ['Dados do formulário', (l) =>
    l.dados && typeof l.dados === 'object'
      ? Object.entries(l.dados)
          .filter(([, v]) => v !== null && v !== undefined && v !== '')
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
      : ''],
  ['Estado / região', (l) => l.geo?.regiao],
  ['Cidade', (l) => l.geo?.cidade],
  ['País', (l) => l.geo?.pais],
  ['Página', (l) => l.pagina],
  ['Idioma', (l) => l.locale],
  ['Variante A/B', (l) => l.variante],
  ['utm_source', (l) => l.rastreamento?.utmSource],
  ['utm_medium', (l) => l.rastreamento?.utmMedium],
  ['utm_campaign', (l) => l.rastreamento?.utmCampaign],
  ['Veio de (referrer)', (l) => l.rastreamento?.referrer],
  ['Aparelho', (l) => l.dispositivo?.tipo],
  ['Contato repetido', (l) => (l.duplicadoDe ? 'Sim' : 'Não')],
  ['Notas internas', (l) =>
    Array.isArray(l.notas) ? l.notas.map((n: Lead) => n.texto).filter(Boolean).join(' | ') : ''],
]

function cell(value: unknown) {
  if (value === null || value === undefined) return ''
  let s = String(value).replace(/\r?\n/g, ' ')
  // Evita que o Excel execute fórmula vinda de um campo do formulário.
  if (/^[=+\-@]/.test(s)) s = `'${s}`
  return /[;"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function exportLeadsCsv(req: PayloadRequest) {
  if (!req.user) return Response.json({ error: 'unauthorized' }, { status: 401 })
  if (!hasRole(req, 'admin', 'comercial')) return Response.json({ error: 'forbidden' }, { status: 403 })

  const url = new URL(req.url ?? '', 'http://x')
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search')?.trim()
  const days = Number(url.searchParams.get('dias')) || 0

  const and: Where[] = []
  if (status && STATUS[status]) and.push({ status: { equals: status } })
  if (search) and.push({ or: ['nome', 'email', 'telefone', 'empresa'].map((f) => ({ [f]: { like: search } })) })
  if (days > 0) and.push({ createdAt: { greater_than_equal: new Date(Date.now() - days * 86_400_000).toISOString() } })

  const [{ docs }, users] = await Promise.all([
    req.payload.find({
      collection: 'leads',
      where: and.length ? { and } : undefined,
      sort: '-createdAt',
      limit: 10_000,
      pagination: false,
      depth: 0,
      req,
      overrideAccess: false,
    }),
    req.payload.find({ collection: 'users', limit: 200, depth: 0, pagination: false, overrideAccess: true }),
  ])
  const userName = new Map<unknown, string>(users.docs.map((u) => [u.id, u.nome || u.email]))

  const lines = [
    COLUMNS.map(([h]) => h).join(';'),
    ...(docs as Lead[]).map((l) => COLUMNS.map(([, get]) => cell(get(l, userName))).join(';')),
  ]
  const stamp = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }).split('/').reverse().join('-')

  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="leads-juma-${stamp}.csv"`,
      'cache-control': 'no-store',
    },
  })
}
