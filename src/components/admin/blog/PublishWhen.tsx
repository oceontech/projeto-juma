'use client'

import { useDocumentInfo, useField } from '@payloadcms/ui'
import type { DateFieldClientComponent } from 'payload'
import { useMemo, useState } from 'react'

/**
 * "Quando publicar" (etapa Publicação): por padrão o post vai ao ar na hora em
 * que se clica em Publicar agora. Ligando "Agendar publicação" aparecem o dia
 * e a hora; o botão do topo vira "Agendar publicação" e o site só mostra o post
 * a partir desse momento. A data também é a data exibida na matéria.
 */

const WEEK = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)

/** Mais de 1 minuto no futuro conta como agendado (mesma regra do botão do topo). */
export const isScheduled = (iso?: string | null) => Boolean(iso) && new Date(iso as string).getTime() > Date.now() + 60_000

/** "Quarta-feira, 1 de outubro, às 09:00" */
const long = (d: Date) => {
  const day = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const text = `${day}${d.getFullYear() !== new Date().getFullYear() ? ` de ${d.getFullYear()}` : ''}, às ${time}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}
const short = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

function tomorrowAt9() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  return d
}

function Calendar({ value, onPick, minToday }: { value: Date; onPick: (y: number, m: number, d: number) => void; minToday?: boolean }) {
  const [view, setView] = useState({ y: value.getFullYear(), m: value.getMonth() })
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const days = useMemo(() => {
    const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7
    const total = new Date(view.y, view.m + 1, 0).getDate()
    return [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)] as (number | null)[]
  }, [view])
  const move = (delta: number) =>
    setView((v) => {
      const m = v.m + delta
      return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 }
    })
  return (
    <div className="jpw__cal">
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
        {days.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />
          const past = minToday && new Date(view.y, view.m, d).getTime() < start
          const selected = value.getFullYear() === view.y && value.getMonth() === view.m && value.getDate() === d
          const isToday = today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === d
          return (
            <button
              key={d}
              type="button"
              disabled={past}
              className={`jf-cal__day${selected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}`}
              onClick={() => onPick(view.y, view.m, d)}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const PublishWhen: DateFieldClientComponent = ({ path, field, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path: path ?? field.name })
  const { hasPublishedDoc } = useDocumentInfo()
  const [schedule, setSchedule] = useState(() => isScheduled(value))
  const [editDate, setEditDate] = useState(false)
  const current = value ? new Date(value) : new Date()
  const time = `${String(current.getHours()).padStart(2, '0')}:${current.getMinutes() < 30 ? '00' : '30'}`
  const live = hasPublishedDoc && !isScheduled(value)

  const toggle = () => {
    if (readOnly) return
    const next = !schedule
    setSchedule(next)
    setValue((next ? tomorrowAt9() : new Date()).toISOString())
  }

  const pickDay = (y: number, m: number, d: number) => {
    const next = new Date(current)
    next.setFullYear(y, m, d)
    setValue(next.toISOString())
  }

  const pickTime = (hhmm: string) => {
    const [h, min] = hhmm.split(':').map(Number)
    const next = new Date(current)
    next.setHours(h, min, 0, 0)
    setValue(next.toISOString())
  }

  // Já está no ar: mostra quando foi publicada e deixa trocar só a data exibida.
  if (live && !schedule) {
    return (
      <div className="jpw">
        <div className="jpw__row">
          <span className="jpw__icon is-live" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
          <div className="jpw__text">
            <b>No ar desde {short(current)}</b>
            <small>Essa é a data que aparece na matéria.</small>
          </div>
          {!readOnly && (
            <button type="button" className="jai__btn jai__btn--ghost" onClick={() => setEditDate((o) => !o)}>
              {editDate ? 'Pronto' : 'Alterar data'}
            </button>
          )}
        </div>
        {editDate && (
          <div className="jpw__body">
            <Calendar value={current} onPick={pickDay} />
          </div>
        )}
      </div>
    )
  }

  const past = schedule && !isScheduled(value)

  return (
    <div className={`jpw${schedule ? ' is-on' : ''}${showError ? ' has-error' : ''}`}>
      <button type="button" className="jpw__row jpw__switch" role="switch" aria-checked={schedule} onClick={toggle} disabled={readOnly}>
        <span className="jpw__icon" aria-hidden>
          <svg viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </span>
        <span className="jpw__text">
          <b>Agendar publicação</b>
          <small>{schedule ? 'O post entra no ar sozinho no dia e hora abaixo.' : 'Desligado: o post entra no ar quando você clicar em Publicar agora.'}</small>
        </span>
        <span className="jpw__toggle" aria-hidden />
      </button>

      {schedule && (
        <div className="jpw__body">
          <Calendar value={current} onPick={pickDay} minToday />
          <div className="jpw__side">
            <label className="jpw__time">
              <span>Horário</span>
              <select value={time} onChange={(e) => pickTime(e.target.value)} disabled={readOnly}>
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <p className={`jpw__summary${past ? ' is-warn' : ''}`}>
              {past ? (
                <>Esse horário já passou. Escolha um dia e hora no futuro.</>
              ) : (
                <>
                  Vai ao ar em
                  <b>{long(current)}</b>
                  <small>Horário deste computador. O site pode levar até 15 minutos para mostrar.</small>
                </>
              )}
            </p>
          </div>
        </div>
      )}
      {showError && errorMessage && <p className="jf-error">{errorMessage}</p>}
    </div>
  )
}
