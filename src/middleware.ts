import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames EXCEPT:
  //   /admin, /api — Payload CMS routes
  //   _next — Next.js internals
  //   files with extensions (favicon, images, etc.)
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
