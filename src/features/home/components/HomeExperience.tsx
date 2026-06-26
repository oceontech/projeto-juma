'use client'

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

export function HomeExperience() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    const visual = ref.current.querySelector<HTMLElement>('[data-exp-visual]')
    const body = ref.current.querySelector<HTMLElement>('[data-exp-body]')
    if (visual) gsap.set(visual, { x: -30, opacity: 0 })
    if (body) gsap.set(body, { x: 30, opacity: 0 })
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        if (visual) gsap.to(visual, { x: 0, opacity: 1, duration: 0.9, ease: EASE.reveal })
        if (body) gsap.to(body, { x: 0, opacity: 1, duration: 0.9, delay: 0.1, ease: EASE.reveal })
      },
    })
  }, { scope: ref })

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#0F1A0A', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Visual */}
          <div data-exp-visual className="relative rounded-[24px] overflow-hidden aspect-[4/3]">
            <div
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, #1a3a12 0%, #2d6020 50%, #3d8028 100%)' }}
            />
            {/* Ícone de play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: 'rgba(240,226,122,.92)', backdropFilter: 'blur(8px)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A" aria-hidden>
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </div>
            </div>
            {/* Tag overlay */}
            <div
              className="absolute bottom-5 left-5 flex items-center gap-3 rounded-[14px] px-4 py-3"
              style={{ backgroundColor: 'rgba(0,0,0,.6)', backdropFilter: 'blur(12px)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#004B26' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F0E27A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 4c-7 0-12 4-12 11 0 2 1 4 2 5 1-7 5-11 10-12" /><path d="M4 20c2-6 6-10 12-12" />
                </svg>
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">Juma Experience</div>
                <div className="text-[11px]" style={{ color: 'rgba(255,255,255,.55)' }}>Programa de imersão</div>
              </div>
            </div>
          </div>

          {/* Corpo */}
          <div data-exp-body>
            <span
              className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase border rounded-full px-4 py-2 mb-7"
              style={{ borderColor: 'rgba(255,255,255,.20)', color: 'rgba(255,255,255,.65)' }}
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#F0E27A] inline-block" />
              Juma Experience
            </span>
            <h2
              className="font-black text-[clamp(30px,3.5vw,48px)] leading-[1.08] tracking-[-0.02em] text-white mb-6"
            >
              Viva a Juma{' '}
              <em
                className="not-italic"
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#F0E27A' }}
              >
                de perto.
              </em>
            </h2>
            <p className="text-[17px] leading-[1.65] mb-10" style={{ color: 'rgba(255,255,255,.65)' }}>
              Um programa de imersão para conhecer na prática como nossas soluções nascem e funcionam no campo — da pesquisa à colheita, lado a lado com nosso time agronômico.
            </p>
            <Link
              href="/juma-experience"
              className="inline-flex items-center gap-3 font-bold text-[15px] rounded-full px-7 py-4 transition-colors"
              style={{ backgroundColor: '#F0E27A', color: '#1A1A1A' }}
            >
              Quero participar
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
