'use client'

import { toast, useField, useLocale } from '@payloadcms/ui'
import type { RelationshipFieldClientComponent } from 'payload'
import { useEffect, useRef, useState } from 'react'

/**
 * Categoria do post em etiquetas: um clique escolhe, "+ Nova" cria na hora e
 * "Editar nomes" renomeia sem sair do post. Substitui o select do Payload.
 */

type Site = 'br' | 'us'
type Cat = { id: number; nome: string }

export const CategoryField: RelationshipFieldClientComponent = (props) => {
  const { site } = props as unknown as { site: Site }
  const { path, field, readOnly } = props
  const { value, setValue, showError, errorMessage } = useField<number | { id: number } | null>({ path: path ?? field.name })
  const selected = typeof value === 'object' && value ? value.id : value
  const { code } = useLocale()
  const locale = site === 'us' ? 'pt-BR' : code || 'pt-BR'

  const [cats, setCats] = useState<Cat[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/categorias?where[site][equals]=${site}&sort=ordem&limit=100&depth=0&locale=${locale}&fallback-locale=pt-BR`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { docs: [] }))
      .then((d) => alive && setCats((d.docs ?? []).map((c: Cat) => ({ id: c.id, nome: c.nome ?? '' }))))
      .catch(() => alive && setCats([]))
    return () => {
      alive = false
    }
  }, [site, locale])

  useEffect(() => {
    if (creating) input.current?.focus()
  }, [creating])

  const create = async () => {
    const nome = name.trim()
    if (!nome) return
    setBusy(true)
    try {
      const r = await fetch(`/api/categorias?locale=${locale}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nome, site }),
      })
      if (!r.ok) throw new Error('Não foi possível criar a categoria.')
      const doc = (await r.json()).doc as Cat
      setCats((list) => [...(list ?? []), { id: doc.id, nome }])
      setValue(doc.id)
      setName('')
      setCreating(false)
      toast.success(`Categoria “${nome}” criada`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const rename = async (cat: Cat, nome: string) => {
    nome = nome.trim()
    if (!nome || nome === cat.nome) return
    const r = await fetch(`/api/categorias/${cat.id}?locale=${locale}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome }),
    })
    if (!r.ok) return toast.error('Não foi possível renomear.')
    setCats((list) => (list ?? []).map((c) => (c.id === cat.id ? { ...c, nome } : c)))
    toast.success('Categoria renomeada')
  }

  return (
    <div className={`jf jcat${showError ? ' has-error' : ''}`}>
      <div className="jcat__head">
        <span className="jf-label">
          {typeof field.label === 'string' ? field.label : 'Categoria'}
          {field.required && <span className="required">*</span>}
        </span>
        {!readOnly && Boolean(cats?.length) && (
          <button type="button" className="jcat__link" onClick={() => setEditing((e) => !e)}>
            {editing ? 'Pronto' : 'Editar nomes'}
          </button>
        )}
      </div>

      <div className="jcat__list" role={editing ? undefined : 'radiogroup'} aria-label="Categoria">
        {cats === null && <span className="jcat__loading">Carregando…</span>}
        {cats?.map((c) =>
          editing ? (
            <input
              key={c.id}
              className="jcat__edit"
              defaultValue={c.nome}
              aria-label={`Renomear ${c.nome}`}
              size={Math.max(6, c.nome.length)}
              onBlur={(e) => void rename(c, e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
            />
          ) : (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected === c.id}
              disabled={readOnly}
              className={`jcat__chip${selected === c.id ? ' is-active' : ''}`}
              onClick={() => setValue(selected === c.id && !field.required ? null : c.id)}
            >
              {selected === c.id && (
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              )}
              {c.nome || 'Sem nome'}
            </button>
          ),
        )}
        {!readOnly && !editing && cats !== null && (
          creating ? (
            <span className="jcat__new">
              <input
                ref={input}
                value={name}
                placeholder="Nome da categoria"
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.preventDefault(), void create())
                  if (e.key === 'Escape') setCreating(false)
                }}
              />
              <button type="button" className="jai__btn" disabled={busy || !name.trim()} onClick={create}>
                Criar
              </button>
              <button type="button" className="jcat__x" aria-label="Cancelar" onClick={() => (setCreating(false), setName(''))}>
                ×
              </button>
            </span>
          ) : (
            <button type="button" className="jcat__chip jcat__chip--add" onClick={() => setCreating(true)}>
              + Nova categoria
            </button>
          )
        )}
      </div>
      {showError && errorMessage && <span className="jf-error">{errorMessage}</span>}
      {typeof field.admin?.description === 'string' && <span className="jf-help">{field.admin.description}</span>}
    </div>
  )
}
