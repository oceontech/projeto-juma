'use client'

import { toast, useConfig, useField, useFormFields } from '@payloadcms/ui'
import { useRef, useState } from 'react'

import { UserAvatar, displayName } from './userMeta'

/**
 * Cartão de perfil no topo da conta: foto (enviar, trocar, tirar), nome e
 * cargo. A foto vai para a coleção `avatars` na hora; o usuário só muda
 * quando a pessoa salva.
 */
export function ProfileCard() {
  const { config } = useConfig()
  const foto = useField<number | string | null>({ path: 'foto' })
  const fotoUrl = useField<string | null>({ path: 'fotoUrl' })
  const nome = useField<string>({ path: 'nome' })
  const cargo = useField<string>({ path: 'cargo' })
  const email = useFormFields(([fields]) => fields.email?.value as string | undefined)
  const input = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const photo = foto.value ? (preview ?? fotoUrl.value ?? null) : null
  const name = displayName({ nome: nome.value, email })

  async function upload(file: File) {
    if (!file.type.startsWith('image/')) return toast.error('Escolha uma imagem (JPG, PNG ou WebP).')
    if (file.size > 8 * 1024 * 1024) return toast.error('A foto passa de 8 MB. Escolha uma menor.')
    setSending(true)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('_payload', '{}')
      const res = await fetch(`${config.serverURL}${config.routes.api}/avatars`, { method: 'POST', body, credentials: 'include' })
      const json = await res.json()
      if (!res.ok || !json?.doc?.id) throw new Error()
      const url = json.doc.sizes?.thumb?.url || json.doc.url || URL.createObjectURL(file)
      setPreview(url)
      fotoUrl.setValue(url)
      foto.setValue(json.doc.id)
      toast.success('Foto pronta. Clique em Salvar para manter.')
    } catch {
      toast.error('Não deu para enviar a foto. Tente de novo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="jup jup-profile">
      <div className="jup-photo">
        <button
          type="button"
          className={`jup-photo__btn${sending ? ' is-busy' : ''}`}
          onClick={() => input.current?.click()}
          aria-label={photo ? 'Trocar foto' : 'Adicionar foto'}
          disabled={sending}
        >
          <UserAvatar name={name || '?'} photo={photo} size={96} />
          <span className="jup-photo__cam" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
              <circle cx="12" cy="13.5" r="3.5" />
            </svg>
          </span>
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void upload(file)
            e.target.value = ''
          }}
        />
        <div className="jup-photo__actions">
          <button type="button" className="jup-link" onClick={() => input.current?.click()} disabled={sending}>
            {sending ? 'Enviando…' : photo ? 'Trocar foto' : 'Adicionar foto'}
          </button>
          {photo && !sending && (
            <button
              type="button"
              className="jup-link jup-link--muted"
              onClick={() => {
                foto.setValue(null)
                fotoUrl.setValue(null)
                setPreview(null)
              }}
            >
              Tirar
            </button>
          )}
        </div>
      </div>

      <div className="jup-fields">
        <label className="jup-field">
          <span>Nome</span>
          <input
            value={nome.value ?? ''}
            onChange={(e) => nome.setValue(e.target.value)}
            placeholder="Nome e sobrenome"
            autoComplete="name"
          />
        </label>
        <label className="jup-field">
          <span>
            Cargo ou área <small>opcional</small>
          </span>
          <input
            value={cargo.value ?? ''}
            onChange={(e) => cargo.setValue(e.target.value)}
            placeholder="Ex.: Comercial Sul, Marketing, RH"
          />
        </label>
      </div>
    </section>
  )
}
