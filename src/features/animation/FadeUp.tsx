'use client'

/**
 * Wrapper genérico de reveal: sobe e aparece (`y: 24, opacity: 0 → 0, 1`),
 * disparado por ScrollTrigger ao entrar no viewport. Anima só transform/opacity.
 * Em reduced-motion nasce no estado final.
 *
 * Referência: docs/05-design-direction/06-brief-construcao-home.md §3.4.
 */
import { useRef, type ElementType, type ReactNode } from 'react'

import { gsap, useGSAP } from './gsap'
import { DUR, EASE, FADE_Y, TRIGGER_START } from './motion'
import { useReducedMotion } from './useReducedMotion'

type FadeUpProps = {
  as?: ElementType
  children: ReactNode
  className?: string
  delay?: number
  /** Distância vertical inicial em px (default: 24). */
  y?: number
  start?: string
}

export function FadeUp({
  as: Tag = 'div',
  children,
  className = '',
  delay = 0,
  y = FADE_Y,
  start = TRIGGER_START,
}: FadeUpProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      gsap.set(ref.current, { y, opacity: 0 })
      gsap.to(ref.current, {
        y: 0,
        opacity: 1,
        duration: DUR.sub,
        ease: EASE.reveal,
        delay,
        scrollTrigger: { trigger: ref.current, start, once: true },
        clearProps: 'transform',
      })
    },
    { dependencies: [reduced], scope: ref },
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
