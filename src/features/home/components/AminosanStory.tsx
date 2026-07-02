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

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className="w-full aminosan-wrapper">
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
          <div ref={calloutsRef} className="flex w-full max-w-[28rem] flex-col gap-md">
            <p className="text-subtitle text-center text-foreground/80">{t('callout1')}</p>
            <p className="text-subtitle text-center text-foreground/80">{t('callout2')}</p>
            <div className="flex flex-col items-center gap-xs text-center">
              <span className="text-highlight text-2xl text-primary">{t('callout3Number')}</span>
              <span className="text-subtitle text-foreground/80">{t('callout3Label')}</span>
              <span className="text-[11px] text-foreground/50">{t('callout3Source')}</span>
            </div>
            <p className="text-subtitle text-center text-foreground/80">{t('callout4')}</p>
          </div>
          <Link href="/contato" className="text-body-regular inline-flex items-center justify-center rounded-full bg-primary px-xl py-md text-base text-white transition-colors hover:bg-primary-light">
            {t('cta')}
          </Link>
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
  const leftPanelRef    = useRef<HTMLDivElement>(null)
  const counterRef      = useRef<HTMLSpanElement>(null)

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

      const titleSplit = titleEl
        ? new SplitText(titleEl, { type: 'chars,lines' })
        : null
      const titleChars = titleSplit?.chars ?? (titleEl ? [titleEl] : [])

      // ── Estado inicial: tudo invisível
      gsap.set(videoFwd,     { autoAlpha: 0, zIndex: 1 })
      gsap.set(videoRev,     { autoAlpha: 0, zIndex: 0 })
      gsap.set(newImgRef.current, { autoAlpha: 0 })
      gsap.set(oldImg,       { scale: 1.04, autoAlpha: 1, yPercent: 100 })
      gsap.set(scrimRef.current, { autoAlpha: 0 })
      gsap.set(titleChars,   { x: 20, autoAlpha: 0, filter: 'blur(10px)' })
      gsap.set(act1Items,    { y: 14, autoAlpha: 0 })
      gsap.set(calloutLine,  { scaleY: 0 })
      gsap.set(calloutLabel, { autoAlpha: 0 })
      gsap.set(leftPanelRef.current, { autoAlpha: 0, y: 16 })
      gsap.set('[data-right-card]', { autoAlpha: 0, x: 20, y: 0 })
      if (counterRef.current) counterRef.current.innerText = "+10 a +0"

      // ── Helpers de animação
      let currentTl: gsap.core.Timeline | null = null

      const lockScroll = (on: boolean) => {
        if (on) {
          lenisRef.current?.stop()
          const sw = window.innerWidth - document.documentElement.clientWidth
          if (sw > 0) document.body.style.paddingRight = `${sw}px`
          document.documentElement.style.overflow = 'hidden'
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.paddingRight = ''
          document.documentElement.style.overflow = ''
          document.body.style.overflow = ''
          lenisRef.current?.start()
          requestAnimationFrame(() => ScrollTrigger.refresh())
        }
      }


      let stIntro: ScrollTrigger | null = null

      const introTl = gsap.timeline()
      introTl.to(scrimRef.current, { autoAlpha: 1, duration: 0.4, ease: 'none' }, 0)
      introTl.to(oldImg,           { scale: 1, yPercent: 0, duration: 0.5, ease: 'none' }, 0)
      introTl.to(titleChars,       { x: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.5, stagger: STAGGER.char, ease: 'none' }, 0.05)
      introTl.to(act1Items,        { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.05, ease: 'none' }, 0.1)
      introTl.to(calloutLine,      { scaleY: 1, duration: 0.35, transformOrigin: 'top', ease: 'none' }, 0.35)
      introTl.to(calloutLabel,     { autoAlpha: 1, duration: 0.3 }, 0.5)

      stIntro = ScrollTrigger.create({
        trigger: stageTrigger,
        start: 'top bottom',
        end: 'top top',
        // scrub:true (sem lag) — com scrub:1 a timeline "deve" progresso (inércia de
        // 1s) no exato instante em que o scroll cruza 'top top'; o onEnter mata o
        // trigger nesse instante e a entrada fica presa a meio caminho (frasco/scrim
        // somem, tela em branco) até o usuário rolar de novo. Sem lag, o progresso
        // sempre bate 1 exatamente quando o scroll chega no fim do range.
        scrub: true,
        animation: introTl,
      })

      // ScrollTrigger.kill() sem argumentos mata TAMBÉM a animation associada
      // (kill(revert, allowAnimation) — allowAnimation undefined = mata a timeline).
      // Isso desfazia o progress(1) forçado logo abaixo: a timeline renderizava o
      // frasco no lugar e, no mesmo tick, era morta e revertida — frasco e scrim
      // somem, tela em branco, até o usuário rolar de novo. `kill(false, true)`
      // mata só o ScrollTrigger e preserva a timeline (e o progress(1)) intacta.
      const killIntro = () => {
        if (!stIntro) return
        introTl.progress(1)
        stIntro.kill(false, true)
        stIntro = null
      }

      const showAct3UI = (delay = 0) => {
        currentTl?.kill()
        const tl = currentTl = gsap.timeline({ delay })
        const rightCards = gsap.utils.toArray<HTMLElement>('[data-right-card]', root.current)

        tl.to(leftPanelRef.current, { y: 0, autoAlpha: 1, duration: 0.5, ease: EASE.reveal }, 0)
        if (rightCards.length > 0) {
          tl.to(rightCards, { x: 0, y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: EASE.reveal }, 0.1)
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
      }

      const hideAct3UI = (delay = 0) => {
        currentTl?.kill()
        const tl = currentTl = gsap.timeline({ delay })
        const rightCards = gsap.utils.toArray<HTMLElement>('[data-right-card]', root.current)

        tl.to(rightCards, { x: 20, y: 0, autoAlpha: 0, duration: 0.3, stagger: 0.05, ease: EASE.micro }, 0)
        tl.to(leftPanelRef.current, { y: 16, autoAlpha: 0, duration: 0.3, ease: EASE.micro }, 0.1)

        tl.set({}, {
          onComplete: () => {
            if (counterRef.current) counterRef.current.innerText = "+10 a +0"
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
      type Phase = 'act1' | 'act3'
      let phase: Phase = 'act1'
      let direction: 'forward' | 'backward' | null = null
      let isLocked = false
      let animFrame: number | null = null
      const cooldownRef = { current: 0 }

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

      const stopPlayback = () => {
        if (animFrame) cancelAnimationFrame(animFrame)
        direction = null
        if (phase === 'act3') {
          gsap.set(videoFwd, { autoAlpha: 1 })
          gsap.set(videoRev, { autoAlpha: 0 })
          gsap.set(newImgRef.current, { autoAlpha: 1 })
          gsap.set(oldImg, { autoAlpha: 0 })
          try { videoRev.currentTime = 0 } catch(e) {}
        } else {
          gsap.set(videoFwd, { autoAlpha: 0 })
          gsap.set(videoRev, { autoAlpha: 1 })
          gsap.set(newImgRef.current, { autoAlpha: 0 })
          gsap.set(oldImg, { autoAlpha: 1 })
          try { videoFwd.currentTime = 0 } catch(e) {}
        }
        cooldownRef.current = performance.now() + 300
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
          if (videoRev.currentTime >= ((videoRev.duration > 0 && isFinite(videoRev.duration)) ? videoRev.duration : 3) - 0.1) {
            videoRev.pause()
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
            gsap.set(videoFwd, { zIndex: 1, autoAlpha: 1 })
            gsap.set(videoRev, { zIndex: 0, autoAlpha: 0 })
            gsap.set(oldImg, { autoAlpha: 0 })
            gsap.set(newImgRef.current, { autoAlpha: 0 })

            videoFwd.play().catch(() => {})

            gsap.to(titleChars, { x: 20, autoAlpha: 0, filter: 'blur(10px)', duration: fwdDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(act1Items, { y: 14, autoAlpha: 0, duration: fwdDur * 0.4, stagger: 0.05, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutLine, { scaleY: 0, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutLabel, { autoAlpha: 0, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(scrimRef.current, { autoAlpha: 0, duration: fwdDur * 0.8, ease: 'power1.inOut', overwrite: 'auto' })

            showAct3UI(fwdDur * 0.4)
            beginTick()
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
            gsap.set(videoRev, { zIndex: 1, autoAlpha: 1 })
            gsap.set(videoFwd, { zIndex: 0, autoAlpha: 0 })
            gsap.set(oldImg, { autoAlpha: 0 })
            gsap.set(newImgRef.current, { autoAlpha: 0 })

            videoRev.play().catch(() => {})

            hideAct3UI(0)

            gsap.to(titleChars, { x: 0, autoAlpha: 1, filter: 'blur(0px)', duration: fwdDur * 0.4, stagger: STAGGER.char, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(act1Items, { y: 0, autoAlpha: 1, duration: fwdDur * 0.4, stagger: 0.05, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutLine, { scaleY: 1, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(calloutLabel, { autoAlpha: 1, duration: fwdDur * 0.3, ease: 'power1.inOut', overwrite: 'auto' })
            gsap.to(scrimRef.current, { autoAlpha: 1, duration: fwdDur * 0.8, ease: 'power1.inOut', overwrite: 'auto' })

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
          // A entrada já terminou seu trabalho ao chegar aqui — matar o stIntro
          // evita que ele continue vivo reagindo à posição bruta do scroll e
          // brigando com as animações do startPlayback toda vez que o usuário
          // passar de novo por essa faixa de scroll (ex: ao voltar de baixo).
          killIntro()
          if (phase === 'act1' && !isLocked && direction !== 'forward') {
            isLocked = true
            lockScroll(true)
          }
        },
        onEnterBack: () => {
          killIntro()
          if (phase === 'act3' && !isLocked && direction !== 'backward') {
            isLocked = true
            lockScroll(true)
            startPlayback('backward')
          }
        },
        // onLeaveBack: o release() em act3 solta o scroll bem no início do estágio
        // (ele ficou travado ali a transição inteira); se o usuário reverte antes de
        // rolar a tela inteira pra baixo, ele sai por CIMA sem nunca cruzar a borda de
        // baixo — sem isto o onEnterBack acima nunca dispara e a seção fica presa no
        // Ato 3 pra sempre.
        onLeaveBack: () => {
          killIntro()
          if (phase === 'act3' && !isLocked && direction !== 'backward') {
            isLocked = true
            lockScroll(true)
            startPlayback('backward')
          }
        },
      })

      const handleForward = () => {
        if (!isLocked) return
        if (direction === 'backward') {
          startPlayback('forward')
        } else if (phase === 'act1' && direction !== 'forward' && performance.now() > cooldownRef.current) {
          startPlayback('forward')
        }
      }

      const handleBackward = () => {
        if (!isLocked) return
        if (direction === 'forward') {
          startPlayback('backward')
        } else if (phase === 'act3' && direction !== 'backward' && performance.now() > cooldownRef.current) {
          startPlayback('backward')
        }
      }

      const onWheel = (e: WheelEvent) => {
        if (!isLocked) return
        if (e.deltaY > 0) {
          if (phase === 'act3' && direction !== 'backward') { release(); return; }
        } else if (e.deltaY < 0) {
          if (phase === 'act1' && direction !== 'forward') { release(); return; }
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
        if (down && phase === 'act3' && direction !== 'backward') { release(); return; }
        if (up && phase === 'act1' && direction !== 'forward') { release(); return; }
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
          if (phase === 'act3' && direction !== 'backward') { release(); return; }
          handleForward()
        } else if (dy < -30) {
          if (phase === 'act1' && direction !== 'forward') { release(); return; }
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
        introTl.kill()
        stTop.kill()
        titleSplit?.revert()
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
      <section ref={stageRef} className="relative z-10 h-[100svh] w-full overflow-hidden bg-white">
        {/* Vídeos desktop: forward + reverso (clipe gravado ao contrário) */}
        <video
          ref={isMobile ? null : videoFwdDesktopRef}
          muted playsInline preload="auto"
          poster="/heritage/desktop/morph-aminosan-1-antigo.png"
          aria-label={t('videoAlt')}
          className="absolute inset-0 z-0 h-full w-full object-cover hidden lg:block"
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
          className="absolute inset-0 z-0 h-full w-full object-cover block lg:hidden"
        >
          <source src="/heritage/mobile/morph-aminosan.mp4" type="video/mp4" />
        </video>
        <video
          ref={isMobile ? videoRevMobileRef : null}
          muted playsInline preload="auto"
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-0 block lg:hidden"
        >
          <source src="/heritage/mobile/morph-aminosan-reverse.mp4" type="video/mp4" />
        </video>

        {/* z-10 — foto estática do frasco antigo */}
        <Image
          ref={oldImgRef}
          src={isMobile ? "/heritage/mobile/morph-aminosan-1-antigo.png" : "/heritage/desktop/morph-aminosan-1-antigo.png"}
          alt={t('oldBottleAlt')}
          fill sizes="100vw"
          className="absolute inset-0 z-10 object-cover"
          priority
        />

        {/* z-10 — foto estática do frasco novo */}
        <Image
          ref={newImgRef}
          src={isMobile ? "/heritage/mobile/morph-aminosan-2-novo.png" : "/heritage/desktop/morph-aminosan-2-novo.png"}
          alt={t('newBottleAlt')}
          fill sizes="100vw"
          className="absolute inset-0 z-10 object-cover pointer-events-none opacity-0"
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
