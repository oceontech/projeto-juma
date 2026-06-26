'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/features/animation/gsap'

export function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<(SVGCircleElement | null)[]>([])
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Revela o body — chamado tanto no caminho normal quanto no reduced-motion.
    const revealBody = () => {
      document.body.style.visibility = 'visible'
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealBody()
      const hide = () => setHidden(true)
      if (document.readyState === 'complete') hide()
      else window.addEventListener('load', hide, { once: true })
      return
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
        onComplete: () => setHidden(true),
      })
    }

    let timer: ReturnType<typeof setTimeout>
    const handleLoad = () => { timer = setTimeout(dismiss, 300) }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad, { once: true })
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('load', handleLoad)
      ctx.revert()
    }
  }, [])

  if (hidden) return null

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
