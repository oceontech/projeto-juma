'use client'

import { toast } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { LEAD_FORMS, LEAD_STATUS, SITE_META, relativeDate, statusMeta, type LeadStatus } from '../leadMeta'
import { Dropdown } from '../ui/Dropdown'
import { Flag } from '../ui/Flag'

export type InboxLead = {
  id: number
  nome: string
  empresa: string | null
  email: string | null
  telefone: string | null
  site: 'br' | 'us'
  status: LeadStatus
  formulario: string | null
  interesse: string | null
  regiao: string | null
  responsavel: string | null
  duplicado: boolean
  createdAt: string
}

type Props = {
  leads: InboxLead[]
  counts: Record<string, number>
  currentStatus: string
  search: string
  page: number
  totalPages: number
  totalDocs: number
  canCreate: boolean
}

const TABS = [{ value: 'todos', label: 'Todos' }, ...LEAD_STATUS.map((s) => ({ value: s.value, label: s.label }))]
const STATUS_OPTIONS = LEAD_STATUS.map((s) => ({ value: s.value, label: s.label, dot: s.dot }))

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function buildQuery(status: string, search: string, page = 1) {
  const q = new URLSearchParams()
  if (status !== 'todos') q.set('where[status][equals]', status)
  if (search) q.set('search', search)
  if (page > 1) q.set('page', String(page))
  q.set('sort', '-createdAt')
  return `?${q.toString()}`
}

export function LeadsInboxClient({ leads, counts, currentStatus, search, page, totalPages, totalDocs, canCreate }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [term, setTerm] = useState(search)
  const [statuses, setStatuses] = useState<Record<number, LeadStatus>>({})

  // Busca com espera curta: não recarrega a cada tecla.
  useEffect(() => {
    if (term === search) return
    const t = window.setTimeout(() => {
      startTransition(() => router.replace(pathname + buildQuery(currentStatus, term.trim())))
    }, 350)
    return () => window.clearTimeout(t)
  }, [term, search, currentStatus, pathname, router])

  const changeStatus = async (lead: InboxLead, status: LeadStatus) => {
    setStatuses((s) => ({ ...s, [lead.id]: status }))
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`${lead.nome.split(' ')[0]}: ${statusMeta(status).label}`)
      startTransition(() => router.refresh())
    } else {
      setStatuses((s) => ({ ...s, [lead.id]: lead.status }))
      toast.error(res.status === 403 ? 'Seu perfil não pode alterar este lead.' : 'Não foi possível salvar. Tente de novo.')
    }
  }

  return (
    <div className={`jl${pending ? ' is-pending' : ''}`}>
      <header className="jl-head">
        <div>
          <h1>Leads</h1>
          <p>
            {totalDocs} contato{totalDocs === 1 ? '' : 's'}
            {currentStatus !== 'todos' ? ` em “${statusMeta(currentStatus).label}”` : ''}
            {search ? ` para “${search}”` : ''}
          </p>
        </div>
        {canCreate && (
          <Link className="jd-btn" href="/admin/collections/leads/create">
            + Registrar contato
          </Link>
        )}
      </header>

      <nav className="jl-tabs" aria-label="Filtrar por status">
        {TABS.map((t) => {
          const active = t.value === currentStatus
          const meta = t.value === 'todos' ? null : statusMeta(t.value)
          return (
            <Link
              key={t.value}
              href={pathname + buildQuery(t.value, search)}
              className={`jl-tab${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {meta && <span className="jl-tab__dot" style={{ background: meta.dot }} />}
              {t.label}
              <span className="jl-tab__count">{counts[t.value] ?? 0}</span>
            </Link>
          )
        })}
      </nav>

      <label className="jl-search">
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por nome, empresa, e-mail ou telefone"
          aria-label="Buscar leads"
        />
      </label>

      {leads.length === 0 ? (
        <div className="jl-empty">
          <b>Nenhum lead por aqui.</b>
          <span>{search || currentStatus !== 'todos' ? 'Tente outro filtro ou limpe a busca.' : 'Os contatos aparecem aqui assim que chegarem pelos sites.'}</span>
        </div>
      ) : (
        <ul className="jl-list">
          {leads.map((lead) => {
            const status = statuses[lead.id] ?? lead.status
            const site = SITE_META[lead.site]
            return (
              <li key={lead.id} className="jl-row">
                <Link href={`/admin/collections/leads/${lead.id}`} className="jl-row__main">
                  <span className="jl-avatar" title={site.label}>
                    {initials(lead.nome)}
                    <Flag site={lead.site} size={17} className="jl-avatar__flag" />
                  </span>
                  <span className="jl-row__who">
                    <b>
                      {lead.nome}
                      {lead.duplicado && <em className="jl-repeat">repetido</em>}
                    </b>
                    <small>{[lead.empresa, lead.regiao, lead.email || lead.telefone].filter(Boolean).join(' · ') || site.label}</small>
                  </span>
                </Link>
                <span className="jl-row__meta">
                  {lead.interesse && <span className="jd-pill">{lead.interesse}</span>}
                  <span className="jl-form">{LEAD_FORMS[lead.formulario ?? ''] ?? 'Formulário'}</span>
                </span>
                <span className="jl-row__side">
                  <Dropdown
                    className="jl-status"
                    label={`Status de ${lead.nome}`}
                    value={status}
                    options={STATUS_OPTIONS}
                    align="right"
                    onChange={(v) => changeStatus(lead, v)}
                    trigger={
                      <span className="jl-status__pill" style={{ background: statusMeta(status).bg, color: statusMeta(status).fg }}>
                        {statusMeta(status).label}
                        <svg className="jdd__chevron" viewBox="0 0 24 24" aria-hidden>
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    }
                  />
                  <span className="jl-when" title={new Date(lead.createdAt).toLocaleString('pt-BR')}>
                    {relativeDate(lead.createdAt)}
                    {lead.responsavel && <small>{lead.responsavel}</small>}
                  </span>
                </span>
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
            href={pathname + buildQuery(currentStatus, search, Math.max(1, page - 1))}
          >
            ← Anterior
          </Link>
          <span>
            Página {page} de {totalPages}
          </span>
          <Link
            className={`jl-pager__btn${page >= totalPages ? ' is-disabled' : ''}`}
            aria-disabled={page >= totalPages}
            href={pathname + buildQuery(currentStatus, search, Math.min(totalPages, page + 1))}
          >
            Próxima →
          </Link>
        </nav>
      )}
    </div>
  )
}
