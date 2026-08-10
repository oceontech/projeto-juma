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
 *   desktop  ≥1600px  64px  — aqui sobra tela, o respiro maior volta. Eram
 *     96px: numa tela grande isso comia largura de conteúdo à toa, e 64px
 *     ainda passa longe dos traços do SectionNav (32px de traço a 20px da
 *     borda, ou seja, 52px no pior caso).
 *   monitor  ≥2000px  16px  — o max-width já segura a linha de leitura.
 *
 * O respiro grande começa em min-[1600px], não em 2xl (1536px): 1536–1599 é
 * notebook e estava recebendo os 96px do desktop, estreitando o conteúdo.
 *
 * Quem sobrescreve este padding (Navbar, bloco de apoio do hero) tem que
 * acompanhar a mesma escala — é o que mantém a borda direita da navbar, do
 * hero e das seções na mesma linha.
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
    <Tag className={`mx-auto w-full max-w-[84rem] lg:max-w-[85rem] min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem] px-md sm:px-lg lg:px-[1.5rem] xl:px-[2rem] min-[1600px]:px-[4rem] min-[2000px]:px-md ${className}`}>
      {children}
    </Tag>
  )
}
