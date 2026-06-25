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

      const cards = gsap.utils.toArray<HTMLElement>('[data-stat]', ref.current)

      cards.forEach((card, i) => {
        // numWrap: o container overflow-hidden do número (funciona p/ range e count-up)
        const numWrap = card.querySelector<HTMLElement>('[data-num-wrap]')
        const numEl   = card.querySelector<HTMLElement>('[data-count]')
        const barEl   = card.querySelector<HTMLElement>('[data-bar]')
        const metaEl  = card.querySelector<HTMLElement>('[data-meta]')

        // Estado inicial
        gsap.set(card, { opacity: 0 })
        if (numWrap) gsap.set(numWrap, { clipPath: 'inset(0 0 100% 0)' })
        if (barEl)   gsap.set(barEl,   { scaleX: 0, transformOrigin: 'left center' })
        if (metaEl)  gsap.set(metaEl,  { y: 14, opacity: 0 })

        const delay = i * 0.12

        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(card, { opacity: 1, duration: 0.01 })

            // Número emerge de baixo via clip-path (range e count-up)
            if (numWrap) {
              gsap.to(numWrap, {
                clipPath: 'inset(0 0 0% 0)',
                duration: 1.0,
                delay,
                ease: EASE.reveal,
              })
            }

            // Count-up: apenas nos cards com valor numérico real
            if (numEl) {
              const target = parseFloat(numEl.dataset.count || '0')
              const decs   = parseInt(numEl.dataset.decimals || '0')
              const pfx    = numEl.dataset.prefix || ''
              const obj    = { v: 0 }
              gsap.to(obj, {
                v: target,
                duration: 2.2,
                delay: delay + 0.15,
                ease: 'power2.out',
                onUpdate: () => {
                  const n = obj.v
                  numEl.textContent = pfx + (decs > 0
                    ? n.toFixed(decs).replace('.', ',')
                    : Math.round(n).toString())
                },
              })
            }

            // Linha acento: cresce da esquerda
            if (barEl) {
              gsap.to(barEl, {
                scaleX: 1,
                duration: 1.1,
                delay: delay + 0.35,
                ease: 'power3.out',
              })
            }

            // Label + fonte: sobem suavemente
            if (metaEl) {
              gsap.to(metaEl, {
                y: 0, opacity: 1,
                duration: 0.6,
                delay: delay + 0.45,
                ease: EASE.reveal,
              })
            }
          },
        })
      })
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} className="relative bg-primary overflow-hidden">
      {/* Ruído sutil no fundo (SVG inline — zero custo de rede) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: '180px' }} />

      <Container className="min-[1600px]:max-w-[90rem]">
        {/* Kicker topo */}
        <div className="flex items-center gap-md border-b border-white/10 py-md">
          <span aria-hidden className="block h-px w-8 bg-white/30" />
          <p className="text-eyebrow text-[10px] uppercase tracking-[0.24em] text-white/40">
            {t('title')}
          </p>
        </div>

        {/* Grid 2×2 mobile / 4 colunas desktop */}
        <div className="grid grid-cols-2 gap-x-md gap-y-3xl py-3xl lg:grid-cols-4 lg:gap-x-0 lg:py-5xl">
          {STATS.map(({ key, value, rangeStr, prefix, initial, decimals }, i) => {
            const isRange = value === null
            return (
              <div
                key={key}
                data-stat
                className={`flex flex-col gap-md ${i > 0 ? 'lg:border-l lg:border-white/10 lg:pl-2xl' : ''} ${i >= 2 ? 'border-t border-white/10 pt-2xl lg:border-t-0 lg:pt-0' : ''}`}
              >
                {/* NÚMERO — protagonista visual */}
                <div data-num-wrap className="overflow-hidden">
                  <span
                    data-count={!isRange ? String(value!) : undefined}
                    data-decimals={!isRange ? String(decimals) : undefined}
                    data-prefix={!isRange ? prefix : undefined}
                    className="block font-black leading-[0.88] tracking-tight text-white"
                    style={{ fontSize: 'clamp(3.25rem, 8.5vw, 5rem)' }}
                  >
                    {isRange ? rangeStr : initial}
                  </span>
                </div>

                {/* Unidade */}
                <span className="text-eyebrow text-xs font-semibold text-white/45 -mt-xs">
                  {t(`${key}.unit` as any)}
                </span>

                {/* Barra acento */}
                <span
                  data-bar
                  aria-hidden
                  className="block h-[1.5px] w-full rounded-full bg-white/20"
                />

                {/* Label + fonte */}
                <div data-meta className="flex flex-col gap-xs">
                  <p className="text-subtitle text-sm leading-snug text-white/75 m-0 max-w-none">
                    {t(`${key}.label` as any)}
                  </p>
                  <p className="text-body-regular text-[10px] leading-relaxed text-white/30 m-0 max-w-none">
                    {t(`${key}.source` as any)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
