import * as FLAGS from 'country-flag-icons/string/1x1'

import { countryName } from '@/features/analytics/labels'

import { Flag } from './Flag'

/**
 * Bandeira redonda de qualquer país pelo código ISO (BR, US, LU…), em SVG
 * (emoji de bandeira não aparece no Windows). Só no servidor: o SVG vai
 * embutido no HTML e nenhum país entra no JavaScript do painel.
 */
export function CountryFlag({ country, size = 16 }: { country?: string | null; size?: number }) {
  const code = String(country ?? '').toUpperCase()
  if (code === 'BR') return <Flag site="br" size={size} />
  if (code === 'US') return <Flag site="us" size={size} />
  const svg = (FLAGS as Record<string, string>)[code]
  if (!svg) return <span className="ja-cc">{code || '?'}</span>
  const name = countryName(code)
  return (
    <span
      className="ja-flag"
      role="img"
      aria-label={name}
      title={name}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
