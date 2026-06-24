'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

type StatKey = 'cana' | 'milho' | 'soja' | 'cafe'

const STATS: Array<{
  key: StatKey
  prefix: string
  value: number | null
  rangeStr?: string
  decimals: number
  initial: string
}> = [
  { key: 'cana',  prefix: '+', value: 6.87, decimals: 2, initial: '+6,87' },
  { key: 'milho', prefix: '+', value: 13.4, decimals: 1, initial: '+13,4' },
  { key: 'soja',  prefix: '',  value: null,  rangeStr: '+10 a +14', decimals: 0, initial: '+10 a +14' },
  { key: 'cafe',  prefix: '',  value: 74,    decimals: 0, initial: '74' },
]

export function ProofStrip() {
  const t = useTranslations('proof')
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      // Cards entram em stagger suave ao scroll
      const cards = gsap.utils.toArray<HTMLElement>('[data-stat]', ref.current)
      gsap.set(cards, { opacity: 0, y: 20 })

      ScrollTrigger.batch(cards, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1, y: 0,
            duration: 0.75, stagger: 0.1, ease: EASE.reveal,
          }),
      })

      // Count-up: esconde o número real, anima de 0 até o target
      STATS.forEach(({ key, value, decimals, prefix }) => {
        if (value === null) return
        const el = ref.current!.querySelector<HTMLElement>(`[data-num="${key}"]`)
        if (!el) return

        gsap.set(el, { opacity: 0 })

        const obj = { v: 0 }
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(el, { opacity: 1, duration: 0.25 })
            gsap.to(obj, {
              v: value,
              duration: 1.9,
              ease: 'power2.out',
              onUpdate: () => {
                const n = obj.v
                el.textContent =
                  prefix + (decimals > 0
                    ? n.toFixed(decimals).replace('.', ',')
                    : Math.round(n).toString())
              },
            })
          },
        })
      })
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} className="bg-primary">
      {/* Kicker */}
      <div className="border-b border-white/10">
        <Container className="min-[1600px]:max-w-[90rem] py-md">
          <p className="text-eyebrow text-[10px] uppercase tracking-[0.22em] text-white/50">
            {t('title')}
          </p>
        </Container>
      </div>

      {/* Grid de métricas */}
      <Container className="min-[1600px]:max-w-[90rem] py-2xl lg:py-3xl">
        <div className="grid grid-cols-2 gap-x-lg gap-y-2xl lg:grid-cols-4 lg:divide-x lg:divide-white/10">
          {STATS.map(({ key, value, rangeStr, prefix, initial }, i) => {
            const isRange = value === null
            return (
              <div
                key={key}
                data-stat
                className={`flex flex-col gap-sm ${i > 0 ? 'lg:pl-2xl' : ''}`}
              >
                {/* Número + unidade */}
                <div className="flex flex-wrap items-baseline gap-x-xs">
                  <span
                    data-num={!isRange ? key : undefined}
                    className="font-black text-[clamp(2rem,4.5vw,3.5rem)] leading-none tracking-tight text-white"
                  >
                    {isRange ? rangeStr : initial}
                  </span>
                  <span className="text-eyebrow text-sm font-semibold text-white/55">
                    {t(`${key}.unit` as any)}
                  </span>
                </div>

                {/* Rótulo */}
                <p className="text-subtitle text-sm leading-snug text-white/80 max-w-[13rem]">
                  {t(`${key}.label` as any)}
                </p>

                {/* Fonte */}
                <p className="text-body-regular text-[10px] leading-relaxed text-white/35">
                  {t(`${key}.source` as any)}
                </p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
