'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { gsap, SplitText, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

export function Problem() {
  const t = useTranslations('problem')
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      const title = titleRef.current
      const body = bodyRef.current

      // SplitText por linha — mesma voz do Hero e OurStory
      const split = title
        ? new SplitText(title, { type: 'lines', mask: 'lines', linesClass: 'overflow-hidden' })
        : null
      const lines = split?.lines ?? []

      if (title) gsap.set(title, { opacity: 0 })
      if (lines.length) gsap.set(lines, { yPercent: 108 })
      if (body) gsap.set(body, { y: 24, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 72%', once: true },
      })

      if (title) tl.set(title, { opacity: 1 }, 0)
      if (lines.length) tl.to(lines, { yPercent: 0, duration: DUR.title, stagger: STAGGER.line, ease: EASE.reveal }, 0)
      if (body) tl.to(body, { y: 0, opacity: 1, duration: 0.75, ease: EASE.reveal }, 0.45)

      return () => split?.revert()
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} className="bg-white py-4xl lg:py-5xl">
      <Container className="min-[1600px]:max-w-[90rem] max-w-[68rem]">

        {/* Título grande — revela por linha */}
        <h2
          ref={titleRef}
          className="font-black leading-[1.04] tracking-tight text-foreground text-[clamp(1.75rem,4.2vw,3.75rem)]"
        >
          {t('titleSentence')}
        </h2>

        {/* Dois parágrafos em colunas no desktop */}
        <div
          ref={bodyRef}
          className="mt-2xl lg:mt-3xl grid grid-cols-1 gap-xl lg:grid-cols-2 lg:gap-2xl border-t border-foreground/8 pt-xl lg:pt-2xl"
        >
          <p className="text-subtitle text-base lg:text-lg text-foreground/70 leading-relaxed max-w-none m-0">
            {t('bodyRest')}
          </p>
          <p className="text-subtitle text-base lg:text-lg text-foreground/70 leading-relaxed max-w-none m-0">
            {t('paragraph2')}
          </p>
        </div>
      </Container>
    </section>
  )
}
