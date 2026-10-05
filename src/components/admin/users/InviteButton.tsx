'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { Flag } from '../ui/Flag'
import { USER_ROLES } from './userMeta'

/**
 * Convite de pessoa nova: o admin informa quem é, o perfil e os sites; a
 * pessoa recebe um e-mail para criar a própria senha (POST /api/users/invite).
 */
type Errors = Partial<Record<'email' | 'papel' | 'sites' | 'form', string>>

export function InviteButton() {
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const [papel, setPapel] = useState<string>('editor')
  const [sites, setSites] = useState<string[]>(['br'])
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<{ email: string; resent: boolean; warning?: string } | null>(null)

  useEffect(() => {
    const el = dialog.current
    const reset = () => {
      setErrors({})
      setDone(null)
    }
    el?.addEventListener('close', reset)
    return () => el?.removeEventListener('close', reset)
  }, [])

  const toggleSite = (s: string) => setSites((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    setSending(true)
    setErrors({})
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: data.get('nome'), email, papel, sites }),
      })
      const json = await res.json().catch(() => ({}))
      if (!json.ok) {
        setErrors({ ...(json.errors ?? {}), form: json.error })
        return
      }
      setDone({ email, resent: Boolean(json.resent), warning: json.emailFailed ? json.error : undefined })
      form.reset()
      setPapel('editor')
      setSites(['br'])
      router.refresh()
    } catch {
      setErrors({ form: 'Sem conexão com o servidor. Tente de novo.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button type="button" className="jd-btn" onClick={() => dialog.current?.showModal()}>
        + Convidar pessoa
      </button>

      <dialog ref={dialog} className="jinv" aria-labelledby="jinv-title">
        {done ? (
          <div className="jinv__done">
            <h2 id="jinv-title">{done.warning ? 'Cadastro feito' : done.resent ? 'Convite reenviado' : 'Convite enviado'}</h2>
            {done.warning ? (
              <p className="jf-error">{done.warning}</p>
            ) : (
              <p>
                <b>{done.email}</b> recebeu um e-mail com o link para criar a senha. O link vale por 7 dias.
              </p>
            )}
            <div className="jinv__actions">
              <button type="button" className="jd-btn jd-btn--ghost" onClick={() => setDone(null)}>
                Convidar outra pessoa
              </button>
              <button type="button" className="jd-btn" onClick={() => dialog.current?.close()}>
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="jinv-title">Convidar pessoa</h2>
            <p className="jf-help">A pessoa recebe um e-mail para criar a própria senha e entrar no painel.</p>

            <label className="jinv__field">
              <span className="jf-label">Nome</span>
              <input name="nome" type="text" autoComplete="off" maxLength={120} placeholder="Como aparece na equipe" />
            </label>

            <label className="jinv__field">
              <span className="jf-label">
                E-mail<span className="required">*</span>
              </span>
              <input name="email" type="email" autoComplete="off" required aria-invalid={Boolean(errors.email)} placeholder="nome@juma-agro.com.br" />
              {errors.email && <span className="jf-error">{errors.email}</span>}
            </label>

            <fieldset className="jinv__field">
              <legend className="jf-label">Perfil</legend>
              <div className="jinv__roles">
                {USER_ROLES.map((r) => (
                  <label key={r.value} className={`jinv__role${papel === r.value ? ' is-active' : ''}`}>
                    <input type="radio" name="papel" value={r.value} checked={papel === r.value} onChange={() => setPapel(r.value)} />
                    <b>{r.label}</b>
                    <small>{r.hint}</small>
                  </label>
                ))}
              </div>
              {errors.papel && <span className="jf-error">{errors.papel}</span>}
            </fieldset>

            <fieldset className="jinv__field">
              <legend className="jf-label">Sites</legend>
              {papel === 'admin' ? (
                <p className="jf-help">Admin cuida dos dois sites.</p>
              ) : (
                <div className="jinv__sites">
                  {(['br', 'us'] as const).map((s) => (
                    <label key={s} className={`jinv__site${sites.includes(s) ? ' is-active' : ''}`}>
                      <input type="checkbox" checked={sites.includes(s)} onChange={() => toggleSite(s)} />
                      <Flag site={s} size={18} />
                      {s === 'br' ? 'Brasil' : 'Estados Unidos'}
                    </label>
                  ))}
                </div>
              )}
              {errors.sites && <span className="jf-error">{errors.sites}</span>}
            </fieldset>

            {errors.form && <p className="jf-error">{errors.form}</p>}

            <div className="jinv__actions">
              <button type="button" className="jd-btn jd-btn--ghost" onClick={() => dialog.current?.close()}>
                Cancelar
              </button>
              <button type="submit" className="jd-btn" disabled={sending}>
                {sending ? 'Enviando…' : 'Enviar convite'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  )
}
