import type { Site } from '@/access/roles'

/**
 * Leitura dos números do Umami (juma-stats.vercel.app) para a Visão geral do
 * painel. Usa um usuário só de leitura (`UMAMI_USERNAME`/`UMAMI_PASSWORD`).
 * Sem as variáveis, ou com o Umami fora do ar, devolve null e o painel
 * mostra o card de "sem dados" em vez de quebrar.
 */

export const UMAMI_URL = process.env.UMAMI_API_URL?.replace(/\/$/, '')
const API = UMAMI_URL
export const WEBSITES: Record<Site, string | undefined> = {
  br: process.env.UMAMI_WEBSITE_BR,
  us: process.env.UMAMI_WEBSITE_US,
}

let token: { value: string; at: number } | null = null
const TOKEN_TTL = 6 * 60 * 60 * 1000

async function getToken(force = false) {
  if (!force && token && Date.now() - token.at < TOKEN_TTL) return token.value
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: process.env.UMAMI_USERNAME, password: process.env.UMAMI_PASSWORD }),
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Umami login ${res.status}`)
  const data = (await res.json()) as { token: string }
  token = { value: data.token, at: Date.now() }
  return token.value
}

/** GET autenticado na API do Umami. `fresh` pula o cache (visitantes ao vivo). */
export async function umamiGet<T>(path: string, { fresh = false, retry = true } = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { authorization: `Bearer ${await getToken()}` },
    // Os números mudam devagar: 5 minutos de cache poupa o Umami a cada visita ao painel.
    ...(fresh ? { cache: 'no-store' as const } : { next: { revalidate: 300 } }),
    signal: AbortSignal.timeout(8000),
  })
  if (res.status === 401 && retry) {
    await getToken(true)
    return umamiGet<T>(path, { fresh, retry: false })
  }
  if (!res.ok) throw new Error(`Umami ${path} ${res.status}`)
  return (await res.json()) as T
}

type RawStats = Record<'pageviews' | 'visitors' | 'visits' | 'bounces' | 'totaltime', number | string> & {
  comparison?: Record<'pageviews' | 'visitors' | 'visits' | 'bounces' | 'totaltime', number | string>
}
type Metric = { x: string; y: number | string }

export type SiteTraffic = {
  visitors: number
  visitorsPrev: number
  pageviews: number
  visits: number
  bounceRate: number
  avgVisitSeconds: number
  topPages: { path: string; views: number }[]
  leadEvents: number
  whatsappEvents: number
}

export type Traffic = { sites: Partial<Record<Site, SiteTraffic>>; visitors: number; visitorsPrev: number }

export function analyticsConfigured() {
  return Boolean(API && process.env.UMAMI_USERNAME && process.env.UMAMI_PASSWORD && (WEBSITES.br || WEBSITES.us))
}

async function siteTraffic(id: string, startAt: number, endAt: number): Promise<SiteTraffic> {
  const range = `startAt=${startAt}&endAt=${endAt}`
  const [stats, pages, events] = await Promise.all([
    umamiGet<RawStats>(`/api/websites/${id}/stats?${range}`),
    umamiGet<Metric[]>(`/api/websites/${id}/metrics?${range}&type=path&limit=5`),
    umamiGet<Metric[]>(`/api/websites/${id}/metrics?${range}&type=event&limit=20`).catch(() => [] as Metric[]),
  ])
  const n = (v: unknown) => Number(v) || 0
  const visits = n(stats.visits)
  return {
    visitors: n(stats.visitors),
    visitorsPrev: n(stats.comparison?.visitors),
    pageviews: n(stats.pageviews),
    visits,
    bounceRate: visits ? n(stats.bounces) / visits : 0,
    avgVisitSeconds: visits ? n(stats.totaltime) / visits : 0,
    topPages: pages.map((p) => ({ path: p.x, views: n(p.y) })),
    leadEvents: events.filter((e) => e.x === 'lead').reduce((sum, e) => sum + n(e.y), 0),
    whatsappEvents: events.filter((e) => e.x === 'whatsapp').reduce((sum, e) => sum + n(e.y), 0),
  }
}

/** Tráfego do período pedido (e do período anterior, do mesmo tamanho) dos sites. */
export async function loadTraffic(sites: Site[], start: Date, end: Date): Promise<Traffic | null> {
  if (!analyticsConfigured()) return null
  try {
    const entries = await Promise.all(
      sites
        .filter((s) => WEBSITES[s])
        .map(async (s) => [s, await siteTraffic(WEBSITES[s]!, start.getTime(), end.getTime())] as const),
    )
    if (!entries.length) return null
    const bySite = Object.fromEntries(entries) as Partial<Record<Site, SiteTraffic>>
    return {
      sites: bySite,
      visitors: entries.reduce((sum, [, t]) => sum + t.visitors, 0),
      visitorsPrev: entries.reduce((sum, [, t]) => sum + t.visitorsPrev, 0),
    }
  } catch (err) {
    console.error('[analytics] Umami indisponível:', err instanceof Error ? err.message : err)
    return null
  }
}
