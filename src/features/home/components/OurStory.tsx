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

import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal } from '@/features/animation/charReveal'
import { EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

type Founder = {
  key: string
  /** Centro horizontal da pessoa na foto, em % da largura (medido na silhueta). */
  x: number
  /** Topo da cabeça, em % da altura da foto — é onde a linha conectora termina. */
  headTop: number
  /**
   * Faixa vertical do rótulo. As quatro pessoas ficam próximas demais para os
   * nomes caberem lado a lado numa linha só, então os rótulos alternam entre
   * duas faixas: 1ª e 3ª pessoa em cima, 2ª e 4ª logo abaixo.
   */
  tier: 'high' | 'low'
}

const FOUNDERS: Founder[] = [
  { key: 'fabio', x: 23.2, headTop: 15.6, tier: 'high' },
  { key: 'julio_fundador', x: 37.6, headTop: 25.2, tier: 'low' },
  { key: 'julio_comercial', x: 56.2, headTop: 9.3, tier: 'high' },
  { key: 'joao_vitor', x: 77.8, headTop: 6.7, tier: 'low' },
]

/** Topo de cada faixa, em % da altura da foto (negativo = acima da imagem). */
const TIER_TOP: Record<Founder['tier'], number> = { high: -32, low: -15 }

/**
 * Geometria da inclinação 3D do card (entrada e saída).
 *
 * Os dois tamanhos rodam a MESMA animação; só a geometria muda, porque o card
 * tem proporção muito diferente em cada um: no desktop ele é 1296x902 (mais
 * largo que alto), no mobile 351x948 — quase três vezes mais alto que largo.
 * Girando pelo topo, é a ALTURA que joga a base do card para longe em z, então
 * a mesma perspectiva do desktop distorce muito mais no mobile.
 *
 * O limite não é a caixa do card inteiro estourar a tela — no desktop ela
 * estoura 286px de cada lado e ninguém vê, porque no pico da entrada a parte
 * larga está bem abaixo da dobra (e o `overflow-x: clip` do html corta). O que
 * importa é o card nunca ENCOSTAR na borda da tela dentro da área visível.
 *
 * Estes valores são o ponto em que isso ainda não acontece, medido com
 * varredura de borda (elementFromPoint) ao longo de toda a faixa de scroll em
 * 320, 360, 390, 412, 430, paisagem e tablet: folga mínima de 8px. Com a
 * perspectiva do desktop crua, as telas ALTAS (430x932, tablet) encostam — é
 * nelas que mais card aparece de uma vez. Não adianta estreitar o card para
 * ganhar espaço: estreitar aumenta a altura (numa tela de 320px, 90% de
 * largura dá 981px de altura e 74% dá 1112px), e altura é justamente o que
 * causa a distorção.
 */
const TILT = {
  desktop: { perspective: 1000, rotate: 20, scale: 1.05 },
  mobile: { perspective: 1300, rotate: 17, scale: 1.04 },
} as const

export function OurStory() {
  const t = useTranslations('ourStory')
  const reduced = useReducedMotion()
  const [isDesktop, setIsDesktop] = useState(false)
  const tilt = isDesktop ? TILT.desktop : TILT.mobile

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

      // Título em linhas mascaradas (mesma voz do Hero/PhaseLayout). O split
      // roda uma única vez aqui fora das timelines — re-tригgar é só reanimar
      // yPercent dos spans já existentes, sem custo de novo split a cada ciclo.
      // `autoRevert: false`: as timelines de entrada e saída são pausadas e
      // reiniciadas pelo ScrollTrigger, então os alvos precisam sobreviver ao
      // fim da primeira passagem.
      const reveal = createCharReveal(title, { autoRevert: false })

      // ── Estado inicial ──────────────────────────────────────────────
      gsap.set(photo, { y: 24, opacity: 0 })
      gsap.set(title, { opacity: 0 })
      reveal?.hide()
      gsap.set(body, { y: 12, opacity: 0 })
      gsap.set(cta, { y: 12, opacity: 0 })
      gsap.set(stats, { y: 10, opacity: 0 })
      if (isDesktop) {
        gsap.set(labels, { opacity: 0 })
        gsap.set(vLines, { scaleY: 0, transformOrigin: 'top center' })
      }

      // ── Entrada: rápida e limpa ─────────────────────────────────────
      const entry = gsap.timeline({ paused: true, defaults: { ease: EASE.reveal } })
      entry.to(photo, { y: 0, opacity: 1, duration: 0.75 }, 0)
      if (isDesktop) {
        entry.to(labels, { opacity: 1, duration: 0.4, stagger: 0.08 }, 0.15)
        entry.to(vLines, { scaleY: 1, duration: 0.45, stagger: 0.08 }, 0.25)
      }
      entry.set(title, { opacity: 1 }, 0.15)
      reveal?.playIn(entry, 0.15)
      entry.to(body, { y: 0, opacity: 1, duration: 0.5 }, 0.35)
      entry.to(cta, { y: 0, opacity: 1, duration: 0.45 }, 0.45)
      entry.to(stats, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06 }, 0.5)

      // ── Saída: fade simples, sem y para evitar "giro" pesado ────────
      const exit = gsap.timeline({ paused: true, defaults: { ease: 'power2.in' } })
      exit.to([title, body, cta, stats], { opacity: 0, duration: 0.25 }, 0)
      if (reveal) exit.set(reveal.chars, reveal.hidden, 0.25)
      if (isDesktop) exit.to(labels, { opacity: 0, duration: 0.2 }, 0)
      exit.to(photo, { y: -10, opacity: 0, duration: 0.3 }, 0.05)

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        end: 'bottom top',
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

      // ── Inclinação 3D do card (entrada e saída) ─────────────────────
      // Roda nos dois tamanhos; a geometria vem de TILT (ver comentário lá).
      const { rotate, scale: startScale } = tilt

      const enterTilt = gsap.fromTo(
        card,
        { rotateX: rotate, scale: startScale },
        {
          rotateX: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top 10%',
            scrub: 0.5,
          },
        },
      )

      const leaveTilt = gsap.fromTo(
        card,
        { rotateX: 0, scale: 1 },
        {
          rotateX: -rotate,
          scale: startScale,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'bottom 90%',
            end: 'bottom top',
            scrub: 0.5,
          },
        },
      )

      const tiltTriggers: ScrollTrigger[] = [
        enterTilt.scrollTrigger as ScrollTrigger,
        leaveTilt.scrollTrigger as ScrollTrigger,
      ]

      return () => {
        trigger.kill()
        entry.kill()
        exit.kill()
        tiltTriggers.forEach((t) => t.kill())
        reveal?.revert()
      }
    },
    { dependencies: [reduced, isDesktop], scope: sectionRef },
  )

  return (
    <div
      ref={sectionRef}
      className="w-full relative z-10 py-10 md:py-20"
      style={{
        // `overflow-anchor: none`: o browser não pode "corrigir" o scroll por
        // conta própria dentro desta seção. A ancoragem automática, quando algo
        // acima muda de altura, mexe no scrollTop sem aviso — e é justamente
        // isso que aparecia como salto seco no mobile.
        overflowAnchor: 'none',
        perspective: `${tilt.perspective}px`,
      }}
    >
      {/* ── Fundo branco com bordas superior e inferior esfumaçadas (blur) ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex flex-col">
        {/* Topo esfumaçado */}
        <div
          className="h-[6rem] w-full shrink-0 bg-white lg:bg-transparent lg:bg-gradient-to-b lg:from-white/0 lg:to-white lg:backdrop-blur-md"
          style={isDesktop ? {
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
            maskImage: 'linear-gradient(to bottom, transparent, black)',
          } : undefined}
        />
        {/* Meio sólido */}
        <div className="flex-1 w-full bg-white" />
        {/* Base esfumaçada */}
        <div
          className="h-[6rem] w-full shrink-0 bg-white lg:bg-transparent lg:bg-gradient-to-t lg:from-white/0 lg:to-white lg:backdrop-blur-md"
          style={isDesktop ? {
            WebkitMaskImage: 'linear-gradient(to top, transparent, black)',
            maskImage: 'linear-gradient(to top, transparent, black)',
          } : undefined}
        />
      </div>

      <section
        ref={cardRef}
        className="relative overflow-hidden rounded-[2.5rem] w-[90%] min-[1600px]:w-[95%] max-w-[100rem] min-[2000px]:max-w-[120rem] mx-auto border border-black/[0.06] bg-white isolate transform-gpu"
        style={{
          transformOrigin: 'top center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Abaixo de 1600px (notebooks) o card afina e a coluna da foto ganha
            peso — assim a família cresce mesmo com o card menor. O padding
            lateral não é mais forçado aqui: o Container já entrega a escala
            enxuta nessa faixa (ver doc do Container). */}
        {/* min-h em `--vh-stable`, não em 100dvh: hoje o conteúdo do mobile já
            passa da altura da tela e o mínimo nem entra em jogo, mas num
            aparelho maior (ou em paisagem) ele entraria — e aí a seção mudaria
            de altura toda vez que a barra do navegador recolhesse. */}
        <Container className="grid min-h-[var(--vh-stable,100dvh)] grid-cols-1 items-center gap-2xl py-xl lg:py-2xl xl:py-3xl lg:grid-cols-[1.35fr_1fr] lg:gap-xl min-[1600px]:grid-cols-[1.15fr_1fr] min-[1600px]:gap-3xl">
          {/* ── Coluna esquerda: família ──────────────────────────────── */}
          {/* pt no desktop: os rótulos ficam ACIMA da foto (top negativo) e
              precisam desse respiro, senão o card (overflow-hidden) os corta.
              Em %: padding-top percentual é medido sobre a LARGURA da coluna, e
              a foto é 16:9 — logo TIER_TOP (32% da altura) equivale a 18% da
              largura. Assim o respiro acompanha a foto em qualquer tela. */}
          <div ref={photoRef} className="w-full lg:pt-[19%]">
            <div className="relative mx-auto aspect-[16/9] w-full max-w-[34rem] lg:max-w-none">
              <Image
                src="/heritage/familia-matino.webp"
                alt={t('familyAlt')}
                fill
                sizes="(min-width: 1024px) 55vw, 90vw"
                className="relative z-10 object-contain object-bottom"
              />

              {/* Rótulos + linhas conectoras (só desktop) */}
              <div
                ref={labelsRootRef}
                className="pointer-events-none absolute inset-0 z-30 hidden lg:block"
              >
                {FOUNDERS.map((f) => (
                  <FounderLabel
                    key={f.key}
                    x={f.x}
                    headTop={f.headTop}
                    tier={f.tier}
                    name={t(`founders.${f.key}.name`)}
                    role={t(`founders.${f.key}.role`)}
                  />
                ))}
              </div>
            </div>

            {/* Mobile: os rótulos com linha não cabem, então os nomes viram lista */}
            <ul className="mt-lg grid grid-cols-2 gap-x-md gap-y-sm lg:hidden">
              {FOUNDERS.map((f) => (
                <li key={f.key} className="flex flex-col border-l-2 border-primary/20 pl-sm">
                  <span className="text-sm font-bold leading-tight text-primary">
                    {t(`founders.${f.key}.name`)}
                  </span>
                  <span className="text-body-regular text-xs leading-tight text-foreground/55">
                    {t(`founders.${f.key}.role`)}
                  </span>
                </li>
              ))}
            </ul>
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
              className="font-black uppercase leading-[0.98] tracking-tight text-[clamp(1.75rem,3.4vw,2.75rem)] min-[1600px]:text-[clamp(2.25rem,4.6vw,4rem)]"
            >
              <span className="block text-foreground">{t('titleDark')}</span>
              <span className="text-highlight block text-primary">{t('titleGreen')}</span>
            </h2>

            <div ref={bodyRef} className="mt-lg lg:mt-xl border-l-2 border-primary/20 pl-lg">
              <p className="text-subtitle max-w-[30rem] text-sm text-foreground/75 lg:text-[0.9375rem] min-[1600px]:max-w-[34rem] min-[1600px]:text-lg">
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
              className="mt-xl lg:mt-2xl grid w-full grid-cols-1 gap-md md:grid-cols-3 md:gap-x-sm md:gap-y-lg min-[1600px]:gap-x-xs"
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

/**
 * O bloco é ancorado em cima (faixa do rótulo) e embaixo (topo da cabeça da
 * pessoa). Assim a linha conectora é só um `flex-1` entre os dois: ela se
 * estica sozinha para o comprimento certo em qualquer largura, sem precisar
 * calcular altura em px para cada pessoa.
 */
function FounderLabel({
  x,
  headTop,
  tier,
  name,
  role,
}: {
  x: number
  headTop: number
  tier: Founder['tier']
  name: string
  role: string
}) {
  return (
    <div
      data-label
      className="absolute flex w-[9.5rem] flex-col items-center text-center xl:w-[11.5rem]"
      style={{
        left: `${x}%`,
        top: `${TIER_TOP[tier]}%`,
        bottom: `${100 - headTop}%`,
        transform: 'translateX(-50%)',
      }}
    >
      <span className="text-sm font-bold leading-tight text-primary xl:text-[0.9375rem]">
        {name}
      </span>
      <span className="text-body-regular mt-[2px] text-xs leading-tight text-foreground/55">
        {role}
      </span>

      {/* Linha conectora: preenche o vão até a cabeça e termina num nó */}
      <span
        data-vline
        aria-hidden
        className="mt-sm block w-px min-h-0 flex-1 bg-gradient-to-b from-primary/45 to-primary/15"
      />
      {/* mb: afasta o nó da cabeça — sem isso ele encosta no cabelo */}
      <span
        aria-hidden
        className="mb-[3px] block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
      />
    </div>
  )
}

/* ── Mini-stats do rodapé da coluna direita ────────────────────────── */

type StatIcon = 'users' | 'sprout' | 'network'

function Stat({ icon, label }: { icon: StatIcon; label: string }) {
  return (
    <div data-stat className="flex w-full items-center gap-xs">
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-primary/25 text-primary">
        <StatIconGlyph name={icon} className="h-3.5 w-3.5" />
      </span>
      <span className="text-body-regular text-balance text-sm leading-snug text-foreground/90 md:text-[0.8125rem] min-[1600px]:text-sm">
        {label}
      </span>
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
