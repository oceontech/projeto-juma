'use client'

/**
 * "A transformação do Aminosan"
 *
 * Desktop: seção com scroll capturado. Cadeia de 3 clipes ligados ao scroll,
 * cada um com um reverso gravado (play sempre nativo, nunca seek manual):
 *   act1 ──morph──▶ act3 ──line──▶ line ──cat──▶ exit (handoff para o catálogo)
 * Em cada fase de repouso um still idêntico ao frame de borda cobre o vídeo.
 * O fim do clipe "cat" libera o scroll, rola até o catálogo e dispara o evento
 * 'aminosan:handoff-forward' (HomeProductShowcase faz a entrada branco→cor).
 *
 * Mobile compartilha os mesmos clipes 1920×1080 (object-contain).
 * Reduced-motion: SimpleVersion — dois blocos full-bleed, sem lock.
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

/* Vídeos e stills compartilhados por desktop e mobile */
const STAGE_VIDEO_CLASS =
  'absolute inset-0 z-0 h-full w-full object-cover opacity-0 max-lg:top-[22svh] max-lg:h-[60svh] max-lg:object-contain'
const STAGE_IMAGE_CLASS =
  'absolute z-10 pointer-events-none object-cover md:!object-cover lg:!inset-0 max-lg:!top-[22svh] max-lg:!h-[60svh] max-lg:!object-contain'

export function AminosanStory() {
  const t = useTranslations('aminosanStory')
  const reduced = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const timeouts: number[] = []
    const rafs: number[] = []

    const refresh = () => ScrollTrigger.refresh()
    const scheduleRefresh = () => {
      rafs.push(window.requestAnimationFrame(() => {
        refresh()
        rafs.push(window.requestAnimationFrame(refresh))
      }))
    }

    scheduleRefresh()
    timeouts.push(window.setTimeout(scheduleRefresh, 250))
    timeouts.push(window.setTimeout(scheduleRefresh, 900))
    document.fonts?.ready.then(scheduleRefresh).catch(() => {})

    const media = Array.from(document.querySelectorAll<HTMLImageElement | HTMLVideoElement>('#sec-origem img, #sec-origem video'))
    media.forEach((el) => {
      el.addEventListener('load', scheduleRefresh)
      el.addEventListener('loadedmetadata', scheduleRefresh)
      el.addEventListener('loadeddata', scheduleRefresh)
    })

    window.addEventListener('load', scheduleRefresh)
    window.addEventListener('pageshow', scheduleRefresh)
    window.addEventListener('resize', scheduleRefresh)

    return () => {
      window.removeEventListener('load', scheduleRefresh)
      window.removeEventListener('pageshow', scheduleRefresh)
      window.removeEventListener('resize', scheduleRefresh)
      media.forEach((el) => {
        el.removeEventListener('load', scheduleRefresh)
        el.removeEventListener('loadedmetadata', scheduleRefresh)
        el.removeEventListener('loadeddata', scheduleRefresh)
      })
      timeouts.forEach(window.clearTimeout)
      rafs.forEach(window.cancelAnimationFrame)
    }
  }, [])
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
            src="/heritage/desktop/morph-aminosan-1-antigo.png"
            alt={t('oldBottleAlt')}
            fill sizes="100vw"
            className="object-cover object-bottom z-10"
            priority
          />
          <video
            ref={videoRef}
            muted playsInline preload="metadata"
            poster="/heritage/desktop/morph-aminosan-1-antigo.png"
            aria-label={t('videoAlt')}
            className="absolute inset-0 h-full w-full object-cover object-bottom opacity-0 z-0"
          >
            <source src="/heritage/desktop/morph-aminosan.mp4" type="video/mp4" />
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
            src="/heritage/desktop/morph-aminosan-2-novo.png"
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
 * Máquina de 4 fases de repouso: 'act1' → 'act3' → 'line' → 'exit'.
 * Cada transição é um par de clipes (forward + reverso gravado) tocado com
 * play() nativo — os clipes não têm keyframes densos o bastante para scrub
 * manual de currentTime ficar fluido (ver comentário do syncVideos).
 * Durante cada transição o scroll é travado; depois é liberado.
 */

function CinematicVersion({ t, isMobile }: { t: TFn; isMobile: boolean }) {
  const root            = useRef<HTMLDivElement>(null)
  const stageRef        = useRef<HTMLElement>(null)
  const morphFwdRef     = useRef<HTMLVideoElement>(null)
  const morphRevRef     = useRef<HTMLVideoElement>(null)
  const lineFwdRef      = useRef<HTMLVideoElement>(null)
  const lineRevRef      = useRef<HTMLVideoElement>(null)
  const catFwdRef       = useRef<HTMLVideoElement>(null)
  const catRevRef       = useRef<HTMLVideoElement>(null)
  const oldImgRef       = useRef<HTMLImageElement>(null)
  const newImgRef       = useRef<HTMLImageElement>(null)
  const lineImgRef      = useRef<HTMLImageElement>(null)
  const trioImgRef      = useRef<HTMLImageElement>(null)
  const scrimRef        = useRef<HTMLDivElement>(null)
  const act1Ref         = useRef<HTMLDivElement>(null)
  const oldCalloutRef   = useRef<HTMLDivElement>(null)
  const newCalloutRef   = useRef<HTMLDivElement>(null)
  const leftPanelRef    = useRef<HTMLDivElement>(null)
  const linePanelRef    = useRef<HTMLDivElement>(null)
  const lineBodyRef     = useRef<HTMLParagraphElement>(null)
  const counterRef      = useRef<HTMLSpanElement>(null)
  const brandMarkRef    = useRef<HTMLDivElement>(null)
  const counterPrefix   = t('a3StatPrefix')

  const lenis    = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => { lenisRef.current = lenis }, [lenis])

  useGSAP(
    () => {
      const morphFwd = morphFwdRef.current
      const morphRev = morphRevRef.current
      const lineFwd  = lineFwdRef.current
      const lineRev  = lineRevRef.current
      const catFwd   = catFwdRef.current
      const catRev   = catRevRef.current
      const stageTrigger = stageRef.current
      const oldImg = oldImgRef.current
      if (!morphFwd || !morphRev || !lineFwd || !lineRev || !catFwd || !catRev || !stageTrigger || !oldImg) return

      const allVideos = [morphFwd, morphRev, lineFwd, lineRev, catFwd, catRev]
      const newImg  = newImgRef.current
      const lineImg = lineImgRef.current
      const trioImg = trioImgRef.current

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
      gsap.set(allVideos,    { autoAlpha: 0, zIndex: 0 })
      gsap.set(morphFwd,     { zIndex: 1 })
      gsap.set([newImg, lineImg, trioImg], { autoAlpha: 0 })
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
      const lineTitleEl = linePanelRef.current?.querySelector<HTMLElement>('[data-line-title]') ?? null
      const lineTitleSplit = lineTitleEl ? new SplitText(lineTitleEl, { type: 'chars,lines' }) : null
      const lineTitleChars = lineTitleSplit?.chars ?? (lineTitleEl ? [lineTitleEl] : [])
      const lineItems = stageTrigger ? gsap.utils.toArray<HTMLElement>('[data-line-copy]', stageTrigger) : []

      gsap.set(leftPanelRef.current, { autoAlpha: 1 }) // O painel em si fica visível, os filhos animam
      gsap.set(a3Eyebrow, { autoAlpha: 0, y: -20, filter: 'blur(10px)' })
      gsap.set(a3Title, { autoAlpha: 0, y: 30 })
      gsap.set(a3Body, { autoAlpha: 0, filter: 'blur(10px)' })
      gsap.set(a3Line, { scaleX: 0 })
      gsap.set(a3Stat, { autoAlpha: 0, y: 20, filter: 'blur(10px)' })
      gsap.set(newCalloutLine, { scaleX: 0 })
      gsap.set(newCalloutDot, { scale: 0, autoAlpha: 0 })
      gsap.set(newCalloutLabel, { autoAlpha: 0, x: 12 })
      gsap.set([linePanelRef.current, lineBodyRef.current], { autoAlpha: 0, y: 24, filter: 'blur(10px)' })
      gsap.set(lineTitleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)' })
      gsap.set(lineItems, { autoAlpha: 0, y: 18, filter: 'blur(10px)' })
      if (counterRef.current) counterRef.current.innerText = `${counterPrefix}10`

      // ── Helpers de animação
      let currentTl: gsap.core.Timeline | null = null
      let lineTl: gsap.core.Timeline | null = null
      let lockedScrollY = 0

      const lockScroll = (on: boolean) => {
        if (on) {
          lenisRef.current?.stop()
          const stage = stageRef.current
          const targetY = stage ? Math.round(window.scrollY + stage.getBoundingClientRect().top) : window.scrollY

          if (isMobile) {
            // overflow:hidden sozinho não seguraria a trava aqui: um fling já
            // lançado (dedo já solto da tela) continua por inércia do próprio
            // compositor, sem nunca disparar 'touchmove' — não sobra nada pro
            // preventDefault interceptar, e o scroll nativo atravessa a seção
            // inteira antes do estado 'isLocked' ter qualquer efeito. A trava
            // real no mobile é a mesma técnica clássica de scroll-lock: tirar
            // o body do fluxo de scroll com position:fixed, o que cancela a
            // inércia na hora (o deslocamento em 'top' preserva a posição
            // visual e já alinha a seção ao topo da viewport, sem tween).
            lockedScrollY = targetY
            document.body.style.position = 'fixed'
            document.body.style.top = `-${targetY}px`
            document.body.style.left = '0'
            document.body.style.right = '0'
            document.body.style.width = '100%'
          } else {
            // Alinha a seção exatamente ao topo da viewport: sem isto a trava
            // engata com o scroll alguns px além/aquém do 'top top' e sobra uma
            // faixa da seção vizinha visível durante toda a animação.
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
            const isTouch = typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0)
            const sw = window.innerWidth - document.documentElement.clientWidth
            if (sw > 0 && !isTouch) {
              document.body.style.paddingRight = `${sw}px`
            }
            document.documentElement.style.overflowY = 'hidden'
            document.body.style.overflowY = 'hidden'
          }
        } else {
          if (isMobile) {
            document.body.style.position = ''
            document.body.style.top = ''
            document.body.style.left = ''
            document.body.style.right = ''
            document.body.style.width = ''
            window.scrollTo(0, lockedScrollY)
          } else {
            document.body.style.paddingRight = ''
            document.documentElement.style.overflowY = ''
            document.body.style.overflowY = ''
          }
          lenisRef.current?.start()
          requestAnimationFrame(() => ScrollTrigger.refresh())
        }
      }


      let stIntro: ScrollTrigger | null = null
      let stIntroExit: ScrollTrigger | null = null

      /* Fases de repouso e segmentos de vídeo entre elas:
       * act1 ──morph──▶ act3 ──line──▶ line ──cat──▶ exit */
      type Phase = 'act1' | 'act3' | 'line' | 'exit'
      type SegName = 'morph' | 'line' | 'cat'
      type Dir = 'forward' | 'backward'

      const SEGMENTS: Record<SegName, { fwd: HTMLVideoElement; rev: HTMLVideoElement; back: Phase; fore: Phase }> = {
        morph: { fwd: morphFwd, rev: morphRev, back: 'act1', fore: 'act3' },
        line:  { fwd: lineFwd,  rev: lineRev,  back: 'act3', fore: 'line' },
        cat:   { fwd: catFwd,   rev: catRev,   back: 'line', fore: 'exit' },
      }

      let phase: Phase = 'act1'
      let activeSeg: SegName | null = null
      let direction: Dir | null = null
      let isLocked = false
      let animFrame: number | null = null
      const cooldownRef = { current: 0 }

      const safeDur = (v: HTMLVideoElement) => (v.duration > 0 && isFinite(v.duration)) ? v.duration : 3

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
        if (phase !== 'act1' || direction) return
        allVideos.forEach((v) => v.pause())
        gsap.set(allVideos, { autoAlpha: 0, zIndex: 0 })
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

        tl.to(newCalloutLabel, { x: 12, autoAlpha: 0, duration: 0.14, ease: 'power2.in' }, 0)
        tl.to(newCalloutDot, { scale: 0, autoAlpha: 0, duration: 0.12, ease: 'power2.in' }, 0.03)
        tl.to(newCalloutLine, { scaleX: 0, duration: 0.14, ease: 'power2.in' }, 0.04)
        tl.to(a3Stat, { y: 20, autoAlpha: 0, filter: 'blur(10px)', duration: 0.16, ease: 'power2.in' }, 0.04)
        tl.to(a3Line, { scaleX: 0, duration: 0.14, ease: 'power2.in' }, 0.07)
        tl.to(a3Body, { autoAlpha: 0, filter: 'blur(10px)', duration: 0.16, ease: 'power2.in' }, 0.08)
        tl.to(a3Title, { y: 30, autoAlpha: 0, duration: 0.16, ease: 'power2.in' }, 0.1)
        tl.to(a3Eyebrow, { y: -20, autoAlpha: 0, filter: 'blur(10px)', duration: 0.16, ease: 'power2.in' }, 0.12)

        tl.set({}, {
          onComplete: () => {
            if (counterRef.current) counterRef.current.innerText = `${counterPrefix}10`
          }
        })
      }

      const showLineUI = (delay = 0) => {
        lineTl?.kill()
        gsap.killTweensOf([linePanelRef.current, lineBodyRef.current, ...lineItems, ...lineTitleChars])
        const tl = lineTl = gsap.timeline({ delay })

        tl.to(linePanelRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.38, ease: 'power2.out' }, 0)
        tl.to(lineItems, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.38, stagger: 0.05, ease: 'power2.out' }, 0.04)
        tl.to(lineTitleChars, { x: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.5, stagger: STAGGER.char, ease: 'power2.out' }, 0.08)
        tl.to(lineBodyRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' }, 0.18)
      }

      const hideLineUI = (delay = 0) => {
        lineTl?.kill()
        gsap.killTweensOf([linePanelRef.current, lineBodyRef.current, ...lineItems, ...lineTitleChars])
        const tl = lineTl = gsap.timeline({ delay })

        tl.to(lineBodyRef.current, { y: 16, autoAlpha: 0, filter: 'blur(8px)', duration: 0.2, ease: 'power2.in' }, 0)
        tl.to(lineItems, { y: -12, autoAlpha: 0, filter: 'blur(8px)', duration: 0.22, stagger: 0.03, ease: 'power2.in' }, 0)
        tl.to(lineTitleChars, { x: 16, autoAlpha: 0, filter: 'blur(8px)', duration: 0.22, stagger: 0.002, ease: 'power2.in' }, 0.02)
        tl.to(linePanelRef.current, { y: 20, autoAlpha: 0, filter: 'blur(10px)', duration: 0.2, ease: 'power2.in' }, 0.08)
      }

      /* ── Máquina de direção: cada segmento tem dois clipes, playback SEMPRE
       * nativo (play()) nos dois sentidos — o "reverso" é um clipe gravado/
       * codificado ao contrário, tocado pra frente normalmente. Os clipes não
       * têm keyframes densos o bastante para um scrub manual de currentTime
       * (como o HeroJornada faz) ficar fluido; tentar isso aqui causa engasgo
       * porque cada seek força decodificar do último keyframe em diante.
       * O estado (fase/direção) responde instantaneamente a cada gesto de
       * scroll, sem esperar a transição anterior terminar. */
      const release = () => {
        isLocked = false
        lockScroll(false)
      }

      const syncVideos = (source: HTMLVideoElement, target: HTMLVideoElement) => {
        const progress = source.currentTime / safeDur(source)
        try { target.currentTime = safeDur(target) - (progress * safeDur(target)) } catch(e) {}
      }

      const showStaticAct1 = (exitAfter = false) => {
        allVideos.forEach((v) => v.pause())
        gsap.killTweensOf(allVideos)
        gsap.set(allVideos, { autoAlpha: 0, zIndex: 0 })
        gsap.set([newImg, lineImg, trioImg], { autoAlpha: 0 })
        gsap.set([linePanelRef.current, lineBodyRef.current], { autoAlpha: 0, y: 24, filter: 'blur(10px)' })
        gsap.set(lineTitleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)' })
        gsap.set(lineItems, { autoAlpha: 0, y: 18, filter: 'blur(10px)' })
        gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)' })
        gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
        allVideos.forEach((v) => { try { v.currentTime = 0 } catch(e) {} })
        if (exitAfter) {
          requestAnimationFrame(() => reverseIntro())
        } else {
          introTl.timeScale(1).progress(1).pause()
          gsap.set(scrimRef.current, { autoAlpha: 1 })
          gsap.set(titleChars, { x: 0, autoAlpha: 1, filter: 'blur(0px)' })
          gsap.set(act1Items, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
          gsap.set(calloutLine, { scaleX: 1, transformOrigin: 'left' })
          gsap.set(calloutDot, { scale: 1, autoAlpha: 1 })
          gsap.set(calloutLabel, { x: 0, autoAlpha: 1 })
        }
      }

      /* Repouso no Ato 3: still do frasco novo por cima, morph parado no fim */
      const restAct3 = () => {
        gsap.set(morphFwd, { autoAlpha: 1, zIndex: 1 })
        gsap.set([morphRev, lineFwd, lineRev, catFwd, catRev], { autoAlpha: 0, zIndex: 0 })
        gsap.set(newImg, { autoAlpha: 1 })
        gsap.set([lineImg, trioImg], { autoAlpha: 0 })
        gsap.set([linePanelRef.current, lineBodyRef.current], { autoAlpha: 0, y: 24, filter: 'blur(10px)' })
        gsap.set(lineTitleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)' })
        gsap.set(lineItems, { autoAlpha: 0, y: 18, filter: 'blur(10px)' })
        gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
        gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
        ;[morphRev, lineFwd, lineRev].forEach((v) => { try { v.currentTime = 0 } catch(e) {} })
      }

      /* Repouso na linha completa: still da linha por cima */
      const restLine = () => {
        gsap.set(lineFwd, { autoAlpha: 1, zIndex: 1 })
        gsap.set([morphFwd, morphRev, lineRev, catFwd, catRev], { autoAlpha: 0, zIndex: 0 })
        gsap.set(lineImg, { autoAlpha: 1 })
        gsap.set([newImg, trioImg], { autoAlpha: 0 })
        gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
        gsap.set(brandMarkRef.current, { autoAlpha: 0, y: -18, filter: 'blur(8px)' })
        gsap.set([a3Eyebrow, a3Title, a3Body, a3Stat, newCalloutLabel], { autoAlpha: 0 })
        gsap.set([a3Line, newCalloutLine], { scaleX: 0 })
        gsap.set(newCalloutDot, { scale: 0, autoAlpha: 0 })
        showLineUI(0)
        ;[lineRev, catFwd, catRev].forEach((v) => { try { v.currentTime = 0 } catch(e) {} })
      }

      /* Fim da cadeia: fixa o ultimo frame para atravessar o corte ate o catalogo. */
      const restExit = () => {
        gsap.killTweensOf([oldImg, newImg, lineImg, trioImg])
        gsap.set(allVideos, { autoAlpha: 0, zIndex: 0 })
        gsap.set([oldImg, newImg, lineImg], { autoAlpha: 0 })
        // Geometria IDÊNTICA ao still do catálogo (.pcs-stage: width:100%,
        // height:100svh, object-cover). Usar 100vw aqui incluiria a barra de
        // rolagem (~17px no Windows) e o object-cover renderizaria em escala/
        // centro diferentes — no corte, as duas camadas do trio ficavam
        // desregistradas (fantasma + salto). 100% casa com o ICB sem a barra.
        gsap.set(trioImg, {
          autoAlpha: 1,
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 'auto',
          bottom: 'auto',
          width: '100%',
          height: '100svh',
          zIndex: 80,
          pointerEvents: 'none',
        })
        gsap.set(brandMarkRef.current, { autoAlpha: 0 })
        gsap.set([linePanelRef.current, lineBodyRef.current], { autoAlpha: 0 })
        gsap.set(lineTitleChars, { autoAlpha: 0 })
        gsap.set(lineItems, { autoAlpha: 0 })
        try { catRev.currentTime = 0 } catch(e) {}
      }

      /* O vídeo da transição termina já "dentro" do catálogo: libera o scroll,
       * rola até o pin do HomeProductShowcase e avisa o catálogo para fazer a
       * entrada (fundo branco→cor + textos). O still do trio some durante a
       * rolagem para não duplicar com o trio do próprio catálogo. */
      const finishExit = () => {
        // O vídeo já termina no primeiro produto do catálogo (trio Aminosan) —
        // sem rolagem visível. Avisa o catálogo para se montar (fundo branco +
        // trio no lugar), depois salta INSTANTANEAMENTE uma viewport (fim do
        // stage = início do pin do catálogo). O corte é imperceptível porque os
        // dois lados mostram o mesmo trio; a cor e os textos brotam já no
        // catálogo. O still full-frame fica fora de tela após o salto.
        // No mobile o body está congelado via position:fixed (ver lockScroll):
        // window.scrollY relata 0 nesse estado, não a posição visual real —
        // usar isso aqui subtrairia a rolagem já feita até a seção e o salto
        // pousaria acima do catálogo em vez de exatamente no início dele.
        // Alvo = fim do wrapper (= topo do catálogo). Com a pista de scroll, o
        // fim do stage fica no MEIO do wrapper; usar o bottom do stage pousaria
        // na pista branca, não no catálogo. O bottom do wrapper `root` cai
        // exatamente no início do #sec-produtos.
        const currentScrollY = isMobile ? lockedScrollY : window.scrollY
        const runwayEl = root.current ?? stageTrigger
        const targetY = Math.round(currentScrollY + runwayEl.getBoundingClientRect().bottom)
        window.dispatchEvent(new CustomEvent('aminosan:prepare-handoff-forward'))
        release()
        lenisRef.current?.scrollTo(targetY, { immediate: true, force: true } as any)
        window.scrollTo(0, targetY)
        gsap.set(trioImg, {
          autoAlpha: 0,
          clearProps: 'display,position,top,right,bottom,left,width,height,zIndex,pointerEvents',
        })
        gsap.set(newImg, { clearProps: 'display' })
        window.dispatchEvent(new CustomEvent('aminosan:handoff-forward'))
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
      }

      const stopPlayback = () => {
        if (animFrame) cancelAnimationFrame(animFrame)
        direction = null
        activeSeg = null
        if (phase === 'act3') {
          restAct3()
        } else if (phase === 'line') {
          window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
          restLine()
        } else if (phase === 'exit') {
          restExit()
          finishExit()
        } else {
          const stageTop = stageTrigger.getBoundingClientRect().top
          showStaticAct1(stageTop > window.innerHeight * 0.24)
        }
        cooldownRef.current = performance.now() + 300
      }

      const tick = () => {
        if (!direction || !activeSeg) return
        const seg = SEGMENTS[activeSeg]
        const video = direction === 'forward' ? seg.fwd : seg.rev
        const margin = direction === 'forward' ? 0.1 : 0.18

        if (activeSeg === 'line') {
          if (isMobile) {
            const progress = video.currentTime / safeDur(video)
            const easeProgress = gsap.parseEase('power1.inOut')(progress)
            const currentScale = direction === 'forward' 
              ? 2.8 - (1.35 * easeProgress)
              : 1.45 + (1.35 * easeProgress)
            gsap.set(video, { scale: currentScale })
          } else {
            gsap.set(video, { clearProps: 'scale' })
          }
        }

        if (video.currentTime >= safeDur(video) - margin) {
          if (isMobile && activeSeg === 'line') {
            gsap.set(video, { scale: direction === 'forward' ? 1.45 : 2.8 })
          }
          video.pause()
          phase = direction === 'forward' ? seg.fore : seg.back
          cooldownRef.current = performance.now() + 320
          stopPlayback()
          return
        }
        animFrame = requestAnimationFrame(tick)
      }
      const beginTick = () => { animFrame = requestAnimationFrame(tick) }

      // Os clipes não têm keyframes densos (ver comentário da máquina acima):
      // um seek de currentTime força o browser a decodificar do último keyframe
      // em diante, o que não é instantâneo. Revelar o vídeo (crossfade + play) e
      // chamar tick() ANTES desse seek terminar mostra, por um instante, o frame
      // de ANTES do seek — visto como um "piscar" no frame final ou inicial
      // errado. Esperar o 'seeked' antes de revelar é o mesmo princípio do
      // HeroJornada: só avança/mostra o vídeo quando ele já está no ponto certo.
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

      /* Prepara a mecânica comum de um segmento (sync de reversão no meio do
       * caminho + revelação segura) e devolve os papéis dos clipes. Só
       * sincroniza a partir do outro clipe se estávamos ATIVAMENTE tocando ele
       * (reversão no meio do caminho). Num início "frio" a partir do repouso, o
       * clipe alvo já está em 0 (os rest* garantem isso) — sincronizar de novo
       * leria o currentTime "intocado" do outro clipe (do priming) como se
       * fosse progresso real e pularia o clipe alvo direto pro final, fazendo a
       * transição inteira sumir. */
      const engage = (name: SegName, dir: Dir, reveal: (video: HTMLVideoElement, fwdDur: number) => void) => {
        if (animFrame) cancelAnimationFrame(animFrame)
        const seg = SEGMENTS[name]
        const oldDir = activeSeg === name ? direction : null
        activeSeg = name
        direction = dir
        const video = dir === 'forward' ? seg.fwd : seg.rev
        const other = dir === 'forward' ? seg.rev : seg.fwd
        const needsSync = oldDir !== null && oldDir !== dir
        if (needsSync) {
          syncVideos(other, video)
          other.pause()
        }
        const fwdDur = safeDur(seg.fwd)
        revealWhenReady(video, needsSync, () => {
          // Se uma reversão mais nova assumiu enquanto esperávamos o seek, esta
          // chamada é obsoleta — aplicar o reveal aqui pisaria no estado atual.
          if (direction !== dir || activeSeg !== name) return
          gsap.set(video, { zIndex: 9, autoAlpha: 1 })
          gsap.set(other, { zIndex: 0, autoAlpha: 0 })
          reveal(video, fwdDur)
        })
      }

      /* ── Segmento morph: act1 ⇄ act3 ─────────────────────────────── */
      const startMorph = (dir: Dir) => {
        if (dir === 'forward') {
          introTl.progress(1)
          gsap.set(oldImg, { autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)' })
        } else {
          gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
        }

        engage('morph', dir, (video, fwdDur) => {
          gsap.set([lineFwd, lineRev, catFwd, catRev], { autoAlpha: 0, zIndex: 0 })
          gsap.set([newImg, lineImg, trioImg], { autoAlpha: 0 })

          if (dir === 'forward') {
            gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)' })

            const handoffTl = gsap.timeline({
              onComplete: () => {
                if (direction !== 'forward' || activeSeg !== 'morph') return
                video.play().catch(() => {})
                beginTick()
              },
            })
            handoffTl.to(oldImg, { autoAlpha: 0, scale: 0.992, filter: 'blur(4px)', duration: 0.24, ease: 'power1.inOut', overwrite: 'auto' }, 0)

            gsap.killTweensOf(brandMarkRef.current)
            gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
            gsap.to(titleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)', duration: fwdDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(act1Items, { y: 20, autoAlpha: 0, filter: 'blur(10px)', duration: fwdDur * 0.4, stagger: 0.05, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutLabel, { x: 12, autoAlpha: 0, duration: fwdDur * 0.24, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutDot, { scale: 0, autoAlpha: 0, duration: fwdDur * 0.22, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutLine, { scaleX: 0, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(scrimRef.current, { autoAlpha: 0, duration: fwdDur * 0.8, ease: 'power1.inOut', overwrite: 'auto' })

            showAct3UI(fwdDur * 0.4)
          } else {
            gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })

            video.play().catch(() => {})

            hideAct3UI(0)

            gsap.killTweensOf(brandMarkRef.current)
            gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
            gsap.set(titleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)' })
            gsap.set(act1Items, { y: 20, autoAlpha: 0, filter: 'blur(10px)' })
            gsap.set(calloutLine, { scaleX: 0 })
            gsap.set(calloutDot, { scale: 0, autoAlpha: 0 })
            gsap.set(calloutLabel, { x: 12, autoAlpha: 0 })
            gsap.set(scrimRef.current, { autoAlpha: 0 })

            gsap.to(scrimRef.current, { autoAlpha: 1, duration: fwdDur * 0.28, delay: fwdDur * 0.48, ease: 'power1.inOut', overwrite: 'auto' })

            gsap.to(titleChars, { x: 0, autoAlpha: 1, filter: 'blur(0px)', duration: fwdDur * 0.28, delay: fwdDur * 0.56, stagger: STAGGER.char, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(act1Items, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: fwdDur * 0.28, delay: fwdDur * 0.6, stagger: 0.08, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutLine, { scaleX: 1, duration: fwdDur * 0.18, delay: fwdDur * 0.66, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutDot, { scale: 1, autoAlpha: 1, duration: fwdDur * 0.16, delay: fwdDur * 0.73, ease: 'back.out(1.8)', overwrite: 'auto' })
            gsap.to(calloutLabel, { x: 0, autoAlpha: 1, duration: fwdDur * 0.2, delay: fwdDur * 0.76, ease: 'power1.inOut', overwrite: 'auto' })

            beginTick()
          }
        })
      }

      /* ── Segmento line: act3 ⇄ linha completa (vídeo 2) ──────────────
       * O primeiro frame do clipe é idêntico ao still do frasco novo, e o
       * último à linha completa — os fades curtos só mascaram desvio de
       * codificação de 1px. A linha completa tem copy própria para não repetir
       * o argumento do frasco atual. */
      const startLine = (dir: Dir) => {
        engage('line', dir, (video) => {
          gsap.set([morphFwd, morphRev, catFwd, catRev], { autoAlpha: 0, zIndex: 0 })
          gsap.set(oldImg, { autoAlpha: 0 })
          gsap.set(trioImg, { autoAlpha: 0 })

          if (isMobile) {
            const progress = video.currentTime / safeDur(video)
            const easeProgress = gsap.parseEase('power1.inOut')(progress)
            const currentScale = dir === 'forward' 
              ? 2.8 - (1.35 * easeProgress)
              : 1.45 + (1.35 * easeProgress)
            gsap.set(video, { scale: currentScale })
          } else {
            gsap.set(video, { clearProps: 'scale' })
          }

          if (dir === 'forward') {
            gsap.killTweensOf([oldImg, newImg, lineImg, trioImg])
            gsap.set([oldImg, newImg, lineImg, trioImg], { autoAlpha: 0 })
            gsap.to(brandMarkRef.current, { y: -18, autoAlpha: 0, filter: 'blur(8px)', duration: 0.32, ease: 'power2.out', overwrite: true })
            hideAct3UI(0)
            showLineUI(safeDur(SEGMENTS.line.fwd) * 0.18)
          } else {
            gsap.to(lineImg, { autoAlpha: 0, duration: 0.18, ease: 'power1.out', overwrite: true })
            gsap.set(newImg, { autoAlpha: 0 })
            hideLineUI(0)
            showAct3UI(safeDur(SEGMENTS.line.rev) * 0.52)
            gsap.to(brandMarkRef.current, {
              y: 0, autoAlpha: 1, filter: 'blur(0px)',
              duration: 0.4, delay: safeDur(SEGMENTS.line.rev) * 0.55,
              ease: 'power2.out', overwrite: true,
            })
          }

          video.play().catch(() => {})
          beginTick()
        })
      }

      /* ── Segmento cat: linha completa ⇄ trio do catálogo (vídeo da
       * transição). No sentido forward a UI do Ato 3 sai de cena — estamos
       * deixando a seção; no backward ela volta junto com a linha. */
      const startCat = (dir: Dir) => {
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-start'))
        engage('cat', dir, (video) => {
          gsap.set([morphFwd, morphRev, lineFwd, lineRev], { autoAlpha: 0, zIndex: 0 })
          gsap.killTweensOf([oldImg, newImg, lineImg, trioImg])
          gsap.set([oldImg, newImg, lineImg, trioImg], { autoAlpha: 0 })

          if (dir === 'forward') {
            hideLineUI(0)
          } else {
            gsap.to(trioImg, { autoAlpha: 0, duration: 0.18, ease: 'power1.out', overwrite: true })
            gsap.set(lineImg, { autoAlpha: 0 })
            showLineUI(safeDur(SEGMENTS.cat.rev) * 0.45)
          }

          video.play().catch(() => {})
          beginTick()
        })
      }

      const startSeg = (name: SegName, dir: Dir) => {
        if (name === 'morph') startMorph(dir)
        else if (name === 'line') startLine(dir)
        else startCat(dir)
      }

      // Um único ScrollTrigger no mesmo ponto ('top top') cobre os dois sentidos —
      // igual ao autoRewind do HeroJornada, mas usando o cruzamento de posição do
      // ScrollTrigger (já comprovado confiável na entrada) em vez de recalcular a
      // posição "à mão" num listener de scroll separado.
      // Tolerância da checagem de proximidade: no mobile não existe Lenis (ver
      // SmoothScroll.tsx — pointer:coarse usa scroll nativo puro), então um flick
      // comum já move várias centenas de px entre duas amostras de scroll. Uma
      // margem fixa pequena (150px, suficiente pro passo curto do Lenis no
      // desktop) faz o onEnter dessincronizar do 'top top' real nesse caso: quando
      // o callback roda, rect.top já passou da margem, a trava nunca engata e o
      // scroll nativo atravessa a seção inteira de uma vez. Por isso a margem só
      // cresce no mobile — no desktop o passo curto do Lenis não precisa dela, e
      // alargar geral faria cruzamentos "fantasma" de longe (ex: um
      // ScrollTrigger.refresh() disparado com o usuário rolado pra bem longe
      // desta seção) passarem como "perto", destravando o scroll cedo demais.
      const nearStageTop = (rect: DOMRect | null | undefined) =>
        !!rect && Math.abs(rect.top) <= (isMobile ? Math.max(window.innerHeight * 0.9, 150) : 150)

      // Trava robusta à INTENSIDADE do scroll (o bug do "pulei direto pro
      // catálogo"). Causa-raiz: o stage tinha exatamente 1 viewport de altura e o
      // catálogo colado logo abaixo — zero pista de scroll. Num fling forte o
      // onEnter dispara já com o 'top top' ultrapassado por centenas de px, a
      // proximidade exata do stage falha e o scroll nativo/Lenis atravessa a
      // seção inteira até o catálogo (o HeroJornada nunca sofre disso por ser
      // sticky no topo; o catálogo, por ter um pin com espaçador).
      //
      // Correção: um espaçador ("pista de pouso") no fim do wrapper `root`
      // (ver JSX) dá à seção espaço de scroll REAL. O overshoot de um fling cai
      // nessa pista (branca), não no catálogo, e a trava passa a depender apenas
      // de estarmos DENTRO da pista — condição geométrica estável do wrapper, que
      // independe da velocidade. Ao travar, o lockScroll reposiciona o stage no
      // topo (o alvo já é o topo do wrapper, pois o stage é seu primeiro filho).
      const insideRunway = () => {
        const rr = root.current?.getBoundingClientRect()
        if (!rr) return false
        const vh = window.innerHeight
        // topo do wrapper já cruzou o topo da viewport E ainda resta ao menos
        // ~1 viewport de pista abaixo (o catálogo só começa no fim do wrapper).
        return rr.top <= 1 && rr.bottom > vh * 0.85
      }

      // onEnter: entrando pela primeira vez (rest em act1) → só trava, o próprio
      // gesto de scroll seguinte é que inicia o forward (via handleForward).
      // onEnterBack: voltando de baixo → trava E já dispara o rebobinar do
      // segmento correspondente à fase em que a seção ficou, sem esperar gesto.
      let stTop = ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top top',
        onEnter: () => {
          playIntro(false)
          // Enquanto estivermos dentro da pista (imune à velocidade do fling),
          // trava e reposiciona no topo; fora dela, é cruzamento-fantasma de um
          // refresh com o usuário longe — ignora.
          if (!insideRunway()) {
            if (isLocked) release()
            return
          }
          if (phase === 'act1' && !isLocked && !direction) {
            isLocked = true
            lockScroll(true)
          }
        },
        onLeave: () => {
          if (!isLocked) return
          // Num fling forte o ScrollTrigger cruza o 'top top' e o fim do stage no
          // MESMO tick: o onEnter acima acabou de travar em act1 e este onLeave
          // viria logo atrás soltando tudo — o scroll então atravessaria a seção
          // inteira até o catálogo. Enquanto a sequência ainda está em act1
          // (nenhuma transição começou), a trava recém-engatada vale; só soltamos
          // nas fases já avançadas, onde onLeave é a segurança real de escape.
          if (phase === 'act1' && !direction) return
          release()
        },
        onEnterBack: () => {
          if (phase === 'act1') playIntro(false)
          const rect = stageRef.current?.getBoundingClientRect()
          if (!nearStageTop(rect)) {
            if (isLocked) release()
            return
          }
          if (isLocked || direction) return
          if (phase === 'act3') {
            isLocked = true
            lockScroll(true)
            startMorph('backward')
          } else if (phase === 'line') {
            isLocked = true
            lockScroll(true)
          } else if (phase === 'exit') {
            isLocked = true
            lockScroll(true)
            startCat('backward')
          }
        },
        // onLeaveBack: o release() em act3/line solta o scroll bem no início do
        // estágio (ele ficou travado ali a transição inteira); se o usuário
        // reverte antes de rolar a tela inteira pra baixo, ele sai por CIMA sem
        // nunca cruzar a borda de baixo — sem isto o onEnterBack acima nunca
        // dispara e a seção fica presa na fase avançada pra sempre.
        onLeaveBack: () => {
          const rect = stageRef.current?.getBoundingClientRect()
          if (!nearStageTop(rect)) {
            if (isLocked) release()
            return
          }
          if (phase === 'line' && !isLocked && !direction) {
            isLocked = true
            lockScroll(true)
            startLine('backward')
          } else if (phase === 'act3' && !isLocked && direction !== 'backward') {
            isLocked = true
            lockScroll(true)
            startMorph('backward')
          } else if (isLocked) {
            release()
          }
        },
      })

      const handleForward = () => {
        if (!isLocked) return
        if (direction === 'backward' && activeSeg) {
          startSeg(activeSeg, 'forward')
          return
        }
        if (direction || performance.now() <= cooldownRef.current) return
        if (phase === 'act1') startMorph('forward')
        else if (phase === 'act3') startLine('forward')
        else if (phase === 'line') startCat('forward')
      }

      const handleBackward = () => {
        if (!isLocked) return
        if (direction === 'forward' && activeSeg) {
          startSeg(activeSeg, 'backward')
          return
        }
        if (direction || performance.now() <= cooldownRef.current) return
        if (phase === 'act3') startMorph('backward')
        else if (phase === 'line') startLine('backward')
        else if (phase === 'exit') startCat('backward')
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
        if (e.deltaY < 0 && phase === 'act1' && !direction) { release(); return }
        e.preventDefault()
        if (Math.abs(e.deltaY) < 18) return
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
        if (up && phase === 'act1' && !direction) { release(); return }
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
        e.preventDefault()
      }
      const onTouchEnd = (e: TouchEvent) => {
        if (!isLocked) return
        const endY = e.changedTouches[0] ? e.changedTouches[0].clientY : touchY
        const dy   = touchY - endY
        if (dy > 30) {
          handleForward()
        } else if (dy < -30) {
          if (phase === 'act1' && !direction) { release(); return }
          handleBackward()
        }
      }

      // Volta a partir do catálogo: o catálogo já preparou o frame (trio full-
      // frame no branco, igual ao fim do vídeo) e saltou de volta para cá. A
      // seção continua em 'exit' com o trio still visível — travamos e tocamos
      // o clipe de transição em reverso (trio → linha), seguindo a cadeia acima.
      const onHandoffBackward = () => {
        if (isLocked || direction || phase !== 'exit') return
        restExit()
        isLocked = true
        lockScroll(true)
        startCat('backward')
      }
      window.addEventListener('aminosan:handoff-backward', onHandoffBackward)

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
      allVideos.forEach((v) => {
        v.play().then(() => { if (!direction) { v.pause(); v.currentTime = 0 } }).catch(() => {})
      })

      return () => {
        stIntro?.kill()
        stIntroExit?.kill()
        introTl.kill()
        stTop.kill()
        titleSplit?.revert()
        currentTl?.kill()
        if (animFrame) cancelAnimationFrame(animFrame)
        lenisRef.current?.start()

        // Limpeza dos event listeners globais
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
        window.removeEventListener('aminosan:handoff-backward', onHandoffBackward)
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
        {/* Vídeos da cadeia — desktop e mobile compartilham os mesmos clipes.
            Cada segmento tem um clipe forward e um reverso gravado. */}
        <video
          ref={morphFwdRef}
          muted playsInline preload="metadata"
          poster="/heritage/desktop/morph-aminosan-1-antigo.png"
          aria-label={t('videoAlt')}
          className={`${STAGE_VIDEO_CLASS} max-lg:scale-[2.8]`}
        >
          <source src="/heritage/desktop/morph-aminosan.mp4" type="video/mp4" />
        </video>
        <video ref={morphRevRef} muted playsInline preload="metadata" aria-hidden="true" className={`${STAGE_VIDEO_CLASS} max-lg:scale-[2.8]`}>
          <source src="/heritage/desktop/morph-aminosan-reverse.mp4" type="video/mp4" />
        </video>
        <video ref={lineFwdRef} muted playsInline preload="metadata" aria-hidden="true" className={STAGE_VIDEO_CLASS}>
          <source src="/heritage/desktop/line-aminosan.mp4" type="video/mp4" />
        </video>
        <video ref={lineRevRef} muted playsInline preload="metadata" aria-hidden="true" className={STAGE_VIDEO_CLASS}>
          <source src="/heritage/desktop/line-aminosan-reverse.mp4" type="video/mp4" />
        </video>
        <video ref={catFwdRef} muted playsInline preload="metadata" aria-hidden="true" className={`${STAGE_VIDEO_CLASS} max-lg:scale-[1.45]`}>
          <source src="/heritage/desktop/line-to-catalog.mp4" type="video/mp4" />
        </video>
        <video ref={catRevRef} muted playsInline preload="metadata" aria-hidden="true" className={`${STAGE_VIDEO_CLASS} max-lg:scale-[1.45]`}>
          <source src="/heritage/desktop/line-to-catalog-reverse.mp4" type="video/mp4" />
        </video>

        {/* z-10 — foto estática do frasco antigo */}
        <Image
          ref={oldImgRef}
          src="/heritage/desktop/morph-aminosan-1-antigo.png"
          alt={t('oldBottleAlt')}
          fill sizes="100vw"
          className={`${STAGE_IMAGE_CLASS} max-lg:!scale-[2.8]`}
          priority
        />

        {/* z-10 — foto estática do frasco novo */}
        <Image
          ref={newImgRef}
          src="/heritage/desktop/morph-aminosan-2-novo.png"
          alt={t('newBottleAlt')}
          fill sizes="100vw"
          className={`${STAGE_IMAGE_CLASS} opacity-0 max-lg:!scale-[2.8]`}
          priority
        />

        {/* z-10 — still da linha completa (repouso da fase line) */}
        <Image
          ref={lineImgRef}
          src="/heritage/desktop/line-aminosan-full.png"
          alt=""
          aria-hidden
          fill sizes="100vw"
          className={`${STAGE_IMAGE_CLASS} opacity-0 max-lg:!scale-[1.45]`}
        />

        {/* z-10 — still do trio do catálogo (fim da transição) */}
        <Image
          ref={trioImgRef}
          src="/produtos/aminosan-catalogo.png"
          alt=""
          aria-hidden
          fill sizes="100vw"
          className={`${STAGE_IMAGE_CLASS} opacity-0 max-lg:!scale-[1.45]`}
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
        {/* UI da linha completa - aparece so depois que o frasco vira portfolio. */}
        <Container className="pointer-events-none absolute inset-x-0 top-[10vh] z-30 flex justify-center min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
          <div ref={linePanelRef} className="max-w-[92vw] text-center md:max-w-[68rem] xl:max-w-[74rem]">
            <span data-line-copy className="text-eyebrow mb-sm block text-[10px] uppercase tracking-[0.18em] text-primary xl:text-xs">
              {t('lineEyebrow')}
            </span>
            <BicolorTitle data-line-title title={t('lineTitle')} titleHi={t('lineTitleHi')} className="text-[clamp(1.75rem,5vw,4rem)] md:text-[clamp(2.15rem,3.45vw,4.15rem)]" />
          </div>
        </Container>
        <Container className="pointer-events-none absolute inset-x-0 bottom-[4vh] z-30 flex justify-center min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
          <p ref={lineBodyRef} className="text-subtitle mx-auto max-w-[50rem] text-center text-sm text-foreground/75 md:text-base xl:text-lg">
            {t('lineBody')}
          </p>
        </Container>
        {/* UI do Ato 3 — mesmo desenho do Ato 1: coluna de texto à esquerda, frasco em cena.
            No mobile o bloco de prova (número + handoff + CTA) desce para o rodapé da tela,
            deixando o frasco visível no meio. */}
        <Container className="relative lg:absolute lg:inset-0 z-30 flex min-h-[100svh] lg:min-h-0 h-auto lg:h-full items-stretch md:items-center min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem] pointer-events-none pt-[8vh] md:pt-0 pb-[8vh] md:pb-0">
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

        <BottleCallout refEl={newCalloutRef} eyebrow={t('a3Eyebrow')} className="max-md:!top-[25vh] max-md:!bottom-auto">
          {t('newBottleCaption')}
        </BottleCallout>
      </section>

      {/* Pista de pouso: espaço de scroll REAL depois do stage, para que o
          overshoot de um scroll intenso caia aqui (área branca) em vez de já
          revelar o catálogo — dando à trava tempo/geometria estável para engatar
          e reposicionar a seção no topo (ver insideRunway/finishExit). O usuário
          nunca descansa nesta faixa: o fim do filme salta direto para o catálogo
          e a volta salta para o topo do stage. Mesma ideia do sticky do
          HeroJornada e do pin do catálogo, que já são 100% estáveis. */}
      <div aria-hidden className="pointer-events-none w-full h-[100svh]" />
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
      className="pointer-events-none absolute left-1/2 top-[12svh] z-30 -translate-x-1/2 text-center max-md:top-[4svh]"
    >
      <span className="font-black uppercase leading-none tracking-[0.02em] text-foreground text-[clamp(1.45rem,2.08vw,2.65rem)]">
        AMINOSAN<sup className="ml-1 align-super text-[0.36em] leading-none">&reg;</sup>
      </span>
    </div>
  )
}


function BottleCallout({
  refEl,
  eyebrow,
  className = '',
  children,
}: {
  refEl: RefObject<HTMLDivElement | null>
  eyebrow: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      ref={refEl}
      className={`aminosan-bottle-callout pointer-events-none absolute z-30 flex items-center gap-3 ${className}`}
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
