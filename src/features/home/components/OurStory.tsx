'use client'

/**
 * "NOSSA HISTÓRIA" — vem logo depois da seção branca de texto centralizado da
 * jornada (fase GOTA). Card único, conteúdo centrado: chapéu, título, texto,
 * selo e as três mini-stats no rodapé. Entra uma vez, na primeira vez que a
 * seção aparece; a inclinação 3D do card continua acompanhando o scroll
 * (`enterTilt`/`leaveTilt`, mais abaixo), essa sim contínua, ligada à posição.
 */
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal } from '@/features/animation/charReveal'
import { EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

/**
 * Geometria da inclinação 3D do card (entrada e saída).
 *
 * Os dois tamanhos rodam a MESMA animação; só a geometria muda, porque o card
 * tem proporção muito diferente em cada um: no desktop é bem mais largo que
 * alto, no mobile a coluna de texto o deixa mais alto que largo. Girando pelo
 * topo, é a ALTURA que joga a base do card para longe em z, então a mesma
 * perspectiva do desktop distorce mais no mobile.
 *
 * O limite não é a caixa do card inteiro estourar a tela — no desktop ela
 * estoura bastante de cada lado e ninguém vê, porque no pico da entrada a
 * parte larga está bem abaixo da dobra (e o `overflow-x: clip` do html corta).
 * O que importa é o card nunca ENCOSTAR na borda da tela dentro da área
 * visível.
 *
 * Estes valores vieram de varredura de borda (elementFromPoint) ao longo de
 * toda a faixa de scroll em 320, 360, 390, 412, 430, paisagem e tablet, feita
 * na versão anterior desta seção — que trazia a foto da família e era bem mais
 * alta. O card de agora é mais baixo em qualquer tela, e menos altura é menos
 * deslocamento em z: a folga só aumentou.
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
  const eyebrowRef = useRef<HTMLSpanElement>(null)
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

      const eyebrow = eyebrowRef.current
      const title = titleRef.current
      const body = bodyRef.current
      const cta = ctaRef.current
      const stats = statsRootRef.current
        ? gsap.utils.toArray<HTMLElement>('[data-stat]', statsRootRef.current)
        : []

      // Título em linhas mascaradas (mesma voz do Hero/PhaseLayout). Entra
      // uma vez só (ver `trigger`, abaixo), então os spans do split podem ser
      // desfeitos normalmente ao fim da cascata — não precisam sobreviver a
      // uma reentrada que não existe mais.
      const reveal = createCharReveal(title)

      // ── Estado inicial ──────────────────────────────────────────────
      gsap.set(eyebrow, { y: 10, opacity: 0 })
      gsap.set(title, { opacity: 0 })
      reveal?.hide()
      gsap.set(body, { y: 12, opacity: 0 })
      gsap.set(cta, { y: 12, opacity: 0 })
      gsap.set(stats, { y: 10, opacity: 0 })

      // ── Entrada: rápida e limpa ─────────────────────────────────────
      const entry = gsap.timeline({ paused: true, defaults: { ease: EASE.reveal } })
      entry.to(eyebrow, { y: 0, opacity: 1, duration: 0.45 }, 0)
      entry.set(title, { opacity: 1 }, 0.15)
      reveal?.playIn(entry, 0.15)
      entry.to(body, { y: 0, opacity: 1, duration: 0.5 }, 0.35)
      entry.to(cta, { y: 0, opacity: 1, duration: 0.45 }, 0.45)
      entry.to(stats, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06 }, 0.5)

      /* Entra uma vez só, na primeira vez que a seção aparece — igual ao
         resto do site. Sair e voltar a rolar por cima não reanima nada; a
         versão anterior tinha uma timeline de saída própria (fade ao sair,
         reentrada completa ao voltar), e isso lia como o título "piscando"
         a cada pequena ida-e-volta de scroll. */
      let played = false
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        end: 'bottom top',
        onEnter: () => {
          if (played) return
          played = true
          entry.restart()
        },
        onEnterBack: () => {
          if (played) return
          played = true
          entry.restart()
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
        {/* Sem a foto da família o card não tem mais duas colunas: o conteúdo
            é só texto e lê melhor centrado, numa medida de leitura fixa.
            O `min-h` é em rem, não em dvh — a altura do card não pode mudar
            quando a barra do navegador recolhe no mobile. */}
        <Container className="flex min-h-[28rem] flex-col items-center justify-center py-3xl text-center lg:min-h-[34rem] lg:py-4xl">
          <span ref={eyebrowRef} className="inline-flex items-center gap-sm">
            <span aria-hidden className="block h-px w-6 bg-primary" />
            <span className="text-eyebrow text-xs uppercase tracking-[0.18em] text-primary">
              {t('eyebrow')}
            </span>
            <span aria-hidden className="block h-px w-6 bg-primary" />
          </span>

          <h2
            ref={titleRef}
            className="mt-lg max-w-[22ch] text-balance font-black uppercase leading-[0.98] tracking-tight text-[clamp(1.75rem,5.2vw,3rem)] min-[1600px]:text-[clamp(2.5rem,3.6vw,4rem)]"
          >
            <span className="block text-foreground">{t('titleDark')}</span>
            <span className="text-highlight block text-primary">{t('titleGreen')}</span>
          </h2>

          <div ref={bodyRef} className="mt-lg lg:mt-xl">
            <p className="text-subtitle mx-auto max-w-[44rem] text-pretty text-sm text-foreground/75 lg:text-base min-[1600px]:text-lg">
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

          {/* Rodapé de stats: separado do bloco de texto por um filete, com
              divisores entre as colunas a partir de md. No mobile vira lista
              — `w-fit` deixa o bloco só do tamanho do maior item, então ele
              fica centrado no card e os três ícones alinhados na mesma
              coluna, coisa que três linhas centradas uma a uma não dão. */}
          <div
            ref={statsRootRef}
            className="mt-xl w-full max-w-[56rem] border-t border-black/10 pt-xl lg:mt-2xl lg:pt-2xl"
          >
            <div className="mx-auto grid w-fit grid-cols-1 gap-lg md:w-full md:grid-cols-3 md:gap-0">
              <Stat icon="users" label={t('stat1')} />
              <Stat icon="sprout" label={t('stat2')} divider />
              <Stat icon="network" label={t('stat3')} divider />
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}

/* ── Mini-stats do rodapé ──────────────────────────────────────────── */

type StatIcon = 'users' | 'sprout' | 'network'

/** `divider`: filete à esquerda, só a partir de md (a 1ª coluna não tem). */
function Stat({ icon, label, divider }: { icon: StatIcon; label: string; divider?: boolean }) {
  return (
    <div
      data-stat
      className={`flex items-center gap-sm text-left md:flex-col md:justify-start md:gap-md md:px-lg md:text-center ${
        divider ? 'md:border-l md:border-black/10' : ''
      }`}
    >
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-primary/25 text-primary md:h-10 md:w-10">
        <StatIconGlyph name={icon} className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
