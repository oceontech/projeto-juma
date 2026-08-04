'use client'

import { useEffect, useRef, useState } from 'react'
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

/** O corte aqui é 1024px (mesmo de `stillFullFrameProps`), não os 768px do
 *  `isMobile` do gsap.matchMedia deste componente — ver comentário longo
 *  em `stillFullFrameProps`. */
const isNarrowStage = () => typeof window !== 'undefined' && window.innerWidth < 1024

/* ── Ponte de geometria com a seção Aminosan — só aritmética, sem DOM ──────
   O vídeo termina num frame full-bleed (still) servido como imagem; o
   catálogo mostra o MESMO render recortado justo (frasco 1000×1000). As
   frações abaixo são o retângulo alpha da arte dentro de cada canvas —
   medidas uma vez sobre os PNGs/WEBPs (`ffmpeg ... alphaextract,bbox`), não
   mudam a menos que o asset mude. Uma versão anterior lia essas caixas com
   `getBoundingClientRect()` (measureBridge) — precisa, mas cara: três
   leituras de layout forçadas na hora exata do handoff competiam com o
   salto de scroll e as outras animações, e isso lia como tranco em aparelho
   real. Como o still preenche sempre o PALCO INTEIRO (`stillFullFrameProps`)
   e o palco vale a viewport quando pinado, e a caixa do frasco no catálogo é
   uma fração fixa dessa mesma viewport (ver `getCatalogBottleProps`), dá pra
   calcular a MESMA geometria só com `window.innerWidth/innerHeight` — zero
   leitura de DOM, zero reflow, mesmo resultado. */
const HANDOFF_ART = {
  /** /produtos/aminosan-catalogo.png (1777×1000, desktop) — frame final do vídeo */
  stillDesktop: { x: 0.3292, y: 0.344, w: 0.3455, h: 0.489 },
  /** /heritage/mobile/aminosan-catalogo-mobile.webp (1080×1920, mobile) */
  stillMobile: { x: 0.2046, y: 0.3948, w: 0.5907, h: 0.2682 },
  /** Qualquer /produtos/*.webp do carrossel — todos 1000×1000, mesmo recorte */
  bottle: { x: 0.055, y: 0.144, w: 0.891, h: 0.711 },
} as const

type ArtBox = { x: number; y: number; w: number; h: number }
type ArtRect = { cx: number; cy: number; h: number }

/** Centro e altura (px) de onde a arte de uma imagem cai dentro de uma caixa
 *  W×H ancorada em (left,top) — a mesma matemática do object-fit, só que a
 *  partir de números já conhecidos (nunca de `getBoundingClientRect`). */
function fitArtRect(natW: number, natH: number, boxW: number, boxH: number, boxLeft: number, boxTop: number, art: ArtBox, mode: 'cover' | 'contain'): ArtRect | null {
  if (!natW || !natH || boxW < 1 || boxH < 1) return null
  const fit = mode === 'cover' ? Math.max(boxW / natW, boxH / natH) : Math.min(boxW / natW, boxH / natH)
  const cw = natW * fit
  const ch = natH * fit
  const left = boxLeft + (boxW - cw) / 2
  const top = boxTop + (boxH - ch) / 2
  return { cx: left + (art.x + art.w / 2) * cw, cy: top + (art.y + art.h / 2) * ch, h: art.h * ch }
}

/** Transform (`scale`/`x`/`y`) que faz a arte do still cair exatamente sobre
 *  a arte do frasco em repouso do catálogo — para o still (que preenche o
 *  palco inteiro e escala a partir do PRÓPRIO centro) pousar sem nenhum
 *  ajuste manual quando o handoff troca de still para o frasco de verdade
 *  em repouso total (sem fade, sem crossfade — ver `runHandoffIn`). */
function computeStillHandoff(isMobile: boolean): { scale: number; x: number; y: number } | null {
  const W = window.innerWidth
  const H = window.innerHeight
  const stillNat = isMobile ? { w: 1080, h: 1920 } : { w: 1777, h: 1000 }
  const stillArt = isMobile ? HANDOFF_ART.stillMobile : HANDOFF_ART.stillDesktop
  const stillRect = fitArtRect(stillNat.w, stillNat.h, W, H, 0, 0, stillArt, 'cover')
  if (!stillRect || stillRect.h < 1) return null

  // Caixa do frasco 'center' no catálogo — espelha `getCatalogBottleProps`.
  let boxW: number, boxH: number, boxLeft: number, boxTop: number
  if (isMobile) {
    boxW = W
    boxH = H * 0.35
    boxLeft = 0
    boxTop = H * 0.34
  } else {
    boxH = H * 0.68
    boxW = boxH // frasco 1000×1000 (quadrado), largura auto = altura
    boxLeft = (W - boxW) / 2
    boxTop = H - H * 0.08 - boxH
  }
  const bottleRect = fitArtRect(1000, 1000, boxW, boxH, boxLeft, boxTop, HANDOFF_ART.bottle, 'contain')
  if (!bottleRect) return null

  const scale = bottleRect.h / stillRect.h
  // O still escala a partir do PRÓPRIO centro (preenche o palco inteiro).
  const originX = W / 2
  const originY = H / 2
  const scaledCx = originX + (stillRect.cx - originX) * scale
  const scaledCy = originY + (stillRect.cy - originY) * scale
  return { scale, x: bottleRect.cx - scaledCx, y: bottleRect.cy - scaledCy }
}

/** Geometria do still idêntica ao frame final do vídeo do Aminosan.
 *  O breakpoint aqui é 1024px — o `max-lg:` das classes do trio na seção de
 *  cima —, e não o 767px do layout do catálogo: usar o do catálogo fazia
 *  telas de 768–1023px abrirem a transição num tamanho que o vídeo nunca
 *  mostrou, e o corte aparecia logo no primeiro frame. */
function stillFullFrameProps(): gsap.TweenVars {
  // A caixa 22dvh/60dvh/1.45 valia para o still 1777×1000 (composição 16:9 com
  // muita margem branca) encolhido no formato retrato do celular. O still
  // mobile novo (1080×1920) já nasce em pé — é `object-cover` full-bleed, sem
  // caixa nem escala, igual ao vídeo que ele substitui.
  return { left: 0, top: 0, width: '100%', height: isNarrowStage() ? '100dvh' : '100%', scale: 1, x: 0, y: 0, filter: 'blur(0px)' }
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
    /* Frascos laterais desfocados de propósito (pedido explícito) — a 0.78
       de escala (subiu de 0.34) eles são grandes o bastante pra um blur raso
       se notar e ajudar a profundidade. Isso tem um custo real: a troca de
       produto anima QUATRO frascos ao mesmo tempo, e um `filter: blur`
       animado força reprocessar o blur a cada frame enquanto o valor muda,
       dentro de uma seção pinada (o scroll inteiro depende desse frame sair
       no prazo) — por isso o valor é raso (3px, não os 5/11px do desktop) e
       `hidden` (invisível, opacity:0) continua em blur(0px): desfocar algo
       que não se vê é custo puro, sem ganho visual. `blur(0px)` em vez de
       remover a propriedade nos outros papéis: todos os caminhos que
       escrevem estes frascos precisam declarar o mesmo conjunto de props,
       senão um frasco fica preso com o blur escrito por outro caminho. */
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
          x: '-18vw',
          yPercent: 0,
          scale: 0.78 * mod,
          filter: 'blur(3px)',
          opacity: 0.35,
          zIndex: 10,
          transformOrigin: 'center center',
        }
      case 'right':
        return {
          left: '50%',
          xPercent: -50,
          x: '18vw',
          yPercent: 0,
          scale: 0.78 * mod,
          filter: 'blur(3px)',
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
    ? { top: '34%', bottom: 'auto', width: '100%', height: '35%', y: 0 }
    : { top: 'auto', bottom: '8vh', width: 'auto', height: '68vh', y: -20 }
  return {
    ...box,
    ...props,
    autoAlpha: props.opacity ?? 1,
  }
}

export function HomeProductShowcase() {
  const t = useTranslations('homeProductShowcase')

  /* Compartilhado entre o efeito de `scheduleRefresh` abaixo e o `useGSAP`
     principal (que marca true/false em volta de cada passo) — ver comentário
     em `scheduleRefresh` sobre por que um `ScrollTrigger.refresh()` não pode
     rodar em cima de uma transição em andamento. */
  const catalogBusyRef = useRef(false)

  // Mesmo corte de 1024px do `isNarrowStage()`/`stillFullFrameProps` — decide
  // qual still de handoff (retrato mobile x paisagem desktop) o <Image> carrega.
  const [narrowStill, setNarrowStill] = useState(false)
  useEffect(() => {
    const update = () => setNarrowStill(window.innerWidth < 1024)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const timeouts: number[] = []
    const rafs: number[] = []

    let pendingRaf = 0
    /* Rodar `ScrollTrigger.refresh()` com o pin do catálogo ATIVO (usuário no
       meio de um passo entre produtos) recalcula o spacer/posição do pin
       tocando o layout medido — e como o próprio gatilho mais comum daqui é
       uma imagem de frasco (lazy) terminando de carregar EXATAMENTE durante o
       swipe pra ela, o refresh cai bem no meio da transição. Se o resultado
       mudar por um pixel, o scroll (ainda em voo pro próximo produto) é
       corrigido pra bater com a nova medição — daí o "pulo pra cima/baixo
       antes de trocar de produto" reportado. `catalogBusyRef` (setado pelo
       useGSAP principal em volta de cada passo) faz este refresh esperar a
       transição atual terminar em vez de rodar em cima dela. */
    const runRefresh = () => {
      pendingRaf = 0
      if (catalogBusyRef.current) {
        pendingRaf = window.requestAnimationFrame(runRefresh)
        return
      }
      ScrollTrigger.refresh()
    }
    const scheduleRefresh = () => {
      if (pendingRaf) return
      pendingRaf = window.requestAnimationFrame(runRefresh)
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
  const bgNextRef = useRef<HTMLDivElement>(null)
  const bottlesRef = useRef<(HTMLDivElement | null)[]>([])
  const dotsRef = useRef<(HTMLButtonElement | null)[]>([])
  const spotlightRef = useRef<SVGSVGElement>(null)
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

          // Cores iniciais. `--pcs-accent-bg` é a cópia que o gradiente de
          // fundo (`.pcs-bg`/`.pcs-bg-next`) lê — ver comentário em
          // `applyIndex` sobre por que ele não pode ler o `--pcs-accent` ao
          // vivo (o mesmo que os rings/textos usam, esse sim animado suave).
          root.style.setProperty('--pcs-base', PRODUCTS[startIndex].base)
          root.style.setProperty('--pcs-mid', PRODUCTS[startIndex].mid)
          root.style.setProperty('--pcs-accent', PRODUCTS[startIndex].accent)
          root.style.setProperty('--pcs-accent-bg', PRODUCTS[startIndex].accent)

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
          /** Um passo por gesto de toque — ver `stepFromTouch`. */
          let steppedThisGesture = false
          let transitionUnlockTimer: ReturnType<typeof setTimeout> | null = null
          /* Rede de segurança da trava: o `onComplete` de uma timeline morta
             nunca roda, e alguns caminhos (saída para cima, handoff) trocam a
             timeline no meio do passo. Sem um teto, a trava ficava presa e o
             catálogo congelava — a roda continuava cancelada e nenhum produto
             trocava mais. */
          let stepLockWatchdog: ReturnType<typeof setTimeout> | null = null
          /** Arrasto (px) necessário pra contar como troca de produto. Era 18;
           *  12 deixa o gesto mais sensível sem pegar toque parado/tremida —
           *  os limiares de gesto de sistema ficam na casa dos 8–10px. */
          const STEP_THRESHOLD = 12

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
            catalogBusyRef.current = false
          }
          /** Trava os passos e agenda a liberação de emergência. */
          const holdStepLock = (maxMs = 2200) => {
            clearStepLockTimers()
            stopEntryHold()
            isTransitioning = true
            stepLocked = true
            catalogBusyRef.current = true
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
                if (stepLockWatchdog) clearTimeout(stepLockWatchdog)
                stepLockWatchdog = null
                releaseStepLock()
              },
            })
            transitionTl = tl

            /* Destrava os passos assim que o MOVIMENTO principal termina, não
               quando a timeline inteira acaba. A timeline vai até ~0,9s (a
               cauda é só texto assentando) e antes ficava travada esse tempo
               todo + 140ms de buffer — ou seja, ~1s sem aceitar o próximo
               gesto. Era isso o "comando pouco sensível": o segundo swipe
               caía no vazio. Encadear é seguro porque um passo novo já mata a
               timeline anterior (`transitionTl?.kill()`) e todos os tweens
               são `overwrite: 'auto'`; os painéis que ficarem pelo caminho
               são zerados pelo `products.forEach` do passo seguinte. */
            tl.call(releaseStepLock, undefined, 0.2)

            /* Fundo: crossfade de opacidade entre `.pcs-bg` (cor atual, parada)
               e `.pcs-bg-next` (cor do PRÓXIMO produto, já escrita sem
               transição antes do fade começar) — não mais um `tl.to` direto
               em `--pcs-base`/`--pcs-mid`. Interpolar essas vars forçava o
               navegador a recalcular o gradiente radial de TELA INTEIRA a
               cada frame por 0,8s, numa seção onde já rodam 4 frascos +
               texto + spotlight ao mesmo tempo — o maior custo de repaint
               isolado da troca de produto. Opacity é compositor puro: o
               custo de repintar o gradiente vira um evento ÚNICO (o
               `gsap.set`/`tl.set` abaixo), não um por frame.
               `--pcs-accent-bg` (não `--pcs-accent`) é o que os dois
               gradientes leem: `--pcs-accent` continua animado suave logo
               abaixo pros consumidores pequenos (rings, textos), mas se
               `.pcs-bg`/`.pcs-bg-next` lessem essa MESMA var ao vivo, o
               fundo inteiro voltaria a repintar a cada frame por causa dela
               — só que agora por 0,35s em vez de 0,8s. */
            gsap.set(root, {
              '--pcs-base-next': next.base,
              '--pcs-mid-next': next.mid,
              '--pcs-accent-next': next.accent,
            })
            tl.to(bgNextRef.current, { opacity: 1, duration: 0.62, ease: 'power2.inOut' }, 0)
            tl.set(
              root,
              { '--pcs-base': next.base, '--pcs-mid': next.mid, '--pcs-accent-bg': next.accent },
              0.62,
            )
            tl.set(bgNextRef.current, { opacity: 0 }, 0.62)
            tl.to(
              root,
              {
                '--pcs-accent': next.accent,
                duration: 0.35,
                ease: 'power2.out',
              },
              0,
            )

            // Spotlight: dim rápido, volta devagar — só desktop (mobile é estático)
            tl.to(spotlightRef.current, { opacity: 0.2, duration: 0.15, ease: 'power2.in' }, 0)
              .to(spotlightRef.current, { opacity: 0.5, duration: 0.35, ease: 'power2.out' }, 0.35)

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
              // `filter` sai do tween e vai num `.set()` à parte: interpolar
              // um blur (reprocessar o raio a cada frame) é caro, e aqui
              // rodam até 4 ao mesmo tempo. O papel (centro/lado/oculto) já
              // decide o valor final — só precisa ser aplicado uma vez, não
              // suavizado quadro a quadro. Aplicado no INÍCIO: quem perde o
              // centro desfoca já saindo, quem chega já entra nítido.
              const { filter, ...animatedProps } = getCatalogBottleProps(i, index, isMobile)
              tl.set(bottle, { filter }, 0)
              tl.to(
                bottle,
                {
                  ...animatedProps,
                  duration: isMotion ? 0.48 : 0.34,
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
                { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power3.out' },
                0.18,
              )
                .fromTo(
                  nextParts.cta,
                  { autoAlpha: 0, y: 12 },
                  { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power3.out' },
                  0.26,
                )
                .fromTo(
                  nextParts.stats,
                  { autoAlpha: 0, x: -45 * dir },
                  { autoAlpha: 1, x: 0, stagger: 0.04, duration: 0.45, ease: 'power3.out' },
                  0.18,
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

          /* entryHolding: mesmo problema do outroHolding acima, borda oposta.
             Reentrar por baixo (subindo da Cultures) no último produto pode
             chegar com a inércia do flick ainda correndo (sem Lenis no
             mobile, nada além de JS segura essa rolagem) — um `scrollTo`
             disparado uma vez só perde a corrida contra ela por um ou dois
             frames, e é isso que aparece como "pula pro lugar errado e volta
             rápido". Enquanto a flag está ligada um rAF reafirma a posição a
             cada frame; ver uso em `onEnterBack` do pin mais abaixo. */
          let entryHolding = false
          let entryRaf = 0
          let entryHoldTimer: ReturnType<typeof setTimeout> | null = null
          const stopEntryHold = () => {
            entryHolding = false
            if (entryRaf) cancelAnimationFrame(entryRaf)
            entryRaf = 0
            if (entryHoldTimer) clearTimeout(entryHoldTimer)
            entryHoldTimer = null
          }

          /* Estado visual pleno do produto atual — usado quando a seção é
             alcançada sem o handoff (âncora do menu, reload no meio da página)
             depois de ter ficado branca por uma saída para cima. */
          const restoreVisual = () => {
            const i = currentIndexRef.current
            gsap.set(root, {
              '--pcs-base': PRODUCTS[i].base,
              '--pcs-mid': PRODUCTS[i].mid,
              '--pcs-accent': PRODUCTS[i].accent,
              '--pcs-accent-bg': PRODUCTS[i].accent,
            })
            gsap.to(spotlightRef.current, { opacity: 0.5, duration: 0.4, overwrite: 'auto' })
            bottles.forEach((b, bi) => gsap.set(b, getCatalogBottleProps(bi, i, isMobile)))
            gsap.set(handoffStillRef.current, { autoAlpha: 0 })
            const p = parts(products[i])
            gsap.set([p.text, p.cta, ...p.stats], { autoAlpha: 1, x: 0, y: 0 })
          }

          const prepareHandoffIn = () => {
            stopEntryHold()
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
              '--pcs-accent-bg': PRODUCTS[0].accent,
            })
            gsap.set(handoffStillRef.current, {
              ...stillFullFrameProps(),
              autoAlpha: 1,
              opacity: 1,
              zIndex: 30,
            })
            gsap.set([p0.text, p0.cta, ...p0.stats], { autoAlpha: 0 })
            gsap.set(spotlightRef.current, { opacity: 0 })
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
              window.dispatchEvent(new CustomEvent('nav:hide', { detail: { lock: true } }))
              // Rede de segurança: qualquer entrada por cima cancela um
              // "saindo pra cima" que tenha ficado pendente.
              leavingUp = false
              /* `isTransitioning`/`stepLocked`: o `onEnter` pode refirar sem o
                 usuário ter saído e voltado de verdade — o `scheduleRefresh`
                 (mais acima, ligado a `load` das imagens dos frascos) chama
                 `ScrollTrigger.refresh()` sempre que um frasco lazy termina de
                 carregar, e isso acontece bem NO MEIO de um swipe (é exatamente
                 quando o frasco do próximo produto aparece pela primeira vez).
                 O refresh recalcula start/end de TODOS os triggers da página; se
                 o resultado mudar por um pixel que seja, o scrollY (ainda em
                 voo, a caminho do próximo produto) pode ler como "saiu e voltou
                 a entrar" — e sem esta guarda o reset pra produto 0 cancelava o
                 passo que o usuário tinha acabado de dar, no meio do gesto.
                 `restoreVisual()` precisa da MESMA guarda: ela dá `gsap.set`
                 instantâneo (sem animação) nos 4 frascos e nos textos pro
                 estado de repouso do índice atual — se isso dispara em cima de
                 uma transição com essas MESMAS propriedades ainda em voo
                 (frasco a meio caminho, opacidade subindo), o `.set()` trava
                 tudo na posição final na hora, cortando a animação e lendo
                 como um pulo — mesmo sem o índice ter sido resetado. */
              if (!isTransitioning && !stepLocked) {
                if (currentIndexRef.current !== 0) applyIndex(0)
                if (!handingOff) restoreVisual()
              }
            },
            onEnterBack: () => {
              if (!insidePin()) return
              leavingDown = false
              lockLenis()
              window.dispatchEvent(new CustomEvent('nav:hide', { detail: { lock: true } }))
              // Mesma guarda do onEnter acima (índice E restoreVisual).
              if (isTransitioning || stepLocked) return
              if (currentIndexRef.current !== COUNT - 1) applyIndex(COUNT - 1)
              /* Reentrada por baixo (Cultures) pousa o scrollY perto de
                 `pinTrigger.end` — que não é mais o mesmo pixel de
                 `indexToY(COUNT-1)` desde o `PIN_EDGE_INSET` (o último
                 produto descansa 8px pra DENTRO da borda, pra não ficar no
                 limiar de ligar/desligar o pin).
                 Isto precisa rodar SEMPRE que reentra por baixo — inclusive
                 quando o índice JÁ estava em COUNT-1 (usuário nunca saiu do
                 último produto, só espiou a Cultures e voltou: o caso mais
                 comum, já que é a primeira vez que dá pra ver a seção
                 seguinte). Antes esta correção ficava presa dentro do `if`
                 de troca de índice ali em cima — nesse caso mais comum o
                 índice não muda, o bloco inteiro era pulado e nada corrigia
                 o desvio, o que lia como "não pina direito" bem no Revigo
                 Phos Amino (o último produto, onde essa reentrada acontece).
                 No mobile não existe Lenis (scroll nativo puro, ver
                 `SmoothScroll.tsx`) — um `scrollTo` isolado pode não vencer a
                 inércia do flick que trouxe o usuário de volta (o browser
                 ainda anima por cima dele por mais um frame ou dois), e é
                 isso que aparece como "pula pro lugar errado e volta rápido".
                 Por isso a correção não é mais um tiro único: um `rAF`
                 (mesmo padrão do `outroHolding` acima) reafirma o `scrollTo`
                 por uma janela curta até a inércia morrer, cancelado assim
                 que um toque novo chega (`onTouchStart` abaixo) pra nunca
                 disputar um gesto real do usuário. */
              if (isMobile) {
                const safeY = indexToY(COUNT - 1)
                if (Math.abs(window.scrollY - safeY) > 1) {
                  window.scrollTo(0, safeY)
                  ScrollTrigger.update()
                  stopEntryHold()
                  entryHolding = true
                  const holdEntry = () => {
                    if (!entryHolding) return
                    if (Math.abs(window.scrollY - safeY) > 1) window.scrollTo(0, safeY)
                    entryRaf = requestAnimationFrame(holdEntry)
                  }
                  entryRaf = requestAnimationFrame(holdEntry)
                  entryHoldTimer = setTimeout(stopEntryHold, 260)
                }
              }
            },
            onToggle: (self) => {
              if (self.isActive) {
                if (!insidePin()) return
                lockLenis()
                window.dispatchEvent(new CustomEvent('nav:hide', { detail: { lock: true } }))
                return
              }
              // Saiu do pin numa rolagem normal: devolve o scroll ao Lenis.
              // Nas saídas dirigidas (handoff para a seção de cima) quem manda
              // na posição passa a ser a outra seção — religar aqui devolveria
              // a inércia do gesto bem no meio do vídeo reverso. `entryHolding`
              // entra na mesma lista: o rAF de reentrada (ver `onEnterBack`)
              // pode cruzar a borda do pin por um frame enquanto ainda está
              // vencendo a inércia — não é uma saída de verdade, então a
              // navbar não pode reaparecer nem o Lenis religar no meio disso.
              if (leavingUp || handingOff || outroHolding || entryHolding) return
              leavingDown = false
              unlockLenis()
              // O catálogo não dirige mais o scroll: a navbar volta a decidir
              // sozinha (sem forçar estado — descendo ela segue escondida).
              window.dispatchEvent(new CustomEvent('nav:unlock'))
            },
          })
          pinBox.current = pinTrigger

          /* ── Navegação programática (dots, teclado, pular) ──────── */

          /* Os EXTREMOS (primeiro e último produto) não descansam no pixel
             exato do `start`/`end` do pin — ficam `PIN_EDGE_INSET` px pra
             dentro. Parar cravado na borda deixa o pin no limiar de
             ligar/desligar, e ali ele fica DESLIGADO (medido: `.pcs-root` em
             `position: relative` em vez de `fixed`, tanto ao chegar no
             produto 1 quanto ao parar no produto 4). Desligado, o `.pcs-root`
             volta pro fluxo normal dentro do `pin-spacer` e o conteúdo
             escorrega junto com o scroll — como o fundo dele é opaco e ocupa
             a tela toda, não aparece a seção vizinha, só o conteúdo "pulando"
             (pra cima saindo do produto 1, pra baixo voltando do 4). Dentro
             da faixa do pin o elemento é `position: fixed`, então esses px
             não deslocam NADA na tela: o ajuste é invisível.
             8px (> os 4px de tolerância do `settle`) pra que o próprio settle
             corrija uma chegada que tenha pousado em cima da borda. */
          const PIN_EDGE_INSET = 8
          const indexToY = (i: number) => {
            const raw = pinTrigger.start + ((pinTrigger.end - pinTrigger.start) * i) / (COUNT - 1)
            if (i <= 0) return raw + PIN_EDGE_INSET
            if (i >= COUNT - 1) return raw - PIN_EDGE_INSET
            return raw
          }

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
             aparecem gradualmente enquanto o auto-scroll assenta no pin. O
             still (frame congelado do vídeo) cobre a tela e faz um crossfade
             simples com o frasco de verdade já no lugar de repouso — ver
             comentário logo abaixo sobre por que não é mais um tween de
             tamanho/posição casado por medição de layout. */
          const runHandoffIn = () => {
            stopEntryHold()
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
              '--pcs-accent-bg': PRODUCTS[0].accent,
            })
            gsap.set([p0.text, p0.cta, ...p0.stats], { autoAlpha: 0 })
            gsap.set(spotlightRef.current, { opacity: 0 })
            // Durante o handoff o frame 16:9 cobre o produto 0; depois o teatro assume.
            products.forEach((el, i) => {
              if (i === 0) return
              const p = parts(el)
              gsap.set([p.text, p.cta, ...p.stats], { autoAlpha: 0 })
            })

            /* Sem fade em nenhum momento: o still (frame congelado do vídeo)
               fica em opacidade 1 do início ao fim — só ESCALA e POSIÇÃO
               mudam (encolhe até o tamanho real do frasco no catálogo),
               revelando o catálogo (cor, texto, os outros frascos) ao redor.
               É a mesma imagem "continuando ali", como pedido — nenhum
               crossfade. `computeStillHandoff` calcula o transform exato só
               com aritmética (sem medir o DOM), então o frasco real do
               carrossel (`bottles[0]`, asset diferente — recorte justo, não
               o still cheio) entra DEPOIS, em repouso total (`onComplete`,
               nada mais se movendo), caindo exatamente por cima: troca de
               conteúdo parada e no mesmo lugar não tem janela "certa" pra
               perder, porque não há movimento nem tamanho pra competir. */
            const catalogCenter = getCatalogBottleProps(0, 0, isMobile)
            const handoffTransform = computeStillHandoff(isMobile)
            bottles.forEach((bottle, i) => {
              gsap.set(bottle, {
                ...getCatalogBottleProps(i, 0, isMobile),
                autoAlpha: 0,
                opacity: 0,
              })
            })
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
                gsap.set(handoffStillRef.current, { autoAlpha: 0, opacity: 0, zIndex: 3 })
                handingOff = false
                /* Sai da borda exata do pin (ver `PIN_EDGE_INSET`): a chegada
                   do vídeo pousa em `pinTrigger.start` cravado, e ali o pin
                   fica DESLIGADO (medido: `.pcs-root` em `position: relative`).
                   O `settle` não resolve sozinho — ele só roda em evento de
                   scroll, e depois do handoff não acontece nenhum até o
                   usuário encostar na tela, que é justamente o gesto que sai
                   torto. Como o pin (re)assume aqui, esses px não movem nada
                   na tela. */
                const safeY = indexToY(0)
                if (Math.abs(window.scrollY - safeY) > 1) {
                  lenisRef.current?.scrollTo(safeY, { immediate: true, force: true })
                  window.scrollTo(0, safeY)
                  ScrollTrigger.update()
                }
              },
            })
            transitionTl = tl

            if (handoffTransform) {
              tl.to(handoffStillRef.current, { ...handoffTransform, duration: 0.6, ease: 'power2.out' }, 0)
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
            stopEntryHold()
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
            // Simétrico à entrada: o frasco do catálogo apaga no lugar
            // enquanto o still (frame final do vídeo) assume por cima, e só
            // então a página salta INSTANTANEAMENTE para o stage do Aminosan,
            // que toca o clipe em reverso. O wheel/tecla no produto 0 já vêm
            // com preventDefault (pin ativo), então a página fica parada
            // durante o preparo.
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

            // Simétrico à entrada (ver comentário em `runHandoffIn`): troca
            // parada — o frasco real do carrossel some e o still nasce já no
            // transform exato de repouso (mesmo `computeStillHandoff`), os
            // dois sem nenhuma animação em andamento — e só então ele CRESCE
            // de volta pro tamanho do vídeo, sempre em opacidade 1, sem
            // nenhum fade.
            const handoffTransform = computeStillHandoff(isMobile)
            gsap.set(bottles[0], { autoAlpha: 0, opacity: 0 })
            gsap.set(handoffStillRef.current, {
              ...stillFullFrameProps(),
              ...(handoffTransform ?? {}),
              autoAlpha: 1,
              opacity: 1,
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
              spotlightRef.current,
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
            // O still cresce de volta pro tamanho cheio (sem fade) — só
            // então a página salta para a seção de cima (ver `onComplete`
            // acima).
            tl.to(handoffStillRef.current, { scale: 1, x: 0, y: 0, duration: 0.58, ease: 'power2.inOut' }, 0)
          }

          // Snap ao parar de rolar (detecção própria de inatividade — o
          // 'scrollEnd' do ScrollTrigger não é confiável com o Lenis no meio):
          // — dentro do pin: assenta no produto mais próximo;
          // — nas bordas (seção parcialmente visível): completa o movimento na
          //   direção do gesto, para nunca descansar com faixa da seção vizinha.
          const settle = () => {
            // Durante um handoff ou durante a transição animada de um produto,
            // o scroll é dirigido pela timeline; não pode assentar no meio.
            // `entryHolding`: o rAF de reentrada já está segurando a posição
            // exata (ver `onEnterBack`) — deixar o settle correr por cima
            // dele é uma segunda fonte de `scrollTo` competindo pelo mesmo
            // pixel, e a diferença de timing entre os dois é o tipo de coisa
            // que produz um tranco visível.
            if (leavingUp || handingOff || aminosanVideoHandoff || isTransitioning || stepLocked || entryHolding)
              return
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
            /* Último produto no mobile, com o dedo já solto um tico ALÉM da
               borda do pin: recolhe de volta pro lugar de repouso. É o que
               antes era feito com `preventDefault` no meio do gesto (e prendia
               o usuário na tela do produto 4 — ver `atLastMobile`); aqui só
               acontece DEPOIS que o scroll parou, então nunca disputa nada
               com o usuário. A faixa é curta de propósito: passou disso, a
               intenção foi mesmo sair pra próxima seção e ninguém puxa de
               volta. */
            if (
              isMobile &&
              currentIndexRef.current === COUNT - 1 &&
              scroll > pinTrigger.end &&
              scroll < pinTrigger.end + 70
            ) {
              scrollToY(indexToY(COUNT - 1), 0.4)
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
                goToIndex(current + 1, 0.48)
              } else {
                skipRef.current?.()
                transitionUnlockTimer = setTimeout(releaseStepLock, 700)
              }
            } else if (current > 0) {
              goToIndex(current - 1, 0.48)
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
            /* `pinTrigger.isActive` sozinho falha bem no instante de chegar
               vindo do handoff do vídeo: o salto de scroll pousa o scrollY
               DENTRO da faixa do pin, mas o ScrollTrigger ainda não rodou o
               ciclo que atualiza esse flag — e o primeiro gesto do usuário
               (chegar e já continuar rolando) caía neste `if`, sem achar
               "isCatalogPeeking" nem "isTopHandoffZone" (nenhum dos dois
               cobre "já estou dentro, só que o flag não sabe ainda"), e sem
               `preventDefault` a rolagem nativa da página seguia o dedo por
               aquele gesto — a sensação de "parte do catálogo sobe junto
               com o dedo". `insidePin()` confere a posição real (mesmo
               remédio já usado no onEnter do pin, ver comentário lá). */
            if (!pinTrigger.isActive && !insidePin()) {
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
            // Toque novo é o usuário retomando o controle — o hold de
            // reentrada (ver `onEnterBack`) não pode competir com o dedo.
            stopEntryHold()
            if (e.touches.length > 0) touchStartY = e.touches[0].clientY
            steppedThisGesture = false
          }
          /* UM gesto = UM produto. É esta guarda (e não a duração da trava)
             que impede um arrasto só de atravessar vários produtos — o que
             deixa a trava livre pra ser bem curta e o próximo swipe responder
             na hora. Sem ela, encurtar a trava fazia um arrasto lento avançar
             2 de uma vez: o dedo continua na tela, acumula o limiar de novo e
             dispara outro passo. */
          const stepFromTouch = (dir: 1 | -1) => {
            if (steppedThisGesture) return
            const before = currentIndexRef.current
            stepCatalog(dir)
            if (currentIndexRef.current !== before || leavingUp || handingOff) {
              steppedThisGesture = true
            }
          }

          const onTouchMoveStep = (e: TouchEvent) => {
            if (aminosanVideoHandoff || outroHolding) {
              if (e.cancelable) e.preventDefault()
              return
            }
            if (e.touches.length === 0) return
            const delta = touchStartY - e.touches[0].clientY
            // Mesmo remédio do onWheelStep: `insidePin()` cobre o instante em
            // que o scrollY já está dentro da faixa do pin (chegando do
            // handoff do vídeo) mas `isActive` ainda não foi atualizado.
            if (!pinTrigger.isActive && !insidePin()) {
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
              if (Math.abs(delta) < STEP_THRESHOLD) return
              if (delta > 0) {
                /* Pra FRENTE no último produto: nunca dar `preventDefault`.
                   Um `preventDefault` num touchmove não cancela só aquele
                   evento — o navegador (iOS em especial) decide logo no começo
                   do gesto se ele é rolagem, e um preventDefault ali mata a
                   rolagem pro RESTO do toque. Era isso que prendia o usuário
                   na tela do último produto: o gesto era descartado inteiro e
                   só um novo toque tinha chance de sair. O overscroll que essa
                   guarda tentava evitar agora é resolvido depois do gesto, no
                   `settle` (que puxa de volta se o dedo parou coladinho na
                   borda do pin) — sem nunca disputar o gesto com o usuário. */
                touchStartY = e.touches[0].clientY
                return
              }
              if (e.cancelable) e.preventDefault()
              stepFromTouch(-1)
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
            if (Math.abs(delta) < STEP_THRESHOLD) return
            stepFromTouch(delta > 0 ? 1 : -1)
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
            catalogBusyRef.current = false
            // Nunca deixar o Lenis parado atrás de nós (troca de breakpoint,
            // navegação): o resto da página ficaria sem scroll.
            unlockLenis()
            stopOutroHold()
            stopEntryHold()
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
      {/* Fundo — `.pcs-bg` é o gradiente do produto ATUAL (estático entre
          trocas); `.pcs-bg-next` é uma cópia que nasce em opacity:0 e só
          entra em cena na troca de produto, com as cores do PRÓXIMO produto
          já escritas sem transição. Trocar de produto passa a animar só
          `opacity` (puro compositor) em vez de interpolar `--pcs-base`/
          `--pcs-mid` direto — que forçava recalcular o gradiente radial de
          tela inteira a cada frame por ~0,8s a cada troca (ver `applyIndex`). */}
      <div ref={bgRef} className="pcs-bg" aria-hidden>
        <div ref={bgNextRef} className="pcs-bg-next" />
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
        {/* Mobile spotlight — feixe de cima para o produto, sempre ligado
            (sem animação de opacidade via JS: menos código, sem risco de
            piscar). Opacidade fixa no CSS, ver .pcs-spotlight-mobile. */}
        <div aria-hidden className="pcs-spotlight-mobile block lg:hidden" />

        <div className="pcs-stage">
          {/* Still de ponte entre o vídeo branco e o catálogo — mesmo asset (e
              mesmo `object-fit: cover` full-bleed) que a seção Aminosan usa no
              breakpoint correspondente, para a ponte começar exatamente no
              frame em que o vídeo parou. Desktop: still 1777×1000 (paisagem,
              `/produtos/aminosan-catalogo.png`). Mobile (<1024px, `narrowStill`):
              still 1080×1920 (retrato nativo). Handoff sem fade (ver
              `runHandoffIn`): o still só muda de escala/posição (cálculo
              analítico, `computeStillHandoff`) até cair sobre o frasco real,
              que só aparece depois, em repouso. `priority` força o
              carregamento adiantado — sem ela, o Next só busca a imagem
              quando ela entra perto do viewport, e como esta seção fica
              abaixo da dobra o tempo todo, o handoff podia chegar antes da
              imagem estar decodificada (um branco/pop-in de um frame, fácil
              de confundir com o tranco de performance que já resolvemos). */}
          <Image
            ref={handoffStillRef as any}
            src={narrowStill ? '/heritage/mobile/aminosan-catalogo-mobile.webp' : '/produtos/aminosan-catalogo.png'}
            alt=""
            aria-hidden="true"
            draggable={false}
            priority
            width={narrowStill ? 1080 : 1777}
            height={narrowStill ? 1920 : 1000}
            sizes="100vw"
            className="pointer-events-none absolute inset-0 z-[3] h-full w-full object-cover opacity-0"
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
