'use client'

import { useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent, RelationshipFieldClientComponent } from 'payload'
import Link from 'next/link'

/** Nomes amigáveis das respostas que os formulários enviam em `dados`. */
const KEY_LABEL: Record<string, string> = {
  state: 'Estado',
  crop: 'Cultura',
  acres: 'Área (acres)',
  wantsCall: 'Quer ligação',
  source: 'Página',
  regiao: 'Região',
  cultura: 'Cultura',
  produto: 'Produto',
}

const show = (v: unknown) => (typeof v === 'boolean' ? (v ? 'Sim' : 'Não') : Array.isArray(v) ? v.join(', ') : String(v))

/** Respostas do formulário (JSON) como lista de rótulo e valor. */
export const FormAnswersField: JSONFieldClientComponent = ({ path, field }) => {
  const { value } = useField<Record<string, unknown> | null>({ path: path ?? field.name })
  const entries = Object.entries(value ?? {}).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  return (
    <div className="jf">
      <span className="jf-label">{typeof field.label === 'string' ? field.label : 'Respostas do formulário'}</span>
      {entries.length ? (
        <dl className="jf-answers">
          {entries.map(([k, v]) => (
            <div key={k}>
              <dt>{KEY_LABEL[k] ?? k}</dt>
              <dd>{show(v)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <span className="jf-help">Este formulário não enviou respostas extras.</span>
      )}
    </div>
  )
}

/** "Repetição de": link para o lead original, ou um aviso de que é o primeiro contato. */
export const DuplicateOfField: RelationshipFieldClientComponent = ({ path, field }) => {
  const { value } = useField<number | { id: number } | null>({ path: path ?? field.name })
  const id = value && typeof value === 'object' ? value.id : value
  return (
    <div className="jf">
      <span className="jf-label">Contato repetido?</span>
      {id ? (
        <Link className="jf-badge jf-badge--link" href={`/admin/collections/leads/${id}`}>
          Sim · abrir o primeiro contato →
        </Link>
      ) : (
        <span className="jf-badge">Não, primeiro contato</span>
      )}
    </div>
  )
}
