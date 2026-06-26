'use client'

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

const CULTURES = [
  { slug: 'soja',     label: 'Soja',           idx: '01', bg: 'linear-gradient(135deg, #2d6a1f 0%, #4a8c2a 100%)' },
  { slug: 'milho',    label: 'Milho',           idx: '02', bg: 'linear-gradient(135deg, #6b8c22 0%, #8fad2e 100%)' },
  { slug: 'cafe',     label: 'Café',            idx: '03', bg: 'linear-gradient(135deg, #4a2c0e 0%, #7a4a1a 100%)' },
  { slug: 'cana',     label: 'Cana-de-açúcar',  idx: '04', bg: 'linear-gradient(135deg, #3d6b1a 0%, #5e9926 100%)' },
  { slug: 'algodao',  label: 'Algodão',         idx: '05', bg: 'linear-gradient(135deg, #5a7a3a 0%, #829b55 100%)' },
  { slug: 'feijao',   label: 'Feijão',          idx: '06', bg: 'linear-gradient(135deg, #6b3a0e 0%, #9a5e24 100%)' },
  { slug: 'citros',   label: 'Citros',          idx: '07', bg: 'linear-gradient(135deg, #7a5a0a 0%, #b8850f 100%)' },
  { slug: 'batata',   label: 'Batata',          idx: '08', bg: 'linear-gradient(135deg, #5a4a0a 0%, #8f7520 100%)' },
  { slug: 'tomate',   label: 'Tomate',          idx: '09', bg: 'linear-gradient(135deg, #7a1a0e 0%, #b52a1a 100%)' },
  { slug: 'pastagem', label: 'Pastagem',        idx: '10', bg: 'linear-gradient(135deg, #1a5c14 0%, #2e8c24 100%)' },
]

export function HomeCultures() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    const cards = gsap.utils.toArray<HTMLElement>('[data-culture-card]', ref.current)
    gsap.set(cards, { y: 24, opacity: 0 })
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: EASE.reveal,
        })
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
              Culturas
            </span>
            <h2
              className="font-black text-[clamp(32px,4vw,52px)] leading-[1.05] tracking-[-0.02em]"
              style={{ color: '#0F1A0A' }}
            >
              Soluções pensadas<br />para a sua cultura.
            </h2>
          </div>
          <p
            className="max-w-[40ch] text-[17px] leading-[1.6]"
            style={{ color: '#3d4d35' }}
          >
            De grãos a perenes — cada cultura tem suas exigências, e a Juma tem um caminho para cada uma.
          </p>
        </div>

        {/* Grid */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(2, 200px)' }}
        >
          {CULTURES.map((c) => (
            <Link
              key={c.slug}
              href={`/culturas/${c.slug}`}
              data-culture-card
              className="relative rounded-[20px] overflow-hidden group cursor-pointer"
              style={{ background: c.bg }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'rgba(0,0,0,.18)' }}
              />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <span
                  className="text-[11px] font-bold tracking-[0.12em] uppercase"
                  style={{ color: 'rgba(255,255,255,.55)' }}
                >
                  {c.idx}
                </span>
                <span
                  className="text-[16px] font-bold text-white leading-tight tracking-[-0.01em]"
                >
                  {c.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Link "Ver todas" */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/culturas"
            className="inline-flex items-center gap-2 text-[15px] font-semibold"
            style={{ color: '#004B26' }}
          >
            Ver todas as culturas
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  )
}
