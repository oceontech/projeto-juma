'use client'

import { Leaf } from 'lucide-react'

import { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { gsap, ScrollTrigger, useGSAP, SplitText } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

const CULTURES = [
  { slug: 'soja',     label: 'Soja',           idx: '01', bg: 'linear-gradient(135deg, #2d6a1f 0%, #4a8c2a 100%)', image: '/assets/cultures/soja.webp' },
  { slug: 'milho',    label: 'Milho',           idx: '02', bg: 'linear-gradient(135deg, #6b8c22 0%, #8fad2e 100%)', image: '/assets/cultures/milho.webp' },
  { slug: 'cafe',     label: 'Café',            idx: '03', bg: 'linear-gradient(135deg, #4a2c0e 0%, #7a4a1a 100%)', image: '/assets/cultures/cafe.webp' },
  { slug: 'cana',     label: 'Cana-de-açúcar',  idx: '04', bg: 'linear-gradient(135deg, #3d6b1a 0%, #5e9926 100%)', image: '/assets/cultures/cana.webp' },
  { slug: 'algodao',  label: 'Algodão',         idx: '05', bg: 'linear-gradient(135deg, #5a7a3a 0%, #829b55 100%)', image: '/assets/cultures/algodao.webp' },
  { slug: 'feijao',   label: 'Feijão',          idx: '06', bg: 'linear-gradient(135deg, #6b3a0e 0%, #9a5e24 100%)', image: '/assets/cultures/feijao.webp' },
  { slug: 'citros',   label: 'Citros',          idx: '07', bg: 'linear-gradient(135deg, #7a5a0a 0%, #b8850f 100%)', image: '/assets/cultures/limao.webp' },
  { slug: 'batata',   label: 'Batata',          idx: '08', bg: 'linear-gradient(135deg, #5a4a0a 0%, #8f7520 100%)', image: '/assets/cultures/batata.webp' },
  { slug: 'tomate',   label: 'Tomate',          idx: '09', bg: 'linear-gradient(135deg, #7a1a0e 0%, #b52a1a 100%)', image: '/assets/cultures/tomate.webp' },
  { slug: 'pastagem', label: 'Pastagem',        idx: '10', bg: 'linear-gradient(135deg, #1a5c14 0%, #2e8c24 100%)', image: '/assets/cultures/pastagem.webp' },
]

export function HomeCultures() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (reduced || !ref.current) return
    const cards = gsap.utils.toArray<HTMLElement>('[data-culture-card]', ref.current)
    gsap.set(cards, { y: 40, opacity: 0, filter: 'blur(12px)' })

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
      duration: 0.9,
      stagger: 0.08,
      ease: EASE.reveal,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 75%',
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
                <Leaf className="w-3.5 h-3.5 flex-shrink-0 text-[#004B26]" />
                Culturas
              </span>
            </div>
            <h2
              data-title
              className="font-black uppercase leading-[1.05] tracking-tight"
              style={{ color: '#0F1A0A', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              Soluções pensadas<br />para a sua <span className="text-[#004B26] text-highlight inline-block">cultura.</span>
            </h2>
            <span data-gline aria-hidden className="mt-8 block h-[3px] w-12 rounded-full bg-[#004B26]" />
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
          className="grid grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 auto-rows-[140px] sm:auto-rows-[200px]"
        >
          {CULTURES.map((c) => (
            <Link
              key={c.slug}
              href={`/culturas/${c.slug}`}
              data-culture-card
              className="relative rounded-[20px] overflow-hidden group cursor-pointer"
              style={{ background: c.bg }}
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div
                className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 70%)' }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'rgba(0,0,0,.2)' }}
              />
              <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-between z-10 pointer-events-none">
                <span
                  className="text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase"
                  style={{ color: 'rgba(255,255,255,.9)' }}
                >
                  {c.idx}
                </span>
                <span
                  className="text-[13px] sm:text-[16px] font-bold text-white leading-[1.1] tracking-[-0.01em]"
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
            Ver mais sobre as culturas
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  )
}
