import Link from 'next/link'

import { Flag } from '../ui/Flag'
import { UserAvatar, displayName, lastSeen, roleMeta } from './userMeta'

/** Equipe em linhas: quem é, o que faz, onde atua e quando entrou pela última vez. */
type Member = Record<string, any>

export function TeamList({ docs, me }: { docs: Member[]; me?: number | string | null }) {
  return (
    <ul className="ju-list">
      {docs.map((u) => {
        const name = displayName(u)
        const role = roleMeta(u.papel)
        const locked = u.lockUntil && new Date(u.lockUntil).getTime() > Date.now()
        return (
          <li key={u.id}>
            <Link href={`/admin/collections/users/${u.id}`} className="ju-card">
              <UserAvatar name={name} photo={u.fotoUrl} />
              <span className="ju-who">
                <b>
                  {name}
                  {u.id === me && <em>você</em>}
                  {locked && <em className="is-locked">bloqueado por senha errada</em>}
                </b>
                <small>{[u.cargo, u.email].filter(Boolean).join(' · ')}</small>
              </span>
              <span className="ju-role">
                <span className={`ju-pill ju-pill--${role.tone}`}>{role.label}</span>
                <small>{role.hint}</small>
              </span>
              <span className="ju-sites" aria-label="Sites">
                {(u.papel === 'admin' ? ['br', 'us'] : (u.sites ?? [])).map((s: 'br' | 'us') => (
                  <span key={s} title={s === 'br' ? 'Brasil' : 'Estados Unidos'}>
                    <Flag site={s} size={18} />
                    {s === 'br' ? 'Brasil' : 'EUA'}
                  </span>
                ))}
              </span>
              <span className="ju-when">{lastSeen(u.ultimoAcesso)}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
