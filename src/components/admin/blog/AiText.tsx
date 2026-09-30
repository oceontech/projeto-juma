'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Etiqueta "✨ IA" dos blocos do editor (e do texto todo): corrigir, organizar,
 * aprimorar ou aprimorar e aumentar.
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

/** Menu "✨ IA" com os quatro modos. */
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
