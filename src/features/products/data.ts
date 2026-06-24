/**
 * Catálogo da home organizado pelas 5 LINHAS (doc 05/01-home-e-animacao §scroll
 * horizontal), com cor de fundo por linha (doc 05/04-cores-por-produto). A ordem
 * começa pela linha do Aminosan (hand-off do frasco novo da Herança) e alterna
 * famílias de cor: verde → azul → vermelho → índigo → dourado. Vizinhos nunca da
 * mesma família.
 *
 * Os títulos/apoio vêm do i18n (namespace `lines`); os nomes de produto são
 * próprios e idênticos nos 3 idiomas.
 *
 * TODO: Payload — trocar por query da coleção (conteúdo localizado). O tipo foi
 * desenhado para a troca ser só mudar a fonte, não o componente.
 */

export type ProductLine = {
  id: string
  /** chave i18n do título (namespace `lines`, ex.: `nutricao.title`). */
  titleKey: string
  /** chave i18n do apoio (namespace `lines`). */
  supportKey: string
  /** produtos da linha (nomes próprios). */
  products: string[]
  /** cor de fundo cheia (hex). */
  bg: string
  /** cor de texto legível sobre o fundo. */
  text: string
  /** família de cor (controle de vizinhança). */
  family: 'verde' | 'azul' | 'vermelho' | 'indigo' | 'dourado'
  /** destino do card (deep-link para a linha). */
  href: string
}

export const productLines: ProductLine[] = [
  {
    id: 'nutricao',
    titleKey: 'nutricao.title',
    supportKey: 'nutricao.support',
    products: ['Aminosan', 'FitoFert', 'Linha Revigo', 'RevigoPhos Amino', 'Revigo Cobre Ultra'],
    bg: '#006838',
    text: '#FFFFFF',
    family: 'verde',
    href: '/produtos',
  },
  {
    id: 'arranque',
    titleKey: 'arranque.title',
    supportKey: 'arranque.support',
    products: ['Acorda Ultra', 'Acorda Cana', 'Aduban'],
    bg: '#008DC2',
    text: '#FFFFFF',
    family: 'azul',
    href: '/produtos',
  },
  {
    id: 'protecao',
    titleKey: 'protecao.title',
    supportKey: 'protecao.support',
    products: ['KMEP Ultra'],
    bg: '#AD1115',
    text: '#FFFFFF',
    family: 'vermelho',
    href: '/produtos',
  },
  {
    id: 'manejos',
    titleKey: 'manejos.title',
    supportKey: 'manejos.support',
    products: ['Revigo + Milho', 'Revigo + Pasto'],
    bg: '#312783',
    text: '#FFFFFF',
    family: 'indigo',
    href: '/produtos',
  },
  {
    id: 'aplicacao',
    titleKey: 'aplicacao.title',
    supportKey: 'aplicacao.support',
    products: ['Linha Redutan', 'Supermix'],
    bg: '#C2B400',
    text: '#3A3600',
    family: 'dourado',
    href: '/produtos',
  },
]
