import type { Site } from '@/access/roles'

import { WEBSITES, analyticsConfigured, umamiGet } from './umami'

/**
 * Relatório completo da tela Analytics do painel. Busca no Umami os mesmos
 * recortes para cada site escolhido e soma tudo, então "Todos os sites" é a
 * soma do Brasil com os EUA.
 */

export const PERIODS = {
  hoje: { label: 'Hoje', days: 1 },
  '7d': { label: '7 dias', days: 7 },
  '30d': { label: '30 dias', days: 30 },
  '90d': { label: '90 dias', days: 90 },
} as const
export type Period = keyof typeof PERIODS

export const TIMEZONE = 'America/Sao_Paulo'
const MIN = 60_000

type Totals = { pageviews: number; visitors: number; visits: number; bounces: number; totaltime: number }
export type Row = { x: string; y: number }
export type Visit = {
  id: string
  site: Site
  firstAt: string
  lastAt: string
  views: number
  events: number
  visits: number
  country: string | null
  region: string | null
  city: string | null
  device: string | null
  browser: string | null
  os: string | null
}

export type Report = {
  period: Period
  start: number
  end: number
  unit: 'hour' | 'day'
  totals: Totals
  previous: Totals
  active: number
  series: { x: string; visitors: number; pageviews: number }[]
  weekly: number[][]
  metrics: Record<MetricType, Row[]>
  visits: Visit[]
}

const METRIC_TYPES = [
  'region',
  'city',
  'country',
  'channel',
  'referrer',
  'utmSource',
  'utmCampaign',
  'path',
  'entry',
  'exit',
  'device',
  'browser',
  'os',
  'event',
] as const
type MetricType = (typeof METRIC_TYPES)[number]

const n = (v: unknown) => Number(v) || 0
const ZERO: Totals = { pageviews: 0, visitors: 0, visits: 0, bounces: 0, totaltime: 0 }

function addTotals(a: Totals, b: Partial<Record<keyof Totals, unknown>> | undefined): Totals {
  return {
    pageviews: a.pageviews + n(b?.pageviews),
    visitors: a.visitors + n(b?.visitors),
    visits: a.visits + n(b?.visits),
    bounces: a.bounces + n(b?.bounces),
    totaltime: a.totaltime + n(b?.totaltime),
  }
}

function mergeRows(lists: { x: unknown; y: unknown }[][], limit = 10): Row[] {
  const map = new Map<string, number>()
  for (const list of lists) for (const r of list) {
    const key = String(r.x ?? '')
    map.set(key, (map.get(key) ?? 0) + n(r.y))
  }
  return [...map.entries()]
    .map(([x, y]) => ({ x, y }))
    .sort((a, b) => b.y - a.y)
    .slice(0, limit)
}

/** Início e fim do período, arredondados a 5 min para o cache servir. */
export function periodRange(period: Period, now = Date.now()) {
  const end = Math.floor(now / (5 * MIN)) * 5 * MIN
  if (period === 'hoje') {
    // Meia-noite em Brasília (UTC-3, sem horário de verão desde 2019).
    const local = new Date(end - 3 * 60 * MIN)
    const start = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) + 3 * 60 * MIN
    return { start, end }
  }
  return { start: end - PERIODS[period].days * 24 * 60 * MIN, end }
}

async function siteReport(site: Site, id: string, start: number, end: number, unit: 'hour' | 'day') {
  const range = `startAt=${start}&endAt=${end}`
  const tz = `timezone=${encodeURIComponent(TIMEZONE)}`
  const base = `/api/websites/${id}`
  const safe = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback)

  const [stats, series, weekly, active, sessions, ...metrics] = await Promise.all([
    umamiGet<Totals & { comparison?: Totals }>(`${base}/stats?${range}`),
    safe(umamiGet<{ pageviews: Row[]; sessions: Row[] }>(`${base}/pageviews?${range}&unit=${unit}&${tz}`), {
      pageviews: [],
      sessions: [],
    }),
    safe(umamiGet<number[][]>(`${base}/sessions/weekly?${range}&${tz}`), [] as number[][]),
    safe(umamiGet<{ visitors: number }>(`${base}/active`, { fresh: true }), { visitors: 0 }),
    safe(umamiGet<{ data: Omit<Visit, 'site'>[] }>(`${base}/sessions?${range}&pageSize=25&page=1`), { data: [] }),
    ...METRIC_TYPES.map((type) =>
      safe(umamiGet<Row[]>(`${base}/metrics?${range}&type=${type}&limit=${type === 'city' ? 25 : 15}`), [] as Row[]),
    ),
  ])

  return {
    stats,
    series,
    weekly,
    active: n(active?.visitors),
    visits: (sessions?.data ?? []).map((v) => ({ ...v, site })),
    metrics: Object.fromEntries(METRIC_TYPES.map((t, i) => [t, metrics[i]])) as Record<MetricType, Row[]>,
  }
}

/**
 * O Umami só devolve os dias/horas com visita. Aqui entram todos os do
 * período, zerados, para o gráfico não virar barras soltas. As chaves são
 * "AAAA-MM-DD" (dia) ou "AAAA-MM-DD HH" (hora), já no horário de Brasília.
 */
function fillSeries(
  map: Map<string, { visitors: number; pageviews: number }>,
  start: number,
  end: number,
  unit: 'hour' | 'day',
) {
  const keyOf = (x: string) => (unit === 'hour' ? `${x.slice(0, 10)} ${x.slice(11, 13)}` : x.slice(0, 10))
  const data = new Map<string, { visitors: number; pageviews: number }>()
  for (const [x, v] of map) {
    const k = keyOf(x)
    const cur = data.get(k) ?? { visitors: 0, pageviews: 0 }
    data.set(k, { visitors: cur.visitors + v.visitors, pageviews: cur.pageviews + v.pageviews })
  }
  const step = unit === 'hour' ? 60 * MIN : 24 * 60 * MIN
  const out: { x: string; visitors: number; pageviews: number }[] = []
  // Brasília é UTC-3: desloca antes de formatar para a chave sair no horário local.
  for (let t = start; t <= end; t += step) {
    const iso = new Date(t - 3 * 60 * MIN).toISOString()
    const k = unit === 'hour' ? `${iso.slice(0, 10)} ${iso.slice(11, 13)}` : iso.slice(0, 10)
    if (out.at(-1)?.x === k) continue
    out.push({ x: k, ...(data.get(k) ?? { visitors: 0, pageviews: 0 }) })
  }
  return out
}

export async function loadReport(sites: Site[], period: Period): Promise<Report | null> {
  if (!analyticsConfigured()) return null
  const { start, end } = periodRange(period)
  const unit = period === 'hoje' ? 'hour' : 'day'
  const targets = sites.filter((s) => WEBSITES[s])
  if (!targets.length) return null

  try {
    const parts = await Promise.all(targets.map((s) => siteReport(s, WEBSITES[s]!, start, end, unit)))

    const seriesMap = new Map<string, { visitors: number; pageviews: number }>()
    for (const p of parts) {
      for (const r of p.series.pageviews) {
        const cur = seriesMap.get(r.x) ?? { visitors: 0, pageviews: 0 }
        seriesMap.set(r.x, { ...cur, pageviews: cur.pageviews + n(r.y) })
      }
      for (const r of p.series.sessions) {
        const cur = seriesMap.get(r.x) ?? { visitors: 0, pageviews: 0 }
        seriesMap.set(r.x, { ...cur, visitors: cur.visitors + n(r.y) })
      }
    }

    const weekly = Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => parts.reduce((sum, p) => sum + n(p.weekly?.[d]?.[h]), 0)),
    )

    return {
      period,
      start,
      end,
      unit,
      totals: parts.reduce((acc, p) => addTotals(acc, p.stats), ZERO),
      previous: parts.reduce((acc, p) => addTotals(acc, p.stats.comparison), ZERO),
      active: parts.reduce((sum, p) => sum + p.active, 0),
      series: fillSeries(seriesMap, start, end, unit),
      weekly,
      metrics: Object.fromEntries(
        METRIC_TYPES.map((t) => [t, mergeRows(parts.map((p) => p.metrics[t]), t === 'city' ? 25 : 12)]),
      ) as Record<MetricType, Row[]>,
      visits: parts
        .flatMap((p) => p.visits)
        .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
        .slice(0, 25),
    }
  } catch (err) {
    console.error('[analytics] relatório indisponível:', err instanceof Error ? err.message : err)
    return null
  }
}
