'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/features/animation/gsap'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

const PRODUCTS = [
  { name: 'Acorda Cana', icon: 'leaf' },
  { name: 'Acorda Ultra', icon: 'spark' },
  { name: 'Aduban', icon: 'seed' },
  { name: 'Aminosan', icon: 'drop' },
  { name: 'Fitofert', icon: 'leaf' },
  { name: 'Kmep Ultra', icon: 'spark' },
  { name: 'Linha Redutan', icon: 'sun' },
  { name: 'Linha Revigo', icon: 'leaf' },
  { name: 'RevigoPhos Amino', icon: 'drop' },
  { name: 'Revigo + Milho', icon: 'seed' },
  { name: 'Revigo + Pasto', icon: 'leaf' },
  { name: 'Supermix', icon: 'spark' },
  { name: 'Revigo Cobre Ultra', icon: 'sun' },
]

function PillIcon({ type }: { type: string }) {
  if (type === 'leaf') return (
    <svg className="w-4 h-4 text-[#F0E27A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 4c-7 0-12 4-12 11 0 2 1 4 2 5 1-7 5-11 10-12" /><path d="M4 20c2-6 6-10 12-12" />
    </svg>
  )
  if (type === 'spark') return (
    <svg className="w-4 h-4 text-[#F0E27A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
    </svg>
  )
  if (type === 'drop') return (
    <svg className="w-4 h-4 text-[#F0E27A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3s-6 6-6 11a6 6 0 0012 0c0-5-6-11-6-11z" />
    </svg>
  )
  if (type === 'seed') return (
    <svg className="w-4 h-4 text-[#F0E27A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <ellipse cx="12" cy="12" rx="5" ry="9" transform="rotate(-30 12 12)" />
    </svg>
  )
  return (
    <svg className="w-4 h-4 text-[#F0E27A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2" />
    </svg>
  )
}

export function HomeMarquee() {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const track = trackRef.current
    if (reduced || !track) return
    const half = track.scrollWidth / 2
    gsap.to(track, {
      x: -half,
      duration: 60,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((v: number) => parseFloat(String(v)) % half),
      },
    })
  }, { dependencies: [reduced] })

  const all = [...PRODUCTS, ...PRODUCTS]

  return (
    <section
      className="overflow-hidden"
      style={{ backgroundColor: '#004B26', paddingBlock: 'clamp(36px,4vw,56px)' }}
      aria-label="Portfólio de produtos Juma"
    >
      <div ref={trackRef} className="flex gap-3.5 w-max will-change-transform">
        {all.map((p, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 pl-4 pr-[22px] py-[14px] rounded-full border text-white text-[15px] font-medium tracking-[-0.01em] whitespace-nowrap"
            style={{ borderColor: 'rgba(255,255,255,.20)', backgroundColor: 'rgba(255,255,255,.07)' }}
          >
            <span
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,.12)' }}
            >
              <PillIcon type={p.icon} />
            </span>
            {p.name}
          </span>
        ))}
      </div>
    </section>
  )
}
