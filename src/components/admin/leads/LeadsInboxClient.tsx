'use client'

import { toast } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import {
  LEAD_FORMS,
  LEAD_STAGES,
  LEAD_TIPOS,
  SITE_META,
  closeFor,
  intlPhone,
  leadGreeting,
  relativeDate,
  stageOf,
  statusLabel,
  statusMeta,
  tipoMeta,
  type LeadStage,
  type LeadStatus,
} from '../leadMeta'
import { Dropdown } from '../ui/Dropdown'
import { Flag } from '../ui/Flag'

export type InboxLead = {
  id: number
  nome: string
  empresa: string | null
  email: string | null
  telefone: string | null
  mensagem: string | null
  site: 'br' | 'us'
  status: LeadStatus
  tipo: string | null
  formulario: string | null
  produto: string | null
  cultura: string | null
  detalhe: string | null
  pagina: string | null
  local: string | null
  dados: Record<string, unknown> | null
  notas: { id?: string; texto: string; data: string | null; autor: string | null }[]
  responsavel: string | null
  duplicado: boolean
  createdAt: string
}

type Props = {
  leads: InboxLead[]
  stageCounts: Record<string, number>
  tipoCounts: Record<string, number>
  etapa: LeadStage
  tipo: string
  search: string
  page: number
  totalPages: number
  totalDocs: number
  canCreate: boolean
  canExport: boolean
}

const STATUS_ORDER: LeadStatus[] = ['novo', 'em-contato', 'qualificado', 'convertido', 'descartado']
const STAGE_TABS = [...LEAD_STAGES.map((s) => ({ value: s.value as LeadStage, label: s.label, dot: s.dot as string | null })), { value: 'todos' as LeadStage, label: 'Todos', dot: null }]
const TIPO_OPTIONS = [...LEAD_TIPOS.map((t) => ({ value: t.value as string, label: t.long, icon: <span>{t.icon}</span> })), { value: 'sem', label: 'A classificar', icon: <span>❔</span> }]
const EXPORT_OPTIONS = [
  { value: '0', label: 'Todo o período', hint: 'com os filtros desta tela' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
]
const DATA_LABELS: Record<string, string> = {
  regiao: 'Região',
  cultura: 'Cultura',
  produto: 'Produto',
  assunto: 'Assunto',
  estado: 'Estado',
  state: 'Estado',
  acres: 'Área',
  crop: 'Cultura',
  company: 'Empresa',
  problem: 'Problema',
  callback: 'Pediu ligação',
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

const first = (name: string) => name.trim().split(/\s+/)[0] ?? name

/** De onde veio, numa frase: "Botão do WhatsApp em Aminosan®". */
function origin(lead: InboxLead) {
  const form = LEAD_FORMS[lead.formulario ?? ''] ?? 'Site'
  const where = lead.produto || lead.detalhe || lead.cultura
  return where ? `${form} · ${where}` : form
}

function buildQuery(etapa: LeadStage, tipo: string, search: string, page = 1) {
  const q = new URLSearchParams()
  q.set('etapa', etapa)
  if (tipo !== 'todos') q.set('tipo', tipo)
  if (search) q.set('busca', search)
  if (page > 1) q.set('pagina', String(page))
  return `?${q.toString()}`
}

const Icon = {
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.3-1.8-.9-.8.8a4 4 0 0 1-2.2-2.2l.8-.8-.9-1.8z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" aria-hidden className="jdd__chevron">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
}

export function LeadsInboxClient({ leads, stageCounts, tipoCounts, etapa, tipo, search, page, totalPages, totalDocs, canCreate, canExport }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [term, setTerm] = useState(search)
  const [open, setOpen] = useState<number | null>(null)
  // Mudanças feitas agora (antes do servidor recarregar a lista).
  const [local, setLocal] = useState<Record<number, Partial<InboxLead>>>({})
  const [note, setNote] = useState<Record<number, string>>({})

  // Busca com espera curta: não recarrega a cada tecla.
  useEffect(() => {
    if (term === search) return
    const t = window.setTimeout(() => startTransition(() => router.replace(pathname + buildQuery(etapa, tipo, term.trim()))), 350)
    return () => window.clearTimeout(t)
  }, [term, search, etapa, tipo, pathname, router])

  const patch = async (lead: InboxLead, data: Record<string, unknown>) => {
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(res.status === 403 ? 'Seu perfil não pode alterar este lead.' : 'Não foi possível salvar. Tente de novo.')
  }

  const setStatus = async (lead: InboxLead, status: LeadStatus, message: string) => {
    const before = local[lead.id]?.status ?? lead.status
    if (before === status) return
    setLocal((l) => ({ ...l, [lead.id]: { ...l[lead.id], status } }))
    try {
      await patch(lead, { status })
      toast.success(message, {
        action: {
          label: 'Desfazer',
          onClick: async () => {
            setLocal((l) => ({ ...l, [lead.id]: { ...l[lead.id], status: before } }))
            await patch(lead, { status: before }).catch(() => {})
            startTransition(() => router.refresh())
          },
        },
      })
      startTransition(() => router.refresh())
    } catch (e) {
      setLocal((l) => ({ ...l, [lead.id]: { ...l[lead.id], status: before } }))
      toast.error((e as Error).message)
    }
  }

  // Respondeu por WhatsApp, telefone ou e-mail: sai de "Para responder".
  const contacted = (lead: InboxLead) => {
    const status = local[lead.id]?.status ?? lead.status
    if (status === 'novo') void setStatus(lead, 'em-contato', `${first(lead.nome)} foi para "Em conversa"`)
  }

  const setTipo = async (lead: InboxLead, value: string) => {
    const next = value === 'sem' ? null : value
    setLocal((l) => ({ ...l, [lead.id]: { ...l[lead.id], tipo: next } }))
    try {
      await patch(lead, { tipo: next })
      toast.success(`${first(lead.nome)}: ${tipoMeta(next)?.long ?? 'a classificar'}`)
      startTransition(() => router.refresh())
    } catch (e) {
      setLocal((l) => ({ ...l, [lead.id]: { ...l[lead.id], tipo: lead.tipo } }))
      toast.error((e as Error).message)
    }
  }

  const addNote = async (lead: InboxLead) => {
    const texto = (note[lead.id] ?? '').trim()
    if (!texto) return
    const notas = [...(local[lead.id]?.notas ?? lead.notas)]
    const next = [...notas, { texto, data: new Date().toISOString(), autor: 'Você' }]
    setLocal((l) => ({ ...l, [lead.id]: { ...l[lead.id], notas: next } }))
    setNote((n) => ({ ...n, [lead.id]: '' }))
    try {
      await patch(lead, { notas: [...notas.map((n) => ({ id: n.id, texto: n.texto })), { texto }] })
      toast.success('Nota salva')
      startTransition(() => router.refresh())
    } catch (e) {
      setLocal((l) => ({ ...l, [lead.id]: { ...l[lead.id], notas } }))
      toast.error((e as Error).message)
    }
  }

  const stage = LEAD_STAGES.find((s) => s.value === etapa)

  return (
    <div className={`jl jli${pending ? ' is-pending' : ''}`}>
      <header className="jl-head">
        <div>
          <h1>Leads</h1>
          <p>
            {stageCounts.responder
              ? `${stageCounts.responder} ${stageCounts.responder === 1 ? 'pessoa esperando' : 'pessoas esperando'} resposta`
              : 'Ninguém esperando resposta'}
          </p>
        </div>
        <div className="jl-head__actions">
          {canExport && (
            <Dropdown
              label="Exportar planilha"
              value={'' as string}
              options={EXPORT_OPTIONS}
              align="right"
              onChange={(dias) => {
                const q = new URLSearchParams({ etapa })
                if (tipo !== 'todos') q.set('tipo', tipo)
                if (search) q.set('search', search)
                if (dias !== '0') q.set('dias', dias)
                window.location.href = `/api/leads/export?${q.toString()}`
                toast.success('Planilha sendo baixada')
              }}
              trigger={
                <span className="jd-btn jd-btn--ghost jl-export">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  </svg>
                  Exportar planilha
                </span>
              }
            />
          )}
          {canCreate && (
            <Link className="jd-btn" href="/admin/collections/leads/create" title="Anotar um contato que chegou por telefone ou pessoalmente">
              + Registrar contato
            </Link>
          )}
        </div>
      </header>

      <nav className="jl-tabs" aria-label="Situação">
        {STAGE_TABS.map((t) => (
          <Link
            key={t.value}
            href={pathname + buildQuery(t.value, tipo, search)}
            className={`jl-tab${t.value === etapa ? ' is-active' : ''}`}
            aria-current={t.value === etapa ? 'page' : undefined}
          >
            {t.dot && <span className="jl-tab__dot" style={{ background: t.dot }} />}
            {t.label}
            <span className={`jl-tab__count${t.value === 'responder' && stageCounts.responder ? ' is-alert' : ''}`}>{stageCounts[t.value] ?? 0}</span>
          </Link>
        ))}
      </nav>

      <div className="jli-filters">
        <div className="jli-tipos" role="group" aria-label="Tipo de contato">
          {[{ value: 'todos', label: 'Todos os tipos', icon: '' }, ...LEAD_TIPOS.map((t) => ({ value: t.value as string, label: t.label, icon: t.icon })), { value: 'sem', label: 'A classificar', icon: '❔' }]
            .filter((t) => t.value === 'todos' || t.value === tipo || tipoCounts[t.value])
            .map((t) => (
              <Link
                key={t.value}
                href={pathname + buildQuery(etapa, t.value, search)}
                className={`jli-tipo${t.value === tipo ? ' is-active' : ''}`}
                aria-current={t.value === tipo ? 'true' : undefined}
              >
                {t.icon && <span aria-hidden>{t.icon}</span>}
                {t.label}
                <small>{tipoCounts[t.value] ?? 0}</small>
              </Link>
            ))}
        </div>
        <label className="jl-search">
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar por nome, empresa, e-mail, telefone ou mensagem" aria-label="Buscar leads" />
        </label>
      </div>

      {leads.length === 0 ? (
        <div className="jl-empty">
          <b>{search || tipo !== 'todos' ? 'Nenhum lead com esse filtro.' : (stage?.empty ?? 'Nenhum lead por aqui.')}</b>
          <span>{search || tipo !== 'todos' ? 'Tente outro filtro ou limpe a busca.' : 'Os contatos aparecem aqui assim que chegam pelos sites.'}</span>
        </div>
      ) : (
        <ul className="jli-list">
          {leads.map((lead0) => {
            const lead = { ...lead0, ...local[lead0.id] } as InboxLead
            const st = statusMeta(lead.status)
            const close = closeFor(lead.tipo)
            const tp = tipoMeta(lead.tipo)
            const phone = intlPhone(lead.site, lead.telefone)
            const isOpen = open === lead.id
            const leadStage = stageOf(lead.status)
            const answers = Object.entries(lead.dados ?? {}).filter(([k, v]) => v !== '' && v != null && !['produto', 'cultura'].includes(k) || (k === 'cultura' && v !== lead.cultura))
            return (
              <li key={lead.id} className={`jli-row${isOpen ? ' is-open' : ''} is-${leadStage}`}>
                <div className="jli-row__top">
                  <button type="button" className="jli-row__main" onClick={() => setOpen(isOpen ? null : lead.id)} aria-expanded={isOpen}>
                    <span className="jl-avatar" title={SITE_META[lead.site].label}>
                      {initials(lead.nome)}
                      <Flag site={lead.site} size={17} className="jl-avatar__flag" />
                    </span>
                    <span className="jli-who">
                      <b>
                        {lead.nome}
                        {lead.empresa && <span className="jli-company"> · {lead.empresa}</span>}
                        {lead.duplicado && <em className="jl-repeat">voltou a escrever</em>}
                      </b>
                      <span className="jli-msg">{lead.mensagem ? `“${lead.mensagem}”` : origin(lead)}</span>
                      <small>
                        {relativeDate(lead.createdAt)}
                        {lead.local ? ` · ${lead.local}` : ''}
                        {lead.mensagem ? ` · ${origin(lead)}` : ''}
                      </small>
                    </span>
                  </button>

                  <div className="jli-row__side">
                    <button type="button" className={`jli-toggle${isOpen ? ' is-open' : ''}`} onClick={() => setOpen(isOpen ? null : lead.id)} aria-expanded={isOpen}>
                      {isOpen ? 'Fechar' : 'Detalhes'}
                      {Icon.chevron}
                    </button>
                    <Dropdown
                      label={`Tipo de contato de ${lead.nome}`}
                      value={lead.tipo ?? 'sem'}
                      options={TIPO_OPTIONS}
                      align="right"
                      onChange={(v) => setTipo(lead, v)}
                      trigger={
                        <span className={`jli-tipo-pill${tp ? '' : ' is-empty'}`} style={tp ? { background: tp.bg, color: tp.fg } : undefined}>
                          {tp ? `${tp.icon} ${tp.label}` : 'Classificar'}
                          {Icon.chevron}
                        </span>
                      }
                    />
                    <div className="jli-contact">
                      {phone && (
                        <a
                          className="jli-btn jli-btn--wa"
                          href={`https://wa.me/${phone}?text=${encodeURIComponent(leadGreeting(lead))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => contacted(lead)}
                          title="Abrir conversa no WhatsApp com uma saudação pronta"
                        >
                          {Icon.whatsapp} <span>WhatsApp</span>
                        </a>
                      )}
                      {phone && (
                        <a className="jli-btn" href={`tel:+${phone}`} onClick={() => contacted(lead)} title={`Ligar: +${phone}`} aria-label="Ligar">
                          {Icon.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a
                          className="jli-btn"
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.site === 'us' ? 'Juma-Agro: your message' : 'Juma Agro: seu contato pelo site')}&body=${encodeURIComponent(`${leadGreeting(lead)}\n\n`)}`}
                          onClick={() => contacted(lead)}
                          title={`E-mail: ${lead.email}`}
                          aria-label="E-mail"
                        >
                          {Icon.mail}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="jli-detail">
                    <div className="jli-detail__col">
                      {lead.mensagem && (
                        <section>
                          <h4>Mensagem</h4>
                          <p className="jli-detail__msg">{lead.mensagem}</p>
                        </section>
                      )}
                      <section>
                        <h4>Contato</h4>
                        <dl className="jli-dl">
                          {lead.telefone && (
                            <>
                              <dt>Telefone</dt>
                              <dd>+{phone}</dd>
                            </>
                          )}
                          {lead.email && (
                            <>
                              <dt>E-mail</dt>
                              <dd>{lead.email}</dd>
                            </>
                          )}
                          <dt>Veio por</dt>
                          <dd>{origin(lead)}</dd>
                          {lead.pagina && (
                            <>
                              <dt>Página</dt>
                              <dd>{lead.pagina}</dd>
                            </>
                          )}
                          {answers.map(([k, v]) => (
                            <span key={k} className="jli-dl__pair">
                              <dt>{DATA_LABELS[k] ?? k}</dt>
                              <dd>{Array.isArray(v) ? v.join(', ') : String(v)}</dd>
                            </span>
                          ))}
                          <dt>Chegou em</dt>
                          <dd>{new Date(lead.createdAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                        </dl>
                      </section>
                    </div>

                    <div className="jli-detail__col">
                      <section>
                        <h4>Situação</h4>
                        <div className="jli-stage">
                          <span className="jli-status" style={{ background: st.bg, color: st.fg }}>
                            {statusLabel(lead.status, lead.tipo)}
                          </span>
                          {leadStage === 'responder' && (
                            <button type="button" className="jli-act jli-act--ok" onClick={() => setStatus(lead, 'em-contato', `${first(lead.nome)} foi para "Em conversa"`)}>
                              Já respondi
                            </button>
                          )}
                          {leadStage === 'conversa' && (
                            <>
                              <button type="button" className="jli-act jli-act--ok" onClick={() => setStatus(lead, 'convertido', `${first(lead.nome)}: ${close.winState.toLowerCase()}`)}>
                                {close.win}
                              </button>
                              <button type="button" className="jli-act" onClick={() => setStatus(lead, 'descartado', `${first(lead.nome)}: ${close.loseState.toLowerCase()}`)}>
                                {close.lose}
                              </button>
                            </>
                          )}
                          {leadStage === 'encerrados' && (
                            <button type="button" className="jli-act" onClick={() => setStatus(lead, 'em-contato', `${first(lead.nome)} voltou para "Em conversa"`)}>
                              Reabrir conversa
                            </button>
                          )}
                        </div>
                        {/* Clicou errado? Qualquer situação, inclusive voltar para "Para responder". */}
                        <Dropdown
                          className="jli-move"
                          label={`Mudar a situação de ${lead.nome}`}
                          value={lead.status}
                          options={STATUS_ORDER.filter((v) => v !== 'qualificado' || closeFor(lead.tipo).talking !== 'Em conversa' || lead.status === v).map((v) => ({
                            value: v,
                            label: statusLabel(v, lead.tipo),
                            dot: statusMeta(v).dot,
                          }))}
                          onChange={(v) => setStatus(lead, v, `${first(lead.nome)}: ${statusLabel(v, lead.tipo)}`)}
                          trigger={
                            <span className="jli-move__trigger">
                              Mudar situação
                              {Icon.chevron}
                            </span>
                          }
                        />
                      </section>

                      <section>
                        <h4>Notas {lead.notas.length ? `(${lead.notas.length})` : ''}</h4>
                        {lead.notas.length > 0 && (
                          <ul className="jli-notes">
                            {lead.notas.map((n, i) => (
                              <li key={n.id ?? i}>
                                <p>{n.texto}</p>
                                <small>
                                  {[n.autor, n.data ? relativeDate(n.data) : null].filter(Boolean).join(' · ')}
                                </small>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="jli-note-new">
                          <textarea
                            rows={2}
                            value={note[lead.id] ?? ''}
                            onChange={(e) => setNote((n) => ({ ...n, [lead.id]: e.target.value }))}
                            placeholder="Anotar o que foi conversado (só a equipe vê)"
                          />
                          <button type="button" className="jli-act" disabled={!(note[lead.id] ?? '').trim()} onClick={() => addNote(lead)}>
                            Salvar nota
                          </button>
                        </div>
                      </section>

                      <Link className="jli-full" href={`/admin/collections/leads/${lead.id}`}>
                        Ficha completa (origem, campanha, responsável) →
                      </Link>
                    </div>
                    <button type="button" className="jli-collapse" onClick={() => setOpen(null)}>
                      Fechar detalhes <span aria-hidden>▴</span>
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="jl-pager" aria-label="Páginas">
          <Link
            className={`jl-pager__btn${page <= 1 ? ' is-disabled' : ''}`}
            aria-disabled={page <= 1}
            href={pathname + buildQuery(etapa, tipo, search, Math.max(1, page - 1))}
          >
            ← Anterior
          </Link>
          <span>
            Página {page} de {totalPages} · {totalDocs} contatos
          </span>
          <Link
            className={`jl-pager__btn${page >= totalPages ? ' is-disabled' : ''}`}
            aria-disabled={page >= totalPages}
            href={pathname + buildQuery(etapa, tipo, search, Math.min(totalPages, page + 1))}
          >
            Próxima →
          </Link>
        </nav>
      )}
    </div>
  )
}
