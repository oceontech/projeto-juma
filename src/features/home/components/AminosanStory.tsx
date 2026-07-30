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
  'absolute inset-0 z-0 h-full w-full object-cover opacity-0 max-lg:top-[22dvh] max-lg:h-[60dvh] max-lg:object-contain'
const STAGE_IMAGE_CLASS =
  'absolute z-10 pointer-events-none object-cover md:!object-cover lg:!inset-0 max-lg:!top-[22dvh] max-lg:!h-[60dvh] max-lg:!object-contain'

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

    // Só re-agenda refresh em resize de LARGURA (rotação, redimensionar janela).
    // No mobile, mudança de ALTURA sozinha é o navegador escondendo/mostrando a
    // barra de endereço enquanto o usuário rola — refazer o refresh nesse
    // momento recalcula start/end/spacer do pin no meio do gesto e produz o
    // salto. Mesma guarda que o HomeProductShowcase já usa.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      scheduleRefresh()
    }

    window.addEventListener('load', scheduleRefresh)
    window.addEventListener('pageshow', scheduleRefresh)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('load', scheduleRefresh)
      window.removeEventListener('pageshow', scheduleRefresh)
      window.removeEventListener('resize', onResize)
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
      <div className="sticky top-0 w-full h-[100dvh] overflow-hidden bg-white flex flex-col">
        {/* Spacer invisível para empurrar a garrafa para baixo do texto */}
        <div className="shrink-0 h-[45dvh] w-full pointer-events-none" aria-hidden />
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
      <div className="absolute top-0 left-0 w-full h-[100dvh] pointer-events-none">
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
      <div ref={calloutSectionRef} className="absolute top-[150vh] left-0 w-full min-h-[100dvh] bg-white z-20 pointer-events-auto flex flex-col justify-end">
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
 * Durante cada transição o scroll é travado; depois é liberado. O gesto
 * contrário no meio de uma transição não é engolido: vira o clipe no frame em
 * que ele está e o leva de volta à outra ponta do mesmo segmento (a tela segue
 * travada durante o reverso) — mesmo contrato do HeroJornada.
 */

function CinematicVersion({ t, isMobile }: { t: TFn; isMobile: boolean }) {
  const root            = useRef<HTMLDivElement>(null)
  const stageRef        = useRef<HTMLElement>(null)
  const videoRef        = useRef<HTMLVideoElement>(null)
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
      const video = videoRef.current
      const stageTrigger = stageRef.current
      const oldImg = oldImgRef.current
      if (!video || !stageTrigger || !oldImg) return

      const allVideos = [video]
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

      // ── Estado inicial: Ato 1 visível por padrão (sem tela branca)
      gsap.set(allVideos,    { autoAlpha: 0, zIndex: 0 })
      gsap.set(video, { zIndex: 1 })
      gsap.set([newImg, lineImg, trioImg], { autoAlpha: 0 })
      gsap.set(brandMarkRef.current, { autoAlpha: 1, y: 0, filter: 'blur(0px)' })
      gsap.set(oldImg,       { zIndex: 10, scale: 1, autoAlpha: 1, yPercent: 0, filter: 'blur(0px)' })
      gsap.set(scrimRef.current, { autoAlpha: 1 })
      gsap.set(titleChars,   { x: 0, autoAlpha: 1, filter: 'blur(0px)' })
      gsap.set(act1Items,    { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
      gsap.set(calloutLine,  { scaleX: 1, transformOrigin: 'left' })
      gsap.set(calloutDot,   { scale: 1, autoAlpha: 1 })
      gsap.set(calloutLabel, { autoAlpha: 1, x: 0 })

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
      const lockScroll = (on: boolean) => {
        // Desktop: o Lenis tem inércia própria e continuaria correndo por cima
        // do clipe. No mobile ele nem existe (SmoothScroll não instancia em
        // pointer:coarse / <1024px) — lá quem trava é o preventDefault do
        // touchmove logo abaixo.
        if (on) lenisRef.current?.stop()
        else lenisRef.current?.start()
      }


      let stIntro: ScrollTrigger | null = null
      let stIntroExit: ScrollTrigger | null = null

      type Phase = 'act1' | 'act3' | 'line' | 'exit'

      /* As 4 fases de repouso, na ordem da cadeia. O índice da fase é também o
         índice do `targets` (tempo do vídeo) e do `step` — um só número descreve
         "onde a cena está", e é ele que manda no scroll (e não o contrário). */
      const PHASES: Phase[] = ['act1', 'act3', 'line', 'exit']
      const LAST = PHASES.length - 1

      let phase: Phase = 'act1'
      let direction: 'forward' | 'backward' | null = null
      const cooldownRef = { current: 0 }
      let playing = false
      let releasing = false
      let targetTime: number | null = null
      let step = 0
      let lastTime = 0
      let animFrame = 0
      const targets = [0, 2.64, 4.07, 5.90]

      let pinTrigger: ScrollTrigger | null = null
      /* Só é "voltar à seção" se ela chegou a sair de vista. O ato 1 descansa
         exatamente em pinTrigger.start, então o primeiro snap para o ato 2 é
         lido pelo ScrollTrigger como uma entrada no trigger e dispara onEnter —
         sem esta guarda, esse onEnter interno rebobinava a cena para o ato 1 no
         meio da própria transição. Quem levanta a flag é o IntersectionObserver
         lá embaixo. */
      let wasOutside = false

      /* O catálogo avisa que começou a sair para cima (fade branco) muito antes
         de o salto de volta acontecer. Nesse intervalo a seção pode reaparecer
         na tela — por inércia do gesto no mobile — e o IntersectionObserver
         lá embaixo leria isso como "voltou à seção", rebobinando a cena para o
         ato 1. Aí o reverso não teria mais o que reverter (a volta exige a fase
         'exit') e o usuário caía no começo da seção sem ver os vídeos. */
      let handoffBackPending = false
      let handoffBackTimer: ReturnType<typeof setTimeout> | undefined
      const clearHandoffBack = () => {
        handoffBackPending = false
        clearTimeout(handoffBackTimer)
      }
      const onPrepareHandoffBackward = () => {
        handoffBackPending = true
        clearTimeout(handoffBackTimer)
        // Rede de segurança: se a saída do catálogo morrer no meio (troca de
        // aba, refresh do ScrollTrigger), a guarda não fica presa para sempre.
        handoffBackTimer = setTimeout(clearHandoffBack, 2500)
      }
      window.addEventListener('aminosan:prepare-handoff-backward', onPrepareHandoffBackward)

      /* Posição de scroll de cada fase dentro do pin. O pin dá o trilho; quem
         escolhe o ponto exato do trilho é a máquina de fases, nunca a força do
         gesto — é isso que faz a seção parar sempre no mesmo pixel. */
      const phaseY = (i: number) => {
        if (!pinTrigger) return window.scrollY
        return Math.round(pinTrigger.start + ((pinTrigger.end - pinTrigger.start) * i) / LAST)
      }

      const snapToPhase = () => {
        if (!pinTrigger) return
        const y = phaseY(PHASES.indexOf(phase))
        if (Math.abs(window.scrollY - y) < 2) return
        lenisRef.current?.scrollTo(y, { immediate: true, force: true } as never)
        window.scrollTo(0, y)
      }

      const safeDur = (v: HTMLVideoElement) => (v.duration > 0 && isFinite(v.duration)) ? v.duration : 6

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

      /* Fim da cadeia: entrega o bastão pro catálogo. Sem isto o usuário fica
         com a seção já esgotada na tela e precisa rolar o pin inteiro no branco
         até a próxima seção aparecer. */
      const releaseForward = () => {
        releasing = true
        lockScroll(false)
        // Fim do spacer do pin = topo da próxima seção. Vale como referência
        // própria (não depende do catálogo estar montado — ele é import
        // dinâmico) e serve de sanidade: se o #sec-produtos ainda não assentou
        // o layout, o valor dele vem menor que o fim do pin, o que jogaria o
        // usuário de volta pra dentro da cadeia.
        const fallback = pinTrigger ? pinTrigger.end + window.innerHeight : window.scrollY
        const next = document.getElementById('sec-produtos')
        const measured = next ? Math.round(next.getBoundingClientRect().top + window.scrollY) : null
        const y = measured !== null && measured >= fallback - 2 ? measured : Math.round(fallback)
        lenisRef.current?.scrollTo(y, { immediate: true, force: true } as never)
        window.scrollTo(0, y)
        ScrollTrigger.update()
        requestAnimationFrame(() => { releasing = false })
      }

      const hideAct1UI = (immediate = false) => {
        if (immediate) {
          gsap.set(titleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)' })
          gsap.set(act1Items, { y: 20, autoAlpha: 0, filter: 'blur(10px)' })
          gsap.set(calloutLine, { scaleX: 0 })
          gsap.set(calloutDot, { scale: 0, autoAlpha: 0 })
          gsap.set(calloutLabel, { x: 12, autoAlpha: 0 })
          gsap.set(scrimRef.current, { autoAlpha: 0 })
        } else {
          gsap.to(titleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)', duration: 0.6, stagger: STAGGER.char, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(act1Items, { y: 20, autoAlpha: 0, filter: 'blur(10px)', duration: 0.6, stagger: 0.05, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutLabel, { x: 12, autoAlpha: 0, duration: 0.36, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutDot, { scale: 0, autoAlpha: 0, duration: 0.33, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(calloutLine, { scaleX: 0, duration: 0.45, ease: 'power1.inOut', overwrite: 'auto' })
          gsap.to(scrimRef.current, { autoAlpha: 0, duration: 1.2, ease: 'power1.inOut', overwrite: 'auto' })
        }
      }

      const hideAct3All = (immediate = false) => {
        if (immediate) {
          gsap.killTweensOf([a3Eyebrow, a3Title, a3Body, a3Line, a3Stat, newCalloutLine, newCalloutDot, newCalloutLabel])
          gsap.set([a3Eyebrow, a3Title, a3Body, a3Stat, newCalloutLabel], { autoAlpha: 0 })
          gsap.set([a3Line, newCalloutLine], { scaleX: 0 })
          gsap.set(newCalloutDot, { scale: 0, autoAlpha: 0 })
        } else {
          hideAct3UI(0)
        }
      }

      const hideLineAll = (immediate = false) => {
        if (immediate) {
          gsap.killTweensOf([linePanelRef.current, lineBodyRef.current, ...lineItems, ...lineTitleChars])
          gsap.set([linePanelRef.current, lineBodyRef.current], { autoAlpha: 0, y: 24, filter: 'blur(10px)' })
          gsap.set(lineTitleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)' })
          gsap.set(lineItems, { autoAlpha: 0, y: 18, filter: 'blur(10px)' })
        } else {
          hideLineUI(0)
        }
      }

      const updateVideoScale = (video: HTMLVideoElement) => {
        if (window.innerWidth < 1024) {
          let vScale = 2.8
          const cur = video.currentTime
          if (cur > targets[1] && cur < targets[2]) {
            const p = (cur - targets[1]) / (targets[2] - targets[1])
            vScale = 2.8 + (1.45 - 2.8) * Math.max(0, Math.min(1, p))
          } else if (cur >= targets[2]) {
            vScale = 1.45
          }
          gsap.set(video, { scale: vScale })
        } else {
          gsap.set(video, { scale: 1 })
        }
      }

      const updateActivePhase = (time: number) => {
        if (time < targets[1] - 0.2) phase = 'act1'
        else if (time < targets[2] - 0.2) phase = 'act3'
        else if (time < targets[3] - 0.2) phase = 'line'
        else phase = 'exit'
      }

      const tick = (now: number) => {
        const video = videoRef.current
        if (!video) { stopPlayback(); return }
        if (!playing) return
        const target = targetTime
        if (target === null) return

        if (direction === 'forward') {
          lastTime = now
          const current = video.currentTime
          const limit = target >= video.duration - 0.1 ? video.duration - 0.05 : target - 0.02
          if (current >= limit || video.ended) {
            try { video.pause() } catch {}
            stopPlayback()
            return
          }
          if (video.paused && !video.ended) {
            void video.play().catch(() => {})
          }
        } else if (direction === 'backward') {
          if (!video.paused) video.pause()
          if (video.seeking) {
            animFrame = requestAnimationFrame(tick)
            return
          }
          const elapsed = (now - lastTime) / 1000
          lastTime = now
          const current = video.currentTime
          const nextTime = Math.max(0, current - elapsed)
          try { video.currentTime = nextTime } catch {}
          if (nextTime <= target + 0.02) { stopPlayback(); return }
        }
        updateActivePhase(video.currentTime)
        updateVideoScale(video)
        animFrame = requestAnimationFrame(tick)
      }

      /* `midFlight` = esta chamada está virando um clipe que já estava tocando
         (o gesto contrário chegou no meio da transição). O tempo do vídeo não é
         tocado em nenhum dos casos — é isso que faz o reverso sair do frame
         exato em que o usuário deu o gesto. A diferença está só nos stills:
         partindo do repouso é preciso trocar still → vídeo; em pleno voo o
         vídeo já está em cena e repor o still daria flash. */
      const startPlayback = (dir: 'forward' | 'backward', target: number, midFlight = false) => {
        const video = videoRef.current
        if (!video) return
        if (animFrame) cancelAnimationFrame(animFrame)
        direction = dir
        targetTime = target
        playing = true
        lockScroll(true)
        updateVideoScale(video)

        if (dir === 'forward') {
          gsap.set(video, { autoAlpha: 1, zIndex: 1 })
          if (step === 1) {
            if (midFlight) {
              // O morph já está em andamento: o frasco antigo saiu de cena e o
              // frame atual do vídeo é quem manda. Repor o still em autoAlpha 1
              // para fadear de novo piscaria o frasco antigo por cima dele.
              gsap.killTweensOf(oldImg)
              gsap.set(oldImg, { autoAlpha: 0 })
            } else {
              gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)' })
              gsap.to(oldImg, { autoAlpha: 0, scale: 0.992, filter: 'blur(4px)', duration: 0.24, ease: 'power1.inOut', overwrite: 'auto' })
            }
            hideAct1UI(false)
            showAct3UI(0.6)
          } else if (step === 2) {
            gsap.killTweensOf([oldImg, newImg, lineImg, trioImg])
            gsap.set([oldImg, newImg, lineImg, trioImg], { autoAlpha: 0 })
            gsap.to(brandMarkRef.current, { y: -18, autoAlpha: 0, filter: 'blur(8px)', duration: 0.32, ease: 'power2.out', overwrite: true })
            hideAct3UI(0)
            showLineUI(0.4)
          } else if (step === 3) {
            gsap.to(lineImg, { autoAlpha: 0, duration: 0.24, ease: 'power1.inOut', overwrite: 'auto' })
            hideLineUI(0)
            window.dispatchEvent(new CustomEvent('aminosan:video-handoff-start'))
          }
          void video.play().catch(() => {})
        } else {
          gsap.set(video, { autoAlpha: 1, zIndex: 1 })
          video.pause()
          const duration = safeDur(video)
          if (video.currentTime >= duration - 0.05) {
            try { video.currentTime = duration - 0.1 } catch {}
          }
          
          if (step === 0) {
            gsap.to(newImg, { autoAlpha: 0, duration: 0.18, ease: 'power1.out', overwrite: true })
            hideAct3UI(0)
            gsap.set([act1Ref.current, oldCalloutRef.current], { autoAlpha: 1 })
          } else if (step === 1) {
            gsap.to(lineImg, { autoAlpha: 0, duration: 0.18, ease: 'power1.out', overwrite: true })
            gsap.set(newImg, { autoAlpha: 0 })
            hideLineUI(0)
            showAct3UI(0.6)
            gsap.to(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.4, delay: 0.6, ease: 'power2.out', overwrite: true })
          } else if (step === 2) {
            gsap.to(trioImg, { autoAlpha: 0, duration: 0.18, ease: 'power1.out', overwrite: true })
            gsap.set(lineImg, { autoAlpha: 0 })
            showLineUI(0.4)
          }
        }
        
        lastTime = performance.now()
        animFrame = requestAnimationFrame(tick)
      }

      const showStaticAct1 = (exitAfter = false) => {
        const video = videoRef.current
        if (video) {
          video.pause()
          try { video.currentTime = 0 } catch(e) {}
          updateVideoScale(video)
          gsap.killTweensOf(video)
          gsap.set(video, { autoAlpha: 0, zIndex: 0 })
        }
        gsap.set([newImg, lineImg, trioImg], { autoAlpha: 0 })
        hideAct3All(true)
        hideLineAll(true)
        gsap.set(oldImg, { zIndex: 10, autoAlpha: 1, scale: 1, yPercent: 0, filter: 'blur(0px)' })
        gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
        if (exitAfter) {
          requestAnimationFrame(() => reverseIntro())
        } else {
          introTl.timeScale(1).progress(1).pause()
          gsap.set([act1Ref.current, scrimRef.current, oldCalloutRef.current], { autoAlpha: 1 })
          gsap.set(scrimRef.current, { autoAlpha: 1 })
          gsap.set(titleChars, { x: 0, autoAlpha: 1, filter: 'blur(0px)' })
          gsap.set(act1Items, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
          gsap.set(calloutLine, { scaleX: 1, transformOrigin: 'left' })
          gsap.set(calloutDot, { scale: 1, autoAlpha: 1 })
          gsap.set(calloutLabel, { x: 0, autoAlpha: 1 })
        }
      }

      const restAct3 = () => {
        const video = videoRef.current
        if (video) {
          gsap.set(video, { autoAlpha: 0, zIndex: 0 })
          try { video.currentTime = targets[1] } catch(e) {}
          updateVideoScale(video)
        }
        gsap.set(newImg, { autoAlpha: 1 })
        gsap.set([lineImg, trioImg], { autoAlpha: 0 })
        gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
        gsap.set(brandMarkRef.current, { y: 0, autoAlpha: 1, filter: 'blur(0px)' })
        showAct3UI(0)
      }

      const restLine = () => {
        const video = videoRef.current
        if (video) {
          gsap.set(video, { autoAlpha: 0, zIndex: 0 })
          try { video.currentTime = targets[2] } catch(e) {}
          updateVideoScale(video)
        }
        gsap.set(lineImg, { autoAlpha: 1 })
        gsap.set([newImg, trioImg], { autoAlpha: 0 })
        gsap.set(oldImg, { autoAlpha: 0, scale: 0.985, filter: 'blur(8px)' })
        gsap.set(brandMarkRef.current, { autoAlpha: 0, y: -18, filter: 'blur(8px)' })
        hideAct1UI(true)
        hideAct3All(true)
        showLineUI(0)
      }

      const restExit = () => {
        const video = videoRef.current
        if (video) {
          gsap.set(video, { autoAlpha: 0, zIndex: 0 })
          try { video.currentTime = targets[3] } catch(e) {}
          updateVideoScale(video)
        }
        gsap.killTweensOf([oldImg, newImg, lineImg, trioImg])
        gsap.set([oldImg, newImg, lineImg], { autoAlpha: 0 })
        hideAct1UI(true)
        hideAct3All(true)
        hideLineAll(true)
        gsap.set(trioImg, {
          autoAlpha: 1,
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 'auto',
          bottom: 'auto',
          width: '100%',
          height: '100dvh',
          zIndex: 80,
          pointerEvents: 'none',
        })
        gsap.set(brandMarkRef.current, { autoAlpha: 0 })
      }

      const finishExit = () => {
        // Ordem importa: o catálogo precisa estar preparado (branco, trio
        // full-frame) ANTES de receber o scroll, senão pisca a cor dele.
        window.dispatchEvent(new CustomEvent('aminosan:prepare-handoff-forward'))
        releaseForward()
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
        playing = false
        direction = null
        
        if (step === 1) {
          phase = 'act3'
          restAct3()
          snapToPhase()
        } else if (step === 2) {
          phase = 'line'
          window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
          restLine()
          snapToPhase()
        } else if (step === 3) {
          phase = 'exit'
          restExit()
          // finishExit já leva o scroll para o catálogo — não snapa aqui.
          finishExit()
        } else {
          phase = 'act1'
          const stageTop = stageTrigger.getBoundingClientRect().top
          showStaticAct1(stageTop > window.innerHeight * 0.24)
          snapToPhase()
        }
        lockScroll(false)
        cooldownRef.current = performance.now() + 350
      }

      /* O pin é só o trilho: segura o palco colado no topo da viewport e dá
         comprimento de scroll pra seção. Ele NÃO decide mais qual ato toca —
         era esse acoplamento que quebrava no mobile, onde um único flick
         atravessa os 3 viewports do pin em ~300ms enquanto o primeiro clipe
         sozinho leva 2,6s: as janelas de progresso dos atos 2 e 3 passavam
         batido (a guarda `!playing` as descartava) e a cena morria no ato 2,
         sem nunca disparar o handoff pro catálogo. */
      pinTrigger = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: `+=${LAST * 100}%`,
        pin: stageTrigger,
        pinSpacing: true,
        anticipatePin: 1,
        // Entrar por CIMA quer dizer "começo da história": o SectionNav salta
        // direto para #sec-origem, e numa segunda visita a máquina ainda estaria
        // parada no ato em que o usuário largou — o snap de segurança puxaria a
        // página para o pixel daquele ato, abrindo a seção pelo fim.
        onEnter: () => playIntro(false),
        onEnterBack: () => playIntro(false),
      })

      /* ── Máquina de atos dirigida por GESTO (mesmo contrato do HeroJornada)
         Um gesto = um ato — inteiro, ou virado no meio pelo gesto contrário
         (nunca parcial: as duas pontas do segmento são fases de repouso).
         Enquanto a seção está pinada o scroll nativo é cancelado, então a força
         do flick não tem para onde escapar: quem posiciona a página é o
         snapToPhase, no pixel da fase. */

      const canStep = () => !playing && !releasing && performance.now() >= cooldownRef.current

      /* Reversão em pleno voo (mesmo contrato do HeroJornada): o gesto contrário
         chegando no meio de uma transição não é engolido — vira o clipe no frame
         em que ele está e o leva de volta à outra ponta do MESMO segmento.
         Quem diz qual é essa outra ponta é `step` (o índice de destino, estável),
         nunca `phase` — `phase` é derivado do currentTime pelo updateActivePhase e
         já derivou no meio do caminho.
         O cooldown fica só no caminho a partir do repouso: virar um clipe é
         resposta imediata, e um gesto longo (vários eventos de wheel no mesmo
         sentido) vira uma única vez, porque os eventos seguintes já estão no
         mesmo sentido do clipe e caem no no-op. */
      const stepForward = () => {
        if (releasing) return
        if (playing) {
          if (direction !== 'backward') return
          const next = step + 1
          if (next > LAST) return
          step = next
          startPlayback('forward', targets[next], true)
          return
        }
        if (!canStep()) return
        const i = PHASES.indexOf(phase)
        if (i >= LAST) return
        step = i + 1
        startPlayback('forward', targets[step])
      }

      const stepBackward = () => {
        if (releasing) return
        if (playing) {
          if (direction !== 'forward') return
          const prev = step - 1
          if (prev < 0) return
          step = prev
          startPlayback('backward', targets[prev], true)
          return
        }
        if (!canStep()) return
        const i = PHASES.indexOf(phase)
        if (i <= 0) return
        step = i - 1
        startPlayback('backward', targets[step])
      }

      /* Nas duas pontas da cadeia o gesto passa direto (sem preventDefault):
         é assim que o usuário sai da seção pra cima (antes do ato 1) e pra
         baixo (depois do último ato, se voltar pro fim da cadeia). */
      const escapes = (down: boolean) =>
        !playing && ((down && phase === 'exit') || (!down && phase === 'act1'))

      /* Faixa de scroll do pin, com folga de 1px nas pontas. Usar a faixa (e não
         `pinTrigger.isActive`) importa porque as fases extremas descansam
         exatamente em `start` e em `end`, onde o isActive fica na fronteira —
         e uma fase que descansa fora do "ativo" deixaria a seção sem resposta
         ao gesto seguinte. */
      const active = () => {
        if (!pinTrigger || releasing) return false
        const y = window.scrollY
        return y >= pinTrigger.start - 1 && y <= pinTrigger.end + 1
      }

      const onWheel = (e: WheelEvent) => {
        if (!active() || Math.abs(e.deltaY) < 2) return
        if (escapes(e.deltaY > 0)) return
        if (e.cancelable) e.preventDefault()
        if (Math.abs(e.deltaY) < 8) return
        if (e.deltaY > 0) stepForward()
        else stepBackward()
      }

      const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar']
      const upKeys = ['ArrowUp', 'PageUp']
      const onKey = (e: KeyboardEvent) => {
        if (!active()) return
        const down = downKeys.includes(e.key)
        const up = upKeys.includes(e.key)
        if (!down && !up) return
        if (escapes(down)) return
        e.preventDefault()
        if (down) stepForward()
        else stepBackward()
      }

      /* Toque: o touchmove é cancelado enquanto a seção está travada — isso
         mata o momentum do iOS na origem, então não sobra rolagem inercial
         brigando com o snap. A decisão sai no touchend: passou de 30px, vale
         um ato — e um só, tenha o dedo corrido 30px ou 600px. */
      let touchY = 0
      const onTouchStart = (e: TouchEvent) => {
        touchY = e.touches[0]?.clientY ?? 0
      }
      const onTouchMove = (e: TouchEvent) => {
        if (!active()) return
        const y = e.touches[0]?.clientY ?? touchY
        const dy = touchY - y
        // Zona morta de 4px: no primeiro touchmove o dedo ainda não declarou
        // sentido. Sem isso o gesto era lido como "subindo" e escapava do
        // preventDefault, deixando alguns pixels de rolagem nativa vazarem
        // antes da trava pegar.
        if (Math.abs(dy) > 4 && escapes(dy > 0)) return
        if (e.cancelable) e.preventDefault()
      }
      const onTouchEnd = (e: TouchEvent) => {
        if (!active()) return
        const endY = e.changedTouches[0]?.clientY ?? touchY
        const dy = touchY - endY
        if (Math.abs(dy) < 30) return // mesmo limiar do HeroJornada
        if (dy > 0) stepForward()
        else stepBackward()
      }

      /* Rede de segurança para o que não passa pelos gestos (arrastar a barra
         de rolagem, âncora do menu, "localizar na página"): ao parar de rolar
         dentro do pin, volta pro pixel da fase atual. */
      let idleTimer: ReturnType<typeof setTimeout> | undefined
      const onScroll = () => {
        clearTimeout(idleTimer)
        idleTimer = setTimeout(() => {
          if (!active() || playing) return
          snapToPhase()
        }, 200)
      }

      window.addEventListener('wheel', onWheel, { passive: false, capture: true })
      window.addEventListener('keydown', onKey)
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })

      // Volta a partir do catálogo: o catálogo já preparou o frame e saltou
      // para cá. Reposiciona o scroll na fase 'exit' antes de rodar o reverso,
      // senão a fase e o pin ficam apontando para pontos diferentes da cadeia.
      const onHandoffBackward = () => {
        clearHandoffBack()
        if (playing) return
        /* O catálogo só sai para cima a partir do produto 0, que é exatamente a
           ponta 'exit' desta cadeia. Se a fase tiver derivado no caminho (um
           rebobinar do observer, um reload no meio da página), força o repouso
           'exit' em vez de desistir: desistir era o que deixava o usuário no
           início da seção sem passar pelos vídeos. */
        phase = 'exit'
        wasOutside = false
        restExit()
        snapToPhase()
        step = 2
        /* Simétrico ao passo 3 da ida: enquanto o clipe reverso roda, quem manda
           na posição da página é esta seção. O aviso desliga o `settle` do
           catálogo — sem ele, qualquer assentamento de lá puxava a página de
           volta no meio do vídeo. `stopPlayback` (step 2) dispara o `-end`. */
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-start'))
        startPlayback('backward', targets[2])
      }
      window.addEventListener('aminosan:handoff-backward', onHandoffBackward)

      // IntersectionObserver para pausar vídeos e cancelar animações quando a seção não estiver visível
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              allVideos.forEach((v) => { try { v.pause() } catch(e) {} })
              if (animFrame) cancelAnimationFrame(animFrame)
              playing = false
              direction = null
              wasOutside = true
              return
            }
            /* Rebobina a cena quando o usuário REALMENTE volta à seção depois de
               tê-la deixado (salto do SectionNav, por exemplo): sem isto ela
               reabriria no ato em que ele parou. Fica aqui, e não no onEnter do
               pin, porque o palco pinado nunca sai de vista durante os snaps
               internos — então este callback só dispara em ida e volta de
               verdade. Se um clipe já está tocando, quem manda é ele (é o caso
               da volta vinda do catálogo, que entra tocando o reverso). */
            if (wasOutside && !playing && !handoffBackPending && phase !== 'act1') {
              step = 0
              phase = 'act1'
              showStaticAct1(false)
              snapToPhase()
            }
            wasOutside = false
          })
        },
        { threshold: 0.05 },
      )
      if (root.current) observer.observe(root.current)

      // Decodifica o primeiro frame de cada vídeo sem exibi-lo (evita flash ao iniciar o play real).
      allVideos.forEach((v) => {
        v.play().then(() => { if (!playing) { v.pause(); v.currentTime = 0 } }).catch(() => {})
      })

      return () => {
        observer.disconnect()
        stIntro?.kill()
        stIntroExit?.kill()
        introTl.kill()
        pinTrigger?.kill()
        pinTrigger = null
        titleSplit?.revert()
        lineTitleSplit?.revert()
        currentTl?.kill()
        lineTl?.kill()
        if (animFrame) cancelAnimationFrame(animFrame)
        clearTimeout(idleTimer)
        lockScroll(false)

        // Limpeza dos event listeners globais
        window.dispatchEvent(new CustomEvent('aminosan:video-handoff-end'))
        clearHandoffBack()
        window.removeEventListener('aminosan:prepare-handoff-backward', onPrepareHandoffBackward)
        window.removeEventListener('aminosan:handoff-backward', onHandoffBackward)
        window.removeEventListener('wheel', onWheel, { capture: true })
        window.removeEventListener('keydown', onKey)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove', onTouchMove, { capture: true })
        window.removeEventListener('touchend', onTouchEnd)
        window.removeEventListener('scroll', onScroll)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative w-full bg-white">
      <section ref={stageRef} className="relative z-10 h-[100dvh] w-full overflow-hidden bg-white">
        {/* Vídeos da cadeia — desktop e mobile compartilham os mesmos clipes.
            Cada segmento tem um clipe forward e um reverso gravado. */}
        <video
          ref={videoRef}
          muted playsInline preload="auto"
          poster="/heritage/desktop/morph-aminosan-1-antigo.png"
          aria-label={t('videoAlt')}
          className={`${STAGE_VIDEO_CLASS} max-lg:scale-[2.8]`}
        >
          <source src="/heritage/desktop/full-transition-aminosan.mp4" type="video/mp4" />
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
        <Container className="absolute inset-0 z-30 flex h-full items-start pt-[7dvh] md:pt-0 md:items-center min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem]">
          <div ref={act1Ref} className="flex max-w-[88vw] md:max-w-[24rem] xl:max-w-[28rem] flex-col items-start bg-transparent p-0">
            <span data-a1 className="text-eyebrow mb-1 md:mb-md text-[10px] xl:text-xs uppercase tracking-[0.18em] text-primary">
              {t('eyebrow')}
            </span>
            <div>
              <BicolorTitle data-a1-title title={t('title')} titleHi={t('titleHi')} className="text-[clamp(1.35rem,5.5vw,2.25rem)] md:text-[clamp(1.75rem,3.2vw,3.75rem)]" />
            </div>
            <div data-a1 className="mt-1.5 md:mt-md xl:mt-lg max-w-[22rem] md:max-w-none">
              <p className="text-subtitle text-xs md:text-sm xl:text-base text-foreground/80 leading-snug md:leading-normal">{t('body1')}</p>
              <p className="text-subtitle mt-1 text-xs md:text-sm xl:text-base text-foreground/80 leading-snug md:leading-normal">{t('body2')}</p>
            </div>
            <span data-a1 className="text-eyebrow mt-2 md:mt-xl xl:mt-2xl text-[10px] md:text-sm xl:text-[11px] uppercase tracking-[0.16em] text-foreground/45">
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
        <Container className="relative lg:absolute lg:inset-0 z-30 flex min-h-[100dvh] lg:min-h-0 h-auto lg:h-full items-stretch md:items-center min-[1600px]:max-w-[100rem] min-[2000px]:max-w-[120rem] pointer-events-none pt-[7dvh] md:pt-0 pb-[8vh] md:pb-0">
          {/* pointer-events fica desligado: no mobile este painel é `relative`
              e cobre a tela inteira por cima do Ato 1 — ligado, virava uma
              camada invisível engolindo toque e seleção do texto do Ato 1. */}
          <div ref={leftPanelRef} className="pointer-events-none flex w-full flex-1 md:flex-none md:w-auto max-w-full md:max-w-[24rem] xl:max-w-[28rem] flex-col items-start">
            <span data-a3-tag className="text-eyebrow mb-1 md:mb-md text-[10px] xl:text-xs uppercase tracking-[0.18em] text-primary">
              {t('a3Eyebrow')}
            </span>
            <BicolorTitle data-a3-title title={t('a3Title')} titleHi={t('a3TitleHi')} className="text-[clamp(1.35rem,5.5vw,2.25rem)] md:text-[clamp(1.75rem,3.2vw,3.75rem)]" />
            <p data-a3-body className="text-subtitle mt-1.5 md:mt-md max-w-[22rem] md:max-w-none text-xs md:text-sm xl:text-base text-foreground/80 leading-snug md:leading-normal">
              {t('a3Body')}
            </p>
            <div className="mt-auto md:mt-0 flex flex-col items-start">
              <div data-a3-line className="my-2 md:my-lg h-px w-10 md:w-12 bg-primary/40" style={{ transformOrigin: 'left' }} />
              <div data-a3-stat className="flex flex-col gap-0.5">
                <span className="text-highlight text-xl md:text-3xl xl:text-4xl text-primary"><span ref={counterRef}>{t('a3StatPrefix')}10</span> {t('a3StatUnit')}</span>
                <span className="text-subtitle text-xs md:text-sm text-foreground/80">{t('a3StatLabel')}</span>
                <span className="text-[10px] md:text-[11px] text-foreground/50">{t('a3StatSource')}</span>
              </div>
            </div>
          </div>
        </Container>

        <BottleCallout refEl={newCalloutRef} eyebrow={t('a3Eyebrow')} className="max-md:!top-[26dvh] max-md:!bottom-auto">
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
      className="pointer-events-none absolute left-1/2 top-[12dvh] z-30 -translate-x-1/2 text-center max-md:top-[4dvh]"
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
      className={`aminosan-bottle-callout pointer-events-none absolute z-30 flex items-center gap-3 md:top-1/2 md:left-[65%] md:-translate-y-1/2 ${className}`}
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
