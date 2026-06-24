'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'

export function Solution() {
  const t = useTranslations('solution')
  const reduced  = useReducedMotion()
  const ref      = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const ctaRef   = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      const title = titleRef.current
      const intro = introRef.current
      const cta   = ctaRef.current

      // Título: SplitText por linha (mesma voz do Hero e OurStory)
      const split = title
        ? new SplitText(title, { type: 'lines', mask: 'lines', linesClass: 'overflow-hidden' })
        : null
      const lines = split?.lines ?? []

      if (title) gsap.set(title, { opacity: 0 })
      if (lines.length) gsap.set(lines, { yPercent: 108 })
      if (intro) gsap.set(intro, { y: 20, opacity: 0 })
      if (cta) gsap.set(cta, { y: 16, opacity: 0 })

      // Cabeçalho: revela quando entra no viewport
      const tlHead = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 72%', once: true },
      })
      if (title) tlHead.set(title, { opacity: 1 }, 0)
      if (lines.length)
        tlHead.to(lines, { yPercent: 0, duration: DUR.title, stagger: STAGGER.line, ease: EASE.reveal }, 0)
      if (intro)
        tlHead.to(intro, { y: 0, opacity: 1, duration: DUR.sub, ease: EASE.reveal }, 0.35)

      // Cada step: regra horizontal + conteúdo, ativados individualmente
      if (stepsRef.current) {
        const steps = gsap.utils.toArray<HTMLElement>('[data-step]', stepsRef.current)

        steps.forEach((step, i) => {
          const rule    = step.querySelector<HTMLElement>('[data-rule]')
          const content = step.querySelector<HTMLElement>('[data-content]')

          if (rule)    gsap.set(rule,    { scaleX: 0, transformOrigin: 'left center' })
          if (content) gsap.set(content, { y: 20, opacity: 0 })

          ScrollTrigger.create({
            trigger: step,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              const delay = i * 0.07
              if (rule)
                gsap.to(rule, {
                  scaleX: 1,
                  duration: 0.9,
                  delay,
                  ease: 'power3.out',
                })
              if (content)
                gsap.to(content, {
                  y: 0, opacity: 1,
                  duration: 0.65,
                  delay: delay + 0.15,
                  ease: EASE.reveal,
                })
            },
          })
        })
      }

      // CTA
      if (cta) {
        ScrollTrigger.create({
          trigger: cta,
          start: 'top 88%',
          once: true,
          onEnter: () => gsap.to(cta, { y: 0, opacity: 1, duration: 0.6, ease: EASE.reveal }),
        })
      }

      return () => split?.revert()
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} className="bg-[#F7F8F6] py-4xl lg:py-5xl">
      <Container className="min-[1600px]:max-w-[90rem]">

        {/* Cabeçalho */}
        <div className="max-w-[52rem]">
          <div className="mb-xl flex items-center gap-md">
            <span aria-hidden className="block h-px w-6 bg-primary/40" />
            <span className="text-eyebrow text-[10px] uppercase tracking-[0.24em] text-primary/55">
              {t('stepsTitle')}
            </span>
          </div>

          <h2
            ref={titleRef}
            className="font-black uppercase leading-[0.96] tracking-tight text-foreground"
            style={{ fontSize: 'clamp(2.25rem, 5.2vw, 4.75rem)' }}
          >
            {t('title')}
          </h2>

          <p
            ref={introRef}
            className="text-subtitle m-0 mt-xl max-w-none text-base leading-relaxed text-foreground/65 lg:text-lg"
          >
            {t('intro')}
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="mt-3xl">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} data-step>
              {/* Regra que se desenha */}
              <div
                data-rule
                aria-hidden
                className="h-px w-full bg-foreground/12"
              />

              {/* Row: número + conteúdo */}
              <div
                data-content
                className="grid grid-cols-[auto_1fr] gap-x-xl py-xl lg:gap-x-3xl lg:py-2xl"
              >
                {/* Número decorativo — âncora visual da linha */}
                <div className="flex items-start pt-[0.15em]">
                  <span
                    aria-hidden
                    className="font-black leading-[0.88] tracking-tighter text-primary/12 select-none"
                    style={{
                      fontSize: 'clamp(2rem, 5.5vw, 5rem)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {String(n).padStart(2, '0')}
                  </span>
                </div>

                {/* Conteúdo da etapa */}
                <div className="flex flex-col gap-sm">
                  <h3
                    className="font-black uppercase tracking-tight text-foreground"
                    style={{ fontSize: 'clamp(1rem, 2vw, 1.375rem)' }}
                  >
                    {t(`step${n}.title` as any)}
                  </h3>
                  <p className="text-subtitle m-0 max-w-[44rem] text-base leading-relaxed text-foreground/60">
                    {t(`step${n}.body` as any)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Regra final — estática, não animada */}
          <div aria-hidden className="h-px w-full bg-foreground/12" />
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="mt-3xl">
          <Link
            href="/contato"
            className="text-body-regular inline-flex items-center justify-center rounded-full bg-primary px-xl py-md text-base text-white transition-opacity hover:opacity-80"
          >
            {t('cta')}
          </Link>
        </div>

      </Container>
    </section>
  )
}
