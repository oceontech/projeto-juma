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
import { Leaf, Dna, Sprout, ShieldCheck, BarChart3, CalendarCheck, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/features/animation/gsap'
import { useLenis } from '@/features/animation/SmoothScroll'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { StaggerGroup } from '@/features/animation/StaggerGroup'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'

type TFn = ReturnType<typeof useTranslations>

export function AminosanStory() {
  const t = useTranslations('aminosanStory')
  const reduced = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [enhancedDesktop, setEnhancedDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      setEnhancedDesktop(!mq.matches && !mobile)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (reduced) {
    return <SimpleVersion t={t} isMobile={isMobile} reduced={reduced} />
  }
  return <CinematicVersion t={t} isMobile={isMobile} />
}

/* ── SimpleVersion — mobile / reduced-motion ───────────────────────── */

function SimpleVersion({ t, isMobile, reduced }: { t: TFn; isMobile: boolean; reduced: boolean }) {
  const stageRef    = useRef<HTMLDivElement>(null)
  const oldImgRef   = useRef<HTMLImageElement>(null)
  const videoRef    = useRef<HTMLVideoElement>(null)
  const textCardRef = useRef<HTMLDivElement>(null)
  const started     = useRef(false)

  useGSAP(
    () => {
      const oldImg = oldImgRef.current
      if (!oldImg) return
      if (reduced) { gsap.set(oldImg, { scale: 1, opacity: 1 }); return }

      gsap.fromTo(oldImg, { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: EASE.reveal })

      const video = videoRef.current
      const stage = stageRef.current
      if (!video || !stage) return

      const textItems = textCardRef.current ? gsap.utils.toArray<HTMLElement>(textCardRef.current.children) : []
      gsap.set(textItems, { y: 16, opacity: 0 })

      const revertToImage = () => {
        gsap.to(video,  { opacity: 0, duration: 0.4, ease: EASE.micro })
        gsap.to(oldImg, { opacity: 1, duration: 0.4, ease: EASE.micro })
      }

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          if (started.current) return
          started.current = true
          gsap.to(oldImg,    { opacity: 0, duration: 0.3, ease: EASE.micro })
          gsap.to(video,     { opacity: 1, duration: 0.3, ease: EASE.micro })
          gsap.to(textItems, { y: 0, opacity: 1, duration: DUR.sub, stagger: STAGGER.card, ease: EASE.reveal, delay: 0.15 })
          video.currentTime = 0
          video.play().catch(revertToImage)
        },
      })
      return () => trigger.kill()
    },
    { dependencies: [reduced, isMobile], scope: stageRef },
  )

  return (
    <>
      <section ref={stageRef} className="relative h-[100svh] w-full overflow-hidden bg-white">
        <Image
          ref={oldImgRef}
          src={isMobile ? '/heritage/mobile/morph-aminosan-1-antigo.png' : '/heritage/desktop/morph-aminosan-1-antigo.png'}
          alt={t('oldBottleAlt')}
          fill sizes="100vw"
          className="object-cover"
          priority
        />
        <video
          ref={videoRef}
          key={isMobile ? 'm' : 'd'}
          muted playsInline preload="auto"
          poster={isMobile ? '/heritage/mobile/morph-aminosan-1-antigo.png' : '/heritage/desktop/morph-aminosan-1-antigo.png'}
          aria-label={t('videoAlt')}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        >
          <source src={isMobile ? '/heritage/mobile/morph-aminosan.mp4' : '/heritage/desktop/morph-aminosan.mp4'} type="video/mp4" />
        </video>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/45 to-white/80" />
        <Container className="relative z-10 flex h-full flex-col items-center justify-center px-lg text-center">
          <div ref={textCardRef} className="flex flex-col items-center gap-md rounded-3xl bg-white/65 p-xl backdrop-blur-md">
            <span className="text-eyebrow text-xs uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</span>
            <BicolorTitle title={t('title')} titleHi={t('titleHi')} className="text-[clamp(2rem,7vw,3rem)]" />
            <p className="text-subtitle max-w-[26rem] text-foreground/80">{t('body1')}</p>
            <p className="text-subtitle max-w-[26rem] text-foreground/80">{t('body2')}</p>
            {reduced && <p className="text-subtitle mt-md text-sm text-foreground/55">{t('oldBottleCaption')}</p>}
          </div>
        </Container>
      </section>

      <section className="relative bg-white">
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
          <StaggerGroup as="div" className="flex w-full max-w-[28rem] flex-col gap-md" y={16}>
            <p className="text-subtitle text-center text-foreground/80">{t('callout1')}</p>
            <p className="text-subtitle text-center text-foreground/80">{t('callout2')}</p>
            <div className="flex flex-col items-center gap-xs text-center">
              <span className="text-highlight text-2xl text-primary">{t('callout3Number')}</span>
              <span className="text-subtitle text-foreground/80">{t('callout3Label')}</span>
              <span className="text-[11px] text-foreground/50">{t('callout3Source')}</span>
            </div>
            <p className="text-subtitle text-center text-foreground/80">{t('callout4')}</p>
          </StaggerGroup>
          <Link href="/contato" className="text-body-regular inline-flex items-center justify-center rounded-full bg-primary px-xl py-md text-base text-white transition-colors hover:bg-primary-light">
            {t('cta')}
          </Link>
        </Container>
      </section>
    </>
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
  const videoRef        = useRef<HTMLVideoElement>(null)
  const videoRevRef     = useRef<HTMLVideoElement>(null)
  const oldImgRef       = useRef<HTMLImageElement>(null)
  const newImgRef       = useRef<HTMLImageElement>(null)
  const scrimRef        = useRef<HTMLDivElement>(null)
  const act1Ref         = useRef<HTMLDivElement>(null)
  const oldCalloutRef   = useRef<HTMLDivElement>(null)
  const leftPanelRef    = useRef<HTMLDivElement>(null)
  const counterRef      = useRef<HTMLSpanElement>(null)

  const lenis    = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => { lenisRef.current = lenis }, [lenis])

  useGSAP(
    () => {
      const videoFwd = videoRef.current
      const videoRev = videoRevRef.current
      const stageTrigger = isMobile ? root.current : stageRef.current
      const stageInner = stageRef.current
      const oldImg = oldImgRef.current
      if (!videoFwd || !videoRev || !stageTrigger || !stageInner || !oldImg) return

      const titleEl      = act1Ref.current?.querySelector<HTMLElement>('[data-a1-title]') ?? null
      const act1Items    = act1Ref.current ? gsap.utils.toArray<HTMLElement>('[data-a1]', act1Ref.current) : []
      const calloutLine  = oldCalloutRef.current?.querySelector<HTMLElement>('[data-line]') ?? null
      const calloutLabel = oldCalloutRef.current?.querySelector<HTMLElement>('[data-label]') ?? null

      const titleSplit = titleEl
        ? new SplitText(titleEl, { type: 'chars,lines' })
        : null
      const titleChars = titleSplit?.chars ?? (titleEl ? [titleEl] : [])

      // ── Estado inicial: tudo invisível
      gsap.set(videoFwd,     { opacity: 0, zIndex: 1 })
      gsap.set(videoRev,     { opacity: 0, zIndex: 0 })
      gsap.set(newImgRef.current, { opacity: 0 })
      gsap.set(oldImg,       { scale: 1.04, opacity: 1, yPercent: 100 })
      gsap.set(scrimRef.current, { opacity: 0 })
      gsap.set(titleChars,   { x: 20, opacity: 0, filter: 'blur(10px)' })
      gsap.set(act1Items,    { y: 14, opacity: 0 })
      gsap.set(calloutLine,  { scaleY: 0 })
      gsap.set(calloutLabel, { opacity: 0 })
      gsap.set(leftPanelRef.current, { opacity: 0, y: 16 })
      gsap.set('[data-right-card]', { opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 })
      if (counterRef.current) counterRef.current.innerText = "+10 a +0"

      // ── Helpers de animação
      let currentTl: gsap.core.Timeline | null = null

      const preventDefault = (e: Event) => { e.preventDefault() }
      const lockScroll = () => {
        window.addEventListener('wheel', preventDefault, { passive: false })
        window.addEventListener('touchmove', preventDefault, { passive: false })
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
      }
      const unlockScroll = () => {
        window.removeEventListener('wheel', preventDefault)
        window.removeEventListener('touchmove', preventDefault)
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
      }

      let stIntro: ScrollTrigger | null = null

      if (!isMobile) {
        const introTl = gsap.timeline()
        introTl.to(scrimRef.current, { opacity: 1, duration: 0.4, ease: 'none' }, 0)
        introTl.to(oldImg,           { scale: 1, yPercent: 0, duration: 0.5, ease: 'none' }, 0)
        introTl.to(titleChars,       { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, stagger: STAGGER.char, ease: 'none' }, 0.05)
        introTl.to(act1Items,        { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: 'none' }, 0.1)
        introTl.to(calloutLine,      { scaleY: 1, duration: 0.35, transformOrigin: 'top', ease: 'none' }, 0.35)
        introTl.to(calloutLabel,     { opacity: 1, duration: 0.3 }, 0.5)

        stIntro = ScrollTrigger.create({
          trigger: stageTrigger,
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
          animation: introTl,
        })
      } else {
        gsap.set(oldImg,            { yPercent: 0, scale: 1, opacity: 1 })
        gsap.set(scrimRef.current,  { opacity: 1 })
        if (titleChars.length > 0) gsap.set(titleChars, { x: 0, opacity: 1, filter: 'blur(0px)' })
        gsap.set(act1Items,         { y: 0, opacity: 1 })
        gsap.set(calloutLine,       { scaleY: 1 })
        gsap.set(calloutLabel,      { opacity: 1 })
      }

      let mobileTl: gsap.core.Timeline | undefined
      if (isMobile) {
        mobileTl = gsap.timeline()
        const rightCards = gsap.utils.toArray<HTMLElement>('[data-right-card]', root.current)

        mobileTl.to(titleChars,         { x: 20, opacity: 0, filter: 'blur(10px)', duration: 0.4 }, 0)
        mobileTl.to(act1Items,          { y: 14, opacity: 0, duration: 0.4 },                       0)
        mobileTl.to(calloutLine,        { scaleY: 0, duration: 0.3 },                               0)
        mobileTl.to(calloutLabel,       { opacity: 0, duration: 0.3 },                              0)
        mobileTl.to(scrimRef.current,   { opacity: 0, duration: 0.4 },                              0)

        mobileTl.to(newImgRef.current, { opacity: 1, duration: 0.4 }, 0.2)
        mobileTl.to(oldImg, { opacity: 0, duration: 0.2 }, 0.6)

        mobileTl.to(leftPanelRef.current, { y: 0, opacity: 1, duration: 0.4, ease: EASE.reveal }, 0.4)
        if (rightCards.length > 0) {
          mobileTl.to(rightCards, { x: 0, y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: EASE.reveal }, 0.45)
        }

        mobileTl.to({ val: 0 }, {
          val: 14,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: function() {
            if (counterRef.current) {
              counterRef.current.innerText = `+10 a +${Math.round(this.targets()[0].val)}`
            }
          }
        }, 0.4)
      }

      const showAct3UI = (delay = 0) => {
        currentTl?.kill()
        const tl = currentTl = gsap.timeline({ delay })
        const rightCards = gsap.utils.toArray<HTMLElement>('[data-right-card]', root.current)
        
        tl.to(leftPanelRef.current, { y: 0, opacity: 1, duration: 0.5, ease: EASE.reveal }, 0)
        if (rightCards.length > 0) {
          tl.to(rightCards, { x: 0, y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: EASE.reveal }, 0.1)
        }
        
        tl.to({ val: 0 }, {
          val: 14,
          duration: 1.0,
          ease: 'power2.out',
          onUpdate: function() {
            if (counterRef.current) {
              counterRef.current.innerText = `+10 a +${Math.round(this.targets()[0].val)}`
            }
          }
        }, 0.15)
        
        return tl.then()
      }

      const hideAct3UI = (delay = 0) => {
        currentTl?.kill()
        const tl = currentTl = gsap.timeline({ delay })
        const rightCards = gsap.utils.toArray<HTMLElement>('[data-right-card]', root.current)
        
        tl.to(rightCards, { x: 20, y: 0, opacity: 0, duration: 0.3, stagger: 0.05, ease: EASE.micro }, 0)
        tl.to(leftPanelRef.current, { y: 16, opacity: 0, duration: 0.3, ease: EASE.micro }, 0.1)
        
        tl.set({}, {
          onComplete: () => {
            if (counterRef.current) counterRef.current.innerText = "+10 a +0"
          }
        })
        
        return tl.then()
      }

      const playForward = () => new Promise<void>((resolve) => {
        const dur = (videoFwd.duration > 0 && isFinite(videoFwd.duration)) ? videoFwd.duration : 6
        let resolved = false
        const safeResolve = () => {
          if (resolved) return
          resolved = true
          videoFwd.removeEventListener('timeupdate', onUpdate)
          clearTimeout(timeoutId)
          resolve()
        }
        if (videoRev.currentTime > 0 && videoRev.currentTime < dur) {
          videoRev.pause()
          videoFwd.currentTime = Math.max(0, dur - videoRev.currentTime)
        } else if (videoRev.currentTime >= dur - 0.05) {
          videoFwd.currentTime = 0
        }
        if (videoFwd.currentTime >= dur - 0.05) { safeResolve(); return }
        const onUpdate = () => {
          if (phase !== 'act3') { safeResolve(); return }
          if (videoFwd.currentTime >= dur - 0.05) { videoFwd.pause(); safeResolve() }
        }
        const timeoutId = setTimeout(safeResolve, dur * 1000 + 1000)
        videoFwd.addEventListener('timeupdate', onUpdate)
        videoFwd.play().catch(safeResolve)
      })

      const playReverse = () => new Promise<void>((resolve) => {
        const dur = (videoRev.duration > 0 && isFinite(videoRev.duration)) ? videoRev.duration : 6
        let resolved = false
        const safeResolve = () => {
          if (resolved) return
          resolved = true
          videoRev.removeEventListener('timeupdate', onUpdate)
          clearTimeout(timeoutId)
          resolve()
        }
        if (videoFwd.currentTime > 0 && videoFwd.currentTime < dur) {
          videoFwd.pause()
          videoRev.currentTime = Math.max(0, dur - videoFwd.currentTime)
        } else if (videoFwd.currentTime >= dur - 0.05) {
          videoRev.currentTime = 0
        }
        if (videoRev.currentTime >= dur - 0.05) { safeResolve(); return }
        const onUpdate = () => {
          if (phase !== 'act1') { safeResolve(); return }
          if (videoRev.currentTime >= dur - 0.05) { videoRev.pause(); safeResolve() }
        }
        const timeoutId = setTimeout(safeResolve, dur * 1000 + 1000)
        videoRev.addEventListener('timeupdate', onUpdate)
        videoRev.play().catch(safeResolve)
      })

      type Phase = 'act1' | 'act3'
      let phase: Phase = 'act1'

      const goToAct3 = async () => {
        if (phase === 'act3') return
        phase = 'act3'
        const fwdDur = (videoFwd.duration > 0 && isFinite(videoFwd.duration)) ? videoFwd.duration : 3;
        gsap.set([act1Ref.current, oldCalloutRef.current], { opacity: 1 })
        gsap.to(titleChars, { x: 20, opacity: 0, filter: 'blur(10px)', duration: fwdDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut' })
        gsap.to(act1Items, { y: 14, opacity: 0, duration: fwdDur * 0.4, stagger: 0.05, ease: 'power1.inOut' })
        gsap.to(calloutLine, { scaleY: 0, duration: fwdDur * 0.3, ease: 'power1.inOut' })
        gsap.to(calloutLabel, { opacity: 0, duration: fwdDur * 0.3, ease: 'power1.inOut' })
        gsap.to(scrimRef.current, { opacity: 0, duration: fwdDur * 0.8, ease: 'power1.inOut' })
        showAct3UI(fwdDur * 0.5)
        lenisRef.current?.stop()
        lockScroll()
        gsap.set(videoFwd, { zIndex: 1, opacity: 1 })
        gsap.set(videoRev, { zIndex: 0, opacity: 0 })
        gsap.set(newImgRef.current, { opacity: 0 })
        const playPromise = playForward()
        const handleFwdPlaying = () => {
          gsap.to(oldImg, { opacity: 0, duration: 0.2, overwrite: 'auto' })
          videoFwd.removeEventListener('playing', handleFwdPlaying)
          videoFwd.removeEventListener('timeupdate', handleFwdPlaying)
        }
        videoFwd.addEventListener('playing', handleFwdPlaying)
        videoFwd.addEventListener('timeupdate', handleFwdPlaying)
        await playPromise
        lenisRef.current?.start()
        unlockScroll()
        if (phase !== 'act3') return
        gsap.set(oldImg, { opacity: 0 })
        gsap.set(newImgRef.current, { opacity: 1 })
        videoRev.currentTime = 0
      }

      const goToAct1 = async () => {
        if (phase === 'act1') return
        phase = 'act1'
        const revDur = (videoRev.duration > 0 && isFinite(videoRev.duration)) ? videoRev.duration : 3;
        hideAct3UI(0)
        let handleRevPlaying = () => {}
        gsap.set(videoRev, { zIndex: 1, opacity: 1 })
        gsap.set(videoFwd, { zIndex: 0, opacity: 0 })
        handleRevPlaying = () => {
          gsap.set(newImgRef.current, { opacity: 0 })
          videoRev.removeEventListener('playing', handleRevPlaying)
          videoRev.removeEventListener('timeupdate', handleRevPlaying)
        }
        videoRev.addEventListener('playing', handleRevPlaying)
        videoRev.addEventListener('timeupdate', handleRevPlaying)
        const playPromise = playReverse()
        lenisRef.current?.stop()
        lockScroll()
        gsap.set([act1Ref.current, oldCalloutRef.current], { opacity: 1 })
        gsap.to(titleChars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: revDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut', delay: revDur * 0.5 })
        gsap.to(act1Items, { y: 0, opacity: 1, duration: revDur * 0.4, stagger: 0.05, ease: 'power1.inOut', delay: revDur * 0.5 })
        gsap.to(calloutLine, { scaleY: 1, duration: revDur * 0.3, ease: 'power1.inOut', delay: revDur * 0.5 })
        gsap.to(calloutLabel, { opacity: 1, duration: revDur * 0.3, ease: 'power1.inOut', delay: revDur * 0.5 })
        gsap.to(scrimRef.current, { opacity: 1, duration: revDur * 0.8, ease: 'power1.inOut', delay: revDur * 0.2 })
        await playPromise
        lenisRef.current?.start()
        unlockScroll()
        if (phase !== 'act1') return
        gsap.set(newImgRef.current, { opacity: 0 })
        videoRev.removeEventListener('playing', handleRevPlaying)
        videoRev.removeEventListener('timeupdate', handleRevPlaying)
        gsap.set(oldImg, { opacity: 1 })
        gsap.set(videoRev, { opacity: 0 })
        videoFwd.currentTime = 0
      }

      const stGate = ScrollTrigger.create({
        trigger: stageTrigger,
        start: 'top top',
        end: isMobile ? 'bottom bottom' : '+=700',
        pin: !isMobile,
        scrub: isMobile ? 1 : false,
        animation: isMobile ? mobileTl : undefined,
        onUpdate: (self) => {
          if (!isMobile) {
            if (self.progress > 0.6 && phase === 'act1') {
              void goToAct3()
            } else if (self.progress < 0.6 && phase === 'act3') {
              void goToAct1()
            }
          }
        }
      })

      videoFwd.play().then(() => { videoFwd.pause(); videoFwd.currentTime = 0 }).catch(() => {})
      videoRev.play().then(() => { videoRev.pause(); videoRev.currentTime = 0 }).catch(() => {})

      return () => {
        stIntro?.kill()
        stGate.kill()
        titleSplit?.revert()
        lenisRef.current?.start()
        
        // Limpeza dos event listeners globais e restauro de scroll
        window.removeEventListener('wheel', preventDefault)
        window.removeEventListener('touchmove', preventDefault)
        document.body.style.overflow = ''
      }
    },
    { scope: root, dependencies: [isMobile] },
  )

  return (
    <div ref={root} className={isMobile ? "relative h-[150svh] w-full bg-white" : "relative w-full bg-white"}>
      <section ref={stageRef} className={`relative z-10 h-[100svh] w-full overflow-hidden bg-white ${isMobile ? 'sticky top-0' : ''}`}>
        {/* z-0 — vídeo: frame 0 = frasco antigo, frame final = frasco novo */}
        <video
          ref={videoRef}
          key={`fwd-${isMobile ? 'm' : 'd'}`}
          muted playsInline preload="auto"
          poster={isMobile ? "/heritage/mobile/morph-aminosan-1-antigo.png" : "/heritage/desktop/morph-aminosan-1-antigo.png"}
          aria-label={t('videoAlt')}
          className={`absolute inset-0 z-0 h-full w-full object-cover ${isMobile ? 'hidden opacity-0 pointer-events-none' : ''}`}
        >
          <source src={isMobile ? "/heritage/mobile/morph-aminosan.mp4" : "/heritage/desktop/morph-aminosan.mp4"} type="video/mp4" />
        </video>

        {/* z-0 — vídeo reverso: frame 0 = frasco novo, frame final = frasco antigo */}
        <video
          ref={videoRevRef}
          key={`rev-${isMobile ? 'm' : 'd'}`}
          muted playsInline preload="auto"
          aria-hidden="true"
          className={`absolute inset-0 z-0 h-full w-full object-cover opacity-0 ${isMobile ? 'hidden pointer-events-none' : ''}`}
        >
          <source src={isMobile ? "/heritage/mobile/morph-aminosan-reverse.mp4" : "/heritage/desktop/morph-aminosan-reverse.mp4"} type="video/mp4" />
        </video>

        {/* z-10 — foto estática do frasco antigo; some quando o morph começa */}
        <Image
          ref={oldImgRef}
          src={isMobile ? "/heritage/mobile/morph-aminosan-1-antigo.png" : "/heritage/desktop/morph-aminosan-1-antigo.png"}
          alt={t('oldBottleAlt')}
          fill sizes="100vw"
          className="absolute inset-0 z-10 object-cover"
          priority
        />

        {/* z-10 — foto estática do frasco novo; aparece no final do vídeo para melhor resolução */}
        <Image
          ref={newImgRef}
          src={isMobile ? "/heritage/mobile/morph-aminosan-2-novo.png" : "/heritage/desktop/morph-aminosan-2-novo.png"}
          alt={t('newBottleAlt')}
          fill sizes="100vw"
          className="absolute inset-0 z-10 object-cover opacity-0 pointer-events-none"
          priority
        />

        {/* z-20 — scrim lateral para legibilidade do Ato 1 */}
        <div ref={scrimRef} aria-hidden
          className="absolute inset-x-0 top-0 md:inset-y-0 md:left-0 z-20 w-full h-[60%] md:h-full md:max-w-[40rem] bg-gradient-to-b md:bg-gradient-to-r from-white/90 via-white/40 to-transparent"
        />

        {/* z-30 — texto do Ato 1 */}
        <Container className="relative z-30 flex h-full items-start pt-[18vh] md:pt-0 md:items-center min-[1600px]:max-w-[90rem]">
          <div ref={act1Ref} className="flex max-w-[88vw] md:max-w-[24rem] xl:max-w-[28rem] flex-col items-start bg-white/30 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-4 rounded-3xl md:p-0 md:rounded-none">
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
            <span data-a1 className="text-eyebrow mt-xl md:mt-xl xl:mt-2xl text-[9px] md:text-[10px] xl:text-[11px] uppercase tracking-[0.16em] text-foreground/45">
              {t('footerTag')}
            </span>
          </div>
        </Container>

        {/* Callout do Ato 1 */}
        <div ref={oldCalloutRef} className="absolute right-[4%] md:right-[6%] xl:right-[12%] bottom-[15vh] md:bottom-auto md:top-1/4 xl:top-1/3 z-30 flex items-start gap-2 md:gap-sm">
          <span data-line aria-hidden className="mt-[4px] md:mt-[6px] block h-6 md:h-8 xl:h-10 w-px bg-primary/50" style={{ transformOrigin: 'top' }} />
          <span data-label className="text-subtitle max-w-[6.5rem] md:max-w-[7rem] xl:max-w-[8.5rem] text-[9px] md:text-[10px] xl:text-xs text-foreground/70">
            {t('oldBottleCaption')}
          </span>
        </div>

        {/* UI do Ato 3 - Painel Esquerdo */}
        <div ref={leftPanelRef} className="absolute left-[4%] md:left-[2%] xl:left-[6%] top-[12vh] md:top-1/2 md:-translate-y-1/2 z-30 flex flex-col items-start gap-1.5 md:gap-3 xl:gap-4 w-[92%] md:w-auto md:max-w-[24rem] xl:max-w-[28rem] bg-white/85 md:bg-white/70 backdrop-blur-md rounded-[1.25rem] md:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-3 md:p-6 xl:p-8">
          <div className="flex items-center gap-1.5 md:gap-2 bg-primary/10 text-primary px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] xl:text-xs font-semibold">
            <Leaf className="w-2.5 h-2.5 md:w-3 md:h-3 xl:w-4 xl:h-4" /> Nutrição que transforma
          </div>
          <h2 className="text-2xl md:text-5xl xl:text-6xl font-black text-primary">Aminosan</h2>
          <p className="text-xs md:text-lg xl:text-xl text-foreground/80 font-medium leading-tight">
            Mais de 40 anos depois, o mesmo aminoácido, a mesma eficiência.
          </p>
          <div className="w-8 md:w-12 h-[3px] md:h-1 bg-primary/40 rounded-full my-0.5 md:my-1 xl:my-2" />
          <p className="text-[11px] md:text-sm xl:text-base text-foreground/70">
            Hoje, em oito culturas: <span className="font-bold text-primary">soja, milho, café, algodão, feijão, cítrus, tomate e batata.</span>
          </p>
          <div className="flex flex-row md:grid md:grid-cols-4 justify-between md:gap-2 xl:gap-4 mt-1 md:mt-2 xl:mt-4 w-full">
            <div className="flex flex-col items-center text-center gap-1 md:gap-1 xl:gap-2 w-[22%] md:w-auto">
              <div className="p-1 md:p-2 bg-primary/5 rounded-xl"><Dna className="w-3.5 h-3.5 md:w-5 md:h-5 xl:w-6 xl:h-6 text-primary" /></div>
              <span className="text-[7.5px] md:text-[9px] xl:text-[10px] text-foreground/70 leading-tight font-medium">Aminoácidos de alta qualidade</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 md:gap-1 xl:gap-2 w-[22%] md:w-auto">
              <div className="p-1 md:p-2 bg-primary/5 rounded-xl"><Sprout className="w-3.5 h-3.5 md:w-5 md:h-5 xl:w-6 xl:h-6 text-primary" /></div>
              <span className="text-[7.5px] md:text-[9px] xl:text-[10px] text-foreground/70 leading-tight font-medium">Maior eficiência nutricional</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 md:gap-1 xl:gap-2 w-[22%] md:w-auto">
              <div className="p-1 md:p-2 bg-primary/5 rounded-xl"><ShieldCheck className="w-3.5 h-3.5 md:w-5 md:h-5 xl:w-6 xl:h-6 text-primary" /></div>
              <span className="text-[7.5px] md:text-[9px] xl:text-[10px] text-foreground/70 leading-tight font-medium">Mais saúde e vigor para as plantas</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 md:gap-1 xl:gap-2 w-[22%] md:w-auto">
              <div className="p-1 md:p-2 bg-primary/5 rounded-xl"><BarChart3 className="w-3.5 h-3.5 md:w-5 md:h-5 xl:w-6 xl:h-6 text-primary" /></div>
              <span className="text-[7.5px] md:text-[9px] xl:text-[10px] text-foreground/70 leading-tight font-medium">Resultados comprovados no campo</span>
            </div>
          </div>
        </div>

        {/* UI do Ato 3 - Cards Direitos */}
        <div className="absolute left-0 right-0 md:left-auto md:right-[2%] xl:right-[6%] bottom-[8vh] md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-30 flex flex-row md:flex-col gap-2 md:gap-3 xl:gap-4 w-full md:w-auto overflow-x-auto md:overflow-visible px-[4%] md:px-0 snap-x hide-scrollbar pb-2 md:pb-0">
          <div data-right-card className="flex items-center gap-1.5 md:gap-3 xl:gap-4 w-[80%] md:w-auto min-w-[16rem] md:min-w-0 md:max-w-[20rem] xl:max-w-[24rem] bg-white/90 md:bg-white/70 backdrop-blur-md rounded-[1.25rem] md:rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2.5 md:p-4 xl:p-6 snap-center shrink-0">
            <div className="p-1.5 md:p-2 xl:p-3 bg-primary/10 rounded-xl md:rounded-2xl shrink-0"><CalendarCheck className="w-4 h-4 md:w-6 md:h-6 xl:w-8 xl:h-8 text-primary" /></div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <span className="text-highlight text-lg md:text-2xl xl:text-3xl text-primary font-bold"><span ref={counterRef}>+10 a +0</span> sc/ha</span>
              <span className="text-[9px] md:text-xs xl:text-sm text-foreground/80 leading-tight">Na soja, 10 a 14 sacas a mais por hectare em ensaios.</span>
              <span className="text-[7.5px] md:text-[9px] xl:text-[10px] text-foreground/50 mt-0.5 md:mt-1 leading-tight">Fonte: Resultados internos (2011) | Certificado (UFLA) e Embrapa Cerrados (2015)</span>
            </div>
          </div>
          
          <div data-right-card className="flex items-center gap-1.5 md:gap-3 xl:gap-4 w-[80%] md:w-auto min-w-[16rem] md:min-w-0 md:max-w-[20rem] xl:max-w-[24rem] bg-white/90 md:bg-white/70 backdrop-blur-md rounded-[1.25rem] md:rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2.5 md:p-4 xl:p-6 snap-center shrink-0">
            <div className="p-1.5 md:p-2 xl:p-3 bg-primary/10 rounded-xl md:rounded-2xl shrink-0"><Sprout className="w-4 h-4 md:w-6 md:h-6 xl:w-8 xl:h-8 text-primary" /></div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <span className="text-[11px] md:text-sm xl:text-base text-foreground/80 leading-tight">E hoje, uma linha inteira traz produtos, do <span className="font-bold text-primary">plantio à colheita.</span></span>
            </div>
          </div>

          <div data-right-card className="flex items-center gap-1.5 md:gap-3 xl:gap-4 w-[80%] md:w-auto min-w-[16rem] md:min-w-0 md:max-w-[20rem] xl:max-w-[24rem] bg-white/90 md:bg-white/70 backdrop-blur-md rounded-[1.25rem] md:rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2.5 md:p-4 xl:p-6 snap-center shrink-0">
            <div className="p-1.5 md:p-2 xl:p-3 bg-primary/10 rounded-xl md:rounded-2xl shrink-0"><Users className="w-4 h-4 md:w-6 md:h-6 xl:w-8 xl:h-8 text-primary" /></div>
            <div className="flex flex-col gap-0.5 md:gap-1">
              <span className="text-[11px] md:text-sm xl:text-base text-foreground/80 leading-tight">Confiança que vem do campo e gera <span className="font-bold text-primary">resultados.</span></span>
            </div>
          </div>
        </div>
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
