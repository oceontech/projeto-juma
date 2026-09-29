import { DefaultTemplate } from '@payloadcms/next/templates'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { SITES, selectedSite, type Site } from '@/access/roles'
import {
  browserName,
  channelName,
  countryName,
  deviceName,
  duration,
  eventName,
  osName,
  regionName,
} from '@/features/analytics/labels'
import { PERIODS, TIMEZONE, loadReport, type Period, type Report, type Row } from '@/features/analytics/report'
import { UMAMI_URL } from '@/features/analytics/umami'

import { Flag } from '../ui/Flag'
import { SitePicker } from '../ui/SitePicker'

/**
 * Tela Analytics (/admin/analytics): tudo o que o Umami mede dos dois sites,
 * em português e no formato do painel. Segue o seletor de site da sidebar.
 */

const fmt = new Intl.NumberFormat('pt-BR')
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEKDAYS_FULL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

const pct = (part: number, total: number) => (total ? (part / total) * 100 : 0)
const pctText = (v: number) => `${v.toFixed(v > 0 && v < 10 ? 1 : 0).replace('.', ',')}%`

function Delta({ now, before, invert }: { now: number; before: number; invert?: boolean }) {
  if (!before) return <span className="ja-delta">{now ? 'sem dados anteriores' : ' '}</span>
  const change = ((now - before) / before) * 100
  const good = invert ? change <= 0 : change >= 0
  return (
    <span className="ja-delta">
      <b className={good ? 'is-good' : 'is-bad'}>
        {change >= 0 ? '▲' : '▼'} {pctText(Math.abs(change))}
      </b>{' '}
      vs. período anterior
    </span>
  )
}

function SiteFlag({ country, size = 16 }: { country?: string | null; size?: number }) {
  if (country === 'BR') return <Flag site="br" size={size} />
  if (country === 'US') return <Flag site="us" size={size} />
  return <span className="ja-cc">{country || '?'}</span>
}

function RankList({
  rows,
  total,
  label,
  empty = 'Sem dados no período.',
  icon,
}: {
  rows: Row[]
  total: number
  label: (x: string) => React.ReactNode
  empty?: string
  icon?: (x: string) => React.ReactNode
}) {
  if (!rows.length) return <p className="ja-empty">{empty}</p>
  const max = Math.max(...rows.map((r) => r.y))
  return (
    <ol className="ja-rank">
      {rows.map((r) => (
        <li key={r.x}>
          <span className="ja-rank__bar" style={{ width: `${pct(r.y, max)}%` }} />
          {icon?.(r.x)}
          <span className="ja-rank__label" title={r.x}>
            {label(r.x)}
          </span>
          <b>{fmt.format(r.y)}</b>
          <small>{pctText(pct(r.y, total))}</small>
        </li>
      ))}
    </ol>
  )
}

function Card({ title, hint, children, className = '' }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <article className={`jd-card ja-card ${className}`}>
      <header className="ja-card__head">
        <h2>{title}</h2>
        {hint && <p>{hint}</p>}
      </header>
      {children}
    </article>
  )
}

/** "/en/produtos/aminosan" → "/produtos/aminosan (en)"; a raiz vira "Home". */
function pagePath(p: string) {
  const m = p.match(/^\/(pt-BR|en|es|pt)(\/.*)?$/)
  const rest = m ? m[2] || '/' : p
  const label = rest === '/' ? 'Home' : rest
  return m && m[1] !== 'pt-BR' ? `${label} (${m[1]})` : label
}

function Chart({ report }: { report: Report }) {
  const { series, unit } = report
  if (!series.length) return <p className="ja-empty">Ainda sem visitas no período.</p>
  const max = Math.max(1, ...series.map((s) => s.pageviews))
  // Chaves já no horário de Brasília: "AAAA-MM-DD HH" ou "AAAA-MM-DD".
  const label = (x: string) => (unit === 'hour' ? `${x.slice(11, 13)}h` : `${x.slice(8, 10)}/${x.slice(5, 7)}`)
  return (
    <>
      <div className="ja-chart" role="img" aria-label="Visitantes e páginas vistas no período">
        {series.map((s) => (
          <span key={s.x} className="ja-chart__col" title={`${label(s.x)}: ${s.visitors} visitantes, ${s.pageviews} páginas vistas`}>
            <span className="ja-chart__pv" style={{ height: `${pct(s.pageviews, max)}%` }} />
            <span className="ja-chart__v" style={{ height: `${pct(s.visitors, max)}%` }} />
          </span>
        ))}
      </div>
      <div className="ja-chart__axis">
        <span>{label(series[0].x)}</span>
        <span className="ja-legend">
          <i className="ja-legend__v" /> visitantes <i className="ja-legend__pv" /> páginas vistas
        </span>
        <span>{label(series[series.length - 1].x)}</span>
      </div>
    </>
  )
}

function Heatmap({ weekly }: { weekly: number[][] }) {
  const max = Math.max(0, ...weekly.flat())
  if (!max) return <p className="ja-empty">Ainda sem visitas no período.</p>
  let best = { d: 0, h: 0, v: -1 }
  weekly.forEach((row, d) => row.forEach((v, h) => v > best.v && (best = { d, h, v })))
  // Segunda a domingo, como o calendário brasileiro de trabalho.
  const order = [1, 2, 3, 4, 5, 6, 0]
  return (
    <>
      <p className="ja-best">
        Pico: <b>{WEEKDAYS_FULL[best.d]}, das {best.h}h às {best.h + 1}h</b>
      </p>
      <div className="ja-heat">
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} className="ja-heat__h">
            {h % 3 === 0 ? `${h}h` : ''}
          </span>
        ))}
        {order.map((d) => (
          <div key={d} className="ja-heat__row">
            <span className="ja-heat__d">{WEEKDAYS[d]}</span>
            {weekly[d].map((v, h) => (
              <span
                key={h}
                className="ja-heat__cell"
                style={{ opacity: v ? 0.18 + 0.82 * (v / max) : 1, background: v ? '#16a34a' : undefined }}
                title={`${WEEKDAYS_FULL[d]}, ${h}h: ${v} visitante${v === 1 ? '' : 's'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

function when(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { timeZone: TIMEZONE, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export async function AnalyticsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const req = initPageResult.req
  const user = req.user as { papel?: string; sites?: Site[] | null } | null
  if (!user) redirect('/admin/login?redirect=%2Fadmin%2Fanalytics')

  const allowed: Site[] = user.papel === 'admin' ? [...SITES] : user.sites?.length ? user.sites : []
  const chosen = selectedSite(req)
  const sites = chosen && allowed.includes(chosen) ? [chosen] : allowed
  const raw = typeof searchParams?.periodo === 'string' ? searchParams.periodo : '30d'
  const period: Period = raw in PERIODS ? (raw as Period) : '30d'
  const report = await loadReport(sites, period)

  const m = report?.metrics
  const t = report?.totals
  const prev = report?.previous
  const leads = m?.event.find((e) => e.x === 'lead')?.y ?? 0
  const siteName = sites.length === 1 ? (sites[0] === 'br' ? 'site Brasil' : 'site EUA') : 'dois sites'

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      req={req}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <div className="juma-dash ja">
        <header className="jd-head">
          <div>
            <p className="jd-eyebrow">Analytics · {siteName}</p>
            <h1>Visitas</h1>
          </div>
          <div className="ja-head__actions">
            <SitePicker value={chosen && allowed.includes(chosen) ? chosen : 'todos'} />
            {report && (
              <span className="ja-live" title="Pessoas com o site aberto nos últimos 5 minutos">
                <i /> {fmt.format(report.active)} {report.active === 1 ? 'pessoa' : 'pessoas'} agora
              </span>
            )}
            <nav className="ja-periods" aria-label="Período">
              {(Object.keys(PERIODS) as Period[]).map((p) => (
                <Link key={p} href={`/admin/analytics?periodo=${p}`} className={p === period ? 'is-active' : ''} aria-current={p === period ? 'page' : undefined}>
                  {PERIODS[p].label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {!report || !t || !prev || !m ? (
          <article className="jd-card ja-card">
            <h2>Sem dados do analytics</h2>
            <p className="jd-muted">
              {sites.length
                ? 'O Umami não respondeu ou ainda não está configurado. Tente de novo em alguns minutos.'
                : 'Seu usuário não tem nenhum site liberado. Peça a um administrador.'}
            </p>
          </article>
        ) : (
          <>
            <section className="ja-kpis">
              {[
                { label: 'Visitantes', value: fmt.format(t.visitors), hint: 'pessoas diferentes', delta: <Delta now={t.visitors} before={prev.visitors} /> },
                { label: 'Visitas', value: fmt.format(t.visits), hint: 'uma pessoa pode voltar várias vezes', delta: <Delta now={t.visits} before={prev.visits} /> },
                {
                  label: 'Páginas vistas',
                  value: fmt.format(t.pageviews),
                  hint: t.visits ? `${(t.pageviews / t.visits).toFixed(1).replace('.', ',')} por visita` : '',
                  delta: <Delta now={t.pageviews} before={prev.pageviews} />,
                },
                {
                  label: 'Tempo médio por visita',
                  value: t.visits ? duration(t.totaltime / t.visits) : '—',
                  hint: 'do primeiro ao último clique',
                  delta: <Delta now={t.visits ? t.totaltime / t.visits : 0} before={prev.visits ? prev.totaltime / prev.visits : 0} />,
                },
                {
                  label: 'Saem sem navegar',
                  value: t.visits ? pctText(pct(t.bounces, t.visits)) : '—',
                  hint: 'viram uma página só e saíram',
                  delta: <Delta now={t.visits ? t.bounces / t.visits : 0} before={prev.visits ? prev.bounces / prev.visits : 0} invert />,
                },
                {
                  label: 'Viraram lead',
                  value: t.visitors ? pctText(pct(leads, t.visitors)) : '—',
                  hint: `${fmt.format(leads)} formulário${leads === 1 ? '' : 's'} enviado${leads === 1 ? '' : 's'}`,
                  delta: null,
                },
              ].map((k) => (
                <article key={k.label} className="jd-card ja-kpi">
                  <p className="jd-label">{k.label}</p>
                  <strong>{k.value}</strong>
                  <small>{k.hint}</small>
                  {k.delta}
                </article>
              ))}
            </section>

            <section className="ja-grid ja-grid--2-1">
              <Card title="Visitas no período" hint={report.unit === 'hour' ? 'Por hora, hoje' : 'Por dia'}>
                <Chart report={report} />
              </Card>
              <Card title="Como chegam" hint="Canal da primeira página da visita">
                <RankList rows={m.channel} total={t.visits} label={channelName} />
              </Card>
            </section>

            <section className="ja-grid ja-grid--3">
              <Card title="Estados" hint="Localização aproximada pelo provedor de internet">
                <RankList
                  rows={m.region}
                  total={t.visitors}
                  icon={(x) => <SiteFlag country={regionName(x).country} />}
                  label={(x) => {
                    const r = regionName(x)
                    return (
                      <>
                        {r.name} {r.uf && <em>{r.uf}</em>}
                      </>
                    )
                  }}
                />
              </Card>
              <Card title="Cidades" hint="Pode indicar a cidade do provedor, não a da fazenda">
                <RankList rows={m.city} total={t.visitors} label={(x) => x || 'Desconhecida'} />
              </Card>
              <Card title="Países">
                <RankList rows={m.country} total={t.visitors} icon={(x) => <SiteFlag country={x} />} label={countryName} />
              </Card>
            </section>

            <section className="ja-grid ja-grid--3">
              <Card title="Páginas mais vistas">
                <RankList rows={m.path} total={t.pageviews} label={pagePath} />
              </Card>
              <Card title="Por onde entram" hint="Primeira página da visita">
                <RankList rows={m.entry} total={t.visits} label={pagePath} />
              </Card>
              <Card title="Por onde saem" hint="Última página antes de fechar">
                <RankList rows={m.exit} total={t.visits} label={pagePath} />
              </Card>
            </section>

            <section className="ja-grid ja-grid--3">
              <Card title="Sites que mandam visitas">
                <RankList rows={m.referrer.filter((r) => r.x)} total={t.visits} label={(x) => x} empty="Nenhum link externo no período." />
              </Card>
              <Card title="Campanhas" hint="Links com UTM (utm_campaign)">
                <RankList rows={m.utmCampaign.filter((r) => r.x)} total={t.visits} label={(x) => x} empty="Nenhuma campanha com UTM no período." />
              </Card>
              <Card title="Origem da campanha" hint="utm_source">
                <RankList rows={m.utmSource.filter((r) => r.x)} total={t.visits} label={(x) => x} empty="Nenhuma origem com UTM no período." />
              </Card>
            </section>

            <section className="ja-grid ja-grid--2-1">
              <Card title="Dias e horários" hint="Visitantes por dia da semana e hora (horário de Brasília)">
                <Heatmap weekly={report.weekly} />
              </Card>
              <Card title="Ações no site" hint="Contadas pelo analytics">
                <RankList rows={m.event} total={t.visitors} label={eventName} empty="Nenhuma ação registrada no período." />
              </Card>
            </section>

            <section className="ja-grid ja-grid--3">
              <Card title="Aparelhos">
                <RankList rows={m.device} total={t.visitors} label={deviceName} />
              </Card>
              <Card title="Navegadores">
                <RankList rows={m.browser} total={t.visitors} label={browserName} />
              </Card>
              <Card title="Sistemas">
                <RankList rows={m.os} total={t.visitors} label={osName} />
              </Card>
            </section>

            <Card title="Últimas visitas" hint="Cada linha é uma pessoa: de onde veio, quanto tempo ficou e quantas páginas viu" className="ja-visits">
              {report.visits.length ? (
                <div className="ja-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Quando</th>
                        <th>Local</th>
                        <th>Aparelho</th>
                        <th>Páginas</th>
                        <th>Tempo</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.visits.map((v) => {
                        const r = regionName(v.region)
                        const secs = (new Date(v.lastAt).getTime() - new Date(v.firstAt).getTime()) / 1000
                        return (
                          <tr key={`${v.site}${v.id}`}>
                            <td>
                              <span className="ja-when">
                                <Flag site={v.site} size={16} title={v.site === 'br' ? 'Site Brasil' : 'Site EUA'} />
                                {when(v.lastAt)}
                              </span>
                            </td>
                            <td>
                              <span className="ja-place">
                                <SiteFlag country={v.country} size={14} />
                                {[v.city, r.uf || r.name].filter(Boolean).join(', ') || countryName(v.country)}
                              </span>
                            </td>
                            <td>
                              {deviceName(v.device)} <small className="jd-muted">· {browserName(v.browser)}</small>
                            </td>
                            <td>
                              {fmt.format(Number(v.views) || 0)}
                              {Number(v.visits) > 1 && <small className="jd-muted"> · {v.visits} visitas</small>}
                            </td>
                            <td>{secs < 1 ? <span className="jd-muted">só uma página</span> : duration(secs)}</td>
                            <td>{Number(v.events) > 0 ? <span className="ja-badge">{Number(v.events) > 1 ? `${v.events} ações` : '1 ação'}</span> : <span className="jd-muted">—</span>}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="ja-empty">Nenhuma visita no período.</p>
              )}
            </Card>

            <p className="ja-foot">
              Dados sem cookies e sem identificar pessoas (LGPD). Atualiza a cada 5 minutos.{' '}
              {UMAMI_URL && (
                <a href={UMAMI_URL} target="_blank" rel="noreferrer">
                  Abrir o Umami completo ↗
                </a>
              )}
            </p>
          </>
        )}
      </div>
    </DefaultTemplate>
  )
}
