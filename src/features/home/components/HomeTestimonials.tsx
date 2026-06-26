'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { EASE } from '@/features/animation/motion'
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
    gsap.set(cards, { y: 24, opacity: 0 })
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        gsap.to(cards, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: EASE.reveal })
      },
    })
  }, { scope: ref })

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#F2F6F2', paddingBlock: 'clamp(80px,8vw,120px)' }}
    >
      <Container>
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] uppercase border rounded-full px-4 py-2 mb-5"
              style={{ borderColor: 'rgba(0,0,0,.15)', color: '#004B26' }}
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#004B26] inline-block" />
              Resultados aplicados
            </span>
            <h2
              className="font-black text-[clamp(32px,4vw,52px)] leading-[1.05] tracking-[-0.02em]"
              style={{ color: '#0F1A0A' }}
            >
              Quem planta com a Juma,<br />colhe resultado.
            </h2>
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
