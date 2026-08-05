'use client'

import { Star, Warehouse } from 'lucide-react'

import { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { gsap, useGSAP } from '@/features/animation/gsap'
import { createCharReveal, revealToggleActions } from '@/features/animation/charReveal'
import { DUR, EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'

export function HomeExperience() {
  const t = useTranslations('homeExperience');
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    const visual = ref.current.querySelector<HTMLElement>('[data-exp-visual]')
    const body = ref.current.querySelector<HTMLElement>('[data-exp-body]')
    
    const isMobile = window.innerWidth < 1024
    if (visual) gsap.set(visual, { x: -40, opacity: 0, ...(!isMobile && { filter: 'blur(10px)' }) })
    
    let reveal: ReturnType<typeof createCharReveal> = null
    if (body) {
      const kicker = body.querySelector<HTMLElement>('[data-kicker]')
      const title = body.querySelector<HTMLElement>('[data-title]')
      const line = body.querySelector<HTMLElement>('[data-gline]')
      const desc = body.querySelector<HTMLElement>('[data-desc]')
      const cta = body.querySelector<HTMLElement>('[data-cta]')

      reveal = createCharReveal(title)

      if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
      reveal?.hide()
      if (line) gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
      if (desc) gsap.set(desc, { y: 20, opacity: 0 })
      if (cta) gsap.set(cta, { y: 20, opacity: 0 })
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 75%',
        end: 'top 10%',
        toggleActions: revealToggleActions(),
      },
      defaults: { ease: EASE.reveal }
    })
    
    if (visual) tl.to(visual, { x: 0, opacity: 1, ...(!isMobile && { filter: 'blur(0px)' }), duration: 0.9 })
    
    if (body) {
      const kicker = body.querySelector<HTMLElement>('[data-kicker]')
      const line = body.querySelector<HTMLElement>('[data-gline]')
      const desc = body.querySelector<HTMLElement>('[data-desc]')
      const cta = body.querySelector<HTMLElement>('[data-cta]')

      if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub }, '-=0.5')
      reveal?.playIn(tl, '-=0.4')
      if (line) tl.to(line, { scaleX: 1, opacity: 1, duration: DUR.sub }, '-=0.4')
      if (desc) tl.to(desc, { y: 0, opacity: 1, duration: DUR.sub }, '-=0.4')
      if (cta) tl.to(cta, { y: 0, opacity: 1, duration: DUR.sub }, '-=0.4')
    }

    return () => reveal?.revert()
  }, { scope: ref })

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#0F1A0A', paddingBlock: 'clamp(80px, 7.5vw, 120px)' }}
    >
      <Container>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Visual — still da fábrica/galpão, no lugar do vídeo real (entra depois). */}
          <div data-exp-visual className="relative rounded-[24px] overflow-hidden aspect-[4/3]">
            <Image
              src="/experience/juma-experience-still.webp"
              alt={t('immersion')}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={85}
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-black/25" />
            {/* Tag overlay */}
            {/* O backdrop-blur fica só onde há hover (desktop). No celular a tag
                entra na tela junto com o bloco visual, que é animado em `x` — e
                backdrop-filter num elemento que se move é reamostrado a cada
                frame do reveal. O fundo vai a 78% para compensar o desfoque. */}
            <div
              className="absolute bottom-5 left-5 flex items-center gap-3 rounded-[14px] px-4 py-3 bg-black/[.78] md:bg-black/60 md:backdrop-blur-[12px]"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#004B26' }}
              >
                <Warehouse width="14" height="14" color="#F0E27A" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">Juma Experience</div>
                <div className="text-[11px]" style={{ color: 'rgba(255,255,255,.55)' }}>{t('immersion')}</div>
              </div>
            </div>
          </div>

          <div data-exp-body>
            <div className="mb-8" data-kicker>
              <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 mb-6 border border-white/20 text-white/80">
                <Star className="w-3.5 h-3.5 flex-shrink-0 text-[#F0E27A]" />
                {t('kicker')}
              </span>
            </div>
            <h2
              data-title
              className="font-black uppercase leading-[1.05] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)' }}
            >
              {t('titlePart1')} <span className="text-[#F0E27A] text-highlight inline-block">{t('titleHighlight')}</span>
            </h2>
            <span data-gline aria-hidden className="mt-8 mb-6 block h-[3px] w-12 rounded-full bg-[#F0E27A]" />
            <p data-desc className="text-[17px] leading-[1.65] mb-10" style={{ color: 'rgba(255,255,255,.65)' }}>
              {t('desc')}
            </p>
            <Link
              data-cta
              href="/juma-experience"
              className="text-body-regular inline-flex items-center gap-3 rounded-full px-10 py-3 text-[13px] font-medium uppercase tracking-wider transition-colors"
              style={{ backgroundColor: '#F0E27A', color: '#1A1A1A' }}
            >
              {t('cta')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
