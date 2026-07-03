'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, SplitText } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

const TESTIMONIALS = [
  {
    text: 'A diferença ficou clara já no primeiro talhão. Lavoura mais uniforme, planta firme mesmo no calor — e na hora de colher, a balança não mente.',
    badge: 'Soja +14 sc/ha · Aminosan',
    name: 'João Carvalho',
    location: 'Taquarivaí · SP',
    initials: 'JC',
  },
  {
    text: 'Buscava um manejo nutricional que fosse além do básico. Com a Juma, ganhei produtividade sem aumentar o custo por hectare — e isso muda o jogo.',
    badge: 'Milho +13,4 sc/ha · Acorda Ultra',
    name: 'Ricardo Marques',
    location: 'Sorriso · MT',
    initials: 'RM',
  },
  {
    text: 'O canavial respondeu rápido. Mais colmo, mais vigor na rebrota, e o pessoal técnico da Juma esteve aqui em cada visita. Parceria de verdade.',
    badge: 'Cana +6,87 t/ha · Acorda Cana',
    name: 'André Souza',
    location: 'Quirinópolis · GO',
    initials: 'AS',
  },
]

export function HomeTestimonials() {
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#004B26] inline-block" />
                Resultados aplicados
              </span>
            </div>
            <h2
              data-title
              className="font-black uppercase leading-[1.05] tracking-tight"
              style={{ color: '#0F1A0A', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              Quem planta com a Juma,<br />colhe <span className="text-[#004B26] text-highlight inline-block">resultado.</span>
            </h2>
            <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-[#004B26]" />
          </div>
          <p className="max-w-[38ch] text-[17px] leading-[1.6]" style={{ color: '#3d4d35' }}>
            Histórias reais de produtores que adotaram nossas soluções e mediram diferença na lavoura.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
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
                {t.text}
              </p>

              {/* Badge resultado */}
              <span
                className="inline-block text-[12px] font-bold tracking-[0.06em] uppercase rounded-full px-3 py-1.5 w-fit"
                style={{ backgroundColor: '#E8EFE2', color: '#004B26' }}
              >
                {t.badge}
              </span>

              {/* Autor */}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,.06)' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[14px]"
                  style={{ backgroundColor: '#004B26', color: '#F0E27A' }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[14px] font-bold" style={{ color: '#0F1A0A' }}>{t.name}</div>
                  <div className="text-[12px]" style={{ color: '#7a8f6e' }}>{t.location}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
