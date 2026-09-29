'use client'

import { useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { useEffect, useRef } from 'react'

/** "Nutrição na fase certa!" → "nutricao-na-fase-certa" */
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
}

type Props = { source: string; prefix: string }

/**
 * Endereço do post. Num post novo acompanha o título sozinho (até alguém
 * editar o endereço à mão); num post já salvo não muda mais, para não
 * quebrar o link de quem já compartilhou.
 */
export const SlugField: TextFieldClientComponent = (props) => {
  const { source, prefix } = props as unknown as Props
  const { path, field } = props
  const { value, setValue, showError, errorMessage } = useField<string>({ path: path ?? field.name })
  const title = useFormFields(([fields]) => fields[source]?.value) as string | undefined
  const { id } = useDocumentInfo()
  const lastAuto = useRef<string | null>(null)

  useEffect(() => {
    if (id || typeof title !== 'string') return
    if (!value || value === lastAuto.current) {
      const next = slugify(title)
      lastAuto.current = next
      if (next !== value) setValue(next)
    }
  }, [title, id, value, setValue])

  return (
    <div className={`jf jf-slug${showError ? ' has-error' : ''}`}>
      <label className="jf-label" htmlFor="field-slug">
        Endereço da página <span className="required">*</span>
      </label>
      <div className="jf-slug__box">
        <span className="jf-slug__prefix">{prefix}</span>
        <input
          id="field-slug"
          type="text"
          value={value ?? ''}
          // Enquanto digita: minúsculas, sem acento, espaço vira hífen (o hífen do fim fica, para continuar digitando).
          onChange={(e) =>
            setValue(
              e.target.value
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-{2,}/g, '-'),
            )
          }
          placeholder="gerado-a-partir-do-titulo"
          spellCheck={false}
        />
      </div>
      <p className="jf-help">
        {id
          ? 'Mudar o endereço de um post publicado quebra os links já compartilhados.'
          : 'Preenchido a partir do título. Pode ajustar à mão.'}
      </p>
      {showError && errorMessage && <p className="jf-error">{errorMessage}</p>}
    </div>
  )
}
