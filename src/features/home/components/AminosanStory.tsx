'use client'

/**
 * "A transformação do Aminosan"
 *
 * Desktop: seção com scroll capturado. Ao entrar, o vídeo toca normalmente
 * (play nativo, fluido). Quando o vídeo pausa no último frame, as informações
 * do Ato 3 aparecem e o scroll é liberado — o usuário pode sair para cima ou
 * para baixo. Rolar para cima de volta ao topo da seção dispara o reverso.
 *
 * Mobile / reduced-motion: SimpleVersion — dois blocos full-bleed, sem lock.
 */
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode, type RefObject } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/features/animation/gsap'
import { useLenis } from '@/features/animation/SmoothScroll'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { StaggerGroup } from '@/features/animation/StaggerGroup'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Container } from '@/components/layout/Container'

type TFn = ReturnType<typeof useTranslations>

type LineBottle = {
  src: string
  alt: string
  x: number
  mx: number
  width: number
  mobileWidth: number
  scale: number
  mobileScale: number
  z: number
  y?: number
}

const LINE_BOTTLES: LineBottle[] = [
  { src: '/produtos/acorda-cana-20l.png', alt: 'Acorda Cana', x: -555, mx: -178, width: 178, mobileWidth: 84, scale: 0.88, mobileScale: 0.74, z: 1, y: 12 },
  { src: '/produtos/acorda-ultra-10l.png', alt: 'Acorda Ultra', x: -438, mx: -138, width: 176, mobileWidth: 82, scale: 0.9, mobileScale: 0.78, z: 2, y: 10 },
  { src: '/produtos/kmep-ultra-10l.png', alt: 'KMEP Ultra', x: -318, mx: -98, width: 182, mobileWidth: 84, scale: 0.92, mobileScale: 0.8, z: 3, y: 8 },
  { src: '/produtos/acorda-ultra-1l.png', alt: 'Acorda Ultra 1L', x: -198, mx: -62, width: 124, mobileWidth: 60, scale: 0.94, mobileScale: 0.82, z: 5, y: -4 },
  { src: '/produtos/redutan-npk-sili-4-1l.png', alt: 'Redutan NPK Sili-4', x: -112, mx: -30, width: 148, mobileWidth: 68, scale: 0.98, mobileScale: 0.88, z: 6, y: -8 },
  { src: '/produtos/aminosan-1l.png', alt: 'Aminosan', x: 0, mx: 0, width: 176, mobileWidth: 84, scale: 1.18, mobileScale: 1.05, z: 12, y: -18 },
  { src: '/produtos/redutan-npk-sili-5-1l.png', alt: 'Redutan NPK Sili-5', x: 124, mx: 34, width: 146, mobileWidth: 68, scale: 0.98, mobileScale: 0.88, z: 6, y: -8 },
  { src: '/produtos/revigo-cobre-ultra-1l.png', alt: 'Revigo Cobre Ultra', x: 222, mx: 70, width: 132, mobileWidth: 62, scale: 0.95, mobileScale: 0.82, z: 5, y: -4 },
  { src: '/produtos/fitofert-20l.png', alt: 'FitoFert', x: 342, mx: 108, width: 174, mobileWidth: 80, scale: 0.9, mobileScale: 0.78, z: 3, y: 10 },
  { src: '/produtos/aminosan-20l.png', alt: 'Aminosan 20L', x: 464, mx: 148, width: 178, mobileWidth: 82, scale: 0.88, mobileScale: 0.76, z: 2, y: 12 },
  { src: '/produtos/aduban-20l.png', alt: 'Aduban', x: 582, mx: 188, width: 176, mobileWidth: 82, scale: 0.86, mobileScale: 0.72, z: 1, y: 13 },
]

export function AminosanStory() {
  const t = useTranslations('aminosanStory')
  const reduced = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className="w-full overflow-x-hidden aminosan-wrapper">
      {reduced ? (
        <SimpleVersion key="simple" t={t} isMobile={isMobile} reduced={reduced} />
      ) : (
        <CinematicVersion key="cinematic" t={t} isMobile={isMobile} />
      )}
    </div>
  )
}

/* ── SimpleVersion — mobile / reduced-motion ───────────────────────── */

function SimpleVersion({ t, isMobile, reduced }: { t: TFn; isMobile: boolean; reduced: boolean }) {
  const stageRef          = useRef<HTMLDivElement>(null)
  const oldImgRef         = useRef<HTMLImageElement>(null)
  const videoRef          = useRef<HTMLVideoElement>(null)
  const textCardRef       = useRef<HTMLDivElement>(null)
  const calloutsRef       = useRef<HTMLDivElement>(null)
  const calloutSectionRef = useRef<HTMLDivElement>(null)
  const lenis             = useLenis()

  useGSAP(
    () => {
      const oldImg = oldImgRef.current
      const video = videoRef.current
      const stage = stageRef.current
      if (!oldImg || !video || !stage) return

      const textItems = textCardRef.current ? gsap.utils.toArray<HTMLElement>(textCardRef.current.children) : []
      const calloutItems = calloutsRef.current ? gsap.utils.toArray<HTMLElement>(calloutsRef.current.children) : []

      if (reduced) { 
        gsap.set(oldImg, { scale: 1, opacity: 1, yPercent: 0 })
        gsap.set(textItems, { y: 0, opacity: 1 })
        gsap.set(calloutItems, { y: 0, opacity: 1 })
        return 
      }

      // --- Scrubbed Video Playback ---
      // O vídeo avança de acordo com o progresso do scroll do container inteiro (250vh)
      const triggerVideo = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          if (video && video.duration) {
            video.currentTime = self.progress * video.duration
          }
        },
      })

      // --- Auto-Scroll no top -10% ---
      const triggerAutoScroll = ScrollTrigger.create({
        trigger: stage,
        start: 'top -10%',
        once: true,
        onEnter: () => {
          gsap.set(oldImg, { opacity: 0 })
          gsap.set(video, { opacity: 1 })

          if (calloutSectionRef.current) {
            lenis?.scrollTo(calloutSectionRef.current, { 
              duration: 2.5, 
              force: true,
              lock: true,
              ease: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t) 
            } as any)
          }
        }
      })

      // --- Intro Animação (Garrafa subindo) ---
      const oldImgTl = gsap.timeline()
      gsap.set(oldImg, { yPercent: 100, scale: 1.04, opacity: 1 })
      oldImgTl.to(oldImg, { yPercent: 0, scale: 1, duration: 1, ease: 'none' })
      const triggerIntro = ScrollTrigger.create({
        trigger: stage,
        start: 'top 85%',
        end: 'top 15%',
        scrub: 1,
        animation: oldImgTl,
      })

      // --- Fade-out do Texto 1 ---
      // Conforme o usuário rola a partir do topo, o texto some para dar lugar à transição
      gsap.set(textItems, { y: 0, opacity: 1 }) // Começa visível no topo
      const outTl = gsap.timeline()
      outTl.to(textItems, { y: -30, opacity: 0, duration: 1, stagger: 0.1, ease: 'none' }, 0)
      const triggerOut = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: 'top -50%',
        scrub: 1,
        animation: outTl,
      })

      // --- Animação dos Callouts da Seção 2 ---
      gsap.set(calloutItems, { y: 24, opacity: 0 })
      const triggerCallouts = ScrollTrigger.create({
        trigger: calloutSectionRef.current,
        start: 'top 80%',
        end: 'center 60%',
        scrub: 1,
        animation: gsap.to(calloutItems, {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: 'power1.out',
        })
      })

      return () => {
        triggerVideo.kill()
        triggerAutoScroll.kill()
        triggerIntro.kill()
        triggerOut.kill()
        triggerCallouts.kill()
      }
    },
    { dependencies: [reduced, isMobile, lenis], scope: stageRef },
  )

  return (
    <section ref={stageRef} className="relative w-full h-[250vh] bg-white">
      
      {/* Fundo Fixo (Sticky) - Vídeo e Imagem */}
      <div className="sticky top-0 w-full h-[100svh] overflow-hidden bg-white flex flex-col">
        {/* Spacer invisível para empurrar a garrafa para baixo do texto */}
        <div className="shrink-0 h-[45svh] w-full pointer-events-none" aria-hidden />
        <div className="relative flex-1 w-full mt-auto">
          <Image
            ref={oldImgRef}
            src={isMobile ? '/heritage/mobile/morph-aminosan-1-antigo.png' : '/heritage/desktop/morph-aminosan-1-antigo.png'}
            alt={t('oldBottleAlt')}
            fill sizes="100vw"
            className="object-cover object-bottom z-10"
            priority
          />
          <video
            ref={videoRef}
            muted playsInline preload="auto"
            poster={isMobile ? '/heritage/mobile/morph-aminosan-1-antigo.png' : '/heritage/desktop/morph-aminosan-1-antigo.png'}
            aria-label={t('videoAlt')}
            className="absolute inset-0 h-full w-full object-cover object-bottom opacity-0 z-0"
          >
            <source src={isMobile ? '/heritage/mobile/morph-aminosan.mp4' : '/heritage/desktop/morph-aminosan.mp4'} type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Texto 1 (Frame Inicial) - Posicionado no topo do scroll */}
      <div className="absolute top-0 left-0 w-full h-[100svh] pointer-events-none">
        <Container className="relative z-10 flex flex-col items-center justify-start px-md pt-[15vh] pb-4 text-center pointer-events-auto">
          <div ref={textCardRef} className="flex flex-col items-center gap-3">
            <span className="text-eyebrow text-[10px] uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</span>
            <BicolorTitle title={t('title')} titleHi={t('titleHi')} className="text-[clamp(1.75rem,7vw,3rem)] leading-tight" />
            <p className="text-subtitle mt-2 max-w-[22rem] text-sm text-foreground/80">{t('body1')}</p>
            <p className="text-subtitle max-w-[22rem] text-sm text-foreground/80">{t('body2')}</p>
            {reduced && <p className="text-subtitle mt-4 text-sm text-foreground/55">{t('oldBottleCaption')}</p>}
          </div>
        </Container>
      </div>

      {/* Texto 2 (Frame Final) - Posicionado ao final do super-container */}
      <div ref={calloutSectionRef} className="absolute top-[150vh] left-0 w-full min-h-[100svh] bg-white z-20 pointer-events-auto flex flex-col justify-end">
        <div className="relative h-[70vh] w-full overflow-hidden sm:h-[75vh]">
          <Image
            src={isMobile ? '/heritage/mobile/morph-aminosan-2-novo.png' : '/heritage/desktop/morph-aminosan-2-novo.png'}
            alt={t('newBottleAlt')}
            fill sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent" />
        </div>
        <Container className="flex flex-col items-center gap-lg py-2xl">
          <div ref={calloutsRef} className="flex w-full max-w-[28rem] flex-col items-center gap-md text-center">
            <span className="text-eyebrow text-[10px] uppercase tracking-[0.18em] text-primary">{t('a3Eyebrow')}</span>
            <BicolorTitle title={t('a3Title')} titleHi={t('a3TitleHi')} className="text-[clamp(1.75rem,7vw,3rem)] leading-tight" />
            <p className="text-subtitle max-w-[22rem] text-sm text-foreground/80">{t('a3Body')}</p>
            <div className="flex flex-col items-center gap-xs">
              <span className="text-highlight text-2xl text-primary">{t('a3StatPrefix')}14 {t('a3StatUnit')}</span>
              <span className="text-subtitle text-sm text-foreground/80">{t('a3StatLabel')}</span>
              <span className="text-[11px] text-foreground/50">{t('a3StatSource')}</span>
            </div>
          </div>
        </Container>
      </div>

    </section>
  )
}

/* ── CinematicVersion — desktop ─────────────────────────────────────── */
/*
 * Máquina de 2 estados: 'act1' e 'act3'.
 * act1 → act3: video.play() nativo (sempre fluido).
 * act3 → act1: crossfade — fade in da oldImg cobre o vídeo enquanto callouts
 *              somem; currentTime é resetado em background (invisível).
 * Durante cada transição o scroll é travado; depois é liberado.
 */

function CinematicVersion({ t, isMobile }: { t: TFn; isMobile: boolean }) {
  const root            = useRef<HTMLDivElement>(null)
  const stageRef        = useRef<HTMLElement>(null)
  const videoFwdDesktopRef = useRef<HTMLVideoElement>(null)
  const videoRevDesktopRef = useRef<HTMLVideoElement>(null)
  const videoFwdMobileRef  = useRef<HTMLVideoElement>(null)
  const videoRevMobileRef  = useRef<HTMLVideoElement>(null)
  const oldImgRef       = useRef<HTMLImageElement>(null)
  const newImgRef       = useRef<HTMLImageElement>(null)
  const scrimRef        = useRef<HTMLDivElement>(null)
  const act1Ref         = useRef<HTMLDivElement>(null)
  const oldCalloutRef   = useRef<HTMLDivElement>(null)
  const newCalloutRef   = useRef<HTMLDivElement>(null)
  const leftPanelRef    = useRef<HTMLDivElement>(null)
  const counterRef      = useRef<HTMLSpanElement>(null)
  const brandMarkRef    = useRef<HTMLDivElement>(null)
  const lineBottleRefs  = useRef<(HTMLDivElement | null)[]>([])
  const counterPrefix   = t('a3StatPrefix')

  const lenis    = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => { lenisRef.current = lenis }, [lenis])

  useGSAP(
    () => {
      const videoFwd = isMobile ? videoFwdMobileRef.current : videoFwdDesktopRef.current
      const videoRev = isMobile ? videoRevMobileRef.current : videoRevDesktopRef.current
      const stageTrigger = stageRef.current
      const oldImg = oldImgRef.current
      if (!videoFwd || !videoRev || !stageTrigger || !oldImg) return

      const titleEl      = act1Ref.current?.querySelector<HTMLElement>('[data-a1-title]') ?? null
      const act1Items    = act1Ref.current ? gsap.utils.toArray<HTMLElement>('[data-a1]', act1Ref.current) : []
      const calloutLine  = oldCalloutRef.current?.querySelector<HTMLElement>('[data-line]') ?? null
      const calloutLabel = oldCalloutRef.current?.querySelector<HTMLElement>('[data-label]') ?? null
      const calloutDot = oldCalloutRef.current?.querySelector<HTMLElement>('[data-dot]') ?? null

      const titleSplit = titleEl
        ? new SplitText(titleEl, { type: 'chars,lines' })
        : null
      const titleChars = titleSplit?.chars ?? (titleEl ? [titleEl] : [])

      // ── Estado inicial: tudo invisível
      gsap.set(videoFwd,     { autoAlpha: 0, zIndex: 1 })
      gsap.set(videoRev,     { autoAlpha: 0, zIndex: 0 })
      gsap.set(newImgRef.current, { autoAlpha: 0 })
      gsap.set(brandMarkRef.current, { autoAlpha: 0, y: -18, filter: 'blur(8px)' })
      gsap.set(oldImg,       { scale: 1.04, autoAlpha: 0, yPercent: 100, filter: 'blur(8px)' })
      gsap.set(scrimRef.current, { autoAlpha: 0 })
      gsap.set(titleChars,   { x: 20, autoAlpha: 0, filter: 'blur(10px)' })
      gsap.set(act1Items,    { y: 20, autoAlpha: 0, filter: 'blur(10px)' })
      gsap.set(calloutLine,  { scaleX: 0 })
      gsap.set(calloutDot, { scale: 0, autoAlpha: 0 })
      gsap.set(calloutLabel, { autoAlpha: 0, x: 12 })

      const a3Eyebrow = leftPanelRef.current?.querySelector<HTMLElement>('[data-a3-tag]') ?? null
      const a3Title = leftPanelRef.current?.querySelector<HTMLElement>('[data-a3-title]') ?? null
      const a3Body = leftPanelRef.current?.querySelector<HTMLElement>('[data-a3-body]') ?? null
      const a3Line = leftPanelRef.current?.querySelector<HTMLElement>('[data-a3-line]') ?? null
      const a3Stat = leftPanelRef.current?.querySelector<HTMLElement>('[data-a3-stat]') ?? null
      const newCalloutLine = newCalloutRef.current?.querySelector<HTMLElement>('[data-line]') ?? null
      const newCalloutLabel = newCalloutRef.current?.querySelector<HTMLElement>('[data-label]') ?? null
      const newCalloutDot = newCalloutRef.current?.querySelector<HTMLElement>('[data-dot]') ?? null
      const lineBottles = lineBottleRefs.current.filter(Boolean) as HTMLDivElement[]

      gsap.set(leftPanelRef.current, { autoAlpha: 1 }) // O painel em si fica visível, os filhos animam
      gsap.set(a3Eyebrow, { autoAlpha: 0, y: -20, filter: 'blur(10px)' })
      gsap.set(a3Title, { autoAlpha: 0, y: 30 })
      gsap.set(a3Body, { autoAlpha: 0, filter: 'blur(10px)' })
      gsap.set(a3Line, { scaleX: 0 })
      gsap.set(a3Stat, { autoAlpha: 0, y: 20, filter: 'blur(10px)' })
      gsap.set(newCalloutLine, { scaleX: 0 })
      gsap.set(newCalloutDot, { scale: 0, autoAlpha: 0 })
      gsap.set(newCalloutLabel, { autoAlpha: 0, x: 12 })
      lineBottles.forEach((bottle, index) => {
        const item = LINE_BOTTLES[index]
        gsap.set(bottle, {
          xPercent: -50,
          x: 0,
          y: isMobile ? 0 : item.y ?? 0,
          scale: 0.48,
          autoAlpha: 0,
          filter: 'blur(10px)',
          zIndex: item.z,
          transformOrigin: 'bottom center',
        })
      })
      if (counterRef.current) counterRef.current.innerText = `${counterPrefix}10`

      // ── Helpers de animação
      let currentTl: gsap.core.Timeline | null = null
      let lineTl: gsap.core.Timeline | null = null

      const showLineBottles = (delay = 0) => {
        lineTl?.kill()
        const tl = lineTl = gsap.timeline({ delay })
        lineBottles.forEach((bottle, index) => {
          const item = LINE_BOTTLES[index]
          const x = isMobile ? item.mx : item.x
          const scale = isMobile ? item.mobileScale : item.scale
          tl.to(bottle, {
            x,
            scale,
            autoAlpha: 1,
            filter: 'blur(0px)',
            duration: 0.95,
            ease: 'power3.out',
          }, Math.min(Math.abs(x) / (isMobile ? 800 : 2600), 0.18))
        })
        return tl
      }

      const hideLineBottles = (delay = 0) => {
        lineTl?.kill()
        const tl = lineTl = gsap.timeline({ delay })
        lineBottles.forEach((bottle) => {
          tl.to(bottle, {
            x: 0,
            scale: 0.48,
            autoAlpha: 0,
            filter: 'blur(10px)',
            duration: 0.45,
            ease: 'power2.inOut',
          }, 0)
        })
        return tl
      }

      const lockScroll = (on: boolean) => {
        if (on) {
          lenisRef.current?.stop()
          // Alinha a seção exatamente ao topo da viewport: sem isto a trava
          // engata com o scroll alguns px além/aquém do 'top top' e sobra uma
          // faixa da seção vizinha visível durante toda a animação.
          const stage = stageRef.current
          if (stage) {
            const targetY = Math.round(window.scrollY + stage.getBoundingClientRect().top)
            if (Math.abs(window.scrollY - targetY) > 1) {
              const proxy = { y: window.scrollY }
              gsap.to(proxy, {
                y: targetY,
                duration: 0.35,
                ease: 'power2.out',
                overwrite: true,
                onUpdate: () => window.scrollTo(0, proxy.y),
              })
            }
          }
          const sw = window.innerWidth - document.documentElement.clientWidth
          if (sw > 0 && !isMobile) {
            document.body.style.paddingRight = `${sw}px`
          }
          if (!isMobile) {
            document.documentElement.style.overflow = 'hidden'
            document.body.style.overflow = 'hidden'
          }
        } else {
          document.body.style.paddingRight = ''
          if (!isMobile) {
            document.documentElement.style.overflow = ''
            document.body.style.overflow = ''
          }
          lenisRef.current?.start()
          requestAnimationFrame(() => ScrollTrigger.refresh())
        }
      }


      let stIntro: ScrollTrigger | null = null
      let stIntroExit: ScrollTrigger | null = null

      type Phase = 'act1' | 'act3' | 'line'
      let phase: Phase = 'act1'
      let direction: 'forward' | 'backward' | null = null
      let isLocked = false
      let animFrame: number | null = null
      let lineIsAnimating = false
      let pendingIntroExit = false
      const cooldownRef = { current: 0 }

      const introTl = gsap.timeline({ paused: true })
      introTl.to(scrimRef.current, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 0)
      introTl.to(oldImg,           { scale: 1, yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out' }, 0)
      introTl.to(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }, 0.1)
      introTl.to(titleChars,       { x: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.72, stagger: STAGGER.char, ease: 'power2.out' }, 0.16)
      introTl.to(act1Items,        { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.72, stagger: 0.12, ease: 'power2.out' }, 0.28)
      introTl.to(calloutLine,      { scaleX: 1, duration: 0.55, transformOrigin: 'left', ease: 'power2.out' }, 0.62)
      introTl.to(calloutDot,       { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(1.8)' }, 0.92)
      introTl.to(calloutLabel,     { x: 0, autoAlpha: 1, duration: 0.48, ease: 'power2.out' }, 0.98)

      const playIntro = (restart = false) => {
        if (phase !== 'act1' || direction) return
        introTl.timeScale(1)
        if (restart) introTl.restart()
        else if (introTl.progress() < 1) introTl.play()
      }

      const reverseIntro = () => {
        if (phase !== 'act1' || direction) {
          pendingIntroExit = true
          return
        }
        pendingIntroExit = false
        videoFwd.pause()
        videoRev.pause()
        gsap.set([videoFwd, videoRev], { autoAlpha: 0, zIndex: 0 })
        gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)' })
        introTl.progress(1).timeScale(1.9).reverse()
      }

      stIntro = ScrollTrigger.create({
        trigger: stageTrigger,
        start: 'top 82%',
        onEnter: () => playIntro(true),
        onEnterBack: () => playIntro(true),
      })

      stIntroExit = ScrollTrigger.create({
        trigger: stageTrigger,
        start: 'top 24%',
        onEnter: () => playIntro(false),
        onLeaveBack: () => reverseIntro(),
      })

      const showAct3UI = (delay = 0) => {
        currentTl?.kill()
        const tl = currentTl = gsap.timeline({ delay })

        tl.to(a3Eyebrow, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, 0)
        tl.to(a3Title, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0.1)
        tl.to(a3Body, { autoAlpha: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, 0.2)
        tl.to(a3Line, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 0.3)
        tl.to(a3Stat, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, 0.35)
        tl.to(newCalloutLine, { scaleX: 1, duration: 0.45, transformOrigin: 'left', ease: 'power2.out' }, 0.52)
        tl.to(newCalloutDot, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(1.8)' }, 0.72)
        tl.to(newCalloutLabel, { x: 0, autoAlpha: 1, duration: 0.42, ease: 'power2.out' }, 0.76)

        tl.to({ val: 10 }, {
          val: 14,
          duration: 1.0,
          ease: 'power2.out',
          onUpdate: function() {
            if (counterRef.current) {
              counterRef.current.innerText = `${counterPrefix}${Math.round(this.targets()[0].val)}`
            }
          }
        }, 0.45)
      }

      const hideAct3UI = (delay = 0) => {
        currentTl?.kill()
        const tl = currentTl = gsap.timeline({ delay })

        tl.to(newCalloutLabel, { x: 12, autoAlpha: 0, duration: 0.24, ease: 'power2.in' }, 0)
        tl.to(newCalloutDot, { scale: 0, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0.08)
        tl.to(newCalloutLine, { scaleX: 0, duration: 0.28, ease: 'power2.in' }, 0.1)
        tl.to(a3Stat, { y: 20, autoAlpha: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, 0.1)
        tl.to(a3Line, { scaleX: 0, duration: 0.3, ease: 'power2.in' }, 0.15)
        tl.to(a3Body, { autoAlpha: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, 0.2)
        tl.to(a3Title, { y: 30, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0.25)
        tl.to(a3Eyebrow, { y: -20, autoAlpha: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, 0.3)

        tl.set({}, {
          onComplete: () => {
            if (counterRef.current) counterRef.current.innerText = `${counterPrefix}10`
          }
        })
      }

      /* ── Máquina de direção: dois vídeos, playback SEMPRE nativo (play()) nos dois
       * sentidos — o "reverso" é um clipe gravado/codificado ao contrário, tocado pra
       * frente normalmente. `morph-aminosan.mp4` não tem keyframes densos o bastante
       * para um scrub manual de currentTime (como o HeroJornada faz) ficar fluido;
       * tentar isso aqui causa engasgo porque cada seek força decodificar do último
       * keyframe em diante. Por isso o rebobinar usa o clipe reverso, nunca seek manual.
       * O que É igual ao HeroJornada: o estado (fase/direção) responde instantaneamente
       * a cada gesto de scroll, sem esperar a transição anterior terminar. */
      const release = () => {
        isLocked = false
        lockScroll(false)
      }

      const syncVideos = (source: HTMLVideoElement, target: HTMLVideoElement) => {
        const sourceDur = (source.duration > 0 && isFinite(source.duration)) ? source.duration : 3
        const targetDur = (target.duration > 0 && isFinite(target.duration)) ? target.duration : 3
        const progress = source.currentTime / sourceDur
        try { target.currentTime = targetDur - (progress * targetDur) } catch(e) {}
      }

      const showStaticAct1 = (exitAfter = false) => {
        videoFwd.pause()
        videoRev.pause()
        gsap.killTweensOf([videoFwd, videoRev])
        gsap.set(videoFwd, { autoAlpha: 0, zIndex: 0 })
        gsap.set(videoRev, { autoAlpha: 0, zIndex: 0 })
        gsap.set(newImgRef.current, { autoAlpha: 0 })
        gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)' })
        gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
        hideLineBottles(0)
        try { videoFwd.currentTime = 0 } catch(e) {}
        try { videoRev.currentTime = 0 } catch(e) {}
        if (exitAfter) {
          requestAnimationFrame(() => reverseIntro())
        } else {
          introTl.timeScale(1).progress(1).pause()
        }
      }

      const stopPlayback = () => {
        if (animFrame) cancelAnimationFrame(animFrame)
        direction = null
        if (phase === 'act3') {
          gsap.set(videoFwd, { autoAlpha: 1 })
          gsap.set(videoRev, { autoAlpha: 0 })
          gsap.set(newImgRef.current, { autoAlpha: 1 })
            gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
          gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
          hideLineBottles(0)
          try { videoRev.currentTime = 0 } catch(e) {}
        } else {
          const stageTop = stageTrigger.getBoundingClientRect().top
          showStaticAct1(pendingIntroExit || stageTop > window.innerHeight * 0.24)
        }
        cooldownRef.current = performance.now() + 300
      }

      const openProductLine = () => {
        if (lineIsAnimating || phase !== 'act3' || direction) return
        lineIsAnimating = true
        gsap.to(newImgRef.current, { autoAlpha: 0, duration: 0.32, ease: 'power2.out', overwrite: true })
        gsap.to(brandMarkRef.current, { autoAlpha: 0, duration: 0.24, ease: 'power2.out', overwrite: true })
        gsap.to(videoFwd, { autoAlpha: 0, duration: 0.32, ease: 'power2.out', overwrite: true })
        const tl = showLineBottles(0)
        tl.eventCallback('onComplete', () => {
          phase = 'line'
          lineIsAnimating = false
          cooldownRef.current = performance.now() + 180
        })
      }

      const closeProductLine = () => {
        if (lineIsAnimating || phase !== 'line' || direction) return
        lineIsAnimating = true
        gsap.to(newImgRef.current, { autoAlpha: 1, duration: 0.32, ease: 'power2.out', overwrite: true })
        gsap.to(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.24, ease: 'power2.out', overwrite: true })
        gsap.to(videoFwd, { autoAlpha: 1, duration: 0.32, ease: 'power2.out', overwrite: true })
        const tl = hideLineBottles(0)
        tl.eventCallback('onComplete', () => {
          phase = 'act3'
          lineIsAnimating = false
          cooldownRef.current = performance.now() + 180
        })
      }

      const tick = () => {
        if (!direction) return
        if (direction === 'forward') {
          if (videoFwd.currentTime >= ((videoFwd.duration > 0 && isFinite(videoFwd.duration)) ? videoFwd.duration : 3) - 0.1) {
            videoFwd.pause()
            phase = 'act3'
            stopPlayback()
            return
          }
        } else {
          if (videoRev.currentTime >= ((videoRev.duration > 0 && isFinite(videoRev.duration)) ? videoRev.duration : 3) - 0.18) {
            phase = 'act1'
            stopPlayback()
            return
          }
        }
        animFrame = requestAnimationFrame(tick)
      }

      // O clipe não tem keyframes densos (ver comentário do syncVideos mais abaixo):
      // um seek de currentTime força o browser a decodificar do último keyframe em
      // diante, o que não é instantâneo. Revelar o vídeo (crossfade + play) e chamar
      // tick() ANTES desse seek terminar mostra, por um instante, o frame de ANTES
      // do seek — visto como um "piscar" no frame final ou inicial errado. Esperar o
      // 'seeked' antes de revelar é o mesmo princípio do HeroJornada: só avança/mostra
      // o vídeo quando ele já está no ponto certo, nunca no meio de uma decodificação.
      const revealWhenReady = (video: HTMLVideoElement, needsSeek: boolean, reveal: () => void) => {
        if (!needsSeek) { reveal(); return }
        let done = false
        const finish = () => {
          if (done) return
          done = true
          video.removeEventListener('seeked', finish)
          reveal()
        }
        video.addEventListener('seeked', finish)
        setTimeout(finish, 200) // salvaguarda: nunca trava esperando um 'seeked' que não chega
      }

      const startPlayback = (dir: 'forward' | 'backward') => {
        if (animFrame) cancelAnimationFrame(animFrame)
        if (dir === 'forward') {
          introTl.progress(1)
          gsap.set(oldImg, { autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)' })
        } else {
          gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
        }
        const oldDir = direction
        direction = dir

        const fwdDur = (videoFwd.duration > 0 && isFinite(videoFwd.duration)) ? videoFwd.duration : 3
        const beginTick = () => { animFrame = requestAnimationFrame(tick) }

        if (dir === 'forward') {
          // Só sincroniza a partir do reverso se estávamos ATIVAMENTE tocando ele
          // (reversão no meio do caminho). Num início "frio" a partir do repouso em
          // act1, videoFwd já está em 0 (stopPlayback garante isso) — sincronizar
          // aqui de novo lia o currentTime=0 "intocado" do reverso (do priming) como
          // se fosse "progresso zero do reverso = já no fim do forward" e pulava
          // videoFwd direto pro final, fazendo a transição inteira sumir.
          const needsSync = oldDir === 'backward'
          if (needsSync) {
            syncVideos(videoRev, videoFwd)
            videoRev.pause()
          }

          revealWhenReady(videoFwd, needsSync, () => {
            // Se uma reversão mais nova assumiu enquanto esperávamos o seek, esta
            // chamada é obsoleta — aplicar o reveal aqui pisaria no estado atual.
            if (direction !== 'forward') return
                gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)' })
            gsap.set(videoFwd, { zIndex: 9, autoAlpha: 1 })
            gsap.set(videoRev, { zIndex: 0, autoAlpha: 0 })
            gsap.set(newImgRef.current, { autoAlpha: 0 })

            const handoffTl = gsap.timeline({
              onComplete: () => {
                if (direction !== 'forward') return
                videoFwd.play().catch(() => {})
                beginTick()
              },
            })
            handoffTl.to(oldImg, { autoAlpha: 0, scale: 0.992, filter: 'blur(4px)', duration: 0.24, ease: 'power1.inOut', overwrite: 'auto' }, 0)

            gsap.to(brandMarkRef.current, { y: -18, autoAlpha: 0, filter: 'blur(8px)', duration: fwdDur * 0.22, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: fwdDur * 0.22, delay: fwdDur * 0.42, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(titleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)', duration: fwdDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(act1Items, { y: 20, autoAlpha: 0, filter: 'blur(10px)', duration: fwdDur * 0.4, stagger: 0.05, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutLabel, { x: 12, autoAlpha: 0, duration: fwdDur * 0.24, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutDot, { scale: 0, autoAlpha: 0, duration: fwdDur * 0.22, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutLine, { scaleX: 0, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(scrimRef.current, { autoAlpha: 0, duration: fwdDur * 0.8, ease: 'power1.inOut', overwrite: 'auto' })

            showAct3UI(fwdDur * 0.4)
          })

        } else {
          // Mesmo raciocínio do ramo forward: só sincroniza se estávamos tocando
          // o forward de verdade. Do repouso em act3, videoRev já foi zerado pelo
          // stopPlayback — reler o forward "intocado" aqui era redundante e, no
          // pior caso, arriscava o mesmo pulo instantâneo na direção contrária.
          const needsSync = oldDir === 'forward'
          if (needsSync) {
            syncVideos(videoFwd, videoRev)
            videoFwd.pause()
          }

          revealWhenReady(videoRev, needsSync, () => {
            if (direction !== 'backward') return
                gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
            gsap.set(videoRev, { zIndex: 1, autoAlpha: 1 })
            gsap.set(videoFwd, { zIndex: 0, autoAlpha: 0 })
            gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
            gsap.set(newImgRef.current, { autoAlpha: 0 })
            hideLineBottles(0)

            videoRev.play().catch(() => {})

            hideAct3UI(0)

            gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
            gsap.set(brandMarkRef.current, { y: -18, autoAlpha: 0, filter: 'blur(8px)' })
            gsap.set(titleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)' })
            gsap.set(act1Items, { y: 20, autoAlpha: 0, filter: 'blur(10px)' })
            gsap.set(calloutLine, { scaleX: 0 })
            gsap.set(calloutDot, { scale: 0, autoAlpha: 0 })
            gsap.set(calloutLabel, { x: 12, autoAlpha: 0 })
            gsap.set(scrimRef.current, { autoAlpha: 0 })

            beginTick()
          })
        }
      }

      // Um único ScrollTrigger no mesmo ponto ('top top') cobre os dois sentidos —
      // igual ao autoRewind do HeroJornada, mas usando o cruzamento de posição do
      // ScrollTrigger (já comprovado confiável na entrada) em vez de recalcular a
      // posição "à mão" num listener de scroll separado (a tentativa anterior usava
      // um segundo ponto de gatilho próprio e exigia sair inteiramente da tela antes
      // de rearmar, o que na prática quase nunca disparava de volta).
      // onEnter: entrando pela primeira vez (rest em act1) → só trava, o próprio
      // gesto de scroll seguinte é que inicia o forward (via handleForward).
      // onEnterBack: voltando de baixo depois de já ter chegado em act3 → trava E
      // já dispara o rebobinar sozinho, sem esperar mais um gesto.
      let stTop = ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top top',
        onEnter: () => {
          playIntro(false)
          const rect = stageRef.current?.getBoundingClientRect()
          if (rect && Math.abs(rect.top) > 150) {
            if (isLocked) release()
            return
          }
          if (phase === 'act1' && !isLocked && !direction) {
            isLocked = true
            lockScroll(true)
          }
        },
        onLeave: () => {
          if (isLocked) release()
        },
        onEnterBack: () => {
          if (phase === 'act1') playIntro(false)
          const rect = stageRef.current?.getBoundingClientRect()
          if (rect && Math.abs(rect.top) > 150) {
            if (isLocked) release()
            return
          }
          if (phase === 'act3' && !isLocked && !direction) {
            isLocked = true
            lockScroll(true)
            startPlayback('backward')
          } else if (phase === 'line' && !isLocked && !direction) {
            isLocked = true
            lockScroll(true)
          }
        },
        onLeaveBack: () => {
          const rect = stageRef.current?.getBoundingClientRect()
          if (rect && Math.abs(rect.top) > 150) {
            if (isLocked) release()
            return
          }
          if (phase === 'line' && !isLocked && !direction) {
            isLocked = true
            lockScroll(true)
            closeProductLine()
          } else if (phase === 'act3' && !isLocked && direction !== 'backward') {
            isLocked = true
            lockScroll(true)
            startPlayback('backward')
          } else if (isLocked) {
            release()
          }
        },
      })

      const handleForward = () => {
        if (!isLocked) return
        if (direction === 'backward') {
          startPlayback('forward')
        } else if (phase === 'act1' && !direction && performance.now() > cooldownRef.current) {
          startPlayback('forward')
        }
      }

      const handleBackward = () => {
        if (!isLocked) return
        if (direction === 'forward') {
          startPlayback('backward')
        } else if (phase === 'act3' && !direction && performance.now() > cooldownRef.current) {
          startPlayback('backward')
        }
      }

      const lockIfStageIsActive = () => {
        if (isLocked || direction) return false
        const stage = stageRef.current
        if (!stage) return false
        const rect = stage.getBoundingClientRect()
        const active = rect.top <= 48 && rect.bottom >= window.innerHeight * 0.5
        if (!active) return false
        playIntro(false)
        isLocked = true
        lockScroll(true)
        return true
      }

      const onWheel = (e: WheelEvent) => {
        if (!isLocked && !lockIfStageIsActive()) return
        if (lineIsAnimating) {
          e.preventDefault()
          return
        }
        if (e.deltaY > 0) {
          if (phase === 'act3' && !direction && performance.now() > cooldownRef.current) {
            e.preventDefault()
            openProductLine()
            return
          }
          if (phase === 'line' && !direction && !lineIsAnimating) { release(); return; }
        } else if (e.deltaY < 0) {
          if (phase === 'line' && !direction && performance.now() > cooldownRef.current) {
            e.preventDefault()
            closeProductLine()
            return
          }
          if (phase === 'act1' && !direction) { release(); return; }
        }
        e.preventDefault()
        if (e.deltaY > 0) handleForward()
        else if (e.deltaY < 0) handleBackward()
      }

      const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar']
      const upKeys   = ['ArrowUp', 'PageUp']
      const onKey = (e: KeyboardEvent) => {
        if (!isLocked) return
        const down = downKeys.includes(e.key)
        const up   = upKeys.includes(e.key)
        if (!down && !up) return
        if (lineIsAnimating) {
          e.preventDefault()
          return
        }
        if (down && phase === 'act3' && !direction && performance.now() > cooldownRef.current) {
          e.preventDefault()
          openProductLine()
          return
        }
        if (down && phase === 'line' && !direction && !lineIsAnimating) { release(); return; }
        if (up && phase === 'line' && !direction && performance.now() > cooldownRef.current) {
          e.preventDefault()
          closeProductLine()
          return
        }
        if (up && phase === 'act1' && !direction) { release(); return; }
        e.preventDefault()
        if (down) handleForward()
        else if (up) handleBackward()
      }

      let touchY = 0
      const onTouchStart = (e: TouchEvent) => {
        if (!isLocked) return
        touchY = e.touches[0].clientY
      }
      const onTouchMove = (e: TouchEvent) => {
        if (!isLocked) return
        if ((e.target as HTMLElement).closest('.allow-scroll')) return
        e.preventDefault()
      }
      const onTouchEnd = (e: TouchEvent) => {
        if (!isLocked) return
        if ((e.target as HTMLElement).closest('.allow-scroll')) return
        if (lineIsAnimating) return
        const endY = e.changedTouches[0] ? e.changedTouches[0].clientY : touchY
        const dy   = touchY - endY
        if (dy > 30) {
          if (phase === 'act3' && !direction && performance.now() > cooldownRef.current) { openProductLine(); return; }
          if (phase === 'line' && !direction && !lineIsAnimating) { release(); return; }
          handleForward()
        } else if (dy < -30) {
          if (phase === 'line' && !direction && performance.now() > cooldownRef.current) { closeProductLine(); return; }
          if (phase === 'act1' && !direction) { release(); return; }
          handleBackward()
        }
      }

      window.addEventListener('wheel',      onWheel,     { passive: false })
      window.addEventListener('keydown',    onKey)
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove',  onTouchMove,  { passive: false })
      window.addEventListener('touchend',   onTouchEnd,   { passive: true })

      // Decodifica o primeiro frame de cada vídeo sem exibi-lo (evita flash ao iniciar o play real).
      // Guarda de `direction`: se o usuário já rolar antes dessa promise resolver, o
      // play/pause real já está em andamento — resolver tarde aqui pausaria e
      // resetaria pra 0 um vídeo que já está tocando de verdade, piscando o frame
      // inicial no meio da transição.
      videoFwd.play().then(() => { if (!direction) { videoFwd.pause(); videoFwd.currentTime = 0 } }).catch(() => {})
      videoRev.play().then(() => { if (!direction) { videoRev.pause(); videoRev.currentTime = 0 } }).catch(() => {})

      return () => {
        stIntro?.kill()
        stIntroExit?.kill()
        introTl.kill()
        stTop.kill()
        titleSplit?.revert()
        lineTl?.kill()
        lenisRef.current?.start()

        // Limpeza dos event listeners globais
        window.removeEventListener('wheel',      onWheel)
        window.removeEventListener('keydown',    onKey)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove',  onTouchMove)
        window.removeEventListener('touchend',   onTouchEnd)
      }
    },
    { dependencies: [isMobile], scope: root },
  )

  return (
    <div ref={root} className="relative w-full bg-white">
      <section ref={stageRef} className="relative z-10 h-auto lg:h-[100svh] min-h-[100svh] lg:min-h-0 w-full overflow-visible lg:overflow-hidden bg-white">
        {/* Vídeos desktop: forward + reverso (clipe gravado ao contrário) */}
        <video
          ref={isMobile ? null : videoFwdDesktopRef}
          muted playsInline preload="auto"
          poster="/heritage/desktop/morph-aminosan-1-antigo.png"
          aria-label={t('videoAlt')}
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-0 hidden lg:block"
        >
          <source src="/heritage/desktop/morph-aminosan.mp4" type="video/mp4" />
        </video>
        <video
          ref={isMobile ? null : videoRevDesktopRef}
          muted playsInline preload="auto"
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-0 hidden lg:block"
        >
          <source src="/heritage/desktop/morph-aminosan-reverse.mp4" type="video/mp4" />
        </video>

        {/* Vídeos mobile: forward + reverso */}
        <video
          ref={isMobile ? videoFwdMobileRef : null}
          muted playsInline preload="auto"
          poster="/heritage/mobile/morph-aminosan-1-antigo.png"
          aria-label={t('videoAlt')}
          className="absolute z-0 opacity-0 block lg:hidden inset-x-0 !top-[20svh] !h-[80svh] w-full object-contain"
        >
          <source src="/heritage/mobile/morph-aminosan.mp4" type="video/mp4" />
        </video>
        <video
          ref={isMobile ? videoRevMobileRef : null}
          muted playsInline preload="auto"
          aria-hidden="true"
          className="absolute z-0 opacity-0 block lg:hidden inset-x-0 !top-[20svh] !h-[80svh] w-full object-contain"
        >
          <source src="/heritage/mobile/morph-aminosan-reverse.mp4" type="video/mp4" />
        </video>

        {/* z-10 — foto estática do frasco antigo */}
        <Image
          ref={oldImgRef}
          src={isMobile ? "/heritage/mobile/morph-aminosan-1-antigo.png" : "/heritage/desktop/morph-aminosan-1-antigo.png"}
          alt={t('oldBottleAlt')}
          fill sizes="100vw"
          className="absolute z-10 object-cover md:!object-cover lg:!inset-0 max-lg:!top-[20svh] max-lg:!h-[80svh] max-lg:!object-contain"
          priority
        />

        <div className="aminosan-line-bottles" aria-hidden>
          {LINE_BOTTLES.map((item, index) => (
            <div
              key={`${item.alt}-${item.src}`}
              ref={(el) => { lineBottleRefs.current[index] = el }}
              className="aminosan-line-bottles__item"
              style={{
                width: `clamp(${item.mobileWidth}px, ${item.width / 14.4}vw, ${item.width}px)`,
              }}
            >
              <Image
                src={item.src}
                alt=""
                width={1000}
                height={1000}
                sizes="(max-width: 1023px) 18vw, 14vw"
                className="aminosan-line-bottles__image"
              />
            </div>
          ))}
        </div>

        {/* z-10 — foto estática do frasco novo */}
        <Image
          ref={newImgRef}
          src={isMobile ? "/heritage/mobile/morph-aminosan-2-novo.png" : "/heritage/desktop/morph-aminosan-2-novo.png"}
          alt={t('newBottleAlt')}
          fill sizes="100vw"
          className="absolute z-10 pointer-events-none opacity-0 object-cover md:!object-cover lg:!inset-0 max-lg:!top-[20svh] max-lg:!h-[80svh] max-lg:!object-contain"
          priority
        />

        <AminosanBrandMark refEl={brandMarkRef} />

        {/* z-20 — scrim lateral para legibilidade do Ato 1 */}
        <div ref={scrimRef} aria-hidden
          className="absolute inset-x-0 top-0 md:inset-y-0 md:left-0 z-20 w-full h-[60%] md:h-full md:max-w-[40rem] bg-gradient-to-b md:bg-gradient-to-r from-white/90 via-white/40 to-transparent"
        />

        {/* z-30 — texto do Ato 1 */}
        <Container className="absolute inset-0 z-30 flex h-full items-start pt-[10vh] md:pt-0 md:items-center min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
          <div ref={act1Ref} className="flex max-w-[88vw] md:max-w-[24rem] xl:max-w-[28rem] flex-col items-start bg-transparent p-0">
            <span data-a1 className="text-eyebrow mb-sm md:mb-md text-[10px] xl:text-xs uppercase tracking-[0.18em] text-primary">
              {t('eyebrow')}
            </span>
            <div>
              <BicolorTitle data-a1-title title={t('title')} titleHi={t('titleHi')} className="text-[clamp(1.75rem,7vw,3.75rem)] md:text-[clamp(1.75rem,3.2vw,3.75rem)]" />
            </div>
            <div data-a1 className="mt-sm md:mt-md xl:mt-lg max-w-[22rem] md:max-w-none">
              <p className="text-subtitle text-sm xl:text-base text-foreground/80">{t('body1')}</p>
              <p className="text-subtitle mt-1 md:mt-sm text-sm xl:text-base text-foreground/80">{t('body2')}</p>
            </div>
            <span data-a1 className="text-eyebrow mt-xl md:mt-xl xl:mt-2xl text-sm xl:text-[11px] uppercase tracking-[0.16em] text-foreground/45">
              {t('footerTag')}
            </span>
          </div>
        </Container>

        <BottleCallout refEl={oldCalloutRef} eyebrow={t('eyebrow')}>
          {t('oldBottleCaption')}
        </BottleCallout>

        {/* UI do Ato 3 — mesmo desenho do Ato 1: coluna de texto à esquerda, frasco em cena.
            No mobile o bloco de prova (número + handoff + CTA) desce para o rodapé da tela,
            deixando o frasco visível no meio. */}
        <Container className="allow-scroll touch-pan-y relative lg:absolute lg:inset-0 z-30 flex min-h-[100svh] lg:min-h-0 h-auto lg:h-full items-stretch md:items-center min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem] pointer-events-none pt-[8vh] md:pt-0 pb-[8vh] md:pb-0">
          <div ref={leftPanelRef} className="pointer-events-auto flex w-full flex-1 md:flex-none md:w-auto max-w-full md:max-w-[24rem] xl:max-w-[28rem] flex-col items-start">
            <span data-a3-tag className="text-eyebrow mb-sm md:mb-md text-[10px] xl:text-xs uppercase tracking-[0.18em] text-primary">
              {t('a3Eyebrow')}
            </span>
            <BicolorTitle data-a3-title title={t('a3Title')} titleHi={t('a3TitleHi')} className="text-[clamp(1.75rem,7vw,3.75rem)] md:text-[clamp(1.75rem,3.2vw,3.75rem)]" />
            <p data-a3-body className="text-subtitle mt-sm md:mt-md max-w-[22rem] md:max-w-none text-sm xl:text-base text-foreground/80">
              {t('a3Body')}
            </p>
            <div className="mt-auto md:mt-0 flex flex-col items-start">
              <div data-a3-line className="my-md md:my-lg h-px w-10 md:w-12 bg-primary/40" style={{ transformOrigin: 'left' }} />
              <div data-a3-stat className="flex flex-col gap-1">
                <span className="text-highlight text-2xl md:text-3xl xl:text-4xl text-primary"><span ref={counterRef}>{t('a3StatPrefix')}10</span> {t('a3StatUnit')}</span>
                <span className="text-subtitle text-sm text-foreground/80">{t('a3StatLabel')}</span>
                <span className="text-[11px] text-foreground/50">{t('a3StatSource')}</span>
              </div>
            </div>
          </div>
        </Container>

        <BottleCallout refEl={newCalloutRef} eyebrow={t('a3Eyebrow')}>
          {t('newBottleCaption')}
        </BottleCallout>
      </section>
    </div>
  )
}

/* ── Subcomponentes ─────────────────────────────────────────────────── */

function BicolorTitle({
  title, titleHi, className = '', ...rest
}: Omit<HTMLAttributes<HTMLHeadingElement>, 'title'> & { title: string; titleHi?: string }) {
  const lead = titleHi && title.endsWith(titleHi) ? title.slice(0, -titleHi.length).trim() : title
  return (
    <h2 {...rest} className={`font-black uppercase leading-[0.98] tracking-tight ${className}`}>
      <span className="text-foreground">{lead}</span>
      {titleHi && <> <span className="text-highlight text-primary">{titleHi}</span></>}
    </h2>
  )
}

function Callout({ className = '', labelClassName = 'max-w-[12rem] xl:max-w-[14rem]', refEl, children }: {
  className?: string; labelClassName?: string; refEl?: RefObject<HTMLDivElement | null>; children: ReactNode
}) {
  return (
    <div ref={refEl} className={`absolute flex flex-col ${className}`}>
      <span data-label className={`text-subtitle rounded-2xl bg-white/70 px-4 py-3 text-xs xl:text-sm text-foreground/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left block ${labelClassName}`}>
        {children}
      </span>
    </div>
  )
}

function AminosanBrandMark({ refEl }: { refEl: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={refEl}
      aria-label="Aminosan registrado"
      className="pointer-events-none absolute left-1/2 top-[9svh] z-30 -translate-x-1/2 text-center max-md:top-[7svh]"
    >
      <span className="font-black uppercase leading-none tracking-[0.02em] text-foreground text-[clamp(1.65rem,2.35vw,3rem)]">
        AMINOSAN<sup className="ml-1 align-super text-[0.36em] leading-none">&reg;</sup>
      </span>
    </div>
  )
}


function BottleCallout({
  refEl,
  eyebrow,
  children,
}: {
  refEl: RefObject<HTMLDivElement | null>
  eyebrow: string
  children: ReactNode
}) {
  return (
    <div
      ref={refEl}
      className="aminosan-bottle-callout pointer-events-none absolute right-[4%] bottom-[18vh] md:right-auto md:left-[63.5%] md:bottom-auto md:top-[56%] md:-translate-y-1/2 xl:left-[64%] z-30 flex items-center gap-3"
    >
      <span data-line aria-hidden className="aminosan-bottle-callout__line" style={{ transformOrigin: 'left' }} />
      <span data-dot aria-hidden className="aminosan-bottle-callout__dot" />
      <span data-label className="aminosan-bottle-callout__card">
        <span className="aminosan-bottle-callout__meta">{eyebrow}</span>
        <span className="aminosan-bottle-callout__text">{children}</span>
      </span>
    </div>
  )
}
