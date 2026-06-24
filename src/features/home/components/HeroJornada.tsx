'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { gsap, SplitText, useGSAP } from '@/features/animation/gsap'
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
  const gotaRevealDoneRef = useRef(false)
  // Ao voltar pro topo (scrollY<=2) depois de já ter saído da jornada, a gota
  // re-trava — mas sozinha ela não chega no rest: sem isto o usuário precisa
  // de um segundo gesto de scroll só pra "destravar" a gota.
  const autoRewindRef    = useRef(false)

  // Refs da entrada cinematográfica
  const line1Ref        = useRef<HTMLSpanElement>(null)
  const line2Ref        = useRef<HTMLSpanElement>(null)
  const line3Ref        = useRef<HTMLSpanElement>(null)
  const line3GreenRef   = useRef<HTMLSpanElement>(null)
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

      const nav      = document.querySelector('header')
      const l1       = line1Ref.current
      const l2       = line2Ref.current
      const l3       = line3Ref.current
      const l3g      = line3GreenRef.current
      const glow     = glowRef.current
      const support  = supportRef.current
      const accent   = accentLineRef.current
      const leaves   = leafContainerRef.current
      const scrollInd = scrollIndicatorRef.current

      // Estado inicial — evita flash antes da timeline
      gsap.set([l1, l2, l3], { y: FADE_Y * 1.5, opacity: 0 })
      gsap.set(l3g,     { clipPath: 'inset(0 100% 0 0)' })
      gsap.set(glow,    { opacity: 0 })
      gsap.set(support, { y: FADE_Y, opacity: 0 })
      gsap.set(accent,  { scaleX: 0, transformOrigin: 'left center' })
      gsap.set(leaves,  { opacity: 0 })
      gsap.set(scrollInd, { opacity: 0 })

      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

      // 0.0s — Navbar aparece de cima; limpa styles inline ao terminar para o CSS voltar a controlar
      if (nav) {
        gsap.set(nav, { y: -28, opacity: 0 })
        tl.to(nav, {
          y: 0, opacity: 1, duration: 0.7, ease: EASE.reveal,
          onComplete: () => gsap.set(nav, { clearProps: 'y,opacity,transform' }),
        }, 0)
      }

      // 0.15s — Headline sobe DE TRÁS das montanhas (z-10 < z-20 do campo); stagger por linha
      tl.to([l1, l2, l3], { y: 0, opacity: 1, duration: DUR.title, ease: EASE.reveal, stagger: STAGGER.line }, 0.15)

      // 0.75s — "o mundo" entra em verde via clip-path (varredura esquerda→direita)
      tl.to(l3g, { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.inOut' }, 0.75)

      // 0.3s — Glow radial atrás do título
      tl.to(glow, { opacity: 0.45, duration: 1.0, ease: 'power1.out' }, 0.3)

      // 0.65s — Subtítulo + CTA e linha-acento
      tl.to(support, { y: 0, opacity: 1, duration: DUR.sub, ease: EASE.reveal }, 0.65)
      tl.to(accent,  { scaleX: 1, duration: 0.45, ease: EASE.micro }, 0.65)

      // 0.25s — Folhas aparecem (mais tarde do que as demais camadas para emergir suavemente)
      tl.to(leaves, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.25)

      // 1.5s — Indicador de scroll surge
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
      // No último passo (gota), só libera o scroll depois do texto terminar de revelar.
      const atLastPause   = () =>
        !playingRef.current && stepRef.current >= targetsLength && gotaRevealDoneRef.current

      const handleForward = (): boolean => {
        autoRewindRef.current = false
        const targets = getTargets()
        if (phaseRef.current === 'rest') { startJourney(); return false }
        if (phaseRef.current === 'done') return true
        if (atLastPause()) { release(); return true }
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
        if (ph === 'animating' && e.deltaY > 0 && atLastPause()) { release(); return }
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
        if (ph === 'animating' && down && atLastPause()) { release(); return }
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
        if (phaseRef.current === 'done' && window.scrollY <= 2) {
          // Reset imediato antes de qualquer wheel event: sem isso, atLastPause()
          // retorna true (valor stale do run anterior) e o próximo scroll
          // libera a gota sem esperar a animação refazer.
          gotaRevealDoneRef.current = false
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
      <section ref={root} className="relative bg-white">
        <Container className="grid grid-cols-1 items-end gap-xl pb-2xl pt-[7.5rem] lg:grid-cols-12 min-[1600px]:max-w-[90rem]">
          <Headline t={t} className="lg:col-span-7 text-center lg:text-left" />
          <Support  t={t} className="lg:col-span-5 lg:items-start items-center text-center lg:text-left" />
        </Container>
        <div className="relative h-[40vh] w-full overflow-hidden sm:h-[46vh] lg:h-[60vh]">
          <Image
            src={isMobile ? '/hero/mobile/frame-1-campo.png' : '/hero/desktop/frame-1-campo.png'}
            alt="" aria-hidden fill priority sizes="100vw"
            className="object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute" style={{ left: '-12%', right: '-12%', bottom: '-40%', transformOrigin: 'bottom center' }}>
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
    <section ref={root} className="relative bg-white">
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

        {/* z-0 — Vídeo mobile */}
        <video
          ref={isMobile ? videoRef : null}
          muted playsInline preload="auto"
          poster="/hero/mobile/journey-poster.jpg"
          aria-label={tj('videoAlt')}
          className="absolute inset-0 z-0 h-full w-full object-cover block lg:hidden"
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

              <h1 className="font-black uppercase leading-[0.92] tracking-tight text-[clamp(2.5rem,5.5vw,5rem)] min-[1600px]:text-[7.5rem] text-center lg:text-left">
                {/* overflow-hidden em cada linha → máscara de slide (texto invisível abaixo da linha) */}
                <span className="block overflow-hidden">
                  <span ref={line1Ref} className="block">{t('headlineLine1')}</span>
                </span>
                <span className="block overflow-hidden">
                  <span ref={line2Ref} className="block">{t('headlineLine2')}</span>
                </span>
                {/* Linha 3: texto branco base + overlay verde com clip-path (wipe esquerda→direita) */}
                <span className="block overflow-hidden">
                  <span ref={line3Ref} className="relative block">
                    <span className="text-highlight">{t('headlineLine3')}</span>
                    <span
                      ref={line3GreenRef}
                      aria-hidden
                      className="text-highlight pointer-events-none absolute inset-0 text-primary"
                      style={{ clipPath: 'inset(0 100% 0 0)' }}
                    >
                      {t('headlineLine3')}
                    </span>
                  </span>
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

        {/* z-30 — Folhas: 2 camadas com timing diferente criam profundidade de canópia */}
        <div data-rest ref={leafContainerRef} className="pointer-events-none absolute inset-0 z-30">
          {/* Camada traseira: mais lenta, semi-transparente, deslocada ligeiramente mais abaixo */}
          <div
            className="leaf-sway-2 absolute"
            style={{ left: '-12%', right: '-12%', bottom: '-46%', transformOrigin: 'bottom center', opacity: 0.5 }}
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
            style={{ left: '-12%', right: '-12%', bottom: '-42%', transformOrigin: 'bottom center' }}
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
          <Container className="min-[1600px]:max-w-[90rem] flex lg:justify-end justify-center pt-[22rem] lg:pt-[10.5rem]">
            <div ref={supportRef} className="max-w-[24rem] w-full px-md lg:px-0">
              <div
                className={`flex flex-col gap-md rounded-2xl bg-white/45 p-lg backdrop-blur-[2px] md:bg-transparent md:p-0 md:backdrop-blur-none ${isMobile ? 'items-center text-center' : 'items-end text-right'}`}
              >
                <span ref={accentLineRef} aria-hidden className="block h-1 w-12 rounded-full bg-primary" />
                <p className="text-subtitle text-base text-foreground/70 sm:text-lg">{t('subtitle')}</p>
                <div className={`mt-sm flex flex-col gap-sm ${isMobile ? 'items-center' : 'items-end'}`}>
                  <Link
                    href="/contato"
                    className="text-body-regular pointer-events-auto inline-flex items-center justify-center rounded-full bg-primary px-xl py-md text-base text-white transition-colors hover:bg-primary-light"
                  >
                    {t('cta')}
                  </Link>
                  <span className="text-body-regular text-xs text-foreground/50">{t('ctaNote')}</span>
                </div>
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
            show={cap === 2}
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
            show={cap === 3}
            align="right"
            yShift="md:-translate-y-[14vh]"
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
            subtitle={tj('q4Subtitle')}
            onRevealComplete={(done) => { gotaRevealDoneRef.current = done }}
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
    <h1 className={`text-[clamp(2.5rem,4.5vw,5rem)] min-[1600px]:text-[7.5rem] font-black uppercase leading-[0.92] tracking-tight ${className}`}>
      {t('headlineLead')} <span className="text-highlight text-primary">{t('headlineHighlight')}</span>.
    </h1>
  )
}

function Support({ t, className = '' }: { t: TFn; className?: string }) {
  return (
    <div className={`flex flex-col gap-md ${className}`}>
      <span aria-hidden className="block h-1 w-12 rounded-full bg-primary" />
      <p className="text-subtitle text-base text-foreground/70 sm:text-lg">{t('subtitle')}</p>
      <div className="mt-sm flex flex-col gap-sm">
        <Link
          href="/contato"
          className="text-body-regular pointer-events-auto inline-flex items-center justify-center rounded-full bg-primary px-xl py-md text-base text-white transition-colors hover:bg-primary-light"
        >
          {t('cta')}
        </Link>
        <span className="text-body-regular text-xs text-foreground/50">{t('ctaNote')}</span>
      </div>
    </div>
  )
}

type PhaseIconName = 'sprout' | 'drop' | 'shield' | 'layers'
type PhaseItem = { icon: PhaseIconName; lead: string; sub: string }

/** Fases Q2/Q3: pílula + título bicolor + benefícios + selo; micro-stagger GSAP na entrada.
 *  `align` espelha o bloco (esquerda na fase 2, direita na fase 3 onde a planta fica à esquerda). */
function PhaseLayout({ show, kicker, title, titleHi, subtitle, items, seal, align = 'left', yShift = '' }: {
  show: boolean; kicker: string; title: string; titleHi?: string; subtitle: string
  items?: PhaseItem[]; seal?: string; align?: 'left' | 'right'; yShift?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Reveal disparado pelo estado `show` (scrub do vídeo), na mesma voz da fundação:
  // título em linhas mascaradas (SplitText) + EASE.reveal + tokens de duração/stagger.
  useGSAP(
    () => {
      if (!show || !ref.current) return
      const el       = ref.current
      const kickerEl = el.querySelector<HTMLElement>('[data-pk]')
      const titleEl  = el.querySelector<HTMLElement>('[data-pt]')
      const lineEl   = el.querySelector<HTMLElement>('[data-pl]')
      const subEl    = el.querySelector<HTMLElement>('[data-ps]')
      const itemsEl  = el.querySelector<HTMLElement>('[data-pi]')
      const sealEl   = el.querySelector<HTMLElement>('[data-pseal]')

      const split = titleEl
        ? new SplitText(titleEl, { type: 'lines', mask: 'lines', linesClass: 'overflow-hidden' })
        : null

      const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
      if (kickerEl) tl.fromTo(kickerEl, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub }, 0)
      if (split)    tl.fromTo(split.lines, { yPercent: 110 }, { yPercent: 0, duration: DUR.title, stagger: STAGGER.line }, 0.05)
      if (lineEl)   tl.fromTo(lineEl, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: DUR.sub, transformOrigin: 'left' }, 0.2)
      if (subEl)    tl.fromTo(subEl, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub }, 0.28)
      if (itemsEl)  tl.fromTo(itemsEl.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub, stagger: STAGGER.card }, 0.34)
      if (sealEl)   tl.fromTo(sealEl, { scale: 0.85, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: 0, duration: DUR.title, ease: EASE.micro }, 0.4)

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
      <Container className={`min-[1600px]:max-w-[90rem] h-full flex items-center ${right ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex flex-col ${right ? 'items-end text-right' : 'items-start text-left'} ${yShift} max-w-[34rem] xl:max-w-[42rem] bg-white/40 backdrop-blur-[2px] p-lg rounded-2xl md:bg-transparent md:backdrop-blur-none md:p-0`}>
          {/* Kicker em pílula com ícone */}
          <span data-pk className="mb-sm xl:mb-md inline-flex items-center gap-xs rounded-full border border-primary/25 bg-white/60 px-xs xl:px-sm py-[4px] xl:py-[6px] backdrop-blur-sm">
            <LeafGlyph className="h-3 w-3 xl:h-3.5 xl:w-3.5 text-primary" />
            <span className="text-eyebrow text-primary text-[9px] xl:text-[11px] uppercase tracking-widest">{kicker}</span>
          </span>

          {/* Título bicolor */}
          <h2 data-pt className="font-black uppercase leading-[0.92] tracking-tight text-[clamp(1.75rem,3.2vw,3.75rem)] mb-sm">
            <span className="text-foreground">{lead}</span>
            {titleHi && <> <span className="text-highlight text-primary">{titleHi}</span></>}
          </h2>

          <span data-pl aria-hidden className="block h-[2px] xl:h-[3px] w-8 xl:w-10 rounded-full bg-primary mb-sm xl:mb-md" />

          <p data-ps className="text-subtitle text-xs xl:text-sm sm:text-base text-foreground/80 leading-relaxed max-w-[28rem] xl:max-w-[34rem]">{subtitle}</p>

          {/* Fileira de benefícios */}
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

      {/* Selo circular com a tagline da marca */}
      {seal && (
        <div data-pseal className={`pointer-events-none absolute bottom-[6%] xl:bottom-[12%] hidden lg:block ${right ? 'left-[4%] xl:left-[6%]' : 'right-[4%] xl:right-[6%]'}`}>
          <Seal text={seal} className="h-24 w-24 text-primary xl:h-40 xl:w-40" />
        </div>
      )}
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

/** Fase Q4 (Gota): reveal cinematográfico ao final da animação do vídeo — sem interação de mouse.
 *  Pílula de kicker + título bicolor em máscara por palavra (cortina sobe) + linha + subtítulo. */
function PhaseGotaLayout({ show, kicker, title, titleHi, subtitle, onRevealComplete }: {
  show: boolean; kicker: string; title: string; titleHi?: string; subtitle: string
  onRevealComplete?: (done: boolean) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef     = useRef<HTMLHeadingElement>(null)

  // Cena da gota: tela branca + reveal por palavra mascarada (SplitText) na voz da fundação.
  // Disparado pelo estado `show` (fim da animação do vídeo), não por scroll. Enquanto o texto
  // não termina de revelar, `onRevealComplete(false)` mantém o scroll travado no passo anterior.
  // Ao terminar, espera um pouco (HOLD_MS) antes de liberar — sem isso, quem já está rolando
  // no instante exato do fim do texto passa direto sem ler.
  useGSAP(
    () => {
      onRevealComplete?.(false)
      if (!show || !containerRef.current) return
      const el       = containerRef.current
      const kickerEl = el.querySelector<HTMLElement>('[data-gk]')
      const lineEl   = el.querySelector<HTMLElement>('[data-gline]')
      const subEl    = el.querySelector<HTMLElement>('[data-gs]')

      const split = titleRef.current
        ? new SplitText(titleRef.current, { type: 'words', mask: 'words' })
        : null

      const HOLD_MS = 400
      let holdTimeout: ReturnType<typeof setTimeout> | null = null
      const tl = gsap.timeline({
        defaults: { ease: EASE.reveal },
        onComplete: () => { holdTimeout = setTimeout(() => onRevealComplete?.(true), HOLD_MS) },
      })
      if (kickerEl) tl.fromTo(kickerEl, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub }, 0)
      if (split)    tl.fromTo(split.words, { yPercent: 115 }, { yPercent: 0, duration: DUR.title, stagger: STAGGER.word }, 0.12)
      if (lineEl)   tl.fromTo(lineEl, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: DUR.sub }, 0.55)
      if (subEl)    tl.fromTo(subEl, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: DUR.sub }, 0.7)

      return () => { tl.kill(); if (holdTimeout) clearTimeout(holdTimeout); split?.revert() }
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
          {titleHi && <> <span className="text-highlight text-primary">{titleHi}</span></>}
        </h2>

        <span data-gline aria-hidden className="mx-auto mt-lg block h-[3px] w-12 rounded-full bg-primary" />

        <p data-gs className="text-subtitle mt-lg text-base sm:text-lg text-foreground/70 leading-relaxed">{subtitle}</p>
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
