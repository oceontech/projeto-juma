/**
 * Linguagem de movimento da home (tokens — usar SEMPRE os mesmos).
 *
 * Uma seção = uma "voz" de movimento. Não misturar 4 easings na mesma seção.
 * Referência: docs/01-prd/PRD.md §4.3 (sistema de movimento).
 */

/** Easings — strings que o GSAP entende direto. */
export const EASE = {
  /** Reveals (entrada): easeOutExpo. Decisão de entrada do título/linha/card. */
  reveal: 'expo.out',
  /** Saída e loops suaves (parallax, scrub que respira). */
  inOut: 'power3.inOut',
  /** Micro-interações (hover, chip, count-up). */
  micro: 'power2.out',
} as const

/** Equivalente CSS do easing de reveal, para transitions fora do GSAP. */
export const EASE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** Durações em segundos. */
export const DUR = {
  /** Entrada de título grande. */
  title: 1.1,
  /** Subtítulo / linha de apoio. */
  sub: 0.6,
  /** Micro-interação (hover/chip). */
  micro: 0.3,
  /** Transição de cor de fundo entre produtos (scroll horizontal). */
  colorShift: 0.6,
} as const

/** Stagger em segundos. */
export const STAGGER = {
  /** Por linha de título. */
  line: 0.08,
  /** Por palavra. */
  word: 0.04,
  /** Por card de grid. */
  card: 0.08,
} as const

/** Deslocamento vertical padrão de um fade-up (px). */
export const FADE_Y = 24

/** ScrollTrigger: ponto de disparo padrão para reveals (topo do elemento a 80% da viewport). */
export const TRIGGER_START = 'top 80%'
