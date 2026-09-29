import Link from 'next/link'
import type { AdminViewServerProps, PayloadRequest } from 'payload'

import { SITES, selectedSite, type Site } from '@/access/roles'
import { loadTraffic, type Traffic } from '@/features/analytics/umami'

import { LEAD_FORMS as FORMS, statusMeta } from './leadMeta'
import { Flag } from './ui/Flag'

/**
 * Visão geral do painel (views.dashboard). Números reais de leads e conteúdo.
 * As consultas passam o `req` com overrideAccess: false, então respeitam o
 * papel do usuário e o site escolhido no seletor da sidebar.
 */

type LeadRow = {
  id: number
  nome: string
  empresa?: string | null
  site: 'br' | 'us'
  status: string
  formulario?: string | null
  contexto?: { produto?: string | null; cultura?: string | null } | null
  rastreamento?: { utmSource?: string | null; referrer?: string | null } | null
  geo?: { regiao?: string | null } | null
  responsavel?: unknown
  createdAt: string
}

const DAY = 24 * 60 * 60 * 1000
const fmt = new Intl.NumberFormat('pt-BR')
const dayKey = (d: Date) => d.toISOString().slice(0, 10)

function delta(current: number, previous: number) {
  if (!previous) return current ? { text: 'novo', up: true } : { text: '0%', up: true }
  const pct = ((current - previous) / previous) * 100
  return { text: `${Math.abs(pct).toFixed(0)}%`, up: pct >= 0 }
}

function MiniBars({ values, dark }: { values: number[]; dark?: boolean }) {
  const max = Math.max(1, ...values)
  return (
    <div className="jd-minibars" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: i === values.length - 1 ? '#22c55e' : dark ? 'rgba(34,197,94,.45)' : '#d4d4d8',
          }}
        />
      ))}
    </div>
  )
}

function Trend({ text, up }: { text: string; up: boolean }) {
  return (
    <span className="jd-trend">
      <b style={{ color: up ? '#22c55e' : '#ef4444' }}>
        {up ? '▲' : '▼'} {text}
      </b>{' '}
      vs. 30 dias anteriores
    </span>
  )
}

async function loadLeads(req: PayloadRequest, since: Date) {
  const { docs } = await req.payload.find({
    collection: 'leads',
    where: { createdAt: { greater_than_equal: since.toISOString() } },
    sort: '-createdAt',
    limit: 5000,
    depth: 0,
    pagination: false,
    req,
    overrideAccess: false,
  })
  return docs as unknown as LeadRow[]
}

async function countPublished(req: PayloadRequest, collection: 'articles' | 'products' | 'cultures') {
  const [published, drafts] = await Promise.all([
    req.payload.count({ collection, where: { _status: { equals: 'published' } }, req, overrideAccess: false }),
    req.payload.count({ collection, where: { _status: { equals: 'draft' } }, req, overrideAccess: false }),
  ])
  return { published: published.totalDocs, drafts: drafts.totalDocs }
}

const pct = (v: number) => `${(v * 100).toFixed(v && v < 0.1 ? 1 : 0).replace('.', ',')}%`
const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${Math.round(s)} s`)

/** Visitas dos sites (Umami) e a taxa de conversão em lead. */
function TrafficCard({ traffic, sites }: { traffic: Traffic | null; sites: Site[] }) {
  if (!traffic) {
    return (
      <article className="jd-card jd-traffic jd-traffic--empty">
        <div>
          <h2>Visitas nos sites</h2>
          <p className="jd-muted">
            Os números de visitantes aparecem aqui assim que o analytics começar a receber dados.
          </p>
        </div>
      </article>
    )
  }
  const d = delta(traffic.visitors, traffic.visitorsPrev)
  const rows = sites.map((s) => [s, traffic.sites[s]] as const).filter(([, t]) => t)
  const pageviews = rows.reduce((sum, [, t]) => sum + t!.pageviews, 0)
  const visits = rows.reduce((sum, [, t]) => sum + t!.visits, 0)
  // Leads contados pelo próprio analytics: mesma base dos visitantes, então a
  // taxa não se distorce com leads de antes da instalação ou cadastrados à mão.
  const leads = rows.reduce((sum, [, t]) => sum + t!.leadEvents, 0)
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
            <Trend {...d} />
          </div>
          <div>
            <p className="jd-label">Viraram lead</p>
            <strong className="jd-kpi">{traffic.visitors ? pct(leads / traffic.visitors) : '—'}</strong>
            <span className="jd-trend">
              {fmt.format(leads)} lead{leads === 1 ? '' : 's'} de {fmt.format(traffic.visitors)} visitante{traffic.visitors === 1 ? '' : 's'}
            </span>
          </div>
          <div>
            <p className="jd-label">Páginas vistas</p>
            <strong className="jd-kpi">{fmt.format(pageviews)}</strong>
            <span className="jd-trend">{visits ? `${(pageviews / visits).toFixed(1).replace('.', ',')} por visita` : '—'}</span>
          </div>
          {rows.map(([s, t]) => (
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
                  <span title={p.path}>{p.path === '/' ? 'Home' : p.path}</span>
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

export async function Dashboard({ initPageResult }: AdminViewServerProps) {
  const req = initPageResult.req
  const user = req.user as { nome?: string | null; email?: string; papel?: string } | null
  const now = new Date()
  const today = new Date(dayKey(now) + 'T00:00:00.000Z')
  const since60 = new Date(today.getTime() - 59 * DAY)

  const canSeeLeads = Boolean(user?.papel)
  const userSites = (user as { sites?: Site[] | null } | null)?.sites
  const allowedSites: Site[] = user?.papel === 'admin' ? [...SITES] : userSites?.length ? userSites : []
  const chosen = selectedSite(req)
  const trafficSites = chosen && allowedSites.includes(chosen) ? [chosen] : allowedSites
  const leads = canSeeLeads ? await loadLeads(req, since60) : []
  const trafficPromise = loadTraffic(
    trafficSites,
    new Date(today.getTime() - 29 * DAY),
    // Arredondado a 5 min: com o horário exato, o cache do fetch nunca servia.
    new Date(Math.floor(now.getTime() / 300_000) * 300_000),
  )
  const [articles, products, cultures] = await Promise.all([
    countPublished(req, 'articles'),
    countPublished(req, 'products'),
    countPublished(req, 'cultures'),
  ])

  // Janelas de 30 dias
  const start30 = new Date(today.getTime() - 29 * DAY)
  const last30 = leads.filter((l) => new Date(l.createdAt) >= start30)
  const prev30 = leads.filter((l) => new Date(l.createdAt) < start30)
  const novos = last30.filter((l) => l.status === 'novo')
  const semResponsavel = novos.filter((l) => !l.responsavel)
  const convertidos = last30.filter((l) => l.status === 'convertido')
  const convertidosPrev = prev30.filter((l) => l.status === 'convertido')

  // Série diária (30 dias)
  const byDay = new Map<string, number>()
  for (let i = 0; i < 30; i++) byDay.set(dayKey(new Date(start30.getTime() + i * DAY)), 0)
  for (const l of last30) {
    const k = dayKey(new Date(l.createdAt))
    if (byDay.has(k)) byDay.set(k, (byDay.get(k) ?? 0) + 1)
  }
  const series = [...byDay.entries()]
  const maxDay = Math.max(4, ...series.map(([, v]) => v))
  const average = last30.length / 30
  const last7 = series.slice(-7).map(([, v]) => v)

  // Origem
  const bySite = { br: last30.filter((l) => l.site === 'br').length, us: last30.filter((l) => l.site === 'us').length }
  const sources = new Map<string, number>()
  for (const l of last30) {
    const s = l.rastreamento?.utmSource || l.rastreamento?.referrer || 'Direto'
    sources.set(s, (sources.get(s) ?? 0) + 1)
  }
  const topSources = [...sources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  const byForm = new Map<string, number>()
  for (const l of last30) byForm.set(l.formulario ?? 'outro', (byForm.get(l.formulario ?? 'outro') ?? 0) + 1)

  const traffic = await trafficPromise
  const recent = leads.slice(0, 6)
  const firstName = (user?.nome || user?.email || '').split(/[\s@]/)[0]
  const d30 = delta(last30.length, prev30.length)
  const dConv = delta(convertidos.length, convertidosPrev.length)

  return (
    <div className="juma-dash">
      <header className="jd-head">
        <div>
          <p className="jd-eyebrow">Visão geral</p>
          <h1>Olá{firstName ? `, ${firstName}` : ''}</h1>
        </div>
        <div className="jd-head__actions">
          <Link className="jd-btn" href="/admin/blog">
            Blog
          </Link>
        </div>
      </header>

      {/* KPIs */}
      <section className="jd-kpis">
        <article className="jd-card jd-card--dark">
          <p className="jd-label">Leads nos últimos 30 dias</p>
          <div className="jd-kpi__row">
            <strong className="jd-kpi">{fmt.format(last30.length)}</strong>
            <MiniBars values={last7} dark />
          </div>
          <Trend {...d30} />
        </article>
        <article className="jd-card">
          <p className="jd-label">Aguardando atendimento</p>
          <div className="jd-kpi__row">
            <strong className="jd-kpi">
              {fmt.format(novos.length)}
              <small>/{fmt.format(last30.length)}</small>
            </strong>
            <MiniBars values={[semResponsavel.length, novos.length - semResponsavel.length, last30.length - novos.length]} />
          </div>
          <span className="jd-trend">
            <b style={{ color: semResponsavel.length ? '#ef4444' : '#22c55e' }}>{fmt.format(semResponsavel.length)}</b> sem responsável
          </span>
        </article>
        <article className="jd-card">
          <p className="jd-label">Convertidos (30 dias)</p>
          <div className="jd-kpi__row">
            <strong className="jd-kpi">{fmt.format(convertidos.length)}</strong>
            <MiniBars values={[convertidosPrev.length, convertidos.length]} />
          </div>
          <Trend {...dConv} />
        </article>
      </section>

      <TrafficCard traffic={traffic} sites={trafficSites} />

      <section className="jd-grid">
        {/* Gráfico diário */}
        <article className="jd-card jd-chart">
          <div className="jd-card__head">
            <h2>Leads por dia</h2>
            <span className="jd-chip">30 dias</span>
          </div>
          <div className="jd-bars" role="img" aria-label={`Leads por dia nos últimos 30 dias. Média ${average.toFixed(1)} por dia.`}>
            <span className="jd-bars__avg" style={{ bottom: `${(average / maxDay) * 100}%` }} />
            {series.map(([day, v], i) => (
              <span
                key={day}
                className={`jd-bar${i === series.length - 1 ? ' jd-bar--today' : ''}`}
                style={{ height: `${Math.max(2, (v / maxDay) * 100)}%` }}
                title={`${day.split('-').reverse().slice(0, 2).join('/')}: ${v} lead${v === 1 ? '' : 's'}`}
              />
            ))}
          </div>
          <div className="jd-bars__axis">
            <span>{series[0][0].split('-').reverse().slice(0, 2).join('/')}</span>
            <span>média {average.toFixed(1)}/dia</span>
            <span>hoje</span>
          </div>
        </article>

        {/* Conteúdo publicado */}
        <article className="jd-card jd-card--mint">
          <p className="jd-label">Conteúdo publicado no site Brasil</p>
          <strong className="jd-kpi jd-kpi--xl">
            {fmt.format(articles.published + products.published + cultures.published)}
            <small> páginas-base</small>
          </strong>
          <ul className="jd-content">
            {[
              { label: 'Matérias', data: articles, href: '/admin/collections/articles' },
              { label: 'Produtos', data: products, href: '/admin/collections/products' },
              { label: 'Culturas', data: cultures, href: '/admin/collections/cultures' },
            ].map((c) => (
              <li key={c.label}>
                <Link href={c.href}>
                  <span className="jd-content__icon">{c.label[0]}</span>
                  <span>
                    <b>{c.label}</b>
                    <small>
                      {c.data.published} publicad{c.label === 'Matérias' || c.label === 'Culturas' ? 'as' : 'os'}
                      {c.data.drafts ? ` · ${c.data.drafts} em rascunho` : ''}
                    </small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </article>

        {/* Leads recentes */}
        <article className="jd-card jd-table">
          <div className="jd-card__head">
            <h2>Leads recentes</h2>
            <Link className="jd-chip jd-chip--dark" href="/admin/collections/leads">
              Ver todos
            </Link>
          </div>
          {recent.length ? (
            <table>
              <thead>
                <tr>
                  <th>Contato</th>
                  <th>Formulário</th>
                  <th>Interesse</th>
                  <th>Status</th>
                  <th>Recebido</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((l) => {
                  const st = statusMeta(l.status)
                  const interest = l.contexto?.produto || l.contexto?.cultura
                  return (
                    <tr key={l.id}>
                      <td>
                        <Link href={`/admin/collections/leads/${l.id}`} className="jd-person">
                          <Flag site={l.site} size={34} />
                          <span>
                            <b>{l.nome}</b>
                            <small>{l.empresa || l.geo?.regiao || (l.site === 'br' ? 'Brasil' : 'Estados Unidos')}</small>
                          </span>
                        </Link>
                      </td>
                      <td>{FORMS[l.formulario ?? ''] ?? '—'}</td>
                      <td>{interest ? <span className="jd-pill">{interest}</span> : '—'}</td>
                      <td>
                        <span className="jd-status" style={{ background: st.bg, color: st.fg }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="jd-muted">
                        {new Date(l.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="jd-empty">Nenhum lead ainda. Eles aparecem aqui assim que chegarem pelos sites.</p>
          )}
        </article>

        {/* Origem */}
        <article className="jd-card jd-card--dark jd-origin">
          <div className="jd-card__head">
            <h2>De onde vêm</h2>
            <span className="jd-chip jd-chip--light">30 dias</span>
          </div>
          <div className="jd-split">
            {(['br', 'us'] as const).map((s) => {
              const pct = last30.length ? Math.round((bySite[s] / last30.length) * 100) : 0
              return (
                <div key={s}>
                  <span className="jd-muted-light jd-site-label">
                    <Flag site={s} size={16} />
                    {s === 'br' ? 'Brasil' : 'Estados Unidos'}
                  </span>
                  <strong>
                    {fmt.format(bySite[s])} <small>{pct}%</small>
                  </strong>
                  <span className="jd-meter">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                </div>
              )
            })}
          </div>
          <p className="jd-label jd-label--light">Principais origens</p>
          <ul className="jd-sources">
            {(topSources.length ? topSources : [['Sem dados ainda', 0] as [string, number]]).map(([name, n]) => (
              <li key={name}>
                <span>{name}</span>
                <b>{n}</b>
              </li>
            ))}
          </ul>
          <p className="jd-label jd-label--light">Por formulário</p>
          <ul className="jd-sources">
            {[...byForm.entries()].map(([form, n]) => (
              <li key={form}>
                <span>{FORMS[form] ?? form}</span>
                <b>{n}</b>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}
