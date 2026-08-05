'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import { gsap, useGSAP } from '@/features/animation/gsap'
import { createCharReveal, revealToggleActions } from '@/features/animation/charReveal'
import { DUR, EASE } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Leaf, Target, AlertTriangle, ListChecks, Package, Rocket } from 'lucide-react'
import { HomeCtaFinal } from '@/features/home/components/HomeCtaFinal'
import { useTranslations } from 'next-intl'

const WHATSAPP = 'https://wa.me/5519999648186'

export type CalcProduct = { id: string; label: string; gainPerHa: number }
export type ManagePhase = { label: string; fase: string; products: string[] }
export type RecommendedProduct = { slug: string; name: string; tag: string; desc: string; labelColor: string; image?: string }
export type Challenge = { stage: string; title: string; desc: string }

export const REC_META: Record<string, { name: string, labelColor: string, image?: string }> = {
  'aminosan': { name: 'Aminosan®', labelColor: '#659357', image: '/produtos/aminosan.webp' },
  'fitofert': { name: 'Fitofert', labelColor: '#659357', image: '/produtos/fitofert.webp' },
  'revigophos-amino': { name: 'RevigoPhos Amino', labelColor: '#302783', image: '/produtos/revigophos-amino.webp' },
  'acorda-ultra': { name: 'Acorda Ultra', labelColor: '#008dc2', image: '/produtos/acorda-ultra.webp' },
  'revigo-milho': { name: 'Revigo + Milho', labelColor: '#302783', image: '/produtos/revigo-milho.webp' },
  'acorda-cana': { name: 'Acorda Cana', labelColor: '#79ab34', image: '/produtos/acorda-cana.webp' },
  'redutan-sili-4': { name: 'Redutan NPK Sili-4', labelColor: '#7d252a', image: '/produtos/redutan-sili-5.webp' },
  'revigo-comoni': { name: 'Revigo CoMoNi', labelColor: '#302783', image: '/produtos/revigo-cobre-ultra.webp' },
  'revigo-pasto': { name: 'Revigo + Pasto', labelColor: '#302783', image: '/produtos/revigo-pasto.webp' }
}

export type CultureMeta = {
  gradient: string
  image: string
  managementProducts: string[][]
  calcProducts: CalcProduct[]
}

export const META: Record<string, CultureMeta> = {
  cafe: {
    gradient: 'linear-gradient(165deg, #6c4226 0%, #2a1a10 100%)',
    image: '/assets/cultures/cafe.webp?v=20260731',
    managementProducts: [
      ['FitoFert', 'Aminosan'],
      ['Aminosan', 'Revigo CaB'],
      ['Revigo', 'Revigo Zn Plus', 'Aminosan'],
      ['Revigo Nitrogênio Plus', 'RevigoPHOS Amino', 'FitoFert'],
      ['RevigoPHOS Amino', 'Aminosan', 'Revigo K']
    ],
    calcProducts: [
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 6 },
      { id: 'fitofert', label: 'Fitofert', gainPerHa: 4 },
      { id: 'revigophos', label: 'RevigoPhos Amino', gainPerHa: 3 },
    ],
  },
  soja: {
    gradient: 'linear-gradient(165deg, #5d7a3a, #2c3a18)',
    image: '/assets/cultures/soja.webp?v=20260731b',
    managementProducts: [
      ['Acorda Ultra', 'Aduban'],
      ['Aminosan'],
      ['FitoFert', 'Aminosan'],
      ['RevigoPHOS Amino', 'FitoFert']
    ],
    calcProducts: [
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 12 },
      { id: 'fitofert', label: 'Fitofert', gainPerHa: 7 },
      { id: 'acorda', label: 'Acorda Ultra', gainPerHa: 4 },
    ],
  },
  milho: {
    gradient: 'linear-gradient(165deg, #c3a445, #6b4f15)',
    image: '/assets/cultures/milho.webp?v=20260731b',
    managementProducts: [
      ['Acorda Ultra'],
      ['Aminosan', 'Revigo CoMoNi'],
      ['Aminosan', 'FitoFert'],
      ['RevigoPHOS Amino', 'FitoFert']
    ],
    calcProducts: [
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 10 },
      { id: 'revigo', label: 'Revigo + Milho', gainPerHa: 8 },
      { id: 'fitofert', label: 'Fitofert', gainPerHa: 6 },
    ],
  },
  cana: {
    gradient: 'linear-gradient(165deg, #7fa356, #364a1f)',
    image: '/assets/cultures/cana.webp?v=20260731',
    managementProducts: [
      ['Acorda Cana'],
      ['Aminosan', 'Revigo CoMoNi'],
      ['Aminosan', 'RevigoPHOS Amino']
    ],
    calcProducts: [
      { id: 'acorda', label: 'Acorda Cana', gainPerHa: 8 },
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 5 },
    ],
  },
  algodao: {
    gradient: 'linear-gradient(165deg, #e7dfc9, #87826a)',
    image: '/assets/cultures/algodao.webp?v=20260731',
    managementProducts: [
      ['Acorda Ultra'],
      ['Aminosan', 'Revigo CoMoNi'],
      ['FitoFert', 'RevigoPHOS Amino']
    ],
    calcProducts: [
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 6 },
      { id: 'fitofert', label: 'Fitofert', gainPerHa: 4 },
    ],
  },
  feijao: {
    gradient: 'linear-gradient(165deg, #8b5e3b, #2f1f12)',
    image: '/assets/cultures/feijao.webp?v=20260731b',
    managementProducts: [
      ['Acorda Ultra', 'Aduban'],
      ['Aminosan'],
      ['FitoFert', 'Aminosan']
    ],
    calcProducts: [
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 8 },
      { id: 'fitofert', label: 'Fitofert', gainPerHa: 5 },
    ],
  },
  citros: {
    gradient: 'linear-gradient(165deg, #d3a52a, #5e4910)',
    image: '/assets/cultures/limao.webp?v=20260731',
    managementProducts: [
      ['Aminosan', 'FitoFert'],
      ['Aminosan', 'Revigo CaB'],
      ['Revigo CoMoNi', 'RevigoPHOS Amino']
    ],
    calcProducts: [
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 5 },
      { id: 'fitofert', label: 'Fitofert', gainPerHa: 4 },
    ],
  },
  batata: {
    gradient: 'linear-gradient(165deg, #a08562, #463623)',
    image: '/assets/cultures/batata.webp?v=20260731',
    managementProducts: [
      ['Aminosan'],
      ['FitoFert', 'Revigo CoMoNi'],
      ['RevigoPHOS Amino', 'Aminosan']
    ],
    calcProducts: [
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 7 },
      { id: 'fitofert', label: 'Fitofert', gainPerHa: 5 },
    ],
  },
  tomate: {
    gradient: 'linear-gradient(165deg, #b73a2a, #4e1410)',
    image: '/assets/cultures/tomate.webp?v=20260731',
    managementProducts: [
      ['Aminosan', 'Revigo CoMoNi'],
      ['FitoFert', 'Aminosan'],
      ['Revigo CaB', 'RevigoPHOS Amino']
    ],
    calcProducts: [
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 7 },
      { id: 'fitofert', label: 'Fitofert', gainPerHa: 5 },
    ],
  },
  pastagem: {
    gradient: 'linear-gradient(165deg, #80a558, #2c3e1d)',
    image: '/assets/cultures/pastagem.webp?v=20260731',
    managementProducts: [
      ['Revigo CoMoNi', 'Aminosan'],
      ['Revigo + Pasto']
    ],
    calcProducts: [
      { id: 'revigo', label: 'Revigo + Pasto', gainPerHa: 6 },
      { id: 'aminosan', label: 'Aminosan', gainPerHa: 4 },
    ],
  },
}

export type CultureData = CultureMeta & {
  name: string
  badge: string
  description: string
  actua: string[]
  challenges: Challenge[]
  management: ManagePhase[]
  recommended: RecommendedProduct[]
}

/* ─── Shared UI components ─── */

function Eyebrow({ dark, icon: Icon, children }: { dark?: boolean; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-[7px] rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] border ${
        dark ? 'border-white/35 text-white' : 'border-black/[0.18] text-[#1A1A1A]'
      }`}
    >
      {Icon ? (
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-[#F0E27A]' : 'text-[#004B26]'}`} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dark ? 'bg-[#F0E27A]' : 'bg-[#004B26]'}`} />
      )}
      {children}
    </span>
  )
}

function SectionHead({ eyebrow, icon, title, lede }: { eyebrow: string; icon?: React.ElementType; title: React.ReactNode; lede?: string }) {
  return (
    <div className="flex flex-col gap-[18px] mb-14 w-full">
      <div data-section-kicker><Eyebrow icon={icon}>{eyebrow}</Eyebrow></div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
        <h2 data-section-title className="m-0 flex-1 font-black uppercase leading-[1.05] tracking-tight text-[#1A1A1A]" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
          {title}
        </h2>
        {lede && (
          <p data-section-lede className="text-[#5A5A57] leading-[1.55] w-full md:w-auto md:max-w-[40ch] shrink-0 text-[clamp(17px,1.25vw,20px)] m-0">
            {lede}
          </p>
        )}
      </div>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[14px] h-[14px]">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function MobileChallengesMarquee({ challenges }: { challenges: Challenge[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [pausedIndex, setPausedIndex] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const reduced = useReducedMotion()

  const items = [...challenges, ...challenges, ...challenges]

  const tlRef = useRef<gsap.core.Tween | null>(null)

  useGSAP(() => {
    if (reduced || !trackRef.current) return
    const track = trackRef.current
    const setWidth = 296 * challenges.length

    tlRef.current = gsap.to(track, {
      x: -setWidth,
      ease: 'none',
      duration: challenges.length * 4.5,
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % setWidth)
      }
    })

    return () => { tlRef.current?.kill() }
  }, { scope: containerRef, dependencies: [reduced, challenges.length] })

  useEffect(() => {
    if (tlRef.current) {
      if (isPaused) {
        tlRef.current.pause()
      } else {
        tlRef.current.play()
      }
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
    <div ref={containerRef} className="w-full max-w-full relative overflow-hidden block lg:hidden pb-12 pt-4">
      <div ref={trackRef} className="flex gap-4 w-max pl-6">
        {items.map((c, idx) => {
          const originalIndex = idx % challenges.length
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
              className={`rounded-[20px] flex flex-col gap-3 p-[26px_22px_24px] w-[280px] shrink-0 transition-all duration-500 cursor-pointer ${isClicked ? 'scale-[1.05] shadow-2xl z-10 opacity-100' : isPaused ? 'scale-[0.98] opacity-50 shadow-sm z-0' : 'scale-100 opacity-100 hover:scale-[1.02]'}`}
              style={{ backgroundColor: originalIndex % 2 === 0 ? '#EFE9DB' : '#E8EFE2' }}
            >
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#004B26]">
                {c.stage}
              </span>
              <h4 className="m-0 text-[18px] font-[650] tracking-[-0.01em] text-[#1A1A1A] leading-snug">{c.title}</h4>
              <p className="m-0 text-[13.5px] text-[#5A5A57] leading-[1.5]">{c.desc}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function CulturePage({ slug }: { slug: string }) {
  const tPage = useTranslations('culturePage')
  const tData = useTranslations('cultureData')
  const meta = META[slug]
  
  const culture: CultureData | null = meta ? {
    ...meta,
    name: tData(`${slug}.name`),
    badge: tData(`${slug}.badge`),
    description: tData(`${slug}.description`),
    actua: tData.raw(`${slug}.actua`) as string[],
    challenges: Object.values(tData.raw(`${slug}.challenges`) as Record<string, Challenge>),
    management: Object.entries(tData.raw(`${slug}.management`) as Record<string, { label: string; fase: string }>).map(([k, v], i) => ({
      label: v.label,
      fase: v.fase,
      products: meta.managementProducts[i] || []
    })),
    recommended: Object.entries(tData.raw(`${slug}.recommended`) as Record<string, { tag: string; desc: string }>).map(([recSlug, recData]) => ({
      slug: recSlug,
      name: REC_META[recSlug]?.name || recSlug,
      tag: recData.tag,
      desc: recData.desc,
      labelColor: REC_META[recSlug]?.labelColor || '#000000',
      image: REC_META[recSlug]?.image
    }))
  } : null;

  const reduced = useReducedMotion()
  const heroRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !heroRef.current) return
      const title = heroRef.current.querySelector('[data-hero-title]')
      const els = heroRef.current.querySelectorAll('[data-hero-el]')
      
      const reveal = createCharReveal(title as HTMLElement | null)
      reveal?.hide()
      
      gsap.set(els, { y: 24, opacity: 0 })
      
      const tl = gsap.timeline({ delay: 0.15 })
      tl.to(els, { y: 0, opacity: 1, duration: DUR.sub, stagger: 0.04, ease: EASE.reveal })
      reveal?.playIn(tl, '<0.1')

      return () => reveal?.revert()
    },
    { scope: heroRef, dependencies: [reduced] },
  )

  useGSAP(
    () => {
      if (reduced || !bodyRef.current) return
      const sections = bodyRef.current.querySelectorAll('[data-section]')
      
      const reveals: NonNullable<ReturnType<typeof createCharReveal>>[] = []
      
      sections.forEach((section) => {
        const title = section.querySelector('[data-section-title]')
        const kicker = section.querySelector('[data-section-kicker]')
        const lede = section.querySelector('[data-section-lede]')
        const contentEls = section.querySelectorAll('[data-animate-content]')
        
        const reveal = createCharReveal(title as HTMLElement | null)
        if (reveal) {
          reveals.push(reveal)
          reveal.hide()
        }
        
        if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
        if (lede) gsap.set(lede, { y: 14, opacity: 0 })
        if (contentEls.length > 0) gsap.set(contentEls, { y: 24, opacity: 0 })
        gsap.set(section, { y: 32, opacity: 0 })
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom top',
            toggleActions: revealToggleActions(),
          },
          defaults: { ease: EASE.reveal }
        })
        
        tl.to(section, { y: 0, opacity: 1, duration: 0.8 })
        if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub }, '<0.1')
        reveal?.playIn(tl, '<0.1')
        if (lede) tl.to(lede, { y: 0, opacity: 1, duration: DUR.sub }, '<0.2')
        if (contentEls.length > 0) {
          tl.to(contentEls, { y: 0, opacity: 1, duration: 0.45, stagger: 0.03 }, '<0.2')
        }
      })
      
      return () => reveals.forEach((r) => r.revert())
    },
    { scope: bodyRef, dependencies: [reduced] },
  )

  if (!culture) return null

  return (
    <div className="bg-[#F2F6F2]">
      {/* ══ HERO ══ */}
      <div ref={heroRef} className="relative w-full min-h-[90vh] flex flex-col justify-center items-center pt-[140px] pb-[80px] overflow-hidden bg-black">
        {/* Fullscreen Image */}
        <Image src={culture.image} alt={culture.name} fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        
        <Container className="relative z-10 w-full flex flex-col items-center">
          {/* Glassmorphism Card */}
          <div data-hero-el className="bg-black/30 backdrop-blur-md border border-white/20 p-8 md:p-14 rounded-3xl flex flex-col items-center text-center max-w-[840px] w-full shadow-2xl">
            <span className="mb-6">
              <Eyebrow dark icon={Leaf}>{tPage('heroEyebrow', { name: culture.name })}</Eyebrow>
            </span>
            <h1
              data-hero-title
              className="m-0 mb-6 font-black uppercase leading-[1.05] tracking-tight text-white drop-shadow-md"
              style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
            >
              {tPage.rich('heroTitle', { highlight: (chunks) => <span className="text-[#e1d78b] text-highlight inline-block">{chunks}</span> })}
            </h1>
            <p
              className="text-white/90 leading-[1.55] m-0 mb-10 max-w-[54ch] drop-shadow-sm font-medium"
              style={{ fontSize: 'clamp(17px,1.25vw,20px)' }}
            >
              {culture.description}
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-4">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 h-[54px] px-[28px] rounded-full font-bold uppercase tracking-wider text-sm text-white bg-[#004B26] hover:bg-[#003A1D] transition-all hover:-translate-y-px shadow-lg"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-4 h-4">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                {tPage('whatsappBtn')}
              </a>
              <a
                href="#manejo"
                className="inline-flex items-center gap-2.5 h-[54px] px-[28px] rounded-full font-bold uppercase tracking-wider text-sm text-white border border-white/30 hover:bg-white/10 transition-all hover:-translate-y-px"
              >
                {tPage('seeManagementBtn')}
                <ArrowIcon />
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* ══ SEÇÕES DINÂMICAS ══ */}
      <div ref={bodyRef}>

        {/* Como a Juma atua */}
        {culture.actua.length > 0 && (
          <section data-section className="py-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={Target}
                eyebrow={tPage('actuaEyebrow')}
                title={tPage.rich('actuaTitle', { name: culture.name.toLowerCase(), br: () => <br /> })}
                lede={tPage('actuaLede')}
              />
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 list-none p-0 m-0">
                {culture.actua.map((item, i) => (
                  <li
                    key={i}
                    data-animate-content
                    className="flex items-start gap-3.5 bg-white border border-black/10 rounded-[14px] p-[20px_22px] text-[15.5px] text-[#2A2A28]"
                  >
                    <span className="text-[13px] font-semibold text-[#004B26] tracking-[0.04em] flex-shrink-0 w-[22px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}

        {/* Desafios por fase */}
        {culture.challenges.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={AlertTriangle}
                eyebrow={tPage('challengesEyebrow')}
                title={tPage.rich('challengesTitle', { name: culture.name.toLowerCase(), br: () => <br /> })}
                lede={tPage('challengesLede')}
              />
              <div
                className="hidden lg:grid gap-3.5"
                style={{ gridTemplateColumns: `repeat(${Math.min(culture.challenges.length, 5)}, 1fr)` }}
              >
                {culture.challenges.map((c, i) => (
                  <article
                    key={i}
                    data-animate-content
                    className="rounded-[20px] flex flex-col gap-3 p-[26px_22px_24px] min-h-[230px]"
                    style={{ backgroundColor: i % 2 === 0 ? '#EFE9DB' : '#E8EFE2' }}
                  >
                    <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#004B26]">
                      {c.stage}
                    </span>
                    <h4 className="m-0 text-subtitle text-[18px] font-[650] tracking-[-0.01em] text-[#1A1A1A] leading-snug">{c.title}</h4>
                    <p className="m-0 text-[13.5px] text-[#5A5A57] leading-[1.5]">{c.desc}</p>
                  </article>
                ))}
              </div>
              <MobileChallengesMarquee challenges={culture.challenges} />
            </Container>
          </section>
        )}

        {/* Manejo por fase */}
        {culture.management.length > 0 && (
          <section id="manejo" data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={ListChecks}
                eyebrow={tPage('managementEyebrow')}
                title={tPage.rich('managementTitle', { name: culture.name.toLowerCase(), br: () => <br /> })}
                lede={tPage('managementLede')}
              />
              <div
                data-animate-content
                className="mt-9 bg-white border border-black/10 rounded-[24px] overflow-hidden"
                style={{ boxShadow: '0 1px 2px rgba(20,30,20,.04), 0 12px 32px -18px rgba(20,30,20,.18)' }}
              >
                {culture.management.map((phase, i) => (
                  <div
                    key={i}
                    className="grid items-stretch md:items-center border-t border-black/10 first:border-t-0 grid-cols-[120px_1fr] md:grid-cols-[220px_1fr]"
                  >
                    {/* Fase */}
                    <div className="flex flex-col gap-1 md:gap-1.5 p-4 md:p-[28px] bg-[#E8EFE2] border-r border-black/10 h-full justify-center">
                      <small className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.08em] text-[#004B26] opacity-70">
                        {phase.label}
                      </small>
                      <span className="text-[14px] md:text-[17px] font-[650] tracking-[-0.01em] text-[#1A1A1A] leading-tight md:leading-normal">
                        {phase.fase}
                      </span>
                    </div>
                    {/* Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 p-4 md:p-[22px_28px]">
                      {phase.products.map((prod, j) => (
                        <React.Fragment key={j}>
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-full bg-[#DDE6C8] text-[#004B26] text-[12.5px] md:text-[13.5px] font-semibold leading-none">
                            {prod}
                          </span>
                          {j < phase.products.length - 1 && (
                            <span className="text-[12px] md:text-[14px] text-[#7C7C78]">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Produtos recomendados */}
        {culture.recommended.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={Package}
                eyebrow={tPage('recommendedEyebrow')}
                title={tPage.rich('recommendedTitle', { name: culture.name.toLowerCase(), br: () => <br /> })}
                lede={tPage('recommendedLede')}
              />
              <div
                className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                {culture.recommended.map((prod) => (
                  <Link
                    key={prod.slug}
                    data-animate-content
                    href={`/produtos/${prod.slug}`}
                    className="group flex flex-col rounded-[24px] overflow-hidden border border-black/10 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(20,30,20,.04),0_24px_60px_-32px_rgba(20,30,20,.25)] transition-all duration-300"
                  >
                    <div
                      className="relative flex items-center justify-center overflow-hidden"
                      style={{ aspectRatio: '4/3', background: 'radial-gradient(80% 60% at 50% 70%, rgba(0,0,0,.10), transparent 70%), linear-gradient(160deg, #E8EFE2, #E4ECEA)' }}
                    >
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full text-[#004B26] bg-[#DDE6C8] z-10 shadow-sm">
                        {prod.tag}
                      </span>
                      {prod.image ? (
                        <div className="relative z-10 h-full w-full flex items-center justify-center p-6 transition-transform duration-500 group-hover:scale-105">
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            width={300}
                            height={400}
                            quality={90}
                            className="object-contain h-full w-auto drop-shadow-xl"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-center gap-1 rounded-[6px] text-center text-white px-2 py-3 w-[6rem] relative z-10"
                          style={{ backgroundColor: prod.labelColor }}
                        >
                          <small style={{ fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>Juma Agro</small>
                          <b style={{ fontSize: 14, fontWeight: 750, letterSpacing: '-0.01em' }}>{prod.name.replace('®', '').replace('+', '').trim()}</b>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1 bg-white">
                      <h3 className="m-0 mb-2 text-subtitle text-[19px] font-[650] tracking-[-0.01em] text-[#1A1A1A] leading-snug">{prod.name}</h3>
                      <p className="m-0 text-[14.5px] text-[#5A5A57] leading-[1.5] flex-1 mb-4">{prod.desc}</p>
                      <div className="self-end flex items-center justify-center h-[42px] w-[42px] rounded-full border border-black/[0.18] text-[#1A1A1A]/60 group-hover:bg-[#004B26] group-hover:border-[#004B26] group-hover:text-white transition-all">
                        <ArrowIcon />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Calculadora — removida temporariamente, ver CultureCalculator.tsx */}

        {/* CTA Final */}
        <HomeCtaFinal />
      </div>
    </div>
  )
}
