'use client'

import { useField } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'

import { LEAD_FORMS, LEAD_STATUS, SITE_META } from '../leadMeta'

/** Status do lead como botões: um clique troca o status (salva ao salvar o lead). */
export const LeadStatusField: SelectFieldClientComponent = ({ path, readOnly }) => {
  const { value, setValue } = useField<string>({ path: path ?? 'status' })
  const current = value ?? 'novo'
  return (
    <div className="jf">
      <span className="jf-label">Status do atendimento</span>
      <div className="jf-chips" role="radiogroup" aria-label="Status do atendimento">
        {LEAD_STATUS.map((s) => {
          const active = s.value === current
          return (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={readOnly}
              className={`jf-chip${active ? ' is-active' : ''}`}
              style={active ? { background: s.bg, color: s.fg, boxShadow: `inset 0 0 0 1.5px ${s.dot}` } : undefined}
              onClick={() => setValue(s.value)}
            >
              <span className="jf-chip__dot" style={{ background: s.dot }} />
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Site de origem: etiqueta, não campo (não muda depois que o lead chega). */
export const LeadSiteField: SelectFieldClientComponent = ({ path }) => {
  const { value } = useField<'br' | 'us'>({ path: path ?? 'site' })
  const site = SITE_META[value ?? 'br']
  return (
    <div className="jf">
      <span className="jf-label">Site de origem</span>
      <span className="jf-badge">
        <span className="jf-badge__flag" style={{ background: site.gradient }}>
          {site.short}
        </span>
        {site.label}
      </span>
    </div>
  )
}

/** Formulário que gerou o lead: etiqueta. */
export const LeadFormField: SelectFieldClientComponent = ({ path }) => {
  const { value } = useField<string>({ path: path ?? 'formulario' })
  return (
    <div className="jf">
      <span className="jf-label">Formulário</span>
      <span className="jf-badge">{LEAD_FORMS[value ?? ''] ?? '—'}</span>
    </div>
  )
}
