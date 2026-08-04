'use client'

/**
 * Reveal de título caractere a caractere — o MESMO desenho de sempre, montado
 * de um jeito que cabe no orçamento de frame de um iPhone.
 *
 * ── O que travava ──────────────────────────────────────────────────────
 * A receita espalhada pelo site era esta:
 *
 *     const split = new SplitText(title, { type: 'chars,lines' })
 *     gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
 *     tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', ... })
 *
 * Das três propriedades animadas, duas são de graça e uma é cara. `x` e
 * `opacity` são compostas na GPU — sessenta caracteres deslizando custam pouco.
 * `filter: blur()` é PINTURA: o navegador precisa redesenhar o elemento e
 * refazer o desfoque a cada frame. Aplicado por caractere, um H2 de cinquenta
 * letras vira cinquenta desfoques gaussianos por frame, durante os dois
 * segundos da cascata — algo como seis mil operações de desfoque por reveal, em
 * dez seções diferentes da home.
 *
 * ── O que mudou ────────────────────────────────────────────────────────
 * O desfoque sai de cada letra e vai para o título inteiro: UM filtro em vez de
 * cinquenta. A cascata continua letra a letra, com o mesmo deslocamento, a
 * mesma duração e o mesmo easing. O que se vê é o título entrando desfocado e
 * ganhando foco enquanto as letras deslizam — a diferença para o desenho
 * anterior (cada letra focando por conta própria) não se distingue a olho nu
 * num stagger de 20ms, e o custo cai por volta de cinquenta vezes.
 *
 * Além disso, duas fontes de custo PERMANENTE que a receita antiga deixava para
 * trás e esta remove:
 *
 *  • Os spans do SplitText nunca eram desfeitos. Cada título deixava algumas
 *    dezenas de elementos extras no DOM pelo resto da visita; somando as seções
 *    da home, passa de setecentos. Aqui o split é revertido assim que a
 *    animação termina — o texto volta a ser um nó só.
 *  • `will-change` só existe DURANTE a animação. Prometer transformação em
 *    dezenas de caracteres e deixar a promessa de pé reserva memória de vídeo
 *    que nunca é devolvida.
 */

import { gsap, SplitText } from './gsap'
import { DUR, EASE, STAGGER } from './motion'
import { isLowPower } from './device'

export type CharRevealOptions = {
  /** Deslocamento horizontal inicial, em px (default: 20 — o valor do site). */
  distance?: number
  /** Eixo do deslocamento (default: 'x'). */
  axis?: 'x' | 'y'
  /** Desfoque de entrada, aplicado ao título inteiro (default: 10px). */
  blur?: number
  /** Duração da cascata (default: DUR.title). */
  duration?: number
  /** Intervalo entre caracteres (default: STAGGER.char). */
  stagger?: number
  /** Easing (default: EASE.reveal). */
  ease?: string
  /** Usa `autoAlpha` em vez de `opacity`. */
  autoAlpha?: boolean
  /**
   * Quebra por palavra em vez de caractere. Só para títulos onde o desenho
   * aprovado já era por palavra (Problem, Desata) — o padrão continua sendo
   * caractere.
   */
  by?: 'chars' | 'words'
  /**
   * Desfaz o split sozinho quando a cascata termina (default: true).
   *
   * Vale só em aparelho de toque, onde o reveal roda uma vez — no desktop os
   * spans precisam continuar de pé para a timeline poder reverter ao rolar de
   * volta. Passe `false` em reveals presos a `scrub` ou a timelines pausadas
   * que são reiniciadas (o alvo precisa sobreviver ao fim da animação).
   */
  autoRevert?: boolean
}

export type CharReveal = {
  /** Os caracteres (ou palavras) que a timeline anima. */
  chars: Element[]
  /** Estado escondido — para `gsap.set` ou para uma tween de saída. */
  hidden: gsap.TweenVars
  /** Aplica o estado escondido agora (inclui o desfoque do container). */
  hide: () => void
  /**
   * Encaixa a entrada numa timeline, na posição dada.
   * Anima o desfoque do container e a cascata das letras em paralelo.
   */
  playIn: (tl: gsap.core.Timeline, position?: gsap.Position) => void
  /** Desfaz o split e devolve o texto original ao DOM. */
  revert: () => void
}

export function createCharReveal(
  el: HTMLElement | null | undefined,
  options: CharRevealOptions = {},
): CharReveal | null {
  if (!el) return null

  const {
    distance = 20,
    axis = 'x',
    blur = 10,
    duration = DUR.title,
    stagger = STAGGER.char,
    ease = EASE.reveal,
    autoAlpha = false,
    by = 'chars',
    autoRevert = true,
  } = options

  const split = new SplitText(el, { type: by === 'words' ? 'words,lines' : 'chars,lines' })
  const chars = by === 'words' ? split.words : split.chars
  const alphaKey = autoAlpha ? 'autoAlpha' : 'opacity'

  /* O desfoque do container tem duração própria, mais curta que a cascata: ele
     entrega a sensação de foco nos primeiros quadros e sai de cena, deixando o
     resto do stagger correr só com transform e opacity — compostos, sem
     nenhuma repintura. Prender o filtro à duração inteira manteria a camada em
     modo de pintura por todo o reveal sem ganho visual. */
  const blurDuration = Math.min(0.45, duration * 0.5)

  const hidden: gsap.TweenVars = { [axis]: distance, [alphaKey]: 0 }

  /* Só limpa sozinho onde o reveal roda uma vez. No desktop a seção reanima ao
     voltar para a tela, e para isso os spans precisam continuar existindo. */
  const cleansUp = autoRevert && revealRunsOnce()
  let reverted = false
  const revert = () => {
    if (reverted) return
    reverted = true
    split.revert()
  }

  return {
    chars,
    hidden,
    hide: () => {
      if (blur > 0) gsap.set(el, { filter: `blur(${blur}px)` })
      if (chars.length) gsap.set(chars, hidden)
    },
    playIn: (tl, position = 0) => {
      if (!chars.length) return

      if (blur > 0) {
        tl.to(
          el,
          {
            filter: 'blur(0px)',
            duration: blurDuration,
            ease: 'power2.out',
            /* Sem `clearProps` o elemento fica com `filter: blur(0px)` inline —
               um filtro de valor zero ainda é um filtro, e mantém a subárvore
               inteira fora do caminho acelerado pelo resto da visita. */
            onComplete: () => gsap.set(el, { clearProps: 'filter' }),
          },
          position,
        )
      }

      tl.to(
        chars,
        {
          [axis]: 0,
          [alphaKey]: 1,
          duration,
          ease,
          stagger,
          /* A promessa de transformação vale só enquanto a cascata corre; ao
             fim, `clearProps` devolve a memória de vídeo dos caracteres. */
          willChange: 'transform, opacity',
          clearProps: 'willChange,transform',
          /* Terminou de entrar: os spans do split saíram de cena e o texto
             volta a ser um nó só. Sem isto, cada título deixa algumas dezenas
             de elementos no DOM pelo resto da visita — somando as seções da
             home, passa de setecentos, todos com estilo inline e todos entrando
             em cada recálculo de layout que a página fizer daí em diante. */
          onComplete: cleansUp ? revert : undefined,
        },
        position,
      )
    },
    revert,
  }
}

/**
 * `toggleActions` dos reveals de seção.
 *
 * No desktop o comportamento continua o de sempre: a seção reanima ao voltar
 * para a tela. No aparelho de toque ela roda uma vez e fica.
 *
 * O motivo não é economia de efeito, é o custo do vaivém: o polegar atravessa a
 * home em poucos gestos, e com `reverse` cada seção que passa dispara uma
 * timeline de entrada e, um instante depois, uma de saída. São dezenas de
 * timelines montadas e revertidas dentro de um único movimento, todas
 * disputando os frames que deveriam estar desenhando a rolagem — e é isso que
 * faz a página parecer mais pesada quanto mais se desce. Rodar uma vez também
 * é o que permite desfazer o split e limpar os spans depois da animação.
 */
export function revealToggleActions(): string {
  return isLowPower() ? 'play none none none' : 'play reverse play reverse'
}

/** `true` quando o reveal deve rodar uma vez só (e então limpar-se). */
export function revealRunsOnce(): boolean {
  return isLowPower()
}
