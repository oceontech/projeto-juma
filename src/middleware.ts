import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from './i18n/routing'

const intl = createMiddleware(routing)

/**
 * Redirecionamentos do painel (Site › Redirecionamentos). A lista vem de
 * `/api/redirects/mapa` e fica 1 minuto em memória; se o painel não
 * responder, o site segue normal.
 */
type RedirectMap = Record<string, [string, number]>
let cached: { map: RedirectMap; at: number } | null = null
let pending: Promise<RedirectMap> | null = null
const TTL = 60_000
const LOCALE = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`, 'i')

async function redirectMap(origin: string): Promise<RedirectMap> {
  if (cached && Date.now() - cached.at < TTL) return cached.map
  pending ??= fetch(`${origin}/api/redirects/mapa`, { signal: AbortSignal.timeout(1500) })
    .then((r) => (r.ok ? (r.json() as Promise<RedirectMap>) : cached?.map ?? {}))
    .catch(() => cached?.map ?? {})
    .then((map) => {
      cached = { map, at: Date.now() }
      pending = null
      return map
    })
  return pending
}

function normalize(path: string) {
  let p = path.replace(/\/{2,}/g, '/')
  if (p.length > 1) p = p.replace(/\/$/, '')
  try {
    p = decodeURI(p)
  } catch {
    // mantém
  }
  return p.toLowerCase()
}

export default async function middleware(req: NextRequest) {
  const map = await redirectMap(req.nextUrl.origin)
  if (Object.keys(map).length) {
    const path = normalize(req.nextUrl.pathname)
    const locale = req.nextUrl.pathname.match(LOCALE)?.[1]
    const bare = locale ? normalize(path.replace(LOCALE, '') || '/') : path
    const hit = map[path] ?? (locale ? map[bare] : undefined)
    if (hit) {
      let [to, status] = hit
      // "/materias/nova" achado pelo endereço sem idioma mantém o idioma de quem acessou.
      if (!/^https?:\/\//i.test(to) && locale && !LOCALE.test(to) && !map[path]) to = `/${locale}${to === '/' ? '' : to}`
      const url = /^https?:\/\//i.test(to) ? new URL(to) : new URL(to, req.nextUrl.origin)
      if (!/^https?:\/\//i.test(to)) url.search = req.nextUrl.search
      return NextResponse.redirect(url, status)
    }
  }
  return intl(req)
}

export const config = {
  // Match all pathnames EXCEPT:
  //   /admin, /api — Payload CMS routes
  //   _next — Next.js internals
  //   files with extensions (favicon, images, etc.)
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
