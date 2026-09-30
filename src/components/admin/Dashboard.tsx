import Link from 'next/link'
import type { AdminViewServerProps, PayloadRequest } from 'payload'

import { SITES, selectedSite, type Site } from '@/access/roles'
import { loadTraffic, type Traffic } from '@/features/analytics/umami'
import { leadChannel } from '@/features/leads/channel'

import { tipoMeta, waitingFor } from './leadMeta'
import { Flag } from './ui/Flag'

/**
 * Visão geral do painel (views.dashboard): o que precisa de atenção agora
 * (quem espera resposta), como vão os contatos (interessados, tempo de
 * resposta, clientes) e as visitas. Tudo no horário de Brasília e no período
 * escolhido (7, 30 ou 90 dias), comparado com o período anterior do mesmo
 * tamanho. As consultas usam o `req` com overrideAccess: false: respeitam o
 * papel do usuário e o site escolhido no seletor.
 */

type LeadRow = {
  id: number
  nome: string
  empresa?: string | null
  mensagem?: string | null
  site: 'br' | 'us'
  status: string
  tipo?: string | null
  contexto?: { produto?: string | null; cultura?: string | null } | null
  rastreamento?: { utmSource?: string | null; referrer?: string | null; gclid?: string | null; fbclid?: string | null } | null
  geo?: { regiao?: string | null } | null
  respondidoEm?: string | null
  createdAt: string
}

const PERIODS = { '7': '7 dias', '30': '30 dias', '90': '90 dias' } as const
type PeriodKey = keyof typeof PERIODS

const DAY = 24 * 60 * 60 * 1000
const BRT = 3 * 60 * 60 * 1000 // Brasília = UTC-3 (sem horário de verão desde 2019)
const fmt = new Intl.NumberFormat('pt-BR')
/** "AAAA-MM-DD" do dia em Brasília. */
const dayKey = (t: number) => new Date(t - BRT).toISOString().slice(0, 10)
/** Meia-noite em Brasília do dia de `t`. */
const startOfDay = (t: number) => Date.parse(`${dayKey(t)}T00:00:00.000Z`) + BRT

/** Interessado em comprar: cliente, revenda ou ainda sem tipo (pode ser cliente). */
const isBuyer = (l: LeadRow) => !l.tipo || l.tipo === 'cliente' || l.tipo === 'revenda'

function delta(current: number, previous: number) {
  if (!previous) return current ? { text: 'novo', up: true } : null
  const pct = ((current - previous) / previous) * 100
  return { text: `${Math.abs(pct).toFixed(0)}%`, up: pct >= 0 }
}

function Trend({ d, label }: { d: ReturnType<typeof delta>; label: string }) {
  if (!d) return <span className="jd-trend">sem comparação com {label}</span>
  return (
    <span className="jd-trend">
      <b style={{ color: d.up ? '#22c55e' : '#ef4444' }}>
        {d.up ? '▲' : '▼'} {d.text}
      </b>{' '}
      vs. {label}
    </span>
  )
}

const pct = (v: number) => `${(v * 100).toFixed(v && v < 0.1 ? 1 : 0).replace('.', ',')}%`
const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${Math.round(s)} s`)
const hours = (ms: number) => {
  const h = ms / 3_600_000
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`
  if (h < 48) return `${h < 10 ? h.toFixed(1).replace('.', ',') : Math.round(h)} h`
  return `${Math.round(h / 24)} dias`
}
const median = (list: number[]) => {
  if (!list.length) return null
  const s = [...list].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/**
 * Contagem por nome, juntando grafias diferentes do mesmo item ("KMEP Ultra®"
 * e "Kmep Ultra"): mostra a grafia com ® ou a mais usada.
 */
function ranking(values: (string | null | undefined)[], limit = 5) {
  const groups = new Map<string, { count: number; names: Map<string, number> }>()
  for (const v of values) {
    if (!v) continue
    const key = v.replace(/[®™]/g, '').replace(/\s+/g, ' ').trim().toLowerCase()
    const g = groups.get(key) ?? { count: 0, names: new Map() }
    g.count++
    g.names.set(v, (g.names.get(v) ?? 0) + 1)
    groups.set(key, g)
  }
  return [...groups.values()]
    .map((g) => {
      const names = [...g.names.entries()].sort((a, b) => Number(/[®™]/.test(b[0])) - Number(/[®™]/.test(a[0])) || b[1] - a[1])
      return [names[0][0], g.count] as [string, number]
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function Rank({ rows, total, empty }: { rows: [string, number][]; total: number; empty: string }) {
  if (!rows.length) return <p className="jd-muted">{empty}</p>
  const max = Math.max(...rows.map(([, n]) => n))
  return (
    <ol className="jd-rank">
      {rows.map(([name, n]) => (
        <li key={name}>
          <span className="jd-rank__bar" style={{ width: `${(n / max) * 100}%` }} />
          <span className="jd-rank__label">{name}</span>
          <b>{fmt.format(n)}</b>
          <small>{total ? `${Math.round((n / total) * 100)}%` : ''}</small>
        </li>
      ))}
    </ol>
  )
}

async function loadLeads(req: PayloadRequest, since: number) {
  const { docs } = await req.payload.find({
    collection: 'leads',
    where: { createdAt: { greater_than_equal: new Date(since).toISOString() } },
    sort: '-createdAt',
    limit: 5000,
    depth: 0,
    pagination: false,
    req,
    overrideAccess: false,
  })
  return docs as unknown as LeadRow[]
}

/** Quem espera resposta, de qualquer data (os mais antigos primeiro). */
async function loadWaiting(req: PayloadRequest) {
  const res = await req.payload.find({
    collection: 'leads',
    where: { status: { equals: 'novo' } },
    sort: 'createdAt',
    limit: 6,
    depth: 0,
    req,
    overrideAccess: false,
  })
  return { total: res.totalDocs, oldest: res.docs as unknown as LeadRow[] }
}

/** Situação do blog dos dois sites: publicados, agendados, rascunhos e o último post. */
async function loadBlog(req: PayloadRequest) {
  const now = new Date().toISOString()
  const one = async (collection: 'articles' | 'posts-us', dateField: 'data' | 'date') => {
    const q = (where: Record<string, unknown>) => req.payload.count({ collection, where: where as never, req, overrideAccess: false }).then((r) => r.totalDocs)
    const [live, scheduled, drafts, last] = await Promise.all([
      q({ and: [{ _status: { equals: 'published' } }, { [dateField]: { less_than_equal: now } }] }),
      q({ and: [{ _status: { equals: 'published' } }, { [dateField]: { greater_than: now } }] }),
      q({ _status: { equals: 'draft' } }),
      req.payload.find({
        collection,
        where: { and: [{ _status: { equals: 'published' } }, { [dateField]: { less_than_equal: now } }] } as never,
        sort: `-${dateField}`,
        limit: 1,
        depth: 0,
        req,
        overrideAccess: false,
      }),
    ])
    const doc = last.docs[0] as Record<string, any> | undefined
    return { live, scheduled, drafts, last: doc ? { title: String(doc.titulo ?? doc.title ?? ''), date: String(doc[dateField]) } : null }
  }
  const [br, us] = await Promise.all([one('articles', 'data').catch(() => null), one('posts-us', 'date').catch(() => null)])
  return { br, us }
}

/** Visitas dos sites (Umami) no período e quantas viraram contato. */
function TrafficCard({ traffic, sites, label }: { traffic: Traffic | null; sites: Site[]; label: string }) {
  if (!traffic) {
    return (
      <article className="jd-card jd-traffic jd-traffic--empty">
        <div>
          <h2>Visitas nos sites</h2>
          <p className="jd-muted">Os números de visitantes aparecem aqui assim que o analytics começar a receber dados.</p>
        </div>
      </article>
    )
  }
  const rows = sites.map((s) => [s, traffic.sites[s]] as const).filter(([, t]) => t)
  const pageviews = rows.reduce((sum, [, t]) => sum + t!.pageviews, 0)
  const visits = rows.reduce((sum, [, t]) => sum + t!.visits, 0)
  // Contados pelo próprio analytics: mesma base dos visitantes, então a taxa
  // não se distorce com leads de antes da instalação ou cadastrados à mão.
  const leads = rows.reduce((sum, [, t]) => sum + t!.leadEvents, 0)
  const whatsapp = rows.reduce((sum, [, t]) => sum + t!.whatsappEvents, 0)
  const pages = rows
    .flatMap(([s, t]) => t!.topPages.map((p) => ({ ...p, site: s })))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  return (
    <article className="jd-card jd-traffic">
      <div className="jd-card__head">
        <h2>Visitas nos sites</h2>
        <Link className="jd-chip jd-chip--dark" href="/admin/analytics">
          Ver analytics
        </Link>
      </div>
      <div className="jd-traffic__body">
        <div className="jd-traffic__stats">
          <div>
            <p className="jd-label">Visitantes</p>
            <strong className="jd-kpi">{fmt.format(traffic.visitors)}</strong>
            <Trend d={delta(traffic.visitors, traffic.visitorsPrev)} label={label} />
          </div>
          <div>
            <p className="jd-label">Deixaram contato</p>
            <strong className="jd-kpi">{traffic.visitors ? pct(leads / traffic.visitors) : '—'}</strong>
            <span className="jd-trend">
              {fmt.format(leads)} formulário{leads === 1 ? '' : 's'} de {fmt.format(traffic.visitors)} visitante{traffic.visitors === 1 ? '' : 's'}
            </span>
          </div>
          {sites.includes('br') && (
            <div>
              <p className="jd-label">Cliques no WhatsApp</p>
              <strong className="jd-kpi">{fmt.format(whatsapp)}</strong>
              <span className="jd-trend">botão do site Brasil</span>
            </div>
          )}
          <div>
            <p className="jd-label">Páginas vistas</p>
            <strong className="jd-kpi">{fmt.format(pageviews)}</strong>
            <span className="jd-trend">{visits ? `${(pageviews / visits).toFixed(1).replace('.', ',')} por visita` : '—'}</span>
          </div>
          {rows.length > 1 &&
            rows.map(([s, t]) => (
              <div key={s}>
                <p className="jd-label jd-site-label">
                  <Flag site={s} size={14} />
                  {s === 'br' ? 'Brasil' : 'Estados Unidos'}
                </p>
                <strong className="jd-kpi">{fmt.format(t!.visitors)}</strong>
                <span className="jd-trend">
                  {duration(t!.avgVisitSeconds)} por visita · {pct(t!.bounceRate)} saem na hora
                </span>
              </div>
            ))}
        </div>
        <div className="jd-traffic__pages">
          <p className="jd-label">Páginas mais vistas</p>
          {pages.length ? (
            <ol>
              {pages.map((p) => (
                <li key={`${p.site}${p.path}`}>
                  <Flag site={p.site} size={14} />
                  <span title={p.path}>{p.path === '/' ? 'Home' : p.path.replace(/^\/pt-BR(?=\/|$)/, '') || 'Home'}</span>
                  <b>{fmt.format(p.views)}</b>
                </li>
              ))}
            </ol>
          ) : (
            <p className="jd-muted">Sem visitas ainda.</p>
          )}
        </div>
      </div>
    </article>
  )
}

function BlogCard({ blog, sites }: { blog: Awaited<ReturnType<typeof loadBlog>>; sites: Site[] }) {
  const rows = sites.map((s) => [s, blog[s]] as const).filter(([, b]) => b)
  const lastAll = rows
    .map(([, b]) => b!.last)
    .filter(Boolean)
    .sort((a, b) => b!.date.localeCompare(a!.date))[0]
  const days = lastAll ? Math.floor((Date.now() - new Date(lastAll.date).getTime()) / DAY) : null
  return (
    <article className="jd-card jd-card--mint jd-blog">
      <div className="jd-card__head">
        <h2>Blog</h2>
        <Link className="jd-chip jd-chip--dark" href="/admin/blog">
          Abrir
        </Link>
      </div>
      <p className="jd-blog__last">
        {lastAll ? (
          <>
            Último post {days === 0 ? 'hoje' : days === 1 ? 'ontem' : `há ${days} dias`}
            <small title={lastAll.title}>{lastAll.title}</small>
          </>
        ) : (
          'Nenhum post publicado ainda'
        )}
      </p>
      {days !== null && days > 21 && <p className="jd-blog__nudge">Faz tempo sem post novo: um por mês já ajuda no Google.</p>}
      <ul className="jd-content">
        {rows.map(([s, b]) => (
          <li key={s}>
            <Link href="/admin/blog">
              <Flag site={s} size={26} />
              <span>
                <b>{b!.live} no ar</b>
                <small>
                  {[b!.scheduled ? `${b!.scheduled} agendado${b!.scheduled === 1 ? '' : 's'}` : '', b!.drafts ? `${b!.drafts} em rascunho` : '']
                    .filter(Boolean)
                    .join(' · ') || (s === 'br' ? 'site Brasil' : 'site EUA')}
                </small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}

export async function Dashboard({ initPageResult, searchParams }: AdminViewServerProps) {
  const req = initPageResult.req
  const user = req.user as { nome?: string | null; email?: string; papel?: string } | null
  const rawPeriod = typeof searchParams?.periodo === 'string' ? searchParams.periodo : '30'
  const period: PeriodKey = rawPeriod in PERIODS ? (rawPeriod as PeriodKey) : '30'
  const days = Number(period)
  const vsLabel = `${PERIODS[period]} anteriores`

  const now = Date.now()
  const start = startOfDay(now) - (days - 1) * DAY
  const prevStart = start - days * DAY

  const canSeeLeads = Boolean(user?.papel)
  const userSites = (user as { sites?: Site[] | null } | null)?.sites
  const allowedSites: Site[] = user?.papel === 'admin' ? [...SITES] : userSites?.length ? userSites : []
  const chosen = selectedSite(req)
  const sites = chosen && allowedSites.includes(chosen) ? [chosen] : allowedSites

  const [leads, waiting, blog, traffic] = await Promise.all([
    canSeeLeads ? loadLeads(req, prevStart) : Promise.resolve([] as LeadRow[]),
    canSeeLeads ? loadWaiting(req) : Promise.resolve({ total: 0, oldest: [] as LeadRow[] }),
    loadBlog(req),
    // Arredondado a 5 min: com o horário exato, o cache do fetch nunca servia.
    loadTraffic(sites, new Date(start), new Date(Math.floor(now / 300_000) * 300_000)),
  ])

  const current = leads.filter((l) => Date.parse(l.createdAt) >= start)
  const previous = leads.filter((l) => Date.parse(l.createdAt) < start)
  const buyers = current.filter(isBuyer)
  const buyersPrev = previous.filter(isBuyer)
  const others = current.length - buyers.length
  const clients = current.filter((l) => l.status === 'convertido')
  const clientsPrev = previous.filter((l) => l.status === 'convertido')

  // Tempo de resposta: da chegada até sair de "Para responder" (leads respondidos no período).
  const responseTimes = leads
    .filter((l) => l.respondidoEm && Date.parse(l.respondidoEm) >= start)
    .map((l) => Date.parse(l.respondidoEm!) - Date.parse(l.createdAt))
    .filter((ms) => ms >= 0)
  const medianResponse = median(responseTimes)
  const oldestWait = waiting.oldest[0] ? now - Date.parse(waiting.oldest[0].createdAt) : 0

  // Série diária, em Brasília: interessados em compra e outros contatos.
  const series = Array.from({ length: days }, (_, i) => ({ day: dayKey(start + i * DAY + 12 * 3_600_000), buyers: 0, others: 0 }))
  const index = new Map(series.map((s, i) => [s.day, i]))
  for (const l of current) {
    const i = index.get(dayKey(Date.parse(l.createdAt)))
    if (i === undefined) continue
    if (isBuyer(l)) series[i].buyers++
    else series[i].others++
  }
  const maxDay = Math.max(3, ...series.map((s) => s.buyers + s.others))
  const average = current.length / days

  const products = ranking(buyers.map((l) => l.contexto?.produto))
  const channels = ranking(buyers.map((l) => leadChannel(l.rastreamento)))
  const states = ranking(buyers.map((l) => l.geo?.regiao && `${l.geo.regiao}${l.site === 'us' ? ' (EUA)' : ''}`))
  const types = ranking(current.map((l) => tipoMeta(l.tipo)?.long ?? 'A classificar'), 6)

  const firstName = (user?.nome || user?.email || '').split(/[\s@]/)[0]
  const label = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`

  return (
    <div className="juma-dash">
      <header className="jd-head">
        <div>
          <p className="jd-eyebrow">Visão geral</p>
          <h1>Olá{firstName ? `, ${firstName}` : ''}</h1>
        </div>
        <nav className="ja-periods" aria-label="Período">
          {(Object.keys(PERIODS) as PeriodKey[]).map((p) => (
            <Link key={p} href={`/admin?periodo=${p}`} className={p === period ? 'is-active' : ''} aria-current={p === period ? 'page' : undefined}>
              {PERIODS[p]}
            </Link>
          ))}
        </nav>
      </header>

      {canSeeLeads && (
        <section className="jd-kpis jd-kpis--4">
          <Link href="/admin/collections/leads?etapa=responder" className={`jd-card jd-card--dark jd-kpi-card${waiting.total ? ' is-alert' : ''}`}>
            <p className="jd-label">Esperando resposta</p>
            <strong className="jd-kpi">{fmt.format(waiting.total)}</strong>
            <span className="jd-trend">
              {waiting.total ? (
                <>
                  o mais antigo espera há <b style={{ color: oldestWait > DAY ? '#fca5a5' : '#86efac' }}>{waitingFor(waiting.oldest[0].createdAt)}</b> · responder →
                </>
              ) : (
                'Tudo respondido'
              )}
            </span>
          </Link>
          <article className="jd-card">
            <p className="jd-label">Interessados em comprar</p>
            <strong className="jd-kpi">{fmt.format(buyers.length)}</strong>
            <Trend d={delta(buyers.length, buyersPrev.length)} label={vsLabel} />
            {others > 0 && (
              <span className="jd-trend">
                + {fmt.format(others)} outro{others === 1 ? '' : 's'} contato{others === 1 ? '' : 's'} (vagas, fornecedores…)
              </span>
            )}
          </article>
          <article className="jd-card">
            <p className="jd-label">Tempo para responder</p>
            <strong className="jd-kpi" style={{ color: medianResponse === null ? undefined : medianResponse <= DAY ? '#15803d' : medianResponse <= 3 * DAY ? '#b45309' : '#b91c1c' }}>
              {medianResponse === null ? '—' : hours(medianResponse)}
            </strong>
            <span className="jd-trend">
              {responseTimes.length === 1
                ? 'um lead respondido no período'
                : responseTimes.length
                  ? `metade dos ${fmt.format(responseTimes.length)} leads respondidos teve resposta em até esse tempo`
                  : 'aparece quando os leads forem respondidos pela tela de Leads'}
            </span>
          </article>
          <article className="jd-card">
            <p className="jd-label">Viraram clientes</p>
            <strong className="jd-kpi">{fmt.format(clients.length)}</strong>
            <Trend d={delta(clients.length, clientsPrev.length)} label={vsLabel} />
            <span className="jd-trend">marcados como “Virou cliente” em Leads</span>
          </article>
        </section>
      )}

      {canSeeLeads && waiting.total > 0 && (
        <article className="jd-card jd-waiting">
          <div className="jd-card__head">
            <h2>Responder primeiro</h2>
            <Link className="jd-chip jd-chip--dark" href="/admin/collections/leads?etapa=responder">
              Abrir Leads
            </Link>
          </div>
          <ul>
            {waiting.oldest.slice(0, 5).map((l) => {
              const tp = tipoMeta(l.tipo)
              return (
                <li key={l.id}>
                  <Link href="/admin/collections/leads?etapa=responder">
                    <Flag site={l.site} size={22} />
                    <span className="jd-waiting__who">
                      <b>{l.nome}</b>
                      <small>{l.mensagem ? `“${l.mensagem}”` : l.contexto?.produto || l.empresa || (l.site === 'br' ? 'Site Brasil' : 'Site EUA')}</small>
                    </span>
                    {tp && (
                      <span className="jd-waiting__tipo" style={{ background: tp.bg, color: tp.fg }}>
                        {tp.icon} {tp.label}
                      </span>
                    )}
                    <span className={`jd-waiting__age${Date.now() - Date.parse(l.createdAt) > DAY ? ' is-late' : ''}`}>há {waitingFor(l.createdAt)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </article>
      )}

      <TrafficCard traffic={traffic} sites={sites} label={vsLabel} />

      <section className="jd-grid">
        {canSeeLeads && (
          <article className="jd-card jd-chart">
            <div className="jd-card__head">
              <h2>Contatos por dia</h2>
              <span className="jd-legend">
                <i className="is-buyers" /> interessados <i className="is-others" /> outros
              </span>
            </div>
            <div className="jd-bars" style={{ gap: days > 40 ? 2 : days > 10 ? 4 : 8 }} role="img" aria-label={`Contatos por dia. Média ${average.toFixed(1)} por dia.`}>
              <span className="jd-bars__avg" style={{ bottom: `${(average / maxDay) * 100}%` }} />
              {series.map((s, i) => (
                <span
                  key={s.day}
                  className={`jd-bar jd-bar--stack${i === series.length - 1 ? ' jd-bar--today' : ''}`}
                  title={`${label(s.day)}: ${s.buyers} interessado${s.buyers === 1 ? '' : 's'}${s.others ? `, ${s.others} outro${s.others === 1 ? '' : 's'}` : ''}`}
                >
                  <span className="is-others" style={{ height: `${(s.others / maxDay) * 100}%` }} />
                  <span className="is-buyers" style={{ height: `${Math.max(s.buyers ? 2 : 0, (s.buyers / maxDay) * 100)}%` }} />
                </span>
              ))}
            </div>
            <div className="jd-bars__axis">
              <span>{label(series[0].day)}</span>
              <span>média {average.toFixed(1).replace('.', ',')}/dia</span>
              <span>hoje</span>
            </div>
          </article>
        )}

        <BlogCard blog={blog} sites={sites} />

        {canSeeLeads && (
          <>
            <article className="jd-card">
              <div className="jd-card__head">
                <h2>O que procuram</h2>
                <span className="jd-chip">{PERIODS[period]}</span>
              </div>
              <p className="jd-label">Produtos dos interessados</p>
              <Rank rows={products} total={buyers.length} empty="Nenhum produto indicado no período." />
              <p className="jd-label jd-label--gap">Tipos de contato</p>
              <Rank rows={types} total={current.length} empty="Nenhum contato no período." />
            </article>

            <article className="jd-card jd-card--dark jd-origin">
              <div className="jd-card__head">
                <h2>De onde vêm os interessados</h2>
                <span className="jd-chip jd-chip--light">{PERIODS[period]}</span>
              </div>
              <p className="jd-label jd-label--light">Canal</p>
              <ul className="jd-sources">
                {(channels.length ? channels : [['Sem dados ainda', 0] as [string, number]]).map(([name, count]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <b>{count}</b>
                  </li>
                ))}
              </ul>
              <p className="jd-label jd-label--light">Estado</p>
              <ul className="jd-sources">
                {(states.length ? states : [['Sem localização ainda', 0] as [string, number]]).map(([name, count]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <b>{count}</b>
                  </li>
                ))}
              </ul>
            </article>
          </>
        )}
      </section>
    </div>
  )
}
