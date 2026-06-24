'use client'

/**
 * Anima os filhos diretos em sequência (stagger) ao entrar no viewport.
 * Cada filho sobe e aparece. Anima só transform/opacity; roda uma vez.
 * Em reduced-motion nasce tudo no estado final.
 *
 * Referência: docs/05-design-direction/06-brief-construcao-home.md §3.4.
 */
import { useRef, type ElementType, type ReactNode } from 'react'

import { gsap, useGSAP } from './gsap'
import { DUR, EASE, FADE_Y, STAGGER, TRIGGER_START } from './motion'
import { useReducedMotion } from './useReducedMotion'

type StaggerGroupProps = {
  as?: ElementType
  children: ReactNode
  className?: string
  /** Intervalo entre filhos em s (default: 0.08 = stagger de card). */
  stagger?: number
  delay?: number
  y?: number
  start?: string
}

export function StaggerGroup({
  as: Tag = 'div',
  children,
  className = '',
  stagger = STAGGER.card,
  delay = 0,
  y = FADE_Y,
  start = TRIGGER_START,
}: StaggerGroupProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (reduced || !el || el.children.length === 0) return

      const items = Array.from(el.children)
      gsap.set(items, { y, opacity: 0 })
      gsap.to(items, {
        y: 0,
        opacity: 1,
        duration: DUR.sub,
        ease: EASE.reveal,
        delay,
        stagger,
        scrollTrigger: { trigger: el, start, once: true },
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
