import type { ComponentType, ReactElement, SVGProps } from 'react'

/**
 * Bandeiras em SVG inline (viewBox 24×16) — emoji de bandeira não renderiza
 * no Windows. Usadas no seletor de idioma e na seção de presença internacional.
 */

export type FlagComp = ComponentType<SVGProps<SVGSVGElement>>

export function FlagBR(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="24" height="16" fill="#009739" />
      <polygon points="12,1.8 22.2,8 12,14.2 1.8,8" fill="#FEDD00" />
      <circle cx="12" cy="8" r="3.1" fill="#002776" />
      <path d="M9.2 7.3 Q12 6.1 14.8 7.3" stroke="#fff" strokeWidth="0.7" fill="none" />
    </svg>
  )
}

export function FlagUS(props: SVGProps<SVGSVGElement>) {
  const stripe = 16 / 13
  const stars: ReactElement[] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      const x = 1.1 + c * 1.75 + (r % 2) * 0.88
      const y = 1.25 + r * 1.95
      if (x < 9.1) stars.push(<circle key={`${r}-${c}`} cx={x} cy={y} r={0.3} fill="#fff" />)
    }
  }
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="24" height="16" fill="#B22234" />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <rect key={i} y={i * stripe} width="24" height={stripe} fill="#fff" />
      ))}
      <rect width="9.6" height={7 * stripe} fill="#3C3B6E" />
      {stars}
    </svg>
  )
}

export function FlagES(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="xMidYMid slice" {...props}>
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </svg>
  )
}
