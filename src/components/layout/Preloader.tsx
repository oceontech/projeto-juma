'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from '@/features/animation/gsap'

export function Preloader() {
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])
  const [visible, setVisible] = useState(true)
  const [cycle, setCycle] = useState(0)
  const prevPathnameRef = useRef(pathname)
  const showingRef = useRef(true)

  // Traz o overlay de volta (mesmo já tendo sumido na carga inicial) — usado
  // tanto no clique de um link interno quanto na troca de pathname detectada
  // abaixo, para que a troca de página tenha a mesma abertura/fechamento do
  // carregamento inicial (experiência coerente entre as duas).
  const showOverlay = () => {
    if (showingRef.current) return
    showingRef.current = true
    setVisible(true)
    setCycle((c) => c + 1)
  }

  // Início da navegação: clique num link interno (mesma origem, sem
  // modificadores, sem target=_blank, sem download, sem âncora só de #hash).
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
      showOverlay()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Fim da navegação (fallback): o pathname mudou — cobre navegação que não
  // passa por um clique de link, como o seletor de idioma (router.replace).
  useEffect(() => {
    if (prevPathnameRef.current === pathname) return
    prevPathnameRef.current = pathname
    showOverlay()
  }, [pathname])

  // Roda a animação de entrada + agenda a dispensa — replicado a cada "cycle"
  // (carga inicial e cada troca de página subsequente).
  useEffect(() => {
    if (!visible) return

    const revealBody = () => {
      document.body.style.visibility = 'visible'
    }
    const finish = () => {
      showingRef.current = false
      setVisible(false)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealBody()
      if (document.readyState === 'complete') finish()
      else window.addEventListener('load', finish, { once: true })
      return () => window.removeEventListener('load', finish)
    }

    const dots = dotsRef.current.filter((d): d is SVGCircleElement => d !== null)

    const ctx = gsap.context(() => {
      gsap.set(dots, { y: 0, opacity: 0.3 })

      gsap.fromTo(
        dots,
        { y: 0, opacity: 0.3 },
        {
          y: -10,
          opacity: 1,
          duration: 0.45,
          ease: 'power2.out',
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.15 },
        },
      )
    })

    // Mostra o overlay somente após o GSAP ter registrado as animações:
    // o overlay tem visibility:visible, portanto fica por cima do body hidden.
    gsap.set(overlayRef.current, { opacity: 1 })

    const dismiss = () => {
      // Revela o conteúdo da página antes de o overlay sumir.
      revealBody()
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: finish,
      })
    }

    // Dispensa assim que as fontes carregarem (evita FOUC) — não espera o
    // evento 'load' da janela, que só dispara depois de TODO recurso da
    // página terminar (inclusive vídeos e imagens fora da viewport inicial),
    // o que prendia a página inteira invisível por vários segundos.
    let cancelled = false
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    const minShow = new Promise<void>((resolve) => setTimeout(resolve, 500))

    Promise.all([fontsReady, minShow]).then(() => {
      if (!cancelled) dismiss()
    })

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [cycle, visible])

  if (!visible) return null

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-9999 flex items-center justify-center bg-white"
      // visibility:visible sobrepõe o visibility:hidden do <body> (comportamento CSS padrão).
      // opacity:0 inicial evita flash antes do GSAP estar pronto.
      style={{ visibility: 'visible', opacity: 0 }}
    >
      <svg
        width="56"
        height="16"
        viewBox="0 0 56 16"
        style={{ overflow: 'visible' }}
        aria-hidden="true"
      >
        <circle ref={(el) => { dotsRef.current[0] = el }} cx="8"  cy="8" r="5" fill="#004C26" />
        <circle ref={(el) => { dotsRef.current[1] = el }} cx="28" cy="8" r="5" fill="#004C26" />
        <circle ref={(el) => { dotsRef.current[2] = el }} cx="48" cy="8" r="5" fill="#004C26" />
      </svg>
    </div>
  )
}
