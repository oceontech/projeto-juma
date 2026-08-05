'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, ScrollTrigger } from '@/features/animation/gsap'
import { PRELOADER_DONE_EVENT, setPreloaderActive } from '@/features/animation/pageEntrance'
import { routing } from '@/i18n/routing'

/**
 * Aquecedor e pré-carregador de recursos críticos.
 * Na Home: pré-decodifica imagens da Hero na GPU e pré-carrega o buffer do vídeo.
 */
const preloadCriticalAssets = async () => {
  if (typeof window === 'undefined') return

  const isMobile = window.innerWidth < 1024
  const imagesToDecode = isMobile
    ? ['/hero/mobile/journey-poster.webp']
    : ['/hero/desktop/journey-poster.webp']

  // 1. Decodificação de Imagens da Hero na GPU
  const imgPromises = imagesToDecode.map((src) => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.src = src
      if (typeof img.decode === 'function') {
        img.decode().then(resolve).catch(() => resolve())
      } else if ((img as HTMLImageElement).complete) {
        resolve()
      } else {
        img.onload = () => resolve()
        img.onerror = () => resolve()
      }
    })
  })

  // 2. Buffer do Vídeo da Hero Ativa
  const videoPromise = new Promise<void>((resolve) => {
    const video = document.querySelector<HTMLVideoElement>(
      `video[data-hero-video="${isMobile ? 'mobile' : 'desktop'}"]`
    )
    if (!video) return resolve()

    if (video.readyState >= 2) {
      resolve()
    } else {
      if (video.preload !== 'auto') {
        video.preload = 'auto'
        video.load()
      }
      const onLoaded = () => {
        video.removeEventListener('loadeddata', onLoaded)
        video.removeEventListener('canplay', onLoaded)
        resolve()
      }
      video.addEventListener('loadeddata', onLoaded)
      video.addEventListener('canplay', onLoaded)
      setTimeout(resolve, 1000)
    }
  })

  await Promise.allSettled([...imgPromises, videoPromise])
}

/**
 * A home é a única rota que precisa da tela de espera: ela abre com vídeo,
 * pôster em tela cheia e uma jornada que só faz sentido depois de tudo
 * decodificado. Nas outras páginas o conteúdo é texto e imagem comum — segurar
 * a tela ali só atrasa a leitura e engole a animação de entrada, que passa a
 * rodar atrás do overlay.
 *
 * O roteamento usa `localePrefix: 'always'`, então TODA rota carrega o idioma
 * no caminho — inclusive pt-BR (`/pt-BR`, `/en`, `/es`). Home é o caminho que
 * não tem nada depois disso.
 */
const ehHome = (pathname: string) => {
  const semLocale = pathname.replace(
    new RegExp(`^/(?:${routing.locales.join('|')})(?=/|$)`),
    '',
  )
  return semLocale === '' || semLocale === '/'
}

export function Preloader() {
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const naHome = ehHome(pathname)
  const [visible, setVisible] = useState(naHome)
  const [cycle, setCycle] = useState(0)
  const prevPathnameRef = useRef(pathname)
  const showingRef = useRef(naHome)

  const showOverlay = () => {
    if (showingRef.current) return
    showingRef.current = true
    setPreloaderActive(true)
    setVisible(true)
    setCycle((c) => c + 1)
  }

  /* O overlay nasce visível na home, então a bandeira precisa nascer de pé
     junto — antes de o hero montar e perguntar se pode animar. Fora da home ela
     nasce baixa: a abertura da página roda no mount, do começo. */
  if (typeof window !== 'undefined' && window.__jumaPreloaderActive === undefined) {
    setPreloaderActive(naHome)
  }

  // Início da navegação: clique num link que leva DE VOLTA à home
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement | null)?.closest('a')
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#')) return
      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      /* Só o caminho de volta para a home levanta o overlay. Indo para uma
         página interna não há nada pesado a esperar, e a tela branca só
         atrasaria a leitura. */
      if (!ehHome(url.pathname)) return
      showOverlay()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  /* Fim da navegação (fallback do clique acima): troca de pathname. Mesma
     regra — só a home levanta o overlay. */
  useEffect(() => {
    if (prevPathnameRef.current === pathname) return
    prevPathnameRef.current = pathname
    if (ehHome(pathname)) showOverlay()
  }, [pathname])

  // Gerenciamento de dispensa após carregamento completo
  useEffect(() => {
    if (!visible) return

    /* `preloader:done` avisa quem tem animação de abertura para começar agora.
       Sem esse sinal, a entrada do hero rodava no mount — ou seja, ATRÁS da
       tela branca do preloader, que fica de pé por até 2,5s. Quando o overlay
       finalmente saía, a timeline já havia terminado e o usuário via o hero
       parado, sem entrada nenhuma. */
    const finish = () => {
      showingRef.current = false
      setPreloaderActive(false)
      setVisible(false)
      window.dispatchEvent(new CustomEvent(PRELOADER_DONE_EVENT))
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (document.readyState === 'complete') finish()
      else window.addEventListener('load', finish, { once: true })
      return () => window.removeEventListener('load', finish)
    }

    // Garante overlay visível com GSAP ao montar
    if (overlayRef.current) {
      gsap.set(overlayRef.current, { opacity: 1, visibility: 'visible' })
    }

    const dismiss = () => {
      if (!overlayRef.current) {
        finish()
        return
      }

      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.inOut',
        onComplete: () => {
          finish()
          requestAnimationFrame(() => {
            ScrollTrigger.refresh()
          })
        },
      })
    }

    let cancelled = false
    const minDisplayTime = new Promise<void>((resolve) => setTimeout(resolve, 450))
    const maxWaitTimeout = new Promise<void>((resolve) => setTimeout(resolve, 2500))

    if (cycle === 0) {
      const pageLoad = new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve()
        } else {
          const onLoad = () => {
            window.removeEventListener('load', onLoad)
            resolve()
          }
          window.addEventListener('load', onLoad)
        }
      })

      const fontsReady = document.fonts?.ready ?? Promise.resolve()
      const criticalReady = preloadCriticalAssets()

      const contentReady = Promise.allSettled([fontsReady, criticalReady, pageLoad])

      Promise.race([
        Promise.all([contentReady, minDisplayTime]),
        maxWaitTimeout,
      ]).then(() => {
        if (!cancelled) dismiss()
      })
    } else {
      Promise.race([minDisplayTime, maxWaitTimeout]).then(() => {
        if (!cancelled) dismiss()
      })
    }

    return () => {
      cancelled = true
    }
  }, [cycle, visible])

  if (!visible) return null

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white"
      style={{ visibility: 'visible', opacity: 1 }}
    >
      <style>{`
        @keyframes jumaDotWave {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(0.85);
            opacity: 0.25;
            box-shadow: 0 0 0px rgba(0, 76, 38, 0);
          }
          35% {
            transform: translate3d(0, -10px, 0) scale(1.18);
            opacity: 1;
            box-shadow: 0 4px 14px rgba(0, 76, 38, 0.4);
          }
          70% {
            transform: translate3d(0, 2px, 0) scale(0.92);
            opacity: 0.4;
          }
        }
        .juma-dot {
          display: inline-block;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform-style: preserve-3d;
          will-change: transform, opacity, box-shadow;
          animation: jumaDotWave 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .juma-dot-1 {
          animation-delay: 0s;
        }
        .juma-dot-2 {
          animation-delay: 0.15s;
        }
        .juma-dot-3 {
          animation-delay: 0.30s;
        }
      `}</style>

      <div className="flex flex-col items-center gap-7">
        <img
          src="/brand/logo-juma-agro.png"
          alt="Juma Agro"
          width={160}
          height={56}
          className="h-10 w-auto object-contain"
        />
        <div className="flex items-center gap-3.5" aria-hidden="true">
          <span className="juma-dot juma-dot-1 h-3.5 w-3.5 rounded-full bg-[#004C26]" />
          <span className="juma-dot juma-dot-2 h-3.5 w-3.5 rounded-full bg-[#004C26]" />
          <span className="juma-dot juma-dot-3 h-3.5 w-3.5 rounded-full bg-[#004C26]" />
        </div>
      </div>
    </div>
  )
}
