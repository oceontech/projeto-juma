'use client'

/**
 * Reveal de texto por linha com máscara (cortina sobe), disparado por ScrollTrigger.
 *
 * Usa SplitText (lines + mask) para que cada linha entre de `yPercent: 110 → 0`
 * dentro de um `overflow-hidden`. Roda uma vez (`once`). Em reduced-motion o texto
 * já nasce no estado final, sem tween.
 *
 * Referência: docs/05-design-direction/06-brief-construcao-home.md §3.4.
 */
import { useRef, type ElementType, type ReactNode } from 'react'

import { gsap, SplitText, useGSAP } from './gsap'
import { DUR, EASE, STAGGER, TRIGGER_START } from './motion'
import { useReducedMotion } from './useReducedMotion'

type RevealTextProps = {
  as?: ElementType
  children: ReactNode
  className?: string
  /** Atraso (s) antes do reveal começar. */
  delay?: number
  /** Quebra por palavra em vez de por linha (títulos curtos com destaque). */
  splitBy?: 'lines' | 'words'
  /** Ponto de disparo do ScrollTrigger (default: 'top 80%'). */
  start?: string
}

export function RevealText({
  as: Tag = 'div',
  children,
  className = '',
  delay = 0,
  splitBy = 'lines',
  start = TRIGGER_START,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      const split = new SplitText(ref.current, {
        type: splitBy === 'words' ? 'words' : 'lines',
        // máscara: cada parte ganha um wrapper overflow-hidden
        mask: splitBy === 'words' ? 'words' : 'lines',
        linesClass: 'overflow-hidden',
      })

      const targets = splitBy === 'words' ? split.words : split.lines

      gsap.set(targets, { yPercent: 110 })
      gsap.to(targets, {
        yPercent: 0,
        duration: DUR.title,
        ease: EASE.reveal,
        delay,
        stagger: splitBy === 'words' ? STAGGER.word : STAGGER.line,
        scrollTrigger: { trigger: ref.current, start, once: true },
        onComplete: () => split.revert(),
      })

      return () => split.revert()
    },
    { dependencies: [reduced], scope: ref },
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
