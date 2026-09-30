import type { Payload, Where } from 'payload'

import { guessTipo, isLeadTipo } from '../tipo'

/**
 * Entrada única de leads no painel (docs/01-prd/painel-central.md, 4.2).
 *
 * Usado pela server action do site BR e pelo endpoint `POST /api/leads/intake`,
 * que recebe os leads do site americano. Não importa nada do Next, para rodar
 * dentro do Payload também.
 */

export const LEAD_FORMS = ['whatsapp', 'contato', 'trial', 'trial-compact'] as const
export type LeadForm = (typeof LEAD_FORMS)[number]

export type Touch = {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
  gclid?: string
  fbclid?: string
  referrer?: string
  landing?: string
  at?: string
}

export type LeadInput = {
  formulario: LeadForm
  nome: string
  email?: string
  telefone?: string
  empresa?: string
  mensagem?: string
  /** Assunto escolhido no formulário (página de contato); sem ele, a regra adivinha. */
  tipo?: string
  locale?: string
  pagina?: string
  contexto?: { produto?: string; cultura?: string; detalhe?: string }
  variante?: string
  /** Campos próprios de cada formulário (estado, acres, região, cultura escolhida…). */
  dados?: Record<string, string | number | boolean | string[] | null | undefined>
  primeiroToque?: Touch
  ultimoToque?: Touch
  consentimento?: string
  /** Campo isca: humano não preenche. */
  website?: string
  /** Milissegundos desde que o formulário apareceu. */
  tempoMs?: number
}

export type LeadMeta = {
  userAgent?: string | null
  pais?: string | null
  regiao?: string | null
  cidade?: string | null
}

export type IngestResult =
  | { ok: true; id: number | string; duplicado: boolean }
  | { ok: false; error: 'invalid' | 'spam' | 'server'; fields?: string[] }

const MAX = 500
const clip = (v: unknown, max = MAX) => (typeof v === 'string' ? v.trim().slice(0, max) || undefined : undefined)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const normalizeEmail = (v?: string) => v?.trim().toLowerCase() || undefined
export const normalizePhone = (v?: string) => {
  const digits = v?.replace(/\D/g, '') ?? ''
  return digits.length ? digits : undefined
}

function cleanTouch(t?: Touch): Touch | undefined {
  if (!t || typeof t !== 'object') return undefined
  const out: Touch = {}
  for (const k of ['source', 'medium', 'campaign', 'term', 'content', 'gclid', 'fbclid', 'referrer', 'landing', 'at'] as const) {
    const v = clip(t[k], 300)
    if (v) out[k] = v
  }
  return Object.keys(out).length ? out : undefined
}

export function parseUserAgent(ua?: string | null): { tipo?: string; navegador?: string } {
  if (!ua) return {}
  const tipo = /iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop'
  const navegador = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /SamsungBrowser/.test(ua)
        ? 'Samsung Internet'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Firefox\//.test(ua)
            ? 'Firefox'
            : /Safari\//.test(ua)
              ? 'Safari'
              : 'Outro'
  return { tipo, navegador }
}

export function validateLead(input: LeadInput): string[] {
  const erros: string[] = []
  const nome = clip(input.nome, 120)
  if (!nome || nome.length < 2) erros.push('nome')
  const email = normalizeEmail(input.email)
  if (email && !EMAIL.test(email)) erros.push('email')
  const telefone = normalizePhone(input.telefone)
  if (telefone && (telefone.length < 10 || telefone.length > 15)) erros.push('telefone')

  // Obrigatórios por formulário: o pop-up pede os 3 campos (ADR-007);
  // o trial americano pede nome e e-mail.
  if (input.formulario === 'whatsapp' || input.formulario === 'contato') {
    if (!email) erros.push('email')
    if (!telefone) erros.push('telefone')
  } else if (!email) {
    erros.push('email')
  }
  return [...new Set(erros)]
}

export function isSpam(input: LeadInput): boolean {
  if (input.website && input.website.trim() !== '') return true
  // Menos de 1,5 s entre abrir e enviar é robô.
  if (typeof input.tempoMs === 'number' && input.tempoMs >= 0 && input.tempoMs < 1500) return true
  return false
}

export async function ingestLead(
  payload: Payload,
  site: 'br' | 'us',
  input: LeadInput,
  meta: LeadMeta = {},
): Promise<IngestResult> {
  if (!input || !LEAD_FORMS.includes(input.formulario)) return { ok: false, error: 'invalid', fields: ['formulario'] }
  if (isSpam(input)) return { ok: false, error: 'spam' }
  const fields = validateLead(input)
  if (fields.length) return { ok: false, error: 'invalid', fields }

  const email = normalizeEmail(input.email)
  const telefone = normalizePhone(input.telefone)

  try {
    // Deduplicação: mesmo site e mesmo e-mail ou telefone apontam para o lead original.
    const or: Where[] = []
    if (email) or.push({ email: { equals: email } })
    if (telefone) or.push({ telefone: { equals: telefone } })
    const anterior = or.length
      ? await payload.find({
          collection: 'leads',
          where: { and: [{ site: { equals: site } }, { duplicadoDe: { exists: false } }, { or }] },
          sort: 'createdAt',
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
      : null
    const original = anterior?.docs[0]

    const ultimo = cleanTouch(input.ultimoToque)
    const dados = Object.fromEntries(
      Object.entries(input.dados ?? {})
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k.slice(0, 40), typeof v === 'string' ? v.slice(0, MAX) : v]),
    )

    const doc = await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        site,
        status: 'novo',
        tipo: isLeadTipo(input.tipo) ? input.tipo : guessTipo(input),
        formulario: input.formulario,
        nome: clip(input.nome, 120)!,
        email,
        telefone,
        empresa: clip(input.empresa, 160),
        mensagem: clip(input.mensagem, 2000),
        locale: clip(input.locale, 10),
        pagina: clip(input.pagina, 300),
        contexto: {
          produto: clip(input.contexto?.produto, 120),
          cultura: clip(input.contexto?.cultura, 120),
          detalhe: clip(input.contexto?.detalhe, 200),
        },
        variante: clip(input.variante, 40),
        dados: Object.keys(dados).length ? dados : undefined,
        rastreamento: {
          utmSource: ultimo?.source,
          utmMedium: ultimo?.medium,
          utmCampaign: ultimo?.campaign,
          utmTerm: ultimo?.term,
          utmContent: ultimo?.content,
          gclid: ultimo?.gclid,
          fbclid: ultimo?.fbclid,
          referrer: ultimo?.referrer,
          landing: ultimo?.landing,
          primeiroToque: cleanTouch(input.primeiroToque),
        },
        dispositivo: parseUserAgent(meta.userAgent),
        geo: {
          pais: clip(meta.pais ?? undefined, 4),
          regiao: clip(meta.regiao ?? undefined, 60),
          cidade: clip(meta.cidade ?? undefined, 120),
        },
        consentimento: input.consentimento
          ? { texto: clip(input.consentimento, 600), data: new Date().toISOString() }
          : undefined,
        duplicadoDe: original ? original.id : undefined,
      },
    })

    return { ok: true, id: doc.id, duplicado: Boolean(original) }
  } catch (err) {
    payload.logger.error({ err, msg: 'Falha ao gravar lead' })
    return { ok: false, error: 'server' }
  }
}
