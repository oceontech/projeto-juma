'use client'

import { useField } from '@payloadcms/ui'
import type { CheckboxFieldClientComponent } from 'payload'

/** Liga/desliga em cartão: título e explicação à esquerda, chave à direita. */
export const SwitchCard: CheckboxFieldClientComponent = ({ path, field, readOnly }) => {
  const { value, setValue } = useField<boolean>({ path: path ?? field.name })
  const label = typeof field.label === 'string' ? field.label : field.name
  const help = typeof field.admin?.description === 'string' ? field.admin.description : ''
  return (
    <button type="button" role="switch" aria-checked={Boolean(value)} disabled={readOnly} className={`jpw jpw__row jpw__switch jswc${value ? ' is-on' : ''}`} onClick={() => setValue(!value)}>
      <span className="jpw__icon" aria-hidden>
        <svg viewBox="0 0 24 24">
          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
        </svg>
      </span>
      <span className="jpw__text">
        <b>{label}</b>
        {help && <small>{help}</small>}
      </span>
      <span className="jpw__toggle" aria-hidden />
    </button>
  )
}
