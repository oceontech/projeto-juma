'use client'

import { useRef } from 'react'
import { Leaf, Atom, Sprout, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { useLenis } from '@/features/animation/SmoothScroll'
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
}

/* ── Produtos do catálogo da home ─ 4 itens ───────────── */
/* Texto (nome/linha/descrição/stats) vem das mensagens i18n por índice;
   este array dá cores, valores dos stats, href e a imagem do frasco. */

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
    base: '#07133a', mid: '#030817', accent: '#7fd0f2',
    sizes: ['1L', '10L', '20L'],
    href: '/produtos/aminosan',
    image: '/produtos/aminosan-destaque.png',
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
    base: '#052538', mid: '#031018', accent: '#2c96c8',
    sizes: ['1L', '10L'],
    href: '/produtos/acorda-ultra',
    image: '/produtos/acorda-ultra-destaque.png',
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
    base: '#141414', mid: '#080808', accent: '#f0463a',
    sizes: ['10L', '20L'],
    href: '/produtos/kmep-ultra',
    image: '/produtos/kmep-ultra-destaque.png',
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
    base: '#062418', mid: '#020d08', accent: '#f2c94c',
    sizes: ['10L', '20L'],
    href: '/produtos/revigophos-amino',
    image: '/produtos/revigophos-amino-destaque.png',
  },
]

const COUNT = PRODUCTS.length

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
    case 'center': return { left: '50%', xPercent: -50, x: 0, yPercent: 0,   scale: 1,    filter: 'blur(0px)',  opacity: 1,    zIndex: 20 }
    case 'left':   return { left: '38%', xPercent: -50, x: 0, yPercent: -22, scale: 0.62, filter: 'blur(5px)',  opacity: 0.6,  zIndex: 10 }
    case 'right':  return { left: '62%', xPercent: -50, x: 0, yPercent: -22, scale: 0.62, filter: 'blur(5px)',  opacity: 0.6,  zIndex: 10 }
    case 'hidden': return { left: '50%', xPercent: -50, x: 0, yPercent: -22, scale: 0.42, filter: 'blur(11px)', opacity: 0,    zIndex: 1  }
  }
}

/* ══════════════════════════════════════════════════════════════════
   Componente principal
   ══════════════════════════════════════════════════════════════════ */

export function HomeProductShowcase() {
  const t = useTranslations('homeProductShowcase')

  const reduced = useReducedMotion()

  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis

  const rootRef            = useRef<HTMLDivElement>(null)
  const containerRef       = useRef<HTMLElement>(null)
  const bgRef              = useRef<HTMLDivElement>(null)
  const bottlesRef         = useRef<(HTMLDivElement | null)[]>([])
  const dotsRef            = useRef<(HTMLButtonElement | null)[]>([])
  const spotlightRef       = useRef<SVGSVGElement>(null)
  const mobileSpotlightRef = useRef<SVGSVGElement>(null)
  const hintRef            = useRef<HTMLDivElement>(null)

  const currentIndexRef = useRef(0)
  /** Handlers expostos ao JSX (dots e botão de pular), criados dentro do GSAP */
  const goToIndexRef = useRef<((i: number) => void) | null>(null)
  const skipRef      = useRef<(() => void) | null>(null)

  useGSAP(
    () => {
      const root      = rootRef.current
      const container = containerRef.current
      if (!root || !container) return

      const products = gsap.utils.toArray<HTMLElement>('.pcs-product', container)
      const bottles  = bottlesRef.current.filter(Boolean) as HTMLDivElement[]
      const dots     = dotsRef.current.filter(Boolean) as HTMLButtonElement[]

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

          // Índice atual sobrevive a mudanças de breakpoint (o mm re-executa)
          const startIndex = Math.min(Math.max(currentIndexRef.current, 0), COUNT - 1)

          // Cores iniciais
          root.style.setProperty('--pcs-base',   PRODUCTS[startIndex].base)
          root.style.setProperty('--pcs-mid',    PRODUCTS[startIndex].mid)
          root.style.setProperty('--pcs-accent', PRODUCTS[startIndex].accent)

          // Estado inicial dos frascos (carrossel)
          bottles.forEach((bottle, i) => {
            gsap.set(bottle, getRoleProps(getRole(i, startIndex), isMobile))
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
            gsap.set([text, ...stats], { autoAlpha: i === startIndex ? 1 : 0, x: 0 })
          })

          // Dot ativo inicial
          dots.forEach((d, i) => d.classList.toggle('is-active', i === startIndex))

          /* ── Transição entre produtos ──────────────────────────────
             Interrompível: um scroll rápido pode atravessar vários
             produtos; a timeline anterior é morta e a nova parte do
             estado atual (overwrite), então nunca trava nem enfileira. */

          let transitionTl: gsap.core.Timeline | null = null

          const applyIndex = (index: number) => {
            const from = currentIndexRef.current
            if (index === from) return
            currentIndexRef.current = index
            hideHint()

            const dir  = index > from ? 1 : -1
            const next = PRODUCTS[index]

            transitionTl?.kill()
            const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
            transitionTl = tl

            // Fundo: anima as CSS vars direto (parte do valor atual, sem saltos)
            tl.to(root, {
              '--pcs-base':   next.base,
              '--pcs-mid':    next.mid,
              '--pcs-accent': next.accent,
              duration: 0.9,
              ease: 'power2.inOut',
            }, 0)

            // Spotlight: dim rápido, volta devagar
            tl.to(spotlightRef.current,       { opacity: 0.2,  duration: 0.15, ease: 'power2.in'  }, 0)
              .to(spotlightRef.current,       { opacity: 0.5,  duration: 0.35, ease: 'power2.out' }, 0.4)
              .to(mobileSpotlightRef.current, { opacity: 0.1,  duration: 0.15, ease: 'power2.in'  }, 0)
              .to(mobileSpotlightRef.current, { opacity: 0.85, duration: 0.35, ease: 'power2.out' }, 0.4)

            // Carrossel de frascos
            bottles.forEach((bottle, i) => {
              tl.to(bottle, {
                ...getRoleProps(getRole(i, index), isMobile),
                duration: isMotion ? 0.65 : 0.4,
                ease: 'power2.inOut',
              }, 0)
            })

            // Painéis fora da troca ficam ocultos (scroll rápido pula índices)
            products.forEach((el, i) => {
              if (i === index || i === from) return
              const p = parts(el)
              tl.set([p.text, ...p.stats], { autoAlpha: 0 }, 0)
            })

            const curParts  = parts(products[from])
            const nextParts = parts(products[index])

            if (isMotion) {
              // Saída do painel atual (direção acompanha o scroll)
              tl.to(curParts.text,  { autoAlpha: 0, x: -40 * dir, duration: 0.45, ease: 'power2.in' }, 0)
                .to(curParts.stats, { autoAlpha: 0, x: 40 * dir,  stagger: 0.04, duration: 0.45, ease: 'power2.in' }, 0)

              // Entrada do próximo painel
              tl.fromTo(
                nextParts.text,
                { autoAlpha: 0, x: 45 * dir },
                { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out' },
                0.3,
              ).fromTo(
                nextParts.stats,
                { autoAlpha: 0, x: -45 * dir },
                { autoAlpha: 1, x: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out' },
                0.3,
              )
            } else {
              // Reduced motion: crossfade simples
              tl.to([curParts.text, ...curParts.stats], { autoAlpha: 0, duration: 0.4 }, 0)
              tl.fromTo(
                [nextParts.text, ...nextParts.stats],
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.4 },
                0.3,
              )
            }

            // Dot ativo (cor via var(--pcs-accent), transição no CSS)
            dots.forEach((d, i) => d.classList.toggle('is-active', i === index))
          }

          /* ── Pin dirigido pelo scroll nativo ───────────────────────
             Sem Observer nem preventDefault: o scroll (Lenis/touch)
             segue livre e o progresso do pin decide qual produto está
             ativo. O usuário nunca fica preso — pode atravessar a
             seção na velocidade que quiser. */

          const pinTrigger = ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: `+=${(COUNT - 1) * 100}%`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const idx = Math.round(self.progress * (COUNT - 1))
              if (idx !== currentIndexRef.current) applyIndex(idx)
            },
          })

          /* ── Navegação programática (dots, teclado, pular) ──────── */

          const indexToY = (i: number) =>
            pinTrigger.start + ((pinTrigger.end - pinTrigger.start) * i) / (COUNT - 1)

          const scrollToY = (y: number, duration = 0.8) => {
            const l = lenisRef.current
            if (l) l.scrollTo(y, { duration })
            else window.scrollTo({ top: y, behavior: 'smooth' })
          }

          const goToIndex = (i: number) => {
            if (i < 0 || i >= COUNT) return
            hideHint()
            scrollToY(indexToY(i), 0.8)
          }
          goToIndexRef.current = goToIndex

          skipRef.current = () => {
            hideHint()
            scrollToY(pinTrigger.end + window.innerHeight, 1.1)
          }

          // Snap suave: parou de rolar dentro da seção → assenta no produto
          // mais próximo (via Lenis, sem brigar com o smooth scroll)
          const onScrollEnd = () => {
            if (!pinTrigger.isActive) return
            const target = indexToY(currentIndexRef.current)
            if (Math.abs(pinTrigger.scroll() - target) > 4) scrollToY(target, 0.55)
          }
          ScrollTrigger.addEventListener('scrollEnd', onScrollEnd)

          // Teclado
          const handleKeyDown = (e: KeyboardEvent) => {
            if (!pinTrigger.isActive) return
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
              e.preventDefault()
              if (currentIndexRef.current < COUNT - 1) goToIndex(currentIndexRef.current + 1)
              else skipRef.current?.()
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
              if (currentIndexRef.current > 0) {
                e.preventDefault()
                goToIndex(currentIndexRef.current - 1)
              }
            }
          }
          window.addEventListener('keydown', handleKeyDown)

          return () => {
            window.removeEventListener('keydown', handleKeyDown)
            ScrollTrigger.removeEventListener('scrollEnd', onScrollEnd)
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="pcs-bottle" src={product.image} alt={name} draggable={false} />
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
                          style={{
                            borderColor: `${product.accent}66`,
                            color: product.accent,
                          }}
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
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

      {/* Navegação por produto (dots) */}
      <nav className="pcs-nav" aria-label={t('subtitle')}>
        {PRODUCTS.map((product, i) => (
          <button
            key={product.name}
            type="button"
            className={`pcs-dot${i === 0 ? ' is-active' : ''}`}
            aria-label={t(`products.${i}.name`)}
            onClick={() => goToIndexRef.current?.(i)}
            ref={el => { dotsRef.current[i] = el }}
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

/* ══════════════════════════════════════════════════════════════════
   Versão acessível (prefers-reduced-motion)
   ══════════════════════════════════════════════════════════════════ */

function ShowcaseReduced({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-[100rem] min-[2000px]:max-w-[120rem] px-6 lg:px-8">
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
              <span className="text-xs font-semibold" style={{ color: product.accent }}>{t('hintReduced')} →</span>
            </Link>
          )})}
        </div>
      </div>
    </section>
  )
}
