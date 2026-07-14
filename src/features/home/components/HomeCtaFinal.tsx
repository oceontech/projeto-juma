'use client'

import { Rocket } from 'lucide-react'

import { useRef } from 'react'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, ScrollTrigger, useGSAP, SplitText } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

export function HomeCtaFinal() {
  const t = useTranslations('homeCtaFinal');
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return

    const container = ref.current.querySelector<HTMLElement>('[data-cta-container]')
    let split: SplitText | null = null;

    if (container) {
      const kicker = container.querySelector<HTMLElement>('[data-kicker]')
      const title = container.querySelector<HTMLElement>('[data-title]')
      const line = container.querySelector<HTMLElement>('[data-gline]')
      const desc = container.querySelector<HTMLElement>('[data-desc]')
      const btn = container.querySelector<HTMLElement>('[data-btn]')

      split = title ? new SplitText(title, { type: 'chars,words' }) : null

      if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
      if (split) gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (line) gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
      if (desc) gsap.set(desc, { y: 20, opacity: 0 })
      if (btn) gsap.set(btn, { scale: 0.9, opacity: 0, filter: 'blur(5px)' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse',
        },
        defaults: { ease: EASE.reveal }
      })
      if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub })
      if (split) tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, '-=0.4')
      if (line) tl.to(line, { scaleX: 1, opacity: 1, duration: DUR.sub }, '-=0.4')
      if (desc) tl.to(desc, { y: 0, opacity: 1, duration: DUR.sub }, '-=0.4')
      if (btn) tl.to(btn, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: DUR.sub, ease: 'back.out(1.5)' }, '-=0.4')
    }

    return () => split?.revert()
  }, { scope: ref })

  return (
    <section
      ref={ref}
      id="whatsapp"
      style={{ backgroundColor: '#004B26', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        <div data-cta-container className="flex flex-col items-center text-center gap-8">
          <div className="mb-4" data-kicker>
            <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 border border-white/20 text-white/80">
              <Rocket className="w-3.5 h-3.5 flex-shrink-0 text-[#F0E27A]" />
              {t('kicker')}
            </span>
          </div>

          <h2
            data-title
            className="font-black uppercase leading-[1.05] tracking-tight text-white max-w-[14ch]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            {t('titlePart1')} <span className="text-[#F0E27A] text-highlight inline-block">{t('titleHighlight')}</span>
          </h2>
          <span data-gline aria-hidden className="mb-4 block h-[3px] w-12 rounded-full bg-[#F0E27A]" />

          <p data-desc className="text-[18px] leading-[1.6] max-w-[44ch]" style={{ color: 'rgba(255,255,255,.65)' }}>
            {t('desc')}
          </p>

          <a
            data-btn
            href="https://wa.me/5519999648186"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-metallic-blue inline-flex items-center gap-3 font-semibold uppercase text-[16px] rounded-full px-8 py-4"
            style={{ color: '#fff !important' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            {t('btn')}
          </a>
        </div>
      </Container>
    </section>
  )
}
