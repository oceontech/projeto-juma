'use client'

import { useRef } from 'react'

import { gsap, ScrollTrigger, useGSAP } from '@/features/animation/gsap'
import { EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'

/**
 * Wrapper client que revela os blocos do footer ([data-footer-col] e
 * [data-footer-legal]) quando entram na viewport. O Footer em si continua
 * server component — só a animação vive aqui.
 */
export function FooterReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !ref.current) return
      const cols = gsap.utils.toArray<HTMLElement>('[data-footer-col]', ref.current)
      const legal = ref.current.querySelector<HTMLElement>('[data-footer-legal]')
      const targets = legal ? [...cols, legal] : cols
      if (!targets.length) return

      gsap.set(targets, { y: 28, opacity: 0 })
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 88%',
        once: true,
        onEnter: () =>
          gsap.to(targets, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: STAGGER.card,
            ease: EASE.reveal,
          }),
      })
    },
    { scope: ref, dependencies: [reduced] },
  )

  return <div ref={ref}>{children}</div>
}
