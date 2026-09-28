'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

/**
 * Dropdown do painel: substitui o <select> nativo com a identidade do painel.
 * Acessível por teclado (setas, Enter, Esc) e fecha ao clicar fora.
 */
export type DropdownOption<T extends string> = {
  value: T
  label: string
  /** Bolinha colorida ou ícone curto à esquerda. */
  dot?: string
  hint?: string
}

type Props<T extends string> = {
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
  /** Conteúdo do botão; sem ele mostra o rótulo da opção atual. */
  trigger?: ReactNode
  label: string
  align?: 'left' | 'right'
  tone?: 'light' | 'dark'
  className?: string
  disabled?: boolean
}

export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  trigger,
  label,
  align = 'left',
  tone = 'light',
  className = '',
  disabled,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, options, value])

  const pick = (v: T) => {
    setOpen(false)
    if (v !== value) onChange(v)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (!open) return
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pick(options[active].value)
    }
  }

  return (
    <div ref={root} className={`jdd jdd--${tone} ${className}`} onKeyDown={onKey}>
      <button
        type="button"
        className="jdd__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger ?? (
          <>
            {current?.dot && <span className="jdd__dot" style={{ background: current.dot }} />}
            <span className="jdd__value">{current?.label ?? label}</span>
            <svg className="jdd__chevron" viewBox="0 0 24 24" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </>
        )}
      </button>
      {open && (
        <ul id={listId} role="listbox" aria-label={label} className={`jdd__menu jdd__menu--${align}`}>
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`jdd__option${i === active ? ' is-active' : ''}${o.value === value ? ' is-selected' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(o.value)}
            >
              {o.dot && <span className="jdd__dot" style={{ background: o.dot }} />}
              <span className="jdd__option-text">
                {o.label}
                {o.hint && <small>{o.hint}</small>}
              </span>
              {o.value === value && (
                <svg className="jdd__check" viewBox="0 0 24 24" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
