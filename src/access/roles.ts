import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

/**
 * Papéis do painel (docs/01-prd/painel-central.md, seção 7).
 *
 * - admin: tudo, inclusive usuários e integrações.
 * - editor: conteúdo do BR; vê leads, não altera.
 * - comercial: trabalha os leads (status, notas, responsável).
 *
 * Cada usuário também tem os sites em que atua (`sites`). Um comercial da LLC,
 * por exemplo, só enxerga os leads do site americano.
 */
export const ROLES = ['admin', 'editor', 'comercial'] as const
export type Role = (typeof ROLES)[number]

export const SITES = ['br', 'us'] as const
export type Site = (typeof SITES)[number]

type PanelUser = { collection?: string; papel?: Role | null; sites?: Site[] | null }

function panelUser(req: PayloadRequest): PanelUser | null {
  const user = req.user as PanelUser | null
  return user && user.collection === 'users' ? user : null
}

export function hasRole(req: PayloadRequest, ...roles: Role[]): boolean {
  const user = panelUser(req)
  return Boolean(user?.papel && roles.includes(user.papel))
}

export const isLoggedIn: Access = ({ req }) => Boolean(panelUser(req))
export const isAdmin: Access = ({ req }) => hasRole(req, 'admin')
export const isAdminField: FieldAccess = ({ req }) => hasRole(req, 'admin')

/** Cookie do seletor de site da sidebar do painel ("Todos", "Brasil", "EUA"). */
export const SITE_COOKIE = 'painel_site'

/** Site escolhido no seletor do painel, ou null para "Todos". */
export function selectedSite(req: PayloadRequest): Site | null {
  const cookie = req.headers?.get?.('cookie') ?? ''
  const value = cookie.match(new RegExp(`(?:^|;\\s*)${SITE_COOKIE}=([^;]+)`))?.[1]
  return value === 'br' || value === 'us' ? value : null
}

/**
 * Restringe a leitura aos sites do usuário e, dentro deles, ao site escolhido
 * no seletor do painel. Admin enxerga os dois sites.
 */
export function bySite(req: PayloadRequest, ...roles: Role[]): boolean | Where {
  const user = panelUser(req)
  if (!user?.papel || !roles.includes(user.papel)) return false
  const allowed: Site[] = user.papel === 'admin' ? [...SITES] : user.sites?.length ? user.sites : []
  const chosen = selectedSite(req)
  const sites = chosen && allowed.includes(chosen) ? [chosen] : allowed
  if (user.papel === 'admin' && sites.length === SITES.length) return true
  return { site: { in: sites } }
}
