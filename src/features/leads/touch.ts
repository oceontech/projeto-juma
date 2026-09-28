import type { Touch } from './server/ingest'

/**
 * Atribuição de origem do lead (primeiro e último toque).
 *
 * Dois cookies próprios, de 90 dias, só com parâmetros de campanha e a página
 * de entrada. Nada de identificador de pessoa: servem para o painel mostrar de
 * qual campanha veio cada contato.
 */
export const FIRST_TOUCH_COOKIE = 'juma_first'
export const LAST_TOUCH_COOKIE = 'juma_last'
export const TOUCH_MAX_AGE = 60 * 60 * 24 * 90

const PARAMS: Record<string, keyof Touch> = {
  utm_source: 'source',
  utm_medium: 'medium',
  utm_campaign: 'campaign',
  utm_term: 'term',
  utm_content: 'content',
  gclid: 'gclid',
  fbclid: 'fbclid',
}

export function parseTouch(raw?: string | null): Touch | undefined {
  if (!raw) return undefined
  try {
    const value = JSON.parse(decodeURIComponent(raw))
    return value && typeof value === 'object' ? (value as Touch) : undefined
  } catch {
    return undefined
  }
}

/** Lê a visita atual. Só devolve algo quando há campanha ou referência externa. */
export function touchFromLocation(href: string, referrer: string): Touch | undefined {
  const url = new URL(href)
  const touch: Touch = {}
  for (const [param, key] of Object.entries(PARAMS)) {
    const value = url.searchParams.get(param)
    if (value) touch[key] = value.slice(0, 200)
  }
  let externalReferrer: string | undefined
  if (referrer) {
    try {
      const ref = new URL(referrer)
      if (ref.hostname !== url.hostname) externalReferrer = ref.hostname
    } catch {}
  }
  if (!Object.keys(touch).length && !externalReferrer) return undefined
  if (externalReferrer) touch.referrer = externalReferrer
  touch.landing = url.pathname
  touch.at = new Date().toISOString()
  return touch
}
