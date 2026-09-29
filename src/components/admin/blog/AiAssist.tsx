'use client'

import { toast } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { askAi, usePostForm, type Section } from './usePostForm'

/**
 * Assistente de IA dentro de cada etapa do post (Matéria BR e Post EUA).
 * Tudo é sugestão: nada muda no post sem o usuário clicar em "Usar"/"Aplicar",
 * exceto o tempo de leitura, que a revisão final preenche sozinha.
 */

type Site = 'br' | 'us'
type Step = 'assunto' | 'capa' | 'texto' | 'publicacao'

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
      title="Assistente de IA"
      hint={`Sugere títulos, ${site === 'us' ? 'o resumo' : 'o subtítulo'} e a categoria. Funciona melhor depois do texto escrito; dá para voltar aqui no fim.`}
    >
      <div className="jai__row">
        <Button busy={busy} onClick={run}>
          {res ? 'Sugerir de novo' : `Sugerir título, ${site === 'us' ? 'resumo' : 'subtítulo'} e categoria`}
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

// ─── Etapa 2: Capa ─────────────────────────────────────────────────────

function CapaAssist({ site }: { site: Site }) {
  const { payload, set } = usePayload(site)
  const [busy, setBusy] = useState(false)
  const [detail, setDetail] = useState('')
  const [image, setImage] = useState<{ id: number; url: string; alt: string } | null>(null)
  const coverField = site === 'us' ? 'cover' : 'capa'
  const hasTitle = Boolean(site === 'us' ? payload.title : payload.titulo)

  const run = async () => {
    setBusy(true)
    try {
      setImage(await askAi('capa', { ...payload, detalhe: detail }))
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Gerar capa com IA" hint="Cria uma foto no estilo editorial a partir do título e do texto, sem letreiros nem embalagens. O texto alternativo vem junto.">
      <label className="jai__field">
        <span>Algum detalhe para a imagem? (opcional)</span>
        <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={site === 'us' ? 'Ex.: citrus grove at sunrise in Florida' : 'Ex.: lavoura de soja ao amanhecer, visão de drone'} />
      </label>
      <div className="jai__row">
        <Button busy={busy} onClick={run} disabled={!hasTitle}>
          {busy ? 'Gerando a imagem… (uns 30 segundos)' : image ? 'Gerar outra' : 'Gerar capa'}
        </Button>
        {!hasTitle && <small className="jai__muted">Preencha o título na etapa Assunto primeiro.</small>}
      </div>
      {image && (
        <figure className="jai__image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.alt} />
          <figcaption>
            <span>{image.alt}</span>
            <Button onClick={() => (set(coverField, image.id), toast.success('Capa aplicada'))}>Usar como capa</Button>
          </figcaption>
        </figure>
      )}
    </Card>
  )
}

// ─── Etapa 3: Texto ────────────────────────────────────────────────────

function TextoAssist({ site }: { site: Site }) {
  const { payload, set, setSections, values, sections } = usePayload(site)
  const [raw, setRaw] = useState('')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<'organizar' | 'melhorar' | null>(null)
  const [changes, setChanges] = useState<string[] | null>(null)
  const undo = useRef<(() => void) | null>(null)

  const snapshot = () => {
    if (site === 'us') {
      const body = values.body
      return () => set('body', body, { remount: true })
    }
    const prev = { introducao: values.introducao ?? '', citacao: values.citacao ?? '', secoes: sections.map((s: Section) => ({ ...s })) }
    return () => {
      set('introducao', prev.introducao)
      set('citacao', prev.citacao)
      setSections(prev.secoes)
    }
  }

  const apply = (out: Record<string, any>) => {
    if (site === 'us') {
      set('body', out.body, { remount: true })
      if (out.resumo && !values.excerpt) set('excerpt', out.resumo)
      return
    }
    set('introducao', out.introducao ?? '')
    set('citacao', out.citacao ?? '')
    setSections(out.secoes ?? [])
  }

  const run = async (action: 'organizar' | 'melhorar') => {
    setBusy(action)
    try {
      const out = await askAi<Record<string, any>>(action, action === 'organizar' ? { ...payload, bruto: raw } : payload)
      undo.current = snapshot()
      apply(out)
      setChanges(action === 'melhorar' ? (out.mudancas ?? []) : ['Texto organizado em introdução, seções e citação.'])
      if (action === 'organizar') {
        setRaw('')
        setOpen(false)
      }
      toast.success(action === 'organizar' ? 'Texto organizado' : 'Texto revisado')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card title="Assistente de IA" hint="Cole um texto solto para ele organizar, ou peça para melhorar o que já está escrito. Fatos e números do autor não mudam.">
      <div className="jai__row">
        <Button ghost onClick={() => setOpen((o) => !o)}>
          {open ? 'Fechar' : 'Colar texto e organizar'}
        </Button>
        <Button busy={busy === 'melhorar'} onClick={() => run('melhorar')}>
          Melhorar o texto
        </Button>
      </div>
      {open && (
        <div className="jai__paste">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
            placeholder="Cole aqui o texto do Word, do e-mail ou do WhatsApp. A IA separa introdução, seções com intertítulo e uma citação."
          />
          <div className="jai__row">
            <Button busy={busy === 'organizar'} onClick={() => run('organizar')} disabled={raw.trim().length < 40}>
              Organizar no post
            </Button>
            <small className="jai__muted">Substitui o texto desta etapa. Dá para desfazer.</small>
          </div>
        </div>
      )}
      {changes && (
        <div className="jai__results">
          <p className="jai__label">O que mudou</p>
          <ul className="jai__list">
            {(changes.length ? changes : ['Ajustes pequenos de clareza e gramática.']).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="jai__row">
            <Button
              ghost
              onClick={() => {
                undo.current?.()
                undo.current = null
                setChanges(null)
                toast.success('Desfeito')
              }}
            >
              Desfazer
            </Button>
            <Button ghost onClick={() => setChanges(null)}>
              Manter
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Etapa 4: Publicação ───────────────────────────────────────────────

type Review = { tempoLeitura: number; resumo: string; problemas: { tipo: string; trecho: string; sugestao: string }[]; parecer: string; palavras: number }
const reviewed = new Map<string, Review>()

function PublicacaoAssist({ site }: { site: Site }) {
  const { payload, set, values, id, modified } = usePayload(site)
  const [busy, setBusy] = useState(false)
  const [translating, setTranslating] = useState(false)
  const readField = site === 'us' ? 'readMinutes' : 'tempoLeitura'
  const summaryField = site === 'us' ? 'excerpt' : 'subtitulo'
  // Assinatura do conteúdo: a revisão só roda de novo quando o texto muda.
  const signature = JSON.stringify([payload.titulo ?? payload.title, payload.introducao, payload.secoes, payload.citacao, payload.body])
  const [review, setReview] = useState<Review | null>(reviewed.get(signature) ?? null)

  const run = async () => {
    setBusy(true)
    try {
      const out = await askAi<Review>('revisar', payload)
      reviewed.set(signature, out)
      setReview(out)
      // Só grava se mudou: gravar o mesmo valor marcaria o post como alterado.
      if (Number(values[readField]) !== out.tempoLeitura) set(readField, out.tempoLeitura)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // Ao abrir esta etapa, revisa sozinho (uma vez por versão do texto), se já houver texto.
  const textWords = JSON.stringify([payload.introducao, payload.secoes, payload.body]).split(/\s+/).length
  useEffect(() => {
    if (textWords < 40) return
    if (reviewed.has(signature)) {
      const r = reviewed.get(signature)!
      setReview(r)
      if (values[readField] !== r.tempoLeitura) set(readField, r.tempoLeitura)
      return
    }
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

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

  return (
    <Card title="Revisão final com IA" hint="Roda sozinha ao abrir esta etapa: tempo de leitura, pontos a corrigir e o resumo para o Google.">
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
            <span className={review.problemas.length ? 'is-warn' : 'is-ok'}>
              <b>{review.problemas.length || 'Nenhum'}</b>
              <small>{review.problemas.length === 1 ? 'ponto a corrigir' : review.problemas.length ? 'pontos a corrigir' : 'problema encontrado'}</small>
            </span>
          </div>
          {review.parecer && <p className="jai__verdict">{review.parecer}</p>}
          {review.problemas.length > 0 && (
            <ul className="jai__issues">
              {review.problemas.map((p, i) => (
                <li key={i}>
                  <em>{p.tipo}</em>
                  {p.trecho && <q>{p.trecho.replace(/^["“”'\s]+|["“”'\s]+$/g, '')}</q>}
                  {p.sugestao && <span>{p.sugestao}</span>}
                </li>
              ))}
            </ul>
          )}
          {review.resumo && review.resumo !== values[summaryField] && (
            <>
              <p className="jai__label">{site === 'us' ? 'Resumo sugerido para o Google' : 'Subtítulo sugerido para o Google'}</p>
              <div className="jai__option">
                <span>{review.resumo}</span>
                <Button ghost onClick={() => (set(summaryField, review.resumo), toast.success('Aplicado'))}>
                  Usar
                </Button>
              </div>
            </>
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

export const AiAssist: UIFieldClientComponent = (props) => {
  const { site, step } = props as unknown as { site: Site; step: Step }
  if (step === 'assunto') return <AssuntoAssist site={site} />
  if (step === 'capa') return <CapaAssist site={site} />
  if (step === 'texto') return <TextoAssist site={site} />
  return <PublicacaoAssist site={site} />
}
