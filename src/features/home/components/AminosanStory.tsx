'use client'

/**
 * "A transformação do Aminosan" — depois de OurStory. Filme em 3 atos, foto/vídeo
 * sempre full-bleed (cobrindo a tela toda) com o texto sobreposto por cima,
 * mesma linguagem visual da HeroJornada: Ato 1 (1988, frasco antigo) → Ato 2
 * (morph) → Ato 3 (frasco atual + callouts).
 *
 * Desktop: ScrollTrigger nativo com `pin: true, scrub: true` — a seção fica
 * pinada por uma distância de scroll e o progresso (0→1) dirige tudo: a
 * entrada do Ato 1, o `video.currentTime` do morph e o reveal do Ato 3, todos
 * na mesma timeline. Por ser scrub (não wheel/touch manual), o reverso é de
 * graça — basta rolar pra cima que a timeline anda pra trás — e um refresh no
 * meio da seção já nasce no progresso certo, sem reconciliação manual.
 *
 * O vídeo já É o frasco antigo no frame 0 e o frasco novo no frame final —
 * por isso não há crossfade pra uma imagem separada no fim; o Ato 3 só
 * revela os callouts sobre o último frame do próprio vídeo, pausado.
 *
 * Mobile + reduced-motion: dois blocos full-bleed em fluxo normal, ver
 * `SimpleVersion`.
 */
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/features/animation/gsap'
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

/* ── Versão mobile / reduced-motion: dois blocos full-bleed, sem pin ─── */

function SimpleVersion({ t, isMobile, reduced }: { t: TFn; isMobile: boolean; reduced: boolean }) {
  const stageRef  = useRef<HTMLDivElement>(null)
  const oldImgRef = useRef<HTMLImageElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const textCardRef = useRef<HTMLDivElement>(null)
  const started   = useRef(false)

  // Autoplay-once do morph quando o frasco entra na viewport (sem scrub — mais
  // barato em telas pequenas, conforme o briefing). O vídeo termina no frasco
  // novo sozinho (último frame = frasco novo); não há troca pra imagem depois.
  // Só volta pra imagem antiga se o autoplay falhar (política do navegador).
  useGSAP(
    () => {
      const oldImg = oldImgRef.current
      const textCard = textCardRef.current
      if (!oldImg) return
      if (reduced) {
        gsap.set(oldImg, { scale: 1, opacity: 1 })
        return
      }
      gsap.fromTo(oldImg, { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: EASE.reveal })

      const video = videoRef.current
      const stage = stageRef.current
      if (!video || !stage) return

      // Texto entra com o mesmo gatilho do morph: nasce abaixo do fold, então
      // só revela quando o usuário rola até a seção (sem disparo a destempo).
      const textItems = textCard ? gsap.utils.toArray<HTMLElement>(textCard.children) : []
      gsap.set(textItems, { y: 16, opacity: 0 })

      const revertToImage = () => {
        gsap.to(video, { opacity: 0, duration: 0.4, ease: EASE.micro })
        gsap.to(oldImg, { opacity: 1, duration: 0.4, ease: EASE.micro })
      }

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          if (started.current) return
          started.current = true
          gsap.to(oldImg, { opacity: 0, duration: 0.3, ease: EASE.micro })
          gsap.to(video, { opacity: 1, duration: 0.3, ease: EASE.micro })
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
      {/* Ato 1 + Ato 2 — full-bleed; o vídeo termina sozinho no frasco novo */}
      <section ref={stageRef} className="relative h-[100svh] w-full overflow-hidden bg-white">
        <Image
          ref={oldImgRef}
          src={isMobile ? '/heritage/mobile/morph-aminosan-1-antigo.png' : '/heritage/desktop/morph-aminosan-1-antigo.png'}
          alt={t('oldBottleAlt')}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          poster={isMobile ? '/heritage/mobile/morph-aminosan-1-antigo.png' : '/heritage/desktop/morph-aminosan-1-antigo.png'}
          aria-label={t('videoAlt')}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        >
          <source src={isMobile ? '/heritage/mobile/morph-aminosan.mp4' : '/heritage/desktop/morph-aminosan.mp4'} type="video/mp4" />
        </video>

        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/45 to-white/80" />

        <Container className="relative z-10 flex h-full flex-col items-center justify-center px-lg text-center">
          <div
            ref={textCardRef}
            className="flex flex-col items-center gap-md rounded-3xl bg-white/65 p-xl backdrop-blur-md"
          >
            <span className="text-eyebrow text-xs uppercase tracking-[0.18em] text-primary">{t('eyebrow')}</span>
            <BicolorTitle title={t('title')} titleHi={t('titleHi')} className="text-[clamp(2rem,7vw,3rem)]" />
            <p className="text-subtitle max-w-[26rem] text-foreground/80">{t('body1')}</p>
            <p className="text-subtitle max-w-[26rem] text-foreground/80">{t('body2')}</p>
            {reduced && (
              <p className="text-subtitle mt-md text-sm text-foreground/55">{t('oldBottleCaption')}</p>
            )}
          </div>
        </Container>
      </section>

      {/* Ato 3 — frasco novo em faixa full-bleed; callouts + CTA em fluxo normal
          abaixo (não sobrepostos: travava em telas com pouca altura). */}
      <section className="relative bg-white">
        <div className="relative h-[70vh] w-full overflow-hidden sm:h-[75vh]">
          <Image
            src={isMobile ? '/heritage/mobile/morph-aminosan-2-novo.png' : '/heritage/desktop/morph-aminosan-2-novo.png'}
            alt={t('newBottleAlt')}
            fill
            sizes="100vw"
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

          <Link
            href="/contato"
            className="text-body-regular inline-flex items-center justify-center rounded-full bg-primary px-xl py-md text-base text-white transition-colors hover:bg-primary-light"
          >
            {t('cta')}
          </Link>
        </Container>
      </section>
    </>
  )
}

/* ── Versão desktop: mesma mecânica de wheel/touch da HeroJornada ──── */

/** Início do reveal do Ato 3, em fração do progresso total da timeline (0–1). */
const ACT3_START = 0.86

function CinematicVersion({ t }: { t: TFn }) {
  const root      = useRef<HTMLElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const oldImgRef = useRef<HTMLImageElement>(null)
  const scrimRef  = useRef<HTMLDivElement>(null)

  const act1Ref      = useRef<HTMLDivElement>(null)
  const oldCalloutRef = useRef<HTMLDivElement>(null)
  const ctaRef        = useRef<HTMLDivElement>(null)
  const calloutTopRef    = useRef<HTMLDivElement>(null)
  const calloutLeftRef   = useRef<HTMLDivElement>(null)
  const calloutRightRef  = useRef<HTMLDivElement>(null)
  const calloutBottomRef = useRef<HTMLDivElement>(null)

  const [showAct3, setShowAct3] = useState(false)
  const showAct3Ref = useRef(false)

  // ── Timeline única pinada: progresso de scroll (0→1) dirige a entrada do
  // Ato 1, o currentTime do vídeo (morph) e o reveal do Ato 3 — tudo no mesmo
  // lugar, então forward/backward e refresh-no-meio funcionam de graça (é só
  // a posição da timeline, GSAP recalcula sozinho).
  useGSAP(
    () => {
      const video = videoRef.current
      const stage = root.current
      const oldImg = oldImgRef.current
      if (!video || !stage || !oldImg) return

      const titleEl      = act1Ref.current?.querySelector<HTMLElement>('[data-a1-title]') ?? null
      const act1Items    = act1Ref.current ? gsap.utils.toArray<HTMLElement>('[data-a1]', act1Ref.current) : []
      const calloutLine  = oldCalloutRef.current?.querySelector<HTMLElement>('[data-line]') ?? null
      const calloutLabel = oldCalloutRef.current?.querySelector<HTMLElement>('[data-label]') ?? null
      const act3Els = [calloutTopRef.current, calloutLeftRef.current, calloutRightRef.current, calloutBottomRef.current]
        .filter(Boolean) as HTMLElement[]
      const cta = ctaRef.current

      const titleSplit = titleEl
        ? new SplitText(titleEl, { type: 'lines', mask: 'lines', linesClass: 'overflow-hidden' })
        : null
      const titleLines = titleSplit ? titleSplit.lines : titleEl ? [titleEl] : []

      // Estado inicial (antes da seção entrar em cena)
      gsap.set(oldImg,       { scale: 1.04, opacity: 0 })
      gsap.set(titleLines,   { yPercent: 110 })
      gsap.set(act1Items,    { y: 14, opacity: 0 })
      gsap.set(calloutLine,  { scaleY: 0 })
      gsap.set(calloutLabel, { opacity: 0 })
      gsap.set(cta,          { opacity: 0, y: 16, pointerEvents: 'none' })
      act3Els.forEach((el) => {
        const line  = el.querySelector('[data-line]')
        const label = el.querySelector('[data-label]')
        if (line)  gsap.set(line, { scaleX: 0, scaleY: 0 })
        if (label) gsap.set(label, { opacity: 0 })
      })

      let st: ReturnType<typeof ScrollTrigger.create> | null = null

      const build = () => {
        const videoProgress = { t: 0 }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => '+=' + Math.round(window.innerHeight * 2.6),
            pin: true,
            scrub: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const show = self.progress >= ACT3_START
              if (show !== showAct3Ref.current) {
                showAct3Ref.current = show
                setShowAct3(show)
              }
            },
          },
        })
        st = tl.scrollTrigger ?? null

        // 0 → 0.18 — entrada do Ato 1 (frasco antigo + título + texto + callout)
        tl.to(oldImg,       { scale: 1, opacity: 1, duration: 0.16, ease: EASE.reveal }, 0)
        tl.to(titleLines,   { yPercent: 0, duration: 0.16, stagger: 0.02, ease: EASE.reveal }, 0.02)
        tl.to(act1Items,    { y: 0, opacity: 1, duration: 0.12, stagger: 0.02, ease: EASE.reveal }, 0.06)
        tl.to(calloutLine,  { scaleY: 1, duration: 0.08, transformOrigin: 'top' }, 0.1)
        tl.to(calloutLabel, { opacity: 1, duration: 0.08 }, 0.12)

        // 0.2 → 0.8 — scrub do morph: vídeo já visível (frame 0 = frasco antigo,
        // idêntico à imagem estática) por baixo; some assim que o scrub começa
        tl.to(oldImg, { opacity: 0, duration: 0.04, ease: EASE.micro }, 0.2)
        tl.to(videoProgress, {
          t: 1,
          duration: 0.6,
          ease: 'none',
          onUpdate: () => { 
            try { 
              const dur = video.duration > 0 ? video.duration : 6.0;
              video.currentTime = videoProgress.t * dur;
            } catch {} 
          },
        }, 0.2)

        // saída do Ato 1 acompanhando o morph
        tl.to([act1Ref.current, oldCalloutRef.current, scrimRef.current], { opacity: 0, duration: 0.12, ease: EASE.micro }, 0.55)

        // ACT3_START → 1 — reveal do Ato 3 (callouts orbitando + CTA)
        act3Els.forEach((el, i) => {
          const pos = ACT3_START + i * 0.025
          const line  = el.querySelector('[data-line]')
          const label = el.querySelector('[data-label]')
          if (line)  tl.to(line, { scaleX: 1, scaleY: 1, duration: 0.04, ease: EASE.reveal }, pos)
          if (label) tl.to(label, { opacity: 1, duration: 0.04, ease: EASE.reveal }, pos + 0.01)
        })
        tl.set(cta, { pointerEvents: 'auto' }, ACT3_START + 0.06)
        tl.to(cta, { opacity: 1, y: 0, duration: 0.06, ease: EASE.reveal }, ACT3_START + 0.06)
      }

      // Constrói a timeline imediatamente para garantir o pin.
      // Usa um gatilho precoce para forçar o carregamento do vídeo antes de chegar na seção.
      build()
      
      ScrollTrigger.create({
        trigger: stage,
        start: 'top bottom', // Quando o topo da seção entra na base da tela
        once: true,
        onEnter: () => {
          if (video.readyState < 2) {
            video.play().then(() => video.pause()).catch(() => {})
          }
        }
      })

      return () => {
        st?.kill()
        titleSplit?.revert()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative h-[100svh] w-full overflow-hidden bg-white">
      {/* z-0 — vídeo full-bleed: frame 0 = frasco antigo, frame final = frasco novo */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster="/heritage/desktop/morph-aminosan-1-antigo.png"
        aria-label={t('videoAlt')}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/heritage/desktop/morph-aminosan.mp4" type="video/mp4" />
      </video>

      {/* z-10 — imagem do frasco antigo: paint instantâneo enquanto o vídeo
          carrega; some assim que o scrub do morph começa (tween na timeline). */}
      <Image
        ref={oldImgRef}
        src="/heritage/desktop/morph-aminosan-1-antigo.png"
        alt={t('oldBottleAlt')}
        fill
        sizes="100vw"
        className="absolute inset-0 z-10 object-cover"
        priority
      />

      {/* z-20 — scrim sutil, só na faixa onde o texto do Ato 1 fica por cima */}
      <div
        ref={scrimRef}
        aria-hidden
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

      {/* Callout do Ato 1: à direita, sobre a foto do frasco antigo */}
      <div ref={oldCalloutRef} className="absolute right-[6%] xl:right-[12%] top-1/4 xl:top-1/3 z-30 flex items-start gap-sm">
        <span data-line aria-hidden className="mt-[6px] block h-8 xl:h-10 w-px bg-primary/50" style={{ transformOrigin: 'top' }} />
        <span data-label className="text-subtitle max-w-[7rem] xl:max-w-[8.5rem] text-[10px] xl:text-xs text-foreground/70">
          {t('oldBottleCaption')}
        </span>
      </div>

      {/* Callouts do Ato 3: orbitando o frasco novo, revelados no fim do morph */}
      <Callout refEl={calloutTopRef} side="top" show={showAct3} className="left-[65%] xl:left-[58%] top-[15%] xl:top-[12%] z-30">
        {t('callout1')}
      </Callout>
      <Callout refEl={calloutLeftRef} side="left" show={showAct3} className="left-[38%] xl:left-[40%] top-[40%] xl:top-[44%] z-30">
        {t('callout2')}
      </Callout>
      <Callout refEl={calloutRightRef} side="right" show={showAct3} className="right-[4%] xl:right-[6%] top-[40%] xl:top-[44%] z-30">
        <span className="flex flex-col gap-[2px]">
          <span className="text-highlight text-lg xl:text-xl text-primary">{t('callout3Number')}</span>
          <span className="text-subtitle text-[11px] xl:text-xs text-foreground/75">{t('callout3Label')}</span>
          <span className="text-[9px] xl:text-[10px] text-foreground/50">{t('callout3Source')}</span>
        </span>
      </Callout>
      <Callout refEl={calloutBottomRef} side="bottom" show={showAct3} className="left-[65%] xl:left-[58%] bottom-[12%] xl:bottom-[16%] z-30">
        {t('callout4')}
      </Callout>

      <div
        ref={ctaRef}
        className={`absolute inset-x-0 bottom-[4%] xl:bottom-[6%] z-30 flex justify-center transition-opacity duration-300 ${showAct3 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <Link
          href="/contato"
          className="text-body-regular inline-flex items-center justify-center rounded-full bg-primary px-lg xl:px-xl py-sm xl:py-md text-sm xl:text-base text-white transition-colors hover:bg-primary-light"
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  )
}

/* ── Subcomponentes ─────────────────────────────────────────────────── */

function BicolorTitle({ title, titleHi, className = '', ...rest }: {
  title: string; titleHi?: string; className?: string
}) {
  const lead = titleHi && title.endsWith(titleHi) ? title.slice(0, -titleHi.length).trim() : title
  return (
    <h2 {...rest} className={`font-black uppercase leading-[0.98] tracking-tight ${className}`}>
      <span className="text-foreground">{lead}</span>
      {titleHi && <> <span className="text-highlight text-primary">{titleHi}</span></>}
    </h2>
  )
}

type CalloutSide = 'top' | 'bottom' | 'left' | 'right'

/** Linha fina com nó na ponta + rótulo, flutuando sobre a foto full-bleed. */
function Callout({ side, show, className = '', refEl, children }: {
  side: CalloutSide; show: boolean; className?: string; refEl?: RefObject<HTMLDivElement | null>; children: ReactNode
}) {
  const dot = (
    <span aria-hidden className="block h-1.5 w-1.5 flex-none rounded-full bg-primary" />
  )
  const label = (
    <span data-label className="text-subtitle max-w-[10rem] rounded-lg bg-white/55 px-sm py-xs text-xs text-foreground/75 backdrop-blur-sm">
      {children}
    </span>
  )

  const wrapClass = `absolute transition-opacity duration-300 ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} ${className}`

  if (side === 'top') {
    return (
      <div ref={refEl} className={`${wrapClass} flex -translate-x-1/2 flex-col items-center gap-sm`}>
        {label}
        <span data-line aria-hidden className="block h-8 w-px bg-primary/50" style={{ transformOrigin: 'top' }} />
        {dot}
      </div>
    )
  }
  if (side === 'bottom') {
    return (
      <div ref={refEl} className={`${wrapClass} flex -translate-x-1/2 flex-col items-center gap-sm`}>
        {dot}
        <span data-line aria-hidden className="block h-8 w-px bg-primary/50" style={{ transformOrigin: 'bottom' }} />
        {label}
      </div>
    )
  }
  if (side === 'left') {
    return (
      <div ref={refEl} className={`${wrapClass} flex items-center gap-sm`}>
        {label}
        <span data-line aria-hidden className="block h-px w-8 bg-primary/50" style={{ transformOrigin: 'right' }} />
        {dot}
      </div>
    )
  }
  return (
    <div ref={refEl} className={`${wrapClass} flex items-center gap-sm`}>
      {dot}
      <span data-line aria-hidden className="block h-px w-8 bg-primary/50" style={{ transformOrigin: 'left' }} />
      {label}
    </div>
  )
}
