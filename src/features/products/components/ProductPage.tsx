'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import { gsap, ScrollTrigger, useGSAP, SplitText } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { AlertTriangle, Star, Activity, BarChart3, Clock, LayoutGrid, Camera, Package, Rocket, ListChecks } from 'lucide-react'
import { HomeCtaFinal } from '@/features/home/components/HomeCtaFinal'

const WHATSAPP = 'https://wa.me/5519999648186'

type Problem = { title: string; desc: string; icon: 'seed' | 'sun' | 'drop' | 'leaf' | 'shield' | 'chart' }
type Benefit = { title: string; desc: string }
type Stage = { num: string; label: string; title: string; desc: string }
type Result = { value: string; unit: string; desc: string }
type Related = { slug: string; name: string; tag: string; desc: string; labelColor: string; image?: string }

export type ProductMeta = {
  labelColor: string
  problemsMeta: ('seed' | 'sun' | 'drop' | 'leaf' | 'shield' | 'chart')[]
  resultsMeta: { value: string; unit: string }[]
  relatedMeta: { slug: string; labelColor: string }[]
  image?: string
}

const META: Record<string, ProductMeta> = {
  'aminosan': {
    labelColor: '#659357',
    problemsMeta: ['seed', 'sun', 'drop'],
    resultsMeta: [{ value: '+14', unit: 'sc/ha' }, { value: '+10', unit: 'sc/ha' }, { value: '+38', unit: '%' }],
    relatedMeta: [{ slug: 'fitofert', labelColor: '#659357' }, { slug: 'linha-revigo', labelColor: '#302783' }, { slug: 'revigophos-amino', labelColor: '#302783' }],
    image: '/produtos/aminosan-20l.png'
  },
  'fitofert': {
    labelColor: '#659357',
    problemsMeta: ['leaf', 'chart', 'sun'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'revigophos-amino', labelColor: '#302783' }],
    image: '/produtos/fitofert-20l.png'
  },
  'linha-revigo': {
    labelColor: '#302783',
    problemsMeta: ['leaf', 'sun', 'drop'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'fitofert', labelColor: '#659357' }],
    image: '/produtos/revigo-comoni-1l.png'
  },
  'revigophos-amino': {
    labelColor: '#302783',
    problemsMeta: ['sun', 'drop', 'seed'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'fitofert', labelColor: '#659357' }],
    image: '/produtos/revigophos-amino-20l.png'
  },
  'revigo-cobre-ultra': {
    labelColor: '#302783',
    problemsMeta: ['leaf', 'shield'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'linha-revigo', labelColor: '#302783' }, { slug: 'aminosan', labelColor: '#659357' }],
    image: '/produtos/revigo-cobre-ultra-20l.png'
  },
  'acorda-cana': {
    labelColor: '#79ab34',
    problemsMeta: ['seed', 'drop'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'linha-redutan', labelColor: '#7d252a' }],
    image: '/produtos/acorda-cana-20l.png'
  },
  'acorda-ultra': {
    labelColor: '#008dc2',
    problemsMeta: ['chart', 'drop'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'aduban', labelColor: '#ad1115' }],
    image: '/produtos/acorda-ultra-10l.png'
  },
  'aduban': {
    labelColor: '#ad1115',
    problemsMeta: ['drop', 'seed'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'acorda-ultra', labelColor: '#008dc2' }, { slug: 'aminosan', labelColor: '#659357' }],
    image: '/produtos/aduban-20l.png'
  },
  'kmep-ultra': {
    labelColor: '#ad1115',
    problemsMeta: ['shield', 'chart'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'linha-redutan', labelColor: '#7d252a' }, { slug: 'supermix', labelColor: '#388123' }],
    image: '/produtos/kmep-ultra-20l.png'
  },
  'linha-redutan': {
    labelColor: '#7d252a',
    problemsMeta: ['sun', 'drop'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'supermix', labelColor: '#388123' }, { slug: 'kmep-ultra', labelColor: '#ad1115' }],
    image: '/produtos/redutan-npk-sili-4-1l.png'
  },
  'supermix': {
    labelColor: '#388123',
    problemsMeta: ['drop', 'chart'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'linha-redutan', labelColor: '#7d252a' }, { slug: 'kmep-ultra', labelColor: '#ad1115' }],
    image: '/produtos/supermix-20l.png'
  },
  'revigo-milho': {
    labelColor: '#302783',
    problemsMeta: ['chart', 'sun'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'fitofert', labelColor: '#659357' }],
    image: '/produtos/revigo-milho-20l.png'
  },
  'revigo-pasto': {
    labelColor: '#302783',
    problemsMeta: ['leaf', 'chart'],
    resultsMeta: [],
    relatedMeta: [{ slug: 'aminosan', labelColor: '#659357' }, { slug: 'linha-redutan', labelColor: '#7d252a' }],
    image: '/produtos/revigo-pasto-20l.png'
  }
}

type ProductData = ProductMeta & {
  name: string
  tag: string
  description: string
  crops: string[]
  problems: Problem[]
  benefits: Benefit[]
  stages: Stage[]
  results: Result[]
  related: Related[]
}

/* ─── Icons ─── */
function ProblemIcon({ type }: { type: Problem['icon'] }) {
  const cls = 'w-[22px] h-[22px]'
  if (type === 'seed') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22V12M12 12C12 7 7 4 3 4c0 4.5 2.5 8 9 8zM12 12c0-5 5-8 9-8-0 4.5-2.5 8-9 8z" />
    </svg>
  )
  if (type === 'sun') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
  if (type === 'drop') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  )
  if (type === 'leaf') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 20A7 7 0 0 1 4 13c0-7 7-11 7-11s7 4 7 11a7 7 0 0 1-7 7z" /><line x1="11" y1="20" x2="11" y2="13" />
    </svg>
  )
  if (type === 'shield') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[14px] h-[14px]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[14px] h-[14px]">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

/* ─── Eyebrow badge ─── */
function Eyebrow({ dark, icon: Icon, children }: { dark?: boolean; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-[7px] rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] border ${
        dark
          ? 'border-white/35 text-white'
          : 'border-black/[0.18] text-[#1A1A1A]'
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

/* ─── Section header (eyebrow + title left, lede right) ─── */
function SectionHead({ eyebrow, icon, title, lede }: { eyebrow: string; icon?: React.ElementType; title: React.ReactNode; lede?: string }) {
  return (
    <div className="flex flex-col gap-[18px] mb-14 w-full">
      <div data-section-kicker><Eyebrow icon={icon}>{eyebrow}</Eyebrow></div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
        <h2 data-section-title className="m-0 flex-1 font-black uppercase leading-[1.05] tracking-tight text-[#1A1A1A]" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 720 }}>
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

export function ProductPage({ slug }: { slug: string }) {
  const tPage = useTranslations('productPage')
  const tData = useTranslations('productData')
  const meta = META[slug]
  
  const product: ProductData | null = meta ? {
    ...meta,
    name: tData(`${slug}.name`),
    tag: tData(`${slug}.tag`),
    description: tData(`${slug}.description`),
    crops: tData.raw(`${slug}.crops`) as string[],
    problems: Object.values(tData.raw(`${slug}.problems`) as Record<string, {title: string, desc: string}>).map((p, i) => ({ ...p, icon: meta.problemsMeta[i] })),
    benefits: Object.values(tData.raw(`${slug}.benefits`) as Record<string, {title: string, desc: string}>),
    stages: Object.entries(tData.raw(`${slug}.stages`) as Record<string, {label: string, title: string, desc: string}>).map(([k, s], i) => ({ ...s, num: `0${i+1}` })),
    results: Object.values(tData.raw(`${slug}.results`) as Record<string, {desc: string}>).map((r, i) => ({ ...r, ...meta.resultsMeta[i] })),
    related: Object.entries(tData.raw(`${slug}.related`) as Record<string, {name: string, tag: string, desc: string}>).map(([relSlug, r], i) => ({ slug: relSlug, ...r, labelColor: meta.relatedMeta[i]?.labelColor || '#000', image: META[relSlug]?.image }))
  } : null;
  const reduced = useReducedMotion()
  const heroRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !heroRef.current) return
      const title = heroRef.current.querySelector('[data-hero-title]')
      const els = heroRef.current.querySelectorAll('[data-hero-el]')
      
      let split: SplitText | null = null
      if (title) {
        split = new SplitText(title, { type: 'chars,words' })
        gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      }
      
      gsap.set(els, { y: 24, opacity: 0 })
      
      const tl = gsap.timeline({ delay: 0.15 })
      tl.to(els, { y: 0, opacity: 1, duration: DUR.sub, stagger: 0.04, ease: EASE.reveal })
      if (split) {
        tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char, ease: EASE.reveal }, '<0.1')
      }

      return () => split?.revert()
    },
    { scope: heroRef, dependencies: [reduced] },
  )

  useGSAP(
    () => {
      if (reduced || !bodyRef.current) return
      const sections = bodyRef.current.querySelectorAll('[data-section]')
      
      const splits: SplitText[] = []
      
      sections.forEach((section) => {
        const title = section.querySelector('[data-section-title]')
        const kicker = section.querySelector('[data-section-kicker]')
        const lede = section.querySelector('[data-section-lede]')
        const contentEls = section.querySelectorAll('[data-animate-content]')
        
        let split: SplitText | null = null
        if (title) {
          split = new SplitText(title, { type: 'chars,words' })
          splits.push(split)
          gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
        }
        
        if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
        if (lede) gsap.set(lede, { y: 14, opacity: 0 })
        if (contentEls.length > 0) gsap.set(contentEls, { y: 24, opacity: 0 })
        gsap.set(section, { y: 32, opacity: 0 })
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse',
          },
          defaults: { ease: EASE.reveal }
        })
        
        tl.to(section, { y: 0, opacity: 1, duration: 0.8 })
        if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub }, '<0.1')
        if (split) {
          tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, '<0.1')
        }
        if (lede) tl.to(lede, { y: 0, opacity: 1, duration: DUR.sub }, '<0.2')
        if (contentEls.length > 0) {
          tl.to(contentEls, { y: 0, opacity: 1, duration: 0.45, stagger: 0.03 }, '<0.2')
        }
      })
      
      return () => splits.forEach(s => s.revert())
    },
    { scope: bodyRef, dependencies: [reduced] },
  )

  if (!product) return null

  const nameShort = product.name.replace('®', '').replace('+', '').trim()

  return (
    <div className="bg-[#F2F6F2]">
      <Container>

        {/* ══ HERO (PDP TOP) ══ */}
        <div ref={heroRef} className="pt-8 pb-16 md:pb-24">
          {/* Breadcrumb */}
          <nav data-hero-el className="flex items-center gap-2 mb-8 text-[12.5px] font-medium uppercase tracking-[0.04em] text-[#5A5A57]">
            <Link href="/produtos" className="hover:text-[#1A1A1A] border-b border-transparent hover:border-[#1A1A1A] transition-colors pb-px">
              {tPage('breadcrumb')}
            </Link>
            <span className="text-[#7C7C78]">·</span>
            <span className="text-[#1A1A1A]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-20 items-start">

            {/* Visual — CSS bottle */}
            <div
              data-hero-el
              className="relative aspect-[4/5] rounded-[24px] overflow-hidden grid place-items-center"
              style={{
                background: 'radial-gradient(80% 60% at 50% 70%, rgba(0,0,0,.10), transparent 70%), linear-gradient(160deg, #E8EFE2, #E4ECEA)',
                boxShadow: '0 1px 2px rgba(20,30,20,.04), 0 24px 60px -32px rgba(20,30,20,.25)',
              }}
            >
              <div className="relative z-10 h-full w-full flex items-center justify-center p-8 transition-transform duration-500 hover:scale-105">
                <Image
                  src={product.image || "/produtos/placeholder-produto.png"}
                  alt={`Imagem do produto ${product.name}`}
                  width={1000}
                  height={1500}
                  quality={100}
                  className="object-contain h-full w-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col lg:pt-4">
              {/* Category tag */}
              <span
                data-hero-el
                className="inline-flex self-start rounded-full text-[11px] font-bold uppercase tracking-[0.14em] px-3.5 py-[7px] text-[#004B26] bg-[#DDE6C8] whitespace-nowrap mb-4"
              >
                {product.tag}
              </span>

              <h1
                data-hero-title
                className="text-[#1A1A1A] m-0 mb-[22px] uppercase leading-[1.05] tracking-tight"
                style={{ fontSize: 'clamp(48px,5.6vw,88px)', fontWeight: 740 }}
              >
                {product.name}
              </h1>

              <p
                data-hero-el
                className="text-[#2A2A28] leading-[1.55] mb-8 max-w-[50ch] m-0"
                style={{ fontSize: 17 }}
              >
                {product.description}
              </p>

              {/* Crops */}
              <div data-hero-el className="mb-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#1A1A1A] block mb-3">
                  Culturas indicadas
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.crops.map((crop) => (
                    <span
                      key={crop}
                      className="inline-flex items-center gap-[7px] text-[13px] font-medium px-3.5 py-[7px] rounded-full bg-white border border-black/10 text-[#1A1A1A]"
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: product.labelColor }} />
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div data-hero-el className="flex flex-wrap gap-3">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 h-[54px] px-[26px] rounded-full text-[15px] font-semibold text-white bg-[#004B26] hover:bg-[#003A1D] transition-all hover:-translate-y-px"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-4 h-4">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  {tPage('whatsappBtn')}
                </a>

              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ══ SEÇÕES DINÂMICAS ══ */}
      <div ref={bodyRef}>

        {/* Problemas */}
        {product.problems.length > 0 && (
          <section data-section className="py-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={AlertTriangle}
                eyebrow={tPage("problemsEyebrow")}
                title={tPage.rich("problemsTitle", { name: nameShort, br: () => <br /> })}
                lede={tPage("problemsLede")}
              />
              <div
                className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                {product.problems.map((p, i) => (
                  <article
                    key={i}
                    data-animate-content
                    className="group flex flex-col gap-2 bg-transparent border border-black/15 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/30 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <AlertTriangle className="w-[18px] h-[18px] text-[#ad1115] shrink-0" />
                      <h3 className="m-0 text-[16px] text-subtitle font-bold tracking-tight text-[#1A1A1A] leading-snug">
                        {p.title}
                      </h3>
                    </div>
                    <p className="m-0 text-[14.5px] text-subtitle text-[#5A5A57] leading-relaxed">
                      {p.desc}
                    </p>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Benefícios */}
        {product.benefits.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={Star}
                eyebrow={tPage("benefitsEyebrow")}
                title={tPage.rich("benefitsTitle", { name: nameShort, br: () => <br /> })}
                lede={tPage("benefitsLede")}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.benefits.map((b, i) => (
                  <div
                    key={i}
                    data-animate-content
                    className="flex items-start gap-3.5 p-[22px_24px] bg-white border border-black/10 rounded-[14px]"
                  >
                    <span className="flex-shrink-0 w-[30px] h-[30px] rounded-full bg-[#004B26] text-[#F0E27A] grid place-items-center">
                      <CheckIcon />
                    </span>
                    <div>
                      <b className="block text-[15.5px] font-semibold tracking-[-0.01em] text-[#1A1A1A] mb-1 leading-tight">{b.title}</b>
                      <span className="text-[14px] text-[#5A5A57] leading-[1.5]">{b.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Modo de uso */}
        {product.stages.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={ListChecks}
                eyebrow={tPage("stagesEyebrow")}
                title={tPage.rich("stagesTitle", { name: nameShort, br: () => <br /> })}
                lede={tPage("stagesLede")}
              />
              <div
                className="grid gap-[2px] mt-8 rounded-[14px] overflow-hidden"
                style={{ gridTemplateColumns: `repeat(${product.stages.length}, 1fr)` }}
              >
                {product.stages.map((s, i) => (
                  <div
                    key={i}
                    data-animate-content
                    className="flex flex-col gap-2.5 p-[24px_20px] min-h-[140px]"
                    style={{ backgroundColor: i % 2 === 0 ? '#DDE6C8' : '#E2EAD3' }}
                  >
                    <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#004B26] opacity-60">
                      {s.num} · {s.label}
                    </span>
                    <h4 className="m-0 text-[17px] font-[650] tracking-[-0.01em] text-[#1A1A1A] leading-[1.15]">{s.title}</h4>
                    <p className="m-0 text-[13.5px] text-[#5A5A57] leading-[1.45]">{s.desc}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Resultados */}
        {product.results.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={Activity}
                eyebrow={tPage("resultsEyebrow")}
                title={tPage.rich("resultsTitle", { name: nameShort, br: () => <br /> })}
                lede={tPage("resultsLede")}
              />
              <div
                className="grid gap-[18px]"
                style={{ gridTemplateColumns: `repeat(${product.results.length}, 1fr)` }}
              >
                {product.results.map((r, i) => (
                  <div
                    key={i}
                    data-animate-content
                    className="relative overflow-hidden rounded-[24px] flex flex-col gap-3.5 p-[36px_30px_32px] min-h-[240px]"
                    style={{ backgroundColor: i === product.results.length - 1 ? '#659357' : '#004B26' }}
                  >
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        inset: '-50% -20% auto auto',
                        width: '80%',
                        height: '80%',
                        background: 'radial-gradient(circle, rgba(240,226,122,.16), transparent 70%)',
                      }}
                    />
                    <span className="relative text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/60">
                      Resultado
                    </span>
                    <div
                      className="relative text-[#F0E27A] leading-[0.95] font-[740] tracking-[-0.035em]"
                      style={{ fontSize: 'clamp(48px,5.4vw,80px)', fontFeatureSettings: '"tnum"' }}
                    >
                      {r.value}<small className="text-[0.42em] align-super font-semibold text-white/78 ml-1">{r.unit}</small>
                    </div>
                    <p className="relative m-0 mt-auto text-[14.5px] text-white/78 leading-[1.5]">{r.desc}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Galeria */}
        <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
          <Container>
            <SectionHead
              icon={Camera}
              eyebrow={tPage("galleryEyebrow")}
              title={tPage.rich("galleryTitle", { name: nameShort, br: () => <br /> })}
              lede={tPage("galleryLede")}
            />
            <div
              className="grid gap-3.5"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr',
                gridTemplateRows: '220px 220px',
              }}
            >
              {[
                'linear-gradient(160deg, #5d7a3a, #2c3a18)',
                'linear-gradient(160deg, #7fa356, #364a1f)',
                'linear-gradient(160deg, #6c4226, #2a1a10)',
                'linear-gradient(160deg, #b3a268, #5e4910)',
                'linear-gradient(160deg, #80a558, #2c3e1d)',
              ].map((grad, i) => (
                <div
                  key={i}
                  data-animate-content
                  className="rounded-[18px] overflow-hidden"
                  style={{
                    backgroundImage: grad,
                    gridRow: i === 0 ? 'span 2' : undefined,
                  }}
                />
              ))}
            </div>
          </Container>
        </section>

        {/* Relacionados */}
        {product.related.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={Package}
                eyebrow={tPage("relatedEyebrow")}
                title={tPage.rich("relatedTitle", { name: nameShort, br: () => <br /> })}
              />
              <div
                className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                {product.related.map((rel) => (
                  <Link
                    key={rel.slug}
                    data-animate-content
                    href={`/produtos/${rel.slug}`}
                    className="group flex flex-col rounded-[24px] overflow-hidden border border-black/10 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(20,30,20,.04),0_24px_60px_-32px_rgba(20,30,20,.25)] transition-all duration-300"
                  >
                    {/* Pack visual */}
                    <div
                      className="relative flex items-center justify-center overflow-hidden"
                      style={{
                        aspectRatio: '4/3',
                        background: `radial-gradient(80% 60% at 50% 70%, rgba(0,0,0,.10), transparent 70%), linear-gradient(160deg, #E8EFE2, #E4ECEA)`,
                      }}
                    >
                      <span
                        className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full text-[#004B26] bg-[#DDE6C8]"
                      >
                        {rel.tag}
                      </span>
                      <div className="relative z-10 h-[80%] w-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                        <Image
                          src={rel.image || "/produtos/placeholder-produto.png"}
                          alt={`Imagem do produto ${rel.name}`}
                          width={300}
                          height={450}
                          quality={90}
                          className="object-contain h-full w-auto drop-shadow-xl"
                        />
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1 bg-white">
                      <h3 className="m-0 mb-2 text-subtitle text-[19px] font-[650] tracking-[-0.01em] text-[#1A1A1A] leading-snug">{rel.name}</h3>
                      <p className="m-0 text-[14.5px] text-[#5A5A57] leading-[1.5] flex-1 mb-4">{rel.desc}</p>
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

        {/* CTA Final */}
        <HomeCtaFinal />
      </div>

      {/* Global animation for the seal */}
      <style>{`@keyframes pdp-seal-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
