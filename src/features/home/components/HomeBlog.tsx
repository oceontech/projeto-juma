'use client'

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

const ARTICLES = [
  {
    category: 'Manejo',
    date: '15 ABR 2026',
    readTime: '6 min de leitura',
    title: 'Como reduzir o estresse da lavoura na seca',
    bg: 'linear-gradient(135deg, #2d4a1a 0%, #4a7a2a 100%)',
  },
  {
    category: 'Nutrição',
    date: '02 ABR 2026',
    readTime: '8 min de leitura',
    title: 'Nutrição na fase certa: o que muda na produtividade da soja',
    bg: 'linear-gradient(135deg, #3a5c20 0%, #5a8a30 100%)',
  },
  {
    category: 'Pecuária',
    date: '18 MAR 2026',
    readTime: '5 min de leitura',
    title: 'Manejo de pastagem: recuperação e ganho de peso',
    bg: 'linear-gradient(135deg, #1a3a12 0%, #2d6020 100%)',
  },
]

export function HomeBlog() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    const cards = gsap.utils.toArray<HTMLElement>('[data-blog-card]', ref.current)
    gsap.set(cards, { y: 24, opacity: 0 })
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        gsap.to(cards, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: EASE.reveal })
      },
    })
  }, { scope: ref })

  return (
    <section
      ref={ref}
      style={{ backgroundColor: '#fff', paddingBlock: 'clamp(80px,8vw,120px)' }}
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
              Do campo para você
            </span>
            <h2
              className="font-black text-[clamp(32px,4vw,52px)] leading-[1.05] tracking-[-0.02em]"
              style={{ color: '#0F1A0A' }}
            >
              Conteúdo que ajuda<br />a produzir melhor.
            </h2>
          </div>
          <p className="max-w-[38ch] text-[17px] leading-[1.6]" style={{ color: '#3d4d35' }}>
            Conhecimento agronômico aplicado, escrito para quem está no dia a dia do campo.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {ARTICLES.map((a, i) => (
            <article
              key={i}
              data-blog-card
              className="rounded-[24px] overflow-hidden flex flex-col"
              style={{ backgroundColor: '#F2F6F2', border: '1px solid rgba(0,0,0,.06)' }}
            >
              {/* Capa */}
              <div className="relative h-[200px] overflow-hidden">
                <div className="w-full h-full" style={{ background: a.bg }} />
                <span
                  className="absolute top-4 left-4 text-[11px] font-bold tracking-[0.10em] uppercase rounded-full px-3 py-1.5"
                  style={{ backgroundColor: 'rgba(0,0,0,.5)', color: '#fff', backdropFilter: 'blur(8px)' }}
                >
                  {a.category}
                </span>
              </div>

              {/* Conteúdo */}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: '#7a8f6e' }}>
                  {a.date} · {a.readTime}
                </span>
                <h3 className="text-[18px] font-bold leading-[1.35] tracking-[-0.01em] flex-1" style={{ color: '#0F1A0A' }}>
                  {a.title}
                </h3>
                <Link
                  href="/materias"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold"
                  style={{ color: '#004B26' }}
                >
                  Ler matéria
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Link "Ver todas" */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/materias"
            className="inline-flex items-center gap-2 text-[15px] font-semibold"
            style={{ color: '#004B26' }}
          >
            Ver todas as matérias
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  )
}
