'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

export function Problem() {
  const t = useTranslations('problem')
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef     = useRef<HTMLDivElement>(null)
  const titleRef   = useRef<HTMLHeadingElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced) return

      const title = titleRef.current
      const pin   = pinRef.current
      const body  = bodyRef.current
      if (!title) return

      const isDesktop = window.innerWidth >= 1024

      if (isDesktop && pin) {
        /*
         * Desktop: Técnica "lâmpada por palavra".
         * A seção pina em top: top e o ScrollTrigger com scrub=0.8
         * drive o progress da timeline. Cada palavra parte de
         * opacity 0.08 e vai para 1 conforme o usuário desce.
         */
        const split = new SplitText(title, { type: 'words' })
        const words = split.words

        gsap.set(words, { opacity: 0.08 })

        // Distribui as palavras em 7 unidades de timeline
        const step = words.length > 1 ? 7 / (words.length - 1) : 7
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: '+=720',
            pin: true,
            scrub: 0.9,
          },
        })

        words.forEach((word, i) => {
          tl.to(word, { opacity: 1, duration: step * 0.9 }, i * step)
        })

        // Corpo: revela após o pin liberar (trigger proprio)
        if (body) {
          gsap.set(body, { y: 28, opacity: 0 })
          ScrollTrigger.create({
            trigger: body,
            start: 'top 82%',
            once: true,
            onEnter: () =>
              gsap.to(body, { y: 0, opacity: 1, duration: 0.9, ease: EASE.reveal }),
          })
        }

        return () => split.revert()

      } else {
        // Mobile / tablet: linha por linha com clip-path
        const split = new SplitText(title, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'overflow-hidden',
        })

        gsap.set(title, { opacity: 0 })
        gsap.set(split.lines, { yPercent: 108 })
        if (body) gsap.set(body, { y: 24, opacity: 0 })

        const tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: 'top 74%', once: true },
        })

        tl.set(title, { opacity: 1 })
          .to(split.lines, {
            yPercent: 0,
            duration: DUR.title,
            stagger: STAGGER.line,
            ease: EASE.reveal,
          })

        if (body) {
          tl.to(body, { y: 0, opacity: 1, duration: 0.75, ease: EASE.reveal }, 0.4)
        }

        return () => split.revert()
      }
    },
    { scope: sectionRef, dependencies: [reduced] },
  )

  return (
    <section ref={sectionRef} className="bg-white">
      {/*
       * Area pinada no desktop. min-h-[88vh] garante que o corpo
       * fique abaixo do fold enquanto o pin está ativo.
       */}
      <div
        ref={pinRef}
        className="flex min-h-[88vh] flex-col justify-center py-3xl lg:py-5xl"
      >
        <Container className="max-w-[72rem] min-[1600px]:max-w-[90rem]">
          {/* Decoração topo */}
          <div className="mb-2xl flex items-center gap-md opacity-40">
            <span aria-hidden className="block h-px w-10 bg-foreground" />
            <span className="text-eyebrow text-[9px] uppercase tracking-[0.26em] text-foreground">
              {t('kicker')}
            </span>
          </div>

          {/* Título — as palavras iluminam no desktop */}
          <h2
            ref={titleRef}
            className="font-black leading-[1.06] tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5.5rem)' }}
          >
            {t('titleSentence')}
          </h2>
        </Container>
      </div>

      {/* Corpo: dois parágrafos abaixo da área pinada */}
      <div ref={bodyRef} className="pb-4xl lg:pb-5xl">
        <Container className="max-w-[72rem] min-[1600px]:max-w-[90rem]">
          <div className="grid grid-cols-1 gap-xl border-t border-foreground/8 pt-xl lg:grid-cols-2 lg:gap-3xl lg:pt-2xl">
            <p className="text-subtitle m-0 max-w-none text-base leading-relaxed text-foreground/65 lg:text-lg">
              {t('bodyRest')}
            </p>
            <p className="text-subtitle m-0 max-w-none text-base leading-relaxed text-foreground/65 lg:text-lg">
              {t('paragraph2')}
            </p>
          </div>
        </Container>
      </div>
    </section>
  )
}
