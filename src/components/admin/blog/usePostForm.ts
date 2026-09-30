'use client'

import { useDocumentInfo, useForm, useFormFields, useFormModified } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import { useCallback, useMemo } from 'react'

import { blocksToLexical, lexicalToBlocks, type Block } from '../../../features/ai/lexical'
import { readBlocks } from '../../../features/articles/blocks'

type Site = 'br' | 'us'

/** Campo do texto em blocos: `conteudo` (json) no BR, `body` (texto rico) no EUA. */
export const blocksPath = (site: Site) => (site === 'us' ? 'body' : 'conteudo')

/** Texto do post em blocos, a partir dos valores do formulário. */
export const blocksOf = (site: Site, values: Record<string, any>): Block[] =>
  site === 'us' ? lexicalToBlocks(values.body) : readBlocks(values.conteudo)

/**
 * Lê e escreve no formulário do post (Matéria BR ou Post EUA) de fora dos
 * campos: usado pelo assistente de IA, pelo progresso e pela prévia.
 */
export function usePostForm() {
  const form = useForm()
  const fields = useFormFields(([f]) => f)
  const modified = useFormModified()
  const { id } = useDocumentInfo()
  const values = useMemo(() => reduceFieldsToValues(fields, true) as Record<string, any>, [fields])

  const set = useCallback(
    (path: string, value: unknown, { remount = false } = {}) => {
      // `initialValue` junto faz o editor de texto rico recarregar com o conteúdo novo.
      form.dispatchFields({ type: 'UPDATE', path, value, ...(remount ? { initialValue: value } : {}) } as never)
      form.setModified(true)
    },
    [form],
  )

  /** Troca o texto todo (a revisão com IA usa para corrigir e inserir blocos). */
  const setBlocks = useCallback(
    (site: Site, blocks: Block[]) => set(blocksPath(site), site === 'us' ? blocksToLexical(blocks) : blocks),
    [set],
  )

  /** Valores atuais do formulário (sem esperar o próximo render). */
  const read = useCallback(() => form.getData() as Record<string, any>, [form])

  return { values, set, setBlocks, read, id, modified }
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
