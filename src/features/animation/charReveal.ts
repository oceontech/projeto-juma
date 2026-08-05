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
import { scrollDirection, setScrollDirection } from './device'

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
  /**
   * Aplica o estado escondido agora (inclui o desfoque do container).
   * `forceDir` — ver o mesmo parâmetro em `playIn`.
   */
  hide: (forceDir?: 1 | -1) => void
  /**
   * Encaixa a entrada numa timeline, na posição dada.
   * Anima o desfoque do container e a cascata das letras em paralelo.
   *
   * `forceDir`: direção conhecida de antemão, para quando o rastreador
   * global de scroll não é confiável no momento da chamada (interações sem
   * `scroll` nativo, como a jornada do hero). Sem isto, lê o rastreador
   * global.
   */
  playIn: (tl: gsap.core.Timeline, position?: gsap.Position, forceDir?: 1 | -1) => void
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

  /* ── O texto entra pelo lado de onde o usuário está vindo ──────────────
     Descendo, o conteúdo chega por baixo/pela direita — é de lá que ele vem, e
     o deslocamento inicial acompanha isso. SUBINDO, a seção reaparece pela
     borda de cima: manter o mesmo sentido faz o texto entrar contra o
     movimento do dedo, o que se lê como um solavanco.

     `ScrollTrigger.direction` vale 1 descendo e -1 subindo. O sinal do
     deslocamento segue essa direção, então a mesma animação serve aos dois
     caminhos sem nenhuma timeline extra. */
  const deslocamento = (dir: 1 | -1) => (dir === -1 ? -distance : distance)

  const hidden: gsap.TweenVars = { [axis]: () => deslocamento(scrollDirection()), [alphaKey]: 0 }

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
    /**
     * `forceDir` — quando quem chama já SABE o sentido real e o rastreador
     * global não é confiável ali (ver `playIn`).
     */
    hide: (forceDir?: 1 | -1) => {
      const dir = forceDir ?? scrollDirection()
      if (blurAtivo > 0) gsap.set(el, { filter: `blur(${blurAtivo}px)` })
      if (chars.length) gsap.set(chars, { [axis]: deslocamento(dir), [alphaKey]: 0 })
    },
    playIn: (tl, position = 0, forceDir?: 1 | -1) => {
      if (!chars.length) return

      /* O estado inicial COMPLETO é reescrito a cada execução — posição e
         opacidade, não só a posição.
         Sem a opacidade aqui, uma timeline reconstruída (o que acontece quando
         o sentido do scroll muda) encontrava os caracteres já visíveis e
         animava de 1 para 1: nenhuma entrada perceptível. Era o que deixava o
         título parado enquanto o resto da seção animava. E o deslocamento
         precisa ser recalculado porque depende do sentido no momento da
         entrada — um `fromTo` fixo congelaria a direção da primeira vez.

         `forceDir` serve a interações como a jornada do hero: o retorno ao
         repouso é conduzido só por JS (o gesto trava a página, sem
         `scroll` nativo nenhum), então o rastreador global nunca aprende o
         sentido daquele momento — e pior, ESCREVER nele para compensar
         vazava para o resto do site: o valor forçado ficava de pé até o
         próximo scroll real, e qualquer outro título que animasse nesse
         meio-tempo herdava o sentido errado, sem relação nenhuma com para
         onde ELE estava indo. Um parâmetro local resolve sem tocar em nada
         fora desta instância. */
      const dirNoSet = forceDir ?? scrollDirection()
      tl.set(chars, { [axis]: deslocamento(dirNoSet), [alphaKey]: 0 }, position)

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

      /* ── A cascata é criada no INSTANTE em que roda ────────────────────
         Não basta o atraso ser uma função: qualquer `stagger` — objeto ou
         função — é resolvido quando a TWEEN é construída, e a timeline de um
         reveal é construída uma vez e reproduzida muitas. Era por isso que a
         cascata invertida nunca aparecia: a ordem ficava congelada no sentido
         do primeiro encontro com a seção.

         Com `call`, quem é agendado na timeline é a CRIAÇÃO da tween. A cada
         execução ela nasce de novo e lê o sentido do scroll naquele momento:
         descendo corre do primeiro caractere para o último, a ordem natural da
         leitura; subindo, a seção reaparece pela borda de cima e é o FIM do
         texto que surge primeiro, então a cascata começa pela última palavra. */
      tl.call(
        () => {
          const dirNaCascata = forceDir ?? scrollDirection()
          const alvos = dirNaCascata === -1 ? [...chars].reverse() : chars
          gsap.to(alvos, {
            [axis]: 0,
            [alphaKey]: 1,
            duration,
            ease,
            stagger,
            overwrite: 'auto',
            /* A promessa de transformação vale só enquanto a cascata corre; ao
               fim, `clearProps` devolve a memória de vídeo dos caracteres. */
            willChange: 'transform, opacity',
            clearProps: 'willChange,transform',
            /* Terminou de entrar: os spans do split saem de cena e o texto
               volta a ser um nó só. Sem isto, cada título deixa dezenas de
               elementos no DOM pelo resto da visita. */
            onComplete: cleansUp ? revert : undefined,
          })
        },
        undefined,
        position,
      )
    },
    revert,
  }
}

/**
 * `toggleActions` padrão dos reveals de conteúdo: entra UMA vez, na primeira
 * vez que a seção aparece, e nunca mais é tocado.
 *
 * `play none none none` — só o `onEnter` faz algo, e só na primeira vez que
 * dispara: `play()` numa timeline já concluída não tem para onde avançar, é
 * um no-op. Sair da seção e voltar (nos dois sentidos) não reanima nada; o
 * conteúdo fica exatamente como o usuário deixou.
 *
 * Existiu uma versão anterior deste helper que reiniciava a entrada toda vez
 * que a seção voltava a aparecer (`restart none restart none`) — pedida para
 * dar uma cascata invertida ao subir a página. Na prática lia como a home
 * inteira reanimando toda hora: title da seção de matérias, de depoimentos,
 * cards de cultura, todos re-entrando a cada pequena ida-e-volta de scroll.
 * O pedido real era mais simples — texto anima uma vez, na primeira visita à
 * seção, do jeito que o site já fazia antes desse experimento.
 *
 * A saída/reentrada animada continua fazendo sentido onde o movimento CONTA
 * alguma coisa e tem mecânica própria fora deste helper: a jornada do hero,
 * os atos da Aminosan, a troca de produto no catálogo.
 */
export function revealToggleActions(): string {
  return 'play none none none'
}

/**
 * `true`: a entrada roda uma vez só, então os spans do `SplitText` podem ser
 * desfeitos assim que a cascata termina — o texto volta a ser um nó só, sem
 * ficar com dezenas de elementos extras no DOM pelo resto da visita.
 *
 * Quem precisa dos spans sobrevivendo (uma entrada/saída própria, reiniciada
 * pelo próprio componente — hero, Aminosan, Nossa História, CTA final) já
 * passa `autoRevert: false` para `createCharReveal` e ignora este valor.
 */
export function revealRunsOnce(): boolean {
  return true
}

/**
 * Liga uma timeline de entrada ao scroll, tocada uma única vez.
 *
 * Existe porque `ScrollTrigger.create({ once: true, onEnter })` sozinho tem um
 * furo: se o `start` for recalculado ANTES de disparar (os trechos pinados da
 * home inserem espaçadores de milhares de pixels ao montar), a única chance
 * do `once` pode ser gasta sem o callback rodar — a seção fica presa
 * invisível. O `onRefresh` abaixo cobre esse caso.
 *
 * "Uma vez" vale para os dois sentidos: se o primeiro encontro do usuário com
 * a seção for subindo a página (voltou por um link do menu, por exemplo), é
 * `onEnterBack` que dispara, na mesma regra de "só a primeira vez".
 */
export function bindSectionReveal(
  trigger: Element,
  /**
   * Monta a timeline de entrada. Recebe o sentido do scroll (`1` descendo,
   * `-1` subindo) para poder inverter a ORDEM dos blocos — o que nenhuma
   * geometria resolve sozinha: ao subir, a reentrada de um trigger é governada
   * pelo `end`, não pelo `start`, e a ordem em que os gatilhos disparam não
   * corresponde à ordem em que o olho vê o conteúdo chegar.
   */
  build: (direcao: 1 | -1) => gsap.core.Timeline,
  options: {
    start?: string
    end?: string
    /**
     * Elemento que define o FIM, quando ele não é o que dispara a entrada.
     *
     * Serve para blocos altos: a entrada pode ser medida pela seção inteira,
     * mas o `end` só importa aqui para a reentrada ao subir (`onEnterBack`) —
     * numa seção com três cards empilhados, medir pelo bloco inteiro faz a
     * reentrada demorar bem mais que medir só pelo cabeçalho.
     */
    endTrigger?: Element
  } = {},
): ScrollTrigger {
  const { start = 'top 85%', end = 'bottom top', endTrigger } = options

  let played = false
  const play = (dir: 1 | -1) => {
    if (played) return
    played = true
    /* Sincroniza o rastreador global com o sentido que o PRÓPRIO trigger
       acabou de medir — mais confiável que o listener de scroll genérico
       neste instante exato. `build(dir)` já recebe o valor certo por
       parâmetro, mas o reveal de caractere de dentro dele (título/parágrafo)
       lê o rastreador global por conta própria; sem este sync os dois podem
       discordar — bloco entrando na ordem certa com a cascata de dentro na
       ordem errada. */
    setScrollDirection(dir)
    build(dir).play()
  }

  return ScrollTrigger.create({
    trigger,
    start,
    end,
    ...(endTrigger ? { endTrigger } : {}),
    onEnter: (self) => play(self.direction === -1 ? -1 : 1),
    // Reentrada vindo de baixo: o sentido é sempre "subindo".
    onEnterBack: (self) => play(self.direction === 1 ? 1 : -1),
    /* Se o start já ficou para trás quando os triggers foram remedidos, a
       entrada não pode se perder: a seção está em cena, então ela roda agora. */
    onRefresh: (self) => {
      if (!played && self.isActive) play(1)
    },
  })
}

/**
 * Reveal de texto corrido — parágrafos, descrições, textos de apoio.
 *
 * Deliberadamente mais simples que o dos títulos: o bloco inteiro sobe e
 * aparece, sem quebrar em caracteres. Um título é um elemento gráfico e
 * suporta cascata; um parágrafo é para ler, e letra a letra ali só atrasa a
 * leitura e multiplica o custo por algumas centenas de caracteres.
 *
 * Como nos títulos, o sentido acompanha o scroll: descendo o texto sobe para
 * entrar; subindo, ele desce.
 */
export function createTextReveal(
  el: HTMLElement | null | undefined,
  options: { distance?: number; duration?: number; ease?: string } = {},
) {
  if (!el) return null
  const { distance = 18, duration = DUR.sub, ease = EASE.reveal } = options

  const deslocamento = () => (scrollDirection() === -1 ? -distance : distance)

  return {
    el,
    hide: () => gsap.set(el, { y: deslocamento(), opacity: 0 }),
    playIn: (tl: gsap.core.Timeline, position: gsap.Position = 0) => {
      // Estado inicial completo: ver o comentário equivalente em `createCharReveal`.
      tl.set(el, { y: deslocamento(), opacity: 0 }, position)
      tl.to(
        el,
        {
          y: 0,
          opacity: 1,
          duration,
          ease,
          willChange: 'transform, opacity',
          clearProps: 'willChange',
        },
        position,
      )
    },
  }
}
