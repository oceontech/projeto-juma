/**
 * Bandeiras do Brasil e dos EUA em SVG (emoji de bandeira não aparece no
 * Windows). Redondas por padrão; `size` em px.
 */
type Props = { site: 'br' | 'us'; size?: number; className?: string; title?: string }

export function Flag({ site, size = 20, className = '', title }: Props) {
  const label = title ?? (site === 'us' ? 'Estados Unidos' : 'Brasil')
  return (
    <svg
      className={`juma-flag ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={label}
      style={{ borderRadius: '999px', flex: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,.08)' }}
    >
      <title>{label}</title>
      <defs>
        <clipPath id={`flag-clip-${site}`}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      {site === 'br' ? (
        <g clipPath={`url(#flag-clip-br)`}>
          <rect width="32" height="32" fill="#009c3b" />
          <path d="M16 5 29 16 16 27 3 16z" fill="#ffdf00" />
          <circle cx="16" cy="16" r="6.2" fill="#002776" />
          <path d="M10.2 14.6c3.9-.9 8.2-.4 11.6 1.5" stroke="#fff" strokeWidth="1.1" fill="none" />
        </g>
      ) : (
        <g clipPath={`url(#flag-clip-us)`}>
          <rect width="32" height="32" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={(i * 32) / 13} width="32" height={32 / 13} fill="#b22234" />
          ))}
          <rect width="15" height={(32 / 13) * 7} fill="#3c3b6e" />
          {[
            [3, 3], [7.5, 3], [12, 3],
            [5.2, 6.8], [9.8, 6.8],
            [3, 10.6], [7.5, 10.6], [12, 10.6],
            [5.2, 14.4], [9.8, 14.4],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill="#fff" />
          ))}
        </g>
      )}
    </svg>
  )
}
