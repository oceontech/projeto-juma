'use client'

/**
 * Transição suave de `background-color` de um elemento (a seção do catálogo, 5.5).
 *
 * Retorna um `ref` para o elemento-alvo e `shiftTo(color)` para animar a cor.
 * O scroll horizontal chama `shiftTo` a cada card; aqui só animamos a cor, sem
 * tocar layout. Em reduced-motion a cor troca instantânea.
 *
 * Referência: docs/05-design-direction/06-brief-construcao-home.md §3.4.
 */
import { useCallback, useRef } from 'react'

import { gsap } from './gsap'
import { DUR, EASE } from './motion'
import { useReducedMotion } from './useReducedMotion'

export function useColorShift<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()

  const shiftTo = useCallback(
    (color: string) => {
      const el = ref.current
      if (!el) return
      if (reduced) {
        el.style.backgroundColor = color
        return
      }
      gsap.to(el, { backgroundColor: color, duration: DUR.colorShift, ease: EASE.inOut, overwrite: 'auto' })
    },
    [reduced],
  )

  return { ref, shiftTo }
}
