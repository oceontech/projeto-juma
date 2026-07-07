'use client'

import { CheckCircle2 } from 'lucide-react'

import React, { useRef, useState, useEffect } from 'react'
import { gsap, ScrollTrigger, useGSAP, SplitText } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'

const TESTIMONIALS = [0, 1, 2]

export function HomeTestimonials() {
  const t = useTranslations('homeTestimonials');
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    const cards = gsap.utils.toArray<HTMLElement>('[data-testi-card]', ref.current)
    gsap.set(cards, { y: 80, opacity: 0, filter: 'blur(12px)' })
    
    const header = ref.current.querySelector<HTMLElement>('[data-header]')
    let split: SplitText | null = null;
    if (header) {
      const kicker = header.querySelector<HTMLElement>('[data-kicker]')
      const title = header.querySelector<HTMLElement>('[data-title]')
      const line = header.querySelector<HTMLElement>('[data-gline]')

      split = title ? new SplitText(title, { type: 'chars,words' }) : null

      if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
      if (split) gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (line) gsap.set(line, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse',
        },
        defaults: { ease: EASE.reveal }
      })
      if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub })
      if (split) tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, '-=0.4')
      if (line) tl.to(line, { scaleX: 1, opacity: 1, duration: DUR.sub }, '-=0.4')
    }

    gsap.to(cards, {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.8,
      stagger: 0.25,
      ease: EASE.reveal,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 78%',
        end: 'bottom 15%',
        toggleActions: 'play reverse play reverse',
      }
    })
    
    return () => split?.revert()
  }, { scope: ref })

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#F2F6F2', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div data-header>
            <div className="mb-8" data-kicker>
              <span className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase rounded-full px-4 py-2 border border-[#004B26]/20 bg-[#004B26]/5 text-[#004B26]">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-[#004B26]" />
                {t('kicker')}
              </span>
            </div>
            <h2
              data-title
              className="font-black uppercase leading-[1.05] tracking-tight"
              style={{ color: '#0F1A0A', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              <span dangerouslySetInnerHTML={{ __html: t('titlePart1') }} /><span className="text-[#004B26] text-highlight inline-block">{t('titleHighlight')}</span>
            </h2>
            <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-[#004B26]" />
          </div>
          <p className="max-w-[38ch] text-[17px] leading-[1.6]" style={{ color: '#3d4d35' }}>
            {t('desc')}
          </p>
        </div>

        {/* Cards */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((_, i) => (
            <article
              key={i}
              data-testi-card
              className="rounded-[24px] p-7 flex flex-col gap-5"
              style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,.07)' }}
            >
              {/* Aspas */}
              <div
                className="text-[80px] leading-none font-black select-none"
                style={{ color: '#DDE6C8', lineHeight: 1 }}
                aria-hidden
              >
                "
              </div>

              <p className="text-[16px] leading-[1.65] flex-1" style={{ color: '#1a2a12' }}>
                {t(`testimonials.${i}.text`)}
              </p>

              {/* Badge resultado */}
              <span
                className="inline-block text-[12px] font-bold tracking-[0.06em] uppercase rounded-full px-3 py-1.5 w-fit"
                style={{ backgroundColor: '#E8EFE2', color: '#004B26' }}
              >
                {t(`testimonials.${i}.badge`)}
              </span>

              {/* Autor */}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,.06)' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[14px]"
                  style={{ backgroundColor: '#004B26', color: '#F0E27A' }}
                >
                  {t(`testimonials.${i}.initials`)}
                </div>
                <div>
                  <div className="text-[14px] font-bold" style={{ color: '#0F1A0A' }}>{t(`testimonials.${i}.name`)}</div>
                  <div className="text-[12px]" style={{ color: '#7a8f6e' }}>{t(`testimonials.${i}.location`)}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <MobileTestimonialsMarquee testimonials={TESTIMONIALS} t={t} />
      </Container>
    </section>
  )
}

function MobileTestimonialsMarquee({ testimonials, t }: { testimonials: typeof TESTIMONIALS, t: any }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [pausedIndex, setPausedIndex] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const reduced = useReducedMotion()

  const items = [...testimonials, ...testimonials, ...testimonials]
  const tlRef = useRef<gsap.core.Tween | null>(null)

  useGSAP(() => {
    if (reduced || !trackRef.current) return
    const track = trackRef.current
    const setWidth = 336 * testimonials.length // 320px + 16px gap = 336

    tlRef.current = gsap.to(track, {
      x: -setWidth,
      ease: 'none',
      duration: testimonials.length * 5.5,
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % setWidth)
      }
    })

    return () => { tlRef.current?.kill() }
  }, { scope: containerRef, dependencies: [reduced, testimonials.length] })

  useEffect(() => {
    if (tlRef.current) {
      if (isPaused) tlRef.current.pause()
      else tlRef.current.play()
    }
  }, [isPaused])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPaused(false)
        setPausedIndex(null)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  return (
    <div ref={containerRef} data-testi-card className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden block lg:hidden pb-12 pt-4">
      <div ref={trackRef} className="flex gap-4 w-max pl-6">
        {items.map((itemIndex, idx) => {
          const isClicked = pausedIndex === idx
          return (
            <article
              key={idx}
              onClick={() => {
                if (pausedIndex === idx) {
                  setIsPaused(false)
                  setPausedIndex(null)
                } else {
                  setIsPaused(true)
                  setPausedIndex(idx)
                }
              }}
              className={`rounded-[24px] p-7 flex flex-col gap-5 w-[320px] shrink-0 transition-all duration-500 cursor-pointer ${isClicked ? 'scale-[1.03] shadow-2xl z-10 opacity-100' : isPaused ? 'scale-[0.98] opacity-50 shadow-sm z-0' : 'scale-100 opacity-100 hover:scale-[1.02]'}`}
              style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,.07)' }}
            >
              <div
                className="text-[80px] leading-none font-black select-none"
                style={{ color: '#DDE6C8', lineHeight: 1 }}
                aria-hidden
              >
                "
              </div>
              <p className="text-[16px] leading-[1.65] flex-1" style={{ color: '#1a2a12' }}>
                {t(`testimonials.${itemIndex}.text` as any)}
              </p>
              <span
                className="inline-block text-[12px] font-bold tracking-[0.06em] uppercase rounded-full px-3 py-1.5 w-fit"
                style={{ backgroundColor: '#E8EFE2', color: '#004B26' }}
              >
                {t(`testimonials.${itemIndex}.badge` as any)}
              </span>
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,.06)' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[14px]"
                  style={{ backgroundColor: '#004B26', color: '#F0E27A' }}
                >
                  {t(`testimonials.${itemIndex}.initials` as any)}
                </div>
                <div>
                  <div className="text-[14px] font-bold" style={{ color: '#0F1A0A' }}>{t(`testimonials.${itemIndex}.name` as any)}</div>
                  <div className="text-[12px]" style={{ color: '#7a8f6e' }}>{t(`testimonials.${itemIndex}.location` as any)}</div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
