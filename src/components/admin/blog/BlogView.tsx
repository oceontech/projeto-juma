import { DefaultTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps, Where } from 'payload'

import { SITES, selectedSite, type Site } from '@/access/roles'
import { loadPostViews } from '@/features/analytics/umami'

import { BlogViewClient, type BlogCard } from './BlogViewClient'

/**
 * Blog (/admin/blog): matérias do site Brasil e posts do site EUA numa tela
 * só, com o seletor Todos · Brasil · EUA. Cada post continua na sua coleção
 * (articles / posts-us), porque os campos e o idioma são diferentes.
 */

type Doc = Record<string, any>
const categoryName = (tema: unknown) => (typeof tema === 'object' && tema && 'nome' in tema ? String((tema as { nome?: string }).nome ?? '') : '')

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : null

/** Publicado com data no futuro = agendado (o site só mostra a partir dela). */
const statusOf = (status?: string | null, date?: string | null): BlogCard['status'] =>
  status !== 'published' ? 'draft' : date && new Date(date).getTime() > Date.now() ? 'scheduled' : 'published'

export async function BlogView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const req = initPageResult.req
  const user = req.user as { papel?: string; sites?: Site[] | null } | null
  if (!user) redirect('/admin/login?redirect=%2Fadmin%2Fblog')

  const allowed: Site[] = user.papel === 'admin' ? [...SITES] : user.sites?.length ? user.sites : []
  const chosen = selectedSite(req)
  const sites = chosen && allowed.includes(chosen) ? [chosen] : allowed
  const perms = initPageResult.permissions?.collections
  const canRead = { br: Boolean(perms?.articles?.read), us: Boolean(perms?.['posts-us']?.read) }
  const canCreate = { br: Boolean(perms?.articles?.create), us: Boolean(perms?.['posts-us']?.create) }

  const q = typeof searchParams?.q === 'string' ? searchParams.q.trim() : ''
  const status = searchParams?.status === 'published' || searchParams?.status === 'draft' ? searchParams.status : 'todos'

  const where = (titleField: string): Where => ({
    and: [
      ...(status !== 'todos' ? [{ _status: { equals: status } }] : []),
      ...(q ? [{ [titleField]: { like: q } }] : []),
    ],
  })
  const statusCount = async (collection: 'articles' | 'posts-us', s?: 'published' | 'draft') =>
    (await req.payload.count({ collection, where: s ? { _status: { equals: s } } : undefined, overrideAccess: true })).totalDocs

  const wantBr = sites.includes('br') && canRead.br
  const wantUs = sites.includes('us') && canRead.us

  const [br, us, counts, views] = await Promise.all([
    wantBr
      ? req.payload.find({ collection: 'articles', where: where('titulo'), sort: '-data', limit: 60, depth: 1, locale: 'pt-BR', draft: true, overrideAccess: true })
      : null,
    wantUs
      ? req.payload.find({ collection: 'posts-us', where: where('title'), sort: '-date', limit: 60, depth: 1, draft: true, overrideAccess: true })
      : null,
    Promise.all(
      (['published', 'draft'] as const).map(async (s) => {
        const [a, b] = await Promise.all([wantBr ? statusCount('articles', s) : 0, wantUs ? statusCount('posts-us', s) : 0])
        return a + b
      }),
    ),
    // Acessos de cada post (Umami, somando os idiomas); null sem analytics.
    loadPostViews(),
  ])
  const viewsOf = (site: Site, slug?: string | null, status?: string | null) =>
    views && slug && status === 'published' ? (views.get(`${site}:${slug}`) ?? 0) : null

  const image = (m: unknown) => (typeof m === 'object' && m && 'url' in m ? ((m as { url?: string }).url ?? null) : null)
  const cards: BlogCard[] = [
    ...((br?.docs ?? []) as Doc[]).map((d) => ({
      key: `br-${d.id}`,
      site: 'br' as const,
      href: `/admin/collections/articles/${d.id}`,
      title: d.titulo || 'Sem título',
      image: image(d.capa),
      meta: [categoryName(d.tema), fmtDate(d.data)].filter(Boolean) as string[],
      status: statusOf(d._status, d.data),
      date: d.data ?? d.createdAt,
      updatedAt: d.updatedAt,
      views: viewsOf('br', d.slug, d._status),
    })),
    ...((us?.docs ?? []) as Doc[]).map((d) => ({
      key: `us-${d.id}`,
      site: 'us' as const,
      href: `/admin/collections/posts-us/${d.id}`,
      title: d.title || 'Untitled',
      image: image(d.cover),
      meta: [categoryName(d.tema), fmtDate(d.date)].filter(Boolean) as string[],
      status: statusOf(d._status, d.date),
      date: d.date ?? d.createdAt,
      updatedAt: d.updatedAt,
      views: viewsOf('us', d.slug, d._status),
    })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)))

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      req={req}
      searchParams={searchParams}
      user={req.user ?? undefined}
      // Telas próprias não recebem as ações globais (cabeçalho) sozinhas.
      viewActions={req.payload.config.admin.components?.actions}
      visibleEntities={initPageResult.visibleEntities}
    >
      <BlogViewClient
        site={chosen && allowed.includes(chosen) ? chosen : 'todos'}
        cards={cards}
        counts={{ todos: counts[0] + counts[1], published: counts[0], draft: counts[1] }}
        status={status}
        search={q}
        create={{ br: canCreate.br && allowed.includes('br'), us: canCreate.us && allowed.includes('us') }}
      />
    </DefaultTemplate>
  )
}
