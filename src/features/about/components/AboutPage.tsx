'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { Container } from '@/components/layout/Container'
import { useTranslations } from 'next-intl'
import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { createCharReveal, revealToggleActions , bindSectionReveal } from '@/features/animation/charReveal'
import { onPreloaderDone } from '@/features/animation/preloaderGate'
import { DUR, EASE, blurPx } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

import { Leaf, Tractor, Sun, TreePine, Sprout, ClipboardEdit, LucideIcon } from 'lucide-react'
import { GlobalPresence } from '@/features/home/components/GlobalPresence'

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
  v1: { image: '/assets/about/bento/values-parceria.webp?v=20260731c' },
  v2: { image: '/assets/about/bento/values-qualidade.webp?v=20260731c' },
  v3: { image: '/assets/about/bento/values-etica.webp?v=20260731c' },
  v4: { image: '/assets/about/bento/values-honestidade.webp?v=20260731c' },
  v5: { image: '/assets/about/bento/values-comprometimento.webp?v=20260731c' },
  v6: { image: '/assets/about/bento/values-eficiencia.webp?v=20260731c' },
  v7: { image: '/assets/about/bento/values-otimismo.webp?v=20260731c' }
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

      const reveal = createCharReveal(title)
      const chars = reveal?.chars ?? []

      if (eyebrow) gsap.set(eyebrow, { y: 15, opacity: 0 })
      if (title) gsap.set(title, { opacity: 0 })
      reveal?.hide()
      if (intro) gsap.set(intro, { y: 20, opacity: 0 })

      /* Pausada de propósito: quem solta é o portão do preloader, logo abaixo.
         Rodando no mount, a abertura acontecia inteira atrás do overlay branco
         e o título aparecia já montado. */
      const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.reveal } })
      if (eyebrow) tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.5 })
      if (title) tl.set(title, { opacity: 1 }, 0.1)
      reveal?.playIn(tl, 0.1)
      if (intro) tl.to(intro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
      const soltarAbertura = onPreloaderDone(() => tl.play())

      if (history) {
        const histEyebrow = history.querySelector('[data-hist-eyebrow]')
        const histTitle = history.querySelector('[data-hist-title]')
        const histIntro = history.querySelector('[data-hist-intro]')
        
        const histReveal = createCharReveal(histTitle as HTMLElement | null, { by: 'words', axis: 'y' })
        const histWords = histReveal?.chars ?? []
        
        const track = history.querySelector('[data-hist-track]')
        const line = history.querySelector('[data-hist-line]')
        const nodes = gsap.utils.toArray<HTMLElement>('[data-hist-node]', history)
        const cards = gsap.utils.toArray<HTMLElement>('[data-hist-card]', history)
        const pinElement = history.querySelector('[data-hist-pin]')

        if (histEyebrow) gsap.set(histEyebrow, { y: 15, opacity: 0 })
        if (histTitle) gsap.set(histTitle, { opacity: 0 })
        histReveal?.hide()
        if (histIntro) gsap.set(histIntro, { y: 20, opacity: 0 })
        
        // Initial state for cards
        gsap.set(cards, { opacity: 0, filter: blurPx(10), y: 30, scale: 0.95 })

        // Intro animation for the timeline section
        bindSectionReveal(history, () => {
            const tlHist = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (histEyebrow) tlHist.to(histEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (histTitle) tlHist.set(histTitle, { opacity: 1 }, 0.1)
            histReveal?.playIn(tlHist, 0.1)
            if (histIntro) tlHist.to(histIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
          return tlHist
        }, { start: 'top 80%' })

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
                filter: blurPx(0),
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

        const vReveal = createCharReveal(vTitle as HTMLElement | null)

        if (vEyebrow) gsap.set(vEyebrow, { y: 15, opacity: 0 })
        if (vTitle) gsap.set(vTitle, { opacity: 0 })
        vReveal?.hide()
        if (vIntro) gsap.set(vIntro, { y: 20, opacity: 0 })
        bindSectionReveal(values, () => {
            const tlVal = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (vEyebrow) tlVal.to(vEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (vTitle) tlVal.set(vTitle, { opacity: 1 }, 0.1)
            vReveal?.playIn(tlVal, 0.1)
            if (vIntro) tlVal.to(vIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
          return tlVal
        }, { start: 'top 80%' })

        if (vCards.length > 0) {
          const mm = gsap.matchMedia()

          // Desktop e Tablet (sm em diante) - Stagger no grupo
          mm.add('(min-width: 640px)', () => {
            gsap.set(vCards, { opacity: 0, filter: blurPx(12) })

            const tlCards = gsap.timeline({
              scrollTrigger: {
                trigger: vCards[0].parentElement || values,
                start: 'top 85%',
                end: 'bottom top',
                toggleActions: revealToggleActions(),
              }
            })

            tlCards.to(vCards, {
              opacity: 1,
              filter: blurPx(0),
              duration: 1.4,
              stagger: 0.3,
              ease: 'power3.out'
            })
          })

          // Mobile - ScrollTrigger individual para cada card
          mm.add('(max-width: 639px)', () => {
            vCards.forEach((card) => {
              gsap.set(card, { opacity: 0, filter: blurPx(12) })

              gsap.to(card, {
                scrollTrigger: {
                  trigger: card,
                  start: 'top 85%',
                  end: 'bottom top',
                  toggleActions: revealToggleActions(),
                },
                opacity: 1,
                filter: blurPx(0),
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

        const revealHL = createCharReveal(hlTitle as HTMLElement | null)
        const charsHL = revealHL?.chars ?? []

        if (hlEyebrow) gsap.set(hlEyebrow, { y: 15, opacity: 0 })
        if (hlTitle) gsap.set(hlTitle, { opacity: 0 })
        revealHL?.hide()
        if (hlIntro) gsap.set(hlIntro, { y: 20, opacity: 0 })

        bindSectionReveal(highlight, () => {
            const tlHl = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (hlEyebrow) tlHl.to(hlEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (hlTitle) tlHl.set(hlTitle, { opacity: 1 }, 0.1)
            revealHL?.playIn(tlHl, 0.1)
            if (hlIntro) tlHl.to(hlIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.4)
          return tlHl
        }, { start: 'top 75%' })
      }

      if (gallery) {
        const galEyebrow = gallery.querySelector('[data-gal-eyebrow]')
        const galTitle = gallery.querySelector('[data-gal-title]')
        const galIntro = gallery.querySelector('[data-gal-intro]')
        const galImgs = gsap.utils.toArray<HTMLElement>('[data-gal-img]', gallery)

        const galReveal = createCharReveal(galTitle as HTMLElement | null)

        if (galEyebrow) gsap.set(galEyebrow, { y: 15, opacity: 0 })
        if (galTitle) gsap.set(galTitle, { opacity: 0 })
        galReveal?.hide()
        if (galIntro) gsap.set(galIntro, { y: 20, opacity: 0 })
        if (galImgs.length) gsap.set(galImgs, { y: 30, opacity: 0 })

        bindSectionReveal(gallery, () => {
            const tlGal = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (galEyebrow) tlGal.to(galEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (galTitle) tlGal.set(galTitle, { opacity: 1 }, 0.1)
            galReveal?.playIn(tlGal, 0.1)
            if (galIntro) tlGal.to(galIntro, { y: 0, opacity: 1, duration: DUR.sub }, 0.35)
            if (galImgs.length) {
              tlGal.to(galImgs, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 0.35)
            }
          return tlGal
        }, { start: 'top 80%' })
      }

      if (mission) {
        const mEyebrow = mission.querySelector('[data-mis-eyebrow]')
        const mTitle = mission.querySelector('[data-mis-title]')
        const mDesc = mission.querySelector('[data-mis-desc]')
        const mVisual = mission.querySelector('[data-mis-visual]')

        const mReveal = createCharReveal(mTitle as HTMLElement | null)

        if (mEyebrow) gsap.set(mEyebrow, { y: 15, opacity: 0 })
        if (mTitle) gsap.set(mTitle, { opacity: 0 })
        mReveal?.hide()
        if (mDesc) gsap.set(mDesc, { y: 20, opacity: 0 })
        if (mVisual) gsap.set(mVisual, { scale: 0.95, opacity: 0 })

        bindSectionReveal(mission, () => {
            const tlMis = gsap.timeline({ defaults: { ease: EASE.reveal } })
            if (mEyebrow) tlMis.to(mEyebrow, { y: 0, opacity: 1, duration: 0.5 })
            if (mTitle) tlMis.set(mTitle, { opacity: 1 }, 0.1)
            mReveal?.playIn(tlMis, 0.1)
            if (mDesc) tlMis.to(mDesc, { y: 0, opacity: 1, duration: DUR.sub }, 0.35)
            if (mVisual) tlMis.to(mVisual, { scale: 1, opacity: 1, duration: 0.8 }, 0.25)
          return tlMis
        }, { start: 'top 80%' })
      }

      return () => {
        soltarAbertura()
        reveal?.revert()
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
                {t('historyTitleStart')} <em className="text-highlight text-primary">{t('historyTitleHighlight')}</em>
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
                {t('valuesTitleStart')} <em className="text-highlight text-primary">{t('valuesTitleHighlight')}</em>
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

              const cardMinHeight = i === 6
                ? 'min-h-[220px] sm:min-h-[140px] lg:min-h-0'
                : 'min-h-[220px] sm:min-h-[240px] lg:min-h-0'

              // Imagem sempre em tela cheia. No mobile (cards empilhados, abaixo de sm)
              // o painel fica sempre centralizado e padronizado; a variação de posição
              // por card só entra a partir de sm, quando o mosaico deixa de empilhar.
              const panelAlignSm =
                i === 0 ? 'sm:justify-end sm:items-start' :   // hero grande: painel embaixo à esquerda
                i === 1 ? 'sm:justify-start sm:items-start' : // top-left
                i === 2 ? 'sm:justify-end sm:items-end' :     // bottom-right
                i === 3 ? 'sm:justify-start sm:items-end' :   // top-right
                i === 4 ? 'sm:justify-end sm:items-start' :   // bottom-left
                i === 5 ? 'sm:justify-end sm:items-end' :     // hero grande: painel embaixo à direita
                'sm:justify-center sm:items-start'            // rodapé largo: centralizado à esquerda
              const panelAlign = `justify-center items-center ${panelAlignSm}`

              const isWide = i === 6
              const panelWidthSm = isWide ? 'sm:max-w-[50%]' : i === 0 || i === 5 ? 'sm:max-w-[75%]' : 'sm:max-w-[92%]'
              const panelWidth = `max-w-[90%] ${panelWidthSm}`

              return (
                <div
                  key={key}
                  data-val-card
                  className={`group relative flex overflow-hidden rounded-xl border border-foreground/8 bg-white transition-shadow hover:shadow-lg ${cardMinHeight} ${positionClass}`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/15 pointer-events-none" />
                  <div className={`relative z-10 w-full h-full p-3 sm:p-4 lg:p-5 flex flex-col ${panelAlign}`}>
                    <div className={`bg-black/30 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl flex flex-col gap-0.5 lg:gap-1 ${panelWidth}`}>
                      <h3 className="font-black uppercase leading-[1.1] tracking-tight text-white text-sm sm:text-base lg:text-base drop-shadow-md">
                        {t(`values.${key}.title`)}
                      </h3>
                      <p className="text-subtitle m-0 text-xs sm:text-[13px] lg:text-sm leading-normal sm:leading-relaxed text-white/95 drop-shadow-sm">
                        {t(`values.${key}.desc`)}
                      </p>
                    </div>
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
                src="/assets/about/bento/mission-sustentavel.webp?v=20260731c"
                alt={`${t('missionTitleStart')} ${t('missionTitleHighlight')}`}
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
                {t('missionTitleStart')} <em className="text-highlight text-primary">{t('missionTitleHighlight')}</em>
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
              <h2 data-gal-title className="font-montserrat uppercase text-3xl md:text-5xl font-black text-foreground tracking-tight mb-6 leading-[0.95]">
                {t('galleryTitleStart')} <em className="text-highlight text-primary">{t('galleryTitleHighlight')}</em>
              </h2>
              <p data-gal-intro className="text-lg text-foreground/70 leading-relaxed">
                {t('galleryIntro')}
              </p>
            </div>
          </div>

          {/* Bento Grid de imagens aéreas (drone) representando a presença da Juma Agro pelo Brasil */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[60vh] md:h-[80vh]">
            {[
              {
                src: '/about/drone-sp.webp',
                alt: 'Vista aérea de lavouras e pivôs de irrigação em São Paulo e Sudeste',
                caption: 'Sede & Região Sudeste (SP, MG)',
                span: 'col-span-2 row-span-2',
                sizes: '(min-width: 768px) 50vw, 100vw',
              },
              {
                src: '/about/drone-mt.webp',
                alt: 'Vista superior de drone das lavouras no Cerrado e Centro-Oeste',
                caption: 'Cerrado & Centro-Oeste (MT, MS, GO)',
                span: 'col-span-1',
                sizes: '(min-width: 768px) 25vw, 50vw',
              },
              {
                src: '/about/drone-pr.webp',
                alt: 'Vista aérea de colinas agrícolas e lavouras no Sul do Brasil',
                caption: 'Região Sul (PR, RS, SC)',
                span: 'col-span-1',
                sizes: '(min-width: 768px) 25vw, 50vw',
              },
              {
                src: '/about/drone-ba.webp',
                alt: 'Panorâmica aérea de lavouras na fronteira agrícola do MATOPIBA',
                caption: 'Fronteira Agrícola (BA, TO, MA, PI)',
                span: 'col-span-2',
                sizes: '(min-width: 768px) 50vw, 100vw',
              },
            ].map((photo, i) => (
              <div key={i} data-gal-img className={`${photo.span} bg-foreground/5 rounded-3xl overflow-hidden relative group`}>
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={photo.sizes}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-montserrat font-bold text-sm md:text-base translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {photo.caption}
                  </span>
                </div>
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
                {t('purposeTitleStart')} <em className="text-highlight text-[#F0E27A]">{t('purposeTitleHighlight')}</em><br />
                {t('purposeTitleEnd')}
              </h2>
              <p data-hl-intro className="text-white/85 text-lg md:text-xl max-w-[64rem] mx-auto leading-relaxed">
                {t('purposeBody')}
              </p>
            </div>
          </div>
        </div>

      </Container>
    </div>
  )
}
