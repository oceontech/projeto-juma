/** Rótulos e cores dos leads, compartilhados por todas as telas do painel. */

export const LEAD_STATUS = [
  { value: 'novo', label: 'Novo', bg: '#dcfce7', fg: '#166534', dot: '#22c55e' },
  { value: 'em-contato', label: 'Em contato', bg: '#fef3c7', fg: '#92400e', dot: '#f59e0b' },
  { value: 'qualificado', label: 'Qualificado', bg: '#dbeafe', fg: '#1e40af', dot: '#3b82f6' },
  { value: 'convertido', label: 'Convertido', bg: '#004c26', fg: '#ffffff', dot: '#004c26' },
  { value: 'descartado', label: 'Descartado', bg: '#f4f4f5', fg: '#71717a', dot: '#a1a1aa' },
] as const

export type LeadStatus = (typeof LEAD_STATUS)[number]['value']

export const statusMeta = (value: unknown) => LEAD_STATUS.find((s) => s.value === value) ?? LEAD_STATUS[0]

export const LEAD_FORMS: Record<string, string> = {
  whatsapp: 'Pop-up WhatsApp',
  contato: 'Página de contato',
  trial: 'Trial',
  'trial-compact': 'Trial (LP)',
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
