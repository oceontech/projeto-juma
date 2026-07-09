import type { ElementType, ReactNode } from 'react'

/**
 * Container central do site: largura máxima 84rem (1344px) em notebooks,
 * 100rem (1600px) em telas ≥1600px e 120rem (1920px) em monitores grandes (≥2000px).
 * Padding lateral responsivo (24px no desktop, 16px em monitores ≥2000px).
 * Fonte única do "respiro" horizontal — usar no shell (navbar/footer) e em cada seção.
 */
export function Container({
  as: Tag = 'div',
  className = '',
  children,
}: {
  as?: ElementType
  className?: string
  children: ReactNode
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[84rem] min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem] px-md sm:px-lg min-[2000px]:px-md ${className}`}>
      {children}
    </Tag>
  )
}
