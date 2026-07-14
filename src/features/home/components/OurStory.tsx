'use client'

/**
 * "NOSSA HISTÓRIA" — vem logo depois da seção branca de texto centralizado da
 * jornada (fase GOTA). Família fundadora (foto) à esquerda, conteúdo à direita.
 * Entrada e saída em timelines separadas (eases diferentes, doc do briefing):
 * power3.out ao entrar na viewport, power2.in ao sair — para dar continuidade
 * suave com a seção anterior e a próxima, sem corte seco.
 */
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

type FounderAlign = 'left' | 'center' | 'right'

type Founder = {
  key: string
  align: FounderAlign
  /** Posição horizontal do rótulo, em % da largura da foto. */
  x: number
  /** Altura da linha conectora até o ombro/cabeça, em % da altura da foto. */
  lineHeight: number
}

const FOUNDERS: Founder[] = [
  { key: 'fabio', align: 'left', x: 12, lineHeight: 24 },
  { key: 'julio_fundador', align: 'center', x: 50, lineHeight: 12 },
  { key: 'julio_comercial', align: 'right', x: 88, lineHeight: 24 },
]

export function OurStory() {
  const t = useTranslations('ourStory')
  const reduced = useReducedMotion()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const watermarkRef = useRef<HTMLDivElement>(null)
  const labelsRootRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const statsRootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced) return
      const section = sectionRef.current
      const card = cardRef.current
      if (!section || !card) return

      const photo = photoRef.current
      const watermark = watermarkRef.current
      const title = titleRef.current
      const body = bodyRef.current
      const cta = ctaRef.current
      const stats = statsRootRef.current
        ? gsap.utils.toArray<HTMLElement>('[data-stat]', statsRootRef.current)
        : []
      const labels =
        isDesktop && labelsRootRef.current
          ? gsap.utils.toArray<HTMLElement>('[data-label]', labelsRootRef.current)
          : []
      const vLines =
        isDesktop && labelsRootRef.current
          ? gsap.utils.toArray<HTMLElement>('[data-vline]', labelsRootRef.current)
          : []
      const hLines =
        isDesktop && labelsRootRef.current
          ? gsap.utils.toArray<HTMLElement>('[data-hline]', labelsRootRef.current)
          : []

      // ── Watermark: parallax contínuo por scrub ──────────────────────
      if (watermark) {
        gsap.to(watermark, {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      }

      // Título em linhas mascaradas (mesma voz do Hero/PhaseLayout). O split
      // roda uma única vez aqui fora das timelines — re-tригgar é só reanimar
      // yPercent dos spans já existentes, sem custo de novo split a cada ciclo.
      const titleSplit = title ? new SplitText(title, { type: 'chars,lines' }) : null
      const titleChars = titleSplit ? titleSplit.chars : title ? [title] : []

      // ── Estado inicial ──────────────────────────────────────────────
      gsap.set(photo, { y: 24, opacity: 0 })
      gsap.set(title, { opacity: 0 })
      gsap.set(titleChars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      gsap.set(body, { y: 12, opacity: 0 })
      gsap.set(cta, { y: 12, opacity: 0 })
      gsap.set(stats, { y: 10, opacity: 0 })
      if (isDesktop) {
        gsap.set(labels, { opacity: 0 })
        gsap.set(vLines, { scaleY: 0 })
        gsap.set(hLines, { scaleX: 0 })
      }

      // ── Entrada: rápida e limpa ─────────────────────────────────────
      const entry = gsap.timeline({ paused: true, defaults: { ease: EASE.reveal } })
      entry.to(photo, { y: 0, opacity: 1, duration: 0.75 }, 0)
      if (isDesktop) {
        entry.to(vLines, { scaleY: 1, duration: 0.4, stagger: 0.08 }, 0.1)
        entry.to(hLines, { scaleX: 1, duration: 0.22, stagger: 0.08 }, 0.35)
        entry.to(labels, { opacity: 1, duration: 0.4, stagger: 0.08 }, 0.25)
      }
      entry.set(title, { opacity: 1 }, 0.15)
      entry.to(
        titleChars,
        { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char },
        0.15,
      )
      entry.to(body, { y: 0, opacity: 1, duration: 0.5 }, 0.35)
      entry.to(cta, { y: 0, opacity: 1, duration: 0.45 }, 0.45)
      entry.to(stats, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06 }, 0.5)

      // ── Saída: fade simples, sem y para evitar "giro" pesado ────────
      const exit = gsap.timeline({ paused: true, defaults: { ease: 'power2.in' } })
      exit.to([title, body, cta, stats], { opacity: 0, duration: 0.25 }, 0)
      exit.set(titleChars, { x: 20, opacity: 0, filter: 'blur(10px)' }, 0.25)
      if (isDesktop) exit.to(labels, { opacity: 0, duration: 0.2 }, 0)
      exit.to(photo, { y: -10, opacity: 0, duration: 0.3 }, 0.05)

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        end: 'bottom 20%',
        onEnter: () => {
          exit.pause(0)
          entry.restart()
        },
        onEnterBack: () => {
          exit.pause(0)
          entry.restart()
        },
        onLeave: () => {
          entry.pause(0)
          exit.restart()
        },
        onLeaveBack: () => {
          entry.pause(0)
          exit.restart()
        },
      })

      // ── Container Scroll 3D Effect ──────────────────────────────────
      const isMobile = window.innerWidth <= 768
      const startScale = isMobile ? 0.8 : 1.05

      gsap.fromTo(
        card,
        {
          rotateX: 20,
          scale: startScale,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0, 0, 0, 0.1)',
        },
        {
          rotateX: 0,
          scale: 1,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0, 0, 0, 0.1)',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top 10%',
            scrub: 0.5,
          },
        },
      )

      gsap.fromTo(
        card,
        {
          rotateX: 0,
          scale: 1,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0, 0, 0, 0.1)',
        },
        {
          rotateX: -20,
          scale: startScale,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0, 0, 0, 0.1)',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'bottom 90%',
            end: 'bottom top',
            scrub: 0.5,
          },
        },
      )

      return () => {
        trigger.kill()
        entry.kill()
        exit.kill()
        titleSplit?.revert()
      }
    },
    { dependencies: [reduced, isDesktop], scope: sectionRef },
  )

  return (
    <div
      ref={sectionRef}
      className="w-full relative z-10 py-10 md:py-20"
      style={{ perspective: '1000px' }}
    >
      {/* ── Fundo branco com bordas superior e inferior esfumaçadas (blur) ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex flex-col">
        {/* Topo esfumaçado */}
        <div
          className="h-[6rem] w-full shrink-0 bg-gradient-to-b from-white/0 to-white backdrop-blur-md"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
            maskImage: 'linear-gradient(to bottom, transparent, black)',
          }}
        />
        {/* Meio sólido */}
        <div className="flex-1 w-full bg-white" />
        {/* Base esfumaçada */}
        <div
          className="h-[6rem] w-full shrink-0 bg-gradient-to-t from-white/0 to-white backdrop-blur-md"
          style={{
            WebkitMaskImage: 'linear-gradient(to top, transparent, black)',
            maskImage: 'linear-gradient(to top, transparent, black)',
          }}
        />
      </div>

      <section
        ref={cardRef}
        className="relative overflow-hidden rounded-[2.5rem] w-[95%] max-w-[100rem] min-[2000px]:max-w-[120rem] mx-auto border border-black/[0.06] bg-gradient-to-br from-black/[0.01] to-black/[0.04] backdrop-blur-xl"
        style={{ transformOrigin: 'top center' }}
      >
        <Container className="grid min-h-screen grid-cols-1 items-center gap-2xl py-xl lg:py-2xl xl:py-3xl lg:grid-cols-2 lg:gap-xl xl:gap-4xl">
          {/* ── Coluna esquerda: família ──────────────────────────────── */}
          <div
            ref={photoRef}
            className="relative mx-auto aspect-[1402/974] w-full max-w-[40rem]"
            style={{
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 34%)',
              maskImage: 'linear-gradient(to top, transparent 0%, black 34%)',
            }}
          >
            {/* Watermark gigante atrás da foto */}
            <div
              ref={watermarkRef}
              aria-hidden
              className="pointer-events-none absolute inset-x-[-10%] bottom-0 z-0 select-none text-center font-black uppercase leading-none text-foreground/[0.05]"
              style={{ fontSize: 'clamp(3.5rem, 13vw, 8rem)' }}
            >
              JUMA AGRO
            </div>

            <Image
              src="/heritage/fundador-e-filhos.png"
              alt={t('familyAlt')}
              fill
              sizes="(min-width: 1024px) 40rem, 90vw"
              className="relative z-10 object-contain object-bottom"
              priority
            />

            {/* Rótulos + linhas conectoras (só desktop) */}
            <div
              ref={labelsRootRef}
              className="pointer-events-none absolute inset-0 z-30 hidden lg:block"
            >
              {FOUNDERS.map((f) => (
                <FounderLabel
                  key={f.key}
                  align={f.align}
                  x={f.x}
                  lineHeight={f.lineHeight}
                  name={t(`founders.${f.key}.name`)}
                  role={t(`founders.${f.key}.role`)}
                />
              ))}
            </div>
          </div>

          {/* ── Coluna direita: conteúdo ──────────────────────────────── */}
          <div className="flex flex-col items-start w-full">
            <span className="mb-md inline-flex items-center gap-sm">
              <span aria-hidden className="block h-px w-6 bg-primary" />
              <span className="text-eyebrow text-xs uppercase tracking-[0.18em] text-primary">
                {t('eyebrow')}
              </span>
            </span>

            <h2
              ref={titleRef}
              className="font-black uppercase leading-[0.98] tracking-tight text-[clamp(2rem,3.8vw,3.25rem)] xl:text-[clamp(2.25rem,4.6vw,4rem)]"
            >
              <span className="block text-foreground">{t('titleDark')}</span>
              <span className="text-highlight block text-primary">{t('titleGreen')}</span>
            </h2>

            <div ref={bodyRef} className="mt-lg lg:mt-xl border-l-2 border-primary/20 pl-lg">
              <p className="text-subtitle max-w-[34rem] text-base text-foreground/75 lg:text-base xl:text-lg">
                {t('body')}
              </p>
            </div>

            <div
              ref={ctaRef}
              className="mt-lg lg:mt-xl inline-flex items-center gap-sm rounded-full border border-primary/30 px-lg py-sm"
            >
              <SparkleIcon className="h-4 w-4 text-primary" />
              <span className="text-body-regular text-xs font-bold uppercase tracking-wide text-primary">
                {t('cta')}
              </span>
            </div>

            <div
              ref={statsRootRef}
              className="mt-xl lg:mt-2xl grid gap-md grid-cols-1 md:grid-cols-3 xl:gap-lg w-full"
            >
              <Stat icon="users" label={t('stat1')} />
              <Stat icon="sprout" label={t('stat2')} />
              <Stat icon="network" label={t('stat3')} />
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

/* ── Rótulo + linha conectora de um fundador ───────────────────────── */

function FounderLabel({
  align,
  x,
  lineHeight,
  name,
  role,
}: {
  align: FounderAlign
  x: number
  lineHeight: number
  name: string
  role: string
}) {
  const isLeft = align === 'left'
  const isRight = align === 'right'
  const isCenter = align === 'center'

  const style = isLeft
    ? { left: `${x}%` }
    : isRight
      ? { right: `${100 - x}%`, left: 'auto' }
      : { left: `${x}%`, transform: 'translateX(-50%)' }

  return (
    <div
      data-label
      className={`absolute top-0 flex flex-col ${isRight ? 'items-end text-right' : isCenter ? 'items-center text-center' : 'items-start text-left'}`}
      style={style}
    >
      <span className="whitespace-nowrap text-sm font-bold text-primary">{name}</span>
      <span className="text-body-regular whitespace-nowrap text-xs text-foreground/55">{role}</span>

      {/* Linha conectora: desce do rótulo e dobra em direção à pessoa, terminando num nó */}
      <div className="relative mt-sm" style={{ height: lineHeight, width: isCenter ? 1 : 48 }}>
        <span
          data-vline
          aria-hidden
          className={`absolute top-0 block w-px bg-primary/40 ${isLeft ? 'left-0' : isRight ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}
          style={{ height: '100%', transformOrigin: 'top' }}
        />
        {!isCenter && (
          <span
            data-hline
            aria-hidden
            className={`absolute bottom-0 block h-px bg-primary/40 ${isLeft ? 'left-0' : isRight ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}
            style={{ width: '100%', transformOrigin: isLeft ? 'left' : 'right' }}
          />
        )}
        <span
          aria-hidden
          className={`absolute bottom-0 block h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary ${isLeft ? 'right-0' : isRight ? 'left-0' : 'left-1/2 -translate-x-1/2'}`}
        />
      </div>
    </div>
  )
}

/* ── Mini-stats do rodapé da coluna direita ────────────────────────── */

type StatIcon = 'users' | 'sprout' | 'network'

function Stat({ icon, label }: { icon: StatIcon; label: string }) {
  return (
    <div data-stat className="flex w-full items-center gap-sm">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-primary/25 text-primary">
        <StatIconGlyph name={icon} className="h-4 w-4" />
      </span>
      <span className="text-body-regular text-sm leading-snug text-foreground/90">{label}</span>
    </div>
  )
}

function StatIconGlyph({ name, ...props }: { name: StatIcon } & React.SVGProps<SVGSVGElement>) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }
  if (name === 'sprout')
    return (
      <svg {...common}>
        <path d="M12 21V10" />
        <path d="M12 12c-4 0-6-2-6-6 4 0 6 2 6 6Z" />
        <path d="M12 9c0-3.5 2-5.5 6-5.5 0 3.5-2 5.5-6 5.5Z" />
      </svg>
    )
  if (name === 'network')
    return (
      <svg {...common}>
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="6" r="2" />
        <circle cx="12" cy="18" r="2" />
        <path d="M6.7 7.3 10.4 16.6" />
        <path d="M17.3 7.3 13.6 16.6" />
        <path d="M7 6h10" />
      </svg>
    )
  return (
    <svg {...common}>
      <circle cx="9" cy="7" r="3" />
      <path d="M2 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
      <path d="M16.5 4.5c1.5.3 2.5 1.6 2.5 3.1 0 1.5-1 2.8-2.5 3.1" />
      <path d="M22 20c0-2.6-1.9-4.5-4.5-5.2" />
    </svg>
  )
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}
