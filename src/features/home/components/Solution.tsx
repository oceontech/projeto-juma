'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { gsap, SplitText, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'

export function Solution() {
  const t = useTranslations('solution')
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      const title = titleRef.current
      const intro = introRef.current
      const steps = stepsRef.current
        ? gsap.utils.toArray<HTMLElement>('[data-step]', stepsRef.current)
        : []
      const cta = ctaRef.current

      const split = title
        ? new SplitText(title, { type: 'lines', mask: 'lines', linesClass: 'overflow-hidden' })
        : null
      const lines = split?.lines ?? []

      if (title) gsap.set(title, { opacity: 0 })
      if (lines.length) gsap.set(lines, { yPercent: 108 })
      if (intro) gsap.set(intro, { y: 18, opacity: 0 })
      if (steps.length) gsap.set(steps, { y: 28, opacity: 0 })
      if (cta) gsap.set(cta, { y: 16, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 72%', once: true },
      })

      if (title) tl.set(title, { opacity: 1 }, 0)
      if (lines.length) tl.to(lines, { yPercent: 0, duration: DUR.title, stagger: STAGGER.line, ease: EASE.reveal }, 0)
      if (intro) tl.to(intro, { y: 0, opacity: 1, duration: DUR.sub, ease: EASE.reveal }, 0.3)
      if (steps.length) tl.to(steps, { y: 0, opacity: 1, duration: DUR.sub, stagger: STAGGER.card, ease: EASE.reveal }, 0.5)
      if (cta) tl.to(cta, { y: 0, opacity: 1, duration: DUR.sub, ease: EASE.reveal }, 0.85)

      return () => split?.revert()
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} className="bg-[#F8F6F1] py-4xl lg:py-5xl">
      <Container className="min-[1600px]:max-w-[90rem]">

        {/* Cabeçalho */}
        <div ref={headRef} className="max-w-[50rem]">
          <span className="text-eyebrow mb-md inline-flex items-center gap-sm text-xs uppercase tracking-[0.18em] text-primary">
            <span aria-hidden className="block h-px w-6 bg-primary" />
            {t('stepsTitle')}
          </span>
          <h2
            ref={titleRef}
            className="font-black uppercase leading-[0.96] tracking-tight text-[clamp(2rem,4.2vw,3.5rem)]"
          >
            {t('title')}
          </h2>
          <p
            ref={introRef}
            className="text-subtitle mt-xl text-base lg:text-lg text-foreground/70 leading-relaxed max-w-none m-0"
          >
            {t('intro')}
          </p>
        </div>

        {/* Três passos */}
        <div
          ref={stepsRef}
          className="mt-3xl grid grid-cols-1 gap-xl sm:grid-cols-3 sm:gap-2xl"
        >
          {([1, 2, 3] as const).map((n) => (
            <div key={n} data-step className="flex flex-col gap-md">
              {/* Número */}
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary/30 text-primary">
                <span className="font-black text-base">{n}</span>
              </div>
              {/* Separador */}
              <div className="h-px w-full bg-primary/12" />
              {/* Conteúdo */}
              <h3 className="font-black text-base uppercase tracking-tight text-foreground">
                {t(`step${n}.title` as any)}
              </h3>
              <p className="text-subtitle text-sm text-foreground/65 leading-relaxed m-0 max-w-none">
                {t(`step${n}.body` as any)}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="mt-3xl">
          <Link
            href="/contato"
            className="text-body-regular inline-flex items-center justify-center rounded-full bg-primary px-xl py-md text-base text-white transition-colors hover:bg-primary-light"
          >
            {t('cta')}
          </Link>
        </div>
      </Container>
    </section>
  )
}
