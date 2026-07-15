'use client'

import React, { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, SplitText, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

import { Leaf, Tractor, Sun, TreePine, Sprout, ClipboardEdit, LucideIcon } from 'lucide-react'
import { GlobalPresence } from '@/features/home/components/GlobalPresence'

function ArrowTopRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

const TIMELINE_KEYS = ['y1985', 'y1992', 'y2003', 'y2015', 'y2024'] as const
const TIMELINE_YEARS = ['1985', '1992', '2003', '2015', '2024']
const TIMELINE_ICONS: Record<typeof TIMELINE_KEYS[number], LucideIcon> = {
  y1985: Sprout,
  y1992: Tractor,
  y2003: Sun,
  y2015: Leaf,
  y2024: TreePine
}
const VALUE_KEYS = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'] as const

const VALUES_CONTENT: Record<typeof VALUE_KEYS[number], { image: string }> = {
  v1: { image: '/assets/about/ao-lado-produtor.webp' },
  v2: { image: '/assets/about/conhecimento-aplicado.webp' },
  v3: { image: '/assets/about/responsabilidade.webp' },
  v4: { image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop' },
  v5: { image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop' },
  v6: { image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=800&auto=format&fit=crop' },
  v7: { image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop' }
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
  const missionRef = useRef<HTMLDivElement>(null)
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
      const mission = missionRef.current
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
        
        const histSplit = histTitle ? new SplitText(histTitle as HTMLElement, { type: 'words' }) : null
        const histWords = histSplit?.words ?? []
        
        const track = history.querySelector('[data-hist-track]')
        const line = history.querySelector('[data-hist-line]')
        const nodes = gsap.utils.toArray<HTMLElement>('[data-hist-node]', history)
        const cards = gsap.utils.toArray<HTMLElement>('[data-hist-card]', history)
        const pinElement = history.querySelector('[data-hist-pin]')

        if (histEyebrow) gsap.set(histEyebrow, { y: 15, opacity: 0 })
        if (histTitle) gsap.set(histTitle, { opacity: 0 })
        if (histWords.length) gsap.set(histWords, { y: 20, opacity: 0, filter: 'blur(10px)' })
        if (histIntro) gsap.set(histIntro, { y: 20, opacity: 0 })
        
        // Initial state for cards
        gsap.set(cards, { opacity: 0, filter: 'blur(10px)', y: 30, scale: 0.95 })

        // Intro animation for the timeline section
        ScrollTrigger.create({
          trigger: history,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlHist = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (histEyebrow) tlHist.to(histEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (histTitle) tlHist.set(histTitle, { opacity: 1 }, 0.1)
            if (histWords.length) tlHist.to(histWords, { y: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.word }, 0.1)
            if (histIntro) tlHist.to(histIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
          }
        })

        if (track && line && cards.length && pinElement) {
          const scrubTl = gsap.timeline({
            scrollTrigger: {
              trigger: history,
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
              pin: pinElement,
              pinSpacing: false,
              invalidateOnRefresh: true,
            }
          })

          // Calculate horizontal scroll
          scrubTl.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: 'none',
            duration: 1,
            force3D: true,
            autoRound: false
          }, 0)

          // Calculate and insert card blur animations and icon updates
          // Using a short delay inside requestAnimationFrame to ensure layout is done
          requestAnimationFrame(() => {
            const maxScroll = track.scrollWidth - window.innerWidth
            
            const p_values = cards.map(card => {
              // No mobile, dispara logo que o card entra na tela (80% da tela)
              // No desktop, dispara um pouco antes do centro
              const isMobile = window.innerWidth < 768
              const triggerOffset = isMobile 
                ? window.innerWidth * 0.8 
                : (window.innerWidth - card.offsetWidth) / 2 + (window.innerWidth * 0.05)
              
              let p = (card.offsetLeft - triggerOffset) / maxScroll
              return Math.max(0, Math.min(1, p))
            })
            
            let prevP = 0

            cards.forEach((card, i) => {
              const p = p_values[i]
              const nodeP = i / (cards.length - 1)
              
              // Set node position on fixed bar
              if (nodes[i]) {
                gsap.set(nodes[i], { left: `${nodeP * 100}%`, xPercent: -50, yPercent: -50 })
              }

              // Animate line to this node
              if (p > prevP) {
                scrubTl.to(line, {
                  width: `${nodeP * 100}%`,
                  ease: 'none',
                  duration: p - prevP
                }, prevP)
              }
              prevP = p

              // Blur in and scale card
              scrubTl.to(card, {
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                scale: 1,
                duration: 0.15,
                ease: 'power3.out',
                force3D: true
              }, p)

              // Light up node
              if (nodes[i]) {
                scrubTl.to(nodes[i], {
                  borderColor: '#004C26',
                  color: '#ffffff',
                  backgroundColor: '#004C26',
                  duration: 0.05,
                  ease: 'power1.inOut'
                }, p)
              }
            })

            // Finish the line if needed
            if (prevP < 1) {
              scrubTl.to(line, { width: '100%', ease: 'none', duration: 1 - prevP }, prevP)
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

      if (mission) {
        const mEyebrow = mission.querySelector('[data-mis-eyebrow]')
        const mTitle = mission.querySelector('[data-mis-title]')
        const mDesc = mission.querySelector('[data-mis-desc]')
        const mVisual = mission.querySelector('[data-mis-visual]')

        if (mEyebrow) gsap.set(mEyebrow, { y: 15, opacity: 0 })
        if (mTitle) gsap.set(mTitle, { y: 20, opacity: 0 })
        if (mDesc) gsap.set(mDesc, { y: 20, opacity: 0 })
        if (mVisual) gsap.set(mVisual, { scale: 0.95, opacity: 0 })

        ScrollTrigger.create({
          trigger: mission,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const tlMis = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (mEyebrow) tlMis.to(mEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (mTitle) tlMis.to(mTitle, { y: 0, opacity: 1, duration: 0.7 }, 0.1)
            if (mDesc) tlMis.to(mDesc, { y: 0, opacity: 1, duration: DUR.sub }, 0.2)
            if (mVisual) tlMis.to(mVisual, { scale: 1, opacity: 1, duration: 0.8 }, 0.25)
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
    <div ref={containerRef}>
      <Container>
        {/* Cabeçalho */}
        <div className="mb-24">
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

      </Container>

      {/* Linha do Tempo */}
      <div ref={historyRef} className="mb-8 relative h-[400vh]">
        <div data-hist-pin className="h-screen w-full flex flex-col justify-center overflow-hidden bg-background">
          
          {/* INTRO TEXT (FIXED ABOVE PROGRESS BAR) */}
          <div className="absolute top-[2%] left-0 w-full z-30 flex justify-center px-4 pointer-events-none">
            <div className="text-center max-w-[800px] pointer-events-auto">
              <span data-hist-eyebrow className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3 md:mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('historyEyebrow')}
              </span>
              <h2 data-hist-title className="font-montserrat uppercase text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-3 md:mb-4 leading-[0.95] mx-auto">
                {t('historyTitle')}
              </h2>
              <p data-hist-intro className="text-sm md:text-base lg:text-lg text-foreground/70 leading-relaxed mx-auto max-w-[600px]">
                {t('historyIntro')}
              </p>
            </div>
          </div>

          {/* FIXED PROGRESS BAR */}
          <div className="absolute top-[32%] md:top-[38%] left-0 w-full z-30 pointer-events-none flex justify-center">
            <Container>
              <div className="px-[5vw] md:px-[10vw] w-full">
                <div className="relative w-full flex items-center h-16">
                {/* Background Line */}
                <div className="absolute left-0 right-0 h-1 bg-foreground/10" />
                {/* Animated Line */}
                <div data-hist-line className="absolute left-0 h-1 bg-[#004C26] origin-left z-10" style={{ width: '0%' }} />

                {/* Nodes Container */}
                <div className="absolute left-0 right-0 h-full">
                  {TIMELINE_KEYS.map((key, i) => {
                    const Icon = TIMELINE_ICONS[key]
                    return (
                      <div 
                        key={`node-${key}`}
                        data-hist-node={i}
                        className="absolute top-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full border-[3px] border-[#004C26]/20 bg-background flex items-center justify-center text-[#004C26]/40 transition-colors duration-300 shadow-sm z-20 pointer-events-auto"
                        style={{ left: `${(i / (TIMELINE_KEYS.length - 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <span className="absolute bottom-full mb-2 md:mb-3 text-[10px] md:text-xs font-bold font-montserrat text-[#004C26]">
                          {TIMELINE_YEARS[i]}
                        </span>
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                    )
                  })}
                </div>
              </div>
              </div>
            </Container>
          </div>

          {/* SCROLLING TRACK */}
          <div data-hist-track className="flex flex-col justify-start pt-[42vh] md:pt-[48vh] h-full w-max pb-8 md:pb-16 will-change-transform [transform:translateZ(0)]">
              <div className="flex gap-16 md:gap-32 px-[5vw] md:px-[10vw] w-max relative z-10 items-start">
                {/* Cards */}
                {TIMELINE_KEYS.map((key, i) => (
                  <div 
                    key={`card-${key}`} 
                    data-hist-card 
                    className="w-[85vw] sm:w-[60vw] md:w-[40vw] max-w-[550px] shrink-0 flex flex-col justify-start bg-white border border-foreground/5 dark:border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 lg:p-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden"
                  >
                    {/* Marca d'água estourando nas bordas */}
                    <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 pointer-events-none opacity-[0.05] select-none">
                      <span className="text-subtitle text-[6rem] md:text-[8rem] lg:text-[10rem] font-black leading-none text-primary">
                        {TIMELINE_YEARS[i]}
                      </span>
                    </div>
                    
                    <div className="relative z-10 w-full">
                      <div className="font-mono text-lg md:text-xl lg:text-2xl font-bold text-primary mb-2 md:mb-4 flex items-center gap-4">
                        <span className="w-8 md:w-10 h-1 bg-primary rounded-full"></span>
                        {TIMELINE_YEARS[i]}
                      </div>
                      <h3 className="font-montserrat uppercase text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-3 md:mb-4 leading-[0.95] drop-shadow-sm">
                        {t(`timeline.${key}.title`)}
                      </h3>
                      <p className="text-foreground/80 text-sm md:text-base lg:text-lg leading-relaxed drop-shadow-sm font-medium">
                        {t(`timeline.${key}.desc`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      <Container>
        {/* Valores */}
        <div ref={valuesRef} className="mb-24 lg:mb-32">
          <div className="flex flex-col gap-4 mb-8">
            <div className="md:w-1/3 shrink-0">
              <span data-val-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('valuesEyebrow')}
              </span>
            </div>
            <div className="md:w-2/3 max-w-[64rem]">
              <h2 data-val-title className="font-montserrat uppercase text-2xl md:text-4xl font-black text-foreground tracking-tight mb-2 leading-[0.95]">
                {t('valuesTitle')}
              </h2>
              <p data-val-intro className="text-sm md:text-base text-foreground/70 leading-relaxed">
                {t('valuesIntro')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[minmax(150px,1fr)_minmax(170px,1fr)_minmax(170px,1fr)_minmax(150px,1fr)_minmax(130px,1fr)]">
            {VALUE_KEYS.map((key, i) => {
              const { image } = VALUES_CONTENT[key]

              // Mosaic 7 Layout grid positions on desktop:
              // i = 0 (v1): Top-left large (2 cols, 2 rows)
              // i = 1 (v2): Top-right top small (1 col, 1 row)
              // i = 2 (v3): Top-right bottom vertical (1 col, 1 row)
              // i = 3 (v4): Bottom-left top vertical (1 col, 1 row)
              // i = 4 (v5): Bottom-left bottom small (1 col, 1 row)
              // i = 5 (v6): Bottom-right large (2 cols, 2 rows)
              // i = 6 (v7): Footer (3 cols, 1 row)
              const positionClass = 
                i === 0 ? 'lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-3' :
                i === 1 ? 'lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2' :
                i === 2 ? 'lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3' :
                i === 3 ? 'lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4' :
                i === 4 ? 'lg:col-start-1 lg:col-end-2 lg:row-start-4 lg:row-end-5' :
                i === 5 ? 'lg:col-start-2 lg:col-end-4 lg:row-start-3 lg:row-end-5' :
                'sm:col-span-2 lg:col-start-1 lg:col-end-4 lg:row-start-5 lg:row-end-6'

              // Vertical layout on all screens: Text on top, image on the bottom
              const maskClass = '[mask-image:linear-gradient(to_top,black_45%,transparent)] [-webkit-mask-image:linear-gradient(to_top,black_45%,transparent)]'
              
              const isLarge = i === 0 || i === 5
              const imagePosClass = isLarge 
                ? 'bottom-0 left-0 w-full h-[45%] sm:h-[50%] lg:h-[72%]'
                : 'bottom-0 left-0 w-full h-[45%] sm:h-[42%] lg:h-[40%]'
              
              const cardMinHeight = i === 6 
                ? 'min-h-[220px] sm:min-h-[140px] lg:min-h-0'
                : 'min-h-[220px] sm:min-h-[240px] lg:min-h-0'

              return (
                <div 
                  key={key} 
                  data-val-card 
                  className={`group relative flex flex-col overflow-hidden rounded-xl border border-foreground/8 bg-white transition-shadow hover:shadow-lg ${cardMinHeight} ${positionClass}`}
                >
                  {/* Imagem de Fundo */}
                  <div className={`absolute pointer-events-none z-0 overflow-hidden ${imagePosClass} ${maskClass}`}>
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
                  <div className="relative z-10 flex flex-col gap-0.5 lg:gap-1 p-3.5 lg:p-4 w-full mb-auto">
                    <h3 className="font-black uppercase leading-[1.1] tracking-tight text-foreground text-sm sm:text-base lg:text-base">
                      {t(`values.${key}.title`)}
                    </h3>
                    <p className="text-subtitle m-0 text-xs sm:text-[13px] lg:text-sm leading-normal sm:leading-relaxed text-foreground/55 max-w-[95%]">
                      {t(`values.${key}.desc`)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Missão */}
        <div ref={missionRef} className="mb-24 lg:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Visual Panel */}
            <div data-mis-visual className="order-2 lg:order-1 lg:col-span-5 relative h-[300px] sm:h-[400px] lg:h-[450px] rounded-[2rem] overflow-hidden group shadow-xl">
              <Image 
                src="https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800&auto=format&fit=crop"
                alt={t('missionTitle')}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-[1.2s] ease-out"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#004C26]/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#004C26] flex items-center justify-center text-white">
                  <ClipboardEdit className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold font-montserrat text-foreground tracking-wider uppercase">
                  {t('missionBadge')}
                </span>
              </div>
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col justify-center">
              <span data-mis-eyebrow className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('missionEyebrow')}
              </span>
              <h2 data-mis-title className="font-montserrat uppercase text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-6 leading-[0.95]">
                {t('missionTitle')}
              </h2>
              <div data-mis-desc className="relative border-l-4 border-primary pl-6 py-2">
                <p className="text-base sm:text-lg md:text-xl text-foreground/85 leading-relaxed font-medium">
                  {t('missionText')}
                </p>
              </div>
            </div>
          </div>
        </div>

        

        {/* Presença internacional (globo com sede BR + filial EUA) */}
        <div className="mb-32">
          <GlobalPresence variant="embedded" />
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
            <div className="md:w-2/3 max-w-[64rem]">
              <h2 data-gal-title className="font-montserrat text-3xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-[0.95]">
                {t('galleryTitle')}
              </h2>
              <p data-gal-intro className="text-lg text-foreground/70 leading-relaxed">
                {t('galleryIntro')}
              </p>
            </div>
          </div>

          {/* Foto grande: acervo da família; demais do banco de imagens até chegar o acervo completo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[60vh] md:h-[80vh]">
            {[
              { src: '/heritage/fundador-e-filhos.png', span: 'col-span-2 row-span-2', sizes: '(min-width: 768px) 50vw, 100vw' },
              { src: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=800&auto=format&fit=crop', span: '', sizes: '(min-width: 768px) 25vw, 50vw' },
              { src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop', span: '', sizes: '(min-width: 768px) 25vw, 50vw' },
              { src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop', span: 'col-span-2', sizes: '(min-width: 768px) 50vw, 100vw' },
            ].map((photo, i) => (
              <div key={i} data-gal-img className={`${photo.span} bg-foreground/5 rounded-3xl overflow-hidden relative group`}>
                <Image
                  src={photo.src}
                  alt={t('galleryTitle')}
                  fill
                  sizes={photo.sizes}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
              <h2 data-hl-title className="font-montserrat text-4xl md:text-7xl lg:text-[100px] font-black uppercase tracking-tighter mb-8 leading-[0.95] text-white">
                {t('purposeTitleStart')} <em className="text-highlight text-yellow-400">{t('purposeTitleHighlight')}</em><br />
                {t('purposeTitleEnd')}
              </h2>
              <p data-hl-intro className="text-white/85 text-lg md:text-xl max-w-[64rem] mx-auto leading-relaxed">
                {t('purposeBody')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div ref={ctaRef} className="rounded-3xl bg-primary text-white p-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 max-w-[64rem]">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {t('ctaEyebrow')}
            </span>
            <h2 className="font-montserrat text-3xl md:text-4xl font-black uppercase text-white tracking-tight mb-4 leading-[0.95]">
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
      </Container>
    </div>
  )
}
