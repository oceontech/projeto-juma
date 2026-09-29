import { DefaultTemplate } from '@payloadcms/next/templates'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { analyticsConfigured, UMAMI_URL } from '@/features/analytics/umami'

import { Flag } from '../ui/Flag'

/**
 * Configurações do painel (/admin/configuracoes): equipe, a própria conta e
 * as integrações. Contato e redes de cada site ficam no card do site.
 */

const ROLES: Record<string, { label: string; tone: string }> = {
  admin: { label: 'Admin', tone: 'dark' },
  editor: { label: 'Editor', tone: 'green' },
  comercial: { label: 'Comercial', tone: 'amber' },
}

function Status({ ok, on, off }: { ok: boolean; on: string; off: string }) {
  return <span className={`jps-status${ok ? ' is-ok' : ''}`}>{ok ? on : off}</span>
}

export async function PanelSettings({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const req = initPageResult.req
  const user = req.user as { id: number; nome?: string | null; email: string; papel?: string; sites?: ('br' | 'us')[] } | null
  if (!user) redirect('/admin/login?redirect=%2Fadmin%2Fconfiguracoes')
  const isAdmin = user.papel === 'admin'

  const team = isAdmin
    ? await req.payload.find({ collection: 'users', limit: 50, depth: 0, sort: 'nome', overrideAccess: true })
    : null

  const name = user.nome || user.email.split('@')[0]
  const role = ROLES[user.papel ?? ''] ?? { label: 'Sem perfil', tone: 'gray' }

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
      // Telas próprias não recebem as ações globais (cabeçalho) sozinhas.
      viewActions={req.payload.config.admin.components?.actions}
      visibleEntities={initPageResult.visibleEntities}
    >
      <div className="juma-dash jps">
        <header className="jd-head">
          <div>
            <p className="jd-eyebrow">Painel</p>
            <h1>Configurações</h1>
          </div>
        </header>

        <section className="jps-grid">
          <article className="jd-card jps-card">
            <header className="jps-card__head">
              <h2>Sua conta</h2>
              <p>Nome, e-mail e senha de quem está usando o painel agora.</p>
            </header>
            <div className="jps-me">
              <span className="ju-avatar">
                {name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('')}
              </span>
              <span className="ju-who">
                <b>{name}</b>
                <small>{user.email}</small>
              </span>
              <span className={`ju-pill ju-pill--${role.tone}`}>{role.label}</span>
            </div>
            <Link className="jd-btn jd-btn--ghost" href="/admin/account">
              Editar minha conta
            </Link>
          </article>

          <article className="jd-card jps-card">
            <header className="jps-card__head">
              <h2>Integrações</h2>
              <p>Serviços que o painel usa por trás.</p>
            </header>
            <ul className="jps-list">
              <li>
                <span>
                  <b>Analytics (Umami)</b>
                  <small>Visitas, estados, cidades e origem dos dois sites</small>
                </span>
                <Status ok={analyticsConfigured()} on="Conectado" off="Não conectado" />
              </li>
              <li>
                <span>
                  <b>Atualização do site EUA</b>
                  <small>Blog e contato aparecem na hora ao publicar</small>
                </span>
                <Status ok={Boolean(process.env.US_SITE_URL && process.env.US_REVALIDATE_SECRET)} on="Conectado" off="A cada 5 min" />
              </li>
              <li>
                <span>
                  <b>E-mail (Resend)</b>
                  <small>“Esqueci minha senha” e aviso de lead novo</small>
                </span>
                <Status ok={Boolean(process.env.RESEND_API_KEY)} on="Conectado" off="Ainda não" />
              </li>
            </ul>
            {UMAMI_URL && isAdmin && (
              <a className="jps-link" href={UMAMI_URL} target="_blank" rel="noreferrer">
                Abrir o Umami completo ↗
              </a>
            )}
          </article>
        </section>

        {team && (
          <article className="jd-card jps-card">
            <header className="jps-card__head jps-card__head--row">
              <div>
                <h2>Equipe</h2>
                <p>Quem entra no painel, o que pode fazer e em quais sites.</p>
              </div>
              <Link className="jd-btn" href="/admin/collections/users/create">
                + Adicionar pessoa
              </Link>
            </header>
            <ul className="ju-list">
              {team.docs.map((u) => {
                const n = u.nome || u.email.split('@')[0]
                const r = ROLES[u.papel ?? ''] ?? { label: 'Sem perfil', tone: 'gray' }
                return (
                  <li key={u.id}>
                    <Link href={`/admin/collections/users/${u.id}`} className="ju-card jps-member">
                      <span className="ju-avatar">
                        {n
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((p: string) => p[0]?.toUpperCase())
                          .join('')}
                      </span>
                      <span className="ju-who">
                        <b>
                          {n}
                          {u.id === user.id && <em>você</em>}
                        </b>
                        <small>{u.email}</small>
                      </span>
                      <span className={`ju-pill ju-pill--${r.tone}`}>{r.label}</span>
                      <span className="ju-sites">
                        {(u.sites ?? []).map((s) => (
                          <span key={s}>
                            <Flag site={s} size={18} />
                            {s === 'br' ? 'Brasil' : 'EUA'}
                          </span>
                        ))}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </article>
        )}
      </div>
    </DefaultTemplate>
  )
}
