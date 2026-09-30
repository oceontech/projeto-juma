'use client'

import { useField, useForm, useFormFields } from '@payloadcms/ui'
import type { ArrayFieldClientComponent, TextareaFieldClientComponent } from 'payload'
import { reduceFieldsToValues } from 'payload/shared'
import { useCallback } from 'react'

import { AiText } from './AiText'
import { askAi, type Section } from './usePostForm'

/** Contexto do post que vai junto para a IA (título, subtítulo, autor). */
function useContext() {
  const fields = useFormFields(([f]) => f)
  const v = reduceFieldsToValues(fields, true) as Record<string, any>
  return { site: 'br', titulo: v.titulo, subtitulo: v.subtitulo, assinatura: v.assinatura }
}

/** Adiciona seções no fim da lista (usado quando "Organizar" separa assuntos da introdução). */
function useAppendSections() {
  const form = useForm()
  const count = useFormFields(([f]) => f.secoes?.rows?.length ?? (typeof f.secoes?.value === 'number' ? f.secoes.value : 0))
  return useCallback(
    (rows: Section[]) => {
      rows.forEach((row, i) => {
        form.addFieldRow({
          path: 'secoes',
          schemaPath: 'secoes',
          rowIndex: count + i,
          subFieldState: {
            titulo: { value: row.titulo ?? '', initialValue: row.titulo ?? '', valid: true },
            paragrafos: { value: row.paragrafos ?? '', initialValue: row.paragrafos ?? '', valid: true },
          },
        })
      })
    },
    [form, count],
  )
}

/** Introdução da matéria com a etiqueta ✨ IA. */
export const IntroField: TextareaFieldClientComponent = ({ path, field }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path: path ?? field.name })
  const context = useContext()
  const append = useAppendSections()

  return (
    <AiText
      id="field-introducao"
      label="Introdução"
      description="O primeiro parágrafo, em destaque. Pode colar o texto inteiro aqui e usar ✨ IA › Organizar: ela separa introdução e seções."
      placeholder="Comece pelo problema do produtor ou pelo que a matéria vai responder."
      value={value ?? ''}
      onChange={setValue}
      error={showError ? errorMessage : undefined}
      minRows={4}
      onAi={async (mode, text) => {
        const out = await askAi<{ texto: string; secoes?: Section[] }>('campo', { ...context, modo: mode, alvo: 'intro', texto: text })
        if (out.secoes?.length) append(out.secoes)
        return out.texto
      }}
    />
  )
}

function SectionCard({ index, total }: { index: number; total: number }) {
  const form = useForm()
  const context = useContext()
  const base = `secoes.${index}`
  const titulo = useFormFields(([f]) => f[`${base}.titulo`])
  const texto = useFormFields(([f]) => f[`${base}.paragrafos`])
  const set = (key: 'titulo' | 'paragrafos', value: string) => {
    form.dispatchFields({ type: 'UPDATE', path: `${base}.${key}`, value } as never)
    form.setModified(true)
  }

  return (
    <li className="jsec">
      <AiText
        id={`field-secao-${index}`}
        label={`Seção ${index + 1}`}
        required
        value={String(texto?.value ?? '')}
        onChange={(v) => set('paragrafos', v)}
        error={texto?.valid === false ? texto.errorMessage || 'Escreva o texto da seção.' : undefined}
        placeholder="Texto da seção. Deixe uma linha em branco entre os parágrafos."
        minRows={5}
        head={
          <input
            className="jsec__title"
            value={String(titulo?.value ?? '')}
            onChange={(e) => set('titulo', e.target.value)}
            placeholder="Intertítulo da seção (ex.: Quando aplicar)"
            aria-label={`Intertítulo da seção ${index + 1}`}
          />
        }
        onAi={async (mode, text) => {
          const out = await askAi<{ texto: string; titulo?: string }>('campo', {
            ...context,
            modo: mode,
            alvo: 'secao',
            texto: text,
            titulo: titulo?.value,
          })
          // Intertítulo vazio ganha o sugerido; o que o autor escreveu fica.
          if (out.titulo && !String(titulo?.value ?? '').trim()) set('titulo', out.titulo)
          return out.texto
        }}
      />
      <div className="jsec__tools">
        <button type="button" disabled={index === 0} onClick={() => form.moveFieldRow({ path: 'secoes', moveFromIndex: index, moveToIndex: index - 1 })} title="Subir">
          ↑
        </button>
        <button type="button" disabled={index === total - 1} onClick={() => form.moveFieldRow({ path: 'secoes', moveFromIndex: index, moveToIndex: index + 1 })} title="Descer">
          ↓
        </button>
        <button type="button" className="is-danger" onClick={() => form.removeFieldRow({ path: 'secoes', rowIndex: index })} title="Remover a seção">
          Remover
        </button>
      </div>
    </li>
  )
}

/** Seções da matéria em cartões abertos, cada uma com intertítulo, texto e ✨ IA. */
export const SectionsField: ArrayFieldClientComponent = () => {
  const form = useForm()
  const rows = useFormFields(([f]) => f.secoes?.rows ?? []) as { id: string }[]

  return (
    <div className="jsecs">
      <div className="jsecs__head">
        <b>Seções</b>
        <span>Cada seção tem um intertítulo e o texto. Use ↑ ↓ para mudar a ordem.</span>
      </div>
      {rows.length > 0 && (
        <ol className="jsecs__list">
          {rows.map((row, i) => (
            <SectionCard key={row.id} index={i} total={rows.length} />
          ))}
        </ol>
      )}
      <button
        type="button"
        className="jsecs__add"
        onClick={() =>
          form.addFieldRow({
            path: 'secoes',
            schemaPath: 'secoes',
            rowIndex: rows.length,
            subFieldState: {
              titulo: { value: '', initialValue: '', valid: true },
              paragrafos: { value: '', initialValue: '', valid: true },
            },
          })
        }
      >
        + Adicionar seção
      </button>
    </div>
  )
}
