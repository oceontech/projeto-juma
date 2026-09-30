'use client'

import { toast, useField } from '@payloadcms/ui'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import { blocksToLexical, cleanBlocks, lexicalToBlocks, type Block } from '../../../features/ai/lexical'
import { AiMenu, type AiMode } from './AiText'
import { askAi, usePostForm } from './usePostForm'

/**
 * Editor do texto da matéria, igual nos dois sites: a matéria aparece como um
 * documento feito de blocos (parágrafo, intertítulo, lista, citação).
 * - Enter cria o próximo parágrafo; Backspace num bloco vazio apaga.
 * - Colar um texto com vários parágrafos já separa os blocos.
 * - Cada bloco tem tipo, mover, excluir e a ✨ IA; o texto todo também.
 * BR: grava o campo `conteudo` (json, por idioma). EUA: grava o `body` (texto rico).
 */

type Site = 'br' | 'us'
type Kind = 'p' | 'h2' | 'ul' | 'quote'
type EBlock = { id: string } & ({ type: 'p' | 'h2' | 'h3' | 'quote'; text: string } | { type: 'ul'; items: string[] })

const uid = () => Math.random().toString(36).slice(2, 10)
const withIds = (bs: Block[]): EBlock[] => bs.map((b) => ({ ...b, id: uid() }) as EBlock)
const strip = (bs: EBlock[]): Block[] => bs.map(({ id: _id, ...b }) => b as Block)
const textOf = (b: EBlock) => (b.type === 'ul' ? b.items.join(' ') : b.text)
const wordsOf = (bs: EBlock[]) => bs.map(textOf).join(' ').split(/\s+/).filter(Boolean).length

const TYPES: { type: Kind; label: string; icon: string; hint: string }[] = [
  { type: 'p', label: 'Parágrafo', icon: '¶', hint: 'Texto corrido' },
  { type: 'h2', label: 'Intertítulo', icon: 'H', hint: 'Divide a matéria em partes' },
  { type: 'ul', label: 'Lista', icon: '•', hint: 'Passos, itens ou cuidados' },
  { type: 'quote', label: 'Citação', icon: '❝', hint: 'Uma frase em destaque' },
]
const typeInfo = (t: EBlock['type']) => TYPES.find((x) => x.type === (t === 'h3' ? 'h2' : t))!

function blank(type: Kind, text = ''): EBlock {
  return type === 'ul' ? { id: uid(), type: 'ul', items: [text] } : { id: uid(), type, text }
}

function convert(b: EBlock, type: Kind): EBlock {
  if (type === 'ul') return { id: b.id, type: 'ul', items: b.type === 'ul' ? b.items : textOf(b).split(/(?<=[.;])\s+(?=\S)/).filter(Boolean) }
  return { id: b.id, type, text: textOf(b) }
}

/** Texto colado → blocos, sem IA: linha em branco separa parágrafo; "- " ou "• " vira lista. */
function splitPaste(raw: string): Block[] {
  const out: Block[] = []
  const chunks = raw.replace(/\r/g, '').split(/\n\s*\n|\n(?=\s*[-•*]\s)/)
  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) continue
    if (lines.every((l) => /^[-•*]\s+/.test(l))) {
      const items = lines.map((l) => l.replace(/^[-•*]\s+/, ''))
      const last = out[out.length - 1]
      if (last?.type === 'ul') last.items.push(...items)
      else out.push({ type: 'ul', items })
    } else if (lines.length === 1 && lines[0].length < 80 && !/[.!?:,;]$/.test(lines[0]) && chunks.length > 1) {
      out.push({ type: 'h2', text: lines[0] })
    } else {
      out.push({ type: 'p', text: lines.join(' ') })
    }
  }
  return out
}

/** Caixa de texto que cresce com o conteúdo. */
function Grow({
  value,
  onChange,
  onKeyDown,
  onPaste,
  placeholder,
  className,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  inputRef?: (el: HTMLTextAreaElement | null) => void
}) {
  const el = useRef<HTMLTextAreaElement | null>(null)
  useLayoutEffect(() => {
    const t = el.current
    if (!t) return
    t.style.height = 'auto'
    t.style.height = `${t.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={(node) => {
        el.current = node
        inputRef?.(node)
      }}
      rows={1}
      value={value}
      placeholder={placeholder}
      className={className}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    />
  )
}

/** Menu pequeno (tipo do bloco, inserir bloco). Fecha ao clicar fora. */
function Pop({ trigger, children, className }: { trigger: (toggle: () => void, open: boolean) => ReactNode; children: (close: () => void) => ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])
  return (
    <div className={`jbe__pop ${className ?? ''}`} ref={root}>
      {trigger(() => setOpen((o) => !o), open)}
      {open && <div className="jbe__menu">{children(() => setOpen(false))}</div>}
    </div>
  )
}

function TypeList({ onPick, current }: { onPick: (t: Kind) => void; current?: Kind }) {
  return (
    <>
      {TYPES.map((t) => (
        <button key={t.type} type="button" className={current === t.type ? 'is-current' : ''} onClick={() => onPick(t.type)}>
          <i>{t.icon}</i>
          <span>
            <b>{t.label}</b>
            <small>{t.hint}</small>
          </span>
        </button>
      ))}
    </>
  )
}

export function BlockEditor(props: { path?: string; field: { name: string }; site?: Site }) {
  const site: Site = props.site === 'us' ? 'us' : 'br'
  const path = props.path ?? props.field.name
  const { value, setValue } = useField<unknown>({ path })
  const { values } = usePostForm()
  const en = site === 'us'

  const [blocks, setBlocks] = useState<EBlock[]>([])
  const emitted = useRef<string | undefined>(undefined)
  const refs = useRef(new Map<string, HTMLTextAreaElement | HTMLInputElement>())
  const [focus, setFocus] = useState<{ id: string; at?: number | 'end'; item?: number } | null>(null)
  const [busy, setBusy] = useState<string | null>(null) // id do bloco ou 'doc'
  const [undo, setUndo] = useState<EBlock[] | null>(null)
  const [pasting, setPasting] = useState(false)
  const [pasteText, setPasteText] = useState('')

  // Valor do formulário → blocos (na abertura e quando a revisão/IA troca o texto por fora).
  useEffect(() => {
    const s = JSON.stringify(value ?? null)
    if (s === emitted.current) return
    emitted.current = s
    setBlocks(withIds(site === 'us' ? lexicalToBlocks(value) : cleanBlocks(value)))
  }, [value, site])

  const commit = useCallback(
    (next: EBlock[]) => {
      setBlocks(next)
      const out = site === 'us' ? blocksToLexical(strip(next)) : strip(next)
      emitted.current = JSON.stringify(out)
      setValue(out)
    },
    [setValue, site],
  )

  // Foco depois de criar, juntar ou apagar blocos.
  useEffect(() => {
    if (!focus) return
    const key = focus.item !== undefined ? `${focus.id}:${focus.item}` : focus.id
    const el = refs.current.get(key)
    if (!el) return
    el.focus()
    const pos = focus.at === 'end' || focus.at === undefined ? el.value.length : focus.at
    el.setSelectionRange(pos, pos)
    setFocus(null)
  }, [focus, blocks])

  const update = (id: string, patch: Partial<EBlock>) => commit(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as EBlock) : b)))
  const insertAt = (index: number, bs: EBlock[], focusFirst = true) => {
    commit([...blocks.slice(0, index), ...bs, ...blocks.slice(index)])
    if (focusFirst && bs[0]) setFocus({ id: bs[0].id, at: 'end', item: bs[0].type === 'ul' ? 0 : undefined })
  }
  const add = (type: Kind, index = blocks.length) => insertAt(index, [blank(type)])
  const remove = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id)
    const prev = blocks[i - 1]
    commit(blocks.filter((b) => b.id !== id))
    if (prev) setFocus({ id: prev.id, at: 'end', item: prev.type === 'ul' ? prev.items.length - 1 : undefined })
  }
  const move = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id)
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]
    ;[next[i], next[j]] = [next[j], next[i]]
    commit(next)
  }

  // ─── Teclado nos blocos de texto ──────────────────────────────────────
  const onTextKey = (b: EBlock & { text: string }, e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    const i = blocks.findIndex((x) => x.id === b.id)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const before = b.text.slice(0, el.selectionStart).trimEnd()
      const after = b.text.slice(el.selectionEnd).trimStart()
      const next = blank('p', after)
      const list = blocks.map((x) => (x.id === b.id ? ({ ...x, text: before } as EBlock) : x))
      commit([...list.slice(0, i + 1), next, ...list.slice(i + 1)])
      setFocus({ id: next.id, at: 0 })
      return
    }
    if (e.key === 'Backspace' && el.selectionStart === 0 && el.selectionEnd === 0) {
      const prev = blocks[i - 1]
      if (!b.text) {
        e.preventDefault()
        if (blocks.length > 1) remove(b.id)
        return
      }
      // Junta com o parágrafo de cima, como num editor de texto.
      if (prev && prev.type === 'p' && b.type === 'p') {
        e.preventDefault()
        const at = prev.text.length + (prev.text ? 1 : 0)
        const joined = prev.text ? `${prev.text} ${b.text}` : b.text
        commit(blocks.filter((x) => x.id !== b.id).map((x) => (x.id === prev.id ? ({ ...x, text: joined } as EBlock) : x)))
        setFocus({ id: prev.id, at })
      }
      return
    }
    if (e.key === 'ArrowUp' && el.selectionStart === 0 && blocks[i - 1]) {
      const p = blocks[i - 1]
      e.preventDefault()
      setFocus({ id: p.id, at: 'end', item: p.type === 'ul' ? p.items.length - 1 : undefined })
    }
    if (e.key === 'ArrowDown' && el.selectionStart === el.value.length && blocks[i + 1]) {
      const n = blocks[i + 1]
      e.preventDefault()
      setFocus({ id: n.id, at: 0, item: n.type === 'ul' ? 0 : undefined })
    }
  }

  // Colar vários parágrafos num bloco: já separa em blocos.
  const onTextPaste = (b: EBlock & { text: string }, e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const raw = e.clipboardData.getData('text/plain')
    if (!/\n/.test(raw.trim())) return
    e.preventDefault()
    const parts = withIds(splitPaste(raw))
    if (!parts.length) return
    const i = blocks.findIndex((x) => x.id === b.id)
    const el = e.currentTarget
    const before = b.text.slice(0, el.selectionStart).trimEnd()
    const after = b.text.slice(el.selectionEnd).trimStart()
    const head = before ? [{ ...b, text: before } as EBlock] : []
    const tail = after ? [blank('p', after)] : []
    commit([...blocks.slice(0, i), ...head, ...parts, ...tail, ...blocks.slice(i + 1)])
    toast.success(`${parts.length} ${parts.length === 1 ? 'bloco colado' : 'blocos colados'}`)
  }

  // ─── Lista: um campo por item ─────────────────────────────────────────
  const onItemKey = (b: EBlock & { items: string[] }, k: number, e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    const i = blocks.findIndex((x) => x.id === b.id)
    const item = b.items[k]
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Enter num item vazio no fim sai da lista e abre um parágrafo.
      if (!item.trim() && k === b.items.length - 1) {
        const items = b.items.slice(0, -1)
        const p = blank('p')
        const list = items.length ? blocks.map((x) => (x.id === b.id ? ({ ...x, items } as EBlock) : x)) : blocks.filter((x) => x.id !== b.id)
        const at = items.length ? i + 1 : i
        commit([...list.slice(0, at), p, ...list.slice(at)])
        setFocus({ id: p.id, at: 0 })
        return
      }
      const before = item.slice(0, el.selectionStart).trimEnd()
      const after = item.slice(el.selectionEnd).trimStart()
      const items = [...b.items.slice(0, k), before, after, ...b.items.slice(k + 1)]
      update(b.id, { items } as Partial<EBlock>)
      setFocus({ id: b.id, item: k + 1, at: 0 })
      return
    }
    if (e.key === 'Backspace' && el.selectionStart === 0 && el.selectionEnd === 0 && !item) {
      e.preventDefault()
      if (b.items.length === 1) {
        commit(blocks.map((x) => (x.id === b.id ? blank('p') : x)).map((x, j) => (j === i ? { ...x, id: b.id } : x)))
        setFocus({ id: b.id, at: 0 })
        return
      }
      update(b.id, { items: b.items.filter((_, j) => j !== k) } as Partial<EBlock>)
      setFocus({ id: b.id, item: Math.max(0, k - 1), at: 'end' })
    }
  }

  // ─── IA ───────────────────────────────────────────────────────────────
  const context = () => ({ ...values, site, blocos: strip(blocks) })

  const blockAi = async (b: EBlock, mode: AiMode) => {
    setBusy(b.id)
    const before = blocks
    try {
      const out = await askAi<{ blocos: Block[] }>('bloco', { ...context(), modo: mode, indice: blocks.findIndex((x) => x.id === b.id) })
      const repl = withIds(out.blocos)
      if (!repl.length) throw new Error('A IA não devolveu o texto. Tente de novo.')
      commit(blocks.flatMap((x) => (x.id === b.id ? repl : [x])))
      setUndo(before)
      toast.success('Pronto. Use "Desfazer" no alto se não gostar.')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const docAi = async (mode: AiMode, bruto?: string) => {
    setBusy('doc')
    const before = blocks
    try {
      const out = await askAi<{ blocos: Block[] }>('texto', { ...context(), modo: mode, bruto })
      const next = withIds(out.blocos)
      if (!next.length) throw new Error('A IA não devolveu o texto. Tente de novo.')
      commit(bruto && blocks.length ? [...blocks, ...next] : next)
      setUndo(before)
      toast.success(bruto ? 'Texto organizado em blocos' : 'Texto todo ajustado')
      return true
    } catch (e) {
      toast.error((e as Error).message)
      return false
    } finally {
      setBusy(null)
    }
  }

  const pasteDone = async (withAi: boolean) => {
    const raw = pasteText.trim()
    if (!raw) return
    if (withAi) {
      if (!(await docAi('organizar', raw))) return
    } else {
      const parts = withIds(splitPaste(raw))
      commit([...blocks, ...parts])
      setUndo(blocks)
    }
    setPasteText('')
    setPasting(false)
  }

  const words = useMemo(() => wordsOf(blocks), [blocks])
  const minutes = Math.max(1, Math.round(words / 200))
  const empty = blocks.length === 0
  const firstP = blocks.find((b) => b.type === 'p')?.id

  const pastePanel = (
    <div className="jbe__paste">
      <b>Cole o texto aqui</b>
      <small>
        Pode vir de um e-mail, Word ou WhatsApp. {blocks.length ? 'Ele entra no fim da matéria.' : ''}
        {en ? ' O texto do site EUA é em inglês.' : ''}
      </small>
      <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={8} autoFocus placeholder={en ? 'Paste the text in English…' : 'Cole o texto…'} />
      <div className="jbe__paste-actions">
        <button type="button" className="jai__btn" disabled={!pasteText.trim() || busy === 'doc'} onClick={() => pasteDone(true)}>
          {busy === 'doc' ? <span className="jai__spinner" aria-hidden /> : '✨'} {busy === 'doc' ? 'Organizando…' : 'Organizar com IA'}
        </button>
        <button type="button" className="jai__btn jai__btn--ghost" disabled={!pasteText.trim() || busy === 'doc'} onClick={() => pasteDone(false)}>
          Só separar em parágrafos
        </button>
        <button type="button" className="jbe__link" onClick={() => setPasting(false)}>
          Cancelar
        </button>
      </div>
      <p className="jbe__tip">
        <b>Organizar com IA</b> corrige a ortografia e separa parágrafos, intertítulos e listas, sem mudar o conteúdo.
      </p>
    </div>
  )

  return (
    <div className={`jbe${busy === 'doc' ? ' is-busy' : ''}`}>
      <div className="jbe__bar">
        <div className="jbe__bar-title">
          <b>Texto da matéria{en ? ' (em inglês)' : ''}</b>
          <small>{words ? `${words} palavras · cerca de ${minutes} min de leitura` : 'Ainda sem texto'}</small>
        </div>
        <div className="jbe__bar-actions">
          {undo && (
            <button
              type="button"
              className="jait__undo"
              onClick={() => {
                commit(undo)
                setUndo(null)
              }}
            >
              ↺ Desfazer
            </button>
          )}
          {!empty && !pasting && (
            <button type="button" className="jai__btn jai__btn--ghost" onClick={() => setPasting(true)}>
              Colar texto
            </button>
          )}
          {!empty && <AiMenu busy={busy === 'doc'} disabled={words < 10} label="IA no texto todo" onPick={(m) => docAi(m)} />}
        </div>
      </div>

      <div className="jbe__paper">
        {empty && !pasting && (
          <div className="jbe__start">
            <b>Como você quer começar?</b>
            <div className="jbe__start-options">
              <button type="button" onClick={() => add('p', 0)}>
                <i>✎</i>
                <span>
                  <b>Escrever do zero</b>
                  <small>Começa pelo primeiro parágrafo. Enter cria o próximo, como num documento.</small>
                </span>
              </button>
              <button type="button" onClick={() => setPasting(true)}>
                <i>📋</i>
                <span>
                  <b>Colar um texto pronto</b>
                  <small>Cole de onde estiver: a IA separa parágrafos, intertítulos e listas.</small>
                </span>
              </button>
            </div>
          </div>
        )}

        {pasting && empty && pastePanel}

        {blocks.map((b, i) => {
          const info = typeInfo(b.type)
          return (
            <div key={b.id}>
              {i > 0 && (
                <Pop
                  className="jbe__gap"
                  trigger={(toggle, open) => (
                    <button type="button" className={`jbe__gap-btn${open ? ' is-open' : ''}`} onClick={toggle} aria-label="Inserir bloco aqui" title="Inserir bloco aqui">
                      +
                    </button>
                  )}
                >
                  {(close) => <TypeList onPick={(t) => (close(), add(t, i))} />}
                </Pop>
              )}
              <div className={`jbe__block jbe__block--${b.type}${busy === b.id ? ' is-busy' : ''}${b.id === firstP ? ' is-first' : ''}`}>
                <Pop
                  className="jbe__handle"
                  trigger={(toggle, open) => (
                    <button type="button" className={`jbe__type${open ? ' is-open' : ''}`} onClick={toggle} title={`${info.label}: clique para mudar, mover ou excluir`}>
                      {info.icon}
                    </button>
                  )}
                >
                  {(close) => (
                    <>
                      <p className="jbe__menu-label">Transformar em</p>
                      <TypeList current={info.type} onPick={(t) => (close(), commit(blocks.map((x) => (x.id === b.id ? convert(x, t) : x))))} />
                      <hr />
                      <button type="button" disabled={i === 0} onClick={() => (close(), move(b.id, -1))}>
                        <i>↑</i>
                        <span>
                          <b>Subir</b>
                        </span>
                      </button>
                      <button type="button" disabled={i === blocks.length - 1} onClick={() => (close(), move(b.id, 1))}>
                        <i>↓</i>
                        <span>
                          <b>Descer</b>
                        </span>
                      </button>
                      <button type="button" className="is-danger" onClick={() => (close(), remove(b.id))}>
                        <i>✕</i>
                        <span>
                          <b>Excluir bloco</b>
                        </span>
                      </button>
                    </>
                  )}
                </Pop>

                <div className="jbe__content">
                  {b.type === 'ul' ? (
                    <ul className="jbe__list">
                      {b.items.map((item, k) => (
                        <li key={k}>
                          <Grow
                            value={item}
                            placeholder={k === 0 ? (en ? 'List item' : 'Item da lista') : ''}
                            inputRef={(el) => (el ? refs.current.set(`${b.id}:${k}`, el) : refs.current.delete(`${b.id}:${k}`))}
                            onChange={(v) => update(b.id, { items: b.items.map((x, j) => (j === k ? v : x)) } as Partial<EBlock>)}
                            onKeyDown={(e) => onItemKey(b, k, e)}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Grow
                      value={b.text}
                      className={`jbe__text jbe__text--${b.type}`}
                      placeholder={
                        b.type === 'h2' || b.type === 'h3'
                          ? en
                            ? 'Subheading'
                            : 'Intertítulo'
                          : b.type === 'quote'
                            ? en
                              ? 'A strong sentence from the text'
                              : 'Uma frase forte do próprio texto'
                            : b.id === firstP
                              ? en
                                ? 'Opening paragraph. Press Enter for the next one.'
                                : 'Parágrafo de abertura. Enter cria o próximo.'
                              : en
                                ? 'Write…'
                                : 'Escreva…'
                      }
                      inputRef={(el) => (el ? refs.current.set(b.id, el) : refs.current.delete(b.id))}
                      onChange={(v) => update(b.id, { text: v } as Partial<EBlock>)}
                      onKeyDown={(e) => onTextKey(b, e)}
                      onPaste={b.type === 'p' ? (e) => onTextPaste(b, e) : undefined}
                    />
                  )}
                </div>

                <div className="jbe__ai">
                  <AiMenu busy={busy === b.id} disabled={textOf(b).trim().split(/\s+/).filter(Boolean).length < 2 || busy !== null} onPick={(m) => blockAi(b, m)} />
                </div>
              </div>
            </div>
          )
        })}

        {pasting && !empty && pastePanel}

        {!empty && (
          <div className="jbe__add">
            <span>Adicionar</span>
            {TYPES.map((t) => (
              <button key={t.type} type="button" onClick={() => add(t.type)} title={t.hint}>
                <i>{t.icon}</i> {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {!empty && (
        <p className="jbe__help">
          Escreva como num documento: <b>Enter</b> cria um novo parágrafo e <b>Backspace</b> num bloco vazio apaga. O ícone à esquerda de
          cada bloco muda o tipo, move ou exclui; o <b>+</b> entre dois blocos insere outro ali; a <b>✨ IA</b> à direita ajusta só aquele
          bloco.
        </p>
      )}
    </div>
  )
}
