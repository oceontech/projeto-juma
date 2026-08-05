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

import { gsap, ScrollTrigger, SplitText } from './gsap'
import { DUR, EASE, STAGGER, blurPx } from './motion'

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
  /** Intervalo entre alvos, para quem monta a tween por conta própria. */
  stagger: number
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

  /* O desfoque vale só onde há folga de pintura.
     Ele é a única propriedade cara do reveal, e no celular deixava rastro: se
     a timeline para no meio de uma reversão — o que acontece o tempo todo com
     scroll rápido —, o elemento fica com `filter` inline e sai do caminho
     acelerado pelo resto da visita. Medido na home, catorze títulos e
     parágrafos nesse estado depois de uma única passagem. A cascata letra a
     letra, que é o que define o efeito, continua igual nos dois casos. */
  const blurAtivo = blurPx(blur) !== 'none' ? blur : 0

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
    stagger,
    hidden,
    hide: () => {
      if (blurAtivo > 0) gsap.set(el, { filter: `blur(${blurAtivo}px)` })
      if (chars.length) gsap.set(chars, hidden)
    },
    playIn: (tl, position = 0) => {
      if (!chars.length) return

      if (blurAtivo > 0) {
        /* O filtro precisa sumir do elemento nos DOIS sentidos.
           Antes a limpeza vinha só no `onComplete`: quando a seção saía da tela
           a timeline revertia, o desfoque voltava ao valor inicial e ficava
           inline para sempre. Um `filter` residual — mesmo `blur(0px)` — tira o
           elemento e toda a sua subárvore do caminho acelerado, e o preço é
           pago em pintura pelo resto da visita. Medido na home: três títulos
           ficavam nesse estado depois de uma passagem de scroll. */
        const limpar = () => gsap.set(el, { clearProps: 'filter' })
        tl.to(
          el,
          {
            filter: 'blur(0px)',
            duration: blurDuration,
            ease: 'power2.out',
            onComplete: limpar,
            onReverseComplete: limpar,
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
 * `toggleActions` padrão dos reveals de seção — entrada E saída, em todo
 * aparelho.
 *
 * A seção anima ao entrar na tela e desanima ao sair, nos dois sentidos: quem
 * volta para uma seção já vista a vê entrar de novo, em vez de encontrá-la
 * parada no estado final.
 *
 * Isto já chegou a ser cortado no celular, por conta do custo do vaivém — o
 * polegar atravessa a home em poucos gestos e cada seção que passa dispara uma
 * timeline de entrada e outra de saída. O que tornava esse vaivém caro, porém,
 * não era o número de timelines: era o `filter: blur()` que cada uma animava em
 * dezenas de caracteres. Com o desfoque no título inteiro (ver o topo deste
 * arquivo), o que sobra por seção é `transform` e `opacity` — compostos, com
 * custo de frame desprezível. Não há mais razão para abrir mão do efeito.
 */
export function revealToggleActions(): string {
  return 'play reverse play reverse'
}

/**
 * `false` desde que a entrada e a saída passaram a valer em todo aparelho:
 * reverter o split ao fim da cascata apagaria justamente os alvos que a
 * animação de saída precisa encontrar.
 */
export function revealRunsOnce(): boolean {
  return false
}

/**
 * Liga uma timeline pausada ao scroll, com entrada E saída nos dois sentidos.
 *
 * É o equivalente de `toggleActions: 'play reverse play reverse'` para os casos
 * em que a timeline não pode ser criada junto com o ScrollTrigger — tipicamente
 * porque ela é montada dentro de um callback, medindo o layout já assentado.
 *
 * Substitui o padrão `ScrollTrigger.create({ once: true, onEnter })`, que
 * espalhamos por dez seções: `once` roda a animação uma única vez na vida da
 * página, então quem descia, voltava e descia de novo encontrava a seção parada
 * no estado final, sem entrada e sem saída. Pior, quando o start era
 * recalculado (os trechos pinados da home inserem espaçadores de milhares de
 * pixels ao montar) a única chance podia ser gasta sem que o callback rodasse —
 * e a seção ficava presa invisível.
 */
export function bindSectionReveal(
  trigger: Element,
  build: () => gsap.core.Timeline,
  options: { start?: string; end?: string } = {},
): ScrollTrigger {
  const { start = 'top 85%', end = 'bottom 15%' } = options

  /* A timeline é construída sob demanda, na primeira entrada, e reaproveitada
     daí em diante: `play()` e `reverse()` na mesma instância, sem remontar nada
     a cada passagem de scroll. */
  let tl: gsap.core.Timeline | null = null
  const ensure = () => {
    if (!tl) tl = build().pause()
    return tl
  }

  return ScrollTrigger.create({
    trigger,
    start,
    end,
    onEnter: () => ensure().play(),
    onEnterBack: () => ensure().play(),
    onLeave: () => tl?.reverse(),
    onLeaveBack: () => tl?.reverse(),
    /* Se o start já ficou para trás quando os triggers foram remedidos, a
       entrada não pode se perder: a seção está em cena, então ela roda agora. */
    onRefresh: (self) => {
      if (self.isActive) ensure().play()
    },
  })
}
