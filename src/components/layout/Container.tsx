import type { ElementType, ReactNode } from 'react'

/**
 * Container central do site: largura máxima ~1280px e padding lateral responsivo.
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
    <Tag className={`mx-auto w-full max-w-[80rem] min-[1600px]:max-w-[90rem] px-md sm:px-lg lg:px-xl ${className}`}>
      {children}
    </Tag>
  )
}
