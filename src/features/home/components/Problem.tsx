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

      if (pin) {
        /*
         * Técnica "lâmpada por palavra".
         * A seção pina em top: top e o ScrollTrigger com scrub
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
            end: isDesktop ? '+=720' : '+=400',
            pin: true,
            scrub: 0.9,
          },
        })

        words.forEach((word, i) => {
          tl.to(word, { opacity: 1, duration: step * 0.9 }, i * step)
        })

        // Anima a linha dinamicamente no final do scrub
        const line = pin.querySelector<HTMLElement>('[data-gline]')
        if (line) {
          gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
          tl.to(line, { scaleX: 1, opacity: 1, duration: step * 2 }, (words.length - 1) * step)
        }

        // Corpo: revela após o pin liberar (trigger proprio)
        if (body) {
          gsap.set(body, { y: 28, opacity: 0 })
          ScrollTrigger.create({
            trigger: body,
            start: 'top 85%',
            end: 'bottom 15%',
            onEnter: () => gsap.to(body, { y: 0, opacity: 1, duration: 0.9, ease: EASE.reveal, overwrite: 'auto' }),
            onLeave: () => gsap.to(body, { y: 28, opacity: 0, duration: 0.5, overwrite: 'auto' }),
            onEnterBack: () => gsap.to(body, { y: 0, opacity: 1, duration: 0.9, ease: EASE.reveal, overwrite: 'auto' }),
            onLeaveBack: () => gsap.to(body, { y: 28, opacity: 0, duration: 0.5, overwrite: 'auto' })
          })
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
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 mb-6 border border-primary/20 bg-primary/5 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              {t('kicker')}
            </span>
          </div>

          {/* Título — as palavras iluminam no desktop */}
          <h2
            ref={titleRef}
            className="font-black leading-[1.06] tracking-tight text-foreground uppercase"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            {t('titleSentence')}
          </h2>
          <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-primary" />
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
