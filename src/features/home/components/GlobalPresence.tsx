'use client'

import { useRef, useState } from 'react'
import { Globe2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'
import { Globe } from '@/components/ui/Globe'
import { FlagBR, FlagUS, type FlagComp } from '@/components/icons/flags'

/**
 * Presença internacional: sede no Brasil (Mogi Guaçu · SP) e filial nos EUA
 * (Lakeland · FL), com globo interativo (cobe) e cards apontando os dois pins.
 * Usada na home (sec-presenca) e na página Sobre (variant="embedded").
 *
 * A composição é fixa (globo mostra as Américas e volta sozinho após o drag),
 * então os pins têm posição de tela estável — os halos, conectores e cards
 * ficam em % do container, projetados de lat/lng no enquadramento de repouso.
 */

// Endereços reais (mesmos do rodapé / config/site)
const BR_LOCATION: [number, number] = [-22.37, -46.94] // Mogi Guaçu · SP
const US_LOCATION: [number, number] = [28.04, -81.95] //  Lakeland · FL
const FOCUS: [number, number] = [3, -64.5] // centro entre os dois pins

const MARKERS = [
  { location: BR_LOCATION, size: 0.06 },
  { location: US_LOCATION, size: 0.05 },
]

// Posição dos pins em % do container — calibrada por screenshot do
// enquadramento de repouso (marker do cobe medido no canvas de 560px)
const PIN_BR = { left: 61.6, top: 68.2 }
const PIN_US = { left: 38.4, top: 31.6 }

type PinCardProps = {
  Flag: FlagComp
  name: string
  sub: string
  className?: string
}

function PinCard({ Flag, name, sub, className = '' }: PinCardProps) {
  return (
    <div
      data-pin-card
      className={`absolute z-20 flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-white px-3 py-2 sm:px-4 sm:py-3 shadow-[0_12px_36px_rgba(10,30,15,0.14)] ring-1 ring-black/5 transition-opacity duration-300 ${className}`}
    >
      <span className="inline-flex h-6 w-9 sm:h-7 sm:w-10 shrink-0 overflow-hidden rounded-md ring-1 ring-black/10">
        <Flag className="h-full w-full" />
      </span>
      <span className="leading-tight">
        <span className="block text-[13px] sm:text-[15px] font-bold text-foreground">{name}</span>
        <span className="block text-[11px] sm:text-xs font-medium text-primary">{sub}</span>
      </span>
    </div>
  )
}

export function GlobalPresence({ variant = 'section' }: { variant?: 'section' | 'embedded' }) {
  const t = useTranslations('globalPresence')
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  useGSAP(
    () => {
      if (reduced || !rootRef.current) return
      const root = rootRef.current

      const eyebrow = root.querySelector<HTMLElement>('[data-gp-eyebrow]')
      const title = root.querySelector<HTMLElement>('[data-gp-title]')
      const body = root.querySelector<HTMLElement>('[data-gp-body]')
      const support = root.querySelector<HTMLElement>('[data-gp-support]')
      const globeWrap = root.querySelector<HTMLElement>('[data-gp-globe]')
      const cards = gsap.utils.toArray<HTMLElement>('[data-pin-card]', root)
      const halos = gsap.utils.toArray<HTMLElement>('[data-pin-halo]', root)

      const split = title ? new SplitText(title, { type: 'chars,lines' }) : null

      if (eyebrow) gsap.set(eyebrow, { y: 15, opacity: 0 })
      if (split) gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (body) gsap.set(body, { y: 20, opacity: 0 })
      if (support) gsap.set(support, { y: 16, opacity: 0 })
      if (globeWrap) gsap.set(globeWrap, { scale: 0.9, opacity: 0 })
      if (cards.length) gsap.set(cards, { y: 14, opacity: 0 })
      if (halos.length) gsap.set(halos, { scale: 0, opacity: 0 })

      ScrollTrigger.create({
        trigger: root,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
          if (eyebrow) tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5 }, 0)
          if (split)
            tl.to(
              split.chars,
              { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char },
              0.08,
            )
          if (body) tl.to(body, { y: 0, opacity: 1, duration: DUR.sub }, 0.35)
          if (support) tl.to(support, { y: 0, opacity: 1, duration: DUR.sub }, 0.5)
          if (globeWrap) tl.to(globeWrap, { scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out' }, 0.2)
          if (halos.length)
            tl.to(halos, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(2)' }, 0.9)
          if (cards.length) tl.to(cards, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 }, 1.0)
        },
      })

      return () => split?.revert()
    },
    { scope: rootRef, dependencies: [reduced] },
  )

  const inner = (
    <div ref={rootRef} className="grid grid-cols-1 lg:grid-cols-2 items-center gap-14 lg:gap-10">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes gp-halo-pulse {
            0%   { transform: scale(1);   opacity: 0.55; }
            70%  { transform: scale(2.2); opacity: 0; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          .gp-halo-ring { animation: gp-halo-pulse 2.4s ease-out infinite; }
        }
      `}</style>

      {/* ── Texto ──────────────────────────────────────────────── */}
      <div className="max-w-[36rem]">
        <span
          data-gp-eyebrow
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {t('eyebrow')}
        </span>

        <h2
          data-gp-title
          className="font-montserrat text-4xl md:text-5xl lg:text-[3.4rem] font-black uppercase text-foreground tracking-tight leading-[1.04] mb-6"
        >
          <span className="block">{t('titleL1')}</span>
          <span className="block">{t('titleL2')}</span>
          <span className="block">
            <em className="text-highlight text-primary">{t('titleHighlight')}</em>
            <span className="text-foreground">.</span>
          </span>
        </h2>

        <p data-gp-body className="text-lg text-foreground/70 leading-relaxed">
          {t('body')}
        </p>

        <div data-gp-support className="mt-9 flex items-center gap-4 border-l-2 border-primary pl-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/25 text-primary">
            <Globe2 className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <p className="text-[15px] font-medium leading-snug text-primary max-w-[20rem]">{t('support')}</p>
        </div>
      </div>

      {/* ── Globo ──────────────────────────────────────────────── */}
      <div
        data-gp-globe
        role="img"
        aria-label={t('globeAria')}
        className="relative mx-auto w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[560px] aspect-square select-none"
      >
        {/* anéis decorativos ao fundo */}
        <div aria-hidden className="pointer-events-none absolute -inset-[7%] rounded-full border border-primary/10" />
        <div aria-hidden className="pointer-events-none absolute -inset-[14%] rounded-full border border-primary/5" />

        <Globe markers={MARKERS} focus={FOCUS} onDragChange={setDragging} />

        {/* camada de pins/cards: esmaece enquanto o usuário gira o globo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ opacity: dragging ? 0.2 : 1 }}
        >
          {/* conectores (curvas suaves do card ao pin) */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
            <path
              d="M 31 14.5 Q 51 6.5 38.8 29.6"
              stroke="var(--color-primary)"
              strokeOpacity="0.28"
              strokeWidth="0.45"
              strokeLinecap="round"
            />
            <path
              d="M 76 74.5 Q 87 61.5 63.4 68.7"
              stroke="var(--color-primary)"
              strokeOpacity="0.28"
              strokeWidth="0.45"
              strokeLinecap="round"
            />
          </svg>

          {/* halos dos pins */}
          {[
            { pin: PIN_US, key: 'us' },
            { pin: PIN_BR, key: 'br' },
          ].map(({ pin, key }) => (
            <span
              key={key}
              data-pin-halo
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
            >
              <span className="gp-halo-ring absolute inset-0 rounded-full bg-primary-light" />
              <span className="absolute inset-[3px] rounded-full bg-primary shadow-[0_0_10px_rgba(0,120,60,0.55)]" />
            </span>
          ))}

          {/* cards */}
          <PinCard
            Flag={FlagUS}
            name={t('usName')}
            sub={t('usSub')}
            className="left-0 top-[6%] sm:top-[7%] -translate-x-[6%]"
          />
          <PinCard
            Flag={FlagBR}
            name={t('brazilName')}
            sub={t('brazilSub')}
            className="right-0 top-[76%] translate-x-[6%]"
          />
        </div>
      </div>
    </div>
  )

  if (variant === 'embedded') return inner

  return (
    <section className="bg-white overflow-hidden" style={{ paddingBlock: 'clamp(80px,8vw,120px)' }}>
      <Container className="min-[1600px]:max-w-[100rem]">{inner}</Container>
    </section>
  )
}
