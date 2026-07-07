'use client'

import { useRef } from 'react'
import { Leaf, Atom, Sprout } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { gsap, ScrollTrigger, Observer, useGSAP } from '@/features/animation/gsap'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Spotlight } from '@/components/ui/Spotlight'
import { useTranslations } from 'next-intl'

/* ── Tipos ─────────────────────────────────────────────────────── */

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
  /** Cor escura de fundo (base) — radial gradient borda */
  base: string
  /** Cor escura de fundo (mid) — radial gradient centro */
  mid: string
  /** Cor de destaque (accent) — anéis, divider, ícone */
  accent: string
  href: string
}

/* ── Ícones dos stats ──────────────────────────────────────────── */

const STAT_ICONS: Record<StatIcon, LucideIcon> = {
  leaf: Leaf,
  molecule: Atom,
  sprout: Sprout,
}

/* ── Produtos — 13 itens na ordem do doc cores-por-produto.md ─── */

const PRODUCTS: ProductEntry[] = [
  {
    name: 'AMINOSAN',
    line: 'LINHA REDUTAN',
    description:
      'Bioativador organomineral à base de aminoácidos livres. Acelera o metabolismo da planta e potencializa a absorção de nutrientes em todas as fases.',
    stats: [
      { icon: 'leaf',     value: '+14', unit: 'sc/ha', label: 'Acorda Cana' },
      { icon: 'molecule', value: '+20', unit: 'sc/ha', label: 'RevigoPhos Amino' },
      { icon: 'sprout',   value: '+5',  unit: 'sc/ha', label: 'Revigo + Milho e Pasto' },
    ],
    base: '#0c3b2e', mid: '#0a2a22', accent: '#34d399',
    href: '/produtos/aminosan',
  },
  {
    name: 'LINHA REVIGO',
    line: 'LINHA JUMA',
    description:
      'Linha completa de nutrição mineral avançada. Formulações especializadas que otimizam o aproveitamento de macro e micronutrientes pelas culturas.',
    stats: [
      { icon: 'molecule', value: '+19', unit: 'sc/ha', label: 'Soja Premium' },
      { icon: 'leaf',     value: '+13', unit: 'sc/ha', label: 'Milho Alta Prod.' },
      { icon: 'sprout',   value: '+8',  unit: 'sc/ha', label: 'Algodão Pluma' },
    ],
    base: '#0b2350', mid: '#081838', accent: '#3b82f6',
    href: '/produtos/linha-revigo',
  },
  {
    name: 'ADUBAN',
    line: 'LINHA REDUTAN',
    description:
      'Adubo mineral organomineral de alta concentração. Fornece macronutrientes de forma equilibrada e sinérgica para o desenvolvimento pleno das culturas.',
    stats: [
      { icon: 'leaf',     value: '+16', unit: 'sc/ha', label: 'Soja Produção' },
      { icon: 'molecule', value: '+12', unit: 'sc/ha', label: 'Milho Safra' },
      { icon: 'sprout',   value: '+8',  unit: 'sc/ha', label: 'Feijão Rendimento' },
    ],
    base: '#3a100e', mid: '#280b09', accent: '#f87171',
    href: '/produtos/aduban',
  },
  {
    name: 'FITOFERT',
    line: 'LINHA JUMA',
    description:
      'Fertilizante foliar completo com macro e micronutrientes de alta solubilidade. Supre deficiências nutricionais de forma rápida e eficiente.',
    stats: [
      { icon: 'leaf',     value: '+14', unit: 'sc/ha', label: 'Soja Foliar' },
      { icon: 'sprout',   value: '+10', unit: 'sc/ha', label: 'Café Floração' },
      { icon: 'molecule', value: '+6',  unit: 'sc/ha', label: 'Citros Qualidade' },
    ],
    base: '#0d3f30', mid: '#0b2d22', accent: '#22c55e',
    href: '/produtos/fitofert',
  },
  {
    name: 'REVIGOPHOS AMINO',
    line: 'LINHA JUMA',
    description:
      'Fósforo aminoquelatado de pronta disponibilidade. Estimula o enraizamento profundo e o enchimento de grãos com máxima eficiência.',
    stats: [
      { icon: 'molecule', value: '+20', unit: 'sc/ha', label: 'Enraizamento' },
      { icon: 'leaf',     value: '+16', unit: 'sc/ha', label: 'Enchimento de Grãos' },
      { icon: 'sprout',   value: '+8',  unit: 'sc/ha', label: 'Vigor Inicial' },
    ],
    base: '#0c2060', mid: '#091545', accent: '#60a5fa',
    href: '/produtos/revigophos-amino',
  },
  {
    name: 'ACORDA ULTRA',
    line: 'LINHA REDUTAN',
    description:
      'Bioestimulante para arranque de culturas anuais. Estimula o enraizamento profundo desde a germinação e aumenta o vigor inicial das plantas.',
    stats: [
      { icon: 'sprout',   value: '+18', unit: 'sc/ha', label: 'Soja Arranque' },
      { icon: 'leaf',     value: '+11', unit: 'sc/ha', label: 'Milho Vigor' },
      { icon: 'molecule', value: '+7',  unit: 'sc/ha', label: 'Feijão Inicial' },
    ],
    base: '#0a3a44', mid: '#082a31', accent: '#22d3ee',
    href: '/produtos/acorda-ultra',
  },
  {
    name: 'SUPERMIX',
    line: 'LINHA JUMA',
    description:
      'Mix nutricional completo com micronutrientes quelados. Corrige deficiências múltiplas em uma única aplicação, com compatibilidade ampla de tanque.',
    stats: [
      { icon: 'sprout',   value: '+21', unit: 'sc/ha', label: 'Milho Verão' },
      { icon: 'leaf',     value: '+14', unit: 'sc/ha', label: 'Soja Granados' },
      { icon: 'molecule', value: '+9',  unit: 'sc/ha', label: 'Algodão Fibra' },
    ],
    base: '#1a3010', mid: '#10200a', accent: '#84cc16',
    href: '/produtos/supermix',
  },
  {
    name: 'REVIGO COBRE ULTRA',
    line: 'LINHA JUMA',
    description:
      'Cobre complexado de alta mobilidade. Atua na fotossíntese e na síntese de lignina, blindando a lavoura contra adversidades.',
    stats: [
      { icon: 'leaf',     value: '+13', unit: 'sc/ha', label: 'Fotossíntese' },
      { icon: 'molecule', value: '+17', unit: 'sc/ha', label: 'Defesa Natural' },
      { icon: 'sprout',   value: '+6',  unit: 'sc/ha', label: 'Sanidade Foliar' },
    ],
    base: '#3f1320', mid: '#2b0d16', accent: '#fb7185',
    href: '/produtos/revigo-cobre-ultra',
  },
  {
    name: 'KMEP ULTRA',
    line: 'LINHA JUMA',
    description:
      'Solução concentrada de potássio, magnésio e enxofre. Fornece nutrientes essenciais para a qualidade final da produção e resistência a estresses.',
    stats: [
      { icon: 'molecule', value: '+15', unit: 'sc/ha', label: 'Qualidade Grão' },
      { icon: 'leaf',     value: '+11', unit: 'sc/ha', label: 'Resistência' },
      { icon: 'sprout',   value: '+7',  unit: 'sc/ha', label: 'Produtividade' },
    ],
    base: '#3b0e10', mid: '#29090b', accent: '#ef4444',
    href: '/produtos/kmep-ultra',
  },
  {
    name: 'REVIGO + MILHO',
    line: 'LINHA JUMA',
    description:
      'Pacote nutricional desenhado para o milho de alta produtividade. Equilíbrio de macro e micronutrientes do plantio à colheita.',
    stats: [
      { icon: 'sprout',   value: '+25', unit: 'sc/ha', label: 'Milho Verão' },
      { icon: 'leaf',     value: '+19', unit: 'sc/ha', label: 'Milho Safrinha' },
      { icon: 'molecule', value: '+10', unit: 'sc/ha', label: 'Stay Green' },
    ],
    base: '#26400f', mid: '#1a2d0a', accent: '#a3e635',
    href: '/produtos/revigo-milho',
  },
  {
    name: 'LINHA REDUTAN',
    line: 'LINHA REDUTAN',
    description:
      'Linha de adubação foliar sustentável à base de aminoácidos e quelatos orgânicos. Reduz perdas nutricionais e aumenta a eficiência de aproveitamento.',
    stats: [
      { icon: 'leaf',     value: '+17', unit: 'sc/ha', label: 'Soja Redutan' },
      { icon: 'molecule', value: '+12', unit: 'sc/ha', label: 'Milho Nutrição' },
      { icon: 'sprout',   value: '+9',  unit: 'sc/ha', label: 'Café Produção' },
    ],
    base: '#2a1616', mid: '#1e0f0f', accent: '#dc2626',
    href: '/produtos/linha-redutan',
  },
  {
    name: 'REVIGO + PASTO',
    line: 'LINHA JUMA',
    description:
      'Tecnologia de recuperação e manutenção de pastagens. Mais massa verde, rebrota acelerada e maior capacidade de suporte animal.',
    stats: [
      { icon: 'leaf',     value: '+30', unit: '%',     label: 'Massa Verde' },
      { icon: 'sprout',   value: '+24', unit: '%',     label: 'Rebrota' },
      { icon: 'molecule', value: '+12', unit: 'UA/ha', label: 'Lotação' },
    ],
    base: '#2a1650', mid: '#1d0f38', accent: '#a78bfa',
    href: '/produtos/revigo-pasto',
  },
  {
    name: 'ACORDA CANA',
    line: 'LINHA REDUTAN',
    description:
      'Estimulante de brotação para soqueiras. Quebra a dormência e uniformiza a rebrota, garantindo estande pleno já no início do ciclo.',
    stats: [
      { icon: 'sprout',   value: '+22', unit: 'sc/ha', label: 'Soqueira Nova' },
      { icon: 'leaf',     value: '+15', unit: 'sc/ha', label: 'Rebrota Uniforme' },
      { icon: 'molecule', value: '+9',  unit: 'sc/ha', label: 'Cana Planta' },
    ],
    base: '#3f2a0a', mid: '#2c1d07', accent: '#f59e0b',
    href: '/produtos/acorda-cana',
  },
]

const COUNT = PRODUCTS.length
const PRODUCT_IMG = '/aminosan.png'

/* ── Carrossel de frascos — funções de posição ────────────────── */

type Role = 'center' | 'left' | 'right' | 'hidden'

function getRole(i: number, active: number): Role {
  const d = ((i - active) + COUNT) % COUNT
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
  scale?: number
  filter?: string
  opacity?: number
  zIndex?: number
  transformOrigin?: string
}

function getRoleProps(role: Role, isMobile: boolean): RoleProps {
  if (isMobile) {
    switch (role) {
      case 'center': return { left: '50%', xPercent: -50, x: 0,       yPercent: 0, scale: 1,    filter: 'blur(0px)',  opacity: 1,    zIndex: 20, transformOrigin: 'center center' }
      case 'left':   return { left: '50%', xPercent: -50, x: '-12vw', yPercent: 0, scale: 0.42, filter: 'blur(4px)',  opacity: 0.65, zIndex: 10, transformOrigin: 'center center' }
      case 'right':  return { left: '50%', xPercent: -50, x: '12vw',  yPercent: 0, scale: 0.42, filter: 'blur(4px)',  opacity: 0.65, zIndex: 10, transformOrigin: 'center center' }
      case 'hidden': return { left: '50%', xPercent: -50, x: 0,       yPercent: 0, scale: 0.28, filter: 'blur(8px)',  opacity: 0,    zIndex: 1,  transformOrigin: 'center center' }
    }
  }
  switch (role) {
    case 'center': return { left: '50%', xPercent: -50, yPercent: 0,   scale: 1,    filter: 'blur(0px)',  opacity: 1,    zIndex: 20 }
    case 'left':   return { left: '38%', xPercent: -50, yPercent: -22, scale: 0.62, filter: 'blur(5px)',  opacity: 0.6,  zIndex: 10 }
    case 'right':  return { left: '62%', xPercent: -50, yPercent: -22, scale: 0.62, filter: 'blur(5px)',  opacity: 0.6,  zIndex: 10 }
    case 'hidden': return { left: '50%', xPercent: -50, yPercent: -22, scale: 0.42, filter: 'blur(11px)', opacity: 0,    zIndex: 1  }
  }
}

/* ══════════════════════════════════════════════════════════════════
   Componente principal
   ══════════════════════════════════════════════════════════════════ */

export function HomeProductShowcase() {
  const t = useTranslations('homeProductShowcase')

  const reduced = useReducedMotion()

  const rootRef            = useRef<HTMLDivElement>(null)
  const containerRef       = useRef<HTMLElement>(null)
  const bgRef              = useRef<HTMLDivElement>(null)
  const bottlesRef         = useRef<(HTMLDivElement | null)[]>([])
  const spotlightRef       = useRef<SVGSVGElement>(null)
  const mobileSpotlightRef = useRef<SVGSVGElement>(null)
  const hintRef            = useRef<HTMLDivElement>(null)

  const currentIndexRef = useRef(0)
  const isAnimatingRef  = useRef(false)

  useGSAP(
    () => {
      const root      = rootRef.current!
      const container = containerRef.current!
      const products  = gsap.utils.toArray<HTMLElement>('.pcs-product', container)
      const bottles   = bottlesRef.current.filter(Boolean) as HTMLDivElement[]

      // Cor inicial
      root.style.setProperty('--pcs-base',   PRODUCTS[0].base)
      root.style.setProperty('--pcs-mid',    PRODUCTS[0].mid)
      root.style.setProperty('--pcs-accent', PRODUCTS[0].accent)

      let hintHidden = false
      const hideHint = () => {
        if (hintHidden || !hintRef.current) return
        hintHidden = true
        gsap.to(hintRef.current, { autoAlpha: 0, duration: 0.5 })
      }

      const parts = (el: HTMLElement) => ({
        text:  el.querySelector('.pcs-panel-text'),
        stats: el.querySelectorAll('.pcs-stat-row'),
      })

      const mm = gsap.matchMedia()

      mm.add(
        {
          isMotion:  '(prefers-reduced-motion: no-preference)',
          isReduced: '(prefers-reduced-motion: reduce)',
          isMobile:  '(max-width: 639px)',
          isDesktop: '(min-width: 640px)',
        },
        (ctx) => {
          const { isMotion, isMobile } = ctx.conditions as {
            isMotion: boolean; isReduced: boolean; isMobile: boolean; isDesktop: boolean
          }

          // Estado inicial dos frascos (carrossel)
          bottles.forEach((bottle, i) => {
            gsap.set(bottle, getRoleProps(getRole(i, 0), isMobile))
          })

          // Spotlight: fade-in inicial — desktop
          gsap.set(spotlightRef.current, { opacity: 0 })
          gsap.to(spotlightRef.current, {
            opacity: 0.5, duration: 0.75, delay: 0.75, ease: 'power2.out',
          })
          // Spotlight: fade-in inicial — mobile
          gsap.set(mobileSpotlightRef.current, { opacity: 0 })
          gsap.to(mobileSpotlightRef.current, {
            opacity: 0.85, duration: 0.75, delay: 0.75, ease: 'power2.out',
          })

          // Visibilidade inicial dos painéis de texto
          products.forEach((el, i) => {
            const { text, stats } = parts(el)
            if (i > 0) gsap.set([text, ...stats], { autoAlpha: 0 })
            else       gsap.set([text, ...stats], { autoAlpha: 1 })
          })

          /* ── Transição entre produtos ──────────────────────────── */

          const goToSection = (index: number) => {
            if (index < 0 || index >= COUNT || isAnimatingRef.current) return
            if (index === currentIndexRef.current) return
            isAnimatingRef.current = true
            hideHint()

            const curIndex = currentIndexRef.current
            const curProduct = PRODUCTS[curIndex]
            const nextProduct = PRODUCTS[index]

            const curEl  = products[curIndex]
            const nextEl = products[index]

            const curParts  = parts(curEl)
            const nextParts = parts(nextEl)

            const tl = gsap.timeline({
              onComplete: () => {
                currentIndexRef.current = index
                isAnimatingRef.current  = false
              },
            })

            // Spotlight: dim rápido, volta devagar
            tl.to(spotlightRef.current,       { opacity: 0.2,  duration: 0.15, ease: 'power2.in'  }, 0)
              .to(spotlightRef.current,       { opacity: 0.5,  duration: 0.35, ease: 'power2.out' }, 0.4)
              .to(mobileSpotlightRef.current, { opacity: 0.1,  duration: 0.15, ease: 'power2.in'  }, 0)
              .to(mobileSpotlightRef.current, { opacity: 0.85, duration: 0.35, ease: 'power2.out' }, 0.4)

            // Transição de cor do fundo
            const colorObj = {
              base: curProduct.base,
              mid: curProduct.mid,
              accent: curProduct.accent,
            }
            tl.to(colorObj, {
              base: nextProduct.base,
              mid: nextProduct.mid,
              accent: nextProduct.accent,
              duration: 1.0,
              ease: 'power2.inOut',
              onUpdate: () => {
                root.style.setProperty('--pcs-base',   colorObj.base)
                root.style.setProperty('--pcs-mid',    colorObj.mid)
                root.style.setProperty('--pcs-accent', colorObj.accent)
              },
            }, 0)

            if (isMotion) {
              // Carrossel de frascos
              bottles.forEach((bottle, i) => {
                tl.to(bottle, {
                  ...getRoleProps(getRole(i, index), isMobile),
                  duration: 0.65,
                  ease: 'power2.inOut',
                }, 0)
              })

              // Saída do painel atual
              tl.to(curParts.text,  { autoAlpha: 0, x: -40, duration: 0.6, ease: 'power2.inOut' }, 0)
                .to(curParts.stats, { autoAlpha: 0, x: 40,  stagger: 0.05, duration: 0.6, ease: 'power2.inOut' }, 0)

              // Entrada do próximo painel
              tl.fromTo(
                nextParts.text,
                { autoAlpha: 0, x: 45 },
                { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out' },
                0.4,
              ).fromTo(
                nextParts.stats,
                { autoAlpha: 0, x: -45 },
                { autoAlpha: 1, x: 0, stagger: 0.07, duration: 0.8, ease: 'power3.out' },
                0.4,
              )
            } else {
              // Reduced motion: crossfade simples
              tl.to([curParts.text, ...curParts.stats], { autoAlpha: 0, duration: 0.5 }, 0)
              bottles.forEach((bottle, i) => {
                tl.to(bottle, {
                  ...getRoleProps(getRole(i, index), isMobile),
                  duration: 0.5,
                }, 0)
              })
              tl.fromTo(
                [nextParts.text, ...nextParts.stats],
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.5 },
                0.4,
              )
            }
          }

          /* ── Navegação por ScrollTrigger pin + Observer ──────── */

          // Pin a seção no topo e usar Observer para interceptar
          // scroll/touch enquanto a seção está pinada.
          // Isso integra com o Lenis e a página, ao contrário do
          // prototype original que tomava a tela inteira.

          let pinTrigger: ScrollTrigger | null = null
          let observerInstance: Observer | null = null

          // Custom non-passive event listener to prevent scroll at boundaries
          let touchStartY = 0
          
          const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) {
              touchStartY = e.touches[0].clientY
            }
          }

          const handleScrollPrevention = (e: WheelEvent | TouchEvent) => {
            if (!pinTrigger || !pinTrigger.isActive) return

            let isScrollDown = false
            if (e instanceof WheelEvent) {
              isScrollDown = e.deltaY > 0
            } else if (e instanceof TouchEvent) {
              if (e.touches.length === 0) return
              const touchY = e.touches[0].clientY
              isScrollDown = touchStartY - touchY > 0
            }

            const curIdx = currentIndexRef.current
            
            // If scrolling down and we haven't reached the last section, prevent default
            if (isScrollDown && curIdx < COUNT - 1) {
              if (e.cancelable) e.preventDefault()
            }
            // If scrolling up and we haven't reached the first section, prevent default
            else if (!isScrollDown && curIdx > 0) {
              if (e.cancelable) e.preventDefault()
            }
          }

          pinTrigger = ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: `+=${COUNT * 100}%`,
            pin: true,
            pinSpacing: true,
            onToggle: (self) => {
              // Ativa/desativa o Observer conforme a seção está pinada
              if (self.isActive) {
                window.addEventListener('wheel', handleScrollPrevention, { passive: false })
                window.addEventListener('touchstart', handleTouchStart, { passive: true })
                window.addEventListener('touchmove', handleScrollPrevention, { passive: false })

                if (!observerInstance) {
                  observerInstance = Observer.create({
                    type: 'wheel,touch',
                    wheelSpeed: 1.0,
                    tolerance: 25,
                    preventDefault: false, // Set to false since we prevent manually!
                    onUp: () => {
                      if (!isAnimatingRef.current && currentIndexRef.current > 0) {
                        goToSection(currentIndexRef.current - 1)
                      }
                    },
                    onDown: () => {
                      if (!isAnimatingRef.current && currentIndexRef.current < COUNT - 1) {
                        goToSection(currentIndexRef.current + 1)
                      }
                    },
                  })
                }
              } else {
                window.removeEventListener('wheel', handleScrollPrevention)
                window.removeEventListener('touchstart', handleTouchStart)
                window.removeEventListener('touchmove', handleScrollPrevention)

                if (observerInstance) {
                  observerInstance.kill()
                  observerInstance = null
                }
              }
            },
          })

          // Teclado
          const handleKeyDown = (e: KeyboardEvent) => {
            if (!pinTrigger?.isActive || isAnimatingRef.current) return
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
              if (currentIndexRef.current < COUNT - 1) {
                e.preventDefault()
                goToSection(currentIndexRef.current + 1)
              }
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
              if (currentIndexRef.current > 0) {
                e.preventDefault()
                goToSection(currentIndexRef.current - 1)
              }
            }
          }
          window.addEventListener('keydown', handleKeyDown)

          return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('wheel', handleScrollPrevention)
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchmove', handleScrollPrevention)
            observerInstance?.kill()
            pinTrigger?.kill()
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

      {/* Sombra de palco */}
      <div className="pcs-composition" aria-hidden>
        <div className="pcs-podium-glow" />
        <div className="pcs-podium-spec" />
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
          {/* Teatro de frascos — todos os produtos posicionados, GSAP anima */}
          <div className="pcs-bottle-theater" aria-hidden>
            {PRODUCTS.map((product, i) => {
            const name = t(`products.${i}.name`);
            return (
              <div
                key={name}
                className="pcs-theater-bottle"
                ref={el => { bottlesRef.current[i] = el }}
              >
                <div className="pcs-bottle-wrap">
                  <div className="pcs-ambient-shadow" />
                  <div className="pcs-contact-shadow" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="pcs-bottle" src={PRODUCT_IMG} alt={name} draggable={false} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="pcs-reflection" src={PRODUCT_IMG} alt="" aria-hidden draggable={false} />
                </div>
              </div>
            )})}
          </div>

          {/* Painéis de texto — sobrepostos no grid (3 cols: texto | frasco | stats) */}
          {PRODUCTS.map((product, i) => {
            const name = t(`products.${i}.name`);
            const line = t(`products.${i}.line`);
            const description = t(`products.${i}.description`);
            const lineParts = line.split(' ')
            const lead      = lineParts.slice(0, -1).join(' ')
            const tail      = lineParts[lineParts.length - 1]
            return (
              <article key={name} className="pcs-product">
                {/* Coluna 1 — texto */}
                <div className="pcs-panel-text">
                  <p className="pcs-panel-line">
                    {lead} <span style={{ color: product.accent }}>{tail}®</span>
                  </p>
                  <h2 className="pcs-panel-title">{name}</h2>
                  <div className="pcs-panel-divider" style={{ background: product.accent }} />
                  <p className="pcs-panel-copy">{description}</p>
                </div>

                {/* Coluna 3 — stats */}
                <div className="pcs-panel-stats">
                  {product.stats.map((stat, si) => {
                    const statLabel = t(`products.${i}.stats.${si}.label`);
                    const statUnit = t(`products.${i}.stats.${si}.unit`);
                    const Icon = STAT_ICONS[stat.icon]
                    return (
                      <div key={statLabel} className="pcs-stat-row">
                        <div
                          className="pcs-stat-icon"
                          style={{
                            borderColor: `${product.accent}b3`,
                            boxShadow:   `0 0 22px ${product.accent}40`,
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
        </div>
      </section>

      {/* Dica de rolagem */}
      <div ref={hintRef} className="pcs-scroll-hint">
        <span>{t('hint')}</span>
        <span className="pcs-scroll-hint-line" />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   Versão acessível (prefers-reduced-motion)
   ══════════════════════════════════════════════════════════════════ */

function ShowcaseReduced({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-12">
        <p className="mb-12 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
          {t('subtitle')}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRODUCTS.map((product, i) => {
            const name = t(`products.${i}.name`);
            const line = t(`products.${i}.line`);
            const description = t(`products.${i}.description`);
            return (
            <Link
              key={name}
              href={product.href}
              className="group flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20"
            >
              <span className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: product.accent }}>
                {line}
              </span>
              <h3 className="font-black text-lg uppercase text-white leading-tight">{name}</h3>
              <p className="text-sm text-white/60 leading-relaxed m-0 flex-1">{description}</p>
              <span className="text-xs font-semibold" style={{ color: product.accent }}>{t('hintReduced')} →</span>
            </Link>
          )})}
        </div>
      </div>
    </section>
  )
}
