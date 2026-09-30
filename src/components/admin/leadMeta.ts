/** Rótulos e cores dos leads, compartilhados por todas as telas do painel. */

export const LEAD_STATUS = [
  { value: 'novo', label: 'Para responder', bg: '#dcfce7', fg: '#166534', dot: '#22c55e' },
  { value: 'em-contato', label: 'Em conversa', bg: '#fef3c7', fg: '#92400e', dot: '#f59e0b' },
  { value: 'qualificado', label: 'Negociando', bg: '#dbeafe', fg: '#1e40af', dot: '#3b82f6' },
  { value: 'convertido', label: 'Virou cliente', bg: '#004c26', fg: '#ffffff', dot: '#004c26' },
  { value: 'descartado', label: 'Arquivado', bg: '#f4f4f5', fg: '#71717a', dot: '#a1a1aa' },
] as const

export type LeadStatus = (typeof LEAD_STATUS)[number]['value']

export const statusMeta = (value: unknown) => LEAD_STATUS.find((s) => s.value === value) ?? LEAD_STATUS[0]

/**
 * As 3 situações da caixa de entrada: responder quem chegou, acompanhar quem
 * está em conversa e guardar o que acabou (virou cliente ou foi arquivado).
 */
export const LEAD_STAGES = [
  { value: 'responder', label: 'Para responder', statuses: ['novo'], dot: '#22c55e', empty: 'Ninguém esperando resposta. Tudo em dia.' },
  { value: 'conversa', label: 'Em conversa', statuses: ['em-contato', 'qualificado'], dot: '#f59e0b', empty: 'Nenhuma conversa em andamento.' },
  { value: 'encerrados', label: 'Encerrados', statuses: ['convertido', 'descartado'], dot: '#a1a1aa', empty: 'Nada encerrado ainda.' },
] as const

export type LeadStage = (typeof LEAD_STAGES)[number]['value'] | 'todos'

export const stageOf = (status: unknown): Exclude<LeadStage, 'todos'> =>
  LEAD_STAGES.find((s) => (s.statuses as readonly string[]).includes(String(status)))?.value ?? 'responder'

/** Quem é e o que quer. `sem` = ainda sem tipo (a classificar). */
export const LEAD_TIPOS = [
  { value: 'cliente', label: 'Cliente', long: 'Cliente / produtor', icon: '🌱', bg: '#ecfdf5', fg: '#047857' },
  { value: 'revenda', label: 'Revenda', long: 'Revenda / distribuidor', icon: '🏪', bg: '#eff6ff', fg: '#1d4ed8' },
  { value: 'emprego', label: 'Vaga', long: 'Vaga de emprego', icon: '💼', bg: '#faf5ff', fg: '#7e22ce' },
  { value: 'fornecedor', label: 'Fornecedor', long: 'Fornecedor / serviço', icon: '📦', bg: '#fff7ed', fg: '#c2410c' },
  { value: 'outro', label: 'Outro', long: 'Outro assunto', icon: '💬', bg: '#f4f4f5', fg: '#52525b' },
] as const

export type LeadTipoValue = (typeof LEAD_TIPOS)[number]['value']

export const tipoMeta = (value: unknown) => LEAD_TIPOS.find((t) => t.value === value) ?? null

export const LEAD_FORMS: Record<string, string> = {
  whatsapp: 'Botão do WhatsApp',
  contato: 'Página de contato',
  trial: 'Pedido de teste',
  'trial-compact': 'Pedido de teste (LP)',
}

export const SITE_META = {
  br: { label: 'Brasil', short: 'BR', gradient: 'linear-gradient(145deg,#22c55e,#15803d)' },
  us: { label: 'Estados Unidos', short: 'US', gradient: 'linear-gradient(145deg,#60a5fa,#1d4ed8)' },
} as const

/** "há 5 min", "ontem", "12 set" */
export function relativeDate(iso: string, now = Date.now()) {
  const diff = now - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.round(h / 24)
  if (d === 1) return 'ontem'
  if (d < 7) return `há ${d} dias`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}
