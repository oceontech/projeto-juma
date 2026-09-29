import Link from 'next/link'
import type { ListViewServerProps } from 'payload'

import { Flag } from '../ui/Flag'

/** Equipe do painel em cartões: quem é, o que pode fazer e em quais sites. */
type Doc = Record<string, any>

const ROLES: Record<string, { label: string; hint: string; tone: string }> = {
  admin: { label: 'Admin', hint: 'Tudo, inclusive usuários e configurações', tone: 'dark' },
  editor: { label: 'Editor', hint: 'Matérias, produtos, culturas e páginas', tone: 'green' },
  comercial: { label: 'Comercial', hint: 'Atende e exporta os leads', tone: 'amber' },
}

export function UsersList({ data, hasCreatePermission, user }: ListViewServerProps) {
  const docs = data.docs as Doc[]
  const me = (user as Doc | null)?.id

  return (
    <div className="jl">
      <header className="jl-head">
        <div>
          <h1>Usuários</h1>
          <p>
            {data.totalDocs} pessoa{data.totalDocs === 1 ? '' : 's'} com acesso ao painel
          </p>
        </div>
        {hasCreatePermission && (
          <Link className="jd-btn" href="/admin/collections/users/create">
            + Adicionar pessoa
          </Link>
        )}
      </header>

      <ul className="ju-list">
        {docs.map((u) => {
          const name = u.nome || u.email.split('@')[0]
          const initials = name
            .split(/\s+/)
            .slice(0, 2)
            .map((p: string) => p[0]?.toUpperCase())
            .join('')
          const role = ROLES[u.papel] ?? { label: 'Sem perfil', hint: 'Não entra no painel', tone: 'gray' }
          const locked = u.lockUntil && new Date(u.lockUntil).getTime() > Date.now()
          return (
            <li key={u.id}>
              <Link href={`/admin/collections/users/${u.id}`} className="ju-card">
                <span className="ju-avatar">{initials}</span>
                <span className="ju-who">
                  <b>
                    {name}
                    {u.id === me && <em>você</em>}
                    {locked && <em className="is-locked">bloqueado por senha errada</em>}
                  </b>
                  <small>{u.email}</small>
                </span>
                <span className="ju-role">
                  <span className={`ju-pill ju-pill--${role.tone}`}>{role.label}</span>
                  <small>{role.hint}</small>
                </span>
                <span className="ju-sites" aria-label="Sites">
                  {(u.sites ?? []).map((s: 'br' | 'us') => (
                    <span key={s}>
                      <Flag site={s} size={18} />
                      {s === 'br' ? 'Brasil' : 'EUA'}
                    </span>
                  ))}
                </span>
                <span className="ju-when">
                  no painel desde{' '}
                  {new Date(u.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
