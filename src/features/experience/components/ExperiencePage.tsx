'use client'

import React, { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

function ArrowTopRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function ExperiencePage() {
  const t = useTranslations('experiencePage')
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  const programRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !containerRef.current) return

      const eyebrow = eyebrowRef.current
      const title = titleRef.current
      const intro = introRef.current
      const buttons = buttonsRef.current
      const program = programRef.current
      const benefits = benefitsRef.current
      const gallery = galleryRef.current
      const cta = ctaRef.current

      const split = title ? new SplitText(title, { type: 'chars,lines' }) : null
      const chars = split?.chars ?? []

      if (eyebrow) gsap.set(eyebrow, { y: 15, opacity: 0 })
      if (title) gsap.set(title, { opacity: 0 })
      if (chars.length) gsap.set(chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (intro) gsap.set(intro, { y: 20, opacity: 0 })
      if (buttons) gsap.set(buttons, { y: 15, opacity: 0 })
      if (cta) gsap.set(cta, { y: 24, opacity: 0 })

      const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
      if (eyebrow) tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5 })
      if (title) tl.set(title, { opacity: 1 }, 0.1)
      if (chars.length) tl.to(chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, 0.1)
      if (intro) tl.to(intro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
      if (buttons) tl.to(buttons, { y: 0, opacity: 1, duration: DUR.sub }, 0.55)

      if (program) {
        const pEyebrow = program.querySelector('[data-prog-eyebrow]')
        const pTitle = program.querySelector('[data-prog-title]')
        const pIntro = program.querySelector('[data-prog-intro]')
        const pCards = gsap.utils.toArray<HTMLElement>('[data-prog-card]', program)

        if (pEyebrow) gsap.set(pEyebrow, { y: 15, opacity: 0 })
        if (pTitle) gsap.set(pTitle, { y: 20, opacity: 0 })
        if (pIntro) gsap.set(pIntro, { y: 20, opacity: 0 })
        if (pCards.length) gsap.set(pCards, { y: 24, opacity: 0 })

        ScrollTrigger.create({
          trigger: program,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlProg = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (pEyebrow) tlProg.to(pEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (pTitle) tlProg.to(pTitle, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
            if (pIntro) tlProg.to(pIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.25)
            if (pCards.length) {
              tlProg.to(pCards, { y: 0, opacity: 1, duration: 0.8, stagger: STAGGER.card }, 0.4)
            }
          }
        })
      }

      if (benefits) {
        const bEyebrow = benefits.querySelector('[data-ben-eyebrow]')
        const bTitle = benefits.querySelector('[data-ben-title]')
        const bIntro = benefits.querySelector('[data-ben-intro]')
        const bItems = gsap.utils.toArray<HTMLElement>('[data-ben-item]', benefits)

        if (bEyebrow) gsap.set(bEyebrow, { y: 15, opacity: 0 })
        if (bTitle) gsap.set(bTitle, { y: 20, opacity: 0 })
        if (bIntro) gsap.set(bIntro, { y: 20, opacity: 0 })

        bItems.forEach(item => {
          const icon = item.querySelector('[data-ben-icon]')
          const text = item.querySelector('[data-ben-text]')
          if (icon) gsap.set(icon, { scale: 0 })
          if (text) gsap.set(text, { y: 15, opacity: 0 })
        })

        ScrollTrigger.create({
          trigger: benefits,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlBen = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (bEyebrow) tlBen.to(bEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (bTitle) tlBen.to(bTitle, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
            if (bIntro) tlBen.to(bIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.25)

            bItems.forEach((item, index) => {
              const icon = item.querySelector('[data-ben-icon]')
              const text = item.querySelector('[data-ben-text]')
              const delay = 0.4 + index * 0.08
              if (icon) tlBen.to(icon, { scale: 1, duration: 0.5, ease: 'back.out(1.7)' }, delay)
              if (text) tlBen.to(text, { y: 0, opacity: 1, duration: 0.6 }, delay + 0.1)
            })
          }
        })
      }

      if (gallery) {
        const gEyebrow = gallery.querySelector('[data-gal-eyebrow]')
        const gTitle = gallery.querySelector('[data-gal-title]')
        const gIntro = gallery.querySelector('[data-gal-intro]')
        const gImages = gsap.utils.toArray<HTMLElement>('[data-gal-img]', gallery)

        if (gEyebrow) gsap.set(gEyebrow, { y: 15, opacity: 0 })
        if (gTitle) gsap.set(gTitle, { y: 20, opacity: 0 })
        if (gIntro) gsap.set(gIntro, { y: 20, opacity: 0 })
        if (gImages.length) gsap.set(gImages, { y: 30, opacity: 0 })

        ScrollTrigger.create({
          trigger: gallery,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlGal = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (gEyebrow) tlGal.to(gEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (gTitle) tlGal.to(gTitle, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
            if (gIntro) tlGal.to(gIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.25)
            if (gImages.length) {
              tlGal.to(gImages, { y: 0, opacity: 1, duration: 0.9, stagger: STAGGER.card }, 0.4)
            }
          }
        })
      }

      if (cta) {
        ScrollTrigger.create({
          trigger: cta,
          start: 'top 90%',
          once: true,
          onEnter: () => gsap.to(cta, { y: 0, opacity: 1, duration: 0.7, ease: EASE.reveal })
        })
      }

      return () => {
        split?.revert()
      }
    },
    { scope: containerRef, dependencies: [reduced] }
  )

  const DAYS = ['day1', 'day2', 'day3'] as const
  const BENEFITS = ['b1', 'b2', 'b3', 'b4'] as const

  return (
    <Container>
      <div ref={containerRef}>
        {/* Cabeçalho */}
        <div className="mb-24">
          <span ref={eyebrowRef} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t('eyebrow')}
          </span>
          <h1 ref={titleRef} className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-black uppercase text-foreground tracking-tight mb-6 max-w-[48rem] leading-tight">
            {t('titleStart')} <em className="text-highlight text-primary">{t('titleHighlight')}</em>
          </h1>
          <p ref={introRef} className="text-lg md:text-xl text-foreground/70 max-w-[48rem] leading-relaxed mb-8">
            {t('intro')}
          </p>
          <div ref={buttonsRef} className="flex flex-wrap gap-4">
          <a
            href="#participar"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-xl hover:shadow-primary/30"
          >
            {t('btnParticipate')}
            <ArrowTopRightIcon className="h-4 w-4" />
          </a>
          <a
            href="#programa"
            className="inline-flex items-center gap-2 bg-transparent text-primary border border-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-colors hover:bg-primary/5"
          >
            {t('btnProgram')}
          </a>
        </div>
      </div>

      {/* O que é o programa */}
      <div id="programa" ref={programRef} className="mb-32">
        <div className="flex flex-col md:flex-row gap-12 mb-16">
          <div className="md:w-1/3 shrink-0">
            <span data-prog-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t('programEyebrow')}
            </span>
          </div>
          <div className="md:w-2/3 max-w-[42rem]">
            <h2 data-prog-title className="font-montserrat text-3xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
              {t('programTitle')}
            </h2>
            <p data-prog-intro className="text-lg text-foreground/70 leading-relaxed">
              {t('programIntro')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DAYS.map((dayKey) => (
            <div key={dayKey} data-prog-card className="p-10 rounded-3xl bg-white border border-foreground/10 shadow-sm relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              <div className="absolute -top-4 -right-4 text-9xl font-montserrat font-black text-foreground/[0.03] group-hover:text-primary/[0.05] transition-colors duration-500">
                {t(`days.${dayKey}.num`)}
              </div>
              <div className="relative z-10">
                <span className="text-primary font-mono text-sm font-bold tracking-widest mb-6 block">
                  {t(`days.${dayKey}.num`)}
                </span>
                <h3 className="font-montserrat text-xl font-bold text-foreground mb-4">
                  {t(`days.${dayKey}.title`)}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {t(`days.${dayKey}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* O que você vivencia */}
      <div ref={benefitsRef} className="mb-32">
        <div className="flex flex-col md:flex-row gap-12 mb-16">
          <div className="md:w-1/3 shrink-0">
            <span data-ben-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t('benefitsEyebrow')}
            </span>
          </div>
          <div className="md:w-2/3 max-w-[42rem]">
            <h2 data-ben-title className="font-montserrat text-3xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
              {t('benefitsTitle')}
            </h2>
            <p data-ben-intro className="text-lg text-foreground/70 leading-relaxed">
              {t('benefitsIntro')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
          {BENEFITS.map((bKey) => (
            <div key={bKey} data-ben-item className="flex gap-6 items-start">
              <div data-ben-icon className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-lg">
                <CheckIcon className="h-6 w-6" />
              </div>
              <div data-ben-text>
                <h3 className="font-montserrat text-lg font-bold text-foreground mb-2">
                  {t(`benefits.${bKey}.title`)}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {t(`benefits.${bKey}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Galeria */}
      <div ref={galleryRef} className="mb-32">
        <div className="flex flex-col md:flex-row gap-12 mb-16">
          <div className="md:w-1/3 shrink-0">
            <span data-gal-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t('galleryEyebrow')}
            </span>
          </div>
          <div className="md:w-2/3 max-w-[42rem]">
            <h2 data-gal-title className="font-montserrat text-3xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
              {t('galleryTitle')}
            </h2>
            <p data-gal-intro className="text-lg text-foreground/70 leading-relaxed">
              {t('galleryIntro')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[60vh] md:h-[80vh]">
          <div data-gal-img className="col-span-2 row-span-2 bg-foreground/5 rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center text-foreground/20 font-montserrat font-bold">Foto 1</div>
          </div>
          <div data-gal-img className="bg-foreground/5 rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center text-foreground/20 font-montserrat font-bold">Foto 2</div>
          </div>
          <div data-gal-img className="bg-foreground/5 rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center text-foreground/20 font-montserrat font-bold">Foto 3</div>
          </div>
          <div data-gal-img className="col-span-2 bg-foreground/5 rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center text-foreground/20 font-montserrat font-bold">Foto 4</div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div id="participar" ref={ctaRef} className="rounded-3xl bg-primary text-white p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-[36rem]">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t('ctaEyebrow')}
          </span>
          <h2 className="font-montserrat text-3xl md:text-4xl font-black uppercase text-white tracking-tight mb-4 leading-tight">
            {t('ctaTitleStart')} <em className="text-highlight text-white">{t('ctaTitleHighlight')}</em><br />
            {t('ctaTitleEnd')}
          </h2>
          <p className="text-white text-lg">
            {t('ctaBody')}
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link
            href="/contato"
            className="inline-flex items-center gap-3 bg-yellow-400 text-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-xl hover:shadow-yellow-400/20"
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
