'use client'

import { toast } from '@payloadcms/ui'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { askAi } from './usePostForm'

/**
 * Caixa de texto do post com a etiqueta "✨ IA" no canto: corrigir,
 * organizar, aprimorar ou aprimorar e aumentar só aquele texto. Depois de
 * aplicar, aparece "Desfazer" até a próxima edição.
 */

export type AiMode = 'ortografia' | 'organizar' | 'aprimorar' | 'aumentar'

const MODES: { value: AiMode; label: string; hint: string }[] = [
  { value: 'ortografia', label: 'Corrigir ortografia', hint: 'Acentos, concordância e pontuação' },
  { value: 'organizar', label: 'Organizar e corrigir', hint: 'Ordem das ideias e parágrafos' },
  { value: 'aprimorar', label: 'Aprimorar', hint: 'Mais claro e direto, mesmo tamanho' },
  { value: 'aumentar', label: 'Aprimorar e aumentar', hint: 'Desenvolve o que já está dito, sem inventar dados' },
]

function Spark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />
    </svg>
  )
}

/** Menu "✨ IA" (usado também em cima do editor do post EUA). */
export function AiMenu({ busy, onPick, disabled, label = 'IA' }: { busy: boolean; onPick: (m: AiMode) => void; disabled?: boolean; label?: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="jait__menu" ref={root}>
      <button
        type="button"
        className={`jait__chip${busy ? ' is-busy' : ''}`}
        onClick={() => setOpen((o) => !o)}
        disabled={busy || disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        title={disabled ? 'Escreva algo antes de usar a IA' : 'Ajustar com IA'}
      >
        {busy ? <span className="jai__spinner" aria-hidden /> : <Spark />}
        {busy ? 'Escrevendo…' : label}
      </button>
      {open && (
        <ul className="jait__list" role="menu">
          {MODES.map((m) => (
            <li key={m.value}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  onPick(m.value)
                }}
              >
                <b>{m.label}</b>
                <small>{m.hint}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type Props = {
  id: string
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  minRows?: number
  /** Chama a IA com o modo escolhido; devolve o texto novo (ou null se já aplicou outra coisa). */
  onAi: (mode: AiMode, text: string) => Promise<string | null>
  /** Título ao lado (seção): vai junto no mesmo cartão. */
  head?: React.ReactNode
}

export function AiText({ id, label, description, value, onChange, placeholder, required, error, minRows = 4, onAi, head }: Props) {
  const box = useRef<HTMLTextAreaElement>(null)
  const [busy, setBusy] = useState(false)
  const [undo, setUndo] = useState<string | null>(null)

  // Cresce com o texto, sem barra de rolagem interna.
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])

  const pick = async (mode: AiMode) => {
    setBusy(true)
    const before = value
    try {
      const next = await onAi(mode, value)
      if (next !== null) onChange(next)
      setUndo(before)
      toast.success(MODES.find((m) => m.value === mode)!.label + ': pronto')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`jait${error ? ' has-error' : ''}`}>
      <label className="jait__label" htmlFor={id}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div className="jait__box">
        {head}
        <textarea
          id={id}
          ref={box}
          value={value}
          rows={minRows}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value)
            if (undo !== null) setUndo(null)
          }}
        />
        <div className="jait__bar">
          <AiMenu busy={busy} onPick={pick} disabled={value.trim().split(/\s+/).length < 3} />
          {undo !== null && (
            <button
              type="button"
              className="jait__undo"
              onClick={() => {
                onChange(undo)
                setUndo(null)
              }}
            >
              ↺ Desfazer
            </button>
          )}
        </div>
      </div>
      {description && <p className="jf-help">{description}</p>}
      {error && <p className="jf-error">{error}</p>}
    </div>
  )
}
