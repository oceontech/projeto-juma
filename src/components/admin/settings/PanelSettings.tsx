import { DefaultTemplate } from '@payloadcms/next/templates'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { Flag } from '../ui/Flag'
import { TeamList } from '../users/TeamList'
import { UserAvatar, displayName, roleMeta } from '../users/userMeta'

/**
 * Configurações do painel (/admin/configuracoes): a própria conta e a equipe.
 * Contato e redes de cada site ficam no card do site. As integrações (Umami,
 * revalidação, e-mail) são configuração de desenvolvimento, fora do painel.
 */

export async function PanelSettings({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const req = initPageResult.req
  const user = req.user as {
    id: number
    nome?: string | null
    cargo?: string | null
    fotoUrl?: string | null
    email: string
    papel?: string
    sites?: ('br' | 'us')[]
  } | null
  if (!user) redirect('/admin/login?redirect=%2Fadmin%2Fconfiguracoes')
  const isAdmin = user.papel === 'admin'

  const team = isAdmin
    ? await req.payload.find({ collection: 'users', limit: 50, depth: 0, sort: 'nome', overrideAccess: true })
    : null

  const name = displayName(user)
  const role = roleMeta(user.papel)
  const mySites = isAdmin ? (['br', 'us'] as const) : (user.sites ?? [])

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

        <article className="jd-card jps-me">
          <UserAvatar name={name} photo={user.fotoUrl} size={72} />
          <div className="jps-me__text">
            <h2>{name}</h2>
            <p>{[user.cargo, user.email].filter(Boolean).join(' · ')}</p>
            <div className="jps-me__tags">
              <span className={`ju-pill ju-pill--${role.tone}`}>{role.label}</span>
              <span className="ju-sites">
                {mySites.map((s) => (
                  <span key={s}>
                    <Flag site={s} size={18} />
                    {s === 'br' ? 'Brasil' : 'EUA'}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <Link className="jd-btn jd-btn--ghost" href="/admin/account">
            {user.fotoUrl ? 'Editar perfil' : 'Adicionar foto e editar perfil'}
          </Link>
        </article>

        {team && (
          <section className="jps-team">
            <header className="jps-card__head jps-card__head--row">
              <div>
                <h2>Equipe</h2>
                <p>
                  {team.totalDocs} pessoa{team.totalDocs === 1 ? '' : 's'} com acesso ao painel
                </p>
              </div>
              <Link className="jd-btn" href="/admin/collections/users/create">
                + Adicionar pessoa
              </Link>
            </header>
            <TeamList docs={team.docs} me={user.id} />
          </section>
        )}
      </div>
    </DefaultTemplate>
  )
}
