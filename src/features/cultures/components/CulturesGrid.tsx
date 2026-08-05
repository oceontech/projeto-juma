'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal , bindSectionReveal, revealToggleActions } from '@/features/animation/charReveal'
import { onPreloaderDone } from '@/features/animation/preloaderGate'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

const CULTURE_KEYS = [
  { id: 'soja', num: '01', color: 'from-green-600 to-green-800', image: '/assets/cultures/soja.webp?v=20260731b' },
  { id: 'milho', num: '02', color: 'from-yellow-500 to-amber-700', image: '/assets/cultures/milho.webp?v=20260731b' },
  { id: 'cafe', num: '03', color: 'from-amber-700 to-orange-900', image: '/assets/cultures/cafe.webp?v=20260731' },
  { id: 'cana', num: '04', color: 'from-lime-500 to-green-700', image: '/assets/cultures/cana.webp?v=20260731' },
  { id: 'algodao', num: '05', color: 'from-blue-100 to-slate-300', text: 'text-foreground', image: '/assets/cultures/algodao.webp?v=20260731' },
  { id: 'feijao', num: '06', color: 'from-orange-800 to-red-900', image: '/assets/cultures/feijao.webp?v=20260731b' },
  { id: 'citros', num: '07', color: 'from-orange-400 to-orange-600', image: '/assets/cultures/limao.webp?v=20260731' },
  { id: 'batata', num: '08', color: 'from-amber-200 to-yellow-600', text: 'text-foreground', image: '/assets/cultures/batata.webp?v=20260731' },
  { id: 'tomate', num: '09', color: 'from-red-500 to-red-700', image: '/assets/cultures/tomate.webp?v=20260731' },
  { id: 'pastagem', num: '10', color: 'from-green-400 to-green-600', image: '/assets/cultures/pastagem.webp?v=20260731' },
] as const

function ArrowTopRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function SeedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M12 12c-2 2-2 6-2 6"/>
      <path d="M12 12c2 2 2 6 2 6"/>
      <path d="M12 12V2"/>
    </svg>
  )
}

function FlaskIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a2 2 0 0 0 1.8 2.95h10.96a2 2 0 0 0 1.8-2.95l-5.069-10.127a2 2 0 0 1-.211-.896V2" />
      <path d="M8 2h8" />
      <path d="M14 2v6" />
      <path d="M10 2v6" />
      <path d="M6 16h12" />
    </svg>
  )
}

function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  )
}

export function CulturesGrid() {
  const t = useTranslations('culturesPage')
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const howRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !containerRef.current) return

      const eyebrow = eyebrowRef.current
      const title = titleRef.current
      const intro = introRef.current
      const grid = gridRef.current
      const how = howRef.current
      const cta = ctaRef.current

      const reveal = createCharReveal(title)
      const chars = reveal?.chars ?? []
      let howReveal: ReturnType<typeof createCharReveal> = null
      let ctaReveal: ReturnType<typeof createCharReveal> = null

      if (eyebrow) gsap.set(eyebrow, { y: 15, opacity: 0 })
      if (title) gsap.set(title, { opacity: 0 })
      reveal?.hide()
      if (intro) gsap.set(intro, { y: 20, opacity: 0 })
      if (cta) gsap.set(cta, { y: 24, opacity: 0 })

      /* Pausada: quem solta é o portão do preloader (ver `preloaderGate`). */
      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.reveal } })
      if (eyebrow) tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5 })
      if (title) tl.set(title, { opacity: 1 }, 0.1)
      reveal?.playIn(tl, 0.1)
      if (intro) tl.to(intro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
      const soltarAbertura = onPreloaderDone(() => tl.play())

      if (grid) {
        const cards = gsap.utils.toArray<HTMLElement>('[data-culture-card]', grid)
        const mm = gsap.matchMedia()

        mm.add('(min-width: 640px)', () => {
          gsap.set(cards, { y: 24, opacity: 0, filter: 'blur(12px)' })
          gsap.to(cards, {
            y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, stagger: 0.1, ease: EASE.reveal,
            scrollTrigger: {
              trigger: grid,
              start: 'top 65%',
              end: 'bottom top',
              toggleActions: revealToggleActions(),
            },
          })
        })

        mm.add('(max-width: 639px)', () => {
          cards.forEach((card) => {
            gsap.set(card, { y: 24, opacity: 0, filter: 'blur(12px)' })
            gsap.to(card, {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.0,
              ease: EASE.reveal,
              scrollTrigger: {
                trigger: card,
                start: 'top 75%',
                end: 'bottom top',
                toggleActions: revealToggleActions(),
              }
            })
          })
        })
      }

      if (how) {
        const sectionEyebrow = how.querySelector('[data-how-eyebrow]')
        const sectionTitle = how.querySelector('[data-how-title]')
        const sectionIntro = how.querySelector('[data-how-intro]')
        const stepCards = gsap.utils.toArray<HTMLElement>('[data-how-step]', how)

        howReveal = createCharReveal(sectionTitle as HTMLElement | null)

        if (sectionEyebrow) gsap.set(sectionEyebrow, { y: 15, opacity: 0 })
        if (sectionTitle) gsap.set(sectionTitle, { opacity: 0 })
        howReveal?.hide()
        if (sectionIntro) gsap.set(sectionIntro, { y: 20, opacity: 0 })
        if (stepCards.length) gsap.set(stepCards, { y: 24, opacity: 0 })

        bindSectionReveal(how, () => {
            const tlHow = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (sectionEyebrow) tlHow.to(sectionEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (sectionTitle) tlHow.set(sectionTitle, { opacity: 1 }, 0.1)
            howReveal?.playIn(tlHow, 0.1)
            if (sectionIntro) tlHow.to(sectionIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.35)
            if (stepCards.length) {
              tlHow.to(stepCards, { y: 0, opacity: 1, duration: 0.8, stagger: STAGGER.card }, 0.4)
            }
          return tlHow
        }, {
          start: 'top 80%',
          /* Sem `endTrigger` próprio: media pelo CABEÇALHO (`sectionIntro`)
             fazia o bloco inteiro resetar assim que aquele parágrafo curto
             saía de tela — com os três cards (bem mais baixos) ainda
             totalmente visíveis. Era exatamente o "sumindo no meio da tela"
             relatado aqui. Medindo `how` (o bloco inteiro) com o novo default
             de `bindSectionReveal` (`bottom top`), o reset só acontece quando
             os cards também já foram embora. */
        })
      }

      if (cta) {
        const ctaTitle = cta.querySelector<HTMLElement>('[data-cta-title]')
        ctaReveal = createCharReveal(ctaTitle)
        ctaReveal?.hide()

        const ctaTl = gsap.timeline({
          scrollTrigger: {
            trigger: cta,
            start: 'top 90%',
            end: 'bottom top',
            toggleActions: revealToggleActions(),
          },
          defaults: { ease: EASE.reveal },
        })
        ctaTl.to(cta, { y: 0, opacity: 1, duration: 0.7 })
        ctaReveal?.playIn(ctaTl, 0.15)
      }

      return () => {
        soltarAbertura()
        reveal?.revert()
        howReveal?.revert()
        ctaReveal?.revert()
      }
    },
    { scope: containerRef, dependencies: [reduced] }
  )

  const HOW_STEPS = [
    { 
      key: 'diagnosis' as const, 
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop',
      align: 'justify-start items-start'
    },
    { 
      key: 'program' as const, 
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop',
      align: 'justify-center items-center'
    },
    { 
      key: 'followup' as const, 
      image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=800&auto=format&fit=crop',
      align: 'justify-end items-end'
    },
  ]

  return (
    <Container>
      <div ref={containerRef}>
        <div className="mb-16">
          <span ref={eyebrowRef} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t('eyebrow')}
          </span>
          <h1 ref={titleRef} className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black uppercase text-foreground tracking-tight mb-6 max-w-[64rem] leading-[0.95]">
            {t('titleStart')} <em className="text-highlight text-primary">{t('titleHighlight')}</em>
          </h1>
          <p ref={introRef} className="text-lg md:text-xl text-foreground/70 max-w-[64rem] leading-relaxed">
            {t('intro')}
          </p>
        </div>

        {/* Grade de Culturas */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 mb-32">
        {CULTURE_KEYS.map((culture) => (
          <Link
            key={culture.id}
            href={`/culturas/${culture.id}`}
            data-culture-card
            className="group relative flex flex-col justify-end h-36 sm:h-64 lg:h-72 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
          >
            <Image
              src={culture.image}
              alt={t(`cultures.${culture.id}`)}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 pointer-events-none" />
            <div className="relative z-10 p-3 sm:p-6 flex flex-col justify-end h-full pointer-events-none">
              <span className="text-white/60 font-mono text-[10px] sm:text-sm font-bold tracking-widest mb-0.5 sm:mb-1 group-hover:text-white/90 transition-colors">
                {culture.num}
              </span>
              <span className="text-white text-subtitle text-[13px] sm:text-2xl font-bold tracking-tight leading-[1.1]">
                {t(`cultures.${culture.id}`)}
              </span>
            </div>
            <div className="hidden sm:block absolute top-6 right-6 z-10 text-white opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
              <ArrowTopRightIcon className="h-6 w-6" />
            </div>
          </Link>
        ))}
      </div>

      {/* Como funciona */}
      <div ref={howRef} className="mb-32">
        <div className="flex flex-col gap-12 mb-16">
          <div className="md:w-1/3 shrink-0">
            <span data-how-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t('howEyebrow')}
            </span>
          </div>
          <div className="md:w-2/3 max-w-[64rem]">
            <h2 data-how-title className="font-montserrat uppercase text-3xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-[0.95]">
              {t('howTitleStart')} <em className="text-highlight text-primary">{t('howTitleHighlight')}</em>
            </h2>
            <p data-how-intro className="text-lg text-foreground/70 leading-relaxed">
              {t('howIntro')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_STEPS.map((item) => (
            <div key={item.key} data-how-step className="relative h-[420px] rounded-[24px] overflow-hidden flex transition-all duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-2xl">
              <Image
                src={item.image}
                alt={t(`steps.${item.key}.title`)}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/15 pointer-events-none" />
              <div className={`relative z-10 w-full h-full p-6 flex flex-col ${item.align} pointer-events-none`}>
                <div className="bg-black/30 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col max-w-[95%]">
                  <h3 className="text-subtitle text-[19px] font-bold text-white mb-2 drop-shadow-md leading-[0.95]">
                    {t(`steps.${item.key}.title`)}
                  </h3>
                  <p className="text-white/95 leading-relaxed text-[14.5px] drop-shadow-sm font-medium">
                    {t(`steps.${item.key}.desc`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Final */}
      <div ref={ctaRef} className="rounded-3xl bg-primary text-white p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-[64rem]">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t('ctaEyebrow')}
          </span>
          <h2 data-cta-title className="font-montserrat text-3xl md:text-4xl font-black uppercase text-white tracking-tight mb-4 leading-[0.95]">
            {t('ctaTitleStart')} <em className="text-highlight text-[#F0E27A]">{t('ctaTitleHighlight')}</em>
          </h2>
          <p className="text-white text-lg">
            {t('ctaBody')}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link
            href="/contato"
            className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-xl hover:shadow-white/20"
          >
            {t('ctaButton')}
            <ArrowTopRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
      </div>
    </Container>
  )
}
