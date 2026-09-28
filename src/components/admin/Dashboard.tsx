import Link from 'next/link'
import type { AdminViewServerProps, PayloadRequest } from 'payload'

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
const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  novo: { label: 'Novo', bg: '#dcfce7', fg: '#166534' },
  'em-contato': { label: 'Em contato', bg: '#fef3c7', fg: '#92400e' },
  qualificado: { label: 'Qualificado', bg: '#dbeafe', fg: '#1e40af' },
  convertido: { label: 'Convertido', bg: '#004c26', fg: '#ffffff' },
  descartado: { label: 'Descartado', bg: '#f4f4f5', fg: '#71717a' },
}
const FORMS: Record<string, string> = {
  whatsapp: 'Pop-up WhatsApp',
  contato: 'Página de contato',
  trial: 'Trial',
  'trial-compact': 'Trial (LP)',
}

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

export async function Dashboard({ initPageResult }: AdminViewServerProps) {
  const req = initPageResult.req
  const user = req.user as { nome?: string | null; email?: string; papel?: string } | null
  const now = new Date()
  const today = new Date(dayKey(now) + 'T00:00:00.000Z')
  const since60 = new Date(today.getTime() - 59 * DAY)

  const canSeeLeads = Boolean(user?.papel)
  const leads = canSeeLeads ? await loadLeads(req, since60) : []
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
          <Link className="jd-btn jd-btn--ghost" href="/admin/collections/leads">
            Ver leads
          </Link>
          <Link className="jd-btn" href="/admin/collections/articles/create">
            Nova matéria
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
                  const st = STATUS[l.status] ?? STATUS.novo
                  const interest = l.contexto?.produto || l.contexto?.cultura
                  return (
                    <tr key={l.id}>
                      <td>
                        <Link href={`/admin/collections/leads/${l.id}`} className="jd-person">
                          <span className={`jd-flag jd-flag--${l.site}`}>{l.site === 'br' ? 'BR' : 'US'}</span>
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
                  <span className="jd-muted-light">{s === 'br' ? 'Brasil' : 'Estados Unidos'}</span>
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
