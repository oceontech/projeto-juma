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

  if (!enhancedDesktop) {
    return <SimpleVersion t={t} isMobile={isMobile} reduced={reduced} />
  }
  return <CinematicVersion t={t} />
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
    { dependencies: [reduced], scope: stageRef },
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

function CinematicVersion({ t }: { t: TFn }) {
  const root            = useRef<HTMLElement>(null)
  const videoRef        = useRef<HTMLVideoElement>(null)
  const oldImgRef       = useRef<HTMLImageElement>(null)
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
      const video  = videoRef.current
      const stage  = root.current
      const oldImg = oldImgRef.current
      if (!video || !stage || !oldImg) return

      const titleEl      = act1Ref.current?.querySelector<HTMLElement>('[data-a1-title]') ?? null
      const act1Items    = act1Ref.current ? gsap.utils.toArray<HTMLElement>('[data-a1]', act1Ref.current) : []
      const calloutLine  = oldCalloutRef.current?.querySelector<HTMLElement>('[data-line]') ?? null
      const calloutLabel = oldCalloutRef.current?.querySelector<HTMLElement>('[data-label]') ?? null

      const titleSplit = titleEl
        ? new SplitText(titleEl, { type: 'lines', mask: 'lines', linesClass: 'overflow-hidden' })
        : null
      const titleLines = titleSplit?.lines ?? (titleEl ? [titleEl] : [])

      // ── Estado inicial: tudo invisível
      gsap.set(oldImg,       { scale: 1.04, opacity: 0 })
      gsap.set(titleLines,   { yPercent: 110 })
      gsap.set(act1Items,    { y: 14, opacity: 0 })
      gsap.set(calloutLine,  { scaleY: 0 })
      gsap.set(calloutLabel, { opacity: 0 })
      gsap.set(leftPanelRef.current, { opacity: 0, y: 16 })
      gsap.set('[data-right-card]', { opacity: 0, x: 20 })
      if (counterRef.current) counterRef.current.innerText = "+10 a +0"

      // ── Helpers de animação (retornam Promise para encadear com await)

      const showAct1 = () => {
        const tl = gsap.timeline()
        tl.to(scrimRef.current, { opacity: 1,                duration: 0.4,                          ease: EASE.reveal }, 0)
        tl.to(oldImg,           { scale: 1, opacity: 1,      duration: 0.5,                          ease: EASE.reveal }, 0)
        tl.to(titleLines,       { yPercent: 0,               duration: 0.5, stagger: 0.05,           ease: EASE.reveal }, 0.05)
        tl.to(act1Items,        { y: 0, opacity: 1,          duration: 0.45, stagger: 0.05,          ease: EASE.reveal }, 0.1)
        tl.to(calloutLine,      { scaleY: 1,                 duration: 0.35, transformOrigin: 'top', ease: EASE.reveal }, 0.35)
        tl.to(calloutLabel,     { opacity: 1,                duration: 0.3                                             }, 0.5)
        return tl.then()
      }

      const hideAct1 = () => {
        const tl = gsap.timeline()
        tl.to(
          [act1Ref.current, oldCalloutRef.current, scrimRef.current, oldImg],
          { opacity: 0, duration: 0.35, ease: EASE.micro },
          0,
        )
        return tl.then()
      }

      const showAct3 = () => {
        const tl = gsap.timeline()
        const rightCards = gsap.utils.toArray<HTMLElement>('[data-right-card]', root.current)
        
        // Left panel
        tl.to(leftPanelRef.current, { y: 0, opacity: 1, duration: 0.5, ease: EASE.reveal })
        
        // Card 1
        if (rightCards[0]) {
          tl.to(rightCards[0], { x: 0, opacity: 1, duration: 0.5, ease: EASE.reveal }, 0.2)
        }
        
        // Counter animation
        tl.to({ val: 0 }, {
          val: 14,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: function() {
            if (counterRef.current) {
              counterRef.current.innerText = `+10 a +${Math.round(this.targets()[0].val)}`
            }
          }
        }, '+=0.1')
        
        // Card 2
        if (rightCards[1]) {
          tl.to(rightCards[1], { x: 0, opacity: 1, duration: 0.5, ease: EASE.reveal }, '+=0.1')
        }
        
        // Card 3
        if (rightCards[2]) {
          tl.to(rightCards[2], { x: 0, opacity: 1, duration: 0.5, ease: EASE.reveal }, '+=0.2')
        }
        
        return tl.then()
      }

      const hideAct3 = () => {
        const tl = gsap.timeline()
        const rightCards = gsap.utils.toArray<HTMLElement>('[data-right-card]', root.current)
        
        tl.to(rightCards, { x: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: EASE.micro }, 0)
        tl.to(leftPanelRef.current, { y: 16, opacity: 0, duration: 0.3, ease: EASE.micro }, 0)
        
        // Crossfade simultâneo: oldImg e scrim cobrem o vídeo enquanto act3 some
        tl.to(scrimRef.current, { opacity: 1, duration: 0.45, ease: EASE.reveal }, 0)
        tl.to(oldImg,           { opacity: 1, duration: 0.5,  ease: EASE.reveal }, 0)
        
        tl.set({}, {
          onComplete: () => {
            if (counterRef.current) counterRef.current.innerText = "+10 a +0"
          }
        })
        
        return tl.then()
      }

      // Forward: play nativo — sempre fluido (decodificação progressiva)
      const playForward = () => new Promise<void>((resolve) => {
        const dur = (video.duration > 0 && isFinite(video.duration)) ? video.duration : 6
        if (video.currentTime >= dur - 0.05) { resolve(); return }
        const onUpdate = () => {
          if (video.currentTime >= dur - 0.05) {
            video.removeEventListener('timeupdate', onUpdate)
            video.pause()
            resolve()
          }
        }
        video.addEventListener('timeupdate', onUpdate)
        video.play().catch(resolve)
      })

      // ── Máquina de estados
      type Phase = 'act1' | 'act3'
      let phase: Phase = 'act1'
      let busy = false
      let cooldown = false

      const lockScroll = (on: boolean) => {
        if (on) {
          lenisRef.current?.stop()
        } else {
          lenisRef.current?.start()
          // Full refresh after unlock so pin spacers and all trigger start/end
          // positions are recalculated correctly (update() only syncs scroll pos).
          requestAnimationFrame(() => ScrollTrigger.refresh())
        }
      }

      const goToAct3 = async () => {
        if (busy || phase === 'act3') return
        busy = true
        lockScroll(true)
        await hideAct1()
        await playForward()
        await showAct3()
        phase = 'act3'
        busy = false
        lockScroll(false)
      }

      const goToAct1 = async () => {
        if (busy || phase === 'act1') return
        busy = true
        lockScroll(true)
        // hideAct3 já faz crossfade para oldImg — nenhum scrubbing de vídeo visível
        await hideAct3()
        // Reset do vídeo em background (coberto pela oldImg)
        if (!video.paused) video.pause()
        video.currentTime = 0
        // Restaura containers e reseta filhos para estado pré-animação
        gsap.set([act1Ref.current, oldCalloutRef.current], { opacity: 1 })
        gsap.set(titleLines,   { yPercent: 110 })
        gsap.set(act1Items,    { y: 14, opacity: 0 })
        gsap.set(calloutLine,  { scaleY: 0 })
        gsap.set(calloutLabel, { opacity: 0 })
        await showAct1()
        phase = 'act1'
        busy = false
        // Cooldown evita re-disparo imediato do onEnter ao desbloquear
        cooldown = true
        lockScroll(false)
        setTimeout(() => { cooldown = false }, 600)
      }

      // Trigger de entrada na viewport: revela o Ato 1 uma única vez
      const stReveal = ScrollTrigger.create({
        trigger: stage,
        start: 'top 75%',
        once: true,
        onEnter: () => { void showAct1() },
      })

      // Trigger principal: portões da seção (sem pin — o scroll é travado no JS)
      const stGate = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        onEnter:    () => { if (!cooldown) void goToAct3() },
        onLeaveBack: () => { if (!cooldown) void goToAct1() },
      })

      // Força decodificação inicial para o primeiro play ser instantâneo
      video.play().then(() => { video.pause(); video.currentTime = 0 }).catch(() => {})

      return () => {
        lockScroll(false)
        stReveal.kill()
        stGate.kill()
        titleSplit?.revert()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative z-10 h-[100svh] w-full overflow-hidden bg-white">
      {/* z-0 — vídeo: frame 0 = frasco antigo, frame final = frasco novo */}
      <video
        ref={videoRef}
        muted playsInline preload="auto"
        poster="/heritage/desktop/morph-aminosan-1-antigo.png"
        aria-label={t('videoAlt')}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/heritage/desktop/morph-aminosan.mp4" type="video/mp4" />
      </video>

      {/* z-10 — foto estática do frasco antigo; some quando o morph começa */}
      <Image
        ref={oldImgRef}
        src="/heritage/desktop/morph-aminosan-1-antigo.png"
        alt={t('oldBottleAlt')}
        fill sizes="100vw"
        className="absolute inset-0 z-10 object-cover"
        priority
      />

      {/* z-20 — scrim lateral para legibilidade do Ato 1 */}
      <div ref={scrimRef} aria-hidden
        className="absolute inset-y-0 left-0 z-20 w-full max-w-[40rem] bg-gradient-to-r from-white/75 via-white/20 to-transparent"
      />

      {/* z-30 — texto do Ato 1 */}
      <Container className="relative z-30 flex h-full items-center min-[1600px]:max-w-[90rem]">
        <div ref={act1Ref} className="flex max-w-[24rem] xl:max-w-[28rem] flex-col items-start">
          <span data-a1 className="text-eyebrow mb-md text-[10px] xl:text-xs uppercase tracking-[0.18em] text-primary">
            {t('eyebrow')}
          </span>
          <div>
            <BicolorTitle data-a1-title title={t('title')} titleHi={t('titleHi')} className="text-[clamp(1.75rem,3.2vw,3.75rem)]" />
          </div>
          <div data-a1 className="mt-md xl:mt-lg">
            <p className="text-subtitle text-sm xl:text-base text-foreground/80">{t('body1')}</p>
            <p className="text-subtitle mt-sm text-sm xl:text-base text-foreground/80">{t('body2')}</p>
          </div>
          <span data-a1 className="text-eyebrow mt-xl xl:mt-2xl text-[10px] xl:text-[11px] uppercase tracking-[0.16em] text-foreground/45">
            {t('footerTag')}
          </span>
        </div>
      </Container>

      {/* Callout do Ato 1 */}
      <div ref={oldCalloutRef} className="absolute right-[6%] xl:right-[12%] top-1/4 xl:top-1/3 z-30 flex items-start gap-sm">
        <span data-line aria-hidden className="mt-[6px] block h-8 xl:h-10 w-px bg-primary/50" style={{ transformOrigin: 'top' }} />
        <span data-label className="text-subtitle max-w-[7rem] xl:max-w-[8.5rem] text-[10px] xl:text-xs text-foreground/70">
          {t('oldBottleCaption')}
        </span>
      </div>

      {/* UI do Ato 3 - Painel Esquerdo */}
      <div ref={leftPanelRef} className="absolute left-[2%] xl:left-[6%] top-1/2 -translate-y-1/2 z-30 flex flex-col items-start gap-3 xl:gap-4 max-w-[24rem] xl:max-w-[28rem] bg-white/70 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 xl:p-8">
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] xl:text-xs font-semibold">
          <Leaf className="w-3 h-3 xl:w-4 xl:h-4" /> Nutrição que transforma
        </div>
        <h2 className="text-5xl xl:text-6xl font-black text-primary">Aminosan</h2>
        <p className="text-lg xl:text-xl text-foreground/80 font-medium leading-tight">
          Mais de 40 anos depois, o mesmo aminoácido, a mesma eficiência.
        </p>
        <div className="w-12 h-1 bg-primary/40 rounded-full my-1 xl:my-2" />
        <p className="text-sm xl:text-base text-foreground/70">
          Hoje, em oito culturas: <span className="font-bold text-primary">soja, milho, café, algodão, feijão, cítrus, tomate e batata.</span>
        </p>
        <div className="grid grid-cols-4 gap-2 xl:gap-4 mt-2 xl:mt-4 w-full">
          <div className="flex flex-col items-center text-center gap-1 xl:gap-2">
            <div className="p-2 bg-primary/5 rounded-xl"><Dna className="w-5 h-5 xl:w-6 xl:h-6 text-primary" /></div>
            <span className="text-[9px] xl:text-[10px] text-foreground/70 leading-tight font-medium">Aminoácidos de alta qualidade</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1 xl:gap-2">
            <div className="p-2 bg-primary/5 rounded-xl"><Sprout className="w-5 h-5 xl:w-6 xl:h-6 text-primary" /></div>
            <span className="text-[9px] xl:text-[10px] text-foreground/70 leading-tight font-medium">Maior eficiência nutricional</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1 xl:gap-2">
            <div className="p-2 bg-primary/5 rounded-xl"><ShieldCheck className="w-5 h-5 xl:w-6 xl:h-6 text-primary" /></div>
            <span className="text-[9px] xl:text-[10px] text-foreground/70 leading-tight font-medium">Mais saúde e vigor para suas plantas</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1 xl:gap-2">
            <div className="p-2 bg-primary/5 rounded-xl"><BarChart3 className="w-5 h-5 xl:w-6 xl:h-6 text-primary" /></div>
            <span className="text-[9px] xl:text-[10px] text-foreground/70 leading-tight font-medium">Resultados comprovados no campo</span>
          </div>
        </div>
      </div>

      {/* UI do Ato 3 - Cards Direitos */}
      <div className="absolute right-[2%] xl:right-[6%] top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 xl:gap-4">
        <div data-right-card className="flex items-center gap-3 xl:gap-4 max-w-[20rem] xl:max-w-[24rem] bg-white/70 backdrop-blur-md rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 xl:p-6">
          <div className="p-2 xl:p-3 bg-primary/10 rounded-2xl shrink-0"><CalendarCheck className="w-6 h-6 xl:w-8 xl:h-8 text-primary" /></div>
          <div className="flex flex-col gap-1">
            <span className="text-highlight text-2xl xl:text-3xl text-primary font-bold"><span ref={counterRef}>+10 a +0</span> sc/ha</span>
            <span className="text-xs xl:text-sm text-foreground/80 leading-tight">Na soja, 10 a 14 sacas a mais por hectare em ensaios.</span>
            <span className="text-[9px] xl:text-[10px] text-foreground/50 mt-1 leading-tight">Fonte: Resultados internos (2011) | Certificado (UFLA) e Embrapa Cerrados (2015)</span>
          </div>
        </div>
        
        <div data-right-card className="flex items-center gap-3 xl:gap-4 max-w-[20rem] xl:max-w-[24rem] bg-white/70 backdrop-blur-md rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 xl:p-6">
          <div className="p-2 xl:p-3 bg-primary/10 rounded-2xl shrink-0"><Sprout className="w-6 h-6 xl:w-8 xl:h-8 text-primary" /></div>
          <div className="flex flex-col gap-1">
            <span className="text-sm xl:text-base text-foreground/80 leading-tight">E hoje, uma linha inteira traz produtos, do <span className="font-bold text-primary">plantio à colheita.</span></span>
          </div>
        </div>

        <div data-right-card className="flex items-center gap-3 xl:gap-4 max-w-[20rem] xl:max-w-[24rem] bg-white/70 backdrop-blur-md rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 xl:p-6">
          <div className="p-2 xl:p-3 bg-primary/10 rounded-2xl shrink-0"><Users className="w-6 h-6 xl:w-8 xl:h-8 text-primary" /></div>
          <div className="flex flex-col gap-1">
            <span className="text-sm xl:text-base text-foreground/80 leading-tight">Confiança que vem do campo e gera <span className="font-bold text-primary">resultados.</span></span>
          </div>
        </div>
      </div>

      
    </section>
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
