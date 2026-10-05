import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from './i18n/routing'

const intl = createMiddleware(routing)

/** Cadastro padrão do Payload pede a senha da pessoa: no painel, gente nova entra por convite. */
const USERS_CREATE = '/admin/collections/users/create'

export default function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === USERS_CREATE) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/collections/users'
    url.search = '?convidar=1'
    return NextResponse.redirect(url)
  }
  return intl(req)
}

export const config = {
  // Match all pathnames EXCEPT:
  //   /admin, /api — Payload CMS routes (menos o cadastro de usuário, que vira convite)
  //   _next — Next.js internals
  //   files with extensions (favicon, images, etc.)
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)', '/admin/collections/users/create'],
}
