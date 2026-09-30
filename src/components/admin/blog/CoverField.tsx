'use client'

import { toast, useField } from '@payloadcms/ui'
import type { UploadFieldClientComponent } from 'payload'
import { useEffect, useRef, useState } from 'react'

import { MediaLibrary, type MediaItem } from './MediaLibrary'
import { askAi, usePostForm } from './usePostForm'

/**
 * Capa do post: área de mídia (arrastar ou "Enviar mídia" › do computador ou
 * da biblioteca) e a IA em três modos: a partir do texto, com um pedido
 * próprio ou aprimorando a imagem escolhida. Substitui o campo de upload
 * padrão do Payload (sem "Criar novo").
 */

type Site = 'br' | 'us'
type Mode = 'contexto' | 'prompt' | 'aprimorar'
type Media = { id: number; url: string; alt: string; filename?: string; width?: number; height?: number }

function useMedia(id: number | null | undefined) {
  const [media, setMedia] = useState<Media | null>(null)
  useEffect(() => {
    if (!id) return setMedia(null)
    let alive = true
    fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setMedia({ id: d.id, url: d.url, alt: d.alt ?? '', filename: d.filename, width: d.width, height: d.height }))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [id])
  return media
}

async function uploadFile(file: File, alt: string): Promise<Media> {
  if (!file.type.startsWith('image/')) throw new Error('Envie uma imagem (JPG, PNG ou WebP).')
  if (file.size > 15 * 1024 * 1024) throw new Error('Imagem grande demais (máximo 15 MB).')
  const form = new FormData()
  form.append('file', file)
  form.append('_payload', JSON.stringify({ alt: alt || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') }))
  const res = await fetch('/api/media', { method: 'POST', credentials: 'include', body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.errors?.[0]?.message ?? 'Não foi possível enviar a imagem.')
  return { id: data.doc.id, url: data.doc.url, alt: data.doc.alt, filename: data.doc.filename }
}

function Clip() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="jcov__clip">
      <path d="m21.4 11.1-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.7 3.7 0 0 1 5.2 5.2l-8.5 8.5a1.8 1.8 0 0 1-2.6-2.6l7.8-7.8" />
    </svg>
  )
}

/** Botão único "Enviar mídia" com as duas origens. */
function SendMenu({ onLocal, onLibrary, label = 'Enviar mídia', ghost }: { onLocal: () => void; onLibrary: () => void; label?: string; ghost?: boolean }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return (
    <div className="jcov__send" ref={root}>
      <button type="button" className={ghost ? 'jai__btn jai__btn--ghost' : 'jai__btn'} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {label} ▾
      </button>
      {open && (
        <ul className="jait__list jcov__options" role="menu">
          <li>
            <button type="button" role="menuitem" onClick={() => (setOpen(false), onLocal())}>
              <b>Do computador ou celular</b>
              <small>Abre seus arquivos ou a galeria</small>
            </button>
          </li>
          <li>
            <button type="button" role="menuitem" onClick={() => (setOpen(false), onLibrary())}>
              <b>Da biblioteca</b>
              <small>Imagens já enviadas ao painel</small>
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

export const CoverField: UploadFieldClientComponent = (props) => {
  const { site } = props as unknown as { site: Site }
  const { path, field } = props
  const { value, setValue, showError, errorMessage } = useField<number | null>({ path: path ?? field.name })
  const id = typeof value === 'object' && value ? (value as { id: number }).id : value
  const media = useMedia(id)
  const { values, sections } = usePostForm()
  const title = String((site === 'us' ? values.title : values.titulo) ?? '')

  const fileInput = useRef<HTMLInputElement>(null)
  const [library, setLibrary] = useState(false)
  const [drag, setDrag] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState<Mode>('contexto')
  const [request, setRequest] = useState('')
  const [busy, setBusy] = useState(false)
  const [previous, setPrevious] = useState<number | null | undefined>(undefined)

  const apply = (next: number | null) => {
    setPrevious(id ?? null)
    setValue(next)
  }

  const upload = async (file?: File | null) => {
    if (!file) return
    setUploading(true)
    try {
      const m = await uploadFile(file, title)
      apply(m.id)
      toast.success('Imagem enviada')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const generate = async () => {
    setBusy(true)
    try {
      const out = await askAi<Media>('capa', {
        ...values,
        site,
        secoes: sections,
        modo: mode,
        pedido: request,
        imagem: mode === 'aprimorar' ? id : undefined,
      })
      apply(out.id)
      toast.success(mode === 'aprimorar' ? 'Imagem aprimorada' : 'Capa criada')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const hasText = Boolean(title) || Boolean(values.introducao) || sections.length > 0 || Boolean(values.body)

  return (
    <div className={`jcov${showError ? ' has-error' : ''}`}>
      <p className="jait__label">
        Imagem de capa {field.required && <span className="required">*</span>}
      </p>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void upload(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {media ? (
        <div className="jcov__current">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.url} alt={media.alt} />
          <div className="jcov__meta">
            <span>
              <b>{media.alt || media.filename}</b>
              {media.width && media.height ? (
                <small>
                  {media.width}×{media.height}
                  {media.width < 1200 ? ' · pequena para capa' : ''}
                </small>
              ) : null}
            </span>
            <div className="jcov__actions">
              <SendMenu ghost label="Trocar" onLocal={() => fileInput.current?.click()} onLibrary={() => setLibrary(true)} />
              <button type="button" className="jai__btn jai__btn--ghost" onClick={() => apply(null)}>
                Remover
              </button>
              {previous !== undefined && (
                <button
                  type="button"
                  className="jait__undo"
                  onClick={() => {
                    setValue(previous)
                    setPrevious(undefined)
                  }}
                >
                  ↺ Voltar à anterior
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`jcov__drop${drag ? ' is-drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            void upload(e.dataTransfer.files?.[0])
          }}
        >
          <Clip />
          {uploading ? (
            <p>
              <span className="jai__spinner" aria-hidden /> Enviando…
            </p>
          ) : (
            <>
              <p>
                <b>Arraste uma imagem aqui</b>
                <span>ou</span>
              </p>
              <SendMenu onLocal={() => fileInput.current?.click()} onLibrary={() => setLibrary(true)} />
              <small>JPG, PNG ou WebP, na horizontal, de preferência com 1600 px de largura ou mais.</small>
            </>
          )}
        </div>
      )}
      {showError && errorMessage && <p className="jf-error">{errorMessage}</p>}

      <section className="jai jcov__ai">
        <header className="jai__head">
          <svg viewBox="0 0 24 24" aria-hidden className="jai__spark">
            <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />
          </svg>
          <div>
            <b>Criar capa com IA</b>
            <p>Foto no estilo editorial, sem letreiros nem embalagens. Leva uns 20 segundos.</p>
          </div>
        </header>
        <div className="jsp" role="radiogroup" aria-label="Como criar">
          {(
            [
              ['contexto', 'A partir do texto'],
              ['prompt', 'Com meu pedido'],
              ['aprimorar', 'Aprimorar imagem'],
            ] as const
          ).map(([m, label]) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} className={`jsp__opt${mode === m ? ' is-active' : ''}`} onClick={() => setMode(m)}>
              {label}
            </button>
          ))}
        </div>

        {mode === 'contexto' && (
          <p className="jai__muted jcov__hint">
            {hasText ? 'A IA lê o título e o texto que você escreveu e cria uma foto que combina com o assunto.' : 'Escreva o título e o texto antes: a capa nasce deles.'}
          </p>
        )}
        {mode !== 'contexto' && (
          <label className="jai__field jcov__hint">
            <span>{mode === 'prompt' ? 'Descreva a imagem' : 'O que melhorar na imagem'}</span>
            <textarea
              rows={2}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder={
                mode === 'prompt'
                  ? site === 'us'
                    ? 'Ex.: citrus grove at sunrise in Florida, drone view'
                    : 'Ex.: lavoura de soja ao amanhecer, visão de drone'
                  : 'Ex.: deixar a luz mais quente, tirar o trator do fundo, céu mais limpo'
              }
            />
          </label>
        )}
        {mode === 'aprimorar' && !media && (
          <p className="jai__muted">Escolha antes a imagem: envie uma ou pegue da biblioteca, acima.</p>
        )}

        <div className="jai__row">
          <button
            type="button"
            className="jai__btn"
            disabled={busy || (mode === 'contexto' ? !hasText : !request.trim()) || (mode === 'aprimorar' && !media)}
            onClick={generate}
          >
            {busy && <span className="jai__spinner" aria-hidden />}
            {busy ? 'Criando a imagem…' : mode === 'aprimorar' ? 'Aprimorar esta imagem' : media ? 'Criar e trocar a capa' : 'Criar capa'}
          </button>
        </div>
      </section>

      {library && (
        <MediaLibrary
          onClose={() => setLibrary(false)}
          onPick={(m: MediaItem) => {
            apply(m.id)
            setLibrary(false)
          }}
        />
      )}
    </div>
  )
}
