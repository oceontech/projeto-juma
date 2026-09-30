'use client'

import { toast } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { askAi, usePostForm } from './usePostForm'

/**
 * Assistente de IA da etapa Publicação do post (Matéria BR e Post EUA).
 * Tudo é sugestão: nada muda no post sem o usuário clicar em "Usar"/"Corrigir",
 * exceto o tempo de leitura e a descrição para o Google (só quando o
 * subtítulo/resumo está vazio), que a revisão final preenche sozinha.
 */

type Site = 'br' | 'us'

function Spark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="jai__spark">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
    </svg>
  )
}

function Card({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="jai">
      <header className="jai__head">
        <Spark />
        <div>
          <b>{title}</b>
          <p>{hint}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

function Button({ busy, children, onClick, ghost, disabled }: { busy?: boolean; children: ReactNode; onClick: () => void; ghost?: boolean; disabled?: boolean }) {
  return (
    <button type="button" className={`jai__btn${ghost ? ' jai__btn--ghost' : ''}`} onClick={onClick} disabled={busy || disabled}>
      {busy && <span className="jai__spinner" aria-hidden />}
      {children}
    </button>
  )
}

/** Nome da categoria escolhida (o campo guarda só o id). */
function useCategoryName(id: unknown) {
  const [name, setName] = useState('')
  useEffect(() => {
    const ref = typeof id === 'object' && id ? (id as { id: number }).id : id
    if (!ref) return setName('')
    let alive = true
    fetch(`/api/categorias/${ref}?depth=0&locale=pt-BR`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setName(d?.nome ?? ''))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [id])
  return name
}

function usePayload(site: Site) {
  const form = usePostForm()
  const categoriaNome = useCategoryName(form.values.tema)
  const payload = useMemo<Record<string, any>>(
    () => ({ ...form.values, site, categoriaNome, secoes: form.sections }),
    [form.values, form.sections, site, categoriaNome],
  )
  return { ...form, payload }
}

// ─── Etapa 1: Assunto ──────────────────────────────────────────────────

function AssuntoAssist({ site }: { site: Site }) {
  const { payload, set } = usePayload(site)
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<{ titulos: string[]; resumo: string; categoria: { id?: number; nome?: string; nova?: string } | null } | null>(null)
  const titleField = site === 'us' ? 'title' : 'titulo'
  const summaryField = site === 'us' ? 'excerpt' : 'subtitulo'

  const run = async () => {
    setBusy(true)
    try {
      setRes(await askAi('assunto', payload))
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const useCategory = async () => {
    if (!res?.categoria) return
    try {
      let id = res.categoria.id
      if (!id && res.categoria.nova) {
        const r = await fetch('/api/categorias?locale=pt-BR', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ nome: res.categoria.nova, site }),
        })
        if (!r.ok) throw new Error('Não foi possível criar a categoria.')
        id = (await r.json()).doc.id
      }
      set('tema', id)
      toast.success('Categoria aplicada')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <Card
      title={`Título, ${site === 'us' ? 'resumo' : 'subtítulo'} e categoria melhores`}
      hint="A IA lê o texto pronto e sugere opções. Clique em Usar na que preferir."
    >
      <div className="jai__row">
        <Button busy={busy} onClick={run}>
          {res ? 'Sugerir de novo' : 'Ver sugestões'}
        </Button>
      </div>
      {res && (
        <div className="jai__results">
          <p className="jai__label">Títulos</p>
          {res.titulos.map((t) => (
            <div key={t} className="jai__option">
              <span>{t}</span>
              <Button ghost onClick={() => (set(titleField, t), toast.success('Título aplicado'))}>
                Usar
              </Button>
            </div>
          ))}
          {res.resumo && (
            <>
              <p className="jai__label">{site === 'us' ? 'Resumo' : 'Subtítulo'}</p>
              <div className="jai__option">
                <span>{res.resumo}</span>
                <Button ghost onClick={() => (set(summaryField, res.resumo), toast.success('Aplicado'))}>
                  Usar
                </Button>
              </div>
            </>
          )}
          {res.categoria && (
            <>
              <p className="jai__label">Categoria</p>
              <div className="jai__option">
                <span>
                  {res.categoria.nova ? (
                    <>
                      Nova: <b>{res.categoria.nova}</b> <small>(nenhuma das atuais serve)</small>
                    </>
                  ) : (
                    <b>{res.categoria.nome}</b>
                  )}
                </span>
                <Button ghost onClick={useCategory}>
                  {res.categoria.nova ? 'Criar e usar' : 'Usar'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}

// ─── Etapa 4: Publicação ───────────────────────────────────────────────

type Issue = { tipo: string; onde: string; trecho: string; correcao: string; sugestao: string }
type Suggestion = { campo: string; rotulo: string; texto: string; motivo: string }
type Review = { tempoLeitura: number; resumo: string; problemas: Issue[]; parecer: string; palavras: number; sugestoes?: Suggestion[] }
type Change = { path: string; value: unknown; remount?: boolean }
type Fix = { path: string; before: unknown; after: unknown; remount?: boolean; local?: boolean; resolved?: boolean }
const reviewed = new Map<string, Review>()
/** O que já foi corrigido/inserido em cada revisão: sobrevive à troca de etapa (o cartão desmonta). */
const doneByReview = new WeakMap<Review, { fixed: Record<number, Fix>; added: Record<number, Fix> }>()

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** Acha o trecho mesmo com espaços, aspas ou quebras de linha diferentes. */
const finder = (trecho: string) =>
  new RegExp(
    escape(trecho.trim())
      .replace(/\s+/g, '\\s+')
      .replace(/["“”]/g, '["“”]')
      .replace(/['‘’]/g, "['‘’]"),
  )

type LexNode = { type?: string; text?: string; children?: LexNode[] }

/** Troca o trecho dentro de um nó de texto do editor (post EUA). */
function replaceInLexical(value: unknown, re: RegExp, to: string) {
  const copy = structuredClone(value) as { root?: LexNode }
  let done = false
  const walk = (n: LexNode) => {
    if (done) return
    if (n.type === 'text' && n.text && re.test(n.text)) {
      n.text = n.text.replace(re, to)
      done = true
      return
    }
    n.children?.forEach(walk)
  }
  if (copy?.root) walk(copy.root)
  return done ? copy : null
}

const getPath = (data: Record<string, any>, path: string) => path.split('.').reduce<any>((o, k) => (o == null ? o : o[k]), data)

/** Comparação frouxa: sem acento, maiúscula nem espaço extra. */
const loose = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/["“”'‘’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

/** Todo o texto do post no formulário, numa string (para saber se um trecho ainda existe). */
function allText(data: Record<string, any>): string {
  const walk = (v: unknown): string =>
    typeof v === 'string' ? v : Array.isArray(v) ? v.map(walk).join(' ') : v && typeof v === 'object' ? Object.values(v).map(walk).join(' ') : ''
  return [data.titulo, data.subtitulo, data.introducao, data.secoes, data.citacao, data.title, data.excerpt, data.body].map(walk).join(' ')
}

/** Correção sem IA: acha o trecho apontado no formulário e troca pela correção. */
function localFix(issue: Issue, data: Record<string, any>, site: Site): Change | null {
  if (!issue.trecho || !issue.correcao) return null
  const re = finder(issue.trecho)
  const sections: unknown[] = Array.isArray(data.secoes) ? data.secoes : []
  const paths =
    site === 'us'
      ? ['title', 'excerpt']
      : ['titulo', 'subtitulo', 'introducao', ...sections.flatMap((_, i) => [`secoes.${i}.titulo`, `secoes.${i}.paragrafos`]), 'citacao']
  for (const path of paths) {
    const text = getPath(data, path)
    if (typeof text === 'string' && re.test(text)) return { path, value: text.replace(re, issue.correcao) }
  }
  if (site === 'us' && data.body) {
    const body = replaceInLexical(data.body, re, issue.correcao)
    if (body) return { path: 'body', value: body, remount: true }
  }
  return null
}

function PublicacaoAssist({ site }: { site: Site }) {
  const { payload, set, read, values, id, modified } = usePayload(site)
  const [busy, setBusy] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [fixing, setFixing] = useState<number | 'all' | null>(null)
  const justFixed = useRef(false)
  const readField = site === 'us' ? 'readMinutes' : 'tempoLeitura'
  const summaryField = site === 'us' ? 'excerpt' : 'subtitulo'
  // Assinatura do conteúdo: a revisão só roda de novo quando o texto muda.
  const signature = JSON.stringify([payload.titulo ?? payload.title, payload.introducao, payload.secoes, payload.citacao, payload.body])
  const [review, setReview] = useState<Review | null>(reviewed.get(signature) ?? null)
  const [fixed, setFixed] = useState<Record<number, Fix>>(() => (review && doneByReview.get(review)?.fixed) || {})
  const [added, setAdded] = useState<Record<number, Fix>>(() => (review && doneByReview.get(review)?.added) || {})
  useEffect(() => {
    if (review) doneByReview.set(review, { fixed, added })
  }, [review, fixed, added])

  const run = async () => {
    setBusy(true)
    try {
      const out = await askAi<Review>('revisar', payload)
      reviewed.set(signature, out)
      setReview(out)
      setFixed({})
      setAdded({})
      // Só grava se mudou: gravar o mesmo valor marcaria o post como alterado.
      if (Number(values[readField]) !== out.tempoLeitura) set(readField, out.tempoLeitura)
      // Descrição para o Google: automática. Só preenche o subtítulo/resumo vazio, nunca troca o do autor.
      if (out.resumo && !String(values[summaryField] ?? '').trim()) set(summaryField, out.resumo)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Ao abrir esta etapa, revisa sozinho (uma vez por versão do texto), se já houver texto.
  // Depois de um "Corrigir" o texto muda, mas a revisão continua a mesma.
  const textWords = JSON.stringify([payload.introducao, payload.secoes, payload.body]).split(/\s+/).length
  useEffect(() => {
    if (justFixed.current) {
      justFixed.current = false
      if (review) reviewed.set(signature, review)
      return
    }
    if (textWords < 40) return
    if (reviewed.has(signature)) {
      const r = reviewed.get(signature)!
      setReview(r)
      setFixed(doneByReview.get(r)?.fixed ?? {})
      setAdded(doneByReview.get(r)?.added ?? {})
      if (values[readField] !== r.tempoLeitura) set(readField, r.tempoLeitura)
      return
    }
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  /** Corrige um ponto: troca direta quando acha o trecho; senão a IA reescreve a parte. */
  const fixOne = async (i: number) => {
    const issue = review!.problemas[i]
    const data = read()
    const local = localFix(issue, data, site)
    let change = local
    if (!change) {
      // Uma correção anterior (ou o autor) já tirou esse trecho do texto: nada a fazer.
      if (issue.trecho && !loose(allText(data)).includes(loose(issue.trecho))) {
        setFixed((f) => ({ ...f, [i]: { path: '', before: null, after: null, resolved: true } }))
        return
      }
      const out = await askAi<{ campo: string; texto?: string; body?: unknown }>('corrigir', {
        ...data,
        site,
        secoes: Array.isArray(data.secoes) ? data.secoes : [],
        problema: issue,
      })
      change = out.campo === 'body' ? { path: 'body', value: out.body, remount: true } : { path: out.campo, value: out.texto }
    }
    const before = getPath(read(), change.path)
    justFixed.current = true
    set(change.path, change.value, { remount: change.remount })
    const done: Fix = { path: change.path, before, after: change.value, remount: change.remount, local: Boolean(local) }
    setFixed((f) => ({ ...f, [i]: done }))
  }

  const fix = async (i: number) => {
    setFixing(i)
    try {
      await fixOne(i)
      toast.success('Corrigido')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setFixing(null)
    }
  }

  const fixAll = async () => {
    setFixing('all')
    let ok = 0
    let failed = 0
    for (let i = 0; i < (review?.problemas.length ?? 0); i++) {
      if (fixed[i]) continue
      try {
        await fixOne(i)
        ok++
        // Espera o formulário atualizar antes do próximo (podem estar no mesmo parágrafo).
        await new Promise((r) => setTimeout(r, 150))
      } catch {
        failed++
      }
    }
    setFixing(null)
    if (failed) toast.error(`${ok} corrigidos; ${failed} não deu. Tente esses pelo botão Corrigir.`)
    else toast.success(ok ? `${ok} ${ok === 1 ? 'ponto corrigido' : 'pontos corrigidos'}` : 'Nada para corrigir')
  }

  /** Desfaz só aquela correção: volta o trecho corrigido ao original, sem mexer nas outras. */
  const undo = (i: number) => {
    const done = fixed[i]
    if (!done) return
    const issue = review!.problemas[i]
    if (!done.resolved) {
      const current = getPath(read(), done.path)
      let restored: unknown = null
      if (done.local && issue.correcao) {
        const re = finder(issue.correcao)
        if (typeof current === 'string' && re.test(current)) restored = current.replace(re, issue.trecho)
        else if (done.path === 'body') restored = replaceInLexical(current, re, issue.trecho)
      }
      if (restored === null && JSON.stringify(current) === JSON.stringify(done.after)) restored = done.before
      if (restored === null) return void toast.error('Esse trecho mudou depois da correção. Ajuste direto no texto.')
      justFixed.current = true
      set(done.path, restored, { remount: done.remount })
    }
    setFixed((f) => {
      const next = { ...f }
      delete next[i]
      return next
    })
  }

  /** "Inserir": põe a sugestão (citação, intertítulo) no campo vazio. */
  const insert = (i: number) => {
    const sug = review!.sugestoes![i]
    const before = getPath(read(), sug.campo)
    justFixed.current = true
    set(sug.campo, sug.texto)
    setAdded((a) => ({ ...a, [i]: { path: sug.campo, before, after: sug.texto } }))
    toast.success(`Inserido: ${sug.rotulo.toLowerCase()}`)
  }

  const removeInsert = (i: number) => {
    const done = added[i]
    if (!done) return
    if (getPath(read(), done.path) !== done.after) return void toast.error('Esse campo mudou depois. Ajuste direto nele.')
    justFixed.current = true
    set(done.path, done.before ?? '')
    setAdded((a) => {
      const next = { ...a }
      delete next[i]
      return next
    })
  }

  const translate = async () => {
    setTranslating(true)
    try {
      await askAi('traduzir', { id })
      toast.success('Traduções salvas como rascunho em EN e ES. Confira pelo seletor de idioma e publique.')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setTranslating(false)
    }
  }

  const pending = review ? review.problemas.filter((_, i) => !fixed[i]).length : 0

  return (
    <Card title="Revisão final com IA" hint="Roda sozinha ao abrir esta etapa: tempo de leitura e pontos a corrigir. A descrição para o Google é feita sozinha.">
      {!review && !busy && textWords < 40 && <p className="jai__muted">Escreva o texto na etapa Texto: a revisão roda sozinha quando você voltar aqui.</p>}
      {busy && !review && (
        <p className="jai__muted">
          <span className="jai__spinner" aria-hidden /> Lendo o post…
        </p>
      )}
      {review && (
        <div className="jai__results">
          <div className="jai__stats">
            <span>
              <b>{review.tempoLeitura} min</b>
              <small>de leitura · {review.palavras} palavras</small>
            </span>
            <span className={pending ? 'is-warn' : 'is-ok'}>
              <b>{pending || (review.problemas.length ? '✓' : 'Nenhum')}</b>
              <small>
                {pending === 1 ? 'ponto a corrigir' : pending ? 'pontos a corrigir' : review.problemas.length ? 'tudo corrigido' : 'problema encontrado'}
              </small>
            </span>
          </div>
          {review.parecer && <p className="jai__verdict">{review.parecer}</p>}
          {review.problemas.length > 0 && (
            <>
              {pending > 1 && (
                <div className="jai__fixall">
                  <span>A IA troca cada trecho pela versão corrigida. Dá para desfazer um por um.</span>
                  <Button busy={fixing === 'all'} disabled={fixing !== null} onClick={fixAll}>
                    {fixing === 'all' ? 'Corrigindo…' : `Corrigir todos (${pending})`}
                  </Button>
                </div>
              )}
              <ul className="jai__issues">
                {review.problemas.map((p, i) => (
                  <li key={i} className={fixed[i] ? 'is-fixed' : undefined}>
                    <div className="jai__issue-head">
                      <em>{fixed[i]?.resolved ? '✓ já resolvido' : fixed[i] ? '✓ corrigido' : p.tipo}</em>
                      {fixed[i]?.resolved ? null : fixed[i] ? (
                        <button type="button" className="jait__undo" onClick={() => undo(i)}>
                          ↺ Desfazer
                        </button>
                      ) : (
                        <Button busy={fixing === i} disabled={fixing !== null} onClick={() => fix(i)}>
                          {fixing === i ? 'Corrigindo…' : 'Corrigir'}
                        </Button>
                      )}
                    </div>
                    {p.sugestao && <span className="jai__why">{p.sugestao}</span>}
                    {p.trecho && (
                      <span className="jai__diff">
                        <del>{p.trecho}</del>
                        {p.correcao && <ins>{p.correcao}</ins>}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          {Boolean(review.sugestoes?.length) && (
            <div className="jai__adds">
              <p className="jai__label">Sugestões para completar</p>
              {review.sugestoes!.map((sug, i) => (
                <div key={i} className={`jai__add${added[i] ? ' is-done' : ''}`}>
                  <div className="jai__issue-head">
                    <em>{added[i] ? `✓ ${sug.rotulo}` : sug.rotulo}</em>
                    {added[i] ? (
                      <button type="button" className="jait__undo" onClick={() => removeInsert(i)}>
                        ↺ Tirar
                      </button>
                    ) : (
                      <button type="button" className="jai__btn jai__btn--add" onClick={() => insert(i)}>
                        + Inserir
                      </button>
                    )}
                  </div>
                  <q className="jai__add-text">{sug.texto}</q>
                  {!added[i] && <span className="jai__why">{sug.motivo}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="jai__row">
        <Button ghost busy={busy && Boolean(review)} onClick={run}>
          Revisar de novo
        </Button>
        {site === 'br' && (
          <Button busy={translating} onClick={translate} disabled={!id || modified}>
            {translating ? 'Traduzindo…' : 'Traduzir para EN e ES'}
          </Button>
        )}
      </div>
      {site === 'br' && (!id || modified) && (
        <small className="jai__muted">Para traduzir, salve antes (Salvar rascunho): a tradução parte da versão salva em português.</small>
      )}
    </Card>
  )
}

/**
 * Revisão final (etapa Publicação): o que corrigir, tempo de leitura e
 * resumo para o Google; logo abaixo, sugestões de título, subtítulo e
 * categoria, feitas a partir do texto já escrito.
 */
export const AiAssist: UIFieldClientComponent = (props) => {
  const { site } = props as unknown as { site: Site }
  return (
    <>
      <PublicacaoAssist site={site} />
      <AssuntoAssist site={site} />
    </>
  )
}
