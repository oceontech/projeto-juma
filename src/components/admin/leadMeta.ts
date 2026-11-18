/** Rótulos e cores dos leads, compartilhados por todas as telas do painel. */

/**
 * Quem usa o painel não acompanha a venda: recebe o contato e passa para o
 * comercial (ou RH, ou compras). Por isso a situação só diz se o lead já foi
 * passado adiante e se alguém confirmou que ele foi atendido.
 */
export const LEAD_STATUS = [
  { value: 'novo', label: 'Aguardando envio', bg: '#dcfce7', fg: '#166534', dot: '#22c55e' },
  { value: 'enviado', label: 'Enviado ao comercial', bg: '#dbeafe', fg: '#1e40af', dot: '#3b82f6' },
  { value: 'resolvido', label: 'Resolvido', bg: '#004c26', fg: '#ffffff', dot: '#004c26' },
  { value: 'descartado', label: 'Descartado', bg: '#f4f4f5', fg: '#71717a', dot: '#a1a1aa' },
] as const

export type LeadStatus = (typeof LEAD_STATUS)[number]['value']

export const statusMeta = (value: unknown) => LEAD_STATUS.find((s) => s.value === value) ?? LEAD_STATUS[0]

/** Já passou para a equipe certa (conta no tempo de envio). */
export const FORWARDED: readonly LeadStatus[] = ['enviado', 'resolvido']

/**
 * As 3 situações da caixa de entrada: passar adiante quem chegou, ver o que
 * já foi enviado e guardar o que acabou (resolvido ou descartado).
 */
export const LEAD_STAGES = [
  { value: 'aguardando', label: 'Aguardando envio', statuses: ['novo'], dot: '#22c55e', empty: 'Nenhum contato esperando envio. Tudo em dia.' },
  { value: 'enviados', label: 'Enviados', statuses: ['enviado'], dot: '#3b82f6', empty: 'Nenhum contato enviado esperando confirmação.' },
  { value: 'encerrados', label: 'Encerrados', statuses: ['resolvido', 'descartado'], dot: '#a1a1aa', empty: 'Nada encerrado ainda.' },
] as const

export type LeadStage = (typeof LEAD_STAGES)[number]['value'] | 'todos'

export const stageOf = (status: unknown): Exclude<LeadStage, 'todos'> =>
  LEAD_STAGES.find((s) => (s.statuses as readonly string[]).includes(String(status)))?.value ?? 'aguardando'

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

/**
 * Para quem vai cada tipo de contato: vaga vai para o RH, fornecedor para
 * compras, o resto para o comercial. `team` completa "Enviado ao/a…".
 */
const SEND_TO: Record<string, { team: string; sent: string }> = {
  emprego: { team: 'RH', sent: 'Enviado ao RH' },
  fornecedor: { team: 'compras', sent: 'Enviado a compras' },
}
export const sendTo = (tipo: unknown) => SEND_TO[String(tipo)] ?? { team: 'comercial', sent: 'Enviado ao comercial' }

/** Nome da situação conforme o tipo ("Enviado ao RH" em vez de "Enviado ao comercial" para vaga). */
export function statusLabel(status: unknown, tipo: unknown) {
  if (status === 'enviado') return sendTo(tipo).sent
  return statusMeta(status).label
}

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

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name

/** Número com código do país, para o link do WhatsApp e o telefone. */
export function intlPhone(site: 'br' | 'us', digits: string | null | undefined) {
  if (!digits) return null
  const d = digits.replace(/\D/g, '')
  if (site === 'br' && (d.length === 10 || d.length === 11)) return `55${d}`
  if (site === 'us' && d.length === 10) return `1${d}`
  return d || null
}

/** Primeira mensagem pronta para responder o lead. */
export function leadGreeting(lead: { nome: string; site: 'br' | 'us'; tipo?: string | null; produto?: string | null }) {
  const name = firstName(lead.nome)
  if (lead.site === 'us') return `Hi ${name}, this is Juma-Agro. Thanks for reaching out through our website${lead.produto ? ` about ${lead.produto}` : ''}.`
  if (lead.tipo === 'emprego') return `Olá, ${name}! Aqui é da Juma Agro. Recebemos seu contato pelo site sobre vagas.`
  if (lead.tipo === 'fornecedor' || lead.tipo === 'outro') return `Olá, ${name}! Aqui é da Juma Agro. Recebemos sua mensagem pelo site.`
  return `Olá, ${name}! Aqui é da Juma Agro. Recebemos seu contato pelo site${lead.produto ? ` sobre o ${lead.produto}` : ''}. Como podemos ajudar?`
}

/** Texto pronto para colar no WhatsApp ou e-mail de quem vai atender o lead. */
export function leadSummary(lead: {
  nome: string
  site: 'br' | 'us'
  empresa?: string | null
  telefone?: string | null
  email?: string | null
  tipo?: string | null
  produto?: string | null
  cultura?: string | null
  mensagem?: string | null
  local?: string | null
  createdAt: string
}) {
  const phone = intlPhone(lead.site, lead.telefone)
  const lines: [string, string | null | undefined][] = [
    ['Nome', lead.nome],
    ['Empresa', lead.empresa],
    ['Telefone', phone ? `+${phone}` : null],
    ['E-mail', lead.email],
    ['Assunto', tipoMeta(lead.tipo)?.long],
    ['Produto', lead.produto],
    ['Cultura', lead.cultura],
    ['Local', lead.local],
    ['Mensagem', lead.mensagem],
  ]
  const when = new Date(lead.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })
  return [
    `Contato pelo site ${lead.site === 'us' ? 'dos EUA' : 'do Brasil'} (${when})`,
    ...lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
  ].join('\n')
}

/** "3 h", "2 dias": há quanto tempo (para quem espera resposta). */
export function waitingFor(iso: string, now = Date.now()) {
  const h = (now - new Date(iso).getTime()) / 3_600_000
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`
  if (h < 48) return `${Math.round(h)} h`
  return `${Math.round(h / 24)} dias`
}

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
