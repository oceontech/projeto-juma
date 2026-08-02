'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import {
  Leaf,
  Atom,
  Sprout,
  ChevronDown,
  ArrowRight,
  Award,
  Bug,
  Zap,
  ShieldCheck,
  Waypoints,
  Repeat,
  Activity,
  Flower2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { useLenis } from '@/features/animation/SmoothScroll'
import { Spotlight } from '@/components/ui/Spotlight'
import { useTranslations } from 'next-intl'

/* â”€â”€ Tipos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

type StatIcon =
  | 'leaf'
  | 'molecule'
  | 'sprout'
  | 'award'
  | 'bug'
  | 'energy'
  | 'shield'
  | 'roots'
  | 'recovery'
  | 'metabolism'
  | 'bloom'

/** Benefício do produto. O texto (título + apoio) vem do i18n pelo índice;
 *  aqui fica só o ícone. Antes isto era um número de ganho por saca, trocado
 *  por benefício a pedido do cliente. */
type Stat = {
  icon: StatIcon
}

type ProductEntry = {
  name: string
  line: string
  description: string
  stats: Stat[]
  /** Cor escura de fundo (base) — radial gradient borda */
  base: string
  /** Cor escura de fundo (mid) — radial gradient centro */
  mid: string
  /** Cor de destaque (accent) — anéis, divider, ícone */
  accent: string
  /** Tamanhos disponíveis (tags), ex: ['1L', '10L', '20L'] */
  sizes: string[]
  href: string
  /** Imagem do frasco (sem fundo) servida de /public */
  image: string
}

/* ── Ícones dos stats ──────────────────────────────────────────── */

const STAT_ICONS: Record<StatIcon, LucideIcon> = {
  leaf: Leaf,
  molecule: Atom,
  sprout: Sprout,
  award: Award,
  bug: Bug,
  energy: Zap,
  shield: ShieldCheck,
  roots: Waypoints,
  recovery: Repeat,
  metabolism: Activity,
  bloom: Flower2,
}

/* ── Produtos do catálogo da home ─ 4 itens ───────────── */
/* Texto (nome/linha/descrição/stats) vem das mensagens i18n por índice;
   este array dá cores, valores dos stats, href e a imagem do frasco. */

const PRODUCTS: ProductEntry[] = [
  {
    name: 'AMINOSAN',
    line: 'LINHA REDUTAN',
    description: 'Há mais de 40 anos o melhor aminoácido do mercado!',
    stats: [{ icon: 'recovery' }, { icon: 'leaf' }, { icon: 'bloom' }],
    base: '#07133a',
    mid: '#030817',
    accent: '#7fd0f2',
    sizes: ['1L', '10L', '20L'],
    href: '/produtos/aminosan',
    // Recorte justo 1000×1000, igual aos outros três — o frame do vídeo
    // (aminosan-catalogo.png, 1777×1000) fica só na ponte de transição.
    image: '/produtos/aminosan.webp',
  },
  {
    name: 'ACORDA ULTRA',
    line: 'LINHA REDUTAN',
    description: 'O melhor no Tratamento de Sementes! Maior Germinação e Maior Vigor.',
    stats: [{ icon: 'sprout' }, { icon: 'roots' }, { icon: 'shield' }],
    base: '#052538',
    mid: '#031018',
    accent: '#2c96c8',
    sizes: ['1L', '10L'],
    href: '/produtos/acorda-ultra',
    image: '/produtos/acorda-ultra.webp',
  },
  {
    name: 'KMEP ULTRA',
    line: 'LINHA JUMA',
    description:
      'Potencializador de Inseticidas atua como agente desalojante, forçando pragas ocultas a saírem do abrigo aumentando o contato com os inseticidas.',
    stats: [{ icon: 'bug' }, { icon: 'molecule' }, { icon: 'award' }],
    base: '#141414',
    mid: '#080808',
    accent: '#f0463a',
    sizes: ['10L', '20L'],
    href: '/produtos/kmep-ultra',
    image: '/produtos/kmep-ultra.webp',
  },
  {
    name: 'REVIGOPHOS AMINO',
    line: 'LINHA JUMA',
    description: 'A Energia do Fósforo com a tecnologia dos aminoácidos!',
    stats: [{ icon: 'energy' }, { icon: 'metabolism' }, { icon: 'recovery' }],
    base: '#062418',
    mid: '#020d08',
    accent: '#f2c94c',
    sizes: ['10L', '20L'],
    href: '/produtos/revigophos-amino',
    image: '/produtos/revigophos-amino.webp',
  },
]

const COUNT = PRODUCTS.length

/* ── Ponte de geometria com a seção Aminosan ───────────────────────────
   O vídeo de transição termina num frame 16:9 servido como imagem
   (`aminosan-catalogo.png`, 1777×1000: o trio pequeno no meio de muita
   margem vazia) e o catálogo mostra o MESMO render recortado justo
   (`aminosan-destaque.png`, 1000×1000). As frações abaixo são o retângulo
   alpha da arte dentro de cada canvas — sem elas não há como sobrepor os
   dois, porque as caixas têm proporções diferentes e a arte nunca cai no
   mesmo lugar. Medidas sobre o alpha dos PNGs; refazer se o asset mudar. */
const HANDOFF_ART = {
  /** /produtos/aminosan-catalogo.png — frame final do vídeo */
  still: { x: 0.3292, y: 0.344, w: 0.3455, h: 0.489 },
  /** /produtos/aminosan-destaque.png — frasco do catálogo */
  bottle: { x: 0.055, y: 0.144, w: 0.891, h: 0.711 },
} as const

type ArtBox = { x: number; y: number; w: number; h: number }

/** Centro e altura (px de viewport) onde a ARTE de um <img> aparece de fato.
 *  Resolve o object-fit e já vem com os transforms aplicados, então serve
 *  para alinhar dois elementos de caixas completamente diferentes. */
function artRect(img: HTMLImageElement | null, art: ArtBox) {
  if (!img) return null
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  const box = img.getBoundingClientRect()
  if (!nw || !nh || !box.width || !box.height) return null
  const cover = getComputedStyle(img).objectFit === 'cover'
  const fit = cover
    ? Math.max(box.width / nw, box.height / nh)
    : Math.min(box.width / nw, box.height / nh)
  const cw = nw * fit
  const ch = nh * fit
  const left = box.left + (box.width - cw) / 2
  const top = box.top + (box.height - ch) / 2
  return {
    cx: left + (art.x + art.w / 2) * cw,
    cy: top + (art.y + art.h / 2) * ch,
    h: art.h * ch,
  }
}

/** Geometria do still idêntica ao frame final do vídeo do Aminosan.
 *  O breakpoint aqui é 1024px — o `max-lg:` das classes do trio na seção de
 *  cima —, e não o 767px do layout do catálogo: usar o do catálogo fazia
 *  telas de 768–1023px abrirem a transição num tamanho que o vídeo nunca
 *  mostrou, e o corte aparecia logo no primeiro frame. */
function stillFullFrameProps(): gsap.TweenVars {
  const narrow = window.innerWidth < 1024
  return {
    left: 0,
    top: narrow ? '22dvh' : 0,
    width: '100%',
    height: narrow ? '60dvh' : '100%',
    scale: narrow ? 1.45 : 1,
    x: 0,
    y: 0,
    filter: 'blur(0px)',
  }
}

/* ── Carrossel de frascos — funções de posição ────────────────── */

type Role = 'center' | 'left' | 'right' | 'hidden'

function getRole(i: number, active: number): Role {
  const d = (i - active + COUNT) % COUNT
  if (d === 0) return 'center'
  if (d === 1) return 'right'
  if (d === COUNT - 1) return 'left'
  return 'hidden'
}

type RoleProps = {
  left?: string
  x?: number | string
  xPercent?: number
  yPercent?: number
  y?: number | string
  scale?: number
  filter?: string
  opacity?: number
  autoAlpha?: number
  zIndex?: number
  transformOrigin?: string
  top?: string
  bottom?: string
  width?: string
  height?: string
}

function getRoleProps(role: Role, isMobile: boolean, index: number): RoleProps {
  const mod = 1
  if (isMobile) {
    /* Profundidade no mobile fica por conta de escala + opacidade, sem blur.
       Os frascos laterais entram a 0.34 de escala com 35% de opacidade e os
       ocultos a 0.28 com 0% — nesse tamanho, num painel de celular, 6px de blur
       não são perceptíveis. O que eles custam é caro: a troca de produto anima
       QUATRO frascos ao mesmo tempo, e um `filter: blur` animado força o
       navegador a repintar e re-desfocar cada imagem a cada frame, dentro de uma
       seção que está pinada (o scroll inteiro depende desse frame sair no prazo).
       `blur(0px)` em vez de remover a propriedade: todos os caminhos que
       escrevem estes frascos precisam declarar o mesmo conjunto de props, senão
       um frasco fica preso com o blur escrito por outro caminho. */
    switch (role) {
      case 'center':
        return {
          left: '50%',
          xPercent: -50,
          x: 0,
          yPercent: 0,
          scale: 1 * mod,
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
          transformOrigin: 'center center',
        }
      case 'left':
        return {
          left: '50%',
          xPercent: -50,
          x: '-30vw',
          yPercent: 0,
          scale: 0.34 * mod,
          filter: 'blur(0px)',
          opacity: 0.35,
          zIndex: 10,
          transformOrigin: 'center center',
        }
      case 'right':
        return {
          left: '50%',
          xPercent: -50,
          x: '30vw',
          yPercent: 0,
          scale: 0.34 * mod,
          filter: 'blur(0px)',
          opacity: 0.35,
          zIndex: 10,
          transformOrigin: 'center center',
        }
      case 'hidden':
        return {
          left: '50%',
          xPercent: -50,
          x: 0,
          yPercent: 0,
          scale: 0.28 * mod,
          filter: 'blur(0px)',
          opacity: 0,
          zIndex: 1,
          transformOrigin: 'center center',
        }
    }
  }
  switch (role) {
    case 'center':
      return {
        left: '50%',
        xPercent: -50,
        x: 0,
        yPercent: 0,
        scale: 1 * mod,
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
      }
    case 'left':
      return {
        left: '38%',
        xPercent: -50,
        x: 0,
        yPercent: -22,
        scale: 0.62 * mod,
        filter: 'blur(5px)',
        opacity: 0.6,
        zIndex: 10,
      }
    case 'right':
      return {
        left: '62%',
        xPercent: -50,
        x: 0,
        yPercent: -22,
        scale: 0.62,
        filter: 'blur(5px)',
        opacity: 0.6,
        zIndex: 10,
      }
    case 'hidden':
      return {
        left: '50%',
        xPercent: -50,
        x: 0,
        yPercent: -22,
        scale: 0.42,
        filter: 'blur(11px)',
        opacity: 0,
        zIndex: 1,
      }
  }
}

/* Todos os frascos usam a mesma caixa: os quatro assets são 1000×1000 com a
   arte recortada justa, então o tamanho na tela sai igual sem fator de
   correção por produto.
   No mobile a caixa é medida em % do PALCO (que vale a altura visível da tela),
   não em vh — `vh` no mobile é a viewport GRANDE e não encolhe quando a barra
   de endereço aparece, então o frasco descia por cima dos stats. Estes valores
   espelham o `.pcs-theater-bottle` do bloco `@media (max-width: 767px)` em
   globals.css; como o inline vence a folha, quem manda de fato é este objeto.
   `top`/`bottom` vêm declarados nos dois ramos porque o matchMedia re-executa
   ao trocar de breakpoint e o gsap.set só limpa o que ele mesmo escreve. */
function getCatalogBottleProps(index: number, active: number, isMobile: boolean): RoleProps {
  const props = getRoleProps(getRole(index, active), isMobile, index)
  const box: RoleProps = isMobile
    ? { top: '50%', bottom: 'auto', width: '100%', height: '26%', y: 0 }
    : { top: 'auto', bottom: '8vh', width: 'auto', height: '68vh', y: -20 }
  return {
    ...box,
    ...props,
    autoAlpha: props.opacity ?? 1,
  }
}

export function HomeProductShowcase() {
  const t = useTranslations('homeProductShowcase')

  useEffect(() => {
    const timeouts: number[] = []
    const rafs: number[] = []

    let pendingRaf = 0
    const scheduleRefresh = () => {
      if (pendingRaf) return
      pendingRaf = window.requestAnimationFrame(() => {
        pendingRaf = 0
        ScrollTrigger.refresh()
      })
    }

    scheduleRefresh()
    timeouts.push(window.setTimeout(scheduleRefresh, 300))
    document.fonts?.ready.then(scheduleRefresh).catch(() => {})

    const media = Array.from(
      document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
        '#sec-produtos img, #sec-produtos video',
      ),
    )
    media.forEach((el) => {
      el.addEventListener('load', scheduleRefresh)
      el.addEventListener('loadedmetadata', scheduleRefresh)
      el.addEventListener('loadeddata', scheduleRefresh)
    })

    // Só re-agenda refresh em resize de LARGURA (rotação, redimensionar janela).
    // No mobile, mudança de ALTURA sozinha é o navegador escondendo/mostrando a
    // barra de endereço enquanto o usuário rola — refazer o refresh nesse momento
    // recalcula o pin (start/end/spacer) no meio do gesto e é o que produz o
    // "salto"/barra vazia na seção pinada. `ScrollTrigger.config({ ignoreMobileResize:
    // true })` (features/animation/gsap.ts) já existe pra evitar isso, mas o listener
    // de resize aqui embaixo o contornava direto.
    let lastWidth = window.innerWidth
    const onResize = () => {
      const w = window.innerWidth
      if (w === lastWidth) return
      lastWidth = w
      scheduleRefresh()
    }

    window.addEventListener('load', scheduleRefresh)
    window.addEventListener('pageshow', scheduleRefresh)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('load', scheduleRefresh)
      window.removeEventListener('pageshow', scheduleRefresh)
      window.removeEventListener('resize', onResize)
      media.forEach((el) => {
        el.removeEventListener('load', scheduleRefresh)
        el.removeEventListener('loadedmetadata', scheduleRefresh)
        el.removeEventListener('loadeddata', scheduleRefresh)
      })
      timeouts.forEach(window.clearTimeout)
      rafs.forEach(window.cancelAnimationFrame)
    }
  }, [])
  const reduced = useReducedMotion()

  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis

  const rootRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const bottlesRef = useRef<(HTMLDivElement | null)[]>([])
  const dotsRef = useRef<(HTMLButtonElement | null)[]>([])
  const spotlightRef = useRef<SVGSVGElement>(null)
  const mobileSpotlightRef = useRef<SVGSVGElement>(null)
  const handoffStillRef = useRef<HTMLImageElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  const currentIndexRef = useRef(0)
  /** Handlers expostos ao JSX (dots e botão de pular), criados dentro do GSAP */
  const goToIndexRef = useRef<((i: number) => void) | null>(null)
  const skipRef = useRef<(() => void) | null>(null)

  useGSAP(
    () => {
      // `reduced` (state) ainda é `false` no primeiro layout effect — o
      // useReducedMotion só resolve no passive effect seguinte. Ler a media
      // query direto aqui evita montar o pin para quem pediu menos movimento:
      // o pin insere um `.pin-spacer` entre #sec-produtos e .pcs-root, e no
      // render seguinte o componente troca a árvore por <ShowcaseReduced />.
      // Sem esta guarda o React tenta remover .pcs-root do pai antigo e quebra
      // com NotFoundError ('removeChild' / node is not a child of this node).
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const root = rootRef.current
      const container = containerRef.current
      if (!root || !container) return

      const products = gsap.utils.toArray<HTMLElement>('.pcs-product', container)
      const bottles = bottlesRef.current.filter(Boolean) as HTMLDivElement[]
      const dots = dotsRef.current.filter(Boolean) as HTMLButtonElement[]

      let hintHidden = false
      const hideHint = () => {
        if (hintHidden || !hintRef.current) return
        hintHidden = true
        gsap.to(hintRef.current, { autoAlpha: 0, duration: 0.5 })
      }

      const parts = (el: HTMLElement) => ({
        text: el.querySelector('.pcs-panel-main'),
        cta: el.querySelector('.pcs-panel-cta'),
        stats: el.querySelectorAll('.pcs-stat-row'),
      })

      const mm = gsap.matchMedia()

      mm.add(
        {
          isMotion: '(prefers-reduced-motion: no-preference)',
          isReduced: '(prefers-reduced-motion: reduce)',
          // 767px casa com o breakpoint real do layout mobile em globals.css
          // (`@media (max-width: 767px) { .pcs-product, .pcs-theater-bottle... }`).
          // Usar 639px aqui deixava telas de 640–767px (tablets, celulares em
          // paisagem) com o CSS em layout mobile mas o posicionamento do frasco
          // (inline style, maior especificidade) calculado como desktop.
          isMobile: '(max-width: 767px)',
          isDesktop: '(min-width: 768px)',
        },
        (ctx) => {
          const { isMotion, isMobile } = ctx.conditions as {
            isMotion: boolean
            isReduced: boolean
            isMobile: boolean
            isDesktop: boolean
          }

          // Índice atual sobrevive a mudanças de breakpoint (o mm re-executa)
          const startIndex = Math.min(Math.max(currentIndexRef.current, 0), COUNT - 1)

          // Cores iniciais
          root.style.setProperty('--pcs-base', PRODUCTS[startIndex].base)
          root.style.setProperty('--pcs-mid', PRODUCTS[startIndex].mid)
          root.style.setProperty('--pcs-accent', PRODUCTS[startIndex].accent)

          // Estado inicial dos frascos (carrossel)
          bottles.forEach((bottle, i) => {
            gsap.set(bottle, getCatalogBottleProps(i, startIndex, isMobile))
          })
          gsap.set(handoffStillRef.current, { autoAlpha: 0, scale: 1, filter: 'blur(0px)' })

          // Spotlight: fade-in inicial — desktop
          gsap.set(spotlightRef.current, { opacity: 0 })
          gsap.to(spotlightRef.current, {
            opacity: 0.5,
            duration: 0.75,
            delay: 0.75,
            ease: 'power2.out',
          })
          // Spotlight: fade-in inicial — mobile
          gsap.set(mobileSpotlightRef.current, { opacity: 0 })
          gsap.to(mobileSpotlightRef.current, {
            opacity: 0.85,
            duration: 0.75,
            delay: 0.75,
            ease: 'power2.out',
          })

          // Visibilidade inicial dos painéis de texto
          products.forEach((el, i) => {
            const { text, cta, stats } = parts(el)
            gsap.set([text, cta, ...stats], { autoAlpha: i === startIndex ? 1 : 0, x: 0 })
            el.classList.toggle('is-active', i === startIndex)
          })

          // Dot ativo inicial
          dots.forEach((d, i) => d.classList.toggle('is-active', i === startIndex))

          /* ── Transição entre produtos ──────────────────────────────
             Com trava de transição (step lock): enquanto a timeline de um
             produto estiver animando, scrolls rápidos são retidos até a
             animação concluir, garantindo peso, responsividade e evitando
             atropelo de fases. */

          let transitionTl: gsap.core.Timeline | null = null
          let isTransitioning = false
          let stepLocked = false
          let touchStartY = 0
          let transitionUnlockTimer: ReturnType<typeof setTimeout> | null = null
          /* Rede de segurança da trava: o `onComplete` de uma timeline morta
             nunca roda, e alguns caminhos (saída para cima, handoff) trocam a
             timeline no meio do passo. Sem um teto, a trava ficava presa e o
             catálogo congelava — a roda continuava cancelada e nenhum produto
             trocava mais. */
          let stepLockWatchdog: ReturnType<typeof setTimeout> | null = null

          const clearStepLockTimers = () => {
            if (transitionUnlockTimer) clearTimeout(transitionUnlockTimer)
            if (stepLockWatchdog) clearTimeout(stepLockWatchdog)
            transitionUnlockTimer = null
            stepLockWatchdog = null
          }
          /** Libera a trava agora (passo concluído ou abandonado). */
          const releaseStepLock = () => {
            clearStepLockTimers()
            isTransitioning = false
            stepLocked = false
          }
          /** Trava os passos e agenda a liberação de emergência. */
          const holdStepLock = (maxMs = 2200) => {
            clearStepLockTimers()
            isTransitioning = true
            stepLocked = true
            stepLockWatchdog = setTimeout(releaseStepLock, maxMs)
          }

          /* ── Trava real do scroll enquanto o catálogo dirige ─────────────
             `preventDefault` no wheel cancela só a rolagem NATIVA. O Lenis lê
             o mesmo evento por conta própria e nem olha o `defaultPrevented`:
             soma o delta no `targetScroll` e continua animando a página. Era
             isso que fazia um gesto rápido atravessar a seção inteira sem
             tocar uma transição sequer — o step lock retinha os PASSOS, mas
             ninguém retinha o SCROLL, então a página saía pela borda do pin
             direto na seção vizinha.
             Parado, o próprio Lenis descarta os eventos de roda (e o `stop()`
             já faz `reset()`: mata a inércia acumulada no flick de entrada e
             reancora o alvo no scroll real). O `scrollTo(..., { force: true })`
             do `scrollToY` continua funcionando com ele parado, que é como as
             trocas de produto movem a página. Mesmo contrato do `lockScroll`
             da seção Aminosan. */
          let lenisOwned = false
          const lockLenis = () => {
            const l = lenisRef.current
            if (!l) return
            lenisOwned = true
            if (!l.isStopped) l.stop()
          }
          const unlockLenis = () => {
            const l = lenisRef.current
            if (!l || !lenisOwned) return
            lenisOwned = false
            if (l.isStopped) l.start()
          }
          /** Entrega o scroll a outra seção sem religar o Lenis por baixo dela. */
          const releaseLenisOwnership = () => {
            lenisOwned = false
          }

          const applyIndex = (index: number) => {
            const from = currentIndexRef.current
            if (index === from) return
            currentIndexRef.current = index
            hideHint()

            holdStepLock()

            const dir = index > from ? 1 : -1
            const next = PRODUCTS[index]

            transitionTl?.kill()

            const tl = gsap.timeline({
              defaults: { overwrite: 'auto' },
              onComplete: () => {
                // Pequeno buffer (140ms) após o encerramento da animação para
                // absorver a inércia do gesto e dar sensação de peso ("trava").
                if (stepLockWatchdog) clearTimeout(stepLockWatchdog)
                stepLockWatchdog = null
                transitionUnlockTimer = setTimeout(releaseStepLock, 140)
              },
            })
            transitionTl = tl

            // Fundo: anima as CSS vars direto (parte do valor atual, sem saltos)
            tl.to(
              root,
              {
                '--pcs-base': next.base,
                '--pcs-mid': next.mid,
                duration: 0.8,
                ease: 'power2.inOut',
              },
              0,
            )
            tl.to(
              root,
              {
                '--pcs-accent': next.accent,
                duration: 0.35,
                ease: 'power2.out',
              },
              0,
            )

            // Spotlight: dim rápido, volta devagar
            tl.to(spotlightRef.current, { opacity: 0.2, duration: 0.15, ease: 'power2.in' }, 0)
              .to(spotlightRef.current, { opacity: 0.5, duration: 0.35, ease: 'power2.out' }, 0.35)
              .to(
                mobileSpotlightRef.current,
                { opacity: 0.1, duration: 0.15, ease: 'power2.in' },
                0,
              )
              .to(
                mobileSpotlightRef.current,
                { opacity: 0.85, duration: 0.35, ease: 'power2.out' },
                0.35,
              )

            // Carrossel de frascos
            if (from === 0 && index !== 0) {
              gsap.set(bottles[0], {
                ...getCatalogBottleProps(0, from, isMobile),
                autoAlpha: 1,
                opacity: 1,
              })
              tl.set(handoffStillRef.current, { autoAlpha: 0, opacity: 0 }, 0)
            } else {
              tl.to(
                handoffStillRef.current,
                { autoAlpha: 0, duration: 0.22, ease: 'power1.out' },
                0,
              )
            }
            bottles.forEach((bottle, i) => {
              tl.to(
                bottle,
                {
                  ...getCatalogBottleProps(i, index, isMobile),
                  duration: isMotion ? 0.6 : 0.4,
                  ease: 'power2.inOut',
                },
                0,
              )
              // Zera o offset de mouse de quem sai do centro
              if (i !== index) {
                const wrap = bottle.querySelector('.pcs-bottle-wrap')
                if (wrap) tl.to(wrap, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' }, 0)
              }
            })

            // Painéis fora da troca ficam ocultos (scroll rápido pula índices)
            products.forEach((el, i) => {
              if (i === index || i === from) return
              const p = parts(el)
              tl.set([p.text, p.cta, ...p.stats], { autoAlpha: 0 }, 0)
            })

            const curParts = parts(products[from])
            const nextParts = parts(products[index])

            if (isMotion) {
              // Saída do painel atual (direção acompanha o scroll)
              tl.to(
                curParts.text,
                { autoAlpha: 0, x: -40 * dir, duration: 0.35, ease: 'power2.in' },
                0,
              )
                .to(curParts.cta, { autoAlpha: 0, y: 12, duration: 0.28, ease: 'power2.in' }, 0)
                .to(
                  curParts.stats,
                  { autoAlpha: 0, x: 40 * dir, stagger: 0.03, duration: 0.35, ease: 'power2.in' },
                  0,
                )

              // Entrada do próximo painel
              tl.fromTo(
                nextParts.text,
                { autoAlpha: 0, x: 45 * dir },
                { autoAlpha: 1, x: 0, duration: 0.55, ease: 'power3.out' },
                0.25,
              )
                .fromTo(
                  nextParts.cta,
                  { autoAlpha: 0, y: 12 },
                  { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' },
                  0.35,
                )
                .fromTo(
                  nextParts.stats,
                  { autoAlpha: 0, x: -45 * dir },
                  { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.55, ease: 'power3.out' },
                  0.25,
                )
            } else {
              // Reduced motion: crossfade simples
              tl.to(
                [curParts.text, curParts.cta, ...curParts.stats],
                { autoAlpha: 0, duration: 0.4 },
                0,
              )
              tl.fromTo(
                [nextParts.text, nextParts.cta, ...nextParts.stats],
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.4 },
                0.3,
              )
            }

            // Dot ativo (cor via var(--pcs-accent), transição no CSS)
            dots.forEach((d, i) => d.classList.toggle('is-active', i === index))
            products.forEach((el, i) => el.classList.toggle('is-active', i === index))
          }

          /* â”€â”€ Pin dirigido pelo scroll nativo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
             Sem Observer nem preventDefault: o scroll (Lenis/touch)
             segue livre e o progresso do pin decide qual produto está
             ativo. O usuário nunca fica preso — pode atravessar a
             seção na velocidade que quiser. */

          /* Flags do handoff com a seção Aminosan (vídeo de transição):
             handingOff evita que o onEnter "restaure" as cores no meio da
             entrada branco→cor; leavingUp evita disparo duplo da saída. */
          let handingOff = false
          let leavingUp = false
          /* Saída deliberada para baixo (último produto ou botão "pular"): o
             scroll está sendo levado para fora do pin de propósito, então
             ninguém pode reafirmar a trava do Lenis no caminho. */
          let leavingDown = false
          let aminosanVideoHandoff = false
          /* outroHolding: a saída para cima está no ar (fade branco de ~0,6s
             antes do salto para o Aminosan). No mobile não existe Lenis para
             segurar o scroll, então é a inércia do flick que continua correndo
             por cima da timeline — e era ela que levava a página para dentro da
             seção de cima antes da hora, fazendo o IntersectionObserver de lá
             rebobinar a cena para o ato 1. Enquanto a flag está ligada o gesto
             é cancelado e um rAF prende o scroll no topo do pin. */
          let outroHolding = false
          let outroRaf = 0

          /* Estado visual pleno do produto atual — usado quando a seção é
             alcançada sem o handoff (âncora do menu, reload no meio da página)
             depois de ter ficado branca por uma saída para cima. */
          const restoreVisual = () => {
            const i = currentIndexRef.current
            gsap.set(root, {
              '--pcs-base': PRODUCTS[i].base,
              '--pcs-mid': PRODUCTS[i].mid,
              '--pcs-accent': PRODUCTS[i].accent,
            })
            gsap.to(spotlightRef.current, { opacity: 0.5, duration: 0.4, overwrite: 'auto' })
            gsap.to(mobileSpotlightRef.current, { opacity: 0.85, duration: 0.4, overwrite: 'auto' })
            bottles.forEach((b, bi) => gsap.set(b, getCatalogBottleProps(bi, i, isMobile)))
            gsap.set(handoffStillRef.current, { autoAlpha: 0 })
            const p = parts(products[i])
            gsap.set([p.text, p.cta, ...p.stats], { autoAlpha: 1, x: 0, y: 0 })
          }

          /* ── Ponte com o frame final do vídeo ──────────────────────
             Mede onde a arte do trio cai no still (frame 16:9 full-bleed) e
             onde ela cai no frasco em repouso no catálogo (68vh contido), e
             devolve o transform que faz os dois coincidirem pixel a pixel.
             Medir em vez de chutar números é o que faz a transição fechar em
             qualquer viewport: as duas caixas têm proporção diferente, então
             uma escala fixa acerta numa tela e erra em todas as outras. */
          const measureBridge = () => {
            const catalogCenter = getCatalogBottleProps(0, 0, isMobile)
            const bottle = bottles[0]
            const still = handoffStillRef.current
            const fallback = { catalogCenter, start: null as RoleProps | null }
            if (!bottle || !still) return fallback

            const bottleImg = bottle.querySelector<HTMLImageElement>('.pcs-bottle')
            gsap.set(bottle, { ...catalogCenter, autoAlpha: 0, opacity: 0 })
            const rest = artRect(bottleImg, HANDOFF_ART.bottle)
            gsap.set(still, stillFullFrameProps())
            const frame = artRect(still, HANDOFF_ART.still)
            if (!rest || !frame || rest.h < 1) return fallback

            const baseX = typeof catalogCenter.x === 'number' ? catalogCenter.x : 0
            const baseY = typeof catalogCenter.y === 'number' ? catalogCenter.y : 0
            const scale = (catalogCenter.scale ?? 1) * (frame.h / rest.h)
            // Segunda medição: o transform-origin do frasco não é o centro da
            // caixa, então o resíduo de posição depois de escalar sai medido,
            // não previsto — é o que evita o pulinho no fim do dissolve.
            gsap.set(bottle, { scale })
            const probe = artRect(bottleImg, HANDOFF_ART.bottle)
            if (!probe) return fallback

            return {
              catalogCenter,
              start: {
                ...catalogCenter,
                scale,
                x: baseX + (frame.cx - probe.cx),
                y: baseY + (frame.cy - probe.cy),
              } as RoleProps,
            }
          }

          /** Só o transform — o resto da caixa é igual nas duas pontas. */
          const bridgeTransform = (props: RoleProps) => ({
            scale: props.scale ?? 1,
            x: typeof props.x === 'number' ? props.x : 0,
            y: typeof props.y === 'number' ? props.y : 0,
          })

          const prepareHandoffIn = () => {
            handingOff = true
            leavingUp = false
            leavingDown = false
            // Entrando de novo: a trava do passo anterior (inclusive a que
            // levou a página pra fora daqui) não pode sobreviver à volta.
            releaseStepLock()
            lockLenis()
            currentIndexRef.current = 0
            dots.forEach((d, i) => d.classList.toggle('is-active', i === 0))
            products.forEach((el, i) => el.classList.toggle('is-active', i === 0))
            const p0 = parts(products[0])
            gsap.set(root, {
              '--pcs-base': '#ffffff',
              '--pcs-mid': '#ffffff',
              '--pcs-accent': PRODUCTS[0].accent,
            })
            gsap.set(handoffStillRef.current, {
              ...stillFullFrameProps(),
              autoAlpha: 1,
              opacity: 1,
              zIndex: 30,
            })
            gsap.set([p0.text, p0.cta, ...p0.stats], { autoAlpha: 0 })
            gsap.set([spotlightRef.current, mobileSpotlightRef.current], { opacity: 0 })
            bottles.forEach((bottle, i) =>
              gsap.set(bottle, {
                ...getCatalogBottleProps(i, 0, isMobile),
                autoAlpha: 0,
                opacity: 0,
              }),
            )
          }
          window.addEventListener('aminosan:prepare-handoff-forward', prepareHandoffIn)
          const onAminosanVideoHandoffStart = () => {
            aminosanVideoHandoff = true
          }
          const onAminosanVideoHandoffEnd = () => {
            aminosanVideoHandoff = false
          }
          window.addEventListener('aminosan:video-handoff-start', onAminosanVideoHandoffStart)
          window.addEventListener('aminosan:video-handoff-end', onAminosanVideoHandoffEnd)
          /* O `isActive` e os callbacks do pin descrevem o que o ScrollTrigger
             ACHA da posição — e ele erra quando o scroll salta (handoff, âncora,
             refresh no meio de um salto). Antes de reagir como "entrei na
             seção", confere a posição real: fora da faixa do pin, o catálogo não
             mexe em estado nem em scroll.
             A caixa existe porque o onEnter pode disparar durante o próprio
             `ScrollTrigger.create` (página aberta já dentro da seção), quando a
             const `pinTrigger` ainda não foi atribuída. */
          const pinBox: { current: ScrollTrigger | null } = { current: null }
          const insidePin = () => {
            const t = pinBox.current
            if (!t) return false
            const y = window.scrollY
            return y >= t.start - 1 && y <= t.end + 1
          }

          const pinTrigger = ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: `+=${(COUNT - 1) * 100}%`,
            pin: true,
            pinSpacing: true,
            /* SEM `anticipatePin`. Ele adianta o pin com base na VELOCIDADE do
               scroll, e a saída para cima move a página em dois saltos
               programáticos gigantes (catálogo → topo do Aminosan → repouso da
               fase 'exit'). Essa velocidade fabricada fazia o ScrollTrigger
               ativar o pin ~1 viewport ANTES do start: o .pcs-root virava
               `position: fixed` cobrindo a tela inteira no meio da seção de
               cima (a "tela toda azul"), e o onEnter disparava em looping —
               zerando `leavingUp` e devolvendo a página ao catálogo. A seção
               nunca é alcançada em rolagem livre (a entrada é sempre o handoff
               ou o gesto cancelado do pin), então não há flicker a evitar. */
            onEnter: () => {
              if (!insidePin()) return
              leavingDown = false
              lockLenis()
              window.dispatchEvent(new CustomEvent('nav:hide'))
              // Rede de segurança: qualquer entrada por cima cancela um
              // "saindo pra cima" que tenha ficado pendente.
              leavingUp = false
              if (currentIndexRef.current !== 0) applyIndex(0)
              if (!handingOff) restoreVisual()
            },
            onEnterBack: () => {
              if (!insidePin()) return
              leavingDown = false
              lockLenis()
              window.dispatchEvent(new CustomEvent('nav:hide'))
              if (currentIndexRef.current !== COUNT - 1) applyIndex(COUNT - 1)
            },
            onToggle: (self) => {
              if (self.isActive) {
                if (!insidePin()) return
                lockLenis()
                window.dispatchEvent(new CustomEvent('nav:hide'))
                return
              }
              // Saiu do pin numa rolagem normal: devolve o scroll ao Lenis.
              // Nas saídas dirigidas (handoff para a seção de cima) quem manda
              // na posição passa a ser a outra seção — religar aqui devolveria
              // a inércia do gesto bem no meio do vídeo reverso.
              if (leavingUp || handingOff || outroHolding) return
              leavingDown = false
              unlockLenis()
            },
          })
          pinBox.current = pinTrigger

          /* ── Navegação programática (dots, teclado, pular) ──────── */

          const indexToY = (i: number) =>
            pinTrigger.start + ((pinTrigger.end - pinTrigger.start) * i) / (COUNT - 1)

          const isTopHandoffZone = () => {
            const scroll = window.scrollY
            return (
              currentIndexRef.current === 0 &&
              scroll <= pinTrigger.start + 24 &&
              scroll > pinTrigger.start - window.innerHeight * 0.9
            )
          }

          const scrollToY = (y: number, duration = 0.55) => {
            const l = lenisRef.current
            if (l) {
              // force: executa mesmo se outro bloco tiver chamado lenis.stop()
              // (a trava da seção Aminosan deixa o Lenis parado em alguns fluxos)
              l.scrollTo(y, { duration, force: true })
              return
            }
            // Fallback sem Lenis: tween manual (window.scrollTo smooth
            // seria engolido por qualquer outro controle de scroll)
            const proxy = { y: window.scrollY }
            gsap.to(proxy, {
              y,
              duration,
              ease: 'power2.out',
              overwrite: true,
              onUpdate: () => window.scrollTo(0, proxy.y),
            })
          }

          const goToIndex = (i: number, duration = 0.55) => {
            if (i < 0 || i >= COUNT) return
            hideHint()
            if (i !== currentIndexRef.current) applyIndex(i)
            scrollToY(indexToY(i), duration)
          }
          goToIndexRef.current = goToIndex

          skipRef.current = () => {
            hideHint()
            window.dispatchEvent(new CustomEvent('nav:show'))
            // Solta o Lenis ANTES de sair: o `start()` dele faz `reset()`, que
            // mata qualquer tween em voo. Se a soltura viesse depois (no
            // onToggle do pin, ao cruzar a borda), ela matava justamente este
            // scroll de saída no meio do caminho.
            leavingDown = true
            unlockLenis()
            scrollToY(pinTrigger.end + 2, 0.65)
          }

          /* ── Handoff vindo da seção Aminosan ───────────────────────
             O vídeo de transição termina no trio Aminosan sobre fundo
             branco; o catálogo entra branco e a cor + textos do produto 0
             aparecem gradualmente enquanto o auto-scroll assenta no pin.
             O frasco de verdade já entra em cena sobreposto ao frame do
             vídeo e faz o caminho até o repouso do catálogo num tween só —
             não existe mais troca de elemento no meio (era ela que dava o
             salto de tamanho e a queda de nitidez). */
          const runHandoffIn = () => {
            handingOff = true
            leavingUp = false
            leavingDown = false
            releaseStepLock()
            lockLenis()
            hideHint()
            transitionTl?.kill()
            currentIndexRef.current = 0
            dots.forEach((d, i) => d.classList.toggle('is-active', i === 0))
            products.forEach((el, i) => el.classList.toggle('is-active', i === 0))
            const p0 = parts(products[0])

            // Estado inicial: fundo branco, imagem e painel ocultos; a entrada monta o catalogo gradualmente.
            gsap.set(root, {
              '--pcs-base': '#ffffff',
              '--pcs-mid': '#ffffff',
              '--pcs-accent': PRODUCTS[0].accent,
            })
            gsap.set([p0.text, p0.cta, ...p0.stats], { autoAlpha: 0 })
            gsap.set([spotlightRef.current, mobileSpotlightRef.current], { opacity: 0 })
            // Durante o handoff o frame 16:9 cobre o produto 0; depois o teatro assume.
            products.forEach((el, i) => {
              if (i === 0) return
              const p = parts(el)
              gsap.set([p.text, p.cta, ...p.stats], { autoAlpha: 0 })
            })

            // measureBridge deixa o still no frame do vídeo e devolve o
            // transform em que a arte do frasco 0 cai exatamente sobre ele.
            const { catalogCenter, start } = measureBridge()
            bottles.forEach((bottle, i) => {
              if (i === 0) return
              gsap.set(bottle, {
                ...getCatalogBottleProps(i, 0, isMobile),
                autoAlpha: 0,
                opacity: 0,
              })
            })
            gsap.set(bottles[0], { ...(start ?? catalogCenter), autoAlpha: 1, opacity: 1 })
            gsap.set(handoffStillRef.current, {
              ...stillFullFrameProps(),
              autoAlpha: 1,
              opacity: 1,
              zIndex: 30,
            })

            const tl = gsap.timeline({
              defaults: { overwrite: 'auto' },
              onComplete: () => {
                if (bottles[0]) gsap.set(bottles[0], { ...catalogCenter, autoAlpha: 1, opacity: 1 })
                gsap.set(handoffStillRef.current, {
                  ...stillFullFrameProps(),
                  autoAlpha: 0,
                  opacity: 0,
                  zIndex: 3,
                })
                handingOff = false
              },
            })
            transitionTl = tl

            // Dissolve curto entre o frame do vídeo (baixa resolução, é um
            // still 16:9) e o frasco em alta — como estão sobrepostos, a troca
            // não se vê; o que se percebe é a imagem ganhando nitidez.
            tl.to(handoffStillRef.current, { autoAlpha: 0, duration: 0.26, ease: 'power1.out' }, 0)
            tl.set(handoffStillRef.current, { zIndex: 3 }, 0.26)
            if (start) {
              tl.to(
                bottles[0],
                { ...bridgeTransform(catalogCenter), duration: 0.85, ease: 'power2.inOut' },
                0.06,
              )
            }
            bottles.forEach((bottle, i) => {
              if (i === 0) return
              tl.to(
                bottle,
                { ...getCatalogBottleProps(i, 0, isMobile), duration: 0.6, ease: 'power2.out' },
                0.18,
              )
            })
            tl.to(
              root,
              {
                '--pcs-base': PRODUCTS[0].base,
                '--pcs-mid': PRODUCTS[0].mid,
                duration: 0.95,
                ease: 'power2.inOut',
              },
              0,
            )
            tl.to(spotlightRef.current, { opacity: 0.5, duration: 0.85, ease: 'power2.out' }, 0.18)
            tl.to(
              mobileSpotlightRef.current,
              { opacity: 0.85, duration: 0.85, ease: 'power2.out' },
              0.18,
            )
            if (isMotion) {
              tl.fromTo(
                p0.text,
                { autoAlpha: 0, x: 45 },
                { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out' },
                0.32,
              )
                .fromTo(
                  p0.cta,
                  { autoAlpha: 0, y: 12 },
                  { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' },
                  0.46,
                )
                .fromTo(
                  p0.stats,
                  { autoAlpha: 0, x: -45 },
                  { autoAlpha: 1, x: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out' },
                  0.32,
                )
            } else {
              tl.to([p0.text, p0.cta, ...p0.stats], { autoAlpha: 1, duration: 0.4 }, 0.5)
            }
          }
          window.addEventListener('aminosan:handoff-forward', runHandoffIn)

          /* Saída para cima a partir do produto 0: o fundo volta a branco
             (o reverso do vídeo roda sobre branco na seção acima) e o scroll
             sobe até o stage do Aminosan — o ScrollTrigger de lá assume,
             trava o scroll e toca o clipe reverso trioâ†’linha. */
          const stopOutroHold = () => {
            outroHolding = false
            if (outroRaf) cancelAnimationFrame(outroRaf)
            outroRaf = 0
          }

          const runHandoffOut = () => {
            if (leavingUp) return
            hideHint()
            window.dispatchEvent(new CustomEvent('nav:show'))
            // Avisa a seção de cima ANTES de qualquer movimento: enquanto a
            // saída não completa, ela não pode rebobinar a cena se voltar a
            // aparecer na tela (inércia do flick no mobile).
            window.dispatchEvent(new CustomEvent('aminosan:prepare-handoff-backward'))
            transitionTl?.kill()
            clearTimeout(idleTimer)
            lockLenis()
            lenisRef.current?.scrollTo(pinTrigger.start, { immediate: true, force: true })
            window.scrollTo(0, pinTrigger.start)
            ScrollTrigger.update()
            leavingUp = true
            // Prende o scroll no topo do pin durante todo o fade de saída.
            // Sem isso a inércia do gesto (mobile) continua subindo e a página
            // entra na seção de cima com a cadeia de vídeos ainda parada.
            outroHolding = true
            const holdOutro = () => {
              if (!outroHolding) return
              if (Math.abs(window.scrollY - pinTrigger.start) > 1) {
                window.scrollTo(0, pinTrigger.start)
              }
              outroRaf = requestAnimationFrame(holdOutro)
            }
            outroRaf = requestAnimationFrame(holdOutro)
            const p0 = parts(products[0])
            // Simétrico à entrada: o próprio frasco do catálogo volta ao
            // tamanho e à posição do trio no frame final do vídeo (mesma
            // medição da entrada, só de trás pra frente), o still aparece por
            // cima já alinhado e só então a página salta INSTANTANEAMENTE
            // para o stage do Aminosan, que toca o clipe em reverso. O
            // wheel/tecla no produto 0 já vêm com preventDefault (pin ativo),
            // então a página fica parada durante o preparo.
            const tl = gsap.timeline({
              defaults: { overwrite: 'auto' },
              onComplete: () => {
                // Cancela qualquer assentamento pendente antes do salto.
                clearTimeout(idleTimer)
                // A trava do passo que pediu a saída morre aqui: quem entrar
                // de novo (handoff ou onEnter) precisa achar o catálogo livre.
                releaseStepLock()
                // O Lenis continua parado, mas a partir do salto quem manda
                // nele é a seção Aminosan (o lockScroll de lá religa no fim).
                releaseLenisOwnership()
                // Solta o scroll um instante antes de saltar — daqui pra frente
                // quem manda na posição é a seção Aminosan.
                stopOutroHold()
                // Alvo = topo REAL da seção Aminosan (não o pinStart estimado),
                // para o stage cair exatamente no topo da viewport.
                const amino = document.getElementById('sec-origem')
                const y = amino
                  ? Math.round(amino.getBoundingClientRect().top + window.scrollY)
                  : pinTrigger.start - window.innerHeight
                // Salto SÍNCRONO: aplica no DOM na hora (nativo) e alinha o alvo
                // do Lenis. Só então dispara o evento — assim, quando o Aminosan
                // travar logo abaixo, o stage já está no topo e o lockScroll não
                // precisa de tween de alinhamento (a rolagem residual que sobrava
                // vinha justamente de travar com o scrollY ainda no catálogo,
                // porque o immediate do Lenis só aplica no próximo tick).
                lenisRef.current?.scrollTo(y, { immediate: true, force: true })
                window.scrollTo(0, y)
                // leavingUp CONTINUA true: enquanto estivermos acima do catálogo
                // ele não pode mexer no scroll (settle desligado). Só volta a
                // false ao reentrar (runHandoffIn ou onEnter do pin).
                window.dispatchEvent(new CustomEvent('aminosan:handoff-backward'))
              },
            })
            transitionTl = tl

            const { catalogCenter, start } = measureBridge()
            gsap.set(bottles[0], { ...catalogCenter, autoAlpha: 1, opacity: 1 })
            gsap.set(handoffStillRef.current, {
              ...stillFullFrameProps(),
              autoAlpha: 0,
              opacity: 0,
              zIndex: 30,
            })

            tl.to(
              root,
              {
                '--pcs-base': '#ffffff',
                '--pcs-mid': '#ffffff',
                duration: 0.58,
                ease: 'power2.inOut',
              },
              0,
            )
            tl.to(
              [spotlightRef.current, mobileSpotlightRef.current],
              { opacity: 0, duration: 0.32, ease: 'power2.inOut' },
              0,
            )
            tl.to(
              [p0.text, p0.cta, ...p0.stats],
              { autoAlpha: 0, duration: 0.26, ease: 'power2.in' },
              0,
            )
            bottles.forEach((bottle, i) => {
              if (i === 0) return
              tl.to(bottle, { autoAlpha: 0, opacity: 0, duration: 0.28, ease: 'power2.in' }, 0)
            })
            if (start) {
              tl.to(
                bottles[0],
                { ...bridgeTransform(start), duration: 0.58, ease: 'power2.inOut' },
                0,
              )
            }
            // Só depois de alinhado o still assume — o salto para a seção de
            // cima acontece com o frame do vídeo já cobrindo a tela.
            tl.to(
              handoffStillRef.current,
              { autoAlpha: 1, duration: 0.26, ease: 'power1.in' },
              0.32,
            )
            tl.set(bottles[0], { autoAlpha: 0, opacity: 0 }, 0.58)
          }

          // Snap ao parar de rolar (detecção própria de inatividade — o
          // 'scrollEnd' do ScrollTrigger não é confiável com o Lenis no meio):
          // — dentro do pin: assenta no produto mais próximo;
          // — nas bordas (seção parcialmente visível): completa o movimento na
          //   direção do gesto, para nunca descansar com faixa da seção vizinha.
          const settle = () => {
            // Durante um handoff ou durante a transição animada de um produto,
            // o scroll é dirigido pela timeline; não pode assentar no meio.
            if (leavingUp || handingOff || aminosanVideoHandoff || isTransitioning || stepLocked) return
            const scroll = window.scrollY
            const vh = window.innerHeight

            // `isActive` sozinho não basta: ele pode estar ligado com a página
            // longe da seção (ver `insidePin`). Assentar nesse estado era o que
            // arrastava o usuário de volta pro catálogo no meio do vídeo reverso.
            if (pinTrigger.isActive && insidePin()) {
              // No mobile, a fronteira com a Cultures (último produto) fica de
              // fora do "cola no alvo": senão, ao subir vindo da Cultures, o
              // settle briga com o dedo e puxa a página de volta pra baixo.
              if (isMobile && currentIndexRef.current === COUNT - 1) return
              const target = indexToY(currentIndexRef.current)
              if (Math.abs(scroll - target) > 4) scrollToY(target, 0.55)
              return
            }
            // Zona de entrada (catálogo espiando por baixo da seção anterior)
            if (scroll < pinTrigger.start && scroll > pinTrigger.start - vh) {
              if (lastDir < 0 && currentIndexRef.current === 0) {
                runHandoffOut()
                return
              }
              scrollToY(lastDir > 0 ? pinTrigger.start : Math.max(0, pinTrigger.start - vh), 0.7)
              return
            }
            // Zona de saída (próxima seção espiando por baixo do catálogo)
            // No mobile o controle dessa transição fica só com o usuário —
            // sem completar o movimento sozinho.
            if (scroll > pinTrigger.end && scroll < pinTrigger.end + vh) {
              if (isMobile) return
              scrollToY(lastDir > 0 ? pinTrigger.end + 2 : pinTrigger.end, 0.6)
            }
          }

          const stepCatalog = (dir: 1 | -1) => {
            if (leavingUp || handingOff || aminosanVideoHandoff || isTransitioning || stepLocked) return
            holdStepLock()
            hideHint()

            const current = currentIndexRef.current
            if (dir > 0) {
              if (current < COUNT - 1) {
                goToIndex(current + 1, 0.6)
              } else {
                skipRef.current?.()
                transitionUnlockTimer = setTimeout(releaseStepLock, 700)
              }
            } else if (current > 0) {
              goToIndex(current - 1, 0.6)
            } else {
              runHandoffOut()
            }
          }

          const onWheelStep = (e: WheelEvent) => {
            if (aminosanVideoHandoff || outroHolding) {
              if (e.cancelable) e.preventDefault()
              return
            }
            if (Math.abs(e.deltaY) < 2) return
            if (!pinTrigger.isActive) {
              const scroll = window.scrollY
              const isCatalogPeeking =
                scroll < pinTrigger.start && scroll > pinTrigger.start - window.innerHeight
              if (e.deltaY > 0 && isCatalogPeeking) {
                if (e.cancelable) e.preventDefault()
                scrollToY(pinTrigger.start, 0.45)
                return
              }
              if (e.deltaY < 0 && isTopHandoffZone()) {
                if (e.cancelable) e.preventDefault()
                runHandoffOut()
              }
              return
            }
            // Pin ativo: o scroll é nosso. O preventDefault mata a rolagem
            // nativa e o lockLenis mata a do Lenis — as duas precisam cair,
            // senão o gesto continua correndo por cima da transição. A
            // exceção é a saída deliberada para a próxima seção, que já está
            // em voo e não pode ser interrompida.
            if (e.cancelable) e.preventDefault()
            if (!leavingDown) lockLenis()
            // Mesmo contrato da seção Aminosan: a cauda de inércia do
            // trackpad chega em deltas minúsculos e não conta como gesto —
            // sem este piso, um flick só atravessava vários produtos.
            if (Math.abs(e.deltaY) < 8) return
            stepCatalog(e.deltaY > 0 ? 1 : -1)
          }

          const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) touchStartY = e.touches[0].clientY
          }

          const onTouchMoveStep = (e: TouchEvent) => {
            if (aminosanVideoHandoff || outroHolding) {
              if (e.cancelable) e.preventDefault()
              return
            }
            if (e.touches.length === 0) return
            const delta = touchStartY - e.touches[0].clientY
            if (!pinTrigger.isActive) {
              if (Math.abs(delta) < 18) return
              const scroll = window.scrollY
              const isCatalogPeeking =
                scroll < pinTrigger.start && scroll > pinTrigger.start - window.innerHeight
              if (delta > 0 && isCatalogPeeking) {
                if (e.cancelable) e.preventDefault()
                scrollToY(pinTrigger.start, 0.45)
                touchStartY = e.touches[0].clientY
                return
              }
              if (delta < 0 && isTopHandoffZone()) {
                if (e.cancelable) e.preventDefault()
                runHandoffOut()
              }
              touchStartY = e.touches[0].clientY
              return
            }
            // No mobile, saindo do último produto pra frente, não força o
            // salto de uma viewport inteira (skip): deixa o próprio arrasto
            // do dedo levar o scroll pra Cultures, sem preventDefault. Aqui o
            // sentido precisa estar declarado antes de decidir, então este é o
            // único caso que ainda espera os 18px.
            const atLastMobile = isMobile && currentIndexRef.current === COUNT - 1
            if (atLastMobile) {
              if (Math.abs(delta) < 18) return
              if (delta > 0) {
                touchStartY = e.touches[0].clientY
                return
              }
              if (e.cancelable) e.preventDefault()
              stepCatalog(-1)
              touchStartY = e.touches[0].clientY
              return
            }
            // Pin ativo: cancela o gesto já no PRIMEIRO touchmove. Esperar os
            // 18px de limiar para só então dar preventDefault deixava o browser
            // começar a rolagem nativa nos primeiros pixels — e uma vez começada
            // ela não é mais cancelável, então um flick forte atravessava o pin
            // inteiro (era o salto do catálogo direto pro início do Aminosan,
            // sem passar pelos vídeos de transição).
            if (e.cancelable) e.preventDefault()
            if (Math.abs(delta) < 18) return
            stepCatalog(delta > 0 ? 1 : -1)
            touchStartY = e.touches[0].clientY
          }

          let lastY = window.scrollY
          let lastDir = 1
          let idleTimer: ReturnType<typeof setTimeout> | undefined
          const onScroll = () => {
            const y = window.scrollY
            if (y !== lastY) lastDir = y > lastY ? 1 : -1
            lastY = y
            // Rede de segurança da trava do Lenis: o onToggle do pin não
            // dispara quando a página chega aqui por salto programático ou por
            // um refresh no meio do gesto. Dentro da faixa do pin o scroll é
            // sempre nosso, então a trava é reafirmada a cada evento (barata:
            // `stop()` no Lenis já parado é no-op).
            if (pinTrigger.isActive && insidePin() && !leavingUp && !leavingDown && !outroHolding) {
              lockLenis()
            }
            clearTimeout(idleTimer)
            idleTimer = setTimeout(settle, 180)
          }
          window.addEventListener('scroll', onScroll, { passive: true })
          window.addEventListener('wheel', onWheelStep, { passive: false, capture: true })
          window.addEventListener('touchstart', onTouchStart, { passive: true })
          window.addEventListener('touchmove', onTouchMoveStep, { passive: false, capture: true })

          const settleTimers = [window.setTimeout(settle, 320), window.setTimeout(settle, 950)]

          // Movimento sutil com o mouse — só no frasco ATIVO (desktop).
          // O tween mira o wrap interno; o carrossel anima o elemento externo,
          // então os dois nunca brigam.
          let onPointerMove: ((e: PointerEvent) => void) | null = null
          if (isMotion && !isMobile) {
            onPointerMove = (e: PointerEvent) => {
              if (!pinTrigger.isActive) return
              const wrap = bottles[currentIndexRef.current]?.querySelector('.pcs-bottle-wrap')
              if (!wrap) return
              const nx = (e.clientX / window.innerWidth - 0.5) * 2
              const ny = (e.clientY / window.innerHeight - 0.5) * 2
              gsap.to(wrap, {
                x: nx * 16,
                y: ny * 10,
                duration: 0.6,
                ease: 'power2.out',
                overwrite: 'auto',
              })
            }
            window.addEventListener('pointermove', onPointerMove, { passive: true })
          }

          // Teclado
          const handleKeyDown = (e: KeyboardEvent) => {
            if (!pinTrigger.isActive) {
              if ((e.key === 'ArrowUp' || e.key === 'PageUp') && isTopHandoffZone()) {
                e.preventDefault()
                runHandoffOut()
              }
              return
            }
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
              e.preventDefault()
              stepCatalog(1)
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
              e.preventDefault()
              stepCatalog(-1)
            }
          }
          window.addEventListener('keydown', handleKeyDown)

          return () => {
            window.removeEventListener('aminosan:prepare-handoff-forward', prepareHandoffIn)
            window.removeEventListener('aminosan:video-handoff-start', onAminosanVideoHandoffStart)
            window.removeEventListener('aminosan:video-handoff-end', onAminosanVideoHandoffEnd)
            window.removeEventListener('aminosan:handoff-forward', runHandoffIn)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('wheel', onWheelStep, { capture: true })
            window.removeEventListener('touchstart', onTouchStart)
            window.removeEventListener('touchmove', onTouchMoveStep, { capture: true })
            if (onPointerMove) window.removeEventListener('pointermove', onPointerMove)
            settleTimers.forEach(window.clearTimeout)
            clearTimeout(idleTimer)
            clearStepLockTimers()
            // Nunca deixar o Lenis parado atrás de nós (troca de breakpoint,
            // navegação): o resto da página ficaria sem scroll.
            unlockLenis()
            stopOutroHold()
            transitionTl?.kill()
            pinTrigger.kill(true)
            goToIndexRef.current = null
            skipRef.current = null
          }
        },
      )

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  if (reduced) return <ShowcaseReduced t={t} />

  return (
    <div ref={rootRef} className="pcs-root">
      {/* Fundo animado (cores via CSS vars, animadas pelo GSAP) */}
      <div ref={bgRef} className="pcs-bg" aria-hidden>
        <div className="pcs-backlight" />
        <div className="pcs-ring pcs-ring-1" />
        <div className="pcs-ring pcs-ring-2" />
        <div className="pcs-ring pcs-ring-3" />
        <div className="pcs-grain" />
      </div>

      {/* Showcase */}
      <section ref={containerRef} className="pcs-showcase">
        {/* Desktop spotlight — canto superior direito, espelhado */}
        <Spotlight
          ref={spotlightRef}
          className="hidden lg:block -top-20 right-[-280px]"
          fill="white"
          stdDeviation={260}
          fillOpacity={0.6}
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* Mobile spotlight — feixe de cima para o produto */}
        <Spotlight
          ref={mobileSpotlightRef}
          className="block lg:hidden -top-40 right-0"
          fill="white"
          fillOpacity={0.45}
          stdDeviation={700}
          filterId="pcs-spotlight-mobile"
          translateX={2513}
          translateY={1997}
          style={{ transform: 'scaleX(-1)' }}
        />

        <div className="pcs-stage">
          {/* Still de ponte entre o vídeo branco e o catálogo — mesmo asset e
              mesmo `sizes` do trio na seção Aminosan (1777×1000), para o
              browser reaproveitar o arquivo já baixado lá e a ponte começar
              exatamente no frame em que o vídeo parou.
              O object-fit repete token por token o do trio lá
              (`STAGE_IMAGE_CLASS`): entre 768 e 1023px o `md:!object-cover`
              vence o `max-lg:!object-contain` (vem depois na folha, mesma
              especificidade), então usar só `object-cover max-lg:object-contain`
              deixava essa faixa começando com um recorte que o vídeo nunca
              mostrou. A ponte lê o object-fit computado, então acompanha. */}
          <Image
            ref={handoffStillRef as any}
            src="/produtos/aminosan-catalogo.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            width={1777}
            height={1000}
            sizes="100vw"
            className="pointer-events-none absolute inset-0 z-[3] h-full w-full max-lg:top-[22dvh] max-lg:h-[60dvh] object-cover md:!object-cover max-lg:!object-contain opacity-0"
          />

          {/* Teatro de frascos — todos os produtos posicionados, GSAP anima */}
          <div className="pcs-bottle-theater" aria-hidden>
            {PRODUCTS.map((product, i) => {
              const name = t(`products.${i}.name`)
              return (
                <div
                  key={name}
                  className="pcs-theater-bottle"
                  ref={(el) => {
                    bottlesRef.current[i] = el
                  }}
                >
                  <div className="pcs-bottle-wrap">
                    <Image
                      className="pcs-bottle"
                      src={product.image}
                      alt={name}
                      width={1000}
                      height={1000}
                      sizes="(min-width: 1024px) 45vw, (min-width: 768px) 60vw, 80vw"
                      quality={85}
                      draggable={false}
                      /* O Aminosan é o alvo do handoff: a ponte mede a imagem
                         para se alinhar ao frame do vídeo, então ela precisa
                         estar decodificada antes da transição — lazy deixava a
                         medição cair no fallback sem movimento. */
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Painéis de texto — sobrepostos no grid (3 cols: texto | frasco | stats) */}
          {PRODUCTS.map((product, i) => {
            const name = t(`products.${i}.name`)
            const description = t(`products.${i}.description`)
            return (
              <article key={name} className="pcs-product">
                {/* Coluna 1 — texto */}
                <div className="pcs-panel-text">
                  <div className="pcs-panel-main">
                    <div className="pcs-panel-brand" aria-hidden="true">
                      <Image
                        src="/brand/logo-juma-agro-branca.png"
                        alt=""
                        width={180}
                        height={50}
                        draggable={false}
                        className="h-full w-auto object-contain"
                      />
                    </div>
                    <h2 className={`pcs-panel-title pcs-panel-title-${i}`}>
                      {i === 1 ? (
                        <>
                          <span className="pcs-title-line">Acorda</span>{' '}
                          <span className="pcs-title-line">Ultra</span>
                        </>
                      ) : i === 3 ? (
                        <>
                          <span className="pcs-title-line">Revigo</span>
                          <span className="pcs-title-line">Phos</span>{' '}
                          <span className="pcs-title-line">Amino</span>
                        </>
                      ) : (
                        name
                      )}
                    </h2>
                    <div className="pcs-panel-divider" style={{ background: product.accent }} />
                    <p className="pcs-panel-copy">{description}</p>
                    <div className="pcs-panel-sizes">
                      <span className="pcs-sizes-label">{t('sizesLabel')}</span>
                      <div className="pcs-sizes-tags">
                        {product.sizes.map((size) => (
                          <span
                            key={size}
                            className="pcs-size-tag"
                            style={
                              {
                                '--stat-accent': product.accent,
                                borderColor: `${product.accent}66`,
                                color: product.accent,
                                boxShadow: `0 0 22px ${product.accent}40`,
                              } as CSSProperties
                            }
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href={product.href}
                  className="pcs-panel-cta"
                  style={
                    { '--product-accent': product.accent, color: product.accent } as CSSProperties
                  }
                >
                  <ArrowRight size={14} strokeWidth={2} aria-hidden />
                  {t('hintReduced')}
                </Link>

                {/* Coluna 3 — stats */}
                <div className="pcs-panel-stats">
                  {product.stats.map((stat, si) => {
                    const statTitle = t(`products.${i}.stats.${si}.title`)
                    const statLabel = t(`products.${i}.stats.${si}.label`)
                    const Icon = STAT_ICONS[stat.icon]
                    return (
                      <div
                        key={statTitle}
                        className="pcs-stat-row"
                        style={{ '--stat-accent': product.accent } as CSSProperties}
                      >
                        <div
                          className="pcs-stat-icon"
                          style={{
                            borderColor: `${product.accent}b3`,
                            boxShadow: `0 0 22px ${product.accent}40`,
                          }}
                        >
                          <Icon size={26} strokeWidth={1.75} />
                        </div>
                        <div className="pcs-stat-text">
                          <div className="pcs-stat-title">{statTitle}</div>
                          <div className="pcs-stat-label">{statLabel}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}

          <div className="pcs-featured-anchor" aria-hidden="true">
            <div className="pcs-featured-label">
              <span>Produtos em</span>
              <strong>destaque</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Navegação por produto (dots) */}
      <nav className="pcs-nav" aria-label={t('subtitle')}>
        {PRODUCTS.map((product, i) => (
          <button
            key={product.name}
            type="button"
            className={`pcs-dot${i === 0 ? ' is-active' : ''}`}
            aria-label={t(`products.${i}.name`)}
            onClick={() => goToIndexRef.current?.(i)}
            ref={(el) => {
              dotsRef.current[i] = el
            }}
          />
        ))}
      </nav>

      {/* Pular a seção sem passar por todos os produtos */}
      <button type="button" className="pcs-skip" onClick={() => skipRef.current?.()}>
        {t('skip')}
        <ChevronDown size={14} strokeWidth={2.5} aria-hidden />
      </button>

      {/* Dica de rolagem */}
      <div ref={hintRef} className="pcs-scroll-hint">
        <span>{t('hint')}</span>
        <span className="pcs-scroll-hint-line" />
      </div>
    </div>
  )
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Versão acessível (prefers-reduced-motion)
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function ShowcaseReduced({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-[100rem] min-[2000px]:max-w-[120rem] px-6 lg:px-8">
        <p className="mb-12 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {t('subtitle')}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRODUCTS.map((product, i) => {
            const name = t(`products.${i}.name`)
            const description = t(`products.${i}.description`)
            return (
              <Link
                key={name}
                href={product.href}
                className="group flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20"
              >
                <Image
                  src="/brand/logo-juma-agro-branca.png"
                  alt="Juma Agro"
                  width={140}
                  height={36}
                  draggable={false}
                  className="h-9 w-auto object-contain"
                />
                <h3 className="font-black text-lg uppercase text-white leading-tight">{name}</h3>
                <p className="text-sm text-white/60 leading-relaxed m-0 flex-1">{description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold"
                      style={{ borderColor: `${product.accent}66`, color: product.accent }}
                    >
                      {size}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-semibold" style={{ color: product.accent }}>
                  {t('hintReduced')} →
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
