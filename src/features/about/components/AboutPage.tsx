'use client'

import React, { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
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

const TIMELINE_KEYS = ['y1985', 'y1992', 'y2003', 'y2015', 'y2024'] as const
const TIMELINE_YEARS = ['1985', '1992', '2003', '2015', '2024']
const VALUE_KEYS = ['v1', 'v2', 'v3'] as const

export function AboutPage() {
  const t = useTranslations('aboutPage')
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)

  const historyRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !containerRef.current) return

      const eyebrow = eyebrowRef.current
      const title = titleRef.current
      const intro = introRef.current
      const history = historyRef.current
      const values = valuesRef.current
      const highlight = highlightRef.current
      const gallery = galleryRef.current
      const cta = ctaRef.current

      const split = title ? new SplitText(title, { type: 'chars,lines' }) : null
      const chars = split?.chars ?? []

      if (eyebrow) gsap.set(eyebrow, { y: 15, opacity: 0 })
      if (title) gsap.set(title, { opacity: 0 })
      if (chars.length) gsap.set(chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      if (intro) gsap.set(intro, { y: 20, opacity: 0 })
      if (cta) gsap.set(cta, { y: 24, opacity: 0 })

      const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
      if (eyebrow) tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5 })
      if (title) tl.set(title, { opacity: 1 }, 0.1)
      if (chars.length) tl.to(chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, 0.1)
      if (intro) tl.to(intro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)

      if (history) {
        const histEyebrow = history.querySelector('[data-hist-eyebrow]')
        const histTitle = history.querySelector('[data-hist-title]')
        const histIntro = history.querySelector('[data-hist-intro]')
        const line = history.querySelector('[data-hist-line]')
        const timelineItems = gsap.utils.toArray<HTMLElement>('[data-hist-item]', history)

        if (histEyebrow) gsap.set(histEyebrow, { y: 15, opacity: 0 })
        if (histTitle) gsap.set(histTitle, { y: 20, opacity: 0 })
        if (histIntro) gsap.set(histIntro, { y: 20, opacity: 0 })

        ScrollTrigger.create({
          trigger: history,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlHist = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (histEyebrow) tlHist.to(histEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (histTitle) tlHist.to(histTitle, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
            if (histIntro) tlHist.to(histIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.25)
          }
        })

        if (line) {
          gsap.set(line, { scaleY: 0, transformOrigin: 'top center' })
          ScrollTrigger.create({
            trigger: line,
            start: 'top 70%',
            end: 'bottom 75%',
            scrub: true,
            animation: gsap.to(line, { scaleY: 1, ease: 'none' })
          })
        }

        if (timelineItems.length) {
          timelineItems.forEach((item) => {
            const dot = item.querySelector('[data-hist-dot]')
            const content = item.querySelector('[data-hist-content]')
            if (dot) gsap.set(dot, { scale: 0 })
            if (content) gsap.set(content, { y: 20, opacity: 0 })

            ScrollTrigger.create({
              trigger: item,
              start: 'top 85%',
              once: true,
              onEnter: () => {
                if (content) gsap.to(content, { y: 0, opacity: 1, duration: 0.7, ease: EASE.reveal })
                if (dot) gsap.to(dot, { scale: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 0.15 })
              }
            })
          })
        }
      }

      if (values) {
        const vEyebrow = values.querySelector('[data-val-eyebrow]')
        const vTitle = values.querySelector('[data-val-title]')
        const vIntro = values.querySelector('[data-val-intro]')
        const vCards = gsap.utils.toArray<HTMLElement>('[data-val-card]', values)

        if (vEyebrow) gsap.set(vEyebrow, { y: 15, opacity: 0 })
        if (vTitle) gsap.set(vTitle, { y: 20, opacity: 0 })
        if (vIntro) gsap.set(vIntro, { y: 20, opacity: 0 })
        if (vCards.length) gsap.set(vCards, { y: 24, opacity: 0 })

        ScrollTrigger.create({
          trigger: values,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlVal = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (vEyebrow) tlVal.to(vEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (vTitle) tlVal.to(vTitle, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
            if (vIntro) tlVal.to(vIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.25)
            if (vCards.length) {
              tlVal.to(vCards, { y: 0, opacity: 1, duration: 0.8, stagger: STAGGER.card }, 0.4)
            }
          }
        })
      }

      if (highlight) {
        const hlEyebrow = highlight.querySelector('[data-hl-eyebrow]')
        const hlTitle = highlight.querySelector('[data-hl-title]')
        const hlIntro = highlight.querySelector('[data-hl-intro]')

        const splitHL = hlTitle ? new SplitText(hlTitle, { type: 'chars,lines' }) : null
        const charsHL = splitHL?.chars ?? []

        if (hlEyebrow) gsap.set(hlEyebrow, { y: 15, opacity: 0 })
        if (hlTitle) gsap.set(hlTitle, { opacity: 0 })
        if (charsHL.length) gsap.set(charsHL, { x: 20, opacity: 0, filter: 'blur(10px)' })
        if (hlIntro) gsap.set(hlIntro, { y: 20, opacity: 0 })

        ScrollTrigger.create({
          trigger: highlight,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            const tlHl = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (hlEyebrow) tlHl.to(hlEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (hlTitle) tlHl.set(hlTitle, { opacity: 1 }, 0.1)
            if (charsHL.length) tlHl.to(charsHL, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, 0.1)
            if (hlIntro) tlHl.to(hlIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
          }
        })
      }

      if (gallery) {
        const galEyebrow = gallery.querySelector('[data-gal-eyebrow]')
        const galTitle = gallery.querySelector('[data-gal-title]')
        const galIntro = gallery.querySelector('[data-gal-intro]')
        const galImgs = gsap.utils.toArray<HTMLElement>('[data-gal-img]', gallery)

        if (galEyebrow) gsap.set(galEyebrow, { y: 15, opacity: 0 })
        if (galTitle) gsap.set(galTitle, { y: 20, opacity: 0 })
        if (galIntro) gsap.set(galIntro, { y: 20, opacity: 0 })
        if (galImgs.length) gsap.set(galImgs, { y: 30, opacity: 0 })

        ScrollTrigger.create({
          trigger: gallery,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlGal = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (galEyebrow) tlGal.to(galEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (galTitle) tlGal.to(galTitle, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
            if (galIntro) tlGal.to(galIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.25)
            if (galImgs.length) {
              tlGal.to(galImgs, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0.35)
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
          <p ref={introRef} className="text-lg md:text-xl text-foreground/70 max-w-[48rem] leading-relaxed">
            {t('intro')}
          </p>
        </div>

        {/* Linha do Tempo */}
        <div ref={historyRef} className="mb-32">
          <div className="flex flex-col md:flex-row gap-12 mb-16">
            <div className="md:w-1/3 shrink-0">
              <span data-hist-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('historyEyebrow')}
              </span>
            </div>
            <div className="md:w-2/3 max-w-[42rem]">
              <h2 data-hist-title className="font-montserrat text-3xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
                {t('historyTitle')}
              </h2>
              <p data-hist-intro className="text-lg text-foreground/70 leading-relaxed">
                {t('historyIntro')}
              </p>
            </div>
          </div>

          <div className="relative ml-4 md:ml-6 pl-8 md:pl-12 space-y-16">
            <div data-hist-line className="absolute left-0 top-0 bottom-0 w-[1px] bg-foreground/10 origin-top" />
            {TIMELINE_KEYS.map((key, i) => (
              <div key={key} data-hist-item className="relative group">
                <div data-hist-dot className="absolute -left-[37px] md:-left-[53px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white transition-transform group-hover:scale-150 group-hover:bg-green-600 duration-300 z-10" />
                <div data-hist-content className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
                  <div className="font-mono text-xl font-bold text-primary shrink-0 w-24">
                    {TIMELINE_YEARS[i]}
                  </div>
                  <div>
                    <h3 className="font-montserrat text-xl font-bold text-foreground mb-3">{t(`timeline.${key}.title`)}</h3>
                    <p className="text-foreground/70 leading-relaxed">{t(`timeline.${key}.desc`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Valores */}
        <div ref={valuesRef} className="mb-32">
          <div className="flex flex-col md:flex-row gap-12 mb-16">
            <div className="md:w-1/3 shrink-0">
              <span data-val-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('valuesEyebrow')}
              </span>
            </div>
            <div className="md:w-2/3 max-w-[42rem]">
              <h2 data-val-title className="font-montserrat text-3xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
                {t('valuesTitle')}
              </h2>
              <p data-val-intro className="text-lg text-foreground/70 leading-relaxed">
                {t('valuesIntro')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUE_KEYS.map((key, i) => (
              <div key={key} data-val-card className="p-8 rounded-3xl bg-foreground/5 border border-foreground/10 group hover:-translate-y-1 transition-all duration-300">
                <span className="text-primary font-mono text-sm font-bold tracking-widest mb-6 block">
                  0{i + 1}
                </span>
                <h3 className="font-montserrat text-xl font-bold text-foreground mb-4">{t(`values.${key}.title`)}</h3>
                <p className="text-foreground/70 leading-relaxed">{t(`values.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Destaque / Propósito */}
        <div ref={highlightRef} className="mb-32">
          <div className="bg-[#004C26] rounded-[2rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <span data-hl-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70 mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                {t('purposeEyebrow')}
              </span>
              <h2 data-hl-title className="font-montserrat text-5xl md:text-7xl lg:text-[100px] font-black uppercase tracking-tighter mb-8 leading-[0.95] text-white">
                {t('purposeTitleStart')} <em className="text-highlight text-yellow-400">{t('purposeTitleHighlight')}</em><br />
                {t('purposeTitleEnd')}
              </h2>
              <p data-hl-intro className="text-white/85 text-lg md:text-xl max-w-[42rem] mx-auto leading-relaxed">
                {t('purposeBody')}
              </p>
            </div>
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
        <div ref={ctaRef} className="rounded-3xl bg-primary text-white p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 max-w-[36rem]">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {t('ctaEyebrow')}
            </span>
            <h2 className="font-montserrat text-3xl md:text-4xl font-black uppercase text-white tracking-tight mb-4 leading-tight">
              {t('ctaTitleStart')} <em className="text-highlight text-white">{t('ctaTitleHighlight')}</em>
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
