'use client'

import { useField } from '@payloadcms/ui'
import type { DateFieldClientComponent } from 'payload'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

/**
 * Campo de data do painel: calendário próprio, sem selects nativos.
 * Guarda a data ao meio-dia UTC para não "voltar um dia" por fuso horário.
 */
const WEEK = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const toIso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d, 12)).toISOString()
const parts = (iso?: string | null) => {
  if (!iso) return null
  const d = new Date(iso)
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() }
}

export const DateField: DateFieldClientComponent = ({ path, field, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path: path ?? field.name })
  const [open, setOpen] = useState(false)
  const selected = parts(value)
  const today = parts(new Date().toISOString())!
  const [view, setView] = useState(() => ({ y: selected?.y ?? today.y, m: selected?.m ?? today.m }))
  const root = useRef<HTMLDivElement>(null)
  const id = useId()
  const label = typeof field.label === 'string' ? field.label : field.name

  useEffect(() => {
    if (!open) return
    const s = parts(value)
    if (s) setView({ y: s.y, m: s.m })
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const days = useMemo(() => {
    const first = new Date(Date.UTC(view.y, view.m, 1))
    const offset = (first.getUTCDay() + 6) % 7 // segunda = 0
    const total = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate()
    return [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)] as (number | null)[]
  }, [view])

  const move = (delta: number) =>
    setView((v) => {
      const m = v.m + delta
      return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 }
    })

  const display = selected ? `${String(selected.d).padStart(2, '0')}/${String(selected.m + 1).padStart(2, '0')}/${selected.y}` : ''

  return (
    <div className={`jf field-type date${showError ? ' error' : ''}`} ref={root}>
      <label className="jf-label" htmlFor={id}>
        {label}
        {field.required && <span className="required">*</span>}
      </label>
      <button id={id} type="button" className="jf-date__trigger" disabled={readOnly} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span>{display || 'Escolher data'}</span>
      </button>
      {showError && <span className="jf-error">{errorMessage}</span>}
      {field.admin?.description && typeof field.admin.description === 'string' && <span className="jf-help">{field.admin.description}</span>}
      {open && (
        <div className="jf-cal" role="dialog" aria-label={`Escolher ${label}`}>
          <div className="jf-cal__head">
            <button type="button" onClick={() => move(-1)} aria-label="Mês anterior">
              ‹
            </button>
            <b>
              {MONTHS[view.m]} {view.y}
            </b>
            <button type="button" onClick={() => move(1)} aria-label="Próximo mês">
              ›
            </button>
          </div>
          <div className="jf-cal__grid">
            {WEEK.map((w) => (
              <span key={w} className="jf-cal__dow">
                {w}
              </span>
            ))}
            {days.map((d, i) =>
              d === null ? (
                <span key={`e${i}`} />
              ) : (
                <button
                  key={d}
                  type="button"
                  className={`jf-cal__day${selected && selected.d === d && selected.m === view.m && selected.y === view.y ? ' is-selected' : ''}${today.d === d && today.m === view.m && today.y === view.y ? ' is-today' : ''}`}
                  onClick={() => {
                    setValue(toIso(view.y, view.m, d))
                    setOpen(false)
                  }}
                >
                  {d}
                </button>
              ),
            )}
          </div>
          <div className="jf-cal__foot">
            <button
              type="button"
              onClick={() => {
                setValue(toIso(today.y, today.m, today.d))
                setOpen(false)
              }}
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
