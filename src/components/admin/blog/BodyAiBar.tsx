'use client'

import { toast } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { useState } from 'react'

import { AiMenu, type AiMode } from './AiText'
import { askAi, usePostForm } from './usePostForm'

/**
 * Etiqueta "✨ IA" em cima do editor do texto do post EUA: corrige,
 * organiza, aprimora ou aumenta o texto inteiro, com "Desfazer".
 */
export const BodyAiBar: UIFieldClientComponent = () => {
  const { values, set } = usePostForm()
  const [busy, setBusy] = useState(false)
  const [undo, setUndo] = useState<unknown>(null)
  const hasText = JSON.stringify(values.body ?? '').match(/"text":"[^"]{3,}/) !== null

  const pick = async (mode: AiMode) => {
    setBusy(true)
    const before = values.body
    try {
      const out = await askAi<{ body: unknown }>('campo', {
        site: 'us',
        title: values.title,
        excerpt: values.excerpt,
        author: values.author,
        body: values.body,
        modo: mode,
        alvo: 'corpo',
      })
      set('body', out.body, { remount: true })
      setUndo(before)
      toast.success('Texto atualizado')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="jait-body">
      <span>
        Texto do post, em inglês. Pode colar tudo e usar <b>✨ IA › Organizar e corrigir</b>.
      </span>
      <div className="jait__bar">
        <AiMenu busy={busy} onPick={pick} disabled={!hasText} label="IA no texto" />
        {undo !== null && (
          <button
            type="button"
            className="jait__undo"
            onClick={() => {
              set('body', undo, { remount: true })
              setUndo(null)
            }}
          >
            ↺ Desfazer
          </button>
        )}
      </div>
    </div>
  )
}
