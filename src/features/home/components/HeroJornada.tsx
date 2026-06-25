'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/features/animation/gsap'
import { DUR, EASE, FADE_Y, STAGGER } from '@/features/animation/motion'
import { useLenis } from '@/features/animation/SmoothScroll'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'

/**
 * Seção 1 = HERO + JORNADA numa coisa só, fixa, em camadas (doc 05/03, ADR-019 final).
 * De trás para a frente: vídeo da jornada → headline (z-10) → frame-1-campo (z-20, céu
 * transparente) → folhas (z-30) → subtítulo/CTA + fases (z-40).
 *
 * Mecânica: ao rolar, a seção prende (overflow hidden) e o vídeo toca segmento a segmento;
 * textos de fase trocam por tempo. Scroll bidirecional. Mobile + prefers-reduced-motion:
 * versão estática.
 */
export function HeroJornada() {
  const t  = useTranslations('hero')
  const tj = useTranslations('journey')

  const root     = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Lenis em ref: enquanto a jornada trava o scroll, paramos o smooth scroll
  // global e retomamos ao liberar (coexistência, sem regredir o hero aprovado).
  const lenis    = useLenis()
  const lenisRef = useRef(lenis)
  useEffect(() => { lenisRef.current = lenis }, [lenis])

  // Estado da jornada
  const phaseRef         = useRef<'rest' | 'animating' | 'done'>('rest')
  const stepRef          = useRef(-1)
  const playingRef       = useRef(false)
  const targetRef        = useRef<number | null>(null)
  const cooldownRef      = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const directionRef     = useRef<'forward' | 'backward' | null>(null)
  const lastTimeRef      = useRef<number>(0)
  const entranceRanRef   = useRef(false)
  // autoRewindRef: Ao voltar pro topo (scrollY<=2) depois de já ter saído da jornada, a gota
  // re-trava — mas sozinha ela não chega no rest: sem isto o usuário precisa
  // de um segundo gesto de scroll só pra "destravar" a gota.
  const autoRewindRef    = useRef(false)
  const gotaAnimCompleteRef = useRef(false)
  const hasLeftTopRef    = useRef(false)

  // Refs da entrada cinematográfica
  const titleWrapRef    = useRef<HTMLHeadingElement>(null)
  const glowRef         = useRef<HTMLDivElement>(null)
  const supportRef      = useRef<HTMLDivElement>(null)
  const accentLineRef   = useRef<HTMLSpanElement>(null)
  const leafContainerRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  const [enhanced, setEnhanced] = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)
  const [cap,       setCap]       = useState(0)
  const [isPaused,  setIsPaused]  = useState(true)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      setEnhanced(!reduced)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ── Entrada cinematográfica ───────────────────────────────────────
  useGSAP(
    () => {
      if (!enhanced || entranceRanRef.current) return
      entranceRanRef.current = true

      const mainNav   = document.querySelector<HTMLElement>('#main-nav-pill')
      const navLinks  = document.querySelector<HTMLElement>('#nav-desktop-links')
      const langPill  = document.querySelector<HTMLElement>('#nav-lang-pill')
      const ctaBtn    = document.querySelector<HTMLElement>('#nav-cta-btn')
      const titleWrap = titleWrapRef.current
      const glow      = glowRef.current
      const support   = supportRef.current
      const accent    = accentLineRef.current
      const leaves    = leafContainerRef.current
      const scrollInd = scrollIndicatorRef.current

      // Captura a largura natural ANTES de qualquer gsap.set
      // (enquanto as pílulas ainda têm seu tamanho real no DOM)
      const naturalWidth     = mainNav  ? mainNav.offsetWidth  : 960
      const naturalLangWidth = langPill ? langPill.offsetWidth : 80

      // Estado inicial — evita flash antes da timeline
      gsap.set(titleWrap, { y: 220, opacity: 0 })
      gsap.set(glow,    { opacity: 0 })
      gsap.set(support, { y: 40, opacity: 0, filter: 'blur(10px)' })
      gsap.set(accent,  { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(leaves,  { opacity: 0 })
      gsap.set(scrollInd, { opacity: 0 })

      if (langPill) gsap.set(langPill, { width: 0, opacity: 0, overflow: 'hidden' })
      if (ctaBtn)   gsap.set(ctaBtn,   { opacity: 0, filter: 'blur(10px)' })
      if (navLinks) gsap.set(navLinks,  { opacity: 0, filter: 'blur(8px)' })

      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

      // 1. Navbar — pílula expande do centro exato da tela (200px → largura natural)
      //    Anima `width` (não maxWidth) para compatibilidade com grid-cols-[1fr_auto_1fr]
      if (mainNav) {
        // marginLeft/Right: auto centraliza a pílula no flex; como width cresce,
        // o browser redistribui as margens simetricamente → expansão para os dois lados
        gsap.set(mainNav, { flex: 'none', width: 200, opacity: 0, overflow: 'hidden', marginLeft: 'auto', marginRight: 'auto' })
        tl.to(mainNav, {
          width: naturalWidth, opacity: 1, duration: 1.4, ease: 'power2.inOut',
          onComplete: () => gsap.set(mainNav, { clearProps: 'flex,width,opacity,overflow,marginLeft,marginRight' }),
        }, 0)
      }

      // 2. Links de menu + CTA — blur-in simultâneo após a pílula expandir
      //    CTA agora está dentro da pílula, surge junto com os links
      const navInnerItems = [navLinks, ctaBtn].filter(Boolean) as HTMLElement[]
      if (navInnerItems.length > 0) {
        tl.to(navInnerItems, {
          opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out',
          onComplete: () => navInnerItems.forEach(el => gsap.set(el, { clearProps: 'opacity,filter' })),
        }, 1.2)
      }

      // 3. Pílula de idioma — expand lateral (começa após 0.8s, mesma elegância da pílula principal)
      if (langPill) {
        tl.to(langPill, {
          width: naturalLangWidth, opacity: 1, duration: 0.7, ease: 'power2.inOut',
          onComplete: () => gsap.set(langPill, { clearProps: 'width,opacity,overflow' }),
        }, 0.8)
      }

      // 2. Headline — rises very slowly from far below the mountains
      tl.to(titleWrap, {
        opacity: 1,
        y: 0,
        duration: 2.5,
        ease: 'power2.out'
      }, '-=0.8')

      // 3. Mountain glow fades in as headline rises
      tl.to(glow, { opacity: 0.45, duration: 2.0, ease: 'power1.out' }, '-=2.0')

      // 4. Shimmer inicia um pouco antes do texto terminar de subir
      tl.call(() => {
        if (titleWrap) titleWrap.classList.add('shimmer-active')
      }, null, '-=0.3')

      // 5. Complement text + accent line com blur-in (logo após shimmer)
      tl.to(support, { 
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out',
        onComplete: () => gsap.set(support, { clearProps: 'filter' })
      }, '+=0.1')
      tl.to(accent,  { scaleX: 1, duration: 0.45, ease: EASE.micro }, '<+=0.3')

      // 6. Folhas aparecem (tempo absoluto no início da cena)
      tl.to(leaves, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.25)

      // 7. Indicador de scroll surge (tempo absoluto)
      tl.to(scrollInd, { opacity: 1, duration: 0.6, ease: EASE.micro }, 1.5)
    },
    { dependencies: [enhanced], scope: root },
  )

  // ── Mecânica de scroll / toque / teclado ─────────────────────────
  useGSAP(
    () => {
      if (!enhanced) return

      const capAtPause = [2, 3, 4]

      const restEls   = () => gsap.utils.toArray<HTMLElement>('[data-rest]', root.current)
      const lockScroll = (on: boolean) => {
        if (on) {
          // Para o Lenis para ele não competir com o scrub manual do vídeo
          lenisRef.current?.stop()
          // Compensa a largura da scrollbar para evitar layout shift ao ocultar overflow
          const sw = window.innerWidth - document.documentElement.clientWidth
          if (sw > 0) document.body.style.paddingRight = `${sw}px`
          document.documentElement.style.overflow = 'hidden'
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.paddingRight = ''
          document.documentElement.style.overflow = ''
          document.body.style.overflow = ''
          // Retoma o smooth scroll global ao liberar a jornada
          lenisRef.current?.start()
          requestAnimationFrame(() => ScrollTrigger.refresh())
        }
      }
      const fadeRest = (show: boolean) =>
        gsap.to(restEls(), { autoAlpha: show ? 1 : 0, duration: show ? 0.3 : 0.2, ease: 'power2.out' })

      const updateActivePhase = (time: number) => {
        if (isMobile) {
          if (time < 1.5)      setCap(0)
          else if (time < 4.5) setCap(2)
          else if (time < 7.5) setCap(3)
          else                  setCap(4)
        } else {
          if (time < 1.5)      setCap(0)
          else if (time < 5.0) setCap(2)
          else if (time < 8.2) setCap(3)
          else                  setCap(4)
        }
      }

      const getTargets = () => {
        const video = videoRef.current
        const fallback = isMobile ? 9.04 : 10.12
        const duration = (video && video.duration > 0) ? video.duration : fallback
        const safeEnd = duration - 0.1
        return isMobile ? [0.0, 3.06, 6.10, safeEnd] : [0.0, 3.06, 7.10, safeEnd]
      }

      const tick = (now: number) => {
        const video = videoRef.current
        if (!video) { stopPlayback(); return }
        if (!playingRef.current) return
        const elapsed = (now - lastTimeRef.current) / 1000
        lastTimeRef.current = now
        const current = video.currentTime
        const target  = targetRef.current
        if (target === null) return

        if (directionRef.current === 'forward') {
          if (video.paused) void video.play().catch(() => {})
          updateActivePhase(current)
          const limit = target >= video.duration - 0.1 ? video.duration - 0.05 : target - 0.02
          if (current >= limit) { video.pause(); stopPlayback(); return }
        } else if (directionRef.current === 'backward') {
          if (!video.paused) video.pause()
          const nextTime = Math.max(0, current - elapsed)
          try { video.currentTime = nextTime } catch {}
          updateActivePhase(nextTime)
          if (nextTime <= target + 0.02) { stopPlayback(); return }
        }
        animationFrameRef.current = requestAnimationFrame(tick)
      }

      const startPlayback = (dir: 'forward' | 'backward', target: number) => {
        const video = videoRef.current
        if (!video) return
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        directionRef.current = dir
        targetRef.current    = target
        playingRef.current   = true
        setIsPaused(false)
        if (dir === 'forward') {
          void video.play().catch(() => {})
        } else {
          video.pause()
          const duration = video.duration > 0 ? video.duration : (isMobile ? 9.04 : 10.12)
          if (video.currentTime >= duration - 0.05) {
            try { video.currentTime = duration - 0.1 } catch {}
          }
        }
        lastTimeRef.current = performance.now()
        animationFrameRef.current = requestAnimationFrame(tick)
      }

      const stopPlayback = () => {
        const video = videoRef.current
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        playingRef.current  = false
        directionRef.current = null
        setIsPaused(true)
        cooldownRef.current = performance.now() + 300
        const target = targetRef.current ?? (video ? video.currentTime : 0)
        targetRef.current = null
        if (video) {
          try { video.currentTime = target } catch {}
          updateActivePhase(target)
        }
        const i = stepRef.current
        if (i >= 1 && i <= capAtPause.length) setCap(capAtPause[i - 1])
        if (target <= 0.05) {
          phaseRef.current = 'rest'
          stepRef.current  = -1
          lockScroll(false)
          setCap(0)
          fadeRest(true)
          autoRewindRef.current = false
          return
        }
        // Reversão automática (voltou pro topo): encadeia o próximo passo pra
        // trás sozinha, sem esperar mais um gesto de scroll do usuário.
        if (autoRewindRef.current) {
          const targets  = getTargets()
          const prevStep = stepRef.current - 1
          if (prevStep >= 0) {
            stepRef.current = prevStep
            startPlayback('backward', targets[prevStep])
          } else {
            autoRewindRef.current = false
          }
        }
      }

      const startJourney = () => {
        const video = videoRef.current
        if (!video) return
        phaseRef.current = 'animating'
        lockScroll(true)
        fadeRest(false)
        stepRef.current = 1
        setCap(0)
        setIsPaused(false)
        try { video.currentTime = 0 } catch {}
        startPlayback('forward', getTargets()[1])
      }

      const release = () => {
        phaseRef.current  = 'done'
        playingRef.current = false
        targetRef.current  = null
        setIsPaused(true)
        lockScroll(false)
      }

      const targetsLength = 3
      // No último passo (gota), libera o scroll imediatamente após o vídeo terminar.
      const atLastPause   = () =>
        !playingRef.current && stepRef.current >= targetsLength

      const handleForward = (): boolean => {
        autoRewindRef.current = false
        const targets = getTargets()
        if (phaseRef.current === 'rest') { startJourney(); return false }
        if (phaseRef.current === 'done') return true
        if (atLastPause()) { 
          if (gotaAnimCompleteRef.current) {
            release(); return true; 
          } else {
            return false;
          }
        }
        if (playingRef.current && directionRef.current === 'backward') {
          const nextStep = stepRef.current + 1
          if (nextStep < targets.length) { stepRef.current = nextStep; startPlayback('forward', targets[nextStep]) }
          return false
        }
        if (!playingRef.current && performance.now() >= cooldownRef.current) {
          const nextStep = stepRef.current + 1
          if (nextStep < targets.length) { stepRef.current = nextStep; startPlayback('forward', targets[nextStep]) }
        }
        return false
      }

      const handleBackward = () => {
        autoRewindRef.current = false
        const targets = getTargets()
        if (phaseRef.current !== 'animating') return
        if (playingRef.current && directionRef.current === 'forward') {
          const prevStep = stepRef.current - 1
          if (prevStep >= 0) { stepRef.current = prevStep; startPlayback('backward', targets[prevStep]) }
          return
        }
        if (!playingRef.current && performance.now() >= cooldownRef.current) {
          const prevStep = stepRef.current - 1
          if (prevStep >= 0) { stepRef.current = prevStep; startPlayback('backward', targets[prevStep]) }
        }
      }

      const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar']
      const upKeys   = ['ArrowUp', 'PageUp']

      const onWheel = (e: WheelEvent) => {
        const video = videoRef.current
        if (!video) return
        const ph = phaseRef.current
        if (ph === 'done') return
        if (ph === 'rest' && e.deltaY <= 0) return
        if (ph === 'animating' && e.deltaY > 0 && atLastPause()) { 
          if (gotaAnimCompleteRef.current) {
            release(); return 
          } else {
            e.preventDefault(); return
          }
        }
        e.preventDefault()
        if (e.deltaY > 0) handleForward()
        else if (e.deltaY < 0 && ph === 'animating') handleBackward()
      }

      const onKey = (e: KeyboardEvent) => {
        const video = videoRef.current
        if (!video) return
        const ph   = phaseRef.current
        if (ph === 'done') return
        const down = downKeys.includes(e.key)
        const up   = upKeys.includes(e.key)
        if (!down && !up) return
        if (ph === 'rest' && !down) return
        if (ph === 'animating' && down && atLastPause()) { 
          if (gotaAnimCompleteRef.current) {
            release(); return 
          } else {
            e.preventDefault(); return
          }
        }
        e.preventDefault()
        if (down) handleForward()
        else if (up && ph === 'animating') handleBackward()
      }

      let touchY = 0
      const onTouchStart = (e: TouchEvent) => {
        const video = videoRef.current
        if (!video) return
        touchY = e.touches[0].clientY
      }
      const onTouchMove  = (e: TouchEvent) => {
        const video = videoRef.current
        if (!video) return
        if (phaseRef.current !== 'done') e.preventDefault()
      }
      const onTouchEnd   = (e: TouchEvent) => {
        const video = videoRef.current
        if (!video) return
        const ph  = phaseRef.current
        if (ph === 'done') return
        const endY = e.changedTouches[0] ? e.changedTouches[0].clientY : touchY
        const dy   = touchY - endY
        if (ph === 'rest') { if (dy > 30) startJourney() }
        else if (ph === 'animating') {
          if (dy > 30) handleForward()
          else if (dy < -30) handleBackward()
        }
      }

      const onScroll = () => {
        const video = videoRef.current
        if (!video) return
        
        if (phaseRef.current === 'done') {
          if (window.scrollY > 10) {
            hasLeftTopRef.current = true;
          } else if (window.scrollY <= 2 && hasLeftTopRef.current) {
            hasLeftTopRef.current = false;
            // Reset imediato antes de qualquer wheel event
            phaseRef.current = 'animating'
            stepRef.current  = 3
            lockScroll(true)
            setCap(4)
            setIsPaused(true)
            const targets = getTargets()
            try { video.currentTime = targets[targets.length - 1] } catch {}
            // Voltar ao topo é intenção clara de ir pra home: a gota reaparece
            // (continuidade visual), mas a reversão segue sozinha até o rest.
            autoRewindRef.current = true
            stepRef.current = 2
            startPlayback('backward', targets[2])
          }
        }
      }

      window.addEventListener('wheel',      onWheel,     { passive: false })
      window.addEventListener('keydown',    onKey)
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove',  onTouchMove,  { passive: false })
      window.addEventListener('touchend',   onTouchEnd,   { passive: true })
      window.addEventListener('scroll',     onScroll,     { passive: true })

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        lockScroll(false)
        window.removeEventListener('wheel',      onWheel)
        window.removeEventListener('keydown',    onKey)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove',  onTouchMove)
        window.removeEventListener('touchend',   onTouchEnd)
        window.removeEventListener('scroll',     onScroll)
      }
    },
    { dependencies: [enhanced, isMobile], scope: root },
  )

  // ── Versão estática (prefers-reduced-motion) ──────────────────────
  if (!enhanced) {
    return (
      <section ref={root} className="sticky top-0 z-0 bg-white">
        <Container className="grid grid-cols-1 items-start gap-xl pb-2xl pt-[7.5rem] lg:grid-cols-12 min-[1600px]:max-w-[90rem]">
          <Headline t={t} className="lg:col-span-7 text-left" />
          <Support  t={t} className="lg:col-span-5 items-start text-left lg:items-end lg:text-right" />
        </Container>
        <div className="relative h-[40vh] w-full overflow-hidden sm:h-[46vh] lg:h-[60vh]">
          <Image
            src={isMobile ? '/hero/mobile/frame-1-campo.png' : '/hero/desktop/frame-1-campo.png'}
            alt="" aria-hidden fill priority sizes="100vw"
            className="object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute" style={isMobile ? { left: '-30%', right: '-30%', bottom: '-10%', transformOrigin: 'bottom center' } : { left: '-12%', right: '-12%', bottom: '-40%', transformOrigin: 'bottom center' }}>
              <Image
                src={isMobile ? '/hero/mobile/overlay-folhas.png' : '/hero/desktop/overlay-folhas.png'}
                alt="" aria-hidden width={1920} height={1080} priority className="w-full h-auto"
              />
            </div>
          </div>
        </div>
        <Container className="flex flex-col gap-2xl py-3xl min-[1600px]:max-w-[90rem]">
          {[
            { title: tj('q1Title'), subtitle: tj('q1Subtitle'), src: isMobile ? '/hero/mobile/frame-1-campo.png' : '/hero/desktop/frame-1-campo.png' },
            { title: tj('q2Title'), subtitle: tj('q2Subtitle'), src: isMobile ? '/hero/mobile/frame-2-folha.png'  : '/hero/desktop/frame-2-folha.png'  },
            { title: tj('q3Title'), subtitle: tj('q3Subtitle'), src: isMobile ? '/hero/mobile/frame-3-solo.png'   : '/hero/desktop/frame-3-solo.png'   },
          ].map(({ title, subtitle, src }) => (
            <div key={title} className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="flex flex-col justify-center"><PhaseText title={title} subtitle={subtitle} /></div>
              <div className="relative h-[30vh] rounded-2xl overflow-hidden">
                <Image src={src} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
            </div>
          ))}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div className="flex flex-col justify-center"><PhaseText title={tj('q4Title')} subtitle={tj('q4Subtitle')} /></div>
            <div className="relative h-[30vh] rounded-2xl overflow-hidden flex items-center justify-center bg-black/5">
              <span className="text-highlight text-xl text-primary">{tj('q4Title')}</span>
            </div>
          </div>
        </Container>
      </section>
    )
  }

  // ── Versão animada ────────────────────────────────────────────────
  return (
    <section ref={root} className="sticky top-0 z-0 bg-white">
      <div className="relative h-[100svh] w-full overflow-hidden">

        {/* z-0 — Vídeo desktop */}
        <video
          ref={isMobile ? null : videoRef}
          muted playsInline preload="auto"
          poster="/hero/desktop/journey-poster.jpg"
          aria-label={tj('videoAlt')}
          className="absolute inset-0 z-0 h-full w-full object-cover hidden lg:block"
        >
          <source src="/hero/desktop/journey.mp4" type="video/mp4" />
        </video>

        {/* z-[1] — Vídeo mobile (com multiply para revelar o selo por trás do branco) */}
        <video
          ref={isMobile ? videoRef : null}
          muted playsInline preload="auto"
          poster="/hero/mobile/journey-poster.jpg"
          aria-label={tj('videoAlt')}
          className="absolute inset-0 z-[1] h-full w-full object-cover block lg:hidden mix-blend-multiply"
        >
          <source src="/hero/mobile/journey.mp4" type="video/mp4" />
        </video>

        {/* z-10 — Headline: sobe DE TRÁS das montanhas na entrada */}
        <div data-rest className="absolute inset-x-0 top-0 z-10 w-full">
          <Container className="min-[1600px]:max-w-[90rem] pt-[6rem] lg:pt-[10rem]">
            <div className="relative max-w-[60rem] min-[1600px]:max-w-[76rem]">

              {/* Glow radial suave atrás do título */}
              <div
                ref={glowRef}
                aria-hidden
                className="pointer-events-none absolute -inset-24 -z-10"
                style={{ background: 'radial-gradient(ellipse 75% 55% at 38% 52%, rgba(0,76,38,0.12), transparent 70%)' }}
              />

              <h1 ref={titleWrapRef} className="hero-title-shimmer relative font-black uppercase leading-[0.92] tracking-tight text-[clamp(2.5rem,8vw,5rem)] min-[1600px]:text-[7.5rem] text-left">
                <span className="block text-foreground">{t('headlineLine1')}</span>
                <span className="block text-foreground">{t('headlineLine2')}</span>
                <span className="block">
                  <span className="text-foreground">{t('headlineLine3').split(' ')[0]} </span>
                  <span className="text-highlight text-primary">{t('headlineLine3').substring(t('headlineLine3').indexOf(' ') + 1)}</span>
                </span>
              </h1>
            </div>
          </Container>
        </div>

        {/* z-20 — Campo (montanhas): mascaras a base do título + transparente no céu.
             NÃO tem ref de parallax — deve estar perfeitamente alinhado ao vídeo. */}
        <div data-rest className="absolute inset-0 z-20">
          <Image
            src={isMobile ? '/hero/mobile/frame-1-campo.png' : '/hero/desktop/frame-1-campo.png'}
            alt="" aria-hidden fill priority sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* z-[0] — Selos (Mobile e Desktop). Atrás do vídeo (que usará mix-blend-multiply) */}
        {/* Mobile Seal: Aparece após a imagem estabilizar. */}
        <div
          className={`pointer-events-none absolute top-[38%] left-[2%] z-[0] lg:hidden ease-out ${
            cap === 2 && isPaused
              ? 'opacity-100 transition-opacity duration-500'
              : 'opacity-0 transition-opacity duration-200'
          }`}
        >
          <div>
            <Seal text={tj('q2Seal')} className="h-48 w-48 text-primary animate-[spin_12s_linear_infinite]" />
          </div>
        </div>

        {/* Desktop Seal */}
        <div className="pointer-events-none absolute inset-0 z-[25] hidden lg:block w-full h-full">
          <DesktopPhaseSeal show={cap === 2 && isPaused} text={tj('q2Seal')} alignRight={false} />
        </div>



        {/* z-30 — Folhas: 2 camadas com timing diferente criam profundidade de canópia */}
        <div data-rest ref={leafContainerRef} className="pointer-events-none absolute inset-0 z-30">
          {/* Camada traseira: mais lenta, semi-transparente, deslocada ligeiramente mais abaixo */}
          <div
            className="leaf-sway-2 absolute"
            style={isMobile ? { left: '-30%', right: '-30%', bottom: '-14%', transformOrigin: 'bottom center', opacity: 0.5 } : { left: '-12%', right: '-12%', bottom: '-46%', transformOrigin: 'bottom center', opacity: 0.5 }}
          >
            <Image
              src={isMobile ? '/hero/mobile/overlay-folhas.png' : '/hero/desktop/overlay-folhas.png'}
              alt="" aria-hidden width={1920} height={1080}
              className="w-full h-auto"
            />
          </div>
          {/* Camada da frente: mais rápida, totalmente opaca */}
          <div
            className="leaf-sway-1 absolute"
            style={isMobile ? { left: '-30%', right: '-30%', bottom: '-10%', transformOrigin: 'bottom center' } : { left: '-12%', right: '-12%', bottom: '-42%', transformOrigin: 'bottom center' }}
          >
            <Image
              src={isMobile ? '/hero/mobile/overlay-folhas.png' : '/hero/desktop/overlay-folhas.png'}
              alt="" aria-hidden width={1920} height={1080} priority
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* z-40 — Subtítulo + CTA (repouso) */}
        <div data-rest className="absolute inset-x-0 top-0 z-40">
          <Container className="min-[1600px]:max-w-[90rem] flex lg:justify-end justify-start pt-[15rem] md:pt-[20rem] lg:pt-[10.5rem]">
              <div
                ref={supportRef}
                className={`lg:w-1/3 flex flex-col gap-md rounded-2xl bg-transparent backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none items-start text-left lg:items-end lg:text-right`}
              >
                <span ref={accentLineRef} aria-hidden className="block h-1 w-12 rounded-full bg-primary" />
                <p className="text-subtitle text-base text-foreground/70 sm:text-lg">{t('subtitle')}</p>
                <div className={`flex flex-col gap-sm mx-auto lg:mx-0 items-center lg:items-end text-center lg:text-right`}>
                  <Link
                    href="/contato"
                    className="text-body-regular pointer-events-auto inline-flex items-center justify-center rounded-full bg-primary px-lg py-sm text-sm text-white transition-colors hover:bg-primary-light"
                  >
                    {t('cta')}
                  </Link>
                </div>
              </div>
          </Container>
        </div>

        {/* z-40 — Indicador de scroll: linha + chevron (padrão sites premiados) */}
        <div
          data-rest
          ref={scrollIndicatorRef}
          aria-hidden
          className="pointer-events-none absolute bottom-7 inset-x-0 z-40 flex flex-col items-center"
        >
          <div className="scroll-indicator-bob flex flex-col items-center gap-[3px]">
            <div className="w-px h-10 rounded-full bg-gradient-to-b from-white/10 via-white/50 to-white/5" />
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="text-white/45">
              <polyline points="1 1 6 6 11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* z-40 — Legendas das fases */}
        <div className="pointer-events-none absolute inset-0 z-40 w-full h-full">
          <PhaseLayout
            show={cap === 2 && isPaused}
            kicker={tj('q2Kicker')}
            title={tj('q2Title')}
            titleHi={tj('q2TitleHi')}
            subtitle={tj('q2Subtitle')}
            items={[
              { icon: 'sprout', lead: tj('q2L1'), sub: tj('q2S1') },
              { icon: 'drop', lead: tj('q2L2'), sub: tj('q2S2') },
              { icon: 'shield', lead: tj('q2L3'), sub: tj('q2S3') },
            ]}
            seal={tj('q2Seal')}
          />
          <PhaseLayout
            show={cap === 3 && isPaused}
            align="right"
            yShift="md:-translate-y-[14vh]"
            mobileYShift="bottom-40"
            kicker={tj('q3Kicker')}
            title={tj('q3Title')}
            titleHi={tj('q3TitleHi')}
            subtitle={tj('q3Subtitle')}
          />
          <PhaseGotaLayout
            show={cap === 4 && isPaused}
            kicker={tj('q4Kicker')}
            title={tj('q4Title')}
            titleHi={tj('q4TitleHi')}
            titleHiOptions={[tj('q4TitleHi'), tj('q4TitleHi2'), tj('q4TitleHi3')]}
            subtitle={tj('q4Subtitle')}
            onRevealComplete={(done) => { gotaAnimCompleteRef.current = done }}
          />
        </div>
      </div>
    </section>
  )
}

/* ── Subcomponentes ──────────────────────────────────────────────── */

type TFn = ReturnType<typeof useTranslations>

function Headline({ t, className = '' }: { t: TFn; className?: string }) {
  return (
    <h1 className={`text-[clamp(2.75rem,8vw,5rem)] min-[1600px]:text-[7.5rem] font-black uppercase leading-[0.92] tracking-tight ${className}`}>
      <span className="block text-foreground">{t('headlineLine1')}</span>
      <span className="block text-foreground">{t('headlineLine2')}</span>
      <span className="block">
        <span className="text-foreground">{t('headlineLine3').split(' ')[0]} </span>
        <span className="text-highlight text-primary">{t('headlineLine3').substring(t('headlineLine3').indexOf(' ') + 1)}</span>
      </span>
    </h1>
  )
}

function Support({ t, className = '' }: { t: TFn; className?: string }) {
  return (
    <div className={`flex flex-col gap-md ${className}`}>
      <span aria-hidden className="block h-1 w-12 rounded-full bg-primary" />
      <p className="text-subtitle text-base text-foreground/70 sm:text-lg">{t('subtitle')}</p>
      <div className="mt-sm flex flex-col gap-sm items-start lg:items-end">
        <Link
          href="/contato"
          className="text-body-regular pointer-events-auto inline-flex items-center justify-center rounded-full bg-primary px-lg py-sm text-sm text-white transition-colors hover:bg-primary-light"
        >
          {t('cta')}
        </Link>
      </div>
    </div>
  )
}

type PhaseIconName = 'sprout' | 'drop' | 'shield' | 'layers'
type PhaseItem = { icon: PhaseIconName; lead: string; sub: string }

/** Fases Q2/Q3: pílula + título bicolor + benefícios + selo; micro-stagger GSAP na entrada.
 *  `align` espelha o bloco (esquerda na fase 2, direita na fase 3 onde a planta fica à esquerda).
 *  Mobile: headline flutua no topo, conteúdo ancora no canto inferior direito, seal como marca d'água. */
function PhaseLayout({ show, kicker, title, titleHi, subtitle, items, seal, align = 'left', yShift = '', mobileYShift = 'bottom-22' }: {
  show: boolean; kicker: string; title: string; titleHi?: string; subtitle: string
  items?: PhaseItem[]; seal?: string; align?: 'left' | 'right'; yShift?: string; mobileYShift?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!show || !ref.current) return
      const el     = ref.current
      const mobile = window.innerWidth < 1024

      const kickerEl = el.querySelector<HTMLElement>(mobile ? '[data-pk-m]' : '[data-pk]')
      const titleEl  = el.querySelector<HTMLElement>(mobile ? '[data-pt-m]' : '[data-pt]')
      const lineEl   = el.querySelector<HTMLElement>(mobile ? '[data-pl-m]' : '[data-pl]')
      const subEl    = el.querySelector<HTMLElement>(mobile ? '[data-ps-m]' : '[data-ps]')
      const itemsEl  = el.querySelector<HTMLElement>(mobile ? '[data-pi-m]' : '[data-pi]')

      const split = titleEl
        ? new SplitText(titleEl, { type: 'chars,lines' })
        : null

      const lineOrigin = (mobile || align === 'right') ? 'right center' : 'left center'

      const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
      if (kickerEl) tl.fromTo(kickerEl, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub }, 0)
      if (split)    tl.fromTo(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' }, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, 0.05)
      if (lineEl)   tl.fromTo(lineEl, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: DUR.sub, transformOrigin: lineOrigin }, 0.2)
      if (subEl)    tl.fromTo(subEl, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub }, 0.28)
      if (itemsEl)  tl.fromTo(itemsEl.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub, stagger: STAGGER.card }, 0.34)

      return () => { tl.kill(); split?.revert() }
    },
    { dependencies: [show], scope: ref },
  )

  const lead = titleHi && title.endsWith(titleHi) ? title.slice(0, -titleHi.length).trim() : title
  const right = align === 'right'

  return (
    <div
      ref={ref}
      className={`absolute inset-0 w-full h-full transition-opacity duration-200 ease-out ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* ── MOBILE LAYOUT ────────────────────────────────────────── */}
      <div className="lg:hidden absolute inset-0">
        {/* Headline fora do card, posicionada no topo */}
        <div className="absolute top-20 left-md right-md z-2">
          <h2 data-pt-m className="font-black uppercase leading-[0.88] tracking-tight text-[clamp(2rem,9vw,3rem)] text-left">
            <span className="text-foreground">{lead}</span>
            {titleHi && <span className="block italic font-semibold text-primary">{titleHi}</span>}
          </h2>
        </div>

        {/* Conteúdo (kicker + linha + subtítulo + items) — canto inferior direito */}
        <div className={`absolute ${mobileYShift} right-md max-w-52 flex flex-col items-end text-right z-2`}>
          <span data-pk-m className="mb-sm inline-flex items-center gap-xs rounded-full border border-primary/25 bg-white/60 px-xs py-[4px] backdrop-blur-sm">
            <LeafGlyph className="h-3 w-3 text-primary" />
            <span className="text-eyebrow text-primary text-[9px] uppercase tracking-widest">{kicker}</span>
          </span>
          <span data-pl-m aria-hidden className="block h-[2px] w-8 rounded-full bg-primary mb-sm self-end" />
          <p data-ps-m className="text-subtitle text-[11px] text-foreground/80 leading-relaxed">{subtitle}</p>
          {items && items.length > 0 && (
            <ul data-pi-m className="mt-sm flex flex-col gap-[6px] w-full">
              {items.map((it, i) => (
                <li key={i} className="flex items-center gap-xs justify-end">
                  <span className="flex flex-col text-right leading-tight">
                    <span className="text-heading text-[9px] font-bold text-foreground">{it.lead}</span>
                    <span className="text-body-regular text-[8px] text-foreground/60">{it.sub}</span>
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/25 text-primary">
                    <PhaseIcon name={it.icon} className="h-3.5 w-3.5" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (inalterado) ──────────────────────────── */}
      <Container className={`hidden lg:flex min-[1600px]:max-w-360 h-full items-center ${right ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex flex-col ${right ? 'items-end text-right' : 'items-start text-left'} ${yShift} max-w-136 xl:max-w-168`}>
          <span data-pk className="mb-sm xl:mb-md inline-flex items-center gap-xs rounded-full border border-primary/25 bg-white/60 px-xs xl:px-sm py-[4px] xl:py-[6px] backdrop-blur-sm">
            <LeafGlyph className="h-3 w-3 xl:h-3.5 xl:w-3.5 text-primary" />
            <span className="text-eyebrow text-primary text-[9px] xl:text-[11px] uppercase tracking-widest">{kicker}</span>
          </span>

          <h2 data-pt className="font-black uppercase leading-[0.92] tracking-tight text-[clamp(1.75rem,3.2vw,3.75rem)] mb-sm">
            <span className="text-foreground">{lead}</span>
            {titleHi && <> <span className="text-highlight text-primary">{titleHi}</span></>}
          </h2>

          <span data-pl aria-hidden className="block h-[2px] xl:h-[3px] w-8 xl:w-10 rounded-full bg-primary mb-sm xl:mb-md" />

          <p data-ps className="text-subtitle text-xs xl:text-sm sm:text-base text-foreground/80 leading-relaxed max-w-112 xl:max-w-136">{subtitle}</p>

          {items && items.length > 0 && (
            <ul data-pi className={`mt-md xl:mt-lg flex flex-wrap gap-sm xl:gap-md sm:gap-lg ${right ? 'justify-end' : ''}`}>
              {items.map((it, i) => (
                <li
                  key={i}
                  className={`flex max-w-[8.5rem] xl:max-w-[10.5rem] flex-col gap-xs xl:gap-sm ${right ? 'items-end text-right' : ''} ${i > 0 ? 'border-l border-foreground/10 pl-sm xl:pl-md sm:pl-lg' : ''}`}
                >
                  <span className="flex h-8 w-8 xl:h-11 xl:w-11 items-center justify-center rounded-full border border-primary/25 text-primary">
                    <PhaseIcon name={it.icon} className="h-4 w-4 xl:h-5 xl:w-5" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-heading text-[10px] xl:text-xs font-bold text-foreground">{it.lead}</span>
                    <span className="text-body-regular text-[9px] xl:text-xs text-foreground/60">{it.sub}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>

    </div>
  )
}

/* ── Ícones e selo das fases ──────────────────────────────────────── */

function LeafGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  )
}

function PhaseIcon({ name, ...props }: { name: PhaseIconName } & React.SVGProps<SVGSVGElement>) {
  const common = {
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...props,
  }
  if (name === 'layers')
    return <svg {...common}><path d="M4 7h16" /><path d="M6 12h12" /><path d="M8 17h8" /></svg>
  if (name === 'drop')
    return <svg {...common}><path d="M12 2.7c3.5 4.2 6 7.5 6 10.5a6 6 0 0 1-12 0c0-3 2.5-6.3 6-10.5Z" /></svg>
  if (name === 'shield')
    return <svg {...common}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /></svg>
  return (
    <svg {...common}>
      <path d="M12 21V10" />
      <path d="M12 12c-4 0-6-2-6-6 4 0 6 2 6 6Z" />
      <path d="M12 9c0-3.5 2-5.5 6-5.5 0 3.5-2 5.5-6 5.5Z" />
    </svg>
  )
}

function Seal({ text, className }: { text: string; className?: string }) {
  const raw = useId().replace(/[:]/g, '')
  const pathId = `seal-${raw}`
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <path id={pathId} d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" fill="none" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="100" cy="100" r="60" fill="currentColor" opacity="0.06" />
      <text fontSize="14" fontWeight="700" letterSpacing="3.5" fill="currentColor">
        <textPath href={`#${pathId}`} startOffset="2%">{`${text.toUpperCase()}  •  `}</textPath>
      </text>
      <g transform="translate(100 100)" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 16 V-3" />
        <path d="M0 1 C-13 1 -19 -8 -19 -16 C-7 -16 0 -8 0 1 Z" />
        <path d="M0 -3 C13 -3 19 -12 19 -20 C7 -20 0 -12 0 -3 Z" />
      </g>
    </svg>
  )
}

function DesktopPhaseSeal({ show, text, alignRight }: { show: boolean, text: string, alignRight?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  
  useGSAP(
    () => {
      if (!show || !ref.current) return
      const sealEl = ref.current.querySelector<HTMLElement>('[data-pseal-inner]')
      if (sealEl) {
        gsap.fromTo(sealEl, { scale: 0.85, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: 0, duration: DUR.title, ease: EASE.micro })
      }
    },
    { dependencies: [show], scope: ref }
  )

  return (
    <div
      ref={ref}
      className={`absolute inset-0 w-full h-full transition-opacity duration-200 ease-out ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div data-pseal-inner className={`absolute bottom-[6%] xl:bottom-[12%] ${alignRight ? 'left-[4%] xl:left-[6%]' : 'right-[4%] xl:right-[6%]'}`}>
        <Seal text={text} className="h-24 w-24 text-primary xl:h-40 xl:w-40 animate-[spin_12s_linear_infinite]" />
      </div>
    </div>
  )
}

/** Fase Q4 (Gota): reveal cinematográfico ao final da animação do vídeo — sem interação de mouse.
 *  Pílula de kicker + título bicolor em máscara por palavra (cortina sobe) + linha + subtítulo. */
function PhaseGotaLayout({ show, kicker, title, titleHi, titleHiOptions, subtitle, onRevealComplete }: {
  show: boolean; kicker: string; title: string; titleHi?: string; titleHiOptions?: string[]; subtitle: string; onRevealComplete?: (done: boolean) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef     = useRef<HTMLHeadingElement>(null)
  const hiRef        = useRef<HTMLSpanElement>(null)

  // Cena da gota: tela branca + reveal por palavra mascarada (SplitText) na voz da fundação.
  // Disparado pelo estado `show` (fim da animação do vídeo), não por scroll. Enquanto o texto
  // não termina de revelar, `onRevealComplete(false)` mantém o scroll travado no passo anterior.
  // Ao terminar, espera um pouco (HOLD_MS) antes de liberar — sem isso, quem já está rolando
  // no instante exato do fim do texto passa direto sem ler.
  useGSAP(
    () => {
      if (!show || !containerRef.current) {
        onRevealComplete?.(false)
        return
      }
      const el       = containerRef.current
      const kickerEl = el.querySelector<HTMLElement>('[data-gk]')
      const lineEl   = el.querySelector<HTMLElement>('[data-gline]')
      const subEl    = el.querySelector<HTMLElement>('[data-gs]')

      const split = titleRef.current
        ? new SplitText(titleRef.current, { type: 'chars,words' })
        : null

      let rotatorTl: gsap.core.Timeline | null = null;

      const tl = gsap.timeline({ 
        defaults: { ease: EASE.reveal },
        onComplete: () => {
          onRevealComplete?.(true)
          
          if (titleHiOptions && titleHiOptions.length > 1 && titleRef.current) {
            split?.revert()
            const activeHiEl = titleRef.current.querySelector('.text-highlight') as HTMLSpanElement;
            if (!activeHiEl) return;

            // Converte a tag do destaque para grid para que as palavras fiquem sobrepostas
            activeHiEl.className = "text-highlight text-primary inline-grid min-w-max";
            activeHiEl.innerText = "";
            
            const spans = titleHiOptions.map((opt, i) => {
               const s = document.createElement('span');
               s.innerText = opt;
               s.className = "col-start-1 row-start-1 leading-[1.05]";
               s.style.opacity = i === 0 ? "1" : "0";
               s.style.filter = i === 0 ? "blur(0px)" : "blur(8px)";
               s.style.transform = i === 0 ? "translateX(0)" : "translateX(20px)";
               activeHiEl.appendChild(s);
               return s;
            });

            rotatorTl = gsap.timeline({ repeat: -1 })
            
            for (let i = 0; i < spans.length; i++) {
               const currentEl = spans[i];
               const nextEl = spans[(i + 1) % spans.length];

               // label dinâmico para garantir que o crossfade ocorra ao mesmo tempo
               const label = `step${i}`;
               
               // Adiciona 3 segundos de "respiro" (timeline parada) ANTES deste passo
               rotatorTl.addLabel(label, "+=3")
               
               rotatorTl.to(currentEl, {
                  opacity: 0,
                  filter: 'blur(8px)',
                  duration: 1,
                  ease: 'power2.inOut'
               }, label)
               
               rotatorTl.fromTo(nextEl, {
                  x: 20,
                  opacity: 0,
                  filter: 'blur(8px)'
               }, {
                  x: 0,
                  opacity: 1,
                  filter: 'blur(0px)',
                  duration: 1,
                  ease: 'power2.out',
                  immediateRender: false
               }, label)
            }
          }
        }
      })
      if (kickerEl) tl.fromTo(kickerEl, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub }, 0)
      if (split)    tl.fromTo(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' }, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, 0.12)
      if (lineEl)   tl.fromTo(lineEl, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: DUR.sub }, 0.55)
      if (subEl)    tl.fromTo(subEl, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub }, 0.7)

      return () => { 
        tl.kill(); 
        rotatorTl?.kill();
        split?.revert(); 
        onRevealComplete?.(false);
      }
    },
    { dependencies: [show], scope: containerRef },
  )

  const lead = titleHi && title.endsWith(titleHi) ? title.slice(0, -titleHi.length).trim() : title

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 flex flex-col items-center justify-center text-center px-[clamp(1.5rem,5vw,5rem)] transition-opacity duration-700 ease-out ${
        show ? 'opacity-100 pointer-events-auto bg-white' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-[54rem]">
        <span data-gk className="mb-md inline-flex items-center gap-xs rounded-full border border-primary/25 bg-white/60 px-sm py-[6px] backdrop-blur-sm">
          <PhaseIcon name="drop" className="h-3.5 w-3.5 text-primary" />
          <span className="text-eyebrow text-primary text-[11px] uppercase tracking-widest">{kicker}</span>
        </span>

        <h2 ref={titleRef} className="font-black uppercase leading-[1.05] tracking-tight text-[clamp(2rem,5vw,4.25rem)]">
          <span className="text-foreground">{lead}</span>
          {titleHi && <> <span ref={hiRef} className="text-highlight text-primary inline-block">{titleHi}</span></>}
        </h2>

        <span data-gline aria-hidden className="mx-auto mt-lg block h-[3px] w-12 rounded-full bg-primary" />

        <p data-gs className="text-subtitle mx-auto mt-lg text-base sm:text-lg text-foreground/70 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  )
}

function PhaseText({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-left py-md border-b border-foreground/5 last:border-0">
      <h2 className="text-balance text-[clamp(1.75rem,4vw,2.5rem)] font-black leading-tight tracking-tight text-foreground uppercase">{title}</h2>
      <p className="text-subtitle mt-sm text-foreground/75 sm:text-lg">{subtitle}</p>
    </div>
  )
}
