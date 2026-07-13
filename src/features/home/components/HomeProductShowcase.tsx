'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Leaf, Atom, Sprout, ChevronDown, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { useLenis } from '@/features/animation/SmoothScroll'
import { Spotlight } from '@/components/ui/Spotlight'
import { useTranslations } from 'next-intl'

/* Ã¢â€â‚¬Ã¢â€â‚¬ Tipos Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */

type StatIcon = 'leaf' | 'molecule' | 'sprout'

type Stat = {
  icon: StatIcon
  value: string
  unit: string
  label: string
}

type ProductEntry = {
  name: string
  line: string
  description: string
  stats: Stat[]
  /** Cor escura de fundo (base) Ã¢â‚¬â€ radial gradient borda */
  base: string
  /** Cor escura de fundo (mid) Ã¢â‚¬â€ radial gradient centro */
  mid: string
  /** Cor de destaque (accent) Ã¢â‚¬â€ anÃƒÂ©is, divider, ÃƒÂ­cone */
  accent: string
  /** Tamanhos disponÃƒÂ­veis (tags), ex: ['1L', '10L', '20L'] */
  sizes: string[]
  href: string
  /** Imagem do frasco (sem fundo) servida de /public */
  image: string
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ ÃƒÂcones dos stats Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */

const STAT_ICONS: Record<StatIcon, LucideIcon> = {
  leaf: Leaf,
  molecule: Atom,
  sprout: Sprout,
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Produtos do catÃƒÂ¡logo da home Ã¢â€â‚¬ 4 itens Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
/* Texto (nome/linha/descriÃƒÂ§ÃƒÂ£o/stats) vem das mensagens i18n por ÃƒÂ­ndice;
   este array dÃƒÂ¡ cores, valores dos stats, href e a imagem do frasco. */

const PRODUCTS: ProductEntry[] = [
  {
    name: 'AMINOSAN',
    line: 'LINHA REDUTAN',
    description:
      'Bioativador organomineral ÃƒÂ  base de aminoÃƒÂ¡cidos livres. Acelera o metabolismo da planta e potencializa a absorÃƒÂ§ÃƒÂ£o de nutrientes em todas as fases.',
    stats: [
      { icon: 'leaf', value: '+14', unit: 'sc/ha', label: 'Acorda Cana' },
      { icon: 'molecule', value: '+20', unit: 'sc/ha', label: 'RevigoPhos Amino' },
      { icon: 'sprout', value: '+5', unit: 'sc/ha', label: 'Revigo + Milho e Pasto' },
    ],
    base: '#07133a',
    mid: '#030817',
    accent: '#7fd0f2',
    sizes: ['1L', '10L', '20L'],
    href: '/produtos/aminosan',
    image: '/produtos/aminosan-catalogo.png',
  },
  {
    name: 'ACORDA ULTRA',
    line: 'LINHA REDUTAN',
    description:
      'Bioestimulante para arranque de culturas anuais. Estimula o enraizamento profundo desde a germinaÃƒÂ§ÃƒÂ£o e aumenta o vigor inicial das plantas.',
    stats: [
      { icon: 'sprout', value: '+18', unit: 'sc/ha', label: 'Soja Arranque' },
      { icon: 'leaf', value: '+11', unit: 'sc/ha', label: 'Milho Vigor' },
      { icon: 'molecule', value: '+7', unit: 'sc/ha', label: 'FeijÃƒÂ£o Inicial' },
    ],
    base: '#052538',
    mid: '#031018',
    accent: '#2c96c8',
    sizes: ['1L', '10L'],
    href: '/produtos/acorda-ultra',
    image: '/produtos/acorda-ultra-destaque.png',
  },
  {
    name: 'KMEP ULTRA',
    line: 'LINHA JUMA',
    description:
      'SoluÃƒÂ§ÃƒÂ£o concentrada de potÃƒÂ¡ssio, magnÃƒÂ©sio e enxofre. Fornece nutrientes essenciais para a qualidade final da produÃƒÂ§ÃƒÂ£o e resistÃƒÂªncia a estresses.',
    stats: [
      { icon: 'molecule', value: '+15', unit: 'sc/ha', label: 'Qualidade GrÃƒÂ£o' },
      { icon: 'leaf', value: '+11', unit: 'sc/ha', label: 'ResistÃƒÂªncia' },
      { icon: 'sprout', value: '+7', unit: 'sc/ha', label: 'Produtividade' },
    ],
    base: '#141414',
    mid: '#080808',
    accent: '#f0463a',
    sizes: ['10L', '20L'],
    href: '/produtos/kmep-ultra',
    image: '/produtos/kmep-ultra-destaque.png',
  },
  {
    name: 'REVIGOPHOS AMINO',
    line: 'LINHA JUMA',
    description:
      'FÃƒÂ³sforo aminoquelatado de pronta disponibilidade. Estimula o enraizamento profundo e o enchimento de grÃƒÂ£os com mÃƒÂ¡xima eficiÃƒÂªncia.',
    stats: [
      { icon: 'molecule', value: '+20', unit: 'sc/ha', label: 'Enraizamento' },
      { icon: 'leaf', value: '+16', unit: 'sc/ha', label: 'Enchimento de GrÃƒÂ£os' },
      { icon: 'sprout', value: '+8', unit: 'sc/ha', label: 'Vigor Inicial' },
    ],
    base: '#062418',
    mid: '#020d08',
    accent: '#f2c94c',
    sizes: ['10L', '20L'],
    href: '/produtos/revigophos-amino',
    image: '/produtos/revigophos-amino-destaque.png',
  },
]

const COUNT = PRODUCTS.length

/* Ã¢â€â‚¬Ã¢â€â‚¬ Carrossel de frascos Ã¢â‚¬â€ funÃƒÂ§ÃƒÂµes de posiÃƒÂ§ÃƒÂ£o Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */

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
  bottom?: string
  width?: string
  height?: string
}

function getRoleProps(role: Role, isMobile: boolean): RoleProps {
  if (isMobile) {
    switch (role) {
      case 'center':
        return {
          left: '50%',
          xPercent: -50,
          x: 0,
          yPercent: 0,
          scale: 1,
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
          transformOrigin: 'center center',
        }
      case 'left':
        return {
          left: '50%',
          xPercent: -50,
          x: '-12vw',
          yPercent: 0,
          scale: 0.42,
          filter: 'blur(4px)',
          opacity: 0.65,
          zIndex: 10,
          transformOrigin: 'center center',
        }
      case 'right':
        return {
          left: '50%',
          xPercent: -50,
          x: '12vw',
          yPercent: 0,
          scale: 0.42,
          filter: 'blur(4px)',
          opacity: 0.65,
          zIndex: 10,
          transformOrigin: 'center center',
        }
      case 'hidden':
        return {
          left: '50%',
          xPercent: -50,
          x: 0,
          yPercent: 0,
          scale: 0.28,
          filter: 'blur(8px)',
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
        scale: 1,
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
        scale: 0.62,
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

function getVisibleRoleProps(role: Role, isMobile: boolean): RoleProps {
  const props = getRoleProps(role, isMobile)
  return {
    bottom: '8vh',
    width: 'auto',
    height: '68vh',
    y: -20,
    ...props,
    autoAlpha: props.opacity ?? 1,
  }
}

function getCatalogBottleProps(index: number, active: number, isMobile: boolean): RoleProps {
  const role = getRole(index, active)
  const props = getVisibleRoleProps(role, isMobile)
  if (index === 0 && role === 'center') {
    return { ...getFullFrameBottleProps(), scale: 0.85, y: -37, zIndex: 20 }
  }
  if (index === 0 && role === 'left') {
    return {
      ...props,
      left: '38%',
      width: '46vw',
      height: '68vh',
      y: 20,
      yPercent: -14,
      scale: 0.9,
      opacity: 0.55,
      autoAlpha: 0.55,
      zIndex: 9,
    }
  }
  if (index === 0 && role === 'right') {
    return {
      ...props,
      left: '62%',
      width: '46vw',
      height: '68vh',
      y: 20,
      yPercent: -14,
      scale: 0.9,
      opacity: 0.55,
      autoAlpha: 0.55,
      zIndex: 9,
    }
  }
  if (index === 0 && role === 'hidden') {
    return {
      ...props,
      width: '46vw',
      height: '68vh',
      y: 20,
      yPercent: -14,
      scale: 0.9,
      opacity: 0,
      autoAlpha: 0,
      zIndex: 1,
    }
  }
  return props
}

function getFullFrameBottleProps(): RoleProps {
  return {
    left: '50%',
    xPercent: -50,
    x: 0,
    yPercent: 0,
    bottom: '0vh',
    width: '100%',
    height: '100svh',
    scale: 1,
    filter: 'blur(0px)',
    autoAlpha: 1,
    opacity: 1,
    zIndex: 4,
    transformOrigin: 'center center',
  }
}
/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   Componente principal
   Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */

export function HomeProductShowcase() {
  const t = useTranslations('homeProductShowcase')

  useEffect(() => {
    const timeouts: number[] = []
    const rafs: number[] = []

    const refresh = () => ScrollTrigger.refresh()
    const scheduleRefresh = () => {
      rafs.push(
        window.requestAnimationFrame(() => {
          refresh()
          rafs.push(window.requestAnimationFrame(refresh))
        }),
      )
    }

    scheduleRefresh()
    timeouts.push(window.setTimeout(scheduleRefresh, 250))
    timeouts.push(window.setTimeout(scheduleRefresh, 900))
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

    window.addEventListener('load', scheduleRefresh)
    window.addEventListener('pageshow', scheduleRefresh)
    window.addEventListener('resize', scheduleRefresh)

    return () => {
      window.removeEventListener('load', scheduleRefresh)
      window.removeEventListener('pageshow', scheduleRefresh)
      window.removeEventListener('resize', scheduleRefresh)
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
  /** Handlers expostos ao JSX (dots e botÃƒÂ£o de pular), criados dentro do GSAP */
  const goToIndexRef = useRef<((i: number) => void) | null>(null)
  const skipRef = useRef<(() => void) | null>(null)

  useGSAP(
    () => {
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

      const setAminosanFrameMode = (fullFrame: boolean) => {
        const bottle = bottles[0]
        const wrap = bottle?.querySelector<HTMLElement>('.pcs-bottle-wrap')
        const img = bottle?.querySelector<HTMLImageElement>('.pcs-bottle')
        if (!wrap || !img) return

        if (fullFrame) {
          gsap.set(wrap, { width: '100%', height: '100%', overflow: 'visible' })
          gsap.set(img, {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '50% 50%',
          })
          return
        }

        gsap.set(wrap, { clearProps: 'width,height,overflow' })
        gsap.set(img, { clearProps: 'width,height,objectFit,objectPosition' })
      }
      const mm = gsap.matchMedia()

      mm.add(
        {
          isMotion: '(prefers-reduced-motion: no-preference)',
          isReduced: '(prefers-reduced-motion: reduce)',
          isMobile: '(max-width: 639px)',
          isDesktop: '(min-width: 640px)',
        },
        (ctx) => {
          const { isMotion, isMobile } = ctx.conditions as {
            isMotion: boolean
            isReduced: boolean
            isMobile: boolean
            isDesktop: boolean
          }

          // ÃƒÂndice atual sobrevive a mudanÃƒÂ§as de breakpoint (o mm re-executa)
          const startIndex = Math.min(Math.max(currentIndexRef.current, 0), COUNT - 1)

          // Cores iniciais
          root.style.setProperty('--pcs-base', PRODUCTS[startIndex].base)
          root.style.setProperty('--pcs-mid', PRODUCTS[startIndex].mid)
          root.style.setProperty('--pcs-accent', PRODUCTS[startIndex].accent)

          // Estado inicial dos frascos (carrossel)
          bottles.forEach((bottle, i) => {
            gsap.set(bottle, getCatalogBottleProps(i, startIndex, isMobile))
          })
          setAminosanFrameMode(true)
          gsap.set(handoffStillRef.current, { autoAlpha: 0, scale: 1, filter: 'blur(0px)' })

          // Spotlight: fade-in inicial Ã¢â‚¬â€ desktop
          gsap.set(spotlightRef.current, { opacity: 0 })
          gsap.to(spotlightRef.current, {
            opacity: 0.5,
            duration: 0.75,
            delay: 0.75,
            ease: 'power2.out',
          })
          // Spotlight: fade-in inicial Ã¢â‚¬â€ mobile
          gsap.set(mobileSpotlightRef.current, { opacity: 0 })
          gsap.to(mobileSpotlightRef.current, {
            opacity: 0.85,
            duration: 0.75,
            delay: 0.75,
            ease: 'power2.out',
          })

          // Visibilidade inicial dos painÃƒÂ©is de texto
          products.forEach((el, i) => {
            const { text, cta, stats } = parts(el)
            gsap.set([text, cta, ...stats], { autoAlpha: i === startIndex ? 1 : 0, x: 0 })
            el.classList.toggle('is-active', i === startIndex)
          })

          // Dot ativo inicial
          dots.forEach((d, i) => d.classList.toggle('is-active', i === startIndex))

          /* Ã¢â€â‚¬Ã¢â€â‚¬ TransiÃƒÂ§ÃƒÂ£o entre produtos Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
             InterrompÃƒÂ­vel: um scroll rÃƒÂ¡pido pode atravessar vÃƒÂ¡rios
             produtos; a timeline anterior ÃƒÂ© morta e a nova parte do
             estado atual (overwrite), entÃƒÂ£o nunca trava nem enfileira. */

          let transitionTl: gsap.core.Timeline | null = null

          const applyIndex = (index: number) => {
            const from = currentIndexRef.current
            if (index === from) return
            currentIndexRef.current = index
            hideHint()

            const dir = index > from ? 1 : -1
            const next = PRODUCTS[index]

            transitionTl?.kill()
            const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
            transitionTl = tl

            // Fundo: anima as CSS vars direto (parte do valor atual, sem saltos)
            tl.to(
              root,
              {
                '--pcs-base': next.base,
                '--pcs-mid': next.mid,
                duration: 0.9,
                ease: 'power2.inOut',
              },
              0,
            )
            tl.to(
              root,
              {
                '--pcs-accent': next.accent,
                duration: 0.38,
                ease: 'power2.out',
              },
              0,
            )

            // Spotlight: dim rÃƒÂ¡pido, volta devagar
            tl.to(spotlightRef.current, { opacity: 0.2, duration: 0.15, ease: 'power2.in' }, 0)
              .to(spotlightRef.current, { opacity: 0.5, duration: 0.35, ease: 'power2.out' }, 0.4)
              .to(
                mobileSpotlightRef.current,
                { opacity: 0.1, duration: 0.15, ease: 'power2.in' },
                0,
              )
              .to(
                mobileSpotlightRef.current,
                { opacity: 0.85, duration: 0.35, ease: 'power2.out' },
                0.4,
              )

            // Carrossel de frascos
            if (index === 0) setAminosanFrameMode(true)
            if (from === 0 && index !== 0) {
              setAminosanFrameMode(true)
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
                  duration: isMotion ? 0.65 : 0.4,
                  ease: 'power2.inOut',
                },
                0,
              )
              // Zera o offset de mouse de quem sai do centro
              if (i !== index) {
                const wrap = bottle.querySelector('.pcs-bottle-wrap')
                if (wrap) tl.to(wrap, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
              }
            })

            // PainÃƒÂ©is fora da troca ficam ocultos (scroll rÃƒÂ¡pido pula ÃƒÂ­ndices)
            products.forEach((el, i) => {
              if (i === index || i === from) return
              const p = parts(el)
              tl.set([p.text, p.cta, ...p.stats], { autoAlpha: 0 }, 0)
            })

            const curParts = parts(products[from])
            const nextParts = parts(products[index])

            if (isMotion) {
              // SaÃƒÂ­da do painel atual (direÃƒÂ§ÃƒÂ£o acompanha o scroll)
              tl.to(
                curParts.text,
                { autoAlpha: 0, x: -40 * dir, duration: 0.45, ease: 'power2.in' },
                0,
              )
                .to(curParts.cta, { autoAlpha: 0, y: 12, duration: 0.35, ease: 'power2.in' }, 0)
                .to(
                  curParts.stats,
                  { autoAlpha: 0, x: 40 * dir, stagger: 0.04, duration: 0.45, ease: 'power2.in' },
                  0,
                )

              // Entrada do prÃƒÂ³ximo painel
              tl.fromTo(
                nextParts.text,
                { autoAlpha: 0, x: 45 * dir },
                { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out' },
                0.3,
              )
                .fromTo(
                  nextParts.cta,
                  { autoAlpha: 0, y: 12 },
                  { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' },
                  0.45,
                )
                .fromTo(
                  nextParts.stats,
                  { autoAlpha: 0, x: -45 * dir },
                  { autoAlpha: 1, x: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out' },
                  0.3,
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

            // Dot ativo (cor via var(--pcs-accent), transiÃƒÂ§ÃƒÂ£o no CSS)
            dots.forEach((d, i) => d.classList.toggle('is-active', i === index))
            products.forEach((el, i) => el.classList.toggle('is-active', i === index))
          }

          /* Ã¢â€â‚¬Ã¢â€â‚¬ Pin dirigido pelo scroll nativo Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
             Sem Observer nem preventDefault: o scroll (Lenis/touch)
             segue livre e o progresso do pin decide qual produto estÃƒÂ¡
             ativo. O usuÃƒÂ¡rio nunca fica preso Ã¢â‚¬â€ pode atravessar a
             seÃƒÂ§ÃƒÂ£o na velocidade que quiser. */

          /* Flags do handoff com a seÃƒÂ§ÃƒÂ£o Aminosan (vÃƒÂ­deo de transiÃƒÂ§ÃƒÂ£o):
             handingOff evita que o onEnter "restaure" as cores no meio da
             entrada brancoÃ¢â€ â€™cor; leavingUp evita disparo duplo da saÃƒÂ­da. */
          let handingOff = false
          let leavingUp = false
          let aminosanVideoHandoff = false

          /* Estado visual pleno do produto atual Ã¢â‚¬â€ usado quando a seÃƒÂ§ÃƒÂ£o ÃƒÂ©
             alcanÃƒÂ§ada sem o handoff (ÃƒÂ¢ncora do menu, reload no meio da pÃƒÂ¡gina)
             depois de ter ficado branca por uma saÃƒÂ­da para cima. */
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
            setAminosanFrameMode(true)
            gsap.set(handoffStillRef.current, { autoAlpha: 0 })
            const p = parts(products[i])
            gsap.set([p.text, p.cta, ...p.stats], { autoAlpha: 1, x: 0, y: 0 })
          }

          const prepareHandoffIn = () => {
            handingOff = true
            leavingUp = false
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
              autoAlpha: 1,
              opacity: 1,
              scale: 1,
              y: 0,
              zIndex: 30,
              filter: 'blur(0px)',
            })
            setAminosanFrameMode(true)
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
          const pinTrigger = ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: `+=${(COUNT - 1) * 100}%`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            onEnter: () => {
              // Rede de seguranÃƒÂ§a: qualquer entrada por cima cancela um
              // "saindo pra cima" que tenha ficado pendente.
              leavingUp = false
              if (currentIndexRef.current !== 0) applyIndex(0)
              if (!handingOff) restoreVisual()
            },
            onEnterBack: () => {
              if (currentIndexRef.current !== COUNT - 1) applyIndex(COUNT - 1)
            },
          })

          /* Ã¢â€â‚¬Ã¢â€â‚¬ NavegaÃƒÂ§ÃƒÂ£o programÃƒÂ¡tica (dots, teclado, pular) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */

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
              // (a trava da seÃƒÂ§ÃƒÂ£o Aminosan deixa o Lenis parado em alguns fluxos)
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
            scrollToY(pinTrigger.end + window.innerHeight, 1.1)
          }

          /* Ã¢â€â‚¬Ã¢â€â‚¬ Handoff vindo da seÃƒÂ§ÃƒÂ£o Aminosan Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
             O vÃƒÂ­deo de transiÃƒÂ§ÃƒÂ£o termina no trio Aminosan sobre fundo
             branco; o catÃƒÂ¡logo entra branco e a cor + textos do produto 0
             aparecem gradualmente enquanto o auto-scroll assenta no pin. */
          const runHandoffIn = () => {
            handingOff = true
            leavingUp = false
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
            gsap.set(handoffStillRef.current, {
              autoAlpha: 1,
              opacity: 1,
              scale: 1,
              y: 0,
              zIndex: 30,
              filter: 'blur(0px)',
            })
            setAminosanFrameMode(true)
            bottles.forEach((bottle, i) => {
              gsap.set(bottle, {
                ...getCatalogBottleProps(i, 0, isMobile),
                autoAlpha: 0,
                opacity: 0,
              })
            })
            // Durante o handoff o frame 16:9 cobre o produto 0; depois o teatro assume.
            products.forEach((el, i) => {
              if (i === 0) return
              const p = parts(el)
              gsap.set([p.text, p.cta, ...p.stats], { autoAlpha: 0 })
            })

            const catalogCenter = getCatalogBottleProps(0, 0, isMobile)
            const tl = gsap.timeline({
              defaults: { overwrite: 'auto' },
              onComplete: () => {
                if (bottles[0]) gsap.set(bottles[0], { ...catalogCenter, autoAlpha: 1, opacity: 1 })
                gsap.set(handoffStillRef.current, {
                  autoAlpha: 0,
                  opacity: 0,
                  scale: 1,
                  y: 0,
                  zIndex: 3,
                  filter: 'blur(0px)',
                })
                handingOff = false
              },
            })
            transitionTl = tl
            gsap.set(bottles[0], { ...catalogCenter, autoAlpha: 0, opacity: 0 })
            tl.set(
              handoffStillRef.current,
              { autoAlpha: 1, scale: 1, y: 0, zIndex: 30, filter: 'blur(0px)' },
              0,
            )
            tl.to(
              handoffStillRef.current,
              {
                scale: catalogCenter.scale,
                y: catalogCenter.y ?? 0,
                duration: 0.58,
                ease: 'power2.out',
              },
              0,
            )
            tl.set(bottles[0], { ...catalogCenter, autoAlpha: 1, opacity: 1 }, 0.58)
            tl.set(handoffStillRef.current, { autoAlpha: 0, opacity: 0, zIndex: 3 }, 0.58)
            bottles.forEach((bottle, i) => {
              if (i === 0) return
              tl.to(
                bottle,
                { ...getCatalogBottleProps(i, 0, isMobile), duration: 0.6, ease: 'power2.out' },
                0.08,
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

          /* SaÃƒÂ­da para cima a partir do produto 0: o fundo volta a branco
             (o reverso do vÃƒÂ­deo roda sobre branco na seÃƒÂ§ÃƒÂ£o acima) e o scroll
             sobe atÃƒÂ© o stage do Aminosan Ã¢â‚¬â€ o ScrollTrigger de lÃƒÂ¡ assume,
             trava o scroll e toca o clipe reverso trioÃ¢â€ â€™linha. */
          const runHandoffOut = () => {
            if (leavingUp) return
            hideHint()
            transitionTl?.kill()
            clearTimeout(idleTimer)
            lenisRef.current?.stop()
            lenisRef.current?.scrollTo(pinTrigger.start, { immediate: true, force: true })
            window.scrollTo(0, pinTrigger.start)
            ScrollTrigger.update()
            leavingUp = true
            const p0 = parts(products[0])
            // SimÃƒÂ©trico ÃƒÂ  entrada: primeiro prepara o catÃƒÂ¡logo para casar com o
            // frame final do vÃƒÂ­deo de transiÃƒÂ§ÃƒÂ£o (mesmo trio, mas full-frame e
            // sobre branco) Ã¢â‚¬â€ tira a cor, some com os textos e amplia o trio.
            // SÃƒÂ³ entÃƒÂ£o salta INSTANTANEAMENTE para o stage do Aminosan e manda
            // tocar o clipe em reverso. O wheel/tecla no produto 0 jÃƒÂ¡ vÃƒÂªm com
            // preventDefault (pin ativo), entÃƒÂ£o a pÃƒÂ¡gina fica parada durante o
            // preparo Ã¢â‚¬â€ sem o "tranco" do scroll suave anterior.
            const tl = gsap.timeline({
              defaults: { overwrite: 'auto' },
              onComplete: () => {
                // Cancela qualquer assentamento pendente antes do salto.
                clearTimeout(idleTimer)
                // Alvo = topo REAL da seÃƒÂ§ÃƒÂ£o Aminosan (nÃƒÂ£o o pinStart estimado),
                // para o stage cair exatamente no topo da viewport.
                const amino = document.getElementById('sec-origem')
                const y = amino
                  ? Math.round(amino.getBoundingClientRect().top + window.scrollY)
                  : pinTrigger.start - window.innerHeight
                // Salto SÃƒÂNCRONO: aplica no DOM na hora (nativo) e alinha o alvo
                // do Lenis. SÃƒÂ³ entÃƒÂ£o dispara o evento Ã¢â‚¬â€ assim, quando o Aminosan
                // travar logo abaixo, o stage jÃƒÂ¡ estÃƒÂ¡ no topo e o lockScroll nÃƒÂ£o
                // precisa de tween de alinhamento (a rolagem residual que sobrava
                // vinha justamente de travar com o scrollY ainda no catÃƒÂ¡logo,
                // porque o immediate do Lenis sÃƒÂ³ aplica no prÃƒÂ³ximo tick).
                lenisRef.current?.scrollTo(y, { immediate: true, force: true })
                window.scrollTo(0, y)
                // leavingUp CONTINUA true: enquanto estivermos acima do catÃƒÂ¡logo
                // ele nÃƒÂ£o pode mexer no scroll (settle desligado). SÃƒÂ³ volta a
                // false ao reentrar (runHandoffIn ou onEnter do pin).
                window.dispatchEvent(new CustomEvent('aminosan:handoff-backward'))
              },
            })
            transitionTl = tl
            const catalogCenter = getCatalogBottleProps(0, 0, isMobile)

            tl.set(
              handoffStillRef.current,
              { ...catalogCenter, autoAlpha: 1, opacity: 1, zIndex: 30, filter: 'blur(0px)' },
              0,
            )
            tl.set(bottles[0], { autoAlpha: 0, opacity: 0 }, 0)
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
            tl.to(
              handoffStillRef.current,
              { scale: 1, y: 0, duration: 0.58, ease: 'power2.inOut' },
              0,
            )
          }

          // Snap ao parar de rolar (detecÃƒÂ§ÃƒÂ£o prÃƒÂ³pria de inatividade Ã¢â‚¬â€ o
          // 'scrollEnd' do ScrollTrigger nÃƒÂ£o ÃƒÂ© confiÃƒÂ¡vel com o Lenis no meio):
          // Ã¢â‚¬â€ dentro do pin: assenta no produto mais prÃƒÂ³ximo;
          // Ã¢â‚¬â€ nas bordas (seÃƒÂ§ÃƒÂ£o parcialmente visÃƒÂ­vel): completa o movimento na
          //   direÃƒÂ§ÃƒÂ£o do gesto, para nunca descansar com faixa da seÃƒÂ§ÃƒÂ£o vizinha.
          const settle = () => {
            // Durante um handoff (entrando do vÃƒÂ­deo ou saindo pra cima) o scroll
            // ÃƒÂ© dirigido pelo Aminosan/pela timeline Ã¢â‚¬â€ o catÃƒÂ¡logo nÃƒÂ£o pode
            // assentar nada, senÃƒÂ£o briga com aquele controle.
            if (leavingUp || handingOff || aminosanVideoHandoff) return
            const scroll = window.scrollY
            const vh = window.innerHeight

            if (pinTrigger.isActive) {
              const target = indexToY(currentIndexRef.current)
              if (Math.abs(scroll - target) > 4) scrollToY(target, 0.55)
              return
            }
            // Zona de entrada (catÃƒÂ¡logo espiando por baixo da seÃƒÂ§ÃƒÂ£o anterior)
            if (scroll < pinTrigger.start && scroll > pinTrigger.start - vh) {
              if (lastDir < 0 && currentIndexRef.current === 0) {
                runHandoffOut()
                return
              }
              scrollToY(lastDir > 0 ? pinTrigger.start : Math.max(0, pinTrigger.start - vh), 0.7)
              return
            }
            // Zona de saÃƒÂ­da (prÃƒÂ³xima seÃƒÂ§ÃƒÂ£o espiando por baixo do catÃƒÂ¡logo)
            if (scroll > pinTrigger.end && scroll < pinTrigger.end + vh) {
              scrollToY(lastDir > 0 ? pinTrigger.end + vh : pinTrigger.end, 0.7)
            }
          }

          let stepLocked = false
          let touchStartY = 0

          const unlockStep = () => {
            window.setTimeout(() => {
              stepLocked = false
            }, 420)
          }

          const stepCatalog = (dir: 1 | -1) => {
            if (leavingUp || handingOff || aminosanVideoHandoff) return
            if (!pinTrigger.isActive || stepLocked) return
            stepLocked = true
            hideHint()

            const current = currentIndexRef.current
            if (dir > 0) {
              if (current < COUNT - 1) goToIndex(current + 1, 0.5)
              else skipRef.current?.()
            } else if (current > 0) {
              goToIndex(current - 1, 0.5)
            } else {
              runHandoffOut()
            }

            unlockStep()
          }

          const onWheelStep = (e: WheelEvent) => {
            if (aminosanVideoHandoff) {
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
            if (e.cancelable) e.preventDefault()
            stepCatalog(e.deltaY > 0 ? 1 : -1)
          }

          const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) touchStartY = e.touches[0].clientY
          }

          const onTouchMoveStep = (e: TouchEvent) => {
            if (aminosanVideoHandoff) {
              if (e.cancelable) e.preventDefault()
              return
            }
            if (e.touches.length === 0) return
            const delta = touchStartY - e.touches[0].clientY
            if (Math.abs(delta) < 18) return
            if (!pinTrigger.isActive) {
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
            if (e.cancelable) e.preventDefault()
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
            clearTimeout(idleTimer)
            idleTimer = setTimeout(settle, 180)
          }
          window.addEventListener('scroll', onScroll, { passive: true })
          window.addEventListener('wheel', onWheelStep, { passive: false, capture: true })
          window.addEventListener('touchstart', onTouchStart, { passive: true })
          window.addEventListener('touchmove', onTouchMoveStep, { passive: false, capture: true })

          const settleTimers = [window.setTimeout(settle, 320), window.setTimeout(settle, 950)]

          // Movimento sutil com o mouse Ã¢â‚¬â€ sÃƒÂ³ no frasco ATIVO (desktop).
          // O tween mira o wrap interno; o carrossel anima o elemento externo,
          // entÃƒÂ£o os dois nunca brigam.
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
              if (currentIndexRef.current < COUNT - 1) goToIndex(currentIndexRef.current + 1)
              else skipRef.current?.()
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
              e.preventDefault()
              if (currentIndexRef.current > 0) {
                goToIndex(currentIndexRef.current - 1)
              } else {
                runHandoffOut()
              }
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
            transitionTl?.kill()
            pinTrigger.kill()
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
        {/* Desktop spotlight Ã¢â‚¬â€ canto superior direito, espelhado */}
        <Spotlight
          ref={spotlightRef}
          className="hidden lg:block -top-20 right-[-280px]"
          fill="white"
          stdDeviation={260}
          fillOpacity={0.6}
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* Mobile spotlight Ã¢â‚¬â€ feixe de cima para o produto */}
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
          {/* Still de ponte entre o vÃƒÂ­deo branco e o catÃƒÂ¡logo. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={handoffStillRef}
            src="/produtos/aminosan-catalogo.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute inset-0 z-[3] h-full w-full object-cover opacity-0"
          />

          {/* Teatro de frascos Ã¢â‚¬â€ todos os produtos posicionados, GSAP anima */}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="pcs-bottle" src={product.image} alt={name} draggable={false} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* PainÃƒÂ©is de texto Ã¢â‚¬â€ sobrepostos no grid (3 cols: texto | frasco | stats) */}
          {PRODUCTS.map((product, i) => {
            const name = t(`products.${i}.name`)
            const description = t(`products.${i}.description`)
            return (
              <article key={name} className="pcs-product">
                {/* Coluna 1 Ã¢â‚¬â€ texto */}
                <div className="pcs-panel-text">
                  <div className="pcs-panel-main">
                    <div className="pcs-panel-brand" aria-hidden="true">
                      <img src="/brand/logo-juma-agro-branca.png" alt="" draggable={false} />
                    </div>
                    <h2 className={`pcs-panel-title pcs-panel-title-${i}`}>
                      {i === 1 ? (
                        <>
                          <span className="pcs-title-line">Acorda</span>
                          <span className="pcs-title-line">Ultra</span>
                        </>
                      ) : i === 3 ? (
                        <>
                          <span className="pcs-title-line">Revigo</span>
                          <span className="pcs-title-line">Phos</span>
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

                {/* Coluna 3 Ã¢â‚¬â€ stats */}
                <div className="pcs-panel-stats">
                  {product.stats.map((stat, si) => {
                    const statLabel = t(`products.${i}.stats.${si}.label`)
                    const statUnit = t(`products.${i}.stats.${si}.unit`)
                    const Icon = STAT_ICONS[stat.icon]
                    return (
                      <div
                        key={statLabel}
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
                          <div className="pcs-stat-value-row">
                            <span className="pcs-stat-value">{stat.value}</span>
                            <span className="pcs-stat-unit">{statUnit}</span>
                          </div>
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

      {/* NavegaÃ§Ã£o por produto (dots) */}
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

      {/* Pular a seÃƒÂ§ÃƒÂ£o sem passar por todos os produtos */}
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

/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
   VersÃƒÂ£o acessÃƒÂ­vel (prefers-reduced-motion)
   Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */

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
                <img
                  src="/brand/logo-juma-agro-branca.png"
                  alt="Juma Agro"
                  draggable={false}
                  className="h-9 w-fit object-contain"
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
                  {t('hintReduced')} Ã¢â€ â€™
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
