'use client'

import { useDocumentInfo, useForm, useFormFields, useFormModified } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import { useCallback } from 'react'

export type Section = { titulo?: string; paragrafos?: string }

/**
 * Lê e escreve no formulário do post (Matéria BR ou Post EUA) de fora dos
 * campos: usado pelo assistente de IA, pela linha do tempo e pela prévia.
 */
export function usePostForm() {
  const form = useForm()
  const fields = useFormFields(([f]) => f)
  const modified = useFormModified()
  const { id } = useDocumentInfo()
  const values = reduceFieldsToValues(fields, true) as Record<string, any>

  // No formulário a lista de seções pode vir como contagem de linhas antes de ter conteúdo.
  const sections: Section[] = Array.isArray(values.secoes) ? values.secoes.filter(Boolean) : []

  const set = useCallback(
    (path: string, value: unknown, { remount = false } = {}) => {
      // `initialValue` junto faz o editor de texto rico recarregar com o conteúdo novo.
      form.dispatchFields({ type: 'UPDATE', path, value, ...(remount ? { initialValue: value } : {}) } as never)
      form.setModified(true)
    },
    [form],
  )

  const setSections = useCallback(
    (rows: Section[]) => {
      const count = fields.secoes?.rows?.length ?? (typeof fields.secoes?.value === 'number' ? fields.secoes.value : 0)
      for (let i = count - 1; i >= 0; i--) form.removeFieldRow({ path: 'secoes', rowIndex: i })
      rows.forEach((row, i) => {
        const titulo = row.titulo ?? ''
        const paragrafos = row.paragrafos ?? ''
        form.addFieldRow({
          path: 'secoes',
          schemaPath: 'secoes',
          rowIndex: i,
          subFieldState: {
            titulo: { value: titulo, initialValue: titulo, valid: true },
            paragrafos: { value: paragrafos, initialValue: paragrafos, valid: true },
          },
        })
      })
      form.setModified(true)
    },
    [fields.secoes, form],
  )

  /** Valores atuais do formulário (sem esperar o próximo render). */
  const read = useCallback(() => form.getData() as Record<string, any>, [form])

  return { values, sections, set, setSections, read, id, modified }
}

/** Chama o assistente (POST /api/ai/:action) e devolve o JSON ou lança o erro em português. */
export async function askAi<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/ai/${action}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'A IA não respondeu. Tente de novo.')
  return data as T
}
