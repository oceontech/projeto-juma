'use client'

import { useAuth, useDocumentInfo, useField } from '@payloadcms/ui'

import { Flag } from '../ui/Flag'
import { USER_ROLES, roleMeta } from './userMeta'

type Site = 'br' | 'us'
const SITE_OPTIONS: { value: Site; label: string }[] = [
  { value: 'br', label: 'Brasil' },
  { value: 'us', label: 'Estados Unidos' },
]

/**
 * O que a pessoa pode fazer (perfil) e em quais sites, num cartão só.
 * Só admin muda; e ninguém tira o próprio acesso de admin por engano.
 */
export function AccessCard() {
  const { user } = useAuth<{ id: number | string; papel?: string }>()
  const { id } = useDocumentInfo()
  const papel = useField<string>({ path: 'papel' })
  const sites = useField<Site[]>({ path: 'sites' })

  const canEdit = user?.papel === 'admin'
  const isMe = id !== undefined && String(id) === String(user?.id)
  const chosen = sites.value ?? []

  if (!canEdit) {
    const role = roleMeta(papel.value)
    return (
      <section className="jup jup-access">
        <header className="jup-head">
          <h2>Acesso</h2>
          <p>Só um admin muda o perfil e os sites.</p>
        </header>
        <div className="jup-summary">
          <span className={`ju-pill ju-pill--${role.tone}`}>{role.label}</span>
          <span>{role.hint}</span>
          <span className="ju-sites">
            {chosen.map((s) => (
              <span key={s}>
                <Flag site={s} size={18} />
                {s === 'br' ? 'Brasil' : 'EUA'}
              </span>
            ))}
          </span>
        </div>
      </section>
    )
  }

  const toggleSite = (s: Site) => {
    const next = chosen.includes(s) ? chosen.filter((v) => v !== s) : [...chosen, s]
    if (next.length) sites.setValue(next)
  }

  return (
    <section className="jup jup-access">
      <header className="jup-head">
        <h2>Acesso</h2>
        <p>O que a pessoa pode fazer no painel e em quais sites.</p>
      </header>

      <div className="jup-roles" role="radiogroup" aria-label="Perfil">
        {USER_ROLES.map((r) => {
          const active = papel.value === r.value
          const locked = isMe && papel.value === 'admin' && r.value !== 'admin'
          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={active}
              className={`jup-role${active ? ' is-active' : ''}`}
              disabled={locked}
              title={locked ? 'Você não pode tirar o seu próprio acesso de admin.' : undefined}
              onClick={() => papel.setValue(r.value)}
            >
              <span className="jup-role__dot" aria-hidden />
              <b>{r.label}</b>
              <small>{r.hint}</small>
            </button>
          )
        })}
      </div>

      {papel.value === 'admin' ? (
        <p className="jup-sites__note">Admin vê e edita os dois sites.</p>
      ) : (
        <div className="jup-sites">
          <span className="jup-sites__label">Em quais sites</span>
          {SITE_OPTIONS.map((s) => {
            const on = chosen.includes(s.value)
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={on}
                className={`jup-site${on ? ' is-on' : ''}`}
                onClick={() => toggleSite(s.value)}
                title={on && chosen.length === 1 ? 'Precisa de pelo menos um site.' : undefined}
              >
                <Flag site={s.value} size={20} />
                {s.label}
                <span className="jup-site__check" aria-hidden>
                  {on ? '✓' : '+'}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
