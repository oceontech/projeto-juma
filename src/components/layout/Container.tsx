import type { ElementType, ReactNode } from 'react'

/**
 * Container central do site: largura máxima 84rem (1344px) em notebooks,
 * 100rem (1600px) em telas ≥1600px e 120rem (1920px) em monitores grandes (≥2000px).
 * Fonte única do "respiro" horizontal — usar no shell (navbar/footer) e em cada seção.
 *
 * Padding lateral por faixa:
 *   mobile  <1024px  16→24px  (intocado)
 *   notebook 1024–1599px  24→32px  — enxuto de propósito: nessa faixa a tela
 *     não sobra, e cada px de padding sai da largura útil do conteúdo.
 *   desktop  ≥1600px  96px  — aqui sobra tela, o respiro grande volta.
 *   monitor  ≥2000px  16px  — o max-width já segura a linha de leitura.
 *
 * O respiro grande começa em min-[1600px], não em 2xl (1536px): 1536–1599 é
 * notebook e estava recebendo os 96px do desktop, estreitando o conteúdo.
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
    <Tag className={`mx-auto w-full max-w-[84rem] lg:max-w-[85rem] min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem] px-md sm:px-lg lg:px-[1.5rem] xl:px-[2rem] min-[1600px]:px-[6rem] min-[2000px]:px-md ${className}`}>
      {children}
    </Tag>
  )
}
