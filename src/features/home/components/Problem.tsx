'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal } from '@/features/animation/charReveal'
import { EASE, blurPx } from '@/features/animation/motion'
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
        /* Este título acende palavra a palavra (não letra a letra) — desenho
           original da seção, preservado com `by: 'words'`. O desfoque continua
           existindo, agora no título inteiro em vez de em cada palavra. */
        const reveal = createCharReveal(title, { by: 'words', axis: 'y', distance: 0, blur: 12, autoRevert: false })
        const words = reveal ? reveal.chars : []

        // Distribui as 4 cores pelo total de palavras (4 blocos proporcionais)
        const textColors = ['var(--color-foreground)', 'var(--color-primary)', 'var(--color-accent)', 'var(--color-secondary)']
        const wordsPerColor = Math.ceil(words.length / textColors.length)
        
        words.forEach((word, index) => {
          const colorIndex = Math.min(Math.floor(index / wordsPerColor), textColors.length - 1)
          gsap.set(word, { color: textColors[colorIndex] })
        })

        reveal?.hide()

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

        if (blurPx(12) !== 'none') {
          tl.to(title, { filter: blurPx(0), duration: step * 2.5, ease: 'power2.out' }, 0)
        }

        words.forEach((word, i) => {
          tl.to(word, { opacity: 1, duration: step * 0.9 }, i * step)
        })

        // Anima a linha dinamicamente no final do scrub
        const line = pin.querySelector<HTMLElement>('[data-gline]')
        if (line) {
          gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'center' })
          tl.to(line, { scaleX: 1, opacity: 1, duration: step * 2 }, (words.length - 1) * step)
        }

        // Corpo: revela após o pin liberar (trigger proprio)
        let bodyTrigger: ScrollTrigger | null = null
        if (body) {
          gsap.set(body, { y: 28, opacity: 0, ...(isDesktop && { filter: 'blur(8px)' }) })
          bodyTrigger = ScrollTrigger.create({
            trigger: body,
            start: 'top 85%',
            end: 'bottom top',
            onEnter: () => gsap.to(body, { y: 0, opacity: 1, ...(isDesktop && { filter: 'blur(0px)' }), duration: 0.9, ease: EASE.reveal, overwrite: 'auto' }),
            onEnterBack: () => gsap.to(body, { y: 0, opacity: 1, ...(isDesktop && { filter: 'blur(0px)' }), duration: 0.9, ease: EASE.reveal, overwrite: 'auto' }),
          })
        }

        return () => {
          tl.scrollTrigger?.kill(true)
          tl.kill()
          bodyTrigger?.kill()
          reveal?.revert()
        }
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
        <Container className="max-w-[72rem] min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem] flex flex-col items-center text-left">
          {/* Título — as palavras iluminam no desktop */}
          <h2
            ref={titleRef}
            className="font-black leading-[1.06] tracking-tight text-foreground uppercase"
            style={{ fontSize: 'clamp(2.7rem, 5.5vw, 5.6rem)' }}
          >
            {t('titleSentence')}
          </h2>
          <span data-gline aria-hidden className="mt-8 block h-[4px] w-16 rounded-full bg-primary" />
        </Container>
      </div>

      {/* Corpo: dois parágrafos abaixo da área pinada */}
      <div ref={bodyRef} className="pb-4xl lg:pb-5xl">
        <Container className="max-w-[72rem] min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
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
