'use client'

import React, { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
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

const VALUES_CONTENT: Record<typeof VALUE_KEYS[number], { image: string }> = {
  v1: { image: '/assets/about/ao-lado-produtor.webp' },
  v2: { image: '/assets/about/conhecimento-aplicado.webp' },
  v3: { image: '/assets/about/responsabilidade.webp' }
}

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
        const cards = gsap.utils.toArray<HTMLElement>('[data-hist-card]', history)

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

        if (cards.length) {
          cards.forEach((card, i) => {
            gsap.set(card, { 
              scale: 1 - (i * 0.05), 
              opacity: 1 - (i * 0.2), 
              y: -i * 30,
              zIndex: cards.length - i
            })
          })

          const scrubTl = gsap.timeline({
            scrollTrigger: {
              trigger: history,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            }
          })

          cards.forEach((card, i) => {
            if (i < cards.length - 1) {
              // Current card goes up, scales up, and fades out
              scrubTl.to(card, {
                scale: 1.05,
                opacity: 0,
                y: -100,
                duration: 1,
                ease: 'power1.inOut'
              }, i)

              // Subsequent cards move forward in the stack
              for (let j = i + 1; j < cards.length; j++) {
                const stepIndex = j - i - 1;
                scrubTl.to(cards[j], {
                  scale: 1 - (stepIndex * 0.05),
                  opacity: 1 - (stepIndex * 0.2),
                  y: -stepIndex * 30,
                  duration: 1,
                  ease: 'power1.inOut'
                }, i)
              }
            }
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
        ScrollTrigger.create({
          trigger: values,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlVal = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (vEyebrow) tlVal.to(vEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (vTitle) tlVal.to(vTitle, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
            if (vIntro) tlVal.to(vIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.25)
          }
        })

        if (vCards.length > 0) {
          const mm = gsap.matchMedia()

          // Desktop e Tablet (sm em diante) - Stagger no grupo
          mm.add('(min-width: 640px)', () => {
            gsap.set(vCards, { opacity: 0, filter: 'blur(12px)' })

            const tlCards = gsap.timeline({
              scrollTrigger: {
                trigger: vCards[0].parentElement || values,
                start: 'top 85%',
                end: 'bottom 15%',
                toggleActions: 'play reverse play reverse',
              }
            })

            tlCards.to(vCards, {
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.4,
              stagger: 0.3,
              ease: 'power3.out'
            })
          })

          // Mobile - ScrollTrigger individual para cada card
          mm.add('(max-width: 639px)', () => {
            vCards.forEach((card) => {
              gsap.set(card, { opacity: 0, filter: 'blur(12px)' })

              gsap.to(card, {
                scrollTrigger: {
                  trigger: card,
                  start: 'top 85%',
                  end: 'bottom 15%',
                  toggleActions: 'play reverse play reverse',
                },
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1.4,
                ease: 'power3.out'
              })
            })
          })
        }
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
        <div ref={historyRef} className="mb-32 relative h-[400vh]">
          <div className="sticky top-0 h-screen w-full flex flex-col justify-center pt-20 pb-32 md:pt-24 md:pb-[15vh]">
            <div className="flex flex-col gap-6 md:gap-12 mb-6 md:mb-12 z-20 relative">
              <div className="md:w-1/3 shrink-0">
                <span data-hist-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {t('historyEyebrow')}
                </span>
              </div>
              <div className="md:w-2/3 max-w-[42rem]">
                <h2 data-hist-title className="font-montserrat uppercase text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4 md:mb-6 leading-tight">
                  {t('historyTitle')}
                </h2>
                <p data-hist-intro className="text-lg text-foreground/70 leading-relaxed">
                  {t('historyIntro')}
                </p>
              </div>
            </div>

            <div className="relative flex-1 w-full flex justify-center items-center">
              <div className="relative w-full max-w-6xl max-h-[800px] min-h-[450px] lg:min-h-[550px]">
                {TIMELINE_KEYS.map((key, i) => (
                  <div 
                    key={key} 
                    data-hist-card 
                    className="absolute top-0 left-0 w-full h-full flex flex-col justify-start bg-white border border-foreground/5 dark:border-white/10 rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 md:p-20 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
                  >
                    {/* Marca d'água estourando nas bordas */}
                    <div className="absolute -bottom-6 -right-6 md:-bottom-12 md:-right-12 pointer-events-none opacity-[0.2] select-none">
                      <span className="text-subtitle text-[10rem] md:text-[14rem] lg:text-[18rem] font-black leading-none text-primary">
                        {TIMELINE_YEARS[i]}
                      </span>
                    </div>
                    
                    <div className="relative z-10 w-full">
                      <div className="font-mono text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-4 flex items-center gap-4">
                        <span className="w-8 md:w-12 h-1 bg-primary rounded-full"></span>
                        {TIMELINE_YEARS[i]}
                      </div>
                      <h3 className="font-montserrat uppercase text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight drop-shadow-sm">
                        {t(`timeline.${key}.title`)}
                      </h3>
                      <p className="text-foreground/80 text-base text-subtitle md:text-lg lg:text-xl leading-relaxed drop-shadow-sm font-medium">
                        {t(`timeline.${key}.desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div ref={valuesRef} className="mb-32">
          <div className="flex flex-col gap-12 mb-16">
            <div className="md:w-1/3 shrink-0">
              <span data-val-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('valuesEyebrow')}
              </span>
            </div>
            <div className="md:w-2/3 max-w-[42rem]">
              <h2 data-val-title className="font-montserrat uppercase text-3xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-tight">
                {t('valuesTitle')}
              </h2>
              <p data-val-intro className="text-lg text-foreground/70 leading-relaxed">
                {t('valuesIntro')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {VALUE_KEYS.map((key, i) => {
              const { image } = VALUES_CONTENT[key]

              return (
                <div 
                  key={key} 
                  data-val-card 
                  className="group relative flex flex-col min-h-[420px] overflow-hidden rounded-3xl border border-foreground/10 bg-white transition-shadow hover:shadow-lg"
                >
                  {/* Imagem de Fundo (Máscara idêntica a Lines.tsx) */}
                  <div className="absolute pointer-events-none z-0 overflow-hidden bottom-0 w-full h-[65%] [mask-image:linear-gradient(to_top,black_40%,transparent)] [-webkit-mask-image:linear-gradient(to_top,black_40%,transparent)]">
                    <div className="w-full h-full relative">
                      <Image 
                        src={image} 
                        alt="" 
                        fill 
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="relative z-10 flex flex-col gap-4 p-8 lg:p-10 w-full mb-auto h-full">
                    <h3 className="font-montserrat uppercase text-2xl font-black leading-[1.05] tracking-tight text-foreground">
                      {t(`values.${key}.title`)}
                    </h3>
                    <p className="text-foreground/70 text-sm text-subtitle not-first-of-type:leading-relaxed max-w-[90%]">
                      {t(`values.${key}.desc`)}
                    </p>
                  </div>
                </div>
              )
            })}
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
              <h2 data-hl-title className="font-montserrat text-4xl md:text-7xl lg:text-[100px] font-black uppercase tracking-tighter mb-8 leading-[0.95] text-white">
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
          <div className="flex flex-col gap-12 mb-16">
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
        <div ref={ctaRef} className="rounded-3xl bg-primary text-white p-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
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
              className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-xl hover:shadow-yellow-400/20"
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
